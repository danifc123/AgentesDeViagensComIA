import os
from mcp.server.fastmcp import FastMCP
from amadeus import Client, ResponseError

# Criação do servidor MCP
mcp = FastMCP("Amadeus Travel API")

def get_amadeus_client():
    client_id = os.environ.get("AMADEUS_CLIENT_ID")
    client_secret = os.environ.get("AMADEUS_CLIENT_SECRET")
    if not client_id or not client_secret or client_id == "your_amadeus_id_here":
        raise ValueError("Credenciais do Amadeus não configuradas corretamente no .env")
    return Client(client_id=client_id, client_secret=client_secret)

@mcp.tool()
def buscar_voos(origem: str, destino: str, data: str) -> str:
    """
    Busca ofertas de voos entre duas cidades em uma data específica.
    :param origem: Código IATA do aeroporto de origem (ex: GRU para Guarulhos).
    :param destino: Código IATA do aeroporto de destino (ex: EZE para Buenos Aires).
    :param data: Data do voo no formato YYYY-MM-DD.
    """
    try:
        amadeus = get_amadeus_client()
        response = amadeus.shopping.flight_offers_search.get(
            originLocationCode=origem,
            destinationLocationCode=destino,
            departureDate=data,
            adults=1,
            max=3 # Limitando para não exceder tokens do LLM
        )
        return str(response.data)
    except ResponseError as error:
        return f"Erro na API Amadeus ao buscar voos: {error}"
    except Exception as e:
         return f"Erro interno do MCP: {e}"

@mcp.tool()
def buscar_hoteis(cidade: str) -> str:
    """
    Busca hotéis em uma cidade baseando-se no código IATA da cidade.
    :param cidade: Código IATA da cidade (ex: PAR para Paris).
    """
    try:
        amadeus = get_amadeus_client()
        response = amadeus.reference_data.locations.hotels.by_city.get(
            cityCode=cidade
        )
        return str(response.data[:5]) # Retorna os 5 primeiros
    except ResponseError as error:
        return f"Erro na API Amadeus ao buscar hotéis: {error}"
    except Exception as e:
         return f"Erro interno do MCP: {e}"

if __name__ == "__main__":
    mcp.run()
