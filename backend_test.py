#!/usr/bin/env python3
"""
ChegouAqui Backend API Testing Suite
Tests all endpoints for the multi-tenant package notification system
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any, Optional

class ChegouAquiAPITester:
    def __init__(self, base_url="https://buildingbox.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tokens = {}
        self.test_data = {}
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        
        # Test credentials
        self.super_admin_creds = {
            "email": "admin@chegouaqui.com",
            "password": "admin123"
        }

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details:
            print(f"    {details}")
        
        if success:
            self.tests_passed += 1
        else:
            self.failed_tests.append({"name": name, "details": details})

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    token: Optional[str] = None, expected_status: int = 200) -> tuple[bool, Dict]:
        """Make HTTP request with error handling"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if token:
            headers['Authorization'] = f'Bearer {token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)
            else:
                return False, {"error": f"Unsupported method: {method}"}

            success = response.status_code == expected_status
            
            try:
                response_data = response.json()
            except:
                response_data = {"status_code": response.status_code, "text": response.text}

            if not success:
                print(f"    Expected {expected_status}, got {response.status_code}")
                print(f"    Response: {response_data}")

            return success, response_data

        except requests.exceptions.RequestException as e:
            print(f"    Request failed: {str(e)}")
            return False, {"error": str(e)}

    def test_super_admin_login(self):
        """Test super admin login"""
        success, response = self.make_request(
            'POST', 'auth/login', 
            self.super_admin_creds
        )
        
        if success and 'access_token' in response:
            self.tokens['super_admin'] = response['access_token']
            self.test_data['super_admin_user'] = response['user']
            self.log_test("Super Admin Login", True, f"User: {response['user']['name']}")
            return True
        else:
            self.log_test("Super Admin Login", False, f"Response: {response}")
            return False

    def test_create_building(self):
        """Test building creation by super admin"""
        if 'super_admin' not in self.tokens:
            self.log_test("Create Building", False, "No super admin token")
            return False

        building_data = {
            "name": "Edifício Teste",
            "admin_name": "Admin Teste",
            "admin_email": "admin.teste@exemplo.com",
            "admin_password": "senha123",
            "num_apartments": 20,
            "plan": "basic"
        }

        success, response = self.make_request(
            'POST', 'super-admin/buildings',
            building_data,
            self.tokens['super_admin'],
            201
        )

        if success:
            self.test_data['building'] = response
            self.log_test("Create Building", True, f"Building ID: {response['id']}")
            return True
        else:
            self.log_test("Create Building", False, f"Response: {response}")
            return False

    def test_building_admin_login(self):
        """Test building admin login"""
        if 'building' not in self.test_data:
            self.log_test("Building Admin Login", False, "No building created")
            return False

        admin_creds = {
            "email": "admin.teste@exemplo.com",
            "password": "senha123"
        }

        success, response = self.make_request(
            'POST', 'auth/login',
            admin_creds
        )

        if success and 'access_token' in response:
            self.tokens['building_admin'] = response['access_token']
            self.test_data['building_admin_user'] = response['user']
            self.log_test("Building Admin Login", True, f"User: {response['user']['name']}")
            return True
        else:
            self.log_test("Building Admin Login", False, f"Response: {response}")
            return False

    def test_create_doorman(self):
        """Test doorman creation by building admin"""
        if 'building_admin' not in self.tokens:
            self.log_test("Create Doorman", False, "No building admin token")
            return False

        doorman_data = {
            "name": "Porteiro Teste",
            "email": "porteiro.teste@exemplo.com",
            "password": "porteiro123",
            "role": "doorman"
        }

        success, response = self.make_request(
            'POST', 'admin/users',
            doorman_data,
            self.tokens['building_admin'],
            201
        )

        if success:
            self.test_data['doorman_user'] = response
            self.log_test("Create Doorman", True, f"Doorman ID: {response['id']}")
            return True
        else:
            self.log_test("Create Doorman", False, f"Response: {response}")
            return False

    def test_doorman_login(self):
        """Test doorman login"""
        if 'doorman_user' not in self.test_data:
            self.log_test("Doorman Login", False, "No doorman created")
            return False

        doorman_creds = {
            "email": "porteiro.teste@exemplo.com",
            "password": "porteiro123"
        }

        success, response = self.make_request(
            'POST', 'auth/login',
            doorman_creds
        )

        if success and 'access_token' in response:
            self.tokens['doorman'] = response['access_token']
            self.log_test("Doorman Login", True, f"User: {response['user']['name']}")
            return True
        else:
            self.log_test("Doorman Login", False, f"Response: {response}")
            return False

    def test_get_apartments(self):
        """Test getting apartments list"""
        if 'building_admin' not in self.tokens:
            self.log_test("Get Apartments", False, "No building admin token")
            return False

        success, response = self.make_request(
            'GET', 'admin/apartments',
            token=self.tokens['building_admin']
        )

        if success and isinstance(response, list):
            self.test_data['apartments'] = response
            self.log_test("Get Apartments", True, f"Found {len(response)} apartments")
            return True
        else:
            self.log_test("Get Apartments", False, f"Response: {response}")
            return False

    def test_add_resident_phone(self):
        """Test adding resident phone to apartment"""
        if 'building_admin' not in self.tokens or 'apartments' not in self.test_data:
            self.log_test("Add Resident Phone", False, "Missing prerequisites")
            return False

        if not self.test_data['apartments']:
            self.log_test("Add Resident Phone", False, "No apartments available")
            return False

        apartment = self.test_data['apartments'][0]
        phone_data = {
            "apartment_id": apartment['id'],
            "whatsapp": "(11) 99999-9999",
            "name": "Morador Teste"
        }

        success, response = self.make_request(
            'POST', f'admin/apartments/{apartment["id"]}/phones',
            phone_data,
            self.tokens['building_admin'],
            201
        )

        if success:
            self.test_data['resident_phone'] = response
            self.log_test("Add Resident Phone", True, f"Phone ID: {response['id']}")
            return True
        else:
            self.log_test("Add Resident Phone", False, f"Response: {response}")
            return False

    def test_register_delivery(self):
        """Test delivery registration by doorman"""
        if 'doorman' not in self.tokens or 'apartments' not in self.test_data:
            self.log_test("Register Delivery", False, "Missing prerequisites")
            return False

        if not self.test_data['apartments']:
            self.log_test("Register Delivery", False, "No apartments available")
            return False

        apartment = self.test_data['apartments'][0]
        delivery_data = {
            "apartment_id": apartment['id']
        }

        success, response = self.make_request(
            'POST', 'doorman/delivery',
            delivery_data,
            self.tokens['doorman'],
            201
        )

        if success:
            self.test_data['delivery'] = response
            self.log_test("Register Delivery", True, f"Delivery ID: {response['id']}")
            return True
        else:
            self.log_test("Register Delivery", False, f"Response: {response}")
            return False

    def test_public_registration(self):
        """Test public phone registration"""
        if 'building' not in self.test_data:
            self.log_test("Public Registration", False, "No building available")
            return False

        registration_data = {
            "registration_code": self.test_data['building']['registration_code'],
            "apartment_number": "2",
            "whatsapp": "(11) 88888-8888",
            "name": "Morador Público"
        }

        success, response = self.make_request(
            'POST', 'public/register',
            registration_data,
            expected_status=200
        )

        if success:
            self.log_test("Public Registration", True, f"Building: {response.get('building_name', 'N/A')}")
            return True
        else:
            self.log_test("Public Registration", False, f"Response: {response}")
            return False

    def test_super_admin_stats(self):
        """Test super admin global statistics"""
        if 'super_admin' not in self.tokens:
            self.log_test("Super Admin Stats", False, "No super admin token")
            return False

        success, response = self.make_request(
            'GET', 'super-admin/stats',
            token=self.tokens['super_admin']
        )

        if success and 'total_buildings' in response:
            self.log_test("Super Admin Stats", True, 
                         f"Buildings: {response['total_buildings']}, Deliveries: {response['total_deliveries']}")
            return True
        else:
            self.log_test("Super Admin Stats", False, f"Response: {response}")
            return False

    def test_building_info(self):
        """Test getting building information"""
        if 'building_admin' not in self.tokens:
            self.log_test("Building Info", False, "No building admin token")
            return False

        success, response = self.make_request(
            'GET', 'admin/building',
            token=self.tokens['building_admin']
        )

        if success and 'name' in response:
            self.log_test("Building Info", True, f"Building: {response['name']}")
            return True
        else:
            self.log_test("Building Info", False, f"Response: {response}")
            return False

    def test_delivery_history(self):
        """Test getting delivery history"""
        if 'doorman' not in self.tokens:
            self.log_test("Delivery History", False, "No doorman token")
            return False

        success, response = self.make_request(
            'GET', 'doorman/deliveries/today',
            token=self.tokens['doorman']
        )

        if success and isinstance(response, list):
            self.log_test("Delivery History", True, f"Found {len(response)} deliveries today")
            return True
        else:
            self.log_test("Delivery History", False, f"Response: {response}")
            return False

    def run_all_tests(self):
        """Run complete test suite"""
        print("🚀 Starting ChegouAqui Backend API Tests")
        print("=" * 50)

        # Authentication tests
        print("\n📋 Authentication Tests")
        self.test_super_admin_login()

        # Super Admin tests
        print("\n👑 Super Admin Tests")
        self.test_create_building()
        self.test_super_admin_stats()

        # Building Admin tests
        print("\n🏢 Building Admin Tests")
        self.test_building_admin_login()
        self.test_building_info()
        self.test_get_apartments()
        self.test_add_resident_phone()
        self.test_create_doorman()

        # Doorman tests
        print("\n🚪 Doorman Tests")
        self.test_doorman_login()
        self.test_register_delivery()
        self.test_delivery_history()

        # Public tests
        print("\n🌐 Public Registration Tests")
        self.test_public_registration()

        # Summary
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for test in self.failed_tests:
                print(f"  - {test['name']}: {test['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = ChegouAquiAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())