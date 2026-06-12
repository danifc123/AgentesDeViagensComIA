from crewai import Agent
from langchain_anthropic import ChatAnthropic
from app.tools.mcp_client_tools import tool_buscar_voos, tool_buscar_hoteis, tool_buscar_clima
from langchain_community.tools import DuckDuckGoSearchRun
import os

# Instanciando a ferramenta de busca web para ajudar na pesquisa de pontos turísticos
web_search_tool = DuckDuckGoSearchRun(
    name="Buscar na Web",
    description="Busca informações atualizadas na web sobre restaurantes, atrações e locais próximos."
)

def get_llm():
    """Retorna a instância configurada do LLM."""
    return ChatAnthropic(
        model_name="claude-3-5-sonnet-20241022",
        temperature=0.3,
        anthropic_api_key=os.environ.get("ANTHROPIC_API_KEY")
    )

def criar_pesquisador_voos() -> Agent:
    return Agent(
        role='Pesquisador de Voos',
        goal='Encontrar as melhores opções de voos, detalhando companhias, preços e horários.',
        backstory=(
            "Você é um agente experiente em aviação e roteamento. "
            "Sua missão é utilizar a ferramenta de buscar_voos para retornar opções "
            "práticas e detalhadas, informando sempre a origem, destino e valores aproximados."
        ),
        tools=[tool_buscar_voos],
        llm=get_llm(),
        verbose=True
    )

def criar_pesquisador_hoteis() -> Agent:
    return Agent(
        role='Pesquisador de Hotéis e Roteiro Local',
        goal=(
            'Encontrar hotéis na cidade de destino usando o código IATA e, crucialmente, '
            'buscar na web os melhores pontos de interesse próximos aos hotéis escolhidos '
            '(como restaurantes, feiras e pontos turísticos).'
        ),
        backstory=(
            "Você é um curador de viagens focado em experiência local. "
            "Você sabe que um bom hotel não é nada sem boas opções ao redor. "
            "Após encontrar os hotéis com a ferramenta buscar_hoteis, você SEMPRE usa a "
            "ferramenta de busca na web para listar 2 ou 3 atrações ou restaurantes "
            "próximos a cada hotel, montando um mini-roteiro de comodidade para o usuário."
        ),
        tools=[tool_buscar_hoteis, web_search_tool],
        llm=get_llm(),
        verbose=True
    )

def criar_analista_clima() -> Agent:
    return Agent(
        role='Analista de Clima',
        goal='Analisar o clima do destino e recomendar os preparativos.',
        backstory=(
            "Você é um meteorologista experiente aliado a um personal stylist de viagens. "
            "Após checar o clima exato do destino, você orienta o usuário sobre o que esperar "
            "e que tipo de roupas e itens colocar na mala."
        ),
        tools=[tool_buscar_clima],
        llm=get_llm(),
        verbose=True
    )
