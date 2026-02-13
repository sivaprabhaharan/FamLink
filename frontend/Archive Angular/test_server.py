#!/usr/bin/env python3
"""
Test script to verify the FastAPI server is working and test user registration.
"""
import requests
import json

def test_server():
    """Test the FastAPI server endpoints."""
    base_url = "http://127.0.0.1:8000"
    
    print("Testing Famlink FastAPI Server...")
    print("=" * 50)
    
    # Test root endpoint
    try:
        print("1. Testing root endpoint...")
        response = requests.get(f"{base_url}/", timeout=5)
        if response.status_code == 200:
            print("✅ Root endpoint working")
            data = response.json()
            print(f"   Version: {data.get('version', 'Unknown')}")
            print(f"   Status: {data.get('status', 'Unknown')}")
        else:
            print(f"❌ Root endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Root endpoint error: {e}")
    
    # Test health endpoint
    try:
        print("\n2. Testing health endpoint...")
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health endpoint working")
            data = response.json()
            print(f"   Status: {data.get('status', 'Unknown')}")
            print(f"   Database: {data.get('database', 'Unknown')}")
        else:
            print(f"❌ Health endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health endpoint error: {e}")
    
    # Test user registration endpoint (this was failing before)
    try:
        print("\n3. Testing user registration endpoint...")
        registration_data = {
            "email": "test@example.com",
            "password": "TestPassword123!",
            "first_name": "Test",
            "last_name": "User",
            "phone_number": "+1234567890"
        }
        
        response = requests.post(
            f"{base_url}/api/v1/auth/register", 
            json=registration_data,
            timeout=10
        )
        
        print(f"   Response status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Registration endpoint working - relationship issue fixed!")
            data = response.json()
            print(f"   Message: {data.get('message', 'No message')}")
        elif response.status_code == 400:
            # This might be expected if user already exists
            data = response.json()
            print(f"⚠️  Registration response: {data.get('detail', 'Unknown error')}")
            if "already registered" in str(data.get('detail', '')).lower():
                print("   (This is expected if user already exists)")
        else:
            print(f"❌ Registration failed: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error: {error_data}")
            except:
                print(f"   Raw response: {response.text}")
                
    except Exception as e:
        print(f"❌ Registration endpoint error: {e}")
    
    print("\n" + "=" * 50)
    print("Server test completed!")

if __name__ == "__main__":
    test_server()