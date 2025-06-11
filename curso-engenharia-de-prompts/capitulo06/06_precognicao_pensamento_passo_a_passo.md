# Capítulo 06: "Precognição" e Pensamento Passo a Passo

Bem-vindo ao Capítulo 6! Muitas vezes, para que Claude chegue à melhor resposta, especialmente em tarefas complexas que envolvem raciocínio, análise ou processamento de informações em várias etapas, é útil não apenas pedir o resultado final. Assim como os humanos se beneficiam ao "pensar no papel", podemos instruir Claude a "pensar passo a passo" ou usar um "rascunho" (scratchpad) para externalizar seu processo de raciocínio antes de fornecer a resposta definitiva. Este capítulo explora como induzir esse comportamento, melhorando a precisão e a transparência das respostas de Claude.

- [Lição](#licao)
- [Exercícios](#exercicios)
- [Playground de Exemplos](#playground-de-exemplos)

## <a name="configuracao"></a>Configuração

Execute a célula de configuração a seguir para carregar sua chave de API e estabelecer a função auxiliar `get_completion`.

> **Nota:** O comando `!pip install anthropic` é para instalar a biblioteca em ambientes Jupyter. Os comandos `%store -r API_KEY` e `%store -r MODEL_NAME` são específicos do IPython. Em um script Python padrão, defina `API_KEY` e `MODEL_NAME` diretamente. A função `get_completion` utilizada neste capítulo é a mesma da anterior (Capítulo 05), incluindo o parâmetro `prefill` e a lógica de sempre enviar um turno de assistente.

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
# Esta linha deve ser executada para que 'client' seja reconhecido.

def get_completion(prompt_do_usuario: str, system_prompt="", prefill=""):
    if 'client' not in globals() or not isinstance(client, anthropic.Anthropic):
        print("Erro: O cliente Anthropic (client) não foi inicializado corretamente.")
        return "Erro de configuração: cliente não definido."
    if 'MODEL_NAME' not in globals() or not MODEL_NAME:
        print("Erro: A variável MODEL_NAME não foi definida.")
        return "Erro de configuração: nome do modelo não definido."

    try:
        # Nota: O turno do assistente é incluído mesmo se prefill for uma string vazia,
        # para sinalizar a Claude que ele deve completar a partir dali, seguindo o padrão do notebook original.
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

## <a name="licao"></a>Lição

Se alguém te acordasse e imediatamente começasse a fazer várias perguntas complicadas às quais você tivesse que responder na hora, como você se sairia? Provavelmente não tão bem quanto se tivesse tempo para **pensar na sua resposta primeiro**.

Adivinha? O Claude é da mesma forma.

**Dar a Claude "tempo" (ou seja, espaço no prompt) para pensar passo a passo — uma forma de "precognição" ou raciocínio em cadeia (chain-of-thought prompting) — muitas vezes o torna mais preciso**, particularmente para tarefas complexas. No entanto, é crucial entender que **o "pensamento" só beneficia o resultado se for externalizado na resposta**. Você não pode pedir a Claude para pensar internamente e depois fornecer apenas a resposta final; para que a técnica funcione, Claude deve escrever seu processo de raciocínio. A ideia é fazer com que o modelo detalhe seu processo, o que frequentemente leva a conclusões melhores e mais confiáveis.

Uma maneira comum de implementar isso é instruir Claude a usar uma seção de "rascunho" (scratchpad) ou tags XML específicas (como `<scratchpad>`, `<processo_de_pensamento>`, `<brainstorm>`) para delinear seus pensamentos, realizar cálculos intermediários ou detalhar etapas de análise antes de fornecer a resposta final (que também pode ser solicitada em tags específicas como `<resposta_final>`). Isso não apenas melhora a qualidade da resposta, mas também torna o processo de tomada de decisão do modelo mais transparente e depurável.

### Exemplos

No prompt abaixo, para um leitor humano, a segunda frase claramente indica que a primeira é irônica ou dita por alguém sem muito conhecimento de cinema moderno. Mas **Claude, sem instruções para analisar profundamente, pode levar a frase "Em notícias totalmente não relacionadas" muito literalmente** e não perceber a implicação sobre a validade da crítica.

> **Nota:** Este exemplo mostra Claude interpretando mal uma crítica de filme devido a uma aparente contradição que ele não resolve sem orientação para pensar passo a passo. (Lembre-se de ter `API_KEY` e `MODEL_NAME` configurados e `client` inicializado para executar.)
```python
# Prompt
# PROMPT_CRITICA1 = """A avaliação deste filme é positiva ou negativa?
#
# Este filme explodiu minha mente com sua frescura e originalidade. Em notícias totalmente não relacionadas, tenho vivido debaixo de uma pedra desde o ano 1900."""

# Imprime a resposta do Claude
# print(get_completion(PROMPT_CRITICA1))
```

Para melhorar a resposta de Claude, vamos **permitir que Claude reflita sobre as coisas antes de responder**. Fazemos isso instruindo explicitamente Claude a considerar os argumentos para cada lado. Juntamente com um toque de atribuição de papéis (role prompting), isso capacita Claude a entender a crítica mais profundamente.

> **Nota:** Aqui, instruímos Claude a "pensar em voz alta", listando argumentos positivos e negativos em tags XML antes de decidir. Isso o ajuda a identificar a nuance da situação.
```python
# System prompt (Prompt de Sistema)
# SYSTEM_PROMPT_CRITICA = "Você é um leitor experiente de críticas de cinema, capaz de identificar nuances e ironias."

# Prompt
# PROMPT_CRITICA2 = """A avaliação desta crítica é positiva ou negativa? Primeiro, escreva os melhores argumentos para cada lado nas tags XML <argumento-positivo> e <argumento-negativo>, considerando o contexto completo da crítica. Depois, forneça sua conclusão final em tags <sentimento_final>.
#
# Crítica:
# Este filme explodiu minha mente com sua frescura e originalidade. Em notícias totalmente não relacionadas, tenho vivido debaixo de uma pedra desde 1900."""

# Imprime a resposta do Claude
# print(get_completion(PROMPT_CRITICA2, system_prompt=SYSTEM_PROMPT_CRITICA))
```

**Claude às vezes é sensível à ordem** das instruções ou dos elementos no prompt. No exemplo da crítica de cinema, se pedíssemos primeiro o `<argumento-negativo>`, isso poderia sutilmente influenciar o processo de "pensamento" de Claude. Embora não seja sempre o caso, é algo a se ter em mente ao depurar prompts complexos: a ordem em que você pede a Claude para considerar as coisas pode importar.

**Permitir que Claude pense pode mudar sua resposta de incorreta para correta.** É simples assim em muitos casos onde Claude comete erros!

Vamos analisar um exemplo onde Claude pode errar inicialmente:

> **Nota:** Claude, quando solicitado diretamente, pode não conseguir responder corretamente a esta pergunta que exige um conhecimento específico e um pequeno passo de inferência.
```python
# Prompt
# PROMPT_ATOR1 = "Nomeie um filme famoso estrelado por um ator que nasceu no ano de 1956."

# Imprime a resposta do Claude
# print(get_completion(PROMPT_ATOR1))
```

Vamos corrigir isso pedindo a Claude para pensar passo a passo, usando tags `<brainstorm>` como um scratchpad.

> **Nota:** Pedir a Claude para fazer um "brainstorm" sobre atores e seus anos de nascimento em tags XML antes de responder ajuda-o a pesquisar em seu conhecimento e encontrar a resposta correta.
```python
# Prompt
# PROMPT_ATOR2 = "Nomeie um filme famoso estrelado por um ator que nasceu no ano de 1956. Primeiro, faça um brainstorm sobre alguns atores nascidos em 1956 e filmes em que atuaram, dentro de tags <brainstorm>. Depois, forneça sua resposta final em tags <resposta_final>."

# Imprime a resposta do Claude
# print(get_completion(PROMPT_ATOR2))
```

Se você gostaria de experimentar os prompts da lição sem alterar nenhum conteúdo acima, role até o final do notebook da lição para visitar o [**Playground de Exemplos**](#playground-de-exemplos).

---

## <a name="exercicios"></a>Exercícios
Os exercícios desta seção do notebook original focavam mais na precisão da classificação e formatação da saída, que são habilidades relacionadas, mas não diretamente sobre fazer Claude usar um "scratchpad" para raciocínio intermediário. Vamos adaptá-los levemente para o contexto do curso em Markdown, mantendo o espírito dos originais.

- [Exercício 6.1 - Classificando Emails](#exercicio-61---classificando-emails)
- [Exercício 6.2 - Formatação da Classificação de Emails](#exercicio-62---formatacao-da-classificacao-de-emails)

### <a name="exercicio-61---classificando-emails"></a>Exercício 6.1 - Classificando Emails
Neste exercício, instruiremos Claude a classificar emails nas seguintes categorias:
- (A) Pergunta de pré-venda
- (B) Item quebrado ou com defeito
- (C) Dúvida sobre cobrança
- (D) Outro (explique, por favor)

Para esta parte do exercício, altere o `PROMPT_TEMPLATE_EX6_1` para **fazer Claude produzir a classificação correta E SOMENTE a classificação**. Sua resposta precisa **incluir a letra (A - D) da escolha correta, com os parênteses, bem como o nome da categoria**.

> **Nota do Exercício:** O objetivo é criar um `PROMPT_TEMPLATE_EX6_1` que instrua Claude a classificar um `{email}` (variável) em uma das quatro categorias e a responder apenas com a letra e o nome da categoria (ex: "(A) Pergunta de pré-venda"). O código original do notebook iterava por uma lista de emails e verificava se a resposta de Claude correspondia à categoria correta. Aqui, focaremos em acertar o prompt para um único email.
```python
# Template de prompt com um placeholder para o conteúdo variável - MODIFIQUE AQUI
PROMPT_TEMPLATE_EX6_1 = """Por favor, classifique o seguinte email em uma das categorias abaixo. Sua resposta deve conter apenas a letra e o nome completo da categoria. Não adicione nenhuma explicação ou texto introdutório.

Categorias:
(A) Pergunta de pré-venda
(B) Item quebrado ou com defeito
(C) Dúvida sobre cobrança
(D) Outro (explique, por favor)

Email para classificar:
<email_a_ser_classificado>{email}</email_a_ser_classificado>
"""

# Exemplo de email para teste (do conjunto original, categoria B)
EMAIL_EXEMPLO_EX6_1 = "Hi -- My Mixmaster4000 is producing a strange noise when I operate it. It also smells a bit smoky and plasticky, like burning electronics.  I need a replacement."

# Formata o prompt com o email de exemplo
# formatted_prompt_ex6_1 = PROMPT_TEMPLATE_EX6_1.format(email=EMAIL_EXEMPLO_EX6_1)

# PREFILL_EX6_1 = "" # Não é esperado preenchimento para este exercício

# # Lógica de avaliação original (simplificada):
# # A resposta esperada seria, por exemplo, "(B) Item quebrado ou com defeito".
# # O código original verificaria a correspondência exata com o padrão esperado.
# # print("Prompt enviado:")
# # print(formatted_prompt_ex6_1)
# # print("\nResposta do Claude:")
# # response_ex6_1 = get_completion(formatted_prompt_ex6_1)
# # print(response_ex6_1)
# # # Exemplo de verificação para este caso:
# # # grade_ex6_1 = response_ex6_1.strip() == "(B) Item quebrado ou com defeito"
# # # print("\nExercício resolvido corretamente (para este exemplo):", grade_ex6_1)

# Para testar em Markdown:
# print("Prompt formatado:")
# print(formatted_prompt_ex6_1)
# print("\nResposta do Claude:")
# print(get_completion(formatted_prompt_ex6_1))
```

❓ Se você quiser uma dica:
> **Dica (Exercício 6.1):** A solução do notebook original era: `PROMPT = """Please classify the following email as (A) Pre-sale question, (B) Broken or defective item, (C) Billing question, or (D) Other (please explain): {email}. Output only the letter and the name of the category."""` (Tradução: `PROMPT = """Por favor, classifique o seguinte email como (A) Pergunta de pré-venda, (B) Item quebrado ou com defeito, (C) Dúvida sobre cobrança, ou (D) Outro (explique, por favor): {email}. Produza apenas a letra e o nome da categoria."""`)

Ainda emperrado? A solução do notebook original para o prompt é fornecida na dica acima.

### <a name="exercicio-62---formatacao-da-classificacao-de-emails"></a>Exercício 6.2 - Formatação da Classificação de Emails
Neste exercício, vamos refinar a saída do prompt acima para produzir uma resposta formatada exatamente como queremos.

Use sua técnica de formatação de saída favorita (instrução explícita no prompt do usuário ou pré-preenchimento com `PREFILL_EX6_2`) para fazer Claude envolver APENAS a letra da classificação correta em tags `<answer></answer>`. Por exemplo, a resposta para o primeiro email (item quebrado) deve conter a string exata `<answer>B</answer>`.

> **Nota do Exercício:** O desafio é refinar o prompt do exercício anterior. Além de classificar o email, Claude deve agora formatar sua resposta para incluir apenas a letra da categoria correta, envolta em tags `<answer></answer>` (ex: `<answer>B</answer>`). A lógica de avaliação original verificaria a presença exata dessa string formatada.
```python
# Template de prompt com um placeholder para o conteúdo variável - MODIFIQUE OU USE PREFILL
PROMPT_TEMPLATE_EX6_2 = """Por favor, classifique o seguinte email em uma das categorias abaixo:
(A) Pergunta de pré-venda
(B) Item quebrado ou com defeito
(C) Dúvida sobre cobrança
(D) Outro (explique, por favor)

Email para classificar:
<email_a_ser_classificado>{email}</email_a_ser_classificado>

Sua resposta deve ser APENAS a letra da categoria correta, envolta nas tags <answer> e </answer>. Por exemplo: <answer>X</answer>."""


# Prefill para a resposta de Claude, se for usar "speaking for Claude" - MODIFIQUE SE NECESSÁRIO
PREFILL_EX6_2 = "<answer>" # Guia Claude a começar com a tag, ele deve completar com a letra e a tag de fechamento.

# Exemplo de email para teste (categoria B)
EMAIL_EXEMPLO_EX6_2 = "Hi -- My Mixmaster4000 is producing a strange noise when I operate it. It also smells a bit smoky and plasticky, like burning electronics.  I need a replacement."

# Formata o prompt com o email de exemplo
# formatted_prompt_ex6_2 = PROMPT_TEMPLATE_EX6_2.format(email=EMAIL_EXEMPLO_EX6_2)

# # Lógica de avaliação original (simplificada):
# # A resposta esperada seria "<answer>B</answer>".
# # print("Prompt enviado:")
# # print(formatted_prompt_ex6_2)
# # if PREFILL_EX6_2: print("\nPrefill do Assistente:\n" + PREFILL_EX6_2)
# # print("\nResposta do Claude:")
# # # Lembre-se que get_completion retorna o texto APÓS o prefill.
# # # Para a resposta completa do assistente, você concatenaria PREFILL_EX6_2 + o que get_completion retorna.
# # response_content_ex6_2 = get_completion(formatted_prompt_ex6_2, prefill=PREFILL_EX6_2)
# # full_assistant_response_ex6_2 = PREFILL_EX6_2 + response_content_ex6_2
# # print(full_assistant_response_ex6_2)
# # expected_output_ex6_2 = "<answer>B</answer>"
# # grade_ex6_2 = (full_assistant_response_ex6_2.strip() == expected_output_ex6_2)
# # print("\nExercício resolvido corretamente (para este exemplo):", grade_ex6_2)

# Para testar em Markdown:
# print("Prompt formatado:")
# print(formatted_prompt_ex6_2)
# if PREFILL_EX6_2: print("\nPrefill do Assistente:\n" + PREFILL_EX6_2)
# print("\nResposta do Claude (incluindo o preenchimento e a continuação de Claude):")
# print(PREFILL_EX6_2 + get_completion(formatted_prompt_ex6_2, prefill=PREFILL_EX6_2))
```

❓ Se você quiser uma dica:
> **Dica (Exercício 6.2):** A dica original sugere: "Você pode usar a técnica de pré-preenchimento (prefill) com `PREFILL = \"<answer>\"` ou pode especificar o formato de saída desejado no próprio prompt do usuário."

### Parabéns!

Se você resolveu todos os exercícios até este ponto, está pronto para passar para o próximo capítulo. Bom trabalho com os prompts!

---

## <a name="playground-de-exemplos"></a>Playground de Exemplos

Esta é uma área para você experimentar livremente com os exemplos de prompt mostrados nesta lição e ajustar os prompts para ver como isso pode afetar as respostas do Claude. Lembre-se de que para executar os blocos de código Python, você precisará ter configurado sua `API_KEY`, o nome do modelo (`MODEL_NAME`) e inicializado o `client` da Anthropic, conforme mostrado na seção de [Configuração](#configuracao).

> **Playground:** Crítica de filme sem "pensamento passo a passo".
```python
# Prompt
# PROMPT_PG1 = """A avaliação deste filme é positiva ou negativa?
#
# Este filme explodiu minha mente com sua frescura e originalidade. Em notícias totalmente não relacionadas, tenho vivido debaixo de uma pedra desde o ano 1900."""

# Imprime a resposta do Claude
# print(get_completion(PROMPT_PG1))
```

> **Playground:** Crítica de filme com "pensamento passo a passo" (argumentos positivo/negativo).
```python
# System prompt (Prompt de Sistema)
# SYSTEM_PROMPT_PG = "Você é um leitor experiente de críticas de cinema."

# Prompt
# PROMPT_PG2 = """A avaliação desta crítica é positiva ou negativa? Primeiro, escreva os melhores argumentos para cada lado nas tags XML <argumento-positivo> e <argumento-negativo>, considerando o contexto completo da crítica. Depois, forneça sua conclusão final em tags <sentimento_final>.
#
# Crítica:
# Este filme explodiu minha mente com sua frescura e originalidade. Em notícias totalmente não relacionadas, tenho vivido debaixo de uma pedra desde 1900."""

# Imprime a resposta do Claude
# print(get_completion(PROMPT_PG2, system_prompt=SYSTEM_PROMPT_PG))
```

> **Playground:** Pergunta sobre ator/filme com "pensamento passo a passo" (usando tags `<brainstorm>`). Tente modificar o ano ou o tipo de informação solicitada.
```python
# Prompt
# PROMPT_PG3 = "Nomeie uma comédia famosa estrelada por um ator que nasceu no ano de 1960. Primeiro, faça um brainstorm sobre alguns atores nascidos em 1960 e comédias em que atuaram, dentro de tags <brainstorm>. Depois, forneça sua resposta final em tags <resposta_final>."

# Imprime a resposta do Claude
# print(get_completion(PROMPT_PG3))
```
---
Incentivar Claude a "pensar em voz alta" ou a seguir um processo de raciocínio passo a passo é uma técnica poderosa para melhorar a qualidade e a confiabilidade de suas respostas, especialmente para tarefas complexas. Ao instruir o uso de um "scratchpad" ou seções delimitadas para o raciocínio intermediário, você não apenas ajuda Claude a estruturar seu "pensamento", mas também ganha mais visibilidade sobre como ele chega às suas conclusões. Essa abordagem pode ser crucial para depurar prompts e refinar a lógica do modelo em direção ao resultado desejado.

No próximo capítulo, veremos como fornecer exemplos concretos (few-shot prompting) pode ser uma maneira eficaz de ensinar Claude a realizar novas tarefas ou a responder em formatos específicos.
