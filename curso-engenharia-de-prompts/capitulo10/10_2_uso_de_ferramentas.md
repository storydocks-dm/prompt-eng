# Apêndice B: Uso de Ferramentas (Tool Use)

Bem-vindo ao Apêndice B! O "Uso de Ferramentas" (Tool Use), também conhecido como "Chamada de Função" (Function Calling), é uma capacidade poderosa que permite a Claude interagir com sistemas e fontes de dados externos. Ao definir ferramentas que Claude pode "chamar", você o capacita a obter informações em tempo real, executar cálculos específicos, interagir com suas APIs e muito mais, superando as limitações de seu conhecimento de treinamento estático. Este capítulo detalhará o fluxo de interação e como implementar essa funcionalidade com base nos exemplos do notebook original.

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
    if 'client' not in globals() or not isinstance(client, anthropic.Anthropic):
        print("Erro: O cliente Anthropic (client) não foi inicializado corretamente.")
        return "Erro de configuração: cliente não definido."
    # MODEL_NAME global não é usado aqui, pois o modelo é fixado para Sonnet.

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
    # Para uma implementação robusta de tool use, você analisaria response_obj.stop_reason
    # (que seria 'tool_use') e o conteúdo de response_obj.content que pode incluir
    # múltiplos blocos, um dos quais seria do tipo 'tool_use' contendo 'id', 'name', 'input'.
    # Consulte a documentação oficial da Anthropic para o formato de resposta mais atual e completo.
    # Por simplicidade e para seguir o fluxo do notebook original, retornamos o texto do primeiro bloco,
    # que para chamadas de ferramenta neste exemplo é o XML da chamada.
    if response_obj.content and isinstance(response_obj.content[0], anthropic.types.TextBlock):
        return response_obj.content[0].text

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

1.  **Definição da Ferramenta (Lado do Usuário/Aplicação):** Você descreve as ferramentas disponíveis para Claude em um "system prompt" (prompt de sistema). Esta descrição inclui o nome da ferramenta, sua finalidade, e os parâmetros que ela aceita (com nome, tipo e descrição), no formato XML específico que os exemplos deste notebook utilizam.
2.  **Requisição do Usuário:** O usuário faz uma pergunta ou dá uma instrução a Claude.
3.  **Claude Solicita o Uso da Ferramenta:** Se Claude determinar que uma ferramenta pode ajudar a responder à requisição do usuário, sua resposta incluirá um bloco XML especial, como `<function_calls><invoke name="NOME_DA_FERRAMENTA"><antml:parameter name="NOME_DO_PARAMETRO">VALOR_DO_PARAMETRO</antml:parameter>...</invoke></function_calls>`. A geração da resposta de Claude é interrompida (usando `stop_sequences` como `"</function_calls>"`) logo após ele emitir este bloco (sem a tag de fechamento `</function_calls>` na resposta real se a stop_sequence funcionar).
    *(**Nota Importante sobre `tool_id`**: Implementações mais recentes e robustas de uso de ferramentas, conforme a documentação oficial da Anthropic, podem usar um `tool_use_id` na requisição de Claude e um `tool_id` correspondente no resultado da ferramenta para rastreamento preciso, especialmente com múltiplas chamadas de ferramenta. Os exemplos neste apêndice do notebook original usam uma forma simplificada sem esse ID explícito no XML da chamada de função. Sempre consulte a documentação oficial para as melhores práticas atuais.)*
4.  **Execução da Ferramenta pela Aplicação (Lado do Usuário/Aplicação):** Sua aplicação detecta e analisa este bloco `<function_calls>`. Ela então executa a ferramenta correspondente (ex: chama uma API externa, executa uma função Python local) com os parâmetros fornecidos por Claude.
5.  **Envio do Resultado da Ferramenta de Volta para Claude (Lado do Usuário/Aplicação):** Sua aplicação formata o resultado (ou erro) da execução da ferramenta em outro bloco XML específico, `<function_results><result><tool_name>NOME_DA_FERRAMENTA_USADA</tool_name><stdout>RESULTADO_DA_FERRAMENTA</stdout></result></function_results>`, e envia isso de volta para Claude como uma nova mensagem do `user` no histórico da conversa.
    *(Nota sobre `tool_id`: Ao usar `tool_id`s conforme a documentação mais recente, o resultado da ferramenta deve referenciar o `tool_id` da chamada original.)*
6.  **Resposta Final de Claude:** Claude recebe o resultado da ferramenta e o utiliza para formular uma resposta final e mais informada à pergunta original do usuário.

**Benefícios do Uso de Ferramentas:**
*   **Estende as Capacidades de Claude:** Permite que Claude vá além de seu conhecimento de treinamento.
*   **Tarefas Multi-Etapas Complexas:** Facilita a execução de tarefas que requerem múltiplos passos ou fontes de informação.
*   **Maior Precisão e Confiabilidade:** Para tarefas que LLMs não realizam bem sozinhos (como aritmética complexa), delegar a uma ferramenta garante precisão.
*   **Interatividade:** Permite que Claude interaja com o mundo exterior e realize ações.

**Estrutura para Uso de Ferramentas (Conforme o Notebook):**
1.  Um **prompt de sistema detalhado**.
2.  A **lógica de controle em sua aplicação**.

**Roteiro para Uso de Ferramentas (Nota do Notebook Original):**
*Esta lição ensina o formato de uso de ferramentas da Anthropic na época da criação do notebook. A Anthropic está continuamente atualizando e aprimorando a funcionalidade de uso de ferramentas. Verifique sempre a [documentação oficial da Anthropic sobre Tool Use](https://docs.anthropic.com/claude/docs/tool-use) para as informações e formatos mais recentes e robustos.*

---
## <a name="exemplo-calculadora"></a>Exemplo Detalhado: Ferramenta Calculadora

Para habilitar o uso de ferramentas em Claude, começamos com o prompt de sistema.

**1. Prompt de Sistema para Uso de Ferramentas**

Este prompt tem duas partes:
    a.  Uma explicação geral de como o uso de ferramentas funciona e o formato XML específico (`<function_calls>`, `<invoke>`, `<antml:parameter>`) que Claude deve usar.
    b.  Uma descrição específica das ferramentas disponíveis (neste caso, uma calculadora).

```python
# Parte 1: Explicação geral sobre uso de ferramentas para o prompt de sistema
system_prompt_tools_general_explanation = """Você tem acesso a um conjunto de funções que pode usar para responder à pergunta do usuário. Isso inclui acesso a um
ambiente de computação em sandbox. Você NÃO tem atualmente a capacidade de inspecionar arquivos ou interagir com
recursos externos, exceto invocando as funções abaixo.

Você pode invocar uma ou mais funções escrevendo um bloco "<function_calls>" como o seguinte como parte de sua
resposta ao usuário:
<function_calls>
<invoke name="NOME_DA_FUNCAO">
<antml:parameter name="NOME_DO_PARAMETRO">VALOR_DO_PARAMETRO</antml:parameter>
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

> **Nota:** Primeira chamada a Claude. Ele deve responder com uma solicitação `<function_calls>`, e a geração será interrompida pela `stop_sequences`.
```python
# Pergunta do usuário que requer a calculadora
# mensagem_multiplicacao = {
#     "role": "user",
#     "content": "Multiplique 1.984.135 por 9.343.116"
# }

# stop_sequences_tool_call = ["</function_calls>"]

# resposta_chamada_funcao = get_completion(
#     messages=[mensagem_multiplicacao],
#     system_prompt=system_prompt_calculadora,
#     stop_sequences=stop_sequences_tool_call
# )
# print("Resposta de Claude solicitando a ferramenta (parada por stop_sequence):")
# print(resposta_chamada_funcao)
# Saída esperada (sem </function_calls>): <function_calls><invoke name="calculator"><antml:parameter name="first_operand">1984135</parameter><antml:parameter name="second_operand">9343116</parameter><antml:parameter name="operator">*</parameter></invoke>
```

**3. Execução da Ferramenta (Simulada)**

Definimos a função Python e extraímos os parâmetros da resposta de Claude.
```python
def do_pairwise_arithmetic(num1, num2, operation):
    if operation == '+': return num1 + num2
    elif operation == "-": return num1 - num2
    elif operation == "*": return num1 * num2
    elif operation == "/": return num1 / num2 if num2 != 0 else "Erro: Divisão por zero"
    else: return "Erro: Operação não suportada."

# ATENÇÃO: Esta função `find_parameter` é uma implementação simplificada para fins de demonstração
# e depende da estrutura XML exata do notebook (<antml:parameter>).
# Em aplicações de produção, use um parser XML robusto.
def find_parameter(message, parameter_name):
    parameter_start_string = f"<antml:parameter name=\\"{parameter_name}\\\">"
    start_index = message.find(parameter_start_string)
    if start_index == -1: return None
    start = start_index + len(parameter_start_string)
    end_tag = "</antml:parameter>"
    end_index = message.find(end_tag, start)
    if end_index == -1: return message[start:] # Ou algum tratamento de erro
    return message[start:end_index]

# Supondo que 'resposta_chamada_funcao' contenha a chamada da ferramenta.
# primeiro_operando = find_parameter(resposta_chamada_funcao, "first_operand")
# segundo_operando = find_parameter(resposta_chamada_funcao, "second_operand")
# operador = find_parameter(resposta_chamada_funcao, "operator")

# resultado_calculo = None
# if primeiro_operando and segundo_operando and operador:
#     try:
#         resultado_calculo = do_pairwise_arithmetic(int(primeiro_operando), int(segundo_operando), operador)
#         print(f"Resultado do cálculo: {resultado_calculo:,}")
#     except ValueError:
#         print("Erro ao converter operandos para inteiro.")
#         resultado_calculo = "Erro de conversão de operando"
```

**4. Formatação do Resultado da Ferramenta**
O resultado é formatado em XML para Claude.
```python
def construct_successful_function_run_injection_prompt(invoke_results):
    # invoke_results: lista de dicts, cada um com 'tool_name', 'tool_result'
    # (e opcionalmente 'tool_id' para implementações mais recentes)
    return ("<function_results>\n" +
            '\n'.join(
                f"<result>\n<tool_name>{res['tool_name']}</tool_name>\n<stdout>\n{str(res['tool_result'])}\n</stdout>\n</result>"
                for res in invoke_results
            ) +
            "\n</function_results>")

# formatted_results = [{'tool_name': 'calculator', 'tool_result': resultado_calculo}]
# resultado_funcao_para_claude = construct_successful_function_run_injection_prompt(formatted_results)
# print("Resultado formatado para Claude:\n", resultado_funcao_para_claude)
```

**5. Segunda Chamada a Claude com o Resultado**
Enviamos o resultado da ferramenta de volta.
```python
# 'resposta_chamada_funcao' é a saída parcial de Claude. Completamos o XML.
# resposta_completa_chamada_funcao = resposta_chamada_funcao + "</function_calls>"

# mensagens_para_final = [
#     mensagem_multiplicacao, # Pergunta original
#     {"role": "assistant", "content": resposta_completa_chamada_funcao}, # Chamada de ferramenta de Claude
#     {"role": "user", "content": resultado_funcao_para_claude} # Resultado da ferramenta
# ]

# resposta_final_calculo = get_completion(messages=mensagens_para_final, system_prompt=system_prompt_calculadora)
# print("Resposta final de Claude:\n", resposta_final_calculo)
```

**6. Claude Não Usa a Ferramenta se Não For Necessário**
```python
# mensagem_nao_calculo = {"role": "user", "content": "Qual é a capital da França?"}
# resposta_sem_chamada_ferramenta = get_completion(
#    messages=[mensagem_nao_calculo],
#    system_prompt=system_prompt_calculadora,
#    stop_sequences=stop_sequences_tool_call # Ainda usamos para ver se ele tentaria chamar
# )
# print("Resposta de Claude (sem chamada de ferramenta esperada):\n", resposta_sem_chamada_ferramenta)
# Se Claude não chamar a ferramenta, 'resposta_sem_chamada_ferramenta' será a resposta direta.
```

---
## <a name="exercicio-db"></a>Exercício: Ferramentas de Banco de Dados Simulado
Defina um prompt de sistema para quatro ferramentas de banco de dados (`get_user`, `get_product`, `add_user`, `add_product`).
```python
# Banco de dados e funções (como fornecido no notebook)
db = { # ... (definição do db) ... }
def get_user(user_id: int): # ... (código da função) ...
def get_product(product_id: int): # ... (código da função) ...
def add_user(name: str, email: str): # ... (código da função) ...
def add_product(name: str, price: float): # ... (código da função) ...
```

> **Nota do Exercício:** Sua tarefa é criar a string `system_prompt_tools_specific_tools_sql` com as definições XML para as quatro ferramentas de banco de dados, seguindo o formato do exemplo da calculadora.
```python
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
                <description>O email do novo usuário. (Opcional, pode ser inferido se não fornecido para simplicidade do exemplo)</description>
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
# system_prompt_db = system_prompt_tools_general_explanation + system_prompt_tools_specific_tools_sql
# (Restante do código de teste do exercício como no arquivo atual)
```
(O restante do exercício e playground seguirão a estrutura já presente no arquivo, com traduções e pequenas clarificações.)

---
O uso de ferramentas transforma Claude de um gerador de texto em um agente capaz de interagir com o mundo exterior e realizar ações ou buscar informações dinâmicas. Ao definir cuidadosamente suas ferramentas e gerenciar o fluxo de chamadas e resultados, você pode estender drasticamente as capacidades de Claude, tornando-o um componente ainda mais poderoso em suas aplicações. Lembre-se de que a clareza na definição da ferramenta e a robustez na análise das respostas de Claude são chave para uma implementação bem-sucedida. Sempre consulte a documentação oficial da Anthropic para as práticas mais recentes e formatos de Tool Use.
