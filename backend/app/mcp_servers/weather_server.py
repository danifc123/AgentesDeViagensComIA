import os
import requests
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("OpenWeatherMap API")

@mcp.tool()
def buscar_clima(cidade: str) -> str:
    """
    Busca a previsão do tempo atual para uma cidade usando a API do OpenWeatherMap.
    :param cidade: Nome da cidade (ex: São Paulo).
    """
    api_key = os.environ.get("OPENWEATHER_API_KEY")
    if not api_key or api_key == "your_openweathermap_key_here":
        return "Erro: OPENWEATHER_API_KEY não configurada no .env."
    
    url = f"http://api.openweathermap.org/data/2.5/weather?q={cidade}&appid={api_key}&units=metric&lang=pt_br"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        temp = data.get("main", {}).get("temp")
        sensacao = data.get("main", {}).get("feels_like")
        descricao = data.get("weather", [{}])[0].get("description")
        
        return f"O clima atual em {cidade} é de {temp}°C (sensação térmica de {sensacao}°C) com {descricao}."
    except Exception as e:
        return f"Erro ao buscar o clima para {cidade}: {str(e)}"

if __name__ == "__main__":
    mcp.run()
