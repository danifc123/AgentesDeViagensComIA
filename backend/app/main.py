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

@app.post("/gerar-roteiro")
def gerar_roteiro(request: RoteiroRequest):
    resultado = rodar_orquestracao(
        origem=request.origem,
        destino=request.destino,
        data=request.data,
        orcamento=request.orcamento
    )
    return {"roteiro": resultado}
