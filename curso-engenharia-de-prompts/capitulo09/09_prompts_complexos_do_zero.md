# Capítulo 09: Criando Prompts Complexos do Zero

Bem-vindo ao Capítulo 9, o ponto culminante de sua jornada na engenharia de prompts até agora! Nos capítulos anteriores, exploramos diversas técnicas isoladamente. Agora, aprenderemos como consolidar e combinar esses métodos – como atribuição de papéis, instruções claras, formatação de saída, exemplos few-shot, pensamento passo a passo e pré-preenchimento – para construir prompts complexos e robustos, capazes de lidar com tarefas multifacetadas e sofisticadas. Este capítulo guiará você através de uma abordagem estruturada para projetar esses prompts avançados do zero.

- [Lição: Construindo um Prompt Complexo](#licao)
- [Exemplo 1: Chatbot de Orientação Profissional](#exemplo-chatbot-carreira)
- [Exemplo 2: Serviços Jurídicos](#exemplo-servicos-juridicos)
- [Exercícios](#exercicios)
- [Conclusão do Capítulo](#conclusao-capitulo)
- [Parabéns e Próximos Passos! (Conclusão do Curso)](#conclusao-curso)
- [Playground de Exemplos](#playground-de-exemplos)


## <a name="configuracao"></a>Configuração

Execute a célula de configuração a seguir para carregar sua chave de API e estabelecer a função auxiliar `get_completion`.

> **Nota:** O comando `!pip install anthropic` é para instalar a biblioteca em ambientes Jupyter. Os comandos `%store -r API_KEY` e `%store -r MODEL_NAME` são específicos do IPython. Em um script Python padrão, defina `API_KEY` e `MODEL_NAME` diretamente. A função `get_completion` utilizada neste capítulo é a mesma dos Capítulos 5-8, que sempre inclui um turno de `assistant` com o conteúdo de `prefill` (mesmo que vazio), crucial para guiar o início de respostas estruturadas em prompts complexos.

```python
# Importa a biblioteca de expressões regulares embutida do Python
import re
import anthropic

# Recupere ou defina suas variáveis API_KEY e MODEL_NAME aqui
# Exemplo (substitua pelos seus valores reais ou carregue do %store se estiver em Jupyter):
# API_KEY = "sua_chave_api_aqui"
# MODEL_NAME = "claude-3-haiku-20240307"

# Inicialize o cliente Anthropic uma vez.
# Certifique-se de que API_KEY está definida.
# client = anthropic.Anthropic(api_key=API_KEY)

def get_completion(prompt_do_usuario: str, system_prompt="", prefill=""):
    if 'client' not in globals() or not isinstance(client, anthropic.Anthropic):
        print("Erro: O cliente Anthropic (client) não foi inicializado corretamente.")
        return "Erro de configuração: cliente não definido."
    if 'MODEL_NAME' not in globals() or not MODEL_NAME:
        print("Erro: A variável MODEL_NAME não foi definida.")
        return "Erro de configuração: nome do modelo não definido."

    try:
        # Nota: O turno do assistente é incluído mesmo se prefill for uma string vazia.
        messages_to_send = [
            {"role": "user", "content": prompt_do_usuario},
            {"role": "assistant", "content": prefill}
        ]

        message_request = {
            "model": MODEL_NAME,
            "max_tokens": 2000,
            "temperature": 0.0,
            "messages": messages_to_send
        }
        if system_prompt:
            message_request["system"] = system_prompt

        response_message = client.messages.create(**message_request)
        return response_message.content[0].text
    except Exception as e:
        print(f"Erro ao chamar a API da Anthropic: {e}")
        return f"Erro na API: {e}"
```
*(Os exemplos de código subsequentes assumirão que `client` e `MODEL_NAME` foram devidamente configurados e que `get_completion` está definida como acima).*

---

## <a name="licao"></a>Lição: Construindo um Prompt Complexo

Parabéns por chegar ao último capítulo principal! Agora é hora de juntar tudo e aprender como **criar prompts únicos e complexos**. Este processo é muitas vezes iterativo e envolve a combinação de várias técnicas que exploramos nos capítulos anteriores.

Abaixo, você verá uma **estrutura guiada que recomendamos para prompts complexos**. Esta estrutura não é rígida, mas oferece um bom ponto de partida e uma maneira de organizar seus pensamentos ao construir um prompt elaborado. Em partes posteriores deste capítulo, mostraremos alguns prompts específicos da indústria e explicaremos como esses prompts são estruturados de forma semelhante.

**Nota:** **Nem todo prompt precisa de todos os elementos da seguinte estrutura complexa**. Incentivamos você a experimentar, incluir ou excluir elementos e ver como isso afeta a resposta de Claude. Geralmente, é **melhor usar muitos elementos de prompt para fazer seu prompt funcionar primeiro, depois refinar e simplificar seu prompt** para otimizar o desempenho e o custo (contagem de tokens).

### Elementos de um Prompt Complexo

Um prompt complexo pode ser decomposto nos seguintes elementos principais. A ordem pode ser flexível para alguns, mas a estrutura geral abaixo (e a ordem em que são combinados no código dos exemplos) é um bom guia:

1.  **`TASK_CONTEXT` (Contexto da Tarefa):** Defina o papel de Claude e o objetivo geral da interação. (Capítulo 03: Atribuindo Papéis)
2.  **`TONE_CONTEXT` (Contexto de Tom):** Especifique o tom desejado para a resposta de Claude. (Capítulo 02: Clareza e Objetividade, Capítulo 05: Formatando Saída)
3.  **`TASK_DESCRIPTION` (Descrição Detalhada da Tarefa e Regras):** Detalhe as ações específicas que Claude deve realizar e quaisquer regras, restrições ou "saídas" (o que fazer se não souber a resposta). (Capítulo 02: Clareza e Objetividade, Capítulo 08: Evitando Alucinações)
4.  **`EXAMPLES` (Exemplos - Few-Shot Prompting):** Forneça um ou mais exemplos de interações ideais, incluindo como lidar com casos extremos ou como usar um "scratchpad". Envolva exemplos em tags como `<example></example>`. (Capítulo 07: Usando Exemplos)
5.  **`INPUT_DATA` (Dados de Entrada para Processamento):** Inclua os dados que Claude precisa processar (ex: texto de um email, histórico da conversa, documento), idealmente delimitados por tags XML. (Capítulo 04: Separando Dados e Instruções)
6.  **`IMMEDIATE_TASK` (Descrição da Tarefa Imediata):** "Lembre" Claude do que ele deve fazer imediatamente com os dados fornecidos. É bom colocar a pergunta do usuário ou a instrução final mais perto do final do prompt.
7.  **`PRECOGNITION` (Pensamento Passo a Passo / Scratchpad):** Instrua Claude a pensar passo a passo, talvez usando um "scratchpad" (ex: `<scratchpad>...</scratchpad>`), antes de dar a resposta final. (Capítulo 06: Precognição)
8.  **`OUTPUT_FORMATTING` (Formatação da Saída):** Especifique claramente o formato desejado para a resposta (ex: JSON, XML com tags específicas, Markdown). (Capítulo 05: Formatando Saída)
9.  **`PREFILL` (Pré-preenchimento da Resposta):** Inicie a resposta do assistente para guiar Claude na direção correta, especialmente para formatos estruturados. (Capítulo 05: Formatando Saída)

*(O décimo elemento, `user role`, é implicitamente o início de qualquer prompt enviado à API Messages, mas é bom lembrar que a estrutura geral da API é baseada em turnos de usuário e assistente).*

A seguir, veremos como esses elementos se unem em exemplos práticos.

---
## <a name="exemplo-chatbot-carreira"></a>Exemplo 1: Chatbot de Orientação Profissional

Para o exemplo a seguir, construiremos um prompt para um roleplay controlado em que Claude assume um papel situacional com uma tarefa específica. Nosso objetivo é instruir Claude a agir como um orientador profissional amigável chamado Joe.

O código no notebook original monta o prompt a partir de vários componentes definidos como variáveis Python. Vamos descrever o conteúdo traduzido de cada componente e, em seguida, como eles seriam combinados.

**Variáveis de Entrada (Dados Dinâmicos):**
-   `HISTORY`: O histórico da conversa até o momento.
-   `QUESTION`: A pergunta atual do usuário.

**Componentes do Prompt (Elementos Estáticos e Templates):**

1.  **`TASK_CONTEXT` (Contexto da Tarefa):**
    *   Conteúdo: "Você atuará como um orientador profissional de IA chamado Joe, criado pela empresa AdAstra Careers. Seu objetivo é dar aconselhamento profissional aos usuários. Você responderá a usuários que estão no site da AdAstra e que ficarão confusos se você não responder no personagem de Joe."
    *   *Propósito:* Define o papel de Claude e o objetivo geral.

2.  **`TONE_CONTEXT` (Contexto de Tom):**
    *   Conteúdo: "Você deve manter um tom amigável de atendimento ao cliente."
    *   *Propósito:* Especifica o estilo de comunicação.

3.  **`TASK_DESCRIPTION` (Descrição Detalhada da Tarefa e Regras):**
    *   Conteúdo: "Aqui estão algumas regras importantes para a interação:\n- Sempre permaneça no personagem, como Joe, uma IA da AdAstra Careers\n- Se não tiver certeza de como responder, diga \"Desculpe, não entendi. Você poderia reformular sua pergunta?\"\n- Se alguém perguntar algo irrelevante, diga, \"Desculpe, sou Joe e dou aconselhamento profissional. Você tem alguma pergunta sobre carreira hoje com a qual posso ajudar?\""
    *   *Propósito:* Fornece regras de comportamento e como lidar com exceções.

4.  **`EXAMPLES` (Exemplos - Few-Shot):**
    *   Conteúdo: "Aqui está um exemplo de como responder em uma interação padrão:\n<example>\nCliente: Oi, como você foi criado e o que você faz?\nJoe: Olá! Meu nome é Joe, e fui criado pela AdAstra Careers para dar aconselhamento profissional. Com o que posso te ajudar hoje?\n</example>"
    *   *Propósito:* Mostra um exemplo de diálogo para Claude imitar.

5.  **`INPUT_DATA_TEMPLATE` (Template para Dados de Entrada):**
    *   Conteúdo (como um f-string template): `f"""Aqui está o histórico da conversa (entre o usuário e você) anterior à pergunta. Pode estar vazio se não houver histórico:\n<history>\n{HISTORY}\n</history>\n\nAqui está a pergunta do usuário:\n<question>\n{QUESTION}\n</question>"""`
    *   *Propósito:* Estrutura como os dados dinâmicos (histórico e pergunta atual) serão inseridos no prompt, usando tags XML para clareza.

6.  **`IMMEDIATE_TASK` (Descrição da Tarefa Imediata):**
    *   Conteúdo: "Como você responde à pergunta do usuário?"
    *   *Propósito:* Foca Claude na ação imediata a ser tomada.

7.  **`PRECOGNITION` (Pensamento Passo a Passo):**
    *   Conteúdo: "Pense sobre sua resposta primeiro antes de responder."
    *   *Propósito:* Encoraja um processamento mais deliberado, embora um scratchpad explícito não seja solicitado aqui.

8.  **`OUTPUT_FORMATTING` (Formatação da Saída):**
    *   Conteúdo: "Coloque sua resposta nas tags <response></response>."
    *   *Propósito:* Especifica o formato da saída final.

9.  **`PREFILL` (Pré-preenchimento da Resposta para o Turno do Assistente):**
    *   Conteúdo: "[Joe] <response>"
    *   *Propósito:* Garante que Claude comece respondendo como "Joe" e já inicie a tag de resposta solicitada.

**Prompt Completo Combinado (Exemplo):**
> **Nota:** O código abaixo mostra a montagem do prompt completo para o chatbot de orientação profissional, usando os componentes traduzidos. As variáveis `HISTORY` e `QUESTION` seriam preenchidas com dados reais em uma aplicação. (Lembre-se de ter `API_KEY` e `MODEL_NAME` configurados e `client` inicializado para executar.)
```python
# --- Variáveis de Entrada (Exemplo) ---
HISTORY_EX1 = """Cliente: Quais são duas possíveis carreiras para quem se forma em sociologia?

Joe: Aqui estão duas carreiras potenciais para quem se forma em sociologia:

- Assistente social - A sociologia fornece uma base sólida para entender o comportamento humano e os sistemas sociais. Com treinamento ou certificação adicional, um diploma de sociologia pode qualificar graduados para funções como assistentes sociais, gestores de caso, conselheiros e organizadores comunitários, ajudando indivíduos e grupos.

- Especialista em recursos humanos - A compreensão da dinâmica de grupo e do comportamento organizacional da sociologia é aplicável a carreiras em recursos humanos. Os graduados podem encontrar funções em recrutamento, relações com funcionários, treinamento e desenvolvimento, diversidade e inclusão e outras funções de RH. O foco em estruturas e instituições sociais também apoia carreiras relacionadas em políticas públicas, gestão de organizações sem fins lucrativos e educação."""
QUESTION_EX1 = "Qual das duas carreiras exige mais do que um diploma de Bacharel?"

# --- Componentes do Prompt Traduzidos (conforme definido na explanação acima) ---
TASK_CONTEXT_EX1 = "Você atuará como um orientador profissional de IA chamado Joe, criado pela empresa AdAstra Careers. Seu objetivo é dar aconselhamento profissional aos usuários. Você responderá a usuários que estão no site da AdAstra e que ficarão confusos se você não responder no personagem de Joe."
TONE_CONTEXT_EX1 = "Você deve manter um tom amigável de atendimento ao cliente."
TASK_DESCRIPTION_EX1 = """Aqui estão algumas regras importantes para a interação:
- Sempre permaneça no personagem, como Joe, uma IA da AdAstra Careers
- Se não tiver certeza de como responder, diga \"Desculpe, não entendi. Você poderia reformular sua pergunta?\"
- Se alguém perguntar algo irrelevante, diga, \"Desculpe, sou Joe e dou aconselhamento profissional. Você tem alguma pergunta sobre carreira hoje com a qual posso ajudar?\""""
EXAMPLES_EX1 = """Aqui está um exemplo de como responder em uma interação padrão:
<example>
Cliente: Oi, como você foi criado e o que você faz?
Joe: Olá! Meu nome é Joe, e fui criado pela AdAstra Careers para dar aconselhamento profissional. Com o que posso te ajudar hoje?
</example>"""
INPUT_DATA_TEMPLATE_EX1 = """Aqui está o histórico da conversa (entre o usuário e você) anterior à pergunta. Pode estar vazio se não houver histórico:
<history>
{HISTORY}
</history>

Aqui está a pergunta do usuário:
<question>
{QUESTION}
</question>"""
IMMEDIATE_TASK_EX1 = "Como você responde à pergunta do usuário?"
PRECOGNITION_EX1 = "Pense sobre sua resposta primeiro antes de responder."
OUTPUT_FORMATTING_EX1 = "Coloque sua resposta nas tags <response></response>."
PREFILL_EX1 = "[Joe] <response>"

# --- Montagem do Prompt ---
PROMPT_CARREIRA_COMPLETO = f"{TASK_CONTEXT_EX1}\n\n{TONE_CONTEXT_EX1}\n\n{TASK_DESCRIPTION_EX1}\n\n{EXAMPLES_EX1}\n\n"
PROMPT_CARREIRA_COMPLETO += INPUT_DATA_TEMPLATE_EX1.format(HISTORY=HISTORY_EX1, QUESTION=QUESTION_EX1)
PROMPT_CARREIRA_COMPLETO += f"\n\n{IMMEDIATE_TASK_EX1}\n\n{PRECOGNITION_EX1}\n\n{OUTPUT_FORMATTING_EX1}"

# --- Execução (simulada) ---
# print("--------------------------- Prompt Completo (Chatbot de Carreira) ---------------------------")
# print("TURNO DO USUÁRIO:")
# print(PROMPT_CARREIRA_COMPLETO)
# print("\nTURNO DO ASSISTENTE (Pré-preenchido):")
# print(PREFILL_EX1)
# print("\n------------------------------------- Resposta do Claude ------------------------------------")
# # Lembre-se que get_completion retorna o texto APÓS o prefill.
# # A resposta completa do assistente seria PREFILL_EX1 + o que get_completion retorna.
# resposta_gerada_ex1 = get_completion(PROMPT_CARREIRA_COMPLETO, prefill=PREFILL_EX1)
# print(PREFILL_EX1 + resposta_gerada_ex1)
```

---
## <a name="exemplo-servicos-juridicos"></a>Exemplo 2: Serviços Jurídicos

**Prompts na área jurídica podem ser bastante complexos** devido à necessidade de:
- Analisar longos documentos.
- Lidar com tópicos complexos.
- Formatar a saída de maneiras muito específicas.
- Seguir processos analíticos de várias etapas.

Vejamos como podemos usar o modelo de prompt complexo para estruturar um prompt para um caso de uso jurídico específico. Abaixo, detalhamos um prompt de exemplo para um caso de uso jurídico em que pedimos a Claude para responder a perguntas sobre uma questão legal usando informações de um documento jurídico.

**Alteramos a ordem de alguns elementos** em relação ao exemplo anterior para mostrar que a estrutura do prompt pode ser flexível e adaptada à tarefa!

**A engenharia de prompts envolve tentativa e erro científicos**. Incentivamos você a misturar e combinar, mover as coisas (os elementos onde a ordem não importa tanto) e ver o que funciona melhor para você e suas necessidades.

**Variáveis de Entrada (Dados Dinâmicos):**
-   `LEGAL_RESEARCH`: O documento jurídico (trechos de pesquisa) a ser analisado.
-   `QUESTION`: A pergunta específica do usuário sobre o documento.

**Componentes do Prompt (Elementos) para o Exemplo Jurídico:**
(A ordem de combinação no prompt final será diferente da lista numerada abaixo, conforme mostrado no código Python do notebook original)
1.  **`TASK_CONTEXT_LEGAL`:** "Você é um advogado especialista." (Define o papel)
2.  **`INPUT_DATA_LEGAL_TEMPLATE`:** Template para inserir `{LEGAL_RESEARCH}` dentro de tags `<legal_research>`. (Fornece os dados primários)
3.  **`EXAMPLES_LEGAL`:** Mostra como citar os resultados da pesquisa (ex: "... [1]."). (Guia a formatação da citação)
4.  **`TASK_DESCRIPTION_LEGAL_TEMPLATE`:** Template para inserir a `{QUESTION}` e instrui Claude a escrever uma resposta concisa, ou dizer que não tem informação suficiente. (Define a tarefa principal e a "saída")
5.  **`PRECOGNITION_LEGAL`:** "Antes de responder, extraia as citações mais relevantes da pesquisa em tags `<relevant_quotes>`." (Instrui o pensamento passo a passo / scratchpad).
6.  **`OUTPUT_FORMATTING_LEGAL`:** "Coloque sua resposta de dois parágrafos nas tags `<answer>`." (Define o formato da resposta final).
7.  **`PREFILL_LEGAL`:** "`<relevant_quotes>`" (Inicia a resposta do assistente com o scratchpad, forçando o passo de precognição).

**Prompt Completo Combinado (Exemplo Jurídico):**
> **Nota:** O código abaixo mostra a montagem do prompt completo para o exemplo de serviços jurídicos. As variáveis `LEGAL_RESEARCH` e `QUESTION` seriam preenchidas com dados reais. O documento `LEGAL_RESEARCH` é extenso e está abreviado aqui para fins de demonstração.
```python
# --- Variáveis de Entrada (Exemplo) ---
LEGAL_RESEARCH_EX2 = """<search_results>
<search_result id=1>
A indústria de saúde animal envolveu-se em várias ações judiciais de patentes e marcas registradas durante o ano passado... (conteúdo original do notebook abreviado)
</search_result>
<search_result id=2>
No Canadá, a Associação Médica Veterinária da Colúmbia Britânica processou um não veterinário... (conteúdo original do notebook abreviado)
</search_result>
<search_result id=3>
O rescaldo do furacão Katrina... estimulou mudanças na forma como os animais são tratados durante desastres naturais. Em 2006, Havaí, Louisiana e New Hampshire promulgaram leis... permitindo que animais de serviço sejam mantidos com as pessoas a quem servem... O Congresso aprovou... o Pet Evacuation and Transportation Standards Act... que exige que as autoridades estaduais e locais de preparação para emergências incluam em seus planos de evacuação informações sobre como acomodarão animais de estimação domésticos e animais de serviço em caso de desastre.
</search_result>
</search_results>"""
QUESTION_LEGAL_EX2 = "Existem leis sobre o que fazer com animais de estimação durante um furacão?"

# --- Componentes do Prompt Traduzidos (Exemplo Jurídico) ---
TASK_CONTEXT_LEGAL_EX2 = "Você é um advogado especialista."
INPUT_DATA_LEGAL_TEMPLATE_EX2 = """Aqui estão algumas pesquisas que foram compiladas. Use-as para responder a uma pergunta jurídica do usuário.
<legal_research>
{LEGAL_RESEARCH}
</legal_research>"""
EXAMPLES_LEGAL_EX2 = """Ao citar a pesquisa jurídica em sua resposta, por favor, use colchetes contendo o ID do índice da pesquisa, seguido por um ponto. Coloque-os no final da frase que está fazendo a citação. Exemplos de formato de citação adequado:

<examples>
<example>
O estatuto de limitações expira após 10 anos para crimes como este. [3].
</example>
<example>
No entanto, a proteção não se aplica quando foi especificamente renunciada por ambas as partes. [5].
</example>
</examples>"""
TASK_DESCRIPTION_LEGAL_TEMPLATE_EX2 = """Escreva uma resposta clara e concisa para esta pergunta:

<question>
{QUESTION}
</question>

Não deve ter mais do que alguns parágrafos. Se possível, deve concluir com uma única frase respondendo diretamente à pergunta do usuário. No entanto, se não houver informação suficiente na pesquisa compilada para produzir tal resposta, você pode hesitar e escrever "Desculpe, não tenho informação suficiente à mão para responder a esta pergunta."."""
PRECOGNITION_LEGAL_EX2 = "Antes de responder, extraia as citações mais relevantes da pesquisa em tags <relevant_quotes>."
OUTPUT_FORMATTING_LEGAL_EX2 = "Coloque sua resposta de dois parágrafos nas tags <answer>."
PREFILL_LEGAL_EX2 = "<relevant_quotes>" # Força Claude a começar pelo scratchpad

# --- Montagem do Prompt (Ordem diferente, conforme notebook original) ---
PROMPT_LEGAL_COMPLETO = f"{TASK_CONTEXT_LEGAL_EX2}\n\n"
PROMPT_LEGAL_COMPLETO += INPUT_DATA_LEGAL_TEMPLATE_EX2.format(LEGAL_RESEARCH=LEGAL_RESEARCH_EX2) # Dados primeiro
PROMPT_LEGAL_COMPLETO += f"\n\n{EXAMPLES_LEGAL_EX2}\n\n" # Exemplos de citação
PROMPT_LEGAL_COMPLETO += TASK_DESCRIPTION_LEGAL_TEMPLATE_EX2.format(QUESTION=QUESTION_LEGAL_EX2) # Descrição da tarefa (inclui a pergunta)
PROMPT_LEGAL_COMPLETO += f"\n\n{PRECOGNITION_LEGAL_EX2}\n\n{OUTPUT_FORMATTING_LEGAL_EX2}" # Instruções de precognição e formatação final

# --- Execução (simulada) ---
# print("--------------------------- Prompt Completo (Serviços Jurídicos) ---------------------------")
# print("TURNO DO USUÁRIO:")
# print(PROMPT_LEGAL_COMPLETO)
# print("\nTURNO DO ASSISTENTE (Pré-preenchido):")
# print(PREFILL_LEGAL_EX2)
# print("\n------------------------------------- Resposta do Claude ------------------------------------")
# resposta_gerada_ex2 = get_completion(PROMPT_LEGAL_COMPLETO, prefill=PREFILL_LEGAL_EX2)
# print(PREFILL_LEGAL_EX2 + resposta_gerada_ex2)
```

---
## <a name="exercicios"></a>Exercícios

Agora é sua vez de aplicar o que aprendeu e construir prompts complexos do zero! Os exercícios abaixo são abertos e pedem que você preencha os vários elementos de um prompt complexo para diferentes tarefas, usando a estrutura de 10 elementos como um guia.

### Exercício 9.1 - Chatbot de Serviços Financeiros
Prompts na área financeira também podem ser bastante complexos. Neste exercício, Claude deve analisar um trecho do código tributário para responder a uma pergunta específica.

**Sua tarefa:** Preencha as strings vazias dos componentes do prompt (`TASK_CONTEXT_FIN`, `TONE_CONTEXT_FIN`, etc.) no bloco de código Python abaixo. Use os exemplos anteriores e a lista de 10 elementos como guia para criar um prompt robusto. O objetivo é que Claude responda corretamente à `QUESTION_FINANCE` usando o `TAX_CODE_FINANCE`.

> **Nota do Exercício:** Pense em qual papel Claude deve assumir (ex: "consultor fiscal"), o tom, como ele deve usar o documento (talvez extrair citações relevantes em um scratchpad), se exemplos de como responder seriam úteis, e qual o formato de saída desejado. O notebook original fornece uma solução possível que pode ser visualizada com `from hints import exercise_9_1_solution`.
```python
# --- Variáveis de Entrada (Fornecidas no Notebook) ---
QUESTION_FINANCE = "Quanto tempo eu tenho para fazer uma eleição 83b?"
# Original: "How long do I have to make an 83b election?"

TAX_CODE_FINANCE = """
(a)Regra geral
Se, em conexão com a prestação de serviços, propriedade é transferida para qualquer pessoa que não seja a pessoa para quem tais serviços são prestados...
(b)Eleição para incluir na renda bruta no ano da transferência
(1)Em geral
Qualquer pessoa que preste serviços em conexão com os quais propriedade é transferida para qualquer pessoa pode eleger incluir em sua renda bruta...
(2)Eleição
Uma eleição sob o parágrafo (1) com respeito a qualquer transferência de propriedade deve ser feita da maneira que o Secretário prescrever e deve ser feita não depois de 30 dias após a data de tal transferência...
(Restante do código tributário omitido para brevidade, mas presente no notebook original)
"""

# --- Componentes do Prompt (Preencha com suas ideias) ---
TASK_CONTEXT_FIN = "Você é um assistente virtual especializado em legislação tributária, ajudando usuários a entender seções do código fiscal." # Exemplo
TONE_CONTEXT_FIN = "Seu tom deve ser profissional, preciso e fácil de entender para um leigo." # Exemplo
INPUT_DATA_FIN_TEMPLATE = """Analise o seguinte trecho do código tributário para responder à pergunta do usuário.
<tax_code>
{TAX_CODE}
</tax_code>

Pergunta do usuário:
<question>
{QUESTION}
</question>""" # Exemplo
EXAMPLES_FIN = """<example>
Pergunta: Qual a penalidade por atraso?
Resposta (se no texto): <scratchpad>A seção X.Y diz: "A penalidade por atraso é de 5%".</scratchpad><answer>A penalidade por atraso é de 5% conforme a seção X.Y.</answer>
</example>
<example>
Pergunta: Onde se localiza a Disneylândia?
Resposta (se a info não estiver no texto): <scratchpad>O documento fornecido é um código tributário e não contém informações sobre a localização da Disneylândia.</scratchpad><answer>Desculpe, o documento fornecido não contém informações sobre a localização da Disneylândia.</answer>
</example>""" # Exemplo
TASK_DESCRIPTION_FIN = "Responda à pergunta do usuário baseando-se estritamente no código tributário fornecido. Cite a seção relevante que fundamenta sua resposta." # Exemplo
IMMEDIATE_TASK_FIN = "Responda à pergunta do usuário sobre o prazo para a eleição 83b." # Exemplo
PRECOGNITION_FIN = "Antes de responder, localize a seção exata do código tributário que trata da eleição mencionada e do seu prazo. Coloque a citação relevante e sua análise em tags <scratchpad>." # Exemplo
OUTPUT_FORMATTING_FIN = "Forneça sua resposta final em tags <answer>, começando com uma citação direta da seção relevante do código, se encontrada." # Exemplo
PREFILL_FIN = "<scratchpad>" # Exemplo

# --- Montagem do Prompt (Use os componentes que você definiu) ---
# PROMPT_FINANCEIRO_EX = f"{TASK_CONTEXT_FIN}\n\n{TONE_CONTEXT_FIN}\n\n"
# PROMPT_FINANCEIRO_EX += INPUT_DATA_FIN_TEMPLATE.format(TAX_CODE=TAX_CODE_FINANCE, QUESTION=QUESTION_FINANCE)
# PROMPT_FINANCEIRO_EX += f"\n\n{EXAMPLES_FIN}\n\n{TASK_DESCRIPTION_FIN}\n\n{IMMEDIATE_TASK_FIN}\n\n{PRECOGNITION_FIN}\n\n{OUTPUT_FORMATTING_FIN}"

# --- Execução (simulada) ---
# print("--------------------------- Prompt Completo (Chatbot Financeiro - Exercício) ---------------------------")
# print("TURNO DO USUÁRIO:")
# print(PROMPT_FINANCEIRO_EX)
# print("\nTURNO DO ASSISTENTE (Pré-preenchido):")
# print(PREFILL_FIN)
# print("\n------------------------------------- Resposta do Claude ------------------------------------")
# resposta_gerada_fin_ex = get_completion(PROMPT_FINANCEIRO_EX, prefill=PREFILL_FIN)
# print(PREFILL_FIN + resposta_gerada_fin_ex)
```

❓ Se você quiser ver uma possível solução para o Exercício 9.1, o notebook original permite importá-la com `from hints import exercise_9_1_solution; print(exercise_9_1_solution)`. Analise-a para ver uma forma de preencher os elementos do prompt.

### Exercício 9.2 - Codebot
Neste exercício, escreveremos um prompt para um **bot de assistência e ensino de programação que lê código e oferece correções orientadoras quando apropriado**. Preencha os campos dos elementos do prompt com conteúdo que corresponda à descrição e aos exemplos que você viu.

Sugerimos que você leia o conteúdo da variável (`{CODE}`) para entender com qual conteúdo Claude deverá trabalhar.

> **Nota do Exercício:** O objetivo é criar um prompt complexo para um "Codebot". Claude deve analisar o `{CODE}` fornecido (que contém um erro de divisão por zero em um loop), explicar o erro e sugerir uma correção. Pense em qual papel Claude deve assumir (ex: "um programador Python sênior e instrutor paciente"), como ele deve analisar o código (talvez passo a passo em um scratchpad), se deve fornecer exemplos de código corrigido, qual tom usar, etc. Use os 10 elementos de prompt como guia. O notebook original também fornece uma solução para este com `from hints import exercise_9_2_solution`.
```python
# --- Variável de Entrada (Fornecida no Notebook) ---
CODE_INPUT_EX9_2 = """
# Função para imprimir inversos multiplicativos
def print_multiplicative_inverses(x, n):
  for i in range(n): # O loop começa com i=0
    print(x / i) # Potencial erro de Divisão por Zero aqui
"""

# --- Componentes do Prompt (Preencha com suas ideias) ---
TASK_CONTEXT_CODE_EX9_2 = "Você é um Codebot, um assistente de IA amigável e experiente, especializado em depurar e explicar código Python para programadores iniciantes." # Exemplo
TONE_CONTEXT_CODE_EX9_2 = "Seu tom deve ser encorajador, claro e didático. Evite jargões complexos sem explicação." # Exemplo
INPUT_DATA_CODE_TEMPLATE_EX9_2 = "Por favor, analise o seguinte trecho de código Python fornecido pelo usuário:\n<code>\n{CODE}\n</code>" # Exemplo
TASK_DESCRIPTION_CODE_EX9_2 = """Identifique quaisquer erros potenciais ou bugs no código.
Explique o problema de forma compreensível, indicando a linha problemática.
Sugira uma ou mais maneiras de corrigir o código, mostrando o código corrigido e explicando a correção.
Se não houver erros óbvios, elogie o código e talvez sugira pequenas melhorias de estilo ou eficiência, se aplicável.""" # Exemplo
IMMEDIATE_TASK_CODE_EX9_2 = "Analise o código fornecido, identifique problemas (especialmente exceções em tempo de execução como Divisão por Zero) e sugira correções com explicações." # Exemplo
PRECOGNITION_CODE_EX9_2 = """Pense passo a passo sobre o código em tags <scratchpad>:
1. Qual é o propósito aparente da função?
2. Analise o loop: quais são os valores de 'i' durante a iteração?
3. Existe algum valor de 'i' que possa causar problemas na operação 'x / i'? Identifique a linha.
4. Se sim, qual é o nome do erro/exceção que ocorreria? Como ele pode ser evitado ou tratado?
5. Formule uma explicação clara do problema e uma ou mais sugestões de código corrigido.
</scratchpad>""" # Exemplo
OUTPUT_FORMATTING_CODE_EX9_2 = "Formate sua resposta com: 1. Uma explicação clara do problema encontrado. 2. O código corrigido em um bloco de código Markdown. 3. Uma breve explicação da correção." # Exemplo
PREFILL_CODE_EX9_2 = "<scratchpad>" # Exemplo

# --- Montagem do Prompt (Exemplo de como você pode montar) ---
# PROMPT_CODEBOT_EX = f"{TASK_CONTEXT_CODE_EX9_2}\n\n{TONE_CONTEXT_CODE_EX9_2}\n\n"
# PROMPT_CODEBOT_EX += INPUT_DATA_CODE_TEMPLATE_EX9_2.format(CODE=CODE_INPUT_EX9_2)
# PROMPT_CODEBOT_EX += f"\n\n{TASK_DESCRIPTION_CODE_EX9_2}\n\n{IMMEDIATE_TASK_CODE_EX9_2}\n\n{PRECOGNITION_CODE_EX9_2}\n\n{OUTPUT_FORMATTING_CODE_EX9_2}"

# --- Execução (simulada) ---
# print("--------------------------- Prompt Completo (Codebot - Exercício) ---------------------------")
# print("TURNO DO USUÁRIO:")
# print(PROMPT_CODEBOT_EX)
# print("\nTURNO DO ASSISTENTE (Pré-preenchido):")
# print(PREFILL_CODE_EX9_2)
# print("\n------------------------------------- Resposta do Claude ------------------------------------")
# resposta_gerada_code_ex = get_completion(PROMPT_CODEBOT_EX, prefill=PREFILL_CODE_EX9_2)
# print(PREFILL_CODE_EX9_2 + resposta_gerada_code_ex)
```

❓ Se você quiser ver uma possível solução para o Exercício 9.2, o notebook original permite importá-la com `from hints import exercise_9_2_solution; print(exercise_9_2_solution)`.

---
## <a name="conclusao-capitulo"></a>Conclusão do Capítulo

Dominar a arte de construir prompts complexos do zero, como demonstrado com os chatbots de orientação profissional e serviços jurídicos, e praticado nos exercícios, envolve uma abordagem metódica. Ao decompor a tarefa, aplicar seletivamente as técnicas de engenharia de prompt que você aprendeu (papel, tom, regras, exemplos, delimitação de dados, tarefa imediata, pensamento passo a passo, formatação de saída e pré-preenchimento) e iterar em seu design, você pode instruir Claude a realizar tarefas notavelmente sofisticadas e a fornecer saídas altamente estruturadas e úteis. Lembre-se de que a estrutura de 10 elementos é um guia; adapte-a às suas necessidades específicas.

Com estas habilidades, você está bem equipado para explorar os apêndices ou começar a criar seus próprios prompts avançados!

---
## <a name="conclusao-curso"></a>Parabéns e Próximos Passos!

Se você passou por todos os exercícios, **você está agora no top 0,1% dos "sussurradores" de LLM**. Um membro da elite!

As técnicas que você aprendeu, desde pensar passo a passo, atribuir papéis, usar exemplos, até a escrita clara em geral, podem ser **mescladas, remixadas e adaptadas de inúmeras maneiras**.

A engenharia de prompts é uma disciplina muito nova, então mantenha a mente aberta. Você pode ser o próximo a descobrir o próximo grande truque de prompting.

Se você quiser ver **mais exemplos de bons prompts** para inspiração:
- Aprenda com exemplos de prompts prontos para produção em nosso [cookbook da Anthropic](https://anthropic.com/cookbook) (em inglês)
- Leia nosso [guia de prompting da Anthropic](https://docs.anthropic.com/claude/docs/prompt-engineering) (em inglês)
- Confira nossa [biblioteca de prompts da Anthropic](https://anthropic.com/prompts) para inspiração (em inglês)
- Experimente nosso [metaprompt experimental](https://docs.anthropic.com/claude/docs/helper-metaprompt-experimental) para fazer Claude escrever modelos de prompt para você! (em inglês)
- Faça perguntas em nosso [servidor do Discord da Anthropic](https://anthropic.com/discord) (em inglês)
- Aprenda sobre os [parâmetros da API da Anthropic](https://docs.anthropic.com/claude/reference/messages_post) como temperatura e `max_tokens` (em inglês)
- Se você está se sentindo acadêmico, leia alguns [artigos científicos sobre engenharia de prompts](https://www.promptingguide.ai/papers) (em inglês)
- Pratique construindo prompts para fazer Claude fazer algo que lhe interesse.

Se você quer aprender sobre algumas técnicas de prompting verdadeiramente avançadas além do escopo deste tutorial, clique para ir ao apêndice! Mas primeiro, execute a célula abaixo no notebook original para uma pequena celebração.
