# Capítulo 03: Atribuindo Papéis (Role Prompting)

- [Lição](#licao)
- [Exercícios](#exercicios)
- [Playground de Exemplos](#playground-de-exemplos)

## <a name="configuracao"></a>Configuração

Execute a célula de configuração a seguir para carregar sua chave de API e estabelecer a função auxiliar `get_completion`.

> **Nota:** O comando `!pip install anthropic` é para instalar a biblioteca em ambientes Jupyter. Se você estiver executando o código localmente, pode precisar instalar a biblioteca usando `pip install anthropic` em seu terminal. Os comandos `%store -r API_KEY` e `%store -r MODEL_NAME` são específicos do IPython para carregar variáveis salvas em sessões anteriores do notebook. Em um script Python padrão, você precisaria definir `API_KEY` e `MODEL_NAME` diretamente ou carregá-las de outra forma (ex: variáveis de ambiente).

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

def get_completion(prompt: str, system_prompt=""):
    # Verifique se client está definido e inicializado corretamente
    # if 'client' not in globals() or not hasattr(client, 'messages'):
    #     print("Cliente Anthropic não inicializado corretamente. Verifique sua API_KEY e a inicialização do cliente.")
    #     return "Erro: Cliente não inicializado."
    message = client.messages.create(
        model=MODEL_NAME,
        max_tokens=2000,
        temperature=0.0,
        system=system_prompt,
        messages=[
          {"role": "user", "content": prompt}
        ]
    )
    return message.content[0].text
```

---

## <a name="licao"></a>Lição

Continuando no tema de que o Claude não tem contexto além do que você diz, às vezes é importante **instruir o Claude a assumir um papel específico (incluindo todo o contexto necessário)**. Isso também é conhecido como "role prompting" (atribuição de papéis ou designação de persona). Quanto mais detalhado for o contexto do papel, melhor.

**Preparar o Claude com um papel (ou persona) pode melhorar seu desempenho** em diversas áreas, desde escrita e codificação até resumo. É como os humanos às vezes são ajudados quando lhes dizem para "pensar como um(a) ______". A atribuição de papéis também pode mudar o estilo, tom e maneira da resposta do Claude.

**Nota:** A atribuição de papéis pode ocorrer tanto no "system prompt" (prompt de sistema) quanto como parte do turno da mensagem do "User" (usuário).

### Exemplos

No exemplo abaixo, vemos que sem a atribuição de papéis, Claude fornece uma **resposta direta e não estilizada** quando solicitado a dar uma perspectiva de uma frase sobre o skate.

No entanto, quando preparamos Claude para assumir o papel de um gato, a perspectiva de Claude muda e, assim, **o tom, estilo e conteúdo da resposta de Claude se adaptam ao novo papel**.

**Nota:** Uma técnica bônus que você pode usar é **fornecer a Claude contexto sobre seu público-alvo**. Abaixo, poderíamos ter ajustado o prompt para também dizer a Claude com quem ele deveria estar falando. "Você é um gato" produz uma resposta bem diferente de "você é um gato falando para uma multidão de skatistas".

Aqui está o prompt sem atribuição de papéis no prompt de sistema:

> **Nota:** Este código pede a opinião de Claude sobre skate, sem um papel específico atribuído. (Lembre-se de ter `API_KEY` e `MODEL_NAME` configurados e `client` inicializado para executar.)
```python
# Prompt
PROMPT = "In one sentence, what do you think about skateboarding?"
# "Em uma frase, o que você acha de andar de skate?"

# Imprime a resposta do Claude
# print(get_completion(PROMPT))
```

Aqui está a mesma pergunta do usuário, exceto com atribuição de papéis.

> **Nota:** Aqui, Claude recebe o papel de "gato" através do prompt de sistema.
```python
# System prompt (Prompt de Sistema)
SYSTEM_PROMPT = "You are a cat." # "Você é um gato."

# Prompt (Prompt do Usuário)
PROMPT = "In one sentence, what do you think about skateboarding?"
# "Em uma frase, o que você acha de andar de skate?"

# Imprime a resposta do Claude
# print(get_completion(PROMPT, SYSTEM_PROMPT))
```

Você pode usar a atribuição de papéis como uma forma de fazer Claude emular certos estilos de escrita, falar com uma certa voz ou guiar a complexidade de suas respostas. **A atribuição de papéis também pode tornar Claude melhor na execução de tarefas matemáticas ou lógicas.**

Por exemplo, no exemplo abaixo, há uma resposta correta definitiva, que é sim. No entanto, Claude erra e pensa que não possui informações suficientes, o que não é verdade:

> **Nota:** Este é um problema de lógica onde Claude, sem um papel específico, pode não chegar à conclusão correta.
```python
# Prompt
PROMPT = "Jack is looking at Anne. Anne is looking at George. Jack is married, George is not, and we don’t know if Anne is married. Is a married person looking at an unmarried person?"
# "Jack está olhando para Anne. Anne está olhando para George. Jack é casado, George não é, e não sabemos se Anne é casada. Uma pessoa casada está olhando para uma pessoa não casada?"

# Imprime a resposta do Claude
# print(get_completion(PROMPT))
```

Agora, e se **prepararmos Claude para agir como um bot de lógica**? Como isso mudará a resposta de Claude?

Acontece que, com essa nova atribuição de papel, Claude acerta. (Embora, notavelmente, nem sempre pelos motivos certos)

> **Nota:** Atribuir o papel de "bot de lógica" ajuda Claude a resolver o problema corretamente.
```python
# System prompt (Prompt de Sistema)
SYSTEM_PROMPT = "You are a logic bot designed to answer complex logic problems."
# "Você é um bot de lógica projetado para responder a problemas lógicos complexos."

# Prompt (Prompt do Usuário)
PROMPT = "Jack is looking at Anne. Anne is looking at George. Jack is married, George is not, and we don’t know if Anne is married. Is a married person looking at an unmarried person?"
# "Jack está olhando para Anne. Anne está olhando para George. Jack é casado, George não é, e não sabemos se Anne é casada. Uma pessoa casada está olhando para uma pessoa não casada?"

# Imprime a resposta do Claude
# print(get_completion(PROMPT, SYSTEM_PROMPT))
```

**Nota:** O que você aprenderá ao longo deste curso é que existem **muitas técnicas de engenharia de prompt que você pode usar para obter resultados semelhantes**. Quais técnicas você usa depende de você e de sua preferência! Incentivamos você a **experimentar para encontrar seu próprio estilo de engenharia de prompt**.

Se você gostaria de experimentar os prompts da lição sem alterar nenhum conteúdo acima, role até o final do notebook da lição para visitar o [**Playground de Exemplos**](#playground-de-exemplos).

---

## <a name="exercicios"></a>Exercícios
- [Exercício 3.1 - Correção Matemática](#exercicio-31---correcao-matematica)

### <a name="exercicio-31---correcao-matematica"></a>Exercício 3.1 - Correção Matemática
Em alguns casos, **Claude pode ter dificuldades com matemática**, mesmo matemática simples. Abaixo, Claude avalia incorretamente o problema matemático como resolvido corretamente, embora haja um erro aritmético óbvio no segundo passo. Note que Claude realmente percebe o erro ao analisar passo a passo, mas não conclui que a solução geral está errada.

Modifique o `PROMPT` e/ou o `SYSTEM_PROMPT` para fazer Claude avaliar a solução como resolvida `incorretamente`, em vez de corretamente.

> **Nota do Exercício:** O objetivo é fazer Claude identificar corretamente um erro em uma simples equação algébrica (2x - 3 = 9 deveria levar a 2x = 12, não 2x = 6) e classificar a solução como "incorreta". Você pode modificar `PROMPT` ou `SYSTEM_PROMPT`. A função de avaliação original (não incluída aqui) verificaria se a resposta continha "incorrect" ou "not correct".
```python
# System prompt - se você não quiser usar um prompt de sistema, pode deixar esta variável definida como uma string vazia
SYSTEM_PROMPT = "[Substitua este texto ou deixe em branco. Considere dar a Claude um papel como 'um professor de matemática rigoroso' ou 'um verificador de fatos matemáticos detalhista']"

# Prompt
PROMPT = """A equação abaixo está resolvida corretamente?

2x - 3 = 9
2x = 6  // Erro aqui: deveria ser 2x = 12, resultando em x = 6
x = 3""" # O valor de x também está incorreto baseado no erro anterior.

# Para este tutorial em Markdown, você pode tentar:
# response = get_completion(PROMPT, SYSTEM_PROMPT)
# print(response)
# E verificar se Claude identifica o erro e classifica a solução como incorreta.

# # Código original do exercício:
# # response = get_completion(PROMPT, SYSTEM_PROMPT)
# # def grade_exercise(text):
# #     if "incorrect" in text or "not correct" in text.lower():
# #         return True
# #     else:
# #         return False
# # print(response)
# # print("\n--------------------------- AVALIAÇÃO ---------------------------")
# # print("Este exercício foi resolvido corretamente:", grade_exercise(response))
```

❓ Se você quiser uma dica:
> **Dica (Exercício 3.1):** A dica original é: "Tente atribuir a Claude o papel de um professor de matemática ou um especialista em matemática. Você também pode considerar dizer a Claude para prestar muita atenção a cada etapa."

### Parabéns!

Se você resolveu todos os exercícios até este ponto, está pronto para passar para o próximo capítulo. Bom trabalho com os prompts!

---

## <a name="playground-de-exemplos"></a>Playground de Exemplos

Esta é uma área para você experimentar livremente com os exemplos de prompt mostrados nesta lição e ajustar os prompts para ver como isso pode afetar as respostas do Claude. Lembre-se de que para executar os blocos de código Python, você precisará ter configurado sua chave de API (`API_KEY`), o nome do modelo (`MODEL_NAME`) e inicializado o `client` da Anthropic, conforme mostrado na seção de [Configuração](#configuracao).

> **Playground:** Peça a opinião de Claude sobre skate, sem um papel específico.
```python
# Prompt
PROMPT = "In one sentence, what do you think about skateboarding?"
# "Em uma frase, o que você acha de andar de skate?"

# Imprime a resposta do Claude
# print(get_completion(PROMPT))
```

> **Playground:** Atribua a Claude o papel de "gato" e peça sua opinião sobre skate.
```python
# System prompt (Prompt de Sistema)
SYSTEM_PROMPT = "You are a cat." # "Você é um gato."

# Prompt (Prompt do Usuário)
PROMPT = "In one sentence, what do you think about skateboarding?"
# "Em uma frase, o que você acha de andar de skate?"

# Imprime a resposta do Claude
# print(get_completion(PROMPT, SYSTEM_PROMPT))
```

> **Playground:** Problema de lógica sem atribuição de papel específica.
```python
# Prompt
PROMPT = "Jack is looking at Anne. Anne is looking at George. Jack is married, George is not, and we don’t know if Anne is married. Is a married person looking at an unmarried person?"
# "Jack está olhando para Anne. Anne está olhando para George. Jack é casado, George não é, e não sabemos se Anne é casada. Uma pessoa casada está olhando para uma pessoa não casada?"

# Imprime a resposta do Claude
# print(get_completion(PROMPT))
```

> **Playground:** Problema de lógica com Claude no papel de "bot de lógica".
```python
# System prompt (Prompt de Sistema)
SYSTEM_PROMPT = "You are a logic bot designed to answer complex logic problems."
# "Você é um bot de lógica projetado para responder a problemas lógicos complexos."

# Prompt (Prompt do Usuário)
PROMPT = "Jack is looking at Anne. Anne is looking at George. Jack is married, George is not, and we don’t know if Anne is married. Is a married person looking at an unmarried person?"
# "Jack está olhando para Anne. Anne está olhando para George. Jack é casado, George não é, e não sabemos se Anne é casada. Uma pessoa casada está olhando para uma pessoa não casada?"

# Imprime a resposta do Claude
# print(get_completion(PROMPT, SYSTEM_PROMPT))
```
