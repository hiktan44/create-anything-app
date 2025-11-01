import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_create_ai_prediction_with_required_fields():
    # Step 1: Authenticate and get JWT token
    auth_url = f"{BASE_URL}/api/auth/token"
    try:
        auth_resp = requests.get(auth_url, timeout=TIMEOUT)
        assert auth_resp.status_code == 200, f"Authentication failed with status {auth_resp.status_code}"
        if not auth_resp.content:
            raise AssertionError("Authentication response is empty")
        try:
            auth_data = auth_resp.json()
        except Exception as e:
            raise AssertionError(f"Authentication response is not valid JSON: {e}")
        token = auth_data.get("jwt")
        user = auth_data.get("user")
        assert token and isinstance(token, str), "JWT token is missing or invalid"
        assert user and "id" in user, "User info is missing or invalid"
    except Exception as e:
        raise AssertionError(f"Authentication step failed: {e}")

    # Prepare headers with Authorization
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # We need a valid company_id. We can get it from user info or fetch companies if available.
    # Since user info does not have company_id explicitly, try to get company list first:
    company_id = None
    try:
        companies_resp = requests.get(f"{BASE_URL}/api/companies", headers=headers, timeout=TIMEOUT)
        assert companies_resp.status_code == 200, f"Failed to fetch companies with status {companies_resp.status_code}"
        if not companies_resp.content:
            raise AssertionError("Companies response is empty")
        try:
            companies_data = companies_resp.json()
        except Exception as e:
            raise AssertionError(f"Companies response is not valid JSON: {e}")

        # Assuming companies_data is a list or dict with company info - pick first company id if possible
        if isinstance(companies_data, list) and companies_data:
            company_id = companies_data[0].get("id")
        elif isinstance(companies_data, dict):
            # Try common keys
            if "companies" in companies_data and isinstance(companies_data["companies"], list) and companies_data["companies"]:
                company_id = companies_data["companies"][0].get("id")
            elif "id" in companies_data:
                company_id = companies_data.get("id")
        assert company_id and isinstance(company_id, str), "Valid company_id not found in companies response"
    except Exception as e:
        raise AssertionError(f"Fetching company_id failed: {e}")

    # Prepare AI prediction payload with required fields plus some optional fields
    payload = {
        "company_id": company_id,
        "prediction_type": "market_forecast",
        "period": "2025-Q4",
        "target_market": "North America",
        "product_category": "Electronics",
        "hs_code": "854239",
        "market_data": {
            "previous_prices": [100, 105, 110],
            "market_conditions": "stable"
        }
    }

    ai_prediction_url = f"{BASE_URL}/api/ai-predictions"

    # POST the AI prediction and validate success
    try:
        response = requests.post(ai_prediction_url, json=payload, headers=headers, timeout=TIMEOUT)
        assert response.status_code == 200, f"AI prediction creation failed with status {response.status_code}"
        if response.content:
            try:
                resp_json = response.json()
            except Exception as e:
                raise AssertionError(f"Response JSON decode failed: {e}")
        else:
            resp_json = {}
        assert isinstance(resp_json, dict), "Response JSON is not a dictionary"
        # Check the company_id and prediction_type match in the response if present
        if "company_id" in resp_json:
            assert resp_json["company_id"] == company_id, "Returned company_id does not match"
        if "prediction_type" in resp_json:
            assert resp_json["prediction_type"] == "market_forecast", "Returned prediction_type does not match"
    except Exception as e:
        raise AssertionError(f"Failed to create AI prediction: {e}")

test_create_ai_prediction_with_required_fields()
