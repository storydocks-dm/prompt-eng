# Capítulo 09: Criando Prompts Complexos do Zero

- [Lição: Construindo um Prompt Complexo](#licao)
- [Exemplo 1: Chatbot de Orientação Profissional](#exemplo-chatbot-carreira)
- [Exemplo 2: Serviços Jurídicos](#exemplo-servicos-juridicos)
- [Exercícios](#exercicios)
- [Parabéns e Próximos Passos](#conclusao)
- [Playground de Exemplos](#playground-de-exemplos)


## <a name="configuracao"></a>Configuração

Execute a célula de configuração a seguir para carregar sua chave de API e estabelecer a função auxiliar `get_completion`.

> **Nota:** O comando `!pip install anthropic` é para instalar a biblioteca em ambientes Jupyter. Os comandos `%store -r API_KEY` e `%store -r MODEL_NAME` são específicos do IPython. Em um script Python padrão, defina `API_KEY` e `MODEL_NAME` diretamente.

```python
# Importa a biblioteca de expressões regulares embutida do Python
import re
import anthropic

# Recupera as variáveis API_KEY & MODEL_NAME do armazém IPython
# Em um script Python normal, você precisaria definir essas variáveis diretamente.
# Exemplo:
# API_KEY = "sua_chave_api_aqui"
# MODEL_NAME = "claude-3-haiku-20240307" # ou outro modelo desejado

# Certifique-se de que API_KEY e MODEL_NAME estão definidos e client está inicializado
# client = anthropic.Anthropic(api_key=API_KEY)

def get_completion(prompt: str, system_prompt="", prefill=""):
    messages = [{"role": "user", "content": prompt}]
    if prefill:
        messages.append({"role": "assistant", "content": prefill})

    message_request = {
        "model": MODEL_NAME,
        "max_tokens": 2000,
        "temperature": 0.0,
        "messages": messages
    }
    if system_prompt:
        message_request["system"] = system_prompt

    response_message = client.messages.create(**message_request)
    return response_message.content[0].text
```

---

## <a name="licao"></a>Lição: Construindo um Prompt Complexo

Parabéns por chegar ao último capítulo! Agora é hora de juntar tudo e aprender como **criar prompts únicos e complexos**. Este processo é muitas vezes iterativo e envolve a combinação de várias técnicas que exploramos nos capítulos anteriores.

Abaixo, você verá uma **estrutura guiada que recomendamos para prompts complexos**. Esta estrutura não é rígida, mas oferece um bom ponto de partida e uma maneira de organizar seus pensamentos ao construir um prompt elaborado. Em partes posteriores deste capítulo, mostraremos alguns prompts específicos da indústria e explicaremos como esses prompts são estruturados de forma semelhante.

**Nota:** **Nem todo prompt precisa de todos os elementos da seguinte estrutura complexa**. Incentivamos você a brincar, incluir ou excluir elementos e ver como isso afeta a resposta de Claude. Geralmente, é **melhor usar muitos elementos de prompt para fazer seu prompt funcionar primeiro, depois refinar e simplificar seu prompt**.

### Elementos de um Prompt Complexo

Um prompt complexo pode ser decomposto nos seguintes elementos principais. A ordem pode ser flexível para alguns, mas a estrutura geral abaixo é um bom guia:

1.  **Papel (Role Prompting):** Definir um papel para Claude (ex: "Você é um especialista em X").
2.  **Contexto da Tarefa:** Explicar o objetivo geral e a situação.
3.  **Contexto de Tom:** Se importante, especificar o tom da resposta (ex: "amigável", "formal").
4.  **Descrição Detalhada da Tarefa e Regras:** Detalhar as ações específicas e quaisquer regras ou restrições, incluindo "saídas" (o que fazer se não souber a resposta).
5.  **Exemplos (Few-Shot Prompting):** Fornecer um ou mais exemplos de interações ideais, incluindo como lidar com casos extremos ou como usar um "scratchpad". Envolver exemplos em tags como `<example></example>`.
6.  **Dados de Entrada para Processamento:** Incluir os dados que Claude precisa processar, idealmente delimitados por tags XML (ex: `<documento>{TEXTO_DO_DOCUMENTO}</documento>`).
7.  **Descrição da Tarefa Imediata:** "Lembrar" Claude do que ele deve fazer imediatamente com os dados fornecidos. É bom colocar a pergunta do usuário ou a instrução final mais perto do final do prompt.
8.  **Precognição (Pensamento Passo a Passo):** Instruir Claude a pensar passo a passo, talvez usando um "scratchpad" (ex: `<scratchpad>...</scratchpad>`), antes de dar a resposta final.
9.  **Formatação da Saída:** Especificar claramente o formato desejado para a resposta (ex: JSON, XML com tags específicas, etc.).
10. **Pré-preenchimento da Resposta (Prefill):** Iniciar a resposta do assistente para guiar Claude na direção correta.

A seguir, veremos como esses elementos se unem em exemplos práticos.

---
## <a name="exemplo-chatbot-carreira"></a>Exemplo 1: Chatbot de Orientação Profissional

Para o exemplo a seguir, construiremos um prompt para um roleplay controlado em que Claude assume um papel situacional com uma tarefa específica. Nosso objetivo é instruir Claude a agir como um orientador profissional amigável chamado Joe.

O código abaixo no notebook original monta o prompt a partir de vários componentes. Vamos traduzir e explicar cada componente e depois mostrar o prompt resultante.

**Variáveis de Entrada:**
-   `HISTORY`: O histórico da conversa até o momento.
-   `QUESTION`: A pergunta atual do usuário.

**Componentes do Prompt (Elementos):**

1.  **`TASK_CONTEXT` (Contexto da Tarefa):**
    *   Tradução: "Você atuará como um orientador profissional de IA chamado Joe, criado pela empresa AdAstra Careers. Seu objetivo é dar aconselhamento profissional aos usuários. Você responderá a usuários que estão no site da AdAstra e que ficarão confusos se você não responder no personagem de Joe."

2.  **`TONE_CONTEXT` (Contexto de Tom):**
    *   Tradução: "Você deve manter um tom amigável de atendimento ao cliente."

3.  **`TASK_DESCRIPTION` (Descrição Detalhada da Tarefa e Regras):**
    *   Tradução: "Aqui estão algumas regras importantes para a interação:\n- Sempre permaneça no personagem, como Joe, uma IA da AdAstra Careers\n- Se não tiver certeza de como responder, diga \"Desculpe, não entendi. Você poderia reformular sua pergunta?\"\n- Se alguém perguntar algo irrelevante, diga, \"Desculpe, sou Joe e dou aconselhamento profissional. Você tem alguma pergunta sobre carreira hoje com a qual posso ajudar?\""

4.  **`EXAMPLES` (Exemplos - Few-Shot):**
    *   Tradução: "Aqui está um exemplo de como responder em uma interação padrão:\n<example>\nCliente: Oi, como você foi criado e o que você faz?\nJoe: Olá! Meu nome é Joe, e fui criado pela AdAstra Careers para dar aconselhamento profissional. Com o que posso te ajudar hoje?\n</example>"

5.  **`INPUT_DATA` (Dados de Entrada para Processamento):**
    *   Tradução (template): f"\"\"Aqui está o histórico da conversa (entre o usuário e você) anterior à pergunta. Pode estar vazio se não houver histórico:\n<history>\n{HISTORY}\n</history>\n\nAqui está a pergunta do usuário:\n<question>\n{QUESTION}\n</question>\"\"\""

6.  **`IMMEDIATE_TASK` (Descrição da Tarefa Imediata):**
    *   Tradução: "Como você responde à pergunta do usuário?"

7.  **`PRECOGNITION` (Pensamento Passo a Passo):**
    *   Tradução: "Pense sobre sua resposta primeiro antes de responder."

8.  **`OUTPUT_FORMATTING` (Formatação da Saída):**
    *   Tradução: "Coloque sua resposta nas tags <response></response>."

9.  **`PREFILL` (Pré-preenchimento da Resposta):**
    *   Tradução: "[Joe] <response>"

**Prompt Completo Combinado (Exemplo):**
> **Nota:** O código abaixo mostra a montagem do prompt completo para o chatbot de orientação profissional, usando os componentes traduzidos. As variáveis `HISTORY` e `QUESTION` seriam preenchidas com dados reais em uma aplicação. (Lembre-se de ter `API_KEY` e `MODEL_NAME` configurados e `client` inicializado para executar.)
```python
# --- Variáveis de Entrada (Exemplo) ---
HISTORY = """Cliente: Quais são duas possíveis carreiras para quem se forma em sociologia?

Joe: Aqui estão duas carreiras potenciais para quem se forma em sociologia:

- Assistente social - A sociologia fornece uma base sólida para entender o comportamento humano e os sistemas sociais. Com treinamento ou certificação adicional, um diploma de sociologia pode qualificar graduados para funções como assistentes sociais, gestores de caso, conselheiros e organizadores comunitários, ajudando indivíduos e grupos.

- Especialista em recursos humanos - A compreensão da dinâmica de grupo e do comportamento organizacional da sociologia é aplicável a carreiras em recursos humanos. Os graduados podem encontrar funções em recrutamento, relações com funcionários, treinamento e desenvolvimento, diversidade e inclusão e outras funções de RH. O foco em estruturas e instituições sociais também apoia carreiras relacionadas em políticas públicas, gestão de organizações sem fins lucrativos e educação."""
QUESTION = "Qual das duas carreiras exige mais do que um diploma de Bacharel?"

# --- Componentes do Prompt Traduzidos (conforme definido na explanação acima) ---
TASK_CONTEXT = "Você atuará como um orientador profissional de IA chamado Joe, criado pela empresa AdAstra Careers. Seu objetivo é dar aconselhamento profissional aos usuários. Você responderá a usuários que estão no site da AdAstra e que ficarão confusos se você não responder no personagem de Joe."
TONE_CONTEXT = "Você deve manter um tom amigável de atendimento ao cliente."
TASK_DESCRIPTION = """Aqui estão algumas regras importantes para a interação:
- Sempre permaneça no personagem, como Joe, uma IA da AdAstra Careers
- Se não tiver certeza de como responder, diga \"Desculpe, não entendi. Você poderia reformular sua pergunta?\"
- Se alguém perguntar algo irrelevante, diga, \"Desculpe, sou Joe e dou aconselhamento profissional. Você tem alguma pergunta sobre carreira hoje com a qual posso ajudar?\""""
EXAMPLES = """Aqui está um exemplo de como responder em uma interação padrão:
<example>
Cliente: Oi, como você foi criado e o que você faz?
Joe: Olá! Meu nome é Joe, e fui criado pela AdAstra Careers para dar aconselhamento profissional. Com o que posso te ajudar hoje?
</example>"""
INPUT_DATA_TEMPLATE = """Aqui está o histórico da conversa (entre o usuário e você) anterior à pergunta. Pode estar vazio se não houver histórico:
<history>
{HISTORY}
</history>

Aqui está a pergunta do usuário:
<question>
{QUESTION}
</question>"""
IMMEDIATE_TASK = "Como você responde à pergunta do usuário?"
PRECOGNITION = "Pense sobre sua resposta primeiro antes de responder."
OUTPUT_FORMATTING = "Coloque sua resposta nas tags <response></response>."
PREFILL = "[Joe] <response>"

# --- Montagem do Prompt ---
PROMPT_CARREIRA = f"{TASK_CONTEXT}\n\n{TONE_CONTEXT}\n\n{TASK_DESCRIPTION}\n\n{EXAMPLES}\n\n"
PROMPT_CARREIRA += INPUT_DATA_TEMPLATE.format(HISTORY=HISTORY, QUESTION=QUESTION)
PROMPT_CARREIRA += f"\n\n{IMMEDIATE_TASK}\n\n{PRECOGNITION}\n\n{OUTPUT_FORMATTING}"

# --- Execução (simulada) ---
# print("--------------------------- Prompt Completo (Chatbot de Carreira) ---------------------------")
# print("TURNO DO USUÁRIO:")
# print(PROMPT_CARREIRA)
# print("\nTURNO DO ASSISTENTE (Pré-preenchido):")
# print(PREFILL)
# print("\n------------------------------------- Resposta do Claude ------------------------------------")
# print(get_completion(PROMPT_CARREIRA, prefill=PREFILL))
```

---
## <a name="exemplo-servicos-juridicos"></a>Exemplo 2: Serviços Jurídicos

**Prompts na área jurídica podem ser bastante complexos** devido à necessidade de:
- Analisar longos documentos.
- Lidar com tópicos complexos.
- Formatar a saída de maneiras muito específicas.
- Seguir processos analíticos de várias etapas.

Vejamos como podemos usar o modelo de prompt complexo para estruturar um prompt para um caso de uso jurídico específico. Abaixo, detalhamos um prompt de exemplo para um caso de uso jurídico em que pedimos a Claude para responder a perguntas sobre uma questão legal usando informações de um documento jurídico.

**Alteramos a ordem de alguns elementos** para mostrar que a estrutura do prompt pode ser flexível!

**A engenharia de prompts envolve tentativa e erro científicos**. Incentivamos você a misturar e combinar, mover as coisas (os elementos onde a ordem não importa) e ver o que funciona melhor para você e suas necessidades.

**Variáveis de Entrada:**
-   `LEGAL_RESEARCH`: O documento jurídico (trechos de pesquisa) a ser analisado.
-   `QUESTION`: A pergunta específica do usuário sobre o documento.

**Componentes do Prompt (Elementos) para o Exemplo Jurídico:**
1.  **`TASK_CONTEXT`:** "Você é um advogado especialista."
2.  **`INPUT_DATA`:** (Contém `{LEGAL_RESEARCH}` dentro de tags `<legal_research>`).
3.  **`EXAMPLES`:** (Mostra como citar os resultados da pesquisa, ex: "[1].").
4.  **`TASK_DESCRIPTION`:** (Instrui a escrever uma resposta concisa à `{QUESTION}`, com a opção de dizer que não tem informação suficiente).
5.  **`PRECOGNITION`:** "Antes de responder, extraia as citações mais relevantes da pesquisa em tags `<relevant_quotes>`." (Uso de scratchpad).
6.  **`OUTPUT_FORMATTING`:** "Coloque sua resposta de dois parágrafos nas tags `<answer>`."
7.  **`PREFILL`:** "`<relevant_quotes>`" (Inicia o processo de pensamento no scratchpad).

**Prompt Completo Combinado (Exemplo Jurídico):**
> **Nota:** O código abaixo mostra a montagem do prompt completo para o exemplo de serviços jurídicos. As variáveis `LEGAL_RESEARCH` e `QUESTION` seriam preenchidas com dados reais. O documento `LEGAL_RESEARCH` é extenso e está abreviado aqui para fins de demonstração.
```python
# --- Variáveis de Entrada (Exemplo) ---
LEGAL_RESEARCH = """<search_results>
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
QUESTION_LEGAL = "Existem leis sobre o que fazer com animais de estimação durante um furacão?"

# --- Componentes do Prompt Traduzidos (Exemplo Jurídico) ---
TASK_CONTEXT_LEGAL = "Você é um advogado especialista."
INPUT_DATA_LEGAL_TEMPLATE = """Aqui estão algumas pesquisas que foram compiladas. Use-as para responder a uma pergunta jurídica do usuário.
<legal_research>
{LEGAL_RESEARCH}
</legal_research>"""
EXAMPLES_LEGAL = """Ao citar a pesquisa jurídica em sua resposta, por favor, use colchetes contendo o ID do índice da pesquisa, seguido por um ponto. Coloque-os no final da frase que está fazendo a citação. Exemplos de formato de citação adequado:

<examples>
<example>
O estatuto de limitações expira após 10 anos para crimes como este. [3].
</example>
<example>
No entanto, a proteção não se aplica quando foi especificamente renunciada por ambas as partes. [5].
</example>
</examples>"""
TASK_DESCRIPTION_LEGAL_TEMPLATE = """Escreva uma resposta clara e concisa para esta pergunta:

<question>
{QUESTION}
</question>

Não deve ter mais do que alguns parágrafos. Se possível, deve concluir com uma única frase respondendo diretamente à pergunta do usuário. No entanto, se não houver informação suficiente na pesquisa compilada para produzir tal resposta, você pode hesitar e escrever "Desculpe, não tenho informação suficiente à mão para responder a esta pergunta."."""
PRECOGNITION_LEGAL = "Antes de responder, extraia as citações mais relevantes da pesquisa em tags <relevant_quotes>."
OUTPUT_FORMATTING_LEGAL = "Coloque sua resposta de dois parágrafos nas tags <answer>."
PREFILL_LEGAL = "<relevant_quotes>"

# --- Montagem do Prompt (Ordem dos elementos pode variar) ---
PROMPT_LEGAL = f"{TASK_CONTEXT_LEGAL}\n\n"
PROMPT_LEGAL += INPUT_DATA_LEGAL_TEMPLATE.format(LEGAL_RESEARCH=LEGAL_RESEARCH)
PROMPT_LEGAL += f"\n\n{EXAMPLES_LEGAL}\n\n"
PROMPT_LEGAL += TASK_DESCRIPTION_LEGAL_TEMPLATE.format(QUESTION=QUESTION_LEGAL)
PROMPT_LEGAL += f"\n\n{PRECOGNITION_LEGAL}\n\n{OUTPUT_FORMATTING_LEGAL}"

# --- Execução (simulada) ---
# print("--------------------------- Prompt Completo (Serviços Jurídicos) ---------------------------")
# print("TURNO DO USUÁRIO:")
# print(PROMPT_LEGAL)
# print("\nTURNO DO ASSISTENTE (Pré-preenchido):")
# print(PREFILL_LEGAL)
# print("\n------------------------------------- Resposta do Claude ------------------------------------")
# print(get_completion(PROMPT_LEGAL, prefill=PREFILL_LEGAL))
```

---
## <a name="exercicios"></a>Exercícios

Agora é sua vez de aplicar o que aprendeu e construir prompts complexos do zero! Os exercícios abaixo são abertos e pedem que você preencha os vários elementos de um prompt complexo para diferentes tarefas.

### Exercício 9.1 - Chatbot de Serviços Financeiros
Prompts na área financeira também podem ser bastante complexos por razões semelhantes aos prompts jurídicos. Aqui está um exercício para um caso de uso financeiro, em que Claude é usado para **analisar informações fiscais e responder a perguntas**.

Sugerimos que você leia o conteúdo das variáveis (`QUESTION_FINANCE` e `TAX_CODE_FINANCE`) para entender com qual conteúdo Claude deverá trabalhar. Certifique-se de referenciar `{QUESTION}` e `{TAX_CODE}` (ou os nomes que você der a essas variáveis no template) diretamente em seu prompt em algum lugar.

Preencha os campos dos elementos do prompt com conteúdo que corresponda à descrição e aos exemplos que você viu nos exemplos anteriores de prompts complexos.

> **Nota do Exercício:** Seu objetivo é preencher as variáveis `TASK_CONTEXT_FIN`, `TONE_CONTEXT_FIN`, etc., para construir um prompt completo que use o `TAX_CODE_FINANCE` (código tributário fornecido no notebook original, parcialmente incluído abaixo) para responder à `QUESTION_FINANCE` ("Quanto tempo eu tenho para fazer uma eleição 83b?"). Pense em qual papel Claude deve assumir, como ele deve usar o documento, se exemplos de citação são necessários, como ele deve pensar passo a passo (scratchpad), e qual formato de saída é desejado. O notebook original fornece uma solução possível através de `from hints import exercise_9_1_solution`.
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

# --- Componentes do Prompt (Você deve preenchê-los com suas ideias) ---
TASK_CONTEXT_FIN = "Você é um consultor fiscal especializado respondendo a perguntas sobre o código tributário dos EUA." # Exemplo
TONE_CONTEXT_FIN = "Sua resposta deve ser formal e precisa." # Exemplo
INPUT_DATA_FIN_TEMPLATE = "Por favor, use o seguinte documento para responder à pergunta:\n<tax_code>{TAX_CODE}</tax_code>\n\nPergunta do usuário:\n<question>{QUESTION}</question>" # Exemplo
EXAMPLES_FIN = "Exemplo de como citar: 'De acordo com a Seção (b)(2) do código fornecido, o prazo é de 30 dias.'" # Exemplo
TASK_DESCRIPTION_FIN = "Responda à pergunta do usuário baseando-se estritamente no código tributário fornecido. Se a informação não estiver presente, indique isso." # Exemplo
IMMEDIATE_TASK_FIN = "Qual é o prazo para fazer uma eleição 83b, com base no documento?" # Exemplo
PRECOGNITION_FIN = "Antes de responder, localize a seção exata do código tributário que trata da eleição 83b e do prazo. Coloque a citação relevante em tags <scratchpad>." # Exemplo
OUTPUT_FORMATTING_FIN = "Forneça sua resposta final em tags <answer>, citando a seção do código se possível." # Exemplo
PREFILL_FIN = "<scratchpad>" # Exemplo

# --- Montagem do Prompt (Exemplo de como você pode montar) ---
# PROMPT_FINANCEIRO = f"{TASK_CONTEXT_FIN}\n\n{TONE_CONTEXT_FIN}\n\n"
# PROMPT_FINANCEIRO += INPUT_DATA_FIN_TEMPLATE.format(TAX_CODE=TAX_CODE_FINANCE, QUESTION=QUESTION_FINANCE)
# PROMPT_FINANCEIRO += f"\n\n{EXAMPLES_FIN}\n\n{TASK_DESCRIPTION_FIN}\n\n{IMMEDIATE_TASK_FIN}\n\n{PRECOGNITION_FIN}\n\n{OUTPUT_FORMATTING_FIN}"

# --- Execução (simulada) ---
# print("--------------------------- Prompt Completo (Chatbot Financeiro) ---------------------------")
# print("TURNO DO USUÁRIO:")
# print(PROMPT_FINANCEIRO)
# print("\nTURNO DO ASSISTENTE (Pré-preenchido):")
# print(PREFILL_FIN)
# print("\n------------------------------------- Resposta do Claude ------------------------------------")
# print(get_completion(PROMPT_FINANCEIRO, prefill=PREFILL_FIN))
```

❓ Se você quiser ver uma possível solução para o Exercício 9.1, o notebook original permite importá-la com `from hints import exercise_9_1_solution; print(exercise_9_1_solution)`. Analise-a para ver uma forma de preencher os elementos do prompt.

### Exercício 9.2 - Codebot
Neste exercício, escreveremos um prompt para um **bot de assistência e ensino de programação que lê código e oferece correções orientadoras quando apropriado**. Preencha os campos dos elementos do prompt com conteúdo que corresponda à descrição e aos exemplos que você viu nos exemplos anteriores de prompts complexos.

Sugerimos que você leia o conteúdo da variável (`{CODE}`) para entender com qual conteúdo Claude deverá trabalhar.

> **Nota do Exercício:** O objetivo é criar um prompt complexo para um "Codebot". Claude deve analisar o `{CODE}` fornecido (que contém um erro de divisão por zero em um loop), explicar o erro e sugerir uma correção. Pense em qual papel Claude deve assumir (ex: "um programador Python sênior e instrutor paciente"), como ele deve analisar o código (talvez passo a passo), se deve fornecer exemplos de código corrigido, qual tom usar, etc. Use os 10 elementos de prompt como guia. O notebook original também fornece uma solução para este com `from hints import exercise_9_2_solution`.
```python
# --- Variável de Entrada (Fornecida no Notebook) ---
CODE_INPUT = """
# Função para imprimir inversos multiplicativos
def print_multiplicative_inverses(x, n):
  for i in range(n): # O loop começa com i=0
    print(x / i) # Potencial erro de Divisão por Zero aqui
"""

# --- Componentes do Prompt (Você deve preenchê-los com suas ideias) ---
TASK_CONTEXT_CODE = "Você é um Codebot, um assistente de IA amigável e experiente, especializado em depurar e explicar código Python para programadores iniciantes." # Exemplo
TONE_CONTEXT_CODE = "Seu tom deve ser encorajador, claro e didático. Evite jargões complexos sem explicação." # Exemplo
INPUT_DATA_CODE_TEMPLATE = "Por favor, analise o seguinte trecho de código Python fornecido pelo usuário:\n<code>\n{CODE}\n</code>" # Exemplo
TASK_DESCRIPTION_CODE = """Identifique quaisquer erros potenciais ou bugs no código.
Explique o problema de forma compreensível.
Sugira uma ou mais maneiras de corrigir o código, mostrando o código corrigido.
Se não houver erros óbvios, elogie o código e talvez sugira pequenas melhorias de estilo ou eficiência, se aplicável.""" # Exemplo
IMMEDIATE_TASK_CODE = "Analise o código fornecido, identifique problemas e sugira correções." # Exemplo
PRECOGNITION_CODE = """Pense passo a passo sobre o código em tags <scratchpad>:
1. Qual é o propósito aparente da função?
2. Analise o loop: quais são os valores de 'i'?
3. Existe algum valor de 'i' que possa causar problemas na operação 'x / i'?
4. Se sim, qual é o problema e como pode ser corrigido?
5. Formule uma explicação clara e uma sugestão de código corrigido.
</scratchpad>""" # Exemplo
OUTPUT_FORMATTING_CODE = "Formate sua resposta com uma explicação clara do problema, seguida pelo código corrigido em um bloco de código Markdown." # Exemplo
PREFILL_CODE = "<scratchpad>" # Exemplo

# --- Montagem do Prompt (Exemplo de como você pode montar) ---
# PROMPT_CODEBOT = f"{TASK_CONTEXT_CODE}\n\n{TONE_CONTEXT_CODE}\n\n"
# PROMPT_CODEBOT += INPUT_DATA_CODE_TEMPLATE.format(CODE=CODE_INPUT)
# PROMPT_CODEBOT += f"\n\n{TASK_DESCRIPTION_CODE}\n\n{IMMEDIATE_TASK_CODE}\n\n{PRECOGNITION_CODE}\n\n{OUTPUT_FORMATTING_CODE}"

# --- Execução (simulada) ---
# print("--------------------------- Prompt Completo (Codebot) ---------------------------")
# print("TURNO DO USUÁRIO:")
# print(PROMPT_CODEBOT)
# print("\nTURNO DO ASSISTENTE (Pré-preenchido):")
# print(PREFILL_CODE)
# print("\n------------------------------------- Resposta do Claude ------------------------------------")
# print(get_completion(PROMPT_CODEBOT, prefill=PREFILL_CODE))
```

❓ Se você quiser ver uma possível solução para o Exercício 9.2, o notebook original permite importá-la com `from hints import exercise_9_2_solution; print(exercise_9_2_solution)`.

---
## <a name="conclusao"></a>Parabéns e Próximos Passos!

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

> **Nota:** A célula final do notebook original contém um prompt para Claude escrever uma ode ao estudante que completou o curso.
```python
# Prompt (do notebook original)
# PROMPT_ODE = "Escreva uma ode a um estudante fabuloso que acabou de completar um curso sobre engenharia de prompts, na forma de um soneto."
# Original: "Write an ode to a fabulous student who has just completed a course on prompt engineering, in the form of a sonnet."

# Print Claude's response
# print(get_completion(PROMPT_ODE))
```

---

## <a name="playground-de-exemplos"></a>Playground de Exemplos

Esta é uma área para você experimentar livremente com os exemplos de prompt mostrados nesta lição (como o Chatbot de Orientação Profissional ou o de Serviços Jurídicos) e ajustar os prompts para ver como isso pode afetar as respostas do Claude. Modifique os componentes individuais do prompt (TASK_CONTEXT, EXAMPLES, PRECOGNITION, etc.) e veja o impacto! Use os templates de prompt dos exemplos da lição como ponto de partida.
```python
# Exemplo de Playground baseado no Chatbot de Orientação Profissional:
# Modifique qualquer um dos componentes abaixo e veja o resultado.

# --- Variáveis de Entrada (Exemplo) ---
# HISTORY_PG = "Cliente: Estou pensando em mudar de carreira, mas não sei por onde começar."
# QUESTION_PG = "Quais são os primeiros três passos que você recomendaria?"

# --- Componentes do Prompt (Copie e modifique os do exemplo do Chatbot de Carreira) ---
# TASK_CONTEXT_PG = "Você é Joe, um coach de carreira virtual..."
# TONE_CONTEXT_PG = "Seu tom deve ser encorajador e prático."
# # ... (e assim por diante para os outros componentes) ...
# PREFILL_PG = "[Joe] <response>"

# --- Montagem do Prompt (similar ao exemplo do Chatbot de Carreira) ---
# PROMPT_PLAYGROUND = f"{TASK_CONTEXT_PG}\n\n{TONE_CONTEXT_PG}\n\n..." # Monte seu prompt aqui

# --- Execução (simulada) ---
# print("TURNO DO USUÁRIO (Playground):")
# print(PROMPT_PLAYGROUND)
# print("\nTURNO DO ASSISTENTE (Pré-preenchido no Playground):")
# print(PREFILL_PG)
# print("\nResposta do Claude (Playground):")
# print(get_completion(PROMPT_PLAYGROUND, prefill=PREFILL_PG))
```
