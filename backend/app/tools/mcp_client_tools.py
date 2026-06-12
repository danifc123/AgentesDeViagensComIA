import asyncio
import os
import sys
from crewai.tools import tool
from mcp.client.stdio import stdio_client, StdioServerParameters
from mcp.client.session import ClientSession
from dotenv import load_dotenv

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
        env=os.environ.copy() # Repassa as variáveis de ambiente carregadas
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

# Ferramentas expostas para o CrewAI:

@tool("Buscar Voos via Amadeus MCP")
def tool_buscar_voos(origem: str, destino: str, data: str) -> str:
    """
    Busca opções de voos através do servidor MCP Amadeus.
    Use códigos IATA para origem e destino (ex: GRU, EZE) e formato YYYY-MM-DD para data.
    """
    # O CrewAI roda de forma síncrona, portanto utilizamos asyncio.run
    return asyncio.run(_call_mcp_tool(
        "amadeus_server.py", 
        "buscar_voos", 
        {"origem": origem, "destino": destino, "data": data}
    ))

@tool("Buscar Hotéis via Amadeus MCP")
def tool_buscar_hoteis(cidade: str) -> str:
    """
    Busca opções de hotéis através do servidor MCP Amadeus.
    Use código IATA para a cidade (ex: PAR para Paris).
    """
    return asyncio.run(_call_mcp_tool(
        "amadeus_server.py", 
        "buscar_hoteis", 
        {"cidade": cidade}
    ))

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
