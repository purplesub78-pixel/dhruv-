"""
Test file for Purple Aster Studio Admin Dashboard & Talent Assignment:
- Admin dashboard stats
- Admin dashboard users list
- Admin dashboard talents list
- Talent assignment to projects
- Project listing with expanded details
"""
import pytest
import requests
import os
import subprocess
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestData:
    """Shared test data across test classes"""
    admin_user_id = None
    admin_session = None
    talent_user_id = None
    talent_session = None
    client_user_id = None
    client_session = None
    project_id = None


@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="module", autouse=True)
def setup_test_data():
    """Create test users with admin, talent, and client roles"""
    timestamp = int(time.time() * 1000)
    
    TestData.admin_user_id = f"test-admin-{timestamp}"
    TestData.admin_session = f"admin_session_{timestamp}"
    TestData.talent_user_id = f"test-talent-{timestamp}"
    TestData.talent_session = f"talent_session_{timestamp}"
    TestData.client_user_id = f"test-client-{timestamp}"
    TestData.client_session = f"client_session_{timestamp}"
    
    # Create all test users and sessions in MongoDB
    mongo_command = f'''
    use('test_database');
    
    // Create admin user
    db.users.insertOne({{
        user_id: "{TestData.admin_user_id}",
        email: "admin.{timestamp}@example.com",
        name: "Test Admin",
        role: "admin",
        picture: "https://via.placeholder.com/150",
        created_at: new Date()
    }});
    
    // Create talent user
    db.users.insertOne({{
        user_id: "{TestData.talent_user_id}",
        email: "talent.{timestamp}@example.com",
        name: "Test Talent",
        role: "talent",
        picture: "https://via.placeholder.com/150",
        created_at: new Date()
    }});
    
    // Create client user
    db.users.insertOne({{
        user_id: "{TestData.client_user_id}",
        email: "client.{timestamp}@example.com",
        name: "Test Client",
        role: "client",
        picture: "https://via.placeholder.com/150",
        created_at: new Date()
    }});
    
    // Create sessions
    db.user_sessions.insertMany([
        {{
            user_id: "{TestData.admin_user_id}",
            session_token: "{TestData.admin_session}",
            expires_at: new Date(Date.now() + 7*24*60*60*1000),
            created_at: new Date()
        }},
        {{
            user_id: "{TestData.talent_user_id}",
            session_token: "{TestData.talent_session}",
            expires_at: new Date(Date.now() + 7*24*60*60*1000),
            created_at: new Date()
        }},
        {{
            user_id: "{TestData.client_user_id}",
            session_token: "{TestData.client_session}",
            expires_at: new Date(Date.now() + 7*24*60*60*1000),
            created_at: new Date()
        }}
    ]);
    '''
    
    subprocess.run(["mongosh", "--eval", mongo_command], capture_output=True)
    
    yield
    
    # Cleanup test data
    cleanup_command = f'''
    use('test_database');
    db.users.deleteMany({{user_id: {{$in: ["{TestData.admin_user_id}", "{TestData.talent_user_id}", "{TestData.client_user_id}"]}} }});
    db.user_sessions.deleteMany({{session_token: {{$in: ["{TestData.admin_session}", "{TestData.talent_session}", "{TestData.client_session}"]}} }});
    db.projects.deleteMany({{client_id: "{TestData.client_user_id}"}});
    '''
    subprocess.run(["mongosh", "--eval", cleanup_command], capture_output=True)


class TestAdminStats:
    """Test admin dashboard stats endpoint"""
    
    def test_admin_stats_requires_admin_role(self, api_client):
        """Test /api/admin/stats returns 403 for non-admin"""
        response = api_client.get(
            f"{BASE_URL}/api/admin/stats",
            cookies={"session_token": TestData.client_session}
        )
        assert response.status_code == 403
        print("✅ Admin stats endpoint restricted to admin role")
    
    def test_admin_stats_works_for_admin(self, api_client):
        """Test /api/admin/stats returns stats for admin"""
        response = api_client.get(
            f"{BASE_URL}/api/admin/stats",
            cookies={"session_token": TestData.admin_session}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] == True
        assert "stats" in data
        stats = data["stats"]
        
        # Verify stats structure
        assert "total_projects" in stats
        assert "active_projects" in stats
        assert "total_clients" in stats
        assert "total_revenue" in stats
        
        # Values should be integers/floats
        assert isinstance(stats["total_projects"], int)
        assert isinstance(stats["active_projects"], int)
        assert isinstance(stats["total_clients"], int)
        assert isinstance(stats["total_revenue"], (int, float))
        
        print(f"✅ Admin stats returned: {stats}")


class TestAdminUsers:
    """Test admin users list endpoint"""
    
    def test_admin_users_requires_admin_role(self, api_client):
        """Test /api/admin/users returns 403 for non-admin"""
        response = api_client.get(
            f"{BASE_URL}/api/admin/users",
            cookies={"session_token": TestData.talent_session}
        )
        assert response.status_code == 403
        print("✅ Admin users endpoint restricted to admin role")
    
    def test_admin_users_works_for_admin(self, api_client):
        """Test /api/admin/users returns users list for admin"""
        response = api_client.get(
            f"{BASE_URL}/api/admin/users",
            cookies={"session_token": TestData.admin_session}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] == True
        assert "users" in data
        assert isinstance(data["users"], list)
        
        # Should find at least our test users
        users = data["users"]
        assert len(users) >= 3
        
        # Verify user data structure
        for user in users:
            assert "user_id" in user
            assert "email" in user
            assert "role" in user
            # Should not contain MongoDB _id
            assert "_id" not in user
        
        print(f"✅ Admin users returned: {len(users)} users")


class TestAdminTalents:
    """Test admin talents endpoint - NEW FEATURE"""
    
    def test_admin_talents_requires_admin_role(self, api_client):
        """Test /api/admin/talents returns 403 for non-admin"""
        response = api_client.get(
            f"{BASE_URL}/api/admin/talents",
            cookies={"session_token": TestData.client_session}
        )
        assert response.status_code == 403
        print("✅ Admin talents endpoint restricted to admin role")
    
    def test_admin_talents_works_for_admin(self, api_client):
        """Test /api/admin/talents returns talent users for admin"""
        response = api_client.get(
            f"{BASE_URL}/api/admin/talents",
            cookies={"session_token": TestData.admin_session}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] == True
        assert "talents" in data
        assert isinstance(data["talents"], list)
        
        # Should find at least our test talent
        talents = data["talents"]
        assert len(talents) >= 1
        
        # Verify all returned users are talents
        for talent in talents:
            assert talent["role"] == "talent"
            assert "user_id" in talent
            assert "email" in talent
            assert "name" in talent
            # Should not contain MongoDB _id
            assert "_id" not in talent
        
        # Verify our test talent is in the list
        talent_ids = [t["user_id"] for t in talents]
        assert TestData.talent_user_id in talent_ids
        
        print(f"✅ Admin talents returned: {len(talents)} talents")


class TestProjectAssignment:
    """Test talent assignment to projects - NEW FEATURE"""
    
    def test_create_project_for_assignment(self, api_client):
        """Create a test project for assignment testing"""
        project_data = {
            "services": ["Brand / Promo Video"],
            "goal": "Increase Brand Awareness",
            "platform": "YouTube",
            "timeline": "Standard (3-4 weeks)",
            "budget": "₹50,000 - ₹1,00,000",
            "details": "Test project for talent assignment",
            "name": "Test Client",
            "email": "client@test.com",
            "phone": "+91 98765 43210",
            "reference_files": []
        }
        
        response = api_client.post(
            f"{BASE_URL}/api/projects",
            json=project_data,
            cookies={"session_token": TestData.client_session}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        
        TestData.project_id = data["project_id"]
        
        # Verify project has empty assigned_talents
        project = data["project"]
        assert "assigned_talents" in project
        assert project["assigned_talents"] == []
        
        print(f"✅ Project created for assignment: {TestData.project_id}")
    
    def test_assign_talent_requires_admin_role(self, api_client):
        """Test /api/projects/{id}/assign returns 403 for non-admin"""
        response = api_client.patch(
            f"{BASE_URL}/api/projects/{TestData.project_id}/assign",
            json={"talent_ids": [TestData.talent_user_id]},
            cookies={"session_token": TestData.client_session}
        )
        assert response.status_code == 403
        print("✅ Project assign endpoint restricted to admin role")
    
    def test_assign_talent_to_project(self, api_client):
        """Test assigning talents to project"""
        response = api_client.patch(
            f"{BASE_URL}/api/projects/{TestData.project_id}/assign",
            json={"talent_ids": [TestData.talent_user_id]},
            cookies={"session_token": TestData.admin_session}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] == True
        assert data["message"] == "Talents assigned successfully"
        assert "assigned_talents" in data
        assert TestData.talent_user_id in data["assigned_talents"]
        
        print(f"✅ Talent assigned to project: {data['assigned_talents']}")
    
    def test_verify_talent_assignment_persisted(self, api_client):
        """Verify talent assignment was persisted via GET"""
        response = api_client.get(
            f"{BASE_URL}/api/projects/{TestData.project_id}",
            cookies={"session_token": TestData.admin_session}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] == True
        project = data["project"]
        
        # Verify assignment persisted
        assert "assigned_talents" in project
        assert TestData.talent_user_id in project["assigned_talents"]
        
        print(f"✅ Talent assignment verified in project GET: {project['assigned_talents']}")
    
    def test_unassign_talent_from_project(self, api_client):
        """Test unassigning talents (empty list)"""
        response = api_client.patch(
            f"{BASE_URL}/api/projects/{TestData.project_id}/assign",
            json={"talent_ids": []},
            cookies={"session_token": TestData.admin_session}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] == True
        assert data["assigned_talents"] == []
        
        print("✅ Talents unassigned from project")
    
    def test_assign_invalid_talent_fails(self, api_client):
        """Test assigning non-existent talent returns error"""
        response = api_client.patch(
            f"{BASE_URL}/api/projects/{TestData.project_id}/assign",
            json={"talent_ids": ["nonexistent-user-id"]},
            cookies={"session_token": TestData.admin_session}
        )
        
        assert response.status_code == 404
        print("✅ Assigning non-existent talent properly returns 404")
    
    def test_assign_non_talent_user_fails(self, api_client):
        """Test assigning a client (non-talent) returns error"""
        response = api_client.patch(
            f"{BASE_URL}/api/projects/{TestData.project_id}/assign",
            json={"talent_ids": [TestData.client_user_id]},
            cookies={"session_token": TestData.admin_session}
        )
        
        assert response.status_code == 400
        print("✅ Assigning non-talent user properly returns 400")


class TestProjectsList:
    """Test projects list for admin"""
    
    def test_admin_can_see_all_projects(self, api_client):
        """Test admin can see all projects"""
        response = api_client.get(
            f"{BASE_URL}/api/projects",
            cookies={"session_token": TestData.admin_session}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] == True
        assert "projects" in data
        projects = data["projects"]
        
        # Should have at least our test project
        assert len(projects) >= 1
        
        # Verify projects have required fields for admin dashboard
        for project in projects:
            assert "project_id" in project
            assert "client_name" in project
            assert "client_email" in project
            assert "services" in project
            assert "status" in project
            assert "assigned_talents" in project
            # Should not contain MongoDB _id
            assert "_id" not in project
        
        print(f"✅ Admin can see {len(projects)} projects")


class TestHealthCheck:
    """Health check endpoint"""
    
    def test_health_check(self, api_client):
        """Test /api/health endpoint"""
        response = api_client.get(f"{BASE_URL}/api/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✅ Health check passed")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
