from crewai import Agent
from crewai.llms.base_llm import BaseLLM
from app.tools.mcp_client_tools import tool_buscar_voos, tool_buscar_hoteis, tool_buscar_clima
from pydantic import Field
import groq
import os
from typing import Any

class GroqLLM(BaseLLM):
    """Adapter para usar a API Groq como LLM dentro do CrewAI."""

    llm_type: str = "groq"
    provider: str = "groq"
    model: str = "qwen/qwen3-32b"
    temperature: float | None = 0.3
    api_key: str | None = None
    base_url: str | None = None
    stop: list[str] = Field(default_factory=list)
    additional_params: dict[str, Any] = Field(default_factory=dict)

    def __init__(self, **data: Any):
        data.setdefault("model", "qwen/qwen3-32b")
        data.setdefault("provider", "groq")
        super().__init__(**data)
        self.client = groq.Client(
            api_key=self.api_key or os.environ.get("GROQ_API_KEY"),
            base_url=self.base_url,
        )

    def _normalize_message(self, message: Any) -> dict[str, str]:
        if isinstance(message, str):
            return {"role": "user", "content": message}

        if isinstance(message, dict):
            role = message.get("role") or message.get("type") or "user"
            content = message.get("content") or message.get("text") or ""
            return {"role": role, "content": content}

        role = getattr(message, "role", None) or getattr(message, "type", None) or "user"
        content = getattr(message, "content", None) or getattr(message, "text", None)
        if content is None:
            raise ValueError("Cannot normalize LLM message; missing content")

        return {"role": role, "content": content}

    def _prepare_messages(self, messages: str | list[Any]) -> list[dict[str, str]]:
        if isinstance(messages, str):
            return [self._normalize_message(messages)]
        if isinstance(messages, list):
            return [self._normalize_message(m) for m in messages]
        return [self._normalize_message(messages)]

    def call(
        self,
        messages: str | list[Any],
        tools: list[dict[str, Any]] | None = None,
        callbacks: list[Any] | None = None,
        available_functions: dict[str, Any] | None = None,
        from_task: Any | None = None,
        from_agent: Any | None = None,
        response_model: Any | None = None,
    ) -> str | Any:
        groq_messages = self._prepare_messages(messages)
        request_kwargs: dict[str, Any] = {
            "messages": groq_messages,
            "model": self.model,
            "temperature": self.temperature,
        }
        if self.stop:
            request_kwargs["stop"] = self.stop
        if self.additional_params.get("max_tokens") is not None:
            request_kwargs["max_tokens"] = self.additional_params["max_tokens"]

        response = self.client.chat.completions.create(
            **{k: v for k, v in request_kwargs.items() if v is not None}
        )
        choice = response.choices[0]
        message = getattr(choice, "message", None)

        if message is not None:
            if isinstance(message, dict):
                return message.get("content", "")
            return getattr(message, "content", "") or getattr(message, "text", "") or str(message)

        return str(response)

    async def acall(
        self,
        messages: str | list[Any],
        tools: list[dict[str, Any]] | None = None,
        callbacks: list[Any] | None = None,
        available_functions: dict[str, Any] | None = None,
        from_task: Any | None = None,
        from_agent: Any | None = None,
        response_model: Any | None = None,
    ) -> str | Any:
        return self.call(
            messages,
            tools=tools,
            callbacks=callbacks,
            available_functions=available_functions,
            from_task=from_task,
            from_agent=from_agent,
            response_model=response_model,
        )


def get_llm():
    """Retorna a instância configurada do LLM."""
    return GroqLLM()


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
        tools=[tool_buscar_hoteis],
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
