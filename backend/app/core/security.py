from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from fastapi.security.http import HTTPAuthorizationCredentials
from app.core.config import settings
from app.core.config import BACKEND_BASE_DIR
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from pathlib import Path

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# Allow missing auth header so we can support DEV_AUTH_BYPASS without forcing a token.
security = HTTPBearer(auto_error=False)

_firebase_auth_ready = False

# Initialize Firebase Admin SDK (optional)
if settings.DEV_AUTH_BYPASS:
    # Dev mode: don't require Firebase Admin credentials.
    _firebase_auth_ready = False
else:
    try:
        if settings.FIREBASE_CREDENTIALS_PATH:
            # If another module already initialized Firebase, reuse it.
            try:
                firebase_admin.get_app()
                _firebase_auth_ready = True
            except ValueError:
                cred_path = Path(settings.FIREBASE_CREDENTIALS_PATH)
                if not cred_path.is_absolute():
                    cred_path = (BACKEND_BASE_DIR / cred_path).resolve()
                cred = credentials.Certificate(str(cred_path))
                firebase_admin.initialize_app(cred)
                _firebase_auth_ready = True
        else:
            # No credentials configured; JWT-only mode.
            _firebase_auth_ready = False
    except Exception as e:
        # Only warn when the user explicitly configured a credentials path.
        if settings.FIREBASE_CREDENTIALS_PATH:
            print(f"Warning: Firebase Admin SDK initialization failed: {e}")
            print("Firebase token verification will not work. Falling back to JWT auth.")
        _firebase_auth_ready = False


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )


async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> dict:
    # Dev-only bypass for local demos.
    if settings.DEV_AUTH_BYPASS:
        if not credentials or not credentials.credentials:
            return {"user_id": settings.DEV_AUTH_USER_ID}

        # If a token is present, try to validate it, but don't block the request
        # if validation fails (still dev mode).
        token = credentials.credentials
        try:
            if _firebase_auth_ready:
                decoded_token = firebase_auth.verify_id_token(token)
                return {"user_id": decoded_token.get('uid') or settings.DEV_AUTH_USER_ID, "email": decoded_token.get('email')}
            payload = decode_token(token)
            return {"user_id": payload.get("sub") or settings.DEV_AUTH_USER_ID}
        except Exception:
            return {"user_id": settings.DEV_AUTH_USER_ID}

    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    token = credentials.credentials
    try:
        # Prefer verifying Firebase ID tokens when Firebase Admin is configured.
        if _firebase_auth_ready:
            decoded_token = firebase_auth.verify_id_token(token)
            user_id = decoded_token['uid']
            return {"user_id": user_id, "email": decoded_token.get('email')}

        # Otherwise accept the backend-issued JWT (created by create_access_token).
        payload = decode_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )
        return {"user_id": user_id}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
        )
