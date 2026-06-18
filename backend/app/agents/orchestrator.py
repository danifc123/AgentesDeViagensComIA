from crewai import Agent, Task, Crew, Process
from .researchers import criar_pesquisador_voos, criar_pesquisador_hoteis, criar_analista_clima, get_llm

def criar_orquestrador() -> Agent:
    return Agent(
        role='Orquestrador de Viagens e Orçamento',
        goal='Receber os dados brutos dos agentes pesquisadores e montar um Roteiro Final impecável e formatado, respeitando o orçamento.',
        backstory=(
            "Você é o Diretor de Roteiros da nossa agência de viagens. Você não faz pesquisas diretas. "
            "Sua especialidade é ler relatórios dos seus pesquisadores (voos, hotéis, atrações, clima) e "
            "criar uma proposta final de viagem incrivelmente bem escrita para o cliente, distribuindo o "
            "orçamento disponível de forma realista e inteligente."
        ),
        llm=get_llm(),
        verbose=True
    )

def criar_equipe_viagem(origem: str, destino: str, data: str, orcamento: float) -> Crew:
    # 1. Instanciar agentes
    agente_voos = criar_pesquisador_voos()
    agente_hoteis = criar_pesquisador_hoteis()
    agente_clima = criar_analista_clima()
    orquestrador = criar_orquestrador()

    # 2. Definir Tarefas (Tasks)
    tarefa_voos = Task(
        description=(
            f'Pesquisar passagens aéreas de {origem} para {destino} na data {data}. O orçamento TOTAL da viagem é R${orcamento}. '
            'Retorne APENAS UM OBJETO JSON válido com uma lista de opções de voo, onde cada voo tem: airline, price, currency, departure, arrival, duration, and purchase_url if available.'
        ),
        expected_output='JSON com lista de opções de voos: airline, price, currency, departure, arrival, duration e purchase_url.',
        agent=agente_voos
    )

    tarefa_hoteis = Task(
        description=(
            f'Pesquisar hotéis no destino {destino}. Para cada hotel, inclua: '
            'name, price_per_night, total_price para 3 noites, distance de uma atração chave, '
            'image (URL real da foto do hotel), booking_url (link para reservar o hotel), '
            'e até 3 atrações locais.'
            ' Retorne APENAS UM OBJETO JSON válido com uma lista de hotéis e seus atributos.'
        ),
        expected_output='JSON com lista de hotéis: name, price_per_night, total_price, distance, image, booking_url, attractions.',
        agent=agente_hoteis
    )

    tarefa_clima = Task(
        description=(
            f'Obter a previsão climática para {destino}. Retorne APENAS UM OBJETO JSON válido com os campos: location, temperature, feels_like, conditions, summary e recommendations (lista).'
        ),
        expected_output='JSON de clima com location, temperature, feels_like, conditions, summary e recommendations.',
        agent=agente_clima
    )

    tarefa_roteiro = Task(
        description=(
            f'O usuário quer viajar de {origem} para {destino} no dia {data} com um orçamento TOTAL de R${orcamento}. '
            'Usando os resultados de voos, hotéis e clima, gere APENAS UM OBJETO JSON válido com as seguintes chaves: '
            'route, climate, flights, hotels, budget e tips. '
            'route deve conter origem, destino, data e orçamento. '
            'budget deve conter total, used, remaining e status. '
            'tips deve ser uma lista de recomendações curtas. '
            'hotels deve incluir name, price_per_night, total_price, distance, image, booking_url e attractions. '
            'Não inclua texto fora do JSON. O JSON deve ser válido para ser renderizado pelo frontend.'
        ),
        expected_output='Um objeto JSON válido contendo: route, climate, flights, hotels (com image e booking_url), budget e tips.',
        agent=orquestrador,
        context=[tarefa_voos, tarefa_hoteis, tarefa_clima]
    )

    # 3. Montar a Crew com processo sequencial
    equipe = Crew(
        agents=[agente_voos, agente_hoteis, agente_clima, orquestrador],
        tasks=[tarefa_voos, tarefa_hoteis, tarefa_clima, tarefa_roteiro],
        process=Process.sequential,
        verbose=True
    )

    return equipe

def rodar_orquestracao(origem: str, destino: str, data: str, orcamento: float) -> str:
    """Função de entrada que será chamada pela API (Task 5)"""
    equipe = criar_equipe_viagem(origem, destino, data, orcamento)
    resultado = equipe.kickoff()
    return str(resultado)
