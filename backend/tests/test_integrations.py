"""
Test file for Purple Aster Studio integrations:
- Cloudinary file upload signature generation
- Razorpay payment integration
- Resend email (via project creation)
- Core API endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test user session token - will be set by fixture
TEST_SESSION_TOKEN = None


@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="module")
def test_user_data():
    """Create test user data in MongoDB and return session token"""
    import subprocess
    import time
    
    timestamp = int(time.time() * 1000)
    user_id = f"test-user-{timestamp}"
    session_token = f"test_session_{timestamp}"
    email = f"test.user.{timestamp}@example.com"
    
    # Create user and session in MongoDB
    mongo_command = f'''
    use('test_database');
    db.users.insertOne({{
      user_id: "{user_id}",
      email: "{email}",
      name: "Test User",
      role: "client",
      picture: "https://via.placeholder.com/150",
      created_at: new Date()
    }});
    db.user_sessions.insertOne({{
      user_id: "{user_id}",
      session_token: "{session_token}",
      expires_at: new Date(Date.now() + 7*24*60*60*1000),
      created_at: new Date()
    }});
    '''
    
    subprocess.run(["mongosh", "--eval", mongo_command], capture_output=True)
    
    yield {
        "user_id": user_id,
        "session_token": session_token,
        "email": email
    }
    
    # Cleanup test data
    cleanup_command = f'''
    use('test_database');
    db.users.deleteMany({{user_id: "{user_id}"}});
    db.user_sessions.deleteMany({{session_token: "{session_token}"}});
    db.projects.deleteMany({{client_id: "{user_id}"}});
    '''
    subprocess.run(["mongosh", "--eval", cleanup_command], capture_output=True)


class TestHealthEndpoint:
    """Health check endpoint tests"""
    
    def test_health_check(self, api_client):
        """Test /api/health endpoint returns healthy status"""
        response = api_client.get(f"{BASE_URL}/api/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "purple-aster-backend"
        print("✅ Health check passed")


class TestAuthEndpoints:
    """Authentication endpoint tests"""
    
    def test_auth_me_without_token(self, api_client):
        """Test /api/auth/me returns 401 without session"""
        response = api_client.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("✅ Auth protection works - returns 401 without token")
    
    def test_auth_me_with_valid_token(self, api_client, test_user_data):
        """Test /api/auth/me returns user data with valid session"""
        response = api_client.get(
            f"{BASE_URL}/api/auth/me",
            cookies={"session_token": test_user_data["session_token"]}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == test_user_data["user_id"]
        assert data["email"] == test_user_data["email"]
        assert "role" in data
        print(f"✅ Auth/me works - returned user: {data['email']}")


class TestCloudinaryIntegration:
    """Cloudinary file upload signature endpoint tests"""
    
    def test_cloudinary_signature_requires_auth(self, api_client):
        """Test /api/cloudinary/signature returns 401 without auth"""
        response = api_client.get(f"{BASE_URL}/api/cloudinary/signature")
        assert response.status_code == 401
        print("✅ Cloudinary signature endpoint requires authentication")
    
    def test_cloudinary_signature_image(self, api_client, test_user_data):
        """Test Cloudinary signature generation for images"""
        response = api_client.get(
            f"{BASE_URL}/api/cloudinary/signature",
            params={"resource_type": "image", "folder": "references"},
            cookies={"session_token": test_user_data["session_token"]}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Validate signature response structure
        assert "signature" in data
        assert "timestamp" in data
        assert "cloud_name" in data
        assert "api_key" in data
        assert "folder" in data
        assert "resource_type" in data
        
        # Validate expected values
        assert data["cloud_name"] == "dip0xwkms"
        assert data["api_key"] == "234544221796724"
        assert data["resource_type"] == "image"
        assert len(data["signature"]) == 40  # SHA-1 signature length
        assert isinstance(data["timestamp"], int)
        
        print(f"✅ Cloudinary image signature generated: {data['signature'][:20]}...")
    
    def test_cloudinary_signature_video(self, api_client, test_user_data):
        """Test Cloudinary signature generation for videos"""
        response = api_client.get(
            f"{BASE_URL}/api/cloudinary/signature",
            params={"resource_type": "video", "folder": "uploads"},
            cookies={"session_token": test_user_data["session_token"]}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["resource_type"] == "video"
        assert "signature" in data
        print(f"✅ Cloudinary video signature generated: {data['signature'][:20]}...")
    
    def test_cloudinary_signature_folder_prefix(self, api_client, test_user_data):
        """Test Cloudinary signature handles folder paths correctly"""
        # Test with invalid folder - should be prefixed with uploads/
        response = api_client.get(
            f"{BASE_URL}/api/cloudinary/signature",
            params={"resource_type": "image", "folder": "custom_folder"},
            cookies={"session_token": test_user_data["session_token"]}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Non-allowed prefix should get uploads/ prefix
        assert data["folder"].startswith("uploads/")
        print(f"✅ Cloudinary folder prefix handled: {data['folder']}")


class TestProjectCreation:
    """Project creation tests (triggers Resend email)"""
    
    def test_project_creation(self, api_client, test_user_data):
        """Test project creation endpoint"""
        project_data = {
            "services": ["Brand / Promo Video", "Social Media Content"],
            "goal": "Increase Brand Awareness",
            "platform": "YouTube",
            "timeline": "Standard (3-4 weeks)",
            "budget": "₹50,000 - ₹1,00,000",
            "details": "Test project for automated testing",
            "name": "Test User",
            "email": test_user_data["email"],
            "phone": "+91 98765 43210",
            "reference_files": []
        }
        
        response = api_client.post(
            f"{BASE_URL}/api/projects",
            json=project_data,
            cookies={"session_token": test_user_data["session_token"]}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] == True
        assert "project_id" in data
        assert data["project_id"].startswith("proj_")
        
        # Verify project data in response
        project = data.get("project")
        assert project["client_name"] == "Test User"
        assert project["services"] == ["Brand / Promo Video", "Social Media Content"]
        assert project["goal"] == "Increase Brand Awareness"
        
        print(f"✅ Project created: {data['project_id']}")
        print("   (Resend email notification triggered in background)")
        
        return data["project_id"]
    
    def test_get_projects(self, api_client, test_user_data):
        """Test getting projects for authenticated user"""
        response = api_client.get(
            f"{BASE_URL}/api/projects",
            cookies={"session_token": test_user_data["session_token"]}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] == True
        assert "projects" in data
        assert isinstance(data["projects"], list)
        print(f"✅ Retrieved {len(data['projects'])} project(s)")


class TestPaymentEndpoints:
    """Payment endpoints tests (Razorpay integration)"""
    
    def test_payment_create_order_requires_auth(self, api_client):
        """Test payment order creation requires authentication"""
        response = api_client.post(
            f"{BASE_URL}/api/payments/create-order",
            json={"project_id": "test", "amount": 50000}
        )
        assert response.status_code == 401
        print("✅ Payment endpoint requires authentication")
    
    def test_payment_create_order_with_auth(self, api_client, test_user_data):
        """Test Razorpay order creation"""
        # First create a project
        project_data = {
            "services": ["Commercial / Advertisement"],
            "goal": "Drive Sales & Conversions",
            "platform": "Instagram",
            "timeline": "Rush (1-2 weeks)",
            "budget": "Under ₹50,000",
            "details": "Payment test project",
            "name": "Test User",
            "email": test_user_data["email"],
            "phone": "+91 12345 67890",
            "reference_files": []
        }
        
        project_response = api_client.post(
            f"{BASE_URL}/api/projects",
            json=project_data,
            cookies={"session_token": test_user_data["session_token"]}
        )
        
        assert project_response.status_code == 200
        project_id = project_response.json()["project_id"]
        
        # Create payment order
        payment_response = api_client.post(
            f"{BASE_URL}/api/payments/create-order",
            json={"project_id": project_id, "amount": 25000},
            cookies={"session_token": test_user_data["session_token"]}
        )
        
        assert payment_response.status_code == 200
        payment_data = payment_response.json()
        
        assert payment_data["success"] == True
        assert "payment_id" in payment_data
        
        # Check if Razorpay order was created (real integration)
        if "razorpay_order_id" in payment_data:
            assert payment_data["razorpay_order_id"].startswith("order_")
            assert "razorpay_key_id" in payment_data
            assert payment_data["razorpay_key_id"] == "rzp_test_SIBZYeCyxSbvVC"
            assert payment_data["currency"] == "INR"
            print(f"✅ Razorpay order created: {payment_data['razorpay_order_id']}")
        else:
            # Mock payment
            assert payment_data.get("status") == "completed"
            print(f"✅ Mock payment created: {payment_data['payment_id']}")


class TestAdminEndpoints:
    """Admin endpoints tests"""
    
    def test_admin_stats_requires_admin_role(self, api_client, test_user_data):
        """Test admin stats requires admin role"""
        response = api_client.get(
            f"{BASE_URL}/api/admin/stats",
            cookies={"session_token": test_user_data["session_token"]}
        )
        # Client role should be forbidden
        assert response.status_code == 403
        print("✅ Admin stats endpoint properly restricted")
    
    def test_admin_users_requires_admin_role(self, api_client, test_user_data):
        """Test admin users requires admin role"""
        response = api_client.get(
            f"{BASE_URL}/api/admin/users",
            cookies={"session_token": test_user_data["session_token"]}
        )
        assert response.status_code == 403
        print("✅ Admin users endpoint properly restricted")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
