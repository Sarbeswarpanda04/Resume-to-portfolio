"""
Migration script to sync Firebase Authentication users to Firestore users collection
"""
import firebase_admin
from firebase_admin import auth, firestore
from datetime import datetime
from app.services.firebase_db import firebase_db

def sync_auth_users_to_firestore():
    """Sync all Firebase Auth users to Firestore users collection"""
    if not firebase_db.is_available():
        print("❌ Firebase is not available")
        return
    
    print("🔄 Starting user sync...")
    
    # Get all Firebase Auth users
    page = auth.list_users()
    auth_users = list(page.users)
    
    # Continue to next page if there are more users
    while page.next_page_token:
        page = auth.list_users(page_token=page.next_page_token)
        auth_users.extend(page.users)
    
    print(f"📊 Found {len(auth_users)} users in Firebase Authentication")
    
    synced_count = 0
    skipped_count = 0
    
    for user in auth_users:
        # Check if user already exists in Firestore
        user_ref = firebase_db.users.document(user.uid)
        doc = user_ref.get()
        
        if doc.exists:
            print(f"⏭️  Skipping {user.email} - already exists in Firestore")
            skipped_count += 1
            continue
        
        # Create user profile in Firestore
        user_data = {
            "id": user.uid,
            "email": user.email,
            "displayName": user.display_name or user.email.split('@')[0],
            "createdAt": user.user_metadata.creation_timestamp / 1000,  # Convert to seconds
            "updatedAt": datetime.utcnow(),
            "portfolioCount": 0,
            "resumeCount": 0,
        }
        
        user_ref.set(user_data)
        print(f"✅ Synced {user.email} to Firestore")
        synced_count += 1
    
    print(f"\n🎉 Sync complete!")
    print(f"   ✅ Synced: {synced_count} users")
    print(f"   ⏭️  Skipped: {skipped_count} users (already existed)")
    print(f"   📊 Total: {len(auth_users)} users in Firebase Auth")

if __name__ == "__main__":
    sync_auth_users_to_firestore()
