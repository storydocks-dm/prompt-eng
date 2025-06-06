# Capítulo 06: "Precognição" e Pensamento Passo a Passo

- [Lição](#licao)
- [Exercícios](#exercicios)
- [Playground de Exemplos](#playground-de-exemplos)

## <a name="configuracao"></a>Configuração

Execute a célula de configuração a seguir para carregar sua chave de API e estabelecer a função auxiliar `get_completion`.

> **Nota:** O comando `!pip install anthropic` é para instalar a biblioteca em ambientes Jupyter. Os comandos `%store -r API_KEY` e `%store -r MODEL_NAME` são específicos do IPython. Em um script Python padrão, defina `API_KEY` e `MODEL_NAME` diretamente. A função `get_completion` utilizada neste capítulo é a mesma da anterior, incluindo o parâmetro `prefill`.

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
    # No notebook original, um prefill vazio ainda era passado como um turno de assistente.
    # A lógica do SDK da Anthropic para Python espera conteúdo não vazio se um turno de assistente for explicitamente adicionado.
    # Para manter a consistência com o comportamento implícito do notebook (onde um "" ainda cria um turno de assistente),
    # adicionamos o turno do assistente mesmo com prefill vazio.
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

## <a name="licao"></a>Lição

Se alguém te acordasse e imediatamente começasse a fazer várias perguntas complicadas às quais você tivesse que responder na hora, como você se sairia? Provavelmente não tão bem quanto se tivesse tempo para **pensar na sua resposta primeiro**.

Adivinha? O Claude é da mesma forma.

**Dar a Claude tempo para pensar passo a passo (uma forma de "precognição" ou raciocínio em cadeia, do inglês "chain of thought prompting") às vezes o torna mais preciso**, particularmente para tarefas complexas. No entanto, **o "pensamento" só conta quando é expresso externamente**. Você não pode pedir a Claude para pensar, mas fornecer apenas a resposta final – neste caso, nenhum pensamento real (rastreável) ocorreu ou foi demonstrado pelo modelo em sua saída. A ideia é fazer com que o modelo externe seu processo de raciocínio, o que muitas vezes leva a melhores resultados.

Uma maneira comum de implementar isso é instruir Claude a usar uma seção de "rascunho" (scratchpad) ou tags XML específicas (como `<scratchpad>`, `<thinking_process>`, `<brainstorm>`) para delinear seus pensamentos, cálculos intermediários ou etapas de análise antes de fornecer a resposta final. Isso não apenas melhora a qualidade da resposta, mas também torna o processo de tomada de decisão do modelo mais transparente.

### Exemplos

No prompt abaixo, fica claro para um leitor humano que a segunda frase contradiz a primeira. Mas **Claude leva a palavra "não relacionado" muito literalmente** e não percebe a ironia ou o contexto implícito.

> **Nota:** Este exemplo mostra Claude interpretando mal uma crítica de filme devido a uma aparente contradição que ele não resolve sem orientação para pensar passo a passo. (Lembre-se de ter `API_KEY` e `MODEL_NAME` configurados e `client` inicializado para executar.)
```python
# Prompt
PROMPT = """A avaliação deste filme é positiva ou negativa?

Este filme explodiu minha mente com sua frescura e originalidade. Em notícias totalmente não relacionadas, tenho vivido debaixo de uma pedra desde o ano 1900."""
# Original: """Is this movie review sentiment positive or negative?\n\nThis movie blew my mind with its freshness and originality. In totally unrelated news, I have been living under a rock since the year 1900.""""""

# Imprime a resposta do Claude
# print(get_completion(PROMPT))
```

Para melhorar a resposta de Claude, vamos **permitir que Claude reflita sobre as coisas antes de responder**. Fazemos isso literalmente especificando os passos que Claude deve seguir para processar e pensar sobre sua tarefa. Juntamente com um toque de atribuição de papéis (role prompting), isso capacita Claude a entender a crítica mais profundamente. Pedimos a ele para articular os argumentos para cada lado em tags XML antes de dar a resposta final.

> **Nota:** Aqui, instruímos Claude a "pensar em voz alta", listando argumentos positivos e negativos em tags XML antes de decidir. Isso o ajuda a identificar a nuance.
```python
# System prompt (Prompt de Sistema)
SYSTEM_PROMPT = "Você é um leitor experiente de críticas de cinema."
# Original: "You are a savvy reader of movie reviews."

# Prompt
PROMPT = """A avaliação desta crítica é positiva ou negativa? Primeiro, escreva os melhores argumentos para cada lado nas tags XML <argumento-positivo> e <argumento-negativo>, depois responda.

Este filme explodiu minha mente com sua frescura e originalidade. Em notícias totalmente não relacionadas, tenho vivido debaixo de uma pedra desde 1900."""
# Original: """Is this review sentiment positive or negative? First, write the best arguments for each side in <positive-argument> and <negative-argument> XML tags, then answer.\n\nThis movie blew my mind with its freshness and originality. In totally unrelated news, I have been living under a rock since 1900."""

# Imprime a resposta do Claude
# print(get_completion(PROMPT, SYSTEM_PROMPT))
```

**Claude às vezes é sensível à ordem**. Este exemplo está na fronteira da capacidade de Claude de entender texto com nuances, e quando trocamos a ordem dos argumentos do exemplo anterior para que o negativo venha primeiro e o positivo em segundo, isso muda a avaliação geral de Claude para positiva.

Na maioria das situações (mas não em todas, o que é confuso), **Claude é mais propenso a escolher a segunda de duas opções**, possivelmente porque em seus dados de treinamento da web, as segundas opções eram mais propensas a estarem corretas.

> **Nota:** Este exemplo demonstra a sensibilidade à ordem ao pedir os argumentos em uma ordem diferente (<argumento-negativo> primeiro). O resultado pode mudar.
```python
# Prompt
PROMPT = """A avaliação desta crítica é negativa ou positiva? Primeiro escreva os melhores argumentos para cada lado nas tags XML <argumento-negativo> e <argumento-positivo>, depois responda.

Este filme explodiu minha mente com sua frescura e originalidade. Sem relação, tenho vivido debaixo de uma pedra desde 1900."""
# Original: """Is this review sentiment negative or positive? First write the best arguments for each side in <negative-argument> and <positive-argument> XML tags, then answer.\n\nThis movie blew my mind with its freshness and originality. Unrelatedly, I have been living under a rock since 1900."""

# Imprime a resposta do Claude
# print(get_completion(PROMPT))
```

**Permitir que Claude pense pode mudar a resposta de Claude de incorreta para correta**. É simples assim em muitos casos onde Claude comete erros!

Vamos analisar um exemplo em que a resposta de Claude está incorreta para ver como pedir a Claude para pensar pode corrigir isso.

> **Nota:** Claude inicialmente falha em nomear um filme com um ator nascido em 1956.
```python
# Prompt
PROMPT = "Nomeie um filme famoso estrelado por um ator que nasceu no ano de 1956."
# Original: "Name a famous movie starring an actor who was born in the year 1956."

# Imprime a resposta do Claude
# print(get_completion(PROMPT))
```

Vamos corrigir isso pedindo a Claude para pensar passo a passo, desta vez em tags `<brainstorm>`.

> **Nota:** Pedir a Claude para fazer um "brainstorm" sobre atores e seus anos de nascimento em tags XML antes de responder ajuda-o a encontrar a resposta correta.
```python
# Prompt
PROMPT = "Nomeie um filme famoso estrelado por um ator que nasceu no ano de 1956. Primeiro, faça um brainstorm sobre alguns atores e seus anos de nascimento em tags <brainstorm>, depois dê sua resposta."
# Original: "Name a famous movie starring an actor who was born in the year 1956. First brainstorm about some actors and their birth years in <brainstorm> tags, then give your answer."

# Imprime a resposta do Claude
# print(get_completion(PROMPT))
```

Se você gostaria de experimentar os prompts da lição sem alterar nenhum conteúdo acima, role até o final do notebook da lição para visitar o [**Playground de Exemplos**](#playground-de-exemplos).

---

## <a name="exercicios"></a>Exercícios
- [Exercício 6.1 - Classificando Emails](#exercicio-61---classificando-emails)
- [Exercício 6.2 - Formatação da Classificação de Emails](#exercicio-62---formatacao-da-classificacao-de-emails)

### <a name="exercicio-61---classificando-emails"></a>Exercício 6.1 - Classificando Emails
Neste exercício, instruiremos Claude a classificar emails nas seguintes categorias:
- (A) Pergunta de pré-venda
- (B) Item quebrado ou com defeito
- (C) Dúvida sobre cobrança
- (D) Outro (explique, por favor)

Para a primeira parte do exercício, altere o `PROMPT` para **fazer Claude produzir a classificação correta e SOMENTE a classificação**. Sua resposta precisa **incluir a letra (A - D) da escolha correta, com os parênteses, bem como o nome da categoria**.

> **Nota do Exercício:** O objetivo é criar um `PROMPT_TEMPLATE` que instrua Claude a classificar um `email` (variável) em uma das quatro categorias fornecidas e a responder apenas com a letra e o nome da categoria (ex: "(A) Pergunta de pré-venda"). O código original do notebook iterava por uma lista de emails e verificava se a resposta de Claude correspondia à categoria correta usando expressões regulares. Para este exercício em Markdown, você focará em criar o template do prompt para um único email.
```python
# Template de prompt com um placeholder para o conteúdo variável - MODIFIQUE AQUI
PROMPT_TEMPLATE = """Por favor, classifique o seguinte email em uma das categorias abaixo. Sua resposta deve conter apenas a letra e o nome completo da categoria.

Categorias:
(A) Pergunta de pré-venda
(B) Item quebrado ou com defeito
(C) Dúvida sobre cobrança
(D) Outro (explique, por favor)

Email para classificar:
<email_a_ser_classificado>{email}</email_a_ser_classificado>
"""

# Exemplo de email para teste (do conjunto original, categoria B)
EMAIL_EXEMPLO = "Hi -- My Mixmaster4000 is producing a strange noise when I operate it. It also smells a bit smoky and plasticky, like burning electronics.  I need a replacement."

# Formata o prompt com o email de exemplo
# formatted_prompt = PROMPT_TEMPLATE.format(email=EMAIL_EXEMPLO)

# Prefill para a resposta de Claude, se houver (não usado neste exercício específico)
# PREFILL = ""

# # Lógica de avaliação original (simplificada para um email):
# # A resposta esperada para EMAIL_EXEMPLO seria algo como "(B) Item quebrado ou com defeito"
# # O código original verificaria se a resposta continha, por exemplo, "B\) B" para a categoria B.
# # print("Prompt enviado:")
# # print(formatted_prompt)
# # print("\nResposta do Claude:")
# # response = get_completion(formatted_prompt)
# # print(response)
# # expected_pattern = r"\(B\) Item quebrado ou com defeito"
# # grade = bool(re.search(expected_pattern, response, re.IGNORECASE))
# # print("\nExercício resolvido corretamente (para este exemplo):", grade)

# Para testar em Markdown:
# print("Prompt formatado:")
# print(formatted_prompt)
# print("\nResposta do Claude:")
# print(get_completion(formatted_prompt))
```

❓ Se você quiser uma dica:
> **Dica (Exercício 6.1):** A solução do notebook original era: `PROMPT = """Please classify the following email as (A) Pre-sale question, (B) Broken or defective item, (C) Billing question, or (D) Other (please explain): {email}. Output only the letter and the name of the category."""` (Tradução: `PROMPT = """Por favor, classifique o seguinte email como (A) Pergunta de pré-venda, (B) Item quebrado ou com defeito, (C) Dúvida sobre cobrança, ou (D) Outro (explique, por favor): {email}. Produza apenas a letra e o nome da categoria."""`)

Ainda emperrado? A solução do notebook original para o prompt é fornecida na dica acima.

### <a name="exercicio-62---formatacao-da-classificacao-de-emails"></a>Exercício 6.2 - Formatação da Classificação de Emails
Neste exercício, vamos refinar a saída do prompt acima para produzir uma resposta formatada exatamente como queremos.

Use sua técnica de formatação de saída favorita para fazer Claude envolver APENAS a letra da classificação correta em tags `<answer></answer>`. Por exemplo, a resposta para o primeiro email (item quebrado) deve conter a string exata `<answer>B</answer>`.

> **Nota do Exercício:** O desafio é refinar o prompt do exercício anterior. Além de classificar o email, Claude deve agora formatar sua resposta para incluir apenas a letra da categoria correta, envolta em tags `<answer></answer>` (ex: `<answer>B</answer>`). Você pode usar técnicas como "speaking for Claude" (pré-preenchendo o `PREFILL`) ou instruir explicitamente o formato no `PROMPT`. A lógica de avaliação original verificaria a presença exata dessa string formatada.
```python
# Template de prompt com um placeholder para o conteúdo variável - MODIFIQUE OU USE PREFILL
PROMPT_TEMPLATE = """Por favor, classifique o seguinte email em uma das categorias abaixo:
(A) Pergunta de pré-venda
(B) Item quebrado ou com defeito
(C) Dúvida sobre cobrança
(D) Outro (explique, por favor)

Email para classificar:
<email_a_ser_classificado>{email}</email_a_ser_classificado>

Sua resposta deve ser APENAS a letra da categoria correta, envolta nas tags <answer> e </answer>. Por exemplo: <answer>X</answer>."""


# Prefill para a resposta de Claude, se for usar "speaking for Claude" - MODIFIQUE SE NECESSÁRIO
PREFILL = "<answer>" # Guia Claude a começar com a tag

# Exemplo de email para teste (categoria B)
EMAIL_EXEMPLO = "Hi -- My Mixmaster4000 is producing a strange noise when I operate it. It also smells a bit smoky and plasticky, like burning electronics.  I need a replacement."

# Formata o prompt com o email de exemplo
# formatted_prompt = PROMPT_TEMPLATE.format(email=EMAIL_EXEMPLO)

# # Lógica de avaliação original (simplificada para um email):
# # A resposta esperada para EMAIL_EXEMPLO seria "<answer>B</answer>"
# # O código original verificaria a presença exata de "<answer>B</answer>".
# # print("Prompt enviado:")
# # print(formatted_prompt)
# # if PREFILL: print("\nPrefill do Assistente:\n" + PREFILL)
# # print("\nResposta do Claude:")
# # response = get_completion(formatted_prompt, prefill=PREFILL)
# # print(response)
# # expected_output = "<answer>B</answer>"
# # grade = (response.strip() == expected_output)
# # print("\nExercício resolvido corretamente (para este exemplo):", grade)

# Para testar em Markdown:
# print("Prompt formatado:")
# print(formatted_prompt)
# if PREFILL: print("\nPrefill do Assistente:\n" + PREFILL)
# print("\nResposta do Claude:")
# print(get_completion(formatted_prompt, prefill=PREFILL))
```

❓ Se você quiser uma dica:
> **Dica (Exercício 6.2):** A dica original sugere: "Você pode usar a técnica de pré-preenchimento (prefill) com `PREFILL = \"<answer>\"` ou pode especificar o formato de saída desejado no próprio prompt do usuário."

### Parabéns!

Se você resolveu todos os exercícios até este ponto, está pronto para passar para o próximo capítulo. Bom trabalho com os prompts!

---

## <a name="playground-de-exemplos"></a>Playground de Exemplos

Esta é uma área para você experimentar livremente com os exemplos de prompt mostrados nesta lição e ajustar os prompts para ver como isso pode afetar as respostas do Claude. Lembre-se de que para executar os blocos de código Python, você precisará ter configurado sua chave de API (`API_KEY`), o nome do modelo (`MODEL_NAME`) e inicializado o `client` da Anthropic, conforme mostrado na seção de [Configuração](#configuracao).

> **Playground:** Crítica de filme sem "pensamento passo a passo".
```python
# Prompt
PROMPT = """A avaliação deste filme é positiva ou negativa?

Este filme explodiu minha mente com sua frescura e originalidade. Em notícias totalmente não relacionadas, tenho vivido debaixo de uma pedra desde o ano 1900."""

# Imprime a resposta do Claude
# print(get_completion(PROMPT))
```

> **Playground:** Crítica de filme com "pensamento passo a passo" (argumentos positivo/negativo).
```python
# System prompt (Prompt de Sistema)
SYSTEM_PROMPT = "Você é um leitor experiente de críticas de cinema."

# Prompt
PROMPT = """A avaliação desta crítica é positiva ou negativa? Primeiro, escreva os melhores argumentos para cada lado nas tags XML <argumento-positivo> e <argumento-negativo>, depois responda.

Este filme explodiu minha mente com sua frescura e originalidade. Em notícias totalmente não relacionadas, tenho vivido debaixo de uma pedra desde 1900."""

# Imprime a resposta do Claude
# print(get_completion(PROMPT, SYSTEM_PROMPT))
```

> **Playground:** Crítica de filme com "pensamento passo a passo" (ordem dos argumentos trocada).
```python
# Prompt
PROMPT = """A avaliação desta crítica é negativa ou positiva? Primeiro escreva os melhores argumentos para cada lado nas tags XML <argumento-negativo> e <argumento-positivo>, depois responda.

Este filme explodiu minha mente com sua frescura e originalidade. Sem relação, tenho vivido debaixo de uma pedra desde 1900."""

# Imprime a resposta do Claude
# print(get_completion(PROMPT))
```

> **Playground:** Pergunta sobre ator/filme sem "pensamento passo a passo".
```python
# Prompt
PROMPT = "Nomeie um filme famoso estrelado por um ator que nasceu no ano de 1956."

# Imprime a resposta do Claude
# print(get_completion(PROMPT))
```

> **Playground:** Pergunta sobre ator/filme com "pensamento passo a passo" (usando tags `<brainstorm>`).
```python
# Prompt
PROMPT = "Nomeie um filme famoso estrelado por um ator que nasceu no ano de 1956. Primeiro, faça um brainstorm sobre alguns atores e seus anos de nascimento em tags <brainstorm>, depois dê sua resposta."

# Imprime a resposta do Claude
# print(get_completion(PROMPT))
```
