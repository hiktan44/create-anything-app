import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def get_jwt_token():
    url = f"{BASE_URL}/api/auth/token"
    try:
        response = requests.get(url, timeout=TIMEOUT)
        if response.status_code == 200:
            try:
                data = response.json()
            except ValueError:
                assert False, "Response content is not valid JSON"

            token = data.get("jwt")
            user = data.get("user")
            assert isinstance(token, str) and token, "JWT token is missing or empty"
            assert isinstance(user, dict) and "id" in user, "User info is missing or invalid"
            return token, user
        elif response.status_code == 401:
            raise PermissionError("Unauthorized: Invalid credentials or no credentials provided")
        else:
            response.raise_for_status()
    except (requests.RequestException, AssertionError, PermissionError) as e:
        raise RuntimeError(f"Failed to obtain JWT token: {e}")

def test_get_market_reports_for_company():
    token, user = get_jwt_token()
    company_id = user.get("id")
    assert company_id, "Company ID (user id) is required for the test"

    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json"
    }
    params = {"company_id": company_id}
    url = f"{BASE_URL}/api/market-reports"

    try:
        response = requests.get(url, headers=headers, params=params, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"
        try:
            data = response.json()
        except ValueError:
            assert False, "Market reports response content is not valid JSON"

        assert isinstance(data, dict), "Response should be a JSON object"
        keys = data.keys()
        assert any(
            key in keys for key in ["trade_statistics", "market_insights", "reports", "analytics"]
        ) or len(keys) > 0, "Response does not contain expected market report data"
    except requests.Timeout:
        assert False, "Request timed out"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_get_market_reports_for_company()
