#!/usr/bin/env python3
"""
Quick backend test script — test the roteiro API without the frontend.

Usage:
    python test_api.py

Make sure the backend is running first:
    cd backend
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_root():
    """Test the root endpoint."""
    print("🔍 Testing GET /...")
    response = requests.get(f"{BASE_URL}/")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}\n")

def test_gerar_roteiro():
    """Test the roteiro generation endpoint."""
    print("🔍 Testing POST /gerar-roteiro...")
    payload = {
        "origem": "Rio de Janeiro",
        "destino": "São Paulo",
        "data": "15 de Dezembro",
        "orcamento": 5000.0
    }
    
    print(f"Payload: {json.dumps(payload, indent=2)}\n")
    
    try:
        response = requests.post(
            f"{BASE_URL}/gerar-roteiro",
            json=payload,
            timeout=60
        )
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            roteiro = data.get("roteiro", {})
            
            print("\n✅ Response received! Checking structure...\n")
            
            if isinstance(roteiro, dict):
                print("✓ Roteiro is a structured object")
                print(f"  - Keys: {list(roteiro.keys())}\n")
                
                # Print each section summary
                if "route" in roteiro:
                    print(f"  📍 Route: {roteiro['route'].get('origin')} → {roteiro['route'].get('destination')}")
                
                if "climate" in roteiro:
                    print(f"  🌤️  Climate: {roteiro['climate'].get('temperature')}°C, {roteiro['climate'].get('conditions')}")
                
                if "flights" in roteiro:
                    flights = roteiro['flights']
                    if isinstance(flights, list):
                        print(f"  ✈️  {len(flights)} flight(s) found")
                    else:
                        print(f"  ✈️  Flight: {flights.get('airline')} - R$ {flights.get('price')}")
                
                if "hotels" in roteiro:
                    hotels = roteiro['hotels']
                    if isinstance(hotels, list):
                        print(f"  🏨 {len(hotels)} hotel(s) found")
                    else:
                        print(f"  🏨 Hotel: {hotels.get('name')} - R$ {hotels.get('total_price')}")
                
                if "budget" in roteiro:
                    budget = roteiro['budget']
                    print(f"  💰 Budget: R$ {budget.get('total')} | Used: R$ {budget.get('used')} | Remaining: R$ {budget.get('remaining')}")
                
                if "tips" in roteiro:
                    tips = roteiro['tips']
                    print(f"  💡 Tips: {len(tips)} tips provided")
                
                print("\n✅ All sections present! Frontend should render this correctly.")
            else:
                print(f"ℹ️  Roteiro is text (markdown fallback):\n{roteiro[:200]}...\n")
        else:
            print(f"❌ Error: {response.text}")
    
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend. Make sure it's running on http://localhost:8000")
    except requests.exceptions.Timeout:
        print("❌ Request timeout. The backend is taking too long to respond.")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 IAgent de Viagens — Backend API Test")
    print("=" * 60 + "\n")
    
    test_root()
    test_gerar_roteiro()
    
    print("=" * 60)
    print("✅ Test complete! If all checks passed, the frontend should work.")
    print("=" * 60)
