import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_fetch_market_trends_data():
    url = f"{BASE_URL}/api/trend-detection"
    headers = {
        "Accept": "application/json"
    }
    try:
        response = requests.get(url, headers=headers, timeout=TIMEOUT)
        # Check HTTP status code 200
        assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
        # Validate JSON response content
        data = response.json()
        assert isinstance(data, dict), "Response should be a JSON object"
        # Assuming trend data exists in response, check keys and expected structure
        # Since PRD does not specify exact keys, check presence of some data
        assert data, "Response JSON object should not be empty"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_fetch_market_trends_data()