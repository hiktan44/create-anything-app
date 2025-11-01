import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_retrieve_risk_assessments():
    url = f"{BASE_URL}/api/risk-assessment"
    headers = {
        "Accept": "application/json",
    }
    try:
        response = requests.get(url, headers=headers, timeout=TIMEOUT)
        # Assert status code 200 OK
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        data = response.json()
        # Validate response content is a dict and contains expected keys for risk assessment
        assert isinstance(data, dict), "Response JSON is not an object"
        # Because no exact schema provided for risk assessment data,
        # check that data is not empty and has some keys
        assert data, "Risk assessment response JSON is empty"
    except requests.RequestException as e:
        assert False, f"Request to get risk assessments failed: {str(e)}"

test_retrieve_risk_assessments()