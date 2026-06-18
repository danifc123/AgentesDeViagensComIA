# 🧪 Guia de Testes E2E - IAgent de Viagens

## 1. Verificar se Backend e Frontend estão rodando

Abra 2 terminais:

### Terminal 1 — Backend
```powershell
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Você deve ver:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Terminal 2 — Frontend
```powershell
cd frontend
npm run dev
```

Você deve ver:
```
VITE v8.0.16 ready in ...ms
➜  Local:   http://localhost:5173/ (ou 5174 se 5173 estiver ocupada)
```

---

## 2. Testar via Navegador

1. Abra o navegador e acesse `http://localhost:5173` (ou a porta que o Vite indicou).
2. Preencha o formulário com dados de teste:
   - **Origem:** Rio de Janeiro
   - **Destino:** São Paulo
   - **Data:** 15 de Dezembro
   - **Orçamento:** 5000
3. Clique em **"Gerar Meu Roteiro"**.
4. Aguarde o carregamento. A resposta deve aparecer formatada em cards estruturados.

---

## 3. Testar via cURL (Teste de Backend)

Se quiser testar apenas o backend, use:

```powershell
$body = @{
    origem = "Rio de Janeiro"
    destino = "São Paulo"
    data = "15 de Dezembro"
    orcamento = 5000
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8000/gerar-roteiro" `
  -Method POST `
  -Headers @{"Content-Type" = "application/json"} `
  -Body $body
```

Você deve receber uma resposta JSON com estrutura similar a esta:

```json
{
  "roteiro": {
    "route": { "origin": "Rio de Janeiro", "destination": "São Paulo", ... },
    "climate": { "temperature": 18, "conditions": "Partly cloudy", ... },
    "flights": { "airline": "GOL", "price": 850, ... },
    "hotels": { "name": "Hotel Central", "total_price": 1050, ... },
    "budget": { "total": 5000, "used": 1900, "remaining": 3100, ... },
    "tips": [...]
  }
}
```

---

## 4. Troubleshooting

### Problema: "Nada aparece na tela"
- **Verifique o console do navegador** (F12 → Console).
- **Verifique se o backend está rodando**: acesse `http://localhost:8000` — você deve ver `{"message": "Bem-vindo à API do Assistente de Viagem"}`.
- **Verifique CORS**: logs do backend devem mostrar a requisição POST.

### Problema: "Erro 500 do backend"
- Verifique se as variáveis de ambiente estão definidas (`.env` no `backend/`).
- Verifique os logs do `uvicorn` para detalhes do erro.

### Problema: "Formulário não funciona"
- Verifique se o frontend consegue fazer requisições para `http://localhost:8000`.
- Confirme que não há bloqueios de CORS (backend já tem CORS habilitado para desenvolvimento).

---

## 5. O que Esperar

Quando tudo estiver funcionando corretamente:

1. **Formulário carrega** com campos para origem, destino, data e orçamento.
2. **Ao clicar em "Gerar Meu Roteiro"**:
   - Um spinner aparece indicando "Planejando..."
   - Backend processa a solicitação (você verá logs em Terminal 1).
   - Após ~5-30s, a resposta aparece no frontend estruturada em:
     - **Trip Summary**: origem → destino e data.
     - **Detalhes da Viagem**: resume rota e orçamento.
     - **Orçamento**: mostra gasto, restante e status.
     - **Clima**: temperatura, condições e recomendações.
     - **Melhores Voos**: tabela com opções de voo (selecionável).
     - **Hospedagem**: carousel/lista de hotéis (selecionável).
     - **Dicas & Recomendações**: dicas finais.

---

## 6. Reconfigurações Rápidas

Se as dependências não instalarem corretamente:

```powershell
# Frontend
cd frontend
npm install --legacy-peer-deps

# Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

---

Pronto! Se encontrar algum problema, verifique os logs no console do navegador e do terminal do backend. 🚀

