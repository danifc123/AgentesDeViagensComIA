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
        description=f'Pesquisar passagens aéreas de {origem} para {destino} na data {data}. O orçamento TOTAL da viagem é R${orcamento}. Liste apenas os melhores voos.',
        expected_output='Lista com opções de voos (companhia, preço estimado, horário).',
        agent=agente_voos
    )

    tarefa_hoteis = Task(
        description=f'Pesquisar hotéis no destino {destino}. Após escolher, buscar na web atrações turísticas, restaurantes e feiras próximos aos hotéis encontrados.',
        expected_output='Lista com opções de hotéis (preço estimado) e dicas de locais interessantes (restaurantes/atrações) ao redor de cada um.',
        agent=agente_hoteis
    )

    tarefa_clima = Task(
        description=f'Obter a previsão climática para {destino}. Baseado nisso, sugira o que levar na mala.',
        expected_output='Resumo do clima e recomendações práticas de vestuário e preparo.',
        agent=agente_clima
    )

    tarefa_roteiro = Task(
        description=(
            f'O usuário quer viajar de {origem} para {destino} no dia {data} com um orçamento TOTAL de R${orcamento}. '
            'Usando os resultados de voos, hotéis/atrações e clima, crie o Roteiro de Viagem definitivo em formato Markdown. '
            'Calcule o custo estimado parcial (voos + hotel) e demonstre se está dentro do orçamento.'
        ),
        expected_output='Um documento final (Markdown) contendo: Clima, Opções de Voos, Hospedagem com Atrações Próximas, e Análise de Orçamento.',
        agent=orquestrador,
        context=[tarefa_voos, tarefa_hoteis, tarefa_clima] # Essa tarefa espera as outras terminarem para pegar o contexto
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
