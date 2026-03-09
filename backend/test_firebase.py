import os
import sys

# Test Firebase connection
print("Testing Firebase connection...")

try:
    from app.services.firebase_db import firebase_db
    
    if firebase_db.is_available():
        print("✅ Firebase is connected successfully!")
        print(f"   Database client: {type(firebase_db._db)}")
        
        # Try to create a test document
        test_data = {
            "test": "Hello from Resume to Portfolio",
            "timestamp": "2024-12-28"
        }
        
        print("\nTesting write operation...")
        firebase_db.portfolios.document("test_doc").set(test_data)
        print("✅ Write successful!")
        
        print("\nTesting read operation...")
        doc = firebase_db.portfolios.document("test_doc").get()
        if doc.exists:
            print("✅ Read successful!")
            print(f"   Data: {doc.to_dict()}")
        
        # Clean up test document
        firebase_db.portfolios.document("test_doc").delete()
        print("\n✅ Test document cleaned up")
        
        print("\n🎉 Firebase is working perfectly!")
        
    else:
        print("❌ Firebase is not available")
        print("   Using in-memory fallback storage")
        print("\nPlease check:")
        print("1. Firebase credentials file exists: ./firebase-credentials.json")
        print("2. FIREBASE_CREDENTIALS_PATH is set in .env")
        print("3. Firebase Admin SDK is installed: pip install firebase-admin")
        
except Exception as e:
    print(f"❌ Error: {str(e)}")
    print("\nTroubleshooting:")
    print("1. Make sure firebase-credentials.json is in the backend folder")
    print("2. Check if the file path in .env is correct")
    print("3. Verify your Firebase project is set up correctly")

input("\nPress Enter to exit...")
