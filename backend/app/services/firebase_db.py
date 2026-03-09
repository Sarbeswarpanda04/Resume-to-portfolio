import firebase_admin
from firebase_admin import credentials, firestore
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.core.config import settings
import os
from pathlib import Path
from app.core.config import BACKEND_BASE_DIR

class FirebaseDB:
    _instance = None
    _db = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(FirebaseDB, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        """Initialize Firebase Admin SDK"""
        # If no credentials are configured, skip Firebase entirely.
        if not settings.FIREBASE_CREDENTIALS_PATH:
            self._db = None
            return

        cred_path = Path(settings.FIREBASE_CREDENTIALS_PATH)
        if not cred_path.is_absolute():
            cred_path = (BACKEND_BASE_DIR / cred_path).resolve()

        try:
            # Check if already initialized
            firebase_admin.get_app()
        except ValueError:
            # Not initialized, so initialize it
            if cred_path.exists():
                # Use credentials file
                cred = credentials.Certificate(str(cred_path))
                firebase_admin.initialize_app(cred)
            else:
                # Credentials path was set but file does not exist.
                self._db = None
                return

        # Creating the Firestore client can fail if credentials are invalid.
        try:
            self._db = firestore.client()
        except Exception as e:
            self._db = None
            return
    
    @property
    def portfolios(self):
        """Get portfolios collection reference"""
        if self._db:
            return self._db.collection('portfolios')
        return None
    
    @property
    def users(self):
        """Get users collection reference"""
        if self._db:
            return self._db.collection('users')
        return None
    
    @property
    def resumes(self):
        """Get resumes collection reference"""
        if self._db:
            return self._db.collection('resumes')
        return None

    @property
    def ratings(self):
        """Get ratings collection reference"""
        if self._db:
            return self._db.collection('ratings')
        return None

    @property
    def coupons(self):
        """Get coupons collection reference"""
        if self._db:
            return self._db.collection('coupons')
        return None
    
    def is_available(self) -> bool:
        """Check if Firebase is available"""
        return self._db is not None

# Singleton instance
firebase_db = FirebaseDB()

# Fallback in-memory storage when Firebase is not available
_memory_storage: Dict[str, Any] = {}
_coupon_storage: Dict[str, Any] = {}

def get_portfolio(portfolio_id: str) -> Optional[Dict]:
    """Get a portfolio by ID"""
    if firebase_db.is_available():
        doc = firebase_db.portfolios.document(portfolio_id).get()
        if doc.exists:
            data = doc.to_dict()
            data['id'] = doc.id
            return data
        return None
    else:
        return _memory_storage.get(portfolio_id)

def get_all_portfolios() -> List[Dict]:
    """Get all portfolios"""
    if firebase_db.is_available():
        docs = firebase_db.portfolios.stream()
        portfolios = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            portfolios.append(data)
        return portfolios
    else:
        return list(_memory_storage.values())

def get_portfolios_by_user(user_id: str) -> List[Dict]:
    """Get all portfolios for a user from their subcollection"""
    if firebase_db.is_available():
        docs = firebase_db.users.document(user_id).collection('portfolios').stream()
        portfolios = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            portfolios.append(data)
        return portfolios
    else:
        return [p for p in _memory_storage.values() if p.get('userId') == user_id]

def get_portfolio_by_published_url(url_slug: str) -> Optional[Dict]:
    """Get a portfolio by published URL slug"""
    if firebase_db.is_available():
        docs = firebase_db.portfolios.where('published', '==', True).stream()
        for doc in docs:
            data = doc.to_dict()
            if data.get('publishedUrl'):
                slug = data['publishedUrl'].split('/')[-1]
                if slug == url_slug:
                    data['id'] = doc.id
                    return data
        return None
    else:
        for portfolio in _memory_storage.values():
            if portfolio.get('published') and portfolio.get('publishedUrl'):
                slug = portfolio['publishedUrl'].split('/')[-1]
                if slug == url_slug:
                    return portfolio
        return None

def create_portfolio(portfolio_id: str, data: Dict) -> Dict:
    """Create a new portfolio under user's subcollection"""
    user_id = data.get('userId')
    if firebase_db.is_available() and user_id:
        # Store in both places for efficient querying:
        # 1. Under user: users/{userId}/portfolios/{portfolioId}
        firebase_db.users.document(user_id).collection('portfolios').document(portfolio_id).set(data)
        # 2. In global collection with userId index for public access
        firebase_db.portfolios.document(portfolio_id).set(data)
        data['id'] = portfolio_id
        return data
    else:
        data['id'] = portfolio_id
        _memory_storage[portfolio_id] = data
        return data

def update_portfolio(portfolio_id: str, updates: Dict) -> Optional[Dict]:
    """Update a portfolio in both user subcollection and global collection"""
    if firebase_db.is_available():
        # Update in global collection
        doc_ref = firebase_db.portfolios.document(portfolio_id)
        doc = doc_ref.get()
        if doc.exists:
            portfolio_data = doc.to_dict()
            user_id = portfolio_data.get('userId')
            
            doc_ref.update(updates)
            
            # Also update in user's subcollection
            if user_id:
                firebase_db.users.document(user_id).collection('portfolios').document(portfolio_id).update(updates)
            
            # Get updated data
            doc = doc_ref.get()
            data = doc.to_dict()
            data['id'] = doc.id
            return data
        return None
    else:
        if portfolio_id in _memory_storage:
            _memory_storage[portfolio_id].update(updates)
            return _memory_storage[portfolio_id]
        return None

def delete_portfolio(portfolio_id: str) -> bool:
    """Delete a portfolio from both user subcollection and global collection"""
    if firebase_db.is_available():
        # Get portfolio to find user_id
        doc = firebase_db.portfolios.document(portfolio_id).get()
        if doc.exists:
            portfolio_data = doc.to_dict()
            user_id = portfolio_data.get('userId')
            
            # Delete from global collection
            firebase_db.portfolios.document(portfolio_id).delete()
            
            # Delete from user's subcollection
            if user_id:
                firebase_db.users.document(user_id).collection('portfolios').document(portfolio_id).delete()
        return True
    else:
        if portfolio_id in _memory_storage:
            del _memory_storage[portfolio_id]
            return True
        return False


# Resume storage functions
_resume_storage: Dict[str, Any] = {}

def create_user_if_not_exists(user_id: str, user_data: Dict) -> Dict:
    """Create or update user profile"""
    if firebase_db.is_available():
        user_ref = firebase_db.users.document(user_id)
        doc = user_ref.get()
        if not doc.exists:
            # Defaults for new users
            user_data.setdefault('plan', 'free')
            user_data.setdefault('isPremium', False)
            user_data.setdefault('premiumSince', None)
            user_data['createdAt'] = datetime.utcnow()
            user_ref.set(user_data)
        else:
            user_data['updatedAt'] = datetime.utcnow()
            user_ref.update(user_data)
        return user_data
    return user_data

def get_user(user_id: str) -> Optional[Dict]:
    """Get user profile"""
    if firebase_db.is_available():
        doc = firebase_db.users.document(user_id).get()
        if doc.exists:
            return doc.to_dict()
    return None


def set_user_plan(user_id: str, plan: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Update a user's plan fields"""
    metadata = metadata or {}
    updates: Dict[str, Any] = {
        'plan': plan,
        'isPremium': plan == 'premium',
        'planUpdatedAt': datetime.utcnow(),
    }
    if plan == 'premium' and 'premiumSince' not in metadata:
        updates['premiumSince'] = datetime.utcnow()
    updates.update(metadata)

    if firebase_db.is_available():
        firebase_db.users.document(user_id).update(updates)
        return updates
    else:
        # In-memory fallback (best-effort)
        return updates


def create_purchase(user_id: str, purchase_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a purchase record under users/{userId}/purchases/{purchaseId}"""
    if firebase_db.is_available():
        firebase_db.users.document(user_id).collection('purchases').document(purchase_id).set(data)
        return data
    else:
        _coupon_storage[f"purchase:{user_id}:{purchase_id}"] = data
        return data


def get_coupon(code: str) -> Optional[Dict[str, Any]]:
    """Get coupon by code from coupons/{CODE}"""
    raw = (code or '').strip()
    normalized = raw.upper()
    if not normalized:
        return None

    if firebase_db.is_available():
        # Preferred: document id is the normalized uppercase code.
        doc = firebase_db.coupons.document(normalized).get()
        if doc.exists:
            data = doc.to_dict() or {}
            data['code'] = normalized
            return data

        # Compatibility: allow coupons created manually in Firestore with a non-uppercased doc id.
        candidate_ids = []
        if raw and raw != normalized:
            candidate_ids.append(raw)
        lower = raw.lower() if raw else ""
        if lower and lower not in candidate_ids and lower != normalized:
            candidate_ids.append(lower)

        for doc_id in candidate_ids:
            try:
                alt = firebase_db.coupons.document(doc_id).get()
                if alt.exists:
                    data = alt.to_dict() or {}
                    data['code'] = normalized
                    return data
            except Exception:
                pass

        # Last resort: query by stored field (if present).
        try:
            matches = list(firebase_db.coupons.where('code', '==', normalized).limit(1).stream())
            if matches:
                data = matches[0].to_dict() or {}
                data['code'] = normalized
                return data
        except Exception:
            pass

        return None
    else:
        data = _coupon_storage.get(normalized)
        if data:
            return {**data, 'code': normalized}
        return None

def create_resume(resume_id: str, data: Dict) -> Dict:
    """Create a new resume record under user's subcollection"""
    user_id = data.get('userId')
    if firebase_db.is_available() and user_id:
        # Store resume in user's subcollection: users/{userId}/resumes/{resumeId}
        firebase_db.users.document(user_id).collection('resumes').document(resume_id).set(data)
        data['id'] = resume_id
        return data
    else:
        data['id'] = resume_id
        _resume_storage[resume_id] = data
        return data

def get_resume(resume_id: str) -> Optional[Dict]:
    """Get a resume by ID"""
    if firebase_db.is_available():
        # Search across all users' resume subcollections
        for user_doc in firebase_db.users.stream():
            resume_ref = user_doc.reference.collection('resumes').document(resume_id)
            doc = resume_ref.get()
            if doc.exists:
                data = doc.to_dict()
                data['id'] = doc.id
                return data
        return None
    else:
        return _resume_storage.get(resume_id)

def get_resumes_by_user(user_id: str) -> List[Dict]:
    """Get all resumes for a user"""
    if firebase_db.is_available():
        docs = firebase_db.users.document(user_id).collection('resumes').stream()
        resumes = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            resumes.append(data)
        return resumes
    else:
        return [r for r in _resume_storage.values() if r.get('userId') == user_id]

def update_resume(resume_id: str, updates: Dict) -> Optional[Dict]:
    """Update a resume"""
    user_id = updates.get('userId')
    if firebase_db.is_available() and user_id:
        doc_ref = firebase_db.users.document(user_id).collection('resumes').document(resume_id)
        if doc_ref.get().exists:
            doc_ref.update(updates)
            doc = doc_ref.get()
            data = doc.to_dict()
            data['id'] = doc.id
            return data
        return None
    else:
        if resume_id in _resume_storage:
            _resume_storage[resume_id].update(updates)
            return _resume_storage[resume_id]
        return None

def delete_resume(resume_id: str, user_id: str) -> bool:
    """Delete a resume"""
    if firebase_db.is_available() and user_id:
        firebase_db.users.document(user_id).collection('resumes').document(resume_id).delete()
        return True
    else:
        if resume_id in _resume_storage:
            del _resume_storage[resume_id]
            return True
        return False
