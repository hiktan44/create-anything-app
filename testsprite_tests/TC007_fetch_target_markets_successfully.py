import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def get_jwt_token():
    url = f"{BASE_URL}/api/auth/token"
    try:
        response = requests.get(url, timeout=TIMEOUT)
        if response.status_code == 200:
            data = response.json()
            jwt = data.get("jwt")
            assert jwt is not None and isinstance(jwt, str), "JWT token missing or invalid"
            return jwt
        elif response.status_code == 401:
            raise Exception("Unauthorized: Invalid or missing authentication")
        else:
            response.raise_for_status()
    except requests.RequestException as e:
        raise Exception(f"Failed to get JWT token: {e}")

def test_fetch_target_markets_successfully():
    token = get_jwt_token()
    url = f"{BASE_URL}/api/target-markets"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json"
    }
    try:
        response = requests.get(url, headers=headers, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected 200 OK but got {response.status_code}"
        data = response.json()
        # The PRD does not specify exact schema for target markets, 
        # but we assert data is a list or dict containing markets info.
        assert isinstance(data, (list, dict)), "Response data should be a list or dict"
        # If list, ensure elements are dicts representing target market info
        if isinstance(data, list):
            for item in data:
                assert isinstance(item, dict), "Each target market item should be a dict"
        else:
            # If dict, check it has keys (not empty)
            assert len(data) > 0, "Target markets data dict should not be empty"
    except requests.RequestException as e:
        raise Exception(f"Request to fetch target markets failed: {e}")

test_fetch_target_markets_successfully()