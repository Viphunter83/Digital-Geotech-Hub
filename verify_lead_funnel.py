import requests
import json
import os

BASE_URL = "http://localhost:8000/api/v1"

def test_lead_submission():
    print("Testing Lead Submission...")
    payload = {
        "name": "Verification Bot",
        "phone": "+79991234567",
        "company": "Antigravity Testing",
        "audit_data": {"test": "data"}
    }
    response = requests.post(f"{BASE_URL}/leads/submit", json=payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    assert response.status_code == 200

def test_pdf_generation():
    print("\nTesting PDF Generation...")
    payload = {
        "parsed_data": {
            "work_type": "шпунтовое ограждение",
            "volume": 120,
            "soil_type": "песок",
            "required_profile": "Ларсен L5-UM",
            "depth": 12,
            "groundwater_level": 2.5,
            "special_conditions": ["стесненные условия"]
        },
        "technical_summary": "Проведен экспресс-аудит. Объект требует вибропогружения.",
        "risks": [{"risk": "Высокие грунтовые воды", "impact": "Необходим водоотлив"}],
        "matched_shpunts": [],
        "recommended_machinery": [],
        "estimated_total": 1200000,
        "confidence_score": 0.95
    }
    response = requests.post(f"{BASE_URL}/ai/download-report", json=payload)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print(f"Content-Type: {response.headers.get('Content-Type')}")
        with open("test_report.pdf", "wb") as f:
            f.write(response.content)
        print("PDF saved to test_report.pdf")
    assert response.status_code == 200

if __name__ == "__main__":
    try:
        test_lead_submission()
        test_pdf_generation()
        print("\nAll lead funnel tests passed!")
    except Exception as e:
        print(f"\nTests failed: {e}")
