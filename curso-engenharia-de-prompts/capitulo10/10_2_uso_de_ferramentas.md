# Apêndice B: Uso de Ferramentas (Tool Use)

- [Lição: O que é Uso de Ferramentas?](#licao)
- [Exemplo Detalhado: Ferramenta Calculadora](#exemplo-calculadora)
- [Exercício: Ferramentas de Banco de Dados Simulado](#exercicio-db)
- [Playground de Exemplos](#playground-de-exemplos)

## <a name="configuracao"></a>Configuração

Execute a célula de configuração a seguir para carregar sua chave de API e estabelecer a função auxiliar `get_completion`.

> **Nota:** O comando `!pip install anthropic` é para instalar a biblioteca. Os comandos `%store -r API_KEY` são específicos do IPython. Em um script Python padrão, defina `API_KEY` diretamente.
> **Importante:** Nesta lição, a função `get_completion` é ajustada para usar um modelo mais recente (`claude-3-sonnet-20240229`), que geralmente é melhor para o uso de ferramentas, e inclui o parâmetro `stop_sequences`. O uso de `stop_sequences` é crucial para interromper a resposta de Claude quando ele decide usar uma ferramenta, permitindo que sua aplicação execute a ferramenta e envie o resultado de volta.

```python
# Importa a biblioteca de expressões regulares embutida do Python
import re
import anthropic # Certifique-se de que a biblioteca anthropic está instalada
import json # Para formatar resultados de ferramentas como JSON, se necessário

# Recupera a variável API_KEY do armazém IPython
# Em um script Python normal, você precisaria definir API_KEY diretamente.
# Exemplo:
# API_KEY = "sua_chave_api_aqui"

# Certifique-se de que API_KEY está definida e client está inicializado
# client = anthropic.Anthropic(api_key=API_KEY)

# Reescrita para chamar Claude 3 Sonnet, que geralmente é melhor no uso de ferramentas, e incluir stop_sequences
def get_completion(messages, system_prompt="", stop_sequences=None):
    # Verifique se client está definido e inicializado corretamente
    # if 'client' not in globals() or not hasattr(client, 'messages'):
    #     print("Cliente Anthropic não inicializado corretamente. Verifique sua API_KEY.")
    #     return "Erro: Cliente não inicializado."

    params = {
        "model": "claude-3-sonnet-20240229", # Modelo otimizado para tool use
        "max_tokens": 2000,
        "temperature": 0.0, # Para consistência
        "messages": messages
    }
    if system_prompt:
        params["system"] = system_prompt
    if stop_sequences:
        params["stop_sequences"] = stop_sequences

    response_obj = client.messages.create(**params)

    # O objeto de resposta do Claude 3 pode conter múltiplos blocos de conteúdo.
    # Para o uso de ferramentas, a resposta de Claude indicando uma chamada de ferramenta
    # ou a resposta final após o resultado da ferramenta, geralmente estará no primeiro bloco de texto.

    # Vamos verificar se há conteúdo e se o primeiro bloco é um bloco de texto.
    if response_obj.content and isinstance(response_obj.content[0], anthropic.types.TextBlock):
        return response_obj.content[0].text

    # Se for uma chamada de ferramenta (detectada pelo stop_reason='tool_use'),
    # a estrutura de response_obj.content será diferente.
    # O notebook original simplifica isso retornando response.content[0].text,
    # o que funciona porque a chamada de ferramenta é formatada como texto XML.
    # Para uma implementação robusta, você analisaria response_obj.stop_reason
    # e response_obj.content de acordo com a documentação do Tool Use.
    # Por simplicidade e para seguir o notebook, retornamos o texto do primeiro bloco se disponível.

    return "" # Ou uma forma apropriada de lidar com resposta vazia/inesperada
```

---

## <a name="licao"></a>Lição: O que é Uso de Ferramentas?

Embora possa parecer conceitualmente complexo à primeira vista, o uso de ferramentas (tool use), também conhecido como chamada de função (function calling), é na verdade bastante simples de implementar com Claude! Você já conhece todas as habilidades necessárias, que são uma combinação de construção de prompt cuidadosa, formatação de entrada/saída e encadeamento de prompts.

**O que é Uso de Ferramentas?**

O uso de ferramentas permite que Claude interaja com sistemas externos, como APIs, bancos de dados, ou até mesmo funções de código que você define em sua aplicação. Em vez de apenas gerar texto com base em seu conhecimento de treinamento, Claude pode solicitar a execução de uma ferramenta para:
- Obter informações em tempo real (ex: previsão do tempo, cotações de ações).
- Realizar cálculos precisos ou operações complexas.
- Interagir com suas próprias APIs, bases de dados ou outros serviços.
- Efetuar ações no mundo real (ex: enviar um email, criar um item em uma lista de tarefas).

**Fluxo de Interação para Uso de Ferramentas:**

Claude não pode, literalmente, executar código ou acessar ferramentas e funções externas diretamente. Em vez disso, o processo ocorre em etapas orquestradas pela sua aplicação:

1.  **Definição da Ferramenta (Lado do Usuário/Aplicação):** Você descreve as ferramentas disponíveis para Claude em um "system prompt" (prompt de sistema). Esta descrição inclui o nome da ferramenta, sua finalidade, e os parâmetros que ela aceita (com nome, tipo e descrição), geralmente em um formato estruturado como XML ou JSON Schema.
2.  **Requisição do Usuário:** O usuário faz uma pergunta ou dá uma instrução a Claude.
3.  **Claude Solicita o Uso da Ferramenta:** Se Claude determinar que uma ferramenta pode ajudar a responder à requisição do usuário, sua resposta incluirá um bloco XML especial, como `<function_calls><invoke name="NOME_DA_FERRAMENTA" tool_id="ID_DA_CHAMADA_DA_FERRAMENTA"><parameters><param_nome>valor</param_nome></parameters></invoke></function_calls>`. Este bloco especificará o nome da ferramenta a ser usada, um `tool_id` único para esta chamada específica, e os valores dos parâmetros que Claude quer passar para ela. A geração da resposta de Claude é interrompida (usando `stop_sequences` como `"</function_calls>"`) após ele emitir este bloco.
4.  **Execução da Ferramenta pela Aplicação (Lado do Usuário/Aplicação):** Sua aplicação detecta e analisa este bloco `<function_calls>`. Ela então executa a ferramenta correspondente (ex: chama uma API externa, executa uma função Python local) com os parâmetros fornecidos por Claude.
5.  **Envio do Resultado da Ferramenta de Volta para Claude (Lado do Usuário/Aplicação):** Sua aplicação formata o resultado (ou erro) da execução da ferramenta em outro bloco XML específico, `<function_results><result tool_id="ID_DA_CHAMADA_DA_FERRAMENTA"><tool_name>NOME_DA_FERRAMENTA_USADA</tool_name><stdout>RESULTADO_DA_FERRAMENTA</stdout></result></function_results>`, e envia isso de volta para Claude como uma nova mensagem do `user` (ou, mais precisamente, uma mensagem de `role: tool_result` conforme as implementações mais recentes da API da Anthropic) no histórico da conversa. O `tool_id` deve corresponder ao da chamada.
6.  **Resposta Final de Claude:** Claude recebe o resultado da ferramenta e o utiliza para formular uma resposta final e mais informada à pergunta original do usuário.

**Benefícios do Uso de Ferramentas:**
*   **Estende as Capacidades de Claude:** Permite que Claude vá além de seu conhecimento de treinamento.
*   **Tarefas Multi-Etapas Complexas:** Facilita a execução de tarefas que requerem múltiplos passos ou fontes de informação.
*   **Maior Precisão e Confiabilidade:** Para tarefas que LLMs não realizam bem sozinhos (como aritmética complexa), delegar a uma ferramenta garante precisão.
*   **Interatividade:** Permite que Claude interaja com o mundo exterior e realize ações.

**Estrutura para Uso de Ferramentas (Conforme o Notebook):**
1.  Um **prompt de sistema detalhado**, onde você explica a Claude o conceito de uso de ferramentas, como ele pode solicitar chamadas de função (usando a estrutura `<function_calls>`), e uma lista descritiva das ferramentas específicas.
2.  A **lógica de controle em sua aplicação** para orquestrar e executar as solicitações de uso de ferramentas de Claude e retornar os resultados.

**Roteiro para Uso de Ferramentas (Nota do Notebook Original):**
*Esta lição ensina o formato de uso de ferramentas da Anthropic na época da criação do notebook. A Anthropic está continuamente atualizando e aprimorando a funcionalidade de uso de ferramentas. Verifique sempre a [documentação oficial da Anthropic sobre Tool Use](https://docs.anthropic.com/claude/docs/tool-use) para as informações e formatos mais recentes e robustos.*

---
## <a name="exemplo-calculadora"></a>Exemplo Detalhado: Ferramenta Calculadora

Para habilitar o uso de ferramentas em Claude, começamos com o prompt de sistema.

**1. Prompt de Sistema para Uso de Ferramentas**

Este prompt tem duas partes:
    a.  Uma explicação geral de como o uso de ferramentas funciona e o formato que Claude deve usar para solicitar uma chamada de função (`<function_calls>`).
    b.  Uma descrição específica das ferramentas disponíveis, seus parâmetros e o que elas fazem.

```python
# Parte 1: Explicação geral sobre uso de ferramentas para o prompt de sistema
system_prompt_tools_general_explanation = """Você tem acesso a um conjunto de funções que pode usar para responder à pergunta do usuário. Isso inclui acesso a um
ambiente de computação em sandbox. Você NÃO tem atualmente a capacidade de inspecionar arquivos ou interagir com
recursos externos, exceto invocando as funções abaixo.

Você pode invocar uma ou mais funções escrevendo um bloco "<function_calls>" como o seguinte como parte de sua
resposta ao usuário:
<function_calls>
<invoke name="NOME_DA_FUNCAO">
<antml:parameter name="NOME_DO_PARAMETRO">VALOR_DO_PARAMETRO</parameter>
...
</invoke>
<invoke name="NOME_DA_FUNCAO2">
...
</invoke>
</function_calls>

Parâmetros de string e escalares devem ser especificados como estão, enquanto listas e objetos devem usar o formato JSON. Note que
espaços para valores de string não são removidos. A saída não precisa ser XML válido e é analisada com expressões
regulares.

A saída e/ou quaisquer erros aparecerão em um bloco "<function_results>" subsequente, e permanecerão lá como parte de
sua resposta ao usuário.
Você pode então continuar compondo o resto de sua resposta ao usuário, responder a quaisquer erros, ou fazer mais chamadas de função
conforme apropriado.
Se um "<function_results>" NÃO aparecer após suas chamadas de função, então elas provavelmente estão mal formatadas e não
reconhecidas como uma chamada."""
# No notebook original, o formato dos parâmetros dentro de invoke era <parameters><parameter name=...></parameter></parameters>
# A documentação mais recente da Anthropic usa um formato JSON para os parâmetros dentro de <invoke>.
# Para seguir o notebook: <antml:parameter name="NOME_DO_PARAMETRO">VALOR_DO_PARAMETRO</parameter>
# (Nota: O notebook usa <antml:parameter>, mas a documentação mais recente pode diferir. Sempre consulte a documentação oficial.)
```

```python
# Parte 2: Definição específica da ferramenta "calculator"
system_prompt_tools_specific_tools_calculator = """Aqui estão as funções disponíveis (formato descritivo, não estritamente JSONSchema aqui):
<tools>
<tool_description>
<tool_name>calculator</tool_name>
<description>
Função de calculadora para realizar aritmética básica.
Suporta adição, subtração, multiplicação e divisão.
</description>
<parameters>
<parameter>
<name>first_operand</name>
<type>int</type>
<description>Primeiro operando (antes do operador)</description>
</parameter>
<parameter>
<name>second_operand</name>
<type>int</type>
<description>Segundo operando (depois do operador)</description>
</parameter>
<parameter>
<name>operator</name>
<type>str</type>
<description>A operação a ser realizada. Deve ser +, -, * ou /</description>
</parameter>
</parameters>
</tool_description>
</tools>
"""

# Combina as duas partes para formar o prompt de sistema completo
# system_prompt_calculadora = system_prompt_tools_general_explanation + system_prompt_tools_specific_tools_calculator
```

**2. Pergunta do Usuário e Primeira Chamada a Claude**

Fazemos uma pergunta que requer a calculadora. Usamos `stop_sequences=["</function_calls>"]` para que Claude pare assim que decidir chamar a função.

> **Nota:** Primeira chamada a Claude. Ele deve responder com uma solicitação `<function_calls>`.
```python
# Pergunta do usuário que requer a calculadora
# mensagem_multiplicacao = {
#     "role": "user",
#     "content": "Multiplique 1.984.135 por 9.343.116"
# }

# stop_sequences é usado para parar a geração de Claude assim que ele decidir chamar uma função.
# stop_sequences_tool_call = ["</function_calls>"] # Claude parará aqui

# Obtém a resposta de Claude (espera-se uma chamada de função)
# resposta_chamada_funcao = get_completion(
#     messages=[mensagem_multiplicacao],
#     system_prompt=system_prompt_calculadora,
#     stop_sequences=stop_sequences_tool_call
# )
# print("Resposta de Claude solicitando a ferramenta (parada por stop_sequence):")
# print(resposta_chamada_funcao)
# Exemplo de saída esperada pelo notebook: <function_calls><invoke name="calculator"><antml:parameter name="first_operand">1984135</parameter><antml:parameter name="second_operand">9343116</parameter><antml:parameter name="operator">*</parameter></invoke>
# (Nota: A tag de fechamento </function_calls> não estará na saída devido ao stop_sequence)
```

**3. Execução da Ferramenta (Simulada)**

Extraímos os parâmetros da resposta de Claude e executamos nossa função Python.

```python
# Definição da função Python que simula nossa ferramenta calculadora
def do_pairwise_arithmetic(num1, num2, operation):
    if operation == '+':
        return num1 + num2
    elif operation == "-":
        return num1 - num2
    elif operation == "*":
        return num1 * num2
    elif operation == "/":
        if num2 == 0:
            return "Erro: Divisão por zero"
        return num1 / num2
    else:
        return "Erro: Operação não suportada."

# Função para encontrar parâmetros na string de chamada de função (do notebook)
# Em produção, uma análise XML mais robusta seria recomendada.
def find_parameter(message, parameter_name):
    # O notebook usa <antml:parameter name="PARAM_NAME">VALOR</parameter>
    # mas a explicação geral usa <parameter name="PARAM_NAME">VALOR</parameter>
    # Vamos adaptar para o formato <antml:parameter> usado nos exemplos do notebook.
    parameter_start_string_antml = f"<antml:parameter name=\\"{parameter_name}\\\">" # Para <antml:parameter>

    start_index = message.find(parameter_start_string_antml)
    if start_index == -1:
         # Fallback para o formato sem 'antml:' apenas por segurança, embora o notebook seja consistente com antml
        parameter_start_string_simple = f"<parameter name=\\"{parameter_name}\\\">"
        start_index = message.find(parameter_start_string_simple)
        if start_index == -1:
            return None
        start = start_index + len(parameter_start_string_simple)
    else:
        start = start_index + len(parameter_start_string_antml)

    end = start
    # Procura pelo fechamento da tag de parâmetro </antml:parameter> ou </parameter>
    end_tag_antml = "</antml:parameter>"
    end_tag_simple = "</parameter>"

    end_index_antml = message.find(end_tag_antml, start)
    end_index_simple = message.find(end_tag_simple, start)

    if end_index_antml != -1 and (end_index_simple == -1 or end_index_antml < end_index_simple):
        end = end_index_antml
    elif end_index_simple != -1:
        end = end_index_simple
    else: # Se não encontrar tag de fechamento, pega até o fim ou próximo <
        temp_end = start
        while temp_end < len(message) and message[temp_end] != "<":
            temp_end +=1
        end = temp_end

    return message[start:end]

# Supondo que 'resposta_chamada_funcao' da etapa anterior contenha a chamada da ferramenta:
# resposta_chamada_funcao_exemplo = '<function_calls><invoke name="calculator"><antml:parameter name="first_operand">1984135</antml:parameter><antml:parameter name="second_operand">9343116</antml:parameter><antml:parameter name="operator">*</parameter></invoke>'

# primeiro_operando = find_parameter(resposta_chamada_funcao_exemplo, "first_operand")
# segundo_operando = find_parameter(resposta_chamada_funcao_exemplo, "second_operand")
# operador = find_parameter(resposta_chamada_funcao_exemplo, "operator")

# resultado_calculo = None
# if primeiro_operando and segundo_operando and operador:
#     resultado_calculo = do_pairwise_arithmetic(int(primeiro_operando), int(segundo_operando), operador)
#     print("---------------- RESULTADO DO CÁLCULO (simulado) ----------------")
#     print(f"{resultado_calculo:,}")
```

**4. Formatação do Resultado da Ferramenta**

O resultado da ferramenta é formatado em XML para ser enviado de volta a Claude.

```python
# Função para construir o prompt de injeção do resultado da função (do notebook)
def construct_successful_function_run_injection_prompt(invoke_results):
    # invoke_results é esperado como uma lista de dicionários,
    # cada um com 'tool_name' e 'tool_result'.
    # O notebook não usa tool_id aqui, mas a documentação mais recente da Anthropic recomenda.
    constructed_prompt = (
        "<function_results>\\n"
        + '\\n'.join(
            f"<result>\\n<tool_name>{res['tool_name']}</tool_name>\\n<stdout>\\n{str(res['tool_result'])}n</stdout>\\n</result>" # Convertido tool_result para string
            for res in invoke_results
        ) + "\\n</function_results>"
    )
    return constructed_prompt

# Supondo que 'resultado_calculo' contenha o valor numérico.
# formatted_results_calculo = [{
#     'tool_name': 'calculator',
#     'tool_result': resultado_calculo
# }]
# resultado_funcao_formatado = construct_successful_function_run_injection_prompt(formatted_results_calculo)
# print("Resultado da função formatado para enviar de volta a Claude:")
# print(resultado_funcao_formatado)
```

**5. Segunda Chamada a Claude com o Resultado da Ferramenta**

Enviamos o resultado da ferramenta de volta para Claude, anexando-o ao histórico da conversa.

> **Nota:** Segunda chamada a Claude, fornecendo o resultado da ferramenta. Claude usará esse resultado para formular a resposta final.
```python
# 'resposta_chamada_funcao' foi a resposta de Claude que parou em </invoke> (devido ao stop_sequence).
# Completamos o bloco que Claude iniciou adicionando a tag de fechamento.
# resposta_completa_chamada_funcao = resposta_chamada_funcao + "</function_calls>"

# Construa a conversa completa até agora
# mensagens_para_final = [
#     mensagem_multiplicacao, # Pergunta original do usuário
#     {
#         "role": "assistant",
#         "content": resposta_completa_chamada_funcao # Resposta de Claude chamando a função
#     },
#     {
#         "role": "user", # Novo turno do usuário com o resultado da ferramenta
#         "content": resultado_funcao_formatado
#     }
# ]

# Obtém a resposta final de Claude
# resposta_final_calculo = get_completion(
#     messages=mensagens_para_final,
#     system_prompt=system_prompt_calculadora # O mesmo system_prompt com a definição da ferramenta
# ) # Não precisamos de stop_sequences aqui, pois queremos a resposta final em linguagem natural.
# print("------------- RESPOSTA FINAL DE CLAUDE (após resultado da ferramenta) -------------")
# print(resposta_final_calculo)
```

**6. Claude Não Usa a Ferramenta se Não For Necessário**

Se fizermos uma pergunta que não requer a ferramenta, Claude deve responder diretamente.
```python
# Pergunta que não deve usar a calculadora
# mensagem_nao_calculo = {
#     "role": "user",
#     "content": "Qual é a capital da França?"
# }

# stop_sequences_tool_call (o mesmo de antes)

# Obtém a resposta de Claude
# resposta_sem_chamada_ferramenta = get_completion(
#    messages=[mensagem_nao_calculo],
#    system_prompt=system_prompt_calculadora, # Ainda informamos sobre a calculadora
#    stop_sequences=stop_sequences_tool_call
# )
# print("Resposta de Claude para uma pergunta não relacionada à ferramenta:")
# print(resposta_sem_chamada_ferramenta)
# Espera-se que Claude responda diretamente, sem o bloco <function_calls>.
```
Sucesso! Como você pode ver, Claude soube não chamar a função quando não era necessário.

---
## <a name="exercicio-db"></a>Exercício: Ferramentas de Banco de Dados Simulado

Neste exercício, você definirá um prompt de sistema para uso de ferramentas para consultar e escrever no "menor banco de dados do mundo" (um dicionário Python).

Primeiro, o "banco de dados" e as funções para interagir com ele:
```python
# Banco de dados simulado
db = {
    "users": [
        {"id": 1, "name": "Alice", "email": "alice@example.com"},
        {"id": 2, "name": "Bob", "email": "bob@example.com"},
        {"id": 3, "name": "Charlie", "email": "charlie@example.com"}
    ],
    "products": [
        {"id": 1, "name": "Widget", "price": 9.99},
        {"id": 2, "name": "Gadget", "price": 14.99},
        {"id": 3, "name": "Doohickey", "price": 19.99}
    ]
}

# Funções para interagir com o banco de dados
def get_user(user_id: int):
    for user in db["users"]:
        if user["id"] == user_id:
            return user
    return None

def get_product(product_id: int):
    for product in db["products"]:
        if product["id"] == product_id:
            return product
    return None

def add_user(name: str, email: str):
    user_id = len(db["users"]) + 1
    user = {"id": user_id, "name": name, "email": email}
    db["users"].append(user)
    return user

def add_product(name: str, price: float):
    product_id = len(db["products"]) + 1
    product = {"id": product_id, "name": name, "price": price}
    db["products"].append(product)
    return product
```

Para resolver o exercício, comece definindo um prompt de sistema como `system_prompt_tools_specific_tools_calculator` do exemplo anterior. Certifique-se de incluir o nome e a descrição de cada uma das quatro ferramentas (`get_user`, `get_product`, `add_user`, `add_product`), juntamente com o nome, tipo e descrição de cada parâmetro para cada função. Fornecemos um esqueleto inicial abaixo.

> **Nota do Exercício:** Seu objetivo é completar a string `system_prompt_tools_specific_tools_sql` com as definições das quatro ferramentas de banco de dados. Siga o formato XML usado no exemplo da calculadora. Depois, você pode testar seu prompt de sistema com os exemplos de perguntas fornecidos no notebook original.
```python
# Definição específica das ferramentas de "banco de dados" para o prompt de sistema - COMPLETE AQUI
system_prompt_tools_specific_tools_sql = """Aqui estão as funções disponíveis:
<tools>
    <tool_description>
        <tool_name>get_user</tool_name>
        <description>Obtém informações de um usuário pelo seu ID.</description>
        <parameters>
            <parameter>
                <name>user_id</name>
                <type>int</type>
                <description>O ID do usuário a ser recuperado.</description>
            </parameter>
        </parameters>
    </tool_description>
    <tool_description>
        <tool_name>get_product</tool_name>
        <description>Obtém informações de um produto pelo seu ID.</description>
        <parameters>
            <parameter>
                <name>product_id</name>
                <type>int</type>
                <description>O ID do produto a ser recuperado.</description>
            </parameter>
        </parameters>
    </tool_description>
    <tool_description>
        <tool_name>add_user</tool_name>
        <description>Adiciona um novo usuário ao banco de dados.</description>
        <parameters>
            <parameter>
                <name>name</name>
                <type>str</type>
                <description>O nome do novo usuário.</description>
            </parameter>
            <parameter>
                <name>email</name>
                <type>str</type>
                <description>O email do novo usuário.</description>
            </parameter>
        </parameters>
    </tool_description>
    <tool_description>
        <tool_name>add_product</tool_name>
        <description>Adiciona um novo produto ao banco de dados.</description>
        <parameters>
            <parameter>
                <name>name</name>
                <type>str</type>
                <description>O nome do novo produto.</description>
            </parameter>
            <parameter>
                <name>price</name>
                <type>float</type>
                <description>O preço do novo produto.</description>
            </parameter>
        </parameters>
    </tool_description>
</tools>
"""

# Combina com a explicação geral do uso de ferramentas
# system_prompt_db = system_prompt_tools_general_explanation + system_prompt_tools_specific_tools_sql

# Exemplos de perguntas do notebook original para testar seu system_prompt_db:
# exemplos_db = [
#     "Adicione um usuário ao banco de dados chamado Deborah.", # Espera add_user
#     "Adicione um produto ao banco de dados chamado Thingo", # Espera add_product
#     "Diga-me o nome do Usuário 2", # Espera get_user
#     "Diga-me o nome do Produto 3" # Espera get_product
# ]

# stop_sequences_tool_call = ["</function_calls>"]

# for exemplo_pergunta in exemplos_db:
#     mensagem_usuario = {"role": "user", "content": exemplo_pergunta}
#     print(f"Pergunta do Usuário: {exemplo_pergunta}")
#     resposta_chamada_ferramenta_db = get_completion(
#         messages=[mensagem_usuario],
#         system_prompt=system_prompt_db,
#         stop_sequences=stop_sequences_tool_call
#     )
#     print("Chamada de ferramenta de Claude:")
#     print(resposta_chamada_ferramenta_db)
#     print("*********\n")
    # Aqui você adicionaria a lógica para analisar 'resposta_chamada_ferramenta_db',
    # chamar a função Python correspondente (get_user, add_product, etc.),
    # formatar o resultado em <function_results> e enviar de volta para Claude para a resposta final.
```

Se você fez corretamente, as mensagens de chamada de função devem invocar as funções `add_user`, `add_product`, `get_user` e `get_product` corretamente.

Para crédito extra, adicione algumas células de código e escreva o código de análise de parâmetros. Em seguida, chame as funções com os parâmetros que Claude lhe der para ver o estado do "banco de dados" após a chamada.

❓ Se você quiser ver uma possível solução, o notebook original permite importá-la com `from hints import exercise_10_2_1_solution; print(exercise_10_2_1_solution)`.

### Parabéns!

Parabéns por aprender sobre uso de ferramentas e chamada de função! Vá para a última seção do apêndice se quiser aprender mais sobre busca e RAG (Retrieval Augmented Generation).

---

## <a name="playground-de-exemplos"></a>Playground de Exemplos

Esta é uma área para você experimentar livremente com os exemplos de prompt mostrados nesta lição e ajustar os prompts para ver como isso pode afetar as respostas de Claude. Tente definir suas próprias ferramentas e veja se consegue fazer Claude usá-las!

Lembre-se de que você precisará:
1.  Definir suas ferramentas no `system_prompt` (usando `system_prompt_tools_general_explanation` + suas definições de ferramenta).
2.  Fazer uma pergunta inicial a Claude.
3.  Analisar a resposta de Claude para a tag `<function_calls>`.
4.  Executar a função (simulada) em seu código.
5.  Enviar os resultados de volta para Claude dentro de tags `<function_results>`.
6.  Obter a resposta final de Claude.

```python
# Exemplo de Playground: Tente com a ferramenta calculadora ou defina uma nova!

# 1. Defina seu system_prompt_playground aqui (combine a parte geral com suas ferramentas)
# system_prompt_playground = system_prompt_tools_general_explanation + """
# <tools>
#   <tool_description>
#     <tool_name>minha_ferramenta_fantastica</tool_name>
#     <description>Descreve o que sua ferramenta faz.</description>
#     <parameters>
#       <parameter>
#         <name>param1</name>
#         <type>str</type>
#         <description>Descrição do param1.</description>
#       </parameter>
#     </parameters>
#   </tool_description>
# </tools>
# """

# 2. Pergunta inicial do usuário
# pergunta_usuario_pg = "Use minha_ferramenta_fantastica com param1='ola'."

# mensagens_pg_passo1 = [{"role": "user", "content": pergunta_usuario_pg}]
# stop_sequences_pg = ["</function_calls>"]

# 3. Primeira chamada a Claude
# resposta_claude_passo1_pg = get_completion(
#     messages=mensagens_pg_passo1,
#     system_prompt=system_prompt_playground,
#     stop_sequences=stop_sequences_pg
# )
# print("Passo 1 - Resposta de Claude (chamada de ferramenta esperada):\n", resposta_claude_passo1_pg)

# if resposta_claude_passo1_pg and "<invoke name=\"minha_ferramenta_fantastica\"" in resposta_claude_passo1_pg:
#     # 4. Simule a execução da ferramenta
#     # param1_valor = find_parameter(resposta_claude_passo1_pg, "param1") # Adapte find_parameter se necessário
#     # print(f"Simulando execução de minha_ferramenta_fantastica com param1='{param1_valor}'")
#     # resultado_ferramenta_pg = f"A ferramenta foi executada com sucesso com '{param1_valor}'!"

#     # 5. Formate e envie o resultado da ferramenta de volta
#     # invoke_results_pg = [{'tool_name': 'minha_ferramenta_fantastica', 'tool_result': resultado_ferramenta_pg}]
#     # resultado_formatado_pg = construct_successful_function_run_injection_prompt(invoke_results_pg)

#     # resposta_completa_chamada_ferramenta_pg = resposta_claude_passo1_pg + "</function_calls>" # Complete o XML

#     mensagens_pg_passo2 = [
#         {"role": "user", "content": pergunta_usuario_pg},
#         {"role": "assistant", "content": resposta_completa_chamada_ferramenta_pg},
#         {"role": "user", "content": resultado_formatado_pg}
#     ]

#     # 6. Obtenha a resposta final
#     resposta_final_pg = get_completion(
#         messages=mensagens_pg_passo2,
#         system_prompt=system_prompt_playground
#     )
#     print("\nPasso 2 - Resposta final de Claude:\n", resposta_final_pg)
# else:
#     print("Claude não chamou a ferramenta como esperado ou houve um erro.")

```
