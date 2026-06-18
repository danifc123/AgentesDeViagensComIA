import json
import re
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.agents.orchestrator import rodar_orquestracao

app = FastAPI(title="Assistente de Viagem API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Para desenvolvimento
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RoteiroRequest(BaseModel):
    origem: str
    destino: str
    data: str
    orcamento: float

@app.get("/")
def read_root():
    return {"message": "Bem-vindo à API do Assistente de Viagem"}

def parse_json_from_text(text: str):
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.S)
    text = re.sub(r"<think>.*", "", text, flags=re.S)
    text = re.sub(r"\n{3,}", "\n\n", text).strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # tenta extrair o primeiro objeto JSON válido encontrado no texto
        match = re.search(r"(\{.*\})", text, flags=re.S)
        if match:
            candidate = match.group(1)
            try:
                return json.loads(candidate)
            except json.JSONDecodeError:
                pass
    return text

@app.post("/gerar-roteiro")
def gerar_roteiro(request: RoteiroRequest):
    resultado = rodar_orquestracao(
        origem=request.origem,
        destino=request.destino,
        data=request.data,
        orcamento=request.orcamento
    )

    if isinstance(resultado, str):
        parsed = parse_json_from_text(resultado)
        return {"roteiro": parsed}

    if isinstance(resultado, dict):
        return {"roteiro": resultado}

    return {"roteiro": str(resultado)}
