import asyncio
import sys
import os
import json

# Add backend directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.services.ai.geotech_analyzer import geotech_analyzer

async def verify():
    print("Testing AI Analyzer with vague input...")
    text = "Нужно выкопать котлован 10 на 10 метров."
    
    result = await geotech_analyzer.analyze_project({"full_text": text})
    
    print("\n--- Result ---")
    print(f"Confidence: {result['confidence_score']}")
    print(f"Questions: {json.dumps(result.get('clarifying_questions', []), ensure_ascii=False, indent=2)}")
    
    if result.get('clarifying_questions'):
        print("\n✅ SUCCESS: Questions generated.")
    else:
        print("\n❌ FAILURE: No questions generated.")

if __name__ == "__main__":
    asyncio.run(verify())
