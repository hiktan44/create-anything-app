import requests
import uuid

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

# Assuming a function to get a valid JWT token for authentication
def get_jwt_token():
    url = f"{BASE_URL}/api/auth/token"
    try:
        response = requests.get(url, timeout=TIMEOUT)
        assert response.headers.get('Content-Type','').startswith('application/json'), f"Expected JSON response from auth token endpoint, got Content-Type: {response.headers.get('Content-Type')}"
        assert response.status_code == 200, f"Failed to get token, status code: {response.status_code}"
        data = response.json()
        assert 'jwt' in data, "JWT token not found in response"
        return data.get("jwt")
    except Exception as e:
        raise Exception(f"Authentication failed: {e}")

def test_validate_product_creation_with_complete_and_valid_data():
    jwt_token = get_jwt_token()
    headers = {
        "Authorization": f"Bearer {jwt_token}",
        "Content-Type": "application/json"
    }

    # Example company_id - need to obtain a valid one from user profile or create a new company
    # Here we fetch user info from token response and assume user has company_id same as user id or fetch companies
    # For test, we will try to fetch company info to get a valid company_id
    company_id = None
    try:
        companies_resp = requests.get(f"{BASE_URL}/api/companies", headers=headers, timeout=TIMEOUT)
        assert companies_resp.status_code == 200, f"Expected 200 on companies list, got {companies_resp.status_code}"
        companies_data = companies_resp.json()
        if isinstance(companies_data, list) and len(companies_data) > 0:
            company_id = companies_data[0].get("id") or companies_data[0].get("company_id") or companies_data[0].get("id")
        else:
            # fallback: try to get from user profile
            profile_resp = requests.get(f"{BASE_URL}/api/profile", headers=headers, timeout=TIMEOUT)
            assert profile_resp.status_code == 200, f"Expected 200 on user profile, got {profile_resp.status_code}"
            profile_data = profile_resp.json()
            # Often company id is not directly in profile, this is a fallback just in case
            company_id = profile_data.get("company_id") or profile_data.get("id")
        assert company_id is not None, "No company_id found for creating product"
    except Exception as e:
        raise Exception(f"Failed to get company_id for test: {e}")

    # Prepare product data with all required fields
    product_payload = {
        "company_id": str(company_id),
        "product_name": f"Test Product {uuid.uuid4()}",
        "hs_code": "84713000",
        "category": "Electronics",
        "material": "Plastic and Metal",
        "technical_specs": "Specs details here",
        "unit_price": 199.99,
        "currency": "USD",
        "description": "This is a test product created during automated testing."
    }

    product_id = None
    try:
        url = f"{BASE_URL}/api/products"
        response = requests.post(url, json=product_payload, headers=headers, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected 200 response for product creation, got {response.status_code}"
        resp_json = response.json()
        # Confirm response contains confirmation or product id info (not specified, so checking keys)
        # If no explicit id returned, skip extraction
        product_id = resp_json.get("id") or resp_json.get("product_id")

        # Additional validation - if response just a success message as per PRD, validate keys exist 
        # Try to fetch product list of this company and check new product present
        get_products_resp = requests.get(f"{BASE_URL}/api/products", headers=headers, params={"company_id": company_id}, timeout=TIMEOUT)
        assert get_products_resp.status_code == 200, f"Expected 200 fetching products, got {get_products_resp.status_code}"
        products_list = get_products_resp.json().get("products", [])
        created_product = None
        # Match by unique product_name since we generated uuid in product_name
        for p in products_list:
            if p.get("product_name") == product_payload["product_name"]:
                created_product = p
                break
        assert created_product is not None, "Created product not found in product list after creation"
        # Validate all fields match
        assert created_product.get("company_id") == product_payload["company_id"]
        assert created_product.get("hs_code") == product_payload["hs_code"]
        assert created_product.get("category") == product_payload["category"]
        assert created_product.get("material") == product_payload["material"]
        assert created_product.get("technical_specs") == product_payload["technical_specs"]
        assert float(created_product.get("unit_price", 0)) == product_payload["unit_price"]
        assert created_product.get("currency") == product_payload["currency"]
        assert created_product.get("description") == product_payload["description"]
    finally:
        # Cleanup: delete the created product if product_id is known
        if product_id:
            try:
                del_resp = requests.delete(f"{BASE_URL}/api/products/{product_id}", headers=headers, timeout=TIMEOUT)
                # 200 or 204 expected
                assert del_resp.status_code in [200, 204], f"Failed to delete product with id {product_id}, status: {del_resp.status_code}"
            except Exception:
                # ignore cleanup errors but can be logged if needed
                pass

test_validate_product_creation_with_complete_and_valid_data()
