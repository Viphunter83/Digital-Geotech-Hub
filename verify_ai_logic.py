import requests
import json
import time

BASE_URL = "http://localhost:8000/api/v1"

def test_auth():
    print("--- Testing Authentication ---")
    payload = {"access_code": "GEOTECH-2026"}
    try:
        response = requests.post(f"{BASE_URL}/auth/verify-code", json=payload)
        print(f"Auth Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Access Token: {data['access_token'][:20]}...")
            return data['access_token']
    except Exception as e:
        print(f"Auth failed: {e}")
    return None

def test_ai_parsing():
    print("\n--- Testing AI Document Parsing ---")
    spec_text = """
    Объект: Строительство жилого комплекса в г. Санкт-Петербург. 
    Техническое задание:
    - Вид работ: Устройство шпунтового ограждения котлована.
    - Тип шпунта: шпунт Ларссена L5-UM. 
    - Глубина погружения: 18 метров. 
    - Геология: На участке слабые водонасыщенные грунты, текучепластичные суглинки. 
    - Гидрогеология: Уровень грунтовых вод на отметке -1.5 метра. 
    - Объем работ: 450 тонн. 
    - Особенности: Требуется бережное погружение (Silent Piler) вблизи существующих исторических зданий.
    """
    
    # Mocking a file upload
    files = {'file': ('test_spec.txt', spec_text, 'text/plain')}
    try:
        response = requests.post(f"{BASE_URL}/ai/parse-document", files=files)
        print(f"AI Parsing Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Parsed Work Type: {data['parsed_data']['work_type']}")
            print(f"Confidence Score: {data['confidence_score']}")
            print(f"Risks Found: {len(data['risks'])}")
            return data
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"AI parsing failed: {e}")
    return None

def test_chat(token, context_data=None):
    print("\n--- Testing AI Chat ---")
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    payload = {
        "history": [],
        "message": "Какие основные риски при работе со шпунтом Ларссена в суглинках?",
        "context": json.dumps(context_data) if context_data else "Тестовый контекст"
    }
    try:
        response = requests.post(f"{BASE_URL}/ai/chat", json=payload, headers=headers)
        print(f"Chat Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"AI Response: {data['answer'][:100]}...")
    except Exception as e:
        print(f"Chat failed: {e}")

def test_lead_funnel(context_data):
    print("\n--- Testing Lead Funnel ---")
    payload = {
        "name": "Инженер Тест",
        "phone": "+79001234567",
        "company": "ТестГео",
        "audit_data": context_data
    }
    try:
        response = requests.post(f"{BASE_URL}/leads/submit", json=payload)
        print(f"Lead Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Lead submission failed: {e}")

if __name__ == "__main__":
    token = test_auth()
    analysis = test_ai_parsing()
    if analysis:
        test_chat(token, analysis['parsed_data'])
        test_lead_funnel(analysis)
    else:
        print("Skipping dependent tests due to AI parsing failure.")
