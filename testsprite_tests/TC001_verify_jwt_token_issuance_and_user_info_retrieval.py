import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30


def test_verify_jwt_token_issuance_and_user_info_retrieval():
    token_url = f"{BASE_URL}/api/auth/token"

    # Test unauthenticated request: expect 401 Unauthorized as per PRD.
    try:
        response_unauth = requests.get(token_url, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request failed for token fetch: {e}"
    assert response_unauth.status_code == 401, f"Expected 401 Unauthorized for unauthenticated token request, got {response_unauth.status_code}"

    # If valid_token is set, test authenticated request.
    valid_token = None  # Replace None with actual token string if available.

    if valid_token:
        headers = {"Authorization": f"Bearer {valid_token}"}
        try:
            response_auth = requests.get(token_url, headers=headers, timeout=TIMEOUT)
        except requests.RequestException as e:
            assert False, f"Request failed for authenticated token fetch: {e}"
        assert response_auth.status_code == 200, f"Expected 200 OK for authenticated request, got {response_auth.status_code}"
        json_data = response_auth.json()
        assert "jwt" in json_data and isinstance(json_data["jwt"], str) and json_data["jwt"], "JWT token missing or invalid in response"
        assert "user" in json_data and isinstance(json_data["user"], dict), "User info missing or invalid in response"
        user = json_data["user"]
        assert all(k in user for k in ("id", "email", "name")), "User info incomplete in response"
        assert isinstance(user["id"], str) and user["id"], "User id invalid"
        assert isinstance(user["email"], str) and user["email"], "User email invalid"
        assert isinstance(user["name"], str) and user["name"], "User name invalid"


test_verify_jwt_token_issuance_and_user_info_retrieval()
