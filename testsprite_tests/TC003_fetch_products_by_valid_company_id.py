import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_fetch_products_by_valid_company_id():
    # Step 1: Authenticate to get JWT token
    auth_url = f"{BASE_URL}/api/auth/token"
    headers = {"Accept": "application/json"}
    try:
        auth_resp = requests.get(auth_url, headers=headers, timeout=TIMEOUT)
        assert auth_resp.status_code == 200, f"Authentication failed with status code {auth_resp.status_code}"
        ct = auth_resp.headers.get('Content-Type', '')
        assert 'application/json' in ct, "Authentication response is not JSON"
        auth_data = auth_resp.json()
        jwt_token = auth_data.get("jwt")
        user = auth_data.get("user")
        assert jwt_token and user, "Authentication response missing token or user info"
    except requests.RequestException as e:
        assert False, f"Authentication request failed: {e}"
    except ValueError as e:
        assert False, f"Authentication response is not valid JSON: {e}"

    # Prepare headers with Authorization
    headers["Authorization"] = f"Bearer {jwt_token}"
    headers["Accept"] = "application/json"

    # Use company_id from authenticated user info if available, else fail test
    # The PRD does not explicitly mention the company id in auth user, so we must try to get a valid company_id
    # For this test, try to fetch companies and use one of their IDs
    try:
        companies_resp = requests.get(f"{BASE_URL}/api/companies", headers=headers, timeout=TIMEOUT)
        assert companies_resp.status_code == 200, f"Fetching companies failed with status code {companies_resp.status_code}"
        ct = companies_resp.headers.get('Content-Type', '')
        assert 'application/json' in ct, "Companies response is not JSON"
        companies_data = companies_resp.json()
        company_id = None
        if isinstance(companies_data, list) and len(companies_data) > 0:
            if isinstance(companies_data[0], dict) and "id" in companies_data[0]:
                company_id = companies_data[0]["id"]
        elif isinstance(companies_data, dict):
            if "companies" in companies_data and isinstance(companies_data["companies"], list) and len(companies_data["companies"]) > 0:
                company_id = companies_data["companies"][0].get("id")
            elif "id" in companies_data:
                company_id = companies_data["id"]
        assert company_id, "No company_id found from /api/companies to test products retrieval"
    except requests.RequestException as e:
        assert False, f"Request to fetch companies failed: {e}"
    except ValueError as e:
        assert False, f"Companies response is not valid JSON: {e}"

    # Step 2: Request products by valid company_id
    products_url = f"{BASE_URL}/api/products"
    params = {"company_id": company_id}

    try:
        products_resp = requests.get(products_url, headers=headers, params=params, timeout=TIMEOUT)
        assert products_resp.status_code == 200, f"Products fetch failed with status code {products_resp.status_code}"
        ct = products_resp.headers.get('Content-Type', '')
        assert 'application/json' in ct, "Products response is not JSON"
        products_data = products_resp.json()
        assert "products" in products_data, "Response JSON does not contain 'products' key"
        assert isinstance(products_data["products"], list), "'products' key is not a list"
    except requests.RequestException as e:
        assert False, f"Request to fetch products failed: {e}"
    except ValueError as e:
        assert False, f"Products response is not valid JSON: {e}"

test_fetch_products_by_valid_company_id()
