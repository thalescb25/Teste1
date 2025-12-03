#!/usr/bin/env python3
"""
Comprehensive Backend Testing for AccessControl System
Tests all API endpoints following the suggested flow
"""

import requests
import json
import sys
from datetime import datetime
import time

# Base URL from frontend environment
BASE_URL = "https://visitor-flow-2.preview.emergentagent.com/api"

class AccessControlTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.token = None
        self.headers = {"Content-Type": "application/json"}
        self.test_results = []
        
    def log_test(self, test_name, success, message, response_data=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "response_data": response_data
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        if not success and response_data:
            print(f"   Response: {response_data}")
    
    def make_request(self, method, endpoint, data=None, use_auth=False):
        """Make HTTP request with proper headers"""
        url = f"{self.base_url}{endpoint}"
        headers = self.headers.copy()
        
        if use_auth and self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        
        try:
            if method == "GET":
                response = requests.get(url, headers=headers, timeout=30)
            elif method == "POST":
                response = requests.post(url, headers=headers, json=data, timeout=30)
            elif method == "PUT":
                response = requests.put(url, headers=headers, json=data, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            return response
        except requests.exceptions.RequestException as e:
            return None, str(e)
    
    def test_login(self):
        """Test login with admin credentials"""
        print("\n=== Testing Authentication ===")
        
        # Test login with admin credentials
        login_data = {
            "email": "admin@condominiocentral.com.br",
            "password": "admin123"
        }
        
        response = self.make_request("POST", "/auth/login", login_data)
        
        if response is None:
            self.log_test("Login", False, "Failed to connect to server")
            return False
        
        if response.status_code == 200:
            try:
                data = response.json()
                if data.get("success") and "token" in data:
                    self.token = data["token"]
                    self.log_test("Login", True, f"Successfully logged in as {data['user']['email']}", data)
                    return True
                else:
                    self.log_test("Login", False, "Invalid response format", data)
                    return False
            except json.JSONDecodeError:
                self.log_test("Login", False, "Invalid JSON response", response.text)
                return False
        else:
            try:
                error_data = response.json()
                self.log_test("Login", False, f"Login failed: {error_data.get('detail', 'Unknown error')}", error_data)
            except:
                self.log_test("Login", False, f"Login failed with status {response.status_code}", response.text)
            return False
    
    def test_register(self):
        """Test user registration"""
        register_data = {
            "email": f"test_{int(time.time())}@test.com",
            "password": "testpass123",
            "name": "Test User",
            "building": "Condomínio Central",
            "role": "receptionist"
        }
        
        response = self.make_request("POST", "/auth/register", register_data)
        
        if response is None:
            self.log_test("Register", False, "Failed to connect to server")
            return False
        
        if response.status_code == 200:
            try:
                data = response.json()
                if data.get("success"):
                    self.log_test("Register", True, "User registration successful", data)
                    return True
                else:
                    self.log_test("Register", False, "Registration failed", data)
                    return False
            except json.JSONDecodeError:
                self.log_test("Register", False, "Invalid JSON response", response.text)
                return False
        else:
            try:
                error_data = response.json()
                self.log_test("Register", False, f"Registration failed: {error_data.get('detail', 'Unknown error')}", error_data)
            except:
                self.log_test("Register", False, f"Registration failed with status {response.status_code}", response.text)
            return False
    
    def test_create_visitor(self):
        """Test creating a new visitor"""
        print("\n=== Testing Visitor Management ===")
        
        visitor_data = {
            "name": "João Silva Santos",
            "document": "12345678901",
            "company": "Tech Solutions Ltda",
            "host": "Maria Oliveira"
        }
        
        response = self.make_request("POST", "/visitors", visitor_data, use_auth=True)
        
        if response is None:
            self.log_test("Create Visitor", False, "Failed to connect to server")
            return None
        
        if response.status_code == 200:
            try:
                data = response.json()
                if data.get("success") and "data" in data:
                    visitor_id = data["data"]["id"]
                    self.log_test("Create Visitor", True, f"Visitor created with ID: {visitor_id}", data)
                    return visitor_id
                else:
                    self.log_test("Create Visitor", False, "Invalid response format", data)
                    return None
            except json.JSONDecodeError:
                self.log_test("Create Visitor", False, "Invalid JSON response", response.text)
                return None
        else:
            try:
                error_data = response.json()
                self.log_test("Create Visitor", False, f"Failed to create visitor: {error_data.get('detail', 'Unknown error')}", error_data)
            except:
                self.log_test("Create Visitor", False, f"Failed with status {response.status_code}", response.text)
            return None
    
    def test_list_visitors(self):
        """Test listing visitors with filters"""
        # Test without filters
        response = self.make_request("GET", "/visitors", use_auth=True)
        
        if response is None:
            self.log_test("List Visitors", False, "Failed to connect to server")
            return False
        
        if response.status_code == 200:
            try:
                data = response.json()
                if data.get("success") and "data" in data:
                    visitors_count = len(data["data"])
                    self.log_test("List Visitors", True, f"Retrieved {visitors_count} visitors", {"count": visitors_count})
                    
                    # Test with status filter
                    response_filtered = self.make_request("GET", "/visitors?status_filter=checked-in", use_auth=True)
                    if response_filtered and response_filtered.status_code == 200:
                        filtered_data = response_filtered.json()
                        if filtered_data.get("success"):
                            filtered_count = len(filtered_data["data"])
                            self.log_test("List Visitors (Filtered)", True, f"Retrieved {filtered_count} checked-in visitors", {"count": filtered_count})
                    
                    # Test with search
                    response_search = self.make_request("GET", "/visitors?search=João", use_auth=True)
                    if response_search and response_search.status_code == 200:
                        search_data = response_search.json()
                        if search_data.get("success"):
                            search_count = len(search_data["data"])
                            self.log_test("List Visitors (Search)", True, f"Found {search_count} visitors matching 'João'", {"count": search_count})
                    
                    return True
                else:
                    self.log_test("List Visitors", False, "Invalid response format", data)
                    return False
            except json.JSONDecodeError:
                self.log_test("List Visitors", False, "Invalid JSON response", response.text)
                return False
        else:
            try:
                error_data = response.json()
                self.log_test("List Visitors", False, f"Failed to list visitors: {error_data.get('detail', 'Unknown error')}", error_data)
            except:
                self.log_test("List Visitors", False, f"Failed with status {response.status_code}", response.text)
            return False
    
    def test_visitor_qrcode(self, visitor_id):
        """Test generating QR code for visitor"""
        if not visitor_id:
            self.log_test("Generate QR Code", False, "No visitor ID provided")
            return False
        
        response = self.make_request("GET", f"/visitors/{visitor_id}/qrcode", use_auth=True)
        
        if response is None:
            self.log_test("Generate QR Code", False, "Failed to connect to server")
            return False
        
        if response.status_code == 200:
            try:
                data = response.json()
                if data.get("success") and "qrCode" in data and "qrCodeImage" in data:
                    qr_code = data["qrCode"]
                    self.log_test("Generate QR Code", True, f"QR Code generated: {qr_code}", {"qrCode": qr_code})
                    return True
                else:
                    self.log_test("Generate QR Code", False, "Invalid response format", data)
                    return False
            except json.JSONDecodeError:
                self.log_test("Generate QR Code", False, "Invalid JSON response", response.text)
                return False
        else:
            try:
                error_data = response.json()
                self.log_test("Generate QR Code", False, f"Failed to generate QR code: {error_data.get('detail', 'Unknown error')}", error_data)
            except:
                self.log_test("Generate QR Code", False, f"Failed with status {response.status_code}", response.text)
            return False
    
    def test_checkout_visitor(self, visitor_id):
        """Test checking out a visitor"""
        if not visitor_id:
            self.log_test("Checkout Visitor", False, "No visitor ID provided")
            return False
        
        response = self.make_request("PUT", f"/visitors/{visitor_id}/checkout", use_auth=True)
        
        if response is None:
            self.log_test("Checkout Visitor", False, "Failed to connect to server")
            return False
        
        if response.status_code == 200:
            try:
                data = response.json()
                if data.get("success"):
                    self.log_test("Checkout Visitor", True, "Visitor checked out successfully", data)
                    return True
                else:
                    self.log_test("Checkout Visitor", False, "Checkout failed", data)
                    return False
            except json.JSONDecodeError:
                self.log_test("Checkout Visitor", False, "Invalid JSON response", response.text)
                return False
        else:
            try:
                error_data = response.json()
                self.log_test("Checkout Visitor", False, f"Failed to checkout visitor: {error_data.get('detail', 'Unknown error')}", error_data)
            except:
                self.log_test("Checkout Visitor", False, f"Failed with status {response.status_code}", response.text)
            return False
    
    def test_stats(self):
        """Test getting dashboard statistics"""
        print("\n=== Testing Statistics ===")
        
        response = self.make_request("GET", "/stats", use_auth=True)
        
        if response is None:
            self.log_test("Get Statistics", False, "Failed to connect to server")
            return False
        
        if response.status_code == 200:
            try:
                data = response.json()
                if data.get("success") and "data" in data:
                    stats = data["data"]
                    required_fields = ["todayVisitors", "activeVisitors", "totalVisitorsMonth", "averageStayTime"]
                    
                    if all(field in stats for field in required_fields):
                        self.log_test("Get Statistics", True, f"Statistics retrieved: {stats}", stats)
                        return True
                    else:
                        missing_fields = [field for field in required_fields if field not in stats]
                        self.log_test("Get Statistics", False, f"Missing fields: {missing_fields}", data)
                        return False
                else:
                    self.log_test("Get Statistics", False, "Invalid response format", data)
                    return False
            except json.JSONDecodeError:
                self.log_test("Get Statistics", False, "Invalid JSON response", response.text)
                return False
        else:
            try:
                error_data = response.json()
                self.log_test("Get Statistics", False, f"Failed to get statistics: {error_data.get('detail', 'Unknown error')}", error_data)
            except:
                self.log_test("Get Statistics", False, f"Failed with status {response.status_code}", response.text)
            return False
    
    def test_newsletter_subscription(self):
        """Test newsletter subscription"""
        print("\n=== Testing Newsletter ===")
        
        newsletter_data = {
            "email": f"newsletter_{int(time.time())}@test.com"
        }
        
        response = self.make_request("POST", "/newsletter/subscribe", newsletter_data)
        
        if response is None:
            self.log_test("Newsletter Subscribe", False, "Failed to connect to server")
            return False
        
        if response.status_code == 200:
            try:
                data = response.json()
                if data.get("success"):
                    self.log_test("Newsletter Subscribe", True, "Successfully subscribed to newsletter", data)
                    
                    # Test duplicate subscription
                    response_dup = self.make_request("POST", "/newsletter/subscribe", newsletter_data)
                    if response_dup and response_dup.status_code == 200:
                        dup_data = response_dup.json()
                        if dup_data.get("success"):
                            self.log_test("Newsletter Duplicate", True, "Duplicate subscription handled correctly", dup_data)
                    
                    return True
                else:
                    self.log_test("Newsletter Subscribe", False, "Subscription failed", data)
                    return False
            except json.JSONDecodeError:
                self.log_test("Newsletter Subscribe", False, "Invalid JSON response", response.text)
                return False
        else:
            try:
                error_data = response.json()
                self.log_test("Newsletter Subscribe", False, f"Failed to subscribe: {error_data.get('detail', 'Unknown error')}", error_data)
            except:
                self.log_test("Newsletter Subscribe", False, f"Failed with status {response.status_code}", response.text)
            return False
    
    def run_all_tests(self):
        """Run all tests in the suggested order"""
        print(f"🚀 Starting AccessControl Backend Tests")
        print(f"📍 Base URL: {self.base_url}")
        print("=" * 60)
        
        # Step 1: Authentication
        if not self.test_login():
            print("❌ Cannot proceed without authentication")
            return self.generate_summary()
        
        # Test registration (optional)
        self.test_register()
        
        # Step 2: Create visitor
        visitor_id = self.test_create_visitor()
        
        # Step 3: List visitors
        self.test_list_visitors()
        
        # Step 4: Generate QR Code
        if visitor_id:
            self.test_visitor_qrcode(visitor_id)
            
            # Step 5: Checkout visitor
            self.test_checkout_visitor(visitor_id)
        
        # Step 6: Get statistics
        self.test_stats()
        
        # Step 7: Newsletter subscription
        self.test_newsletter_subscription()
        
        return self.generate_summary()
    
    def generate_summary(self):
        """Generate test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests*100):.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  • {result['test']}: {result['message']}")
        
        print("\n✅ PASSED TESTS:")
        for result in self.test_results:
            if result["success"]:
                print(f"  • {result['test']}: {result['message']}")
        
        return {
            "total": total_tests,
            "passed": passed_tests,
            "failed": failed_tests,
            "success_rate": passed_tests/total_tests*100 if total_tests > 0 else 0,
            "results": self.test_results
        }

if __name__ == "__main__":
    tester = AccessControlTester()
    summary = tester.run_all_tests()
    
    # Exit with error code if tests failed
    if summary["failed"] > 0:
        sys.exit(1)
    else:
        sys.exit(0)