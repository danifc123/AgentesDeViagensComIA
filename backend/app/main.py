from fastapi import FastAPI

app = FastAPI(title="Assistente de Viagem API")

@app.get("/")
def read_root():
    return {"message": "Bem-vindo à API do Assistente de Viagem"}
