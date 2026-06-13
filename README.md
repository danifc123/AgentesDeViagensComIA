# ✈️ IAgent de Viagens

Um Assistente Inteligente de Viagens desenvolvido com **React** no frontend e **FastAPI + CrewAI** no backend. O sistema utiliza agentes de IA para pesquisar passagens, hotéis e clima, consolidando tudo em um Roteiro de Viagem personalizado dentro do seu orçamento.

## 📋 Pré-requisitos

Antes de iniciar, certifique-se de ter os seguintes itens instalados no seu computador:
- **Node.js** (para rodar o Frontend em React)
- **Python 3.10 ou superior** (para rodar a API e os Agentes no Backend)

---

## 🔐 Configuração das Chaves de API (Variáveis de Ambiente)

O coração do nosso sistema são os Agentes Inteligentes. Para que eles funcionem, você precisa fornecer as chaves de acesso (API Keys) dos modelos de linguagem.

1. Na pasta `backend`, crie um arquivo chamado **`.env`** (ou renomeie o `.env.example` caso exista).
2. O sistema utiliza a API da Anthropic (Claude 3.5 Sonnet) como cérebro dos Agentes. Abra o arquivo `.env` e insira as seguintes variáveis de ambiente:

```env
# Chave da API da Anthropic
ANTHROPIC_API_KEY=sk-ant-SuaChaveDeApiAqui

# Outras chaves necessárias pelos serviços MCP ou APIs Externas de Pesquisa
# (Adicione aqui quaisquer chaves do Amadeus, OpenWeather, etc., que os MCPs necessitem)
```

> **Aviso de Segurança:** NUNCA suba o seu arquivo `.env` com chaves reais para o GitHub. Este arquivo deve permanecer apenas no seu computador local. O arquivo `.gitignore` já está configurado para ignorar o `.env`.

---

## 🚀 Como Iniciar o Projeto

Para testar o projeto de ponta a ponta, você precisará de **dois terminais** abertos: um para o Backend e outro para o Frontend.

### Passo 1: Iniciando o Backend (API)

O backend é o responsável por receber o pedido e acionar os agentes do CrewAI.

1. Abra o Terminal 1 e navegue até a pasta `backend`:
   ```bash
   cd backend
   ```

2. Crie e ative um ambiente virtual (recomendado):
   - **No Windows:**
     ```bash
     python -m venv venv
     venv\Scripts\activate
     ```
   - **No Mac/Linux:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Instale as dependências do Python:
   ```bash
   pip install -r requirements.txt
   ```

4. Inicie o servidor FastAPI:
   ```bash
   uvicorn app.main:app --reload
   ```
   *Se tudo der certo, a API estará rodando em `http://localhost:8000`.*

---

### Passo 2: Iniciando o Frontend (Interface Web)

O frontend é o formulário interativo onde o usuário digita os dados da viagem.

1. Abra o Terminal 2 e navegue até a pasta `frontend`:
   ```bash
   cd frontend
   ```

2. Instale as dependências do Node (necessário apenas na primeira vez):
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento do Vite:
   ```bash
   npm run dev
   ```
   *Se tudo der certo, a Interface Web estará rodando em `http://localhost:5173`.*

---

## 🧪 Como Testar o Sistema

Com os dois terminais rodando (Backend e Frontend):

1. Acesse `http://localhost:5173` no seu navegador.
2. Você verá o painel **"IAgent de Viagens"**.
3. Preencha os campos, por exemplo:
   - **Origem:** São Paulo
   - **Destino:** Paris
   - **Data:** 15 de Dezembro
   - **Orçamento:** 15000
4. Clique em **"Gerar Meu Roteiro"**.
5. Aguarde o carregamento. Volte ao Terminal 1 (Backend) e veja os agentes conversando e pesquisando em tempo real (Graças à funcionalidade `verbose=True` do CrewAI).
6. O roteiro final maravilhoso será exibido formatado na sua tela!

Boa viagem! 🧳
