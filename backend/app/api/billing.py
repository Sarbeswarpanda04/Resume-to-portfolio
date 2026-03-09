from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Literal, Dict, Any
from datetime import datetime
import uuid
import hmac
import hashlib

from app.core.security import get_current_user
from app.core.config import settings
from app.services import firebase_db


router = APIRouter()


PREMIUM_PRICE_RUPEES = 19
FREE_PORTFOLIO_LIMIT = 2


def _require_admin_secret(admin_secret: Optional[str]) -> None:
    expected = getattr(settings, 'BILLING_ADMIN_SECRET', None)
    if not expected:
        raise HTTPException(status_code=501, detail='Admin secret not configured (set BILLING_ADMIN_SECRET)')
    if not admin_secret or admin_secret != expected:
        raise HTTPException(status_code=403, detail='Forbidden')


def _is_premium(user_profile: Optional[Dict[str, Any]]) -> bool:
    if not user_profile:
        return False
    if user_profile.get('plan') == 'premium':
        return True
    return bool(user_profile.get('isPremium'))


def _compute_discount_rupees(base_rupees: int, coupon: Optional[Dict[str, Any]]) -> int:
    if not coupon:
        return 0

    if not coupon.get('active', True):
        return 0

    # Optional expiry support
    expires_at = coupon.get('expiresAt')
    try:
        if expires_at and hasattr(expires_at, 'timestamp'):
            if expires_at.timestamp() < datetime.utcnow().timestamp():
                return 0
    except Exception:
        pass

    discount_type = (coupon.get('discountType') or coupon.get('type') or '').lower()
    value = coupon.get('discountValue', coupon.get('value', 0))
    try:
        value = float(value)
    except Exception:
        value = 0

    if discount_type in ('percent', 'percentage'):
        discount = int(round(base_rupees * (value / 100.0)))
    else:
        # default: fixed rupee amount
        discount = int(round(value))

    return max(0, min(base_rupees, discount))


class ValidateCouponRequest(BaseModel):
    code: str
    planId: Literal['premium']


class CheckoutRequest(BaseModel):
    planId: Literal['premium']
    couponCode: Optional[str] = None


class VerifyPaymentRequest(BaseModel):
    planId: Literal['premium']
    couponCode: Optional[str] = None
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class AdminUpsertCouponRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra='ignore')

    code: str
    active: bool = True
    discountType: Literal['fixed', 'percent'] = Field('fixed', alias='kind')
    discountValue: float = Field(0, alias='value')
    # optional ISO-like datetime string (stored as Firestore timestamp is best, but keep simple here)
    expiresAt: Optional[str] = None


@router.get('/status')
async def billing_status(current_user: dict = Depends(get_current_user)):
    user_id = current_user['user_id']
    profile = firebase_db.get_user(user_id) or {}
    premium = _is_premium(profile)
    portfolios = firebase_db.get_portfolios_by_user(user_id)
    count = len(portfolios)
    limit = None if premium else FREE_PORTFOLIO_LIMIT
    return {
        'plan': 'premium' if premium else 'free',
        'isPremium': premium,
        'premiumPrice': PREMIUM_PRICE_RUPEES,
        'currency': 'INR',
        'portfolioCount': count,
        'portfolioLimit': limit,
        'canCreatePortfolio': True if premium else count < FREE_PORTFOLIO_LIMIT,
    }


@router.post('/validate-coupon')
async def validate_coupon(req: ValidateCouponRequest, current_user: dict = Depends(get_current_user)):
    coupon = firebase_db.get_coupon(req.code)
    if not coupon or not coupon.get('active', True):
        return {
            'valid': False,
            'code': (req.code or '').strip().upper(),
            'discount': 0,
            'finalAmount': PREMIUM_PRICE_RUPEES,
            'currency': 'INR',
        }

    discount = _compute_discount_rupees(PREMIUM_PRICE_RUPEES, coupon)
    return {
        'valid': True,
        'code': (req.code or '').strip().upper(),
        'discount': discount,
        'finalAmount': max(0, PREMIUM_PRICE_RUPEES - discount),
        'currency': 'INR',
        'discountType': coupon.get('discountType', coupon.get('type')),
        'discountValue': coupon.get('discountValue', coupon.get('value')),
    }


@router.post('/checkout')
async def checkout(req: CheckoutRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user['user_id']

    profile = firebase_db.get_user(user_id) or {}
    if _is_premium(profile):
        return {'status': 'already_premium'}

    coupon = firebase_db.get_coupon(req.couponCode) if req.couponCode else None
    discount = _compute_discount_rupees(PREMIUM_PRICE_RUPEES, coupon)
    final_amount = max(0, PREMIUM_PRICE_RUPEES - discount)

    purchase_id = f"purchase_{uuid.uuid4().hex[:12]}"
    purchase_record = {
        'id': purchase_id,
        'userId': user_id,
        'planId': req.planId,
        'currency': 'INR',
        'baseAmount': PREMIUM_PRICE_RUPEES,
        'discount': discount,
        'finalAmount': final_amount,
        'couponCode': (req.couponCode or '').strip().upper() if req.couponCode else None,
        'status': 'initiated',
        'createdAt': datetime.utcnow(),
    }
    firebase_db.create_purchase(user_id, purchase_id, purchase_record)

    if final_amount == 0:
        firebase_db.set_user_plan(user_id, 'premium', {
            'premiumSince': datetime.utcnow(),
        })
        firebase_db.create_purchase(user_id, purchase_id, {
            **purchase_record,
            'status': 'success',
            'paidAmount': 0,
            'completedAt': datetime.utcnow(),
            'paymentProvider': 'coupon',
        })
        return {'status': 'success', 'plan': 'premium', 'finalAmount': 0, 'currency': 'INR'}

    # Payment required
    razorpay_key_id = getattr(settings, 'RAZORPAY_KEY_ID', None)
    razorpay_key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', None)

    if not razorpay_key_id or not razorpay_key_secret:
        raise HTTPException(
            status_code=501,
            detail='Payment gateway not configured (set RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET)'
        )

    try:
        import razorpay  # type: ignore
    except Exception:
        raise HTTPException(status_code=500, detail='Razorpay SDK not installed on backend')

    client = razorpay.Client(auth=(razorpay_key_id, razorpay_key_secret))
    order = client.order.create({
        'amount': int(final_amount * 100),
        'currency': 'INR',
        'payment_capture': 1,
        'notes': {
            'userId': user_id,
            'purchaseId': purchase_id,
            'planId': req.planId,
        },
    })

    firebase_db.create_purchase(user_id, purchase_id, {
        **purchase_record,
        'status': 'payment_required',
        'paymentProvider': 'razorpay',
        'razorpayOrderId': order.get('id'),
        'updatedAt': datetime.utcnow(),
    })

    return {
        'status': 'payment_required',
        'provider': 'razorpay',
        'keyId': razorpay_key_id,
        'orderId': order.get('id'),
        'amount': final_amount,
        'currency': 'INR',
        'purchaseId': purchase_id,
    }


@router.post('/verify-payment')
async def verify_payment(req: VerifyPaymentRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user['user_id']

    razorpay_key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', None)
    if not razorpay_key_secret:
        raise HTTPException(status_code=501, detail='Payment gateway not configured')

    message = f"{req.razorpay_order_id}|{req.razorpay_payment_id}".encode('utf-8')
    expected = hmac.new(
        razorpay_key_secret.encode('utf-8'),
        message,
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected, req.razorpay_signature):
        raise HTTPException(status_code=400, detail='Invalid payment signature')

    # Mark premium
    firebase_db.set_user_plan(user_id, 'premium', {
        'premiumSince': datetime.utcnow(),
    })

    # Store a simple purchase record (id derived from order)
    purchase_id = f"razorpay_{req.razorpay_order_id}"[-40:]
    firebase_db.create_purchase(user_id, purchase_id, {
        'id': purchase_id,
        'userId': user_id,
        'planId': req.planId,
        'status': 'success',
        'paymentProvider': 'razorpay',
        'razorpayOrderId': req.razorpay_order_id,
        'razorpayPaymentId': req.razorpay_payment_id,
        'couponCode': (req.couponCode or '').strip().upper() if req.couponCode else None,
        'completedAt': datetime.utcnow(),
    })

    return {'status': 'success', 'plan': 'premium'}


@router.post('/admin/coupons')
async def admin_upsert_coupon(
    req: AdminUpsertCouponRequest,
    admin_secret: Optional[str] = None,
):
    """Admin: Create/update a coupon in Firestore.

    Pass the secret as query param: ?admin_secret=... (simple for local dev)
    """
    _require_admin_secret(admin_secret)

    code = (req.code or '').strip().upper()
    if not code:
        raise HTTPException(status_code=400, detail='Coupon code is required')

    coupon_doc: Dict[str, Any] = {
        'code': code,
        'active': bool(req.active),
        'discountType': req.discountType,
        'discountValue': float(req.discountValue),
        'updatedAt': datetime.utcnow(),
    }
    if req.expiresAt:
        coupon_doc['expiresAt'] = req.expiresAt

    # Store into Firestore directly
    if firebase_db.firebase_db.is_available():
        firebase_db.firebase_db.coupons.document(code).set(coupon_doc, merge=True)
    else:
        # in-memory fallback
        firebase_db._coupon_storage[code] = coupon_doc

    return {'ok': True, 'code': code, **coupon_doc}
