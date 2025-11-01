import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_retrieve_ai_predictions_with_valid_parameters():
    # Authenticate to get JWT token
    auth_url = f"{BASE_URL}/api/auth/token"
    try:
        auth_response = requests.get(auth_url, timeout=TIMEOUT)
        assert auth_response.status_code == 200, f"Auth failed with status {auth_response.status_code}"
        auth_data = auth_response.json()
        jwt_token = auth_data.get("jwt")
        user = auth_data.get("user")
        assert jwt_token is not None, "JWT token missing in auth response"
        assert user is not None and "id" in user, "User info missing or incomplete in auth response"
    except (requests.RequestException, AssertionError) as e:
        raise Exception(f"Authentication failed: {e}")

    headers = {
        "Authorization": f"Bearer {jwt_token}"
    }

    company_id = user["id"]
    periods_to_test = ["Q1-2025", "2025"]  # sample periods for testing

    prediction_types = [
        "market_forecast",
        "price_trend",
        "demand_prediction"
    ]

    for prediction_type in prediction_types:
        for period in periods_to_test:
            params = {
                "company_id": company_id,
                "type": prediction_type,
                "period": period
            }
            try:
                response = requests.get(f"{BASE_URL}/api/ai-predictions", headers=headers, params=params, timeout=TIMEOUT)
                assert response.status_code == 200, f"Expected 200, got {response.status_code} for type {prediction_type} and period {period}"
                data = response.json()
                # Validate response content structure and presence of relevant keys (assuming response contains prediction data)
                assert isinstance(data, dict), "Response JSON is not an object"
                # The exact keys aren't specified, but expecting some predictive data in response
                # Check at least contains fields matching prediction_type or 'prediction' key
                # Since no schema details given, check presence of keys logically
                assert data, f"Response data is empty for type {prediction_type} and period {period}"
            except (requests.RequestException, AssertionError) as e:
                raise Exception(f"Failed for prediction_type={prediction_type}, period={period} with error: {e}")

test_retrieve_ai_predictions_with_valid_parameters()