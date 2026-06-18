import asyncio
import os
import sys
from crewai.tools import tool
from mcp.client.stdio import stdio_client, StdioServerParameters
from mcp.client.session import ClientSession
from dotenv import load_dotenv
import requests
from typing import List

load_dotenv()


async def _call_mcp_tool(server_script_name: str, tool_name: str, arguments: dict) -> str:
    """
    Função auxiliar assíncrona que inicia um servidor MCP local via stdio,
    chama a ferramenta e retorna o resultado.
    """
    # Caminho absoluto para o script do servidor
    current_dir = os.path.dirname(os.path.abspath(__file__))
    server_path = os.path.join(current_dir, "..", "mcp_servers", server_script_name)

    server_params = StdioServerParameters(
        command=sys.executable,
        args=[server_path],
        env=os.environ.copy()  # Repassa as variáveis de ambiente carregadas
    )

    try:
        async with stdio_client(server_params) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()
                result = await session.call_tool(tool_name, arguments)
                if result.content:
                    return result.content[0].text
                return "Sem resultado"
    except Exception as e:
        return f"Erro ao comunicar com o servidor MCP ({server_script_name}): {str(e)}"


# ===== Ignav HTTP tool (substitui integração Amadeus para voos) =====
def _extract_purchase_url(offer: dict) -> str | None:
    def _normalize_url(value: object) -> str | None:
        if isinstance(value, str) and value.startswith("http"):
            return value
        if isinstance(value, dict):
            for key in ("url", "href", "booking_url", "deep_link", "purchase_url", "checkout_url", "redirect_url", "link"):
                candidate = value.get(key)
                if isinstance(candidate, str) and candidate.startswith("http"):
                    return candidate
        return None

    for key in ("booking_url", "deep_link", "url", "purchase_url", "checkout_url", "redirect_url", "link", "fare_url", "bookingLink"):
        url = _normalize_url(offer.get(key))
        if url:
            return url

    for key in ("links", "urls"):
        value = offer.get(key)
        if isinstance(value, list):
            for item in value:
                url = _normalize_url(item)
                if url:
                    return url

    return None


@tool("Pesquisar Passagens Aéreas")
def tool_buscar_voos(origem: str, destino: str, data: str) -> str:
    """
    Pesquisa passagens aéreas usando a API Ignav.
    - `origem` e `destino`: códigos IATA (ex: GRU, CDG)
    - `data`: formato YYYY-MM-DD

    Faz POST em https://ignav.com/api/fares/one-way e retorna os 3 melhores itinerários
    com companhia, preço, moeda, duração (horas/minutos) e link de compra quando disponível.
    """
    api_key = os.getenv("IGNAV_API_KEY")
    if not api_key:
        # Se não tem API key, retorna dados mockados de exemplo com TODOS os campos
        return """
Companhia: GOL
Preço: 1200 BRL
departure: 08:00
arrival: 10:30
Duração: 2h30m
Purchase URL: https://www.voegol.com.br

Companhia: LATAM
Preço: 1400 BRL
departure: 12:00
arrival: 14:45
Duração: 2h45m
Purchase URL: https://www.latamairlines.com

Companhia: Azul
Preço: 1100 BRL
departure: 10:15
arrival: 12:50
Duração: 2h35m
Purchase URL: https://www.voeazul.com.br
        """.strip()

    url = "https://ignav.com/api/fares/one-way"
    headers = {
        "X-Api-Key": api_key,
        "Content-Type": "application/json",
    }
    payload = {"origin": origem, "destination": destino, "departure_date": data}

    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=10)
    except requests.RequestException as e:
        return f"Erro na requisição para Ignav: {str(e)}"

    if resp.status_code != 200:
        # Tentar ler mensagem de erro do corpo
        try:
            body = resp.json()
            msg = body.get("message") or body.get("error") or str(body)
        except Exception:
            msg = resp.text
        return f"Ignav retornou status {resp.status_code}: {msg}"

    try:
        data_json = resp.json()
    except Exception:
        return "Resposta inválida da Ignav: não foi possível decodificar JSON"

    # Esperamos uma lista de ofertas em data_json.get('fares') ou na raiz
    offers: List[dict] = data_json.get("fares") or data_json.get("offers") or data_json
    if not isinstance(offers, list):
        return "Formato de resposta inesperado da Ignav"

    # Ordenar por preço se possível
    def _price(o: dict) -> float:
        try:
            return float(o.get("price", {}).get("amount", o.get("price") or 0))
        except Exception:
            return 1e12

    offers_sorted = sorted(offers, key=_price)[:10]

    results = []
    for off in offers_sorted:
        airline = off.get("airline") or off.get("carrier") or off.get("company") or "-"
        price_info = off.get("price") or {}
        amount = price_info.get("amount") if isinstance(price_info, dict) else price_info
        currency = price_info.get("currency") if isinstance(price_info, dict) else ""
        duration = off.get("duration") or off.get("flight_time") or "-"
        # Normalizar duração se vier em minutos
        if isinstance(duration, (int, float)):
            hours = int(duration) // 60
            minutes = int(duration) % 60
            duration = f"{hours}h{minutes}m"
        
        # Pegar departure e arrival
        departure = off.get("departure") or off.get("departure_time") or "-"
        arrival = off.get("arrival") or off.get("arrival_time") or "-"

        purchase_url = _extract_purchase_url(off) or "https://www.google.com/flights"
        results.append(
            f"Companhia: {airline}\nPreço: {amount} {currency}\ndeparture: {departure}\narrival: {arrival}\nDuração: {duration}\nPurchase URL: {purchase_url}"
        )

    if not results:
        return "Nenhuma oferta encontrada para os parâmetros informados."

    return "\n\n".join(results)


@tool("Buscar Hotéis")
def tool_buscar_hoteis(cidade: str) -> str:
    """
    Placeholder para busca de hotéis — Antes usava Amadeus.
    Retorna dados mockados de hotéis para teste com EXATAMENTE 3 opções de preço.
    """
    import random

    # Lista de pontos turísticos comuns
    pontos_turisticos = {
        "Rio de Janeiro": ["Praia de Copacabana", "Cristo Redentor", "Pão de Açúcar"],
        "São Paulo": ["Avenida Paulista", "Ibirapuera", "Mercado Municipal"],
        "Paris": ["Torre Eiffel", "Louvre", "Champs-Élysées"],
        "Nova York": ["Times Square", "Central Park", "Empire State Building"],
    }

    pontos = pontos_turisticos.get(cidade, ["Atração 1", "Atração 2", "Atração 3"])

    # Dados de exemplo com EXATAMENTE 3 hotéis nas faixas de preço
    hoteis_exemplo = [
        {
            "name": f"Hostel Econômico {cidade} (Baixo Preço)",
            "price_per_night": 150,
            "total_price": 450,
            "distance": "50m da praia/centro",
            "booking_url": "https://www.hostelworld.com",
            "attractions": pontos,
        },
        {
            "name": f"Hotel Comfort {cidade} (Médio Preço)",
            "price_per_night": 450,
            "total_price": 1350,
            "distance": "200m da praia/centro",
            "booking_url": "https://www.booking.com",
            "attractions": pontos,
        },
        {
            "name": f"Hotel Premium {cidade} (Alto Preço)",
            "price_per_night": 1200,
            "total_price": 3600,
            "distance": "10m da praia/centro",
            "booking_url": "https://www.expedia.com",
            "attractions": pontos,
        },
    ]

    # Retorna como texto legível para o agente
    result = []
    for hotel in hoteis_exemplo:
        result.append(
            f"Hotel: {hotel['name']}\n"
            f"Preço por noite: R${hotel['price_per_night']}\n"
            f"Total para 3 noites: R${hotel['total_price']}\n"
            f"Distância: {hotel['distance']}\n"
            f"Link para reservar: {hotel['booking_url']}\n"
            f"Atrações próximas: {', '.join(hotel['attractions'])}\n"
        )

    return "\n".join(result)


@tool("Buscar Clima via OpenWeather MCP")
def tool_buscar_clima(cidade: str) -> str:
    """
    Busca a previsão do clima atual de uma cidade através do servidor MCP OpenWeather.
    Passe o nome completo da cidade (ex: São Paulo).
    """
    return asyncio.run(_call_mcp_tool(
        "weather_server.py",
        "buscar_clima",
        {"cidade": cidade}
    ))
