# Capítulo 02: Clareza e Objetividade ao Instruir

- [Lição](#licao)
- [Exercícios](#exercicios)
- [Playground de Exemplos](#playground-de-exemplos)

## <a name="configuracao"></a>Configuração

Execute a célula de configuração a seguir para carregar sua chave de API e estabelecer a função auxiliar `get_completion`.

> **Nota:** O comando `!pip install anthropic` é para instalar a biblioteca em ambientes Jupyter. Se você estiver executando o código localmente, pode precisar instalar a biblioteca usando `pip install anthropic` em seu terminal. Os comandos `%store -r API_KEY` e `%store -r MODEL_NAME` são específicos do IPython para carregar variáveis salvas em sessões anteriores do notebook. Em um script Python padrão, você precisaria definir `API_KEY` e `MODEL_NAME` diretamente ou carregá-las de outra forma (ex: variáveis de ambiente). A função `get_completion` neste capítulo foi modificada para usar `max_tokens=4000` para permitir respostas mais longas nos exercícios.

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

# Note que alteramos max_tokens para 4K apenas para esta lição, para permitir conclusões mais longas nos exercícios
def get_completion(prompt: str, system_prompt=""):
    # Verifique se client está definido e inicializado corretamente
    # if 'client' not in globals() or not hasattr(client, 'messages'):
    #     print("Cliente Anthropic não inicializado corretamente. Verifique sua API_KEY e a inicialização do cliente.")
    #     return "Erro: Cliente não inicializado."
    message = client.messages.create(
        model=MODEL_NAME,
        max_tokens=4000, # Aumentado para esta lição
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

**Claude responde melhor a instruções claras e diretas.**

Pense no Claude como qualquer outro humano novo no trabalho. **Claude não tem contexto** sobre o que fazer além do que você literalmente diz a ele. Assim como quando você instrui um humano pela primeira vez sobre uma tarefa, quanto mais você explicar exatamente o que quer de maneira direta para o Claude, melhor e mais precisa será a resposta do Claude.

Na dúvida, siga a **Regra de Ouro da Clareza em Prompts**:
- Mostre seu prompt a um colega ou amigo e peça para eles seguirem as instruções para ver if eles conseguem produzir o resultado que você deseja. Se eles ficarem confusos, o Claude ficará confuso.

### Exemplos

Vamos pegar uma tarefa como escrever poesia. (Ignore qualquer incompatibilidade de sílabas - Modelos de Linguagem Grandes, ou LLMs, ainda não são ótimos em contar sílabas.)

> **Nota:** Este código pede ao Claude para escrever um haicai sobre robôs. (Lembre-se de ter `API_KEY` e `MODEL_NAME` configurados e `client` inicializado para executar.)
```python
# Prompt
PROMPT = "Write a haiku about robots." # "Escreva um haicai sobre robôs."

# Imprime a resposta do Claude
# print(get_completion(PROMPT))
```

Este haicai é bom o suficiente, mas os usuários podem querer que o Claude vá diretamente para o poema sem o preâmbulo "Aqui está um haicai".

Como conseguimos isso? Nós **pedimos por isso**!

> **Nota:** Aqui, instruímos Claude a pular o preâmbulo e ir direto ao poema.
```python
# Prompt
PROMPT = "Write a haiku about robots. Skip the preamble; go straight into the poem."
# "Escreva um haicai sobre robôs. Pule o preâmbulo; vá direto para o poema."

# Imprime a resposta do Claude
# print(get_completion(PROMPT))
```

Aqui está outro exemplo. Vamos perguntar ao Claude quem é o melhor jogador de basquete de todos os tempos. Você pode ver abaixo que, embora o Claude liste alguns nomes, **ele não responde com um "melhor" definitivo**.

> **Nota:** Este prompt pergunta sobre o melhor jogador de basquete, esperando uma resposta possivelmente evasiva.
```python
# Prompt
PROMPT = "Who is the best basketball player of all time?" # "Quem é o melhor jogador de basquete de todos os tempos?"

# Imprime a resposta do Claude
# print(get_completion(PROMPT))
```

Podemos fazer o Claude se decidir e escolher o melhor jogador? Sim! Basta pedir!

> **Nota:** Este prompt pressiona Claude por uma resposta definitiva.
```python
# Prompt
PROMPT = "Who is the best basketball player of all time? Yes, there are differing opinions, but if you absolutely had to pick one player, who would it be?"
# "Quem é o melhor jogador de basquete de todos os tempos? Sim, existem opiniões divergentes, mas se você absolutamente tivesse que escolher um jogador, quem seria?"

# Imprime a resposta do Claude
# print(get_completion(PROMPT))
```

Se você gostaria de experimentar os prompts da lição sem alterar nenhum conteúdo acima, role até o final do notebook da lição para visitar o [**Playground de Exemplos**](#playground-de-exemplos).

---

## <a name="exercicios"></a>Exercícios
- [Exercício 2.1 - Espanhol](#exercicio-21---espanhol)
- [Exercício 2.2 - Apenas Um Jogador](#exercicio-22---apenas-um-jogador)
- [Exercício 2.3 - Escreva uma História](#exercicio-23---escreva-uma-historia)

### <a name="exercicio-21---espanhol"></a>Exercício 2.1 - Espanhol
Modifique o `SYSTEM_PROMPT` para fazer o Claude responder em espanhol.

> **Nota do Exercício:** O objetivo é configurar o `SYSTEM_PROMPT` para que a saída de Claude seja em espanhol. A função de avaliação original (não incluída aqui) verificaria se a palavra "hola" estava presente na resposta em letras minúsculas.
```python
# System prompt - este é o único campo que você deve alterar
SYSTEM_PROMPT = "[Substitua este texto pelo seu system prompt em português, instruindo o Claude a responder em espanhol]"

# Prompt do Usuário
PROMPT = "Hello Claude, how are you?" # "Olá Claude, como você está?"

# Para este tutorial em Markdown, você pode tentar:
# print(get_completion(PROMPT, SYSTEM_PROMPT))
# E verificar manualmente se a resposta está em espanhol.

# # Código original do exercício:
# # response = get_completion(PROMPT, SYSTEM_PROMPT)
# # def grade_exercise(text):
# #     return "hola" in text.lower()
# # print(response)
# # print("\n--------------------------- AVALIAÇÃO ---------------------------")
# # print("Este exercício foi resolvido corretamente:", grade_exercise(response))
```

❓ Se você quiser uma dica:
> **Dica (Exercício 2.1):** A dica original é: "Você pode simplesmente dizer ao Claude para responder em espanhol."

### <a name="exercicio-22---apenas-um-jogador"></a>Exercício 2.2 - Apenas Um Jogador

Modifique o `PROMPT` para que o Claude não hesite e responda com **APENAS** o nome de um jogador específico, sem **outras palavras ou pontuação**.

> **Nota do Exercício:** O desafio aqui é fazer Claude responder *apenas* com o nome "Michael Jordan". A função de avaliação original (não incluída) verificava uma correspondência exata com "Michael Jordan".
```python
# Prompt - este é o único campo que você deve alterar
PROMPT = "[Substitua este texto pelo seu prompt para obter apenas o nome 'Michael Jordan' como resposta]"

# Para este tutorial em Markdown, você pode tentar:
# print(get_completion(PROMPT))
# E verificar se a resposta é exatamente "Michael Jordan".

# # Código original do exercício:
# # response = get_completion(PROMPT)
# # def grade_exercise(text):
# #     return text == "Michael Jordan"
# # print(response)
# # print("\n--------------------------- AVALIAÇÃO ---------------------------")
# # print("Este exercício foi resolvido corretamente:", grade_exercise(response))
```

❓ Se você quiser uma dica:
> **Dica (Exercício 2.2):** A dica original é: "Seja muito específico sobre o formato de saída desejado. Você pode até dizer explicitamente para não usar nenhuma other palavra ou pontuação."

### <a name="exercicio-23---escreva-uma-historia"></a>Exercício 2.3 - Escreva uma História

Modifique o `PROMPT` para que Claude responda com a resposta mais longa que você conseguir gerar. Se sua resposta tiver **mais de 800 palavras**, a resposta do Claude será avaliada como correta.

> **Nota do Exercício:** O objetivo é criar um prompt que gere uma história com mais de 800 palavras. A função de avaliação original (não incluída) contava as palavras na resposta. Lembre-se que `max_tokens` foi aumentado para 4000 nesta lição.
```python
# Prompt - este é o único campo que você deve alterar
PROMPT = "[Substitua este texto pelo seu prompt para gerar uma história longa]"

# Para este tutorial em Markdown, você pode tentar:
# response = get_completion(PROMPT)
# print(response) # Imprime a história gerada
# print(f"\nContagem de palavras: {len(response.strip().split())}") # Calcula e imprime a contagem de palavras

# # Código original do exercício:
# # response = get_completion(PROMPT)
# # def grade_exercise(text):
# #     trimmed = text.strip()
# #     words = len(trimmed.split())
# #     return words >= 800
# # print(response)
# # print("\n--------------------------- AVALIAÇÃO ---------------------------")
# # print("Este exercício foi resolvido corretamente:", grade_exercise(response))
```

❓ Se você quiser uma dica:
> **Dica (Exercício 2.3):** A dica original é: "Tente pedir uma história muito longa e detalhada sobre um tópico complexo. Você pode especificar um número mínimo de palavras, embora os LLMs não sejam perfeitos em seguir contagens exatas de palavras."

### Parabéns!

Se você resolveu todos os exercícios até este ponto, está pronto para passar para o próximo capítulo. Bom trabalho com os prompts!

---

## <a name="playground-de-exemplos"></a>Playground de Exemplos

Esta é uma área para você experimentar livremente com os exemplos de prompt mostrados nesta lição e ajustar os prompts para ver como isso pode afetar as respostas do Claude. Lembre-se de que para executar os blocos de código Python, você precisará ter configurado sua chave de API (`API_KEY`), o nome do modelo (`MODEL_NAME`) e inicializado o `client` da Anthropic, conforme mostrado na seção de [Configuração](#configuracao).

> **Playground:** Peça ao Claude para escrever um haicai sobre robôs.
```python
# Prompt
PROMPT = "Write a haiku about robots." # "Escreva um haicai sobre robôs."

# Imprime a resposta do Claude
# print(get_completion(PROMPT))
```

> **Playground:** Instrua Claude a pular o preâmbulo e ir direto ao poema.
```python
# Prompt
PROMPT = "Write a haiku about robots. Skip the preamble; go straight into the poem."
# "Escreva um haicai sobre robôs. Pule o preâmbulo; vá direto para o poema."

# Imprime a resposta do Claude
# print(get_completion(PROMPT))
```

> **Playground:** Pergunte sobre o melhor jogador de basquete, esperando uma resposta possivelmente evasiva.
```python
# Prompt
PROMPT = "Who is the best basketball player of all time?" # "Quem é o melhor jogador de basquete de todos os tempos?"

# Imprime a resposta do Claude
# print(get_completion(PROMPT))
```

> **Playground:** Pressione Claude por uma resposta definitiva sobre o melhor jogador.
```python
# Prompt
PROMPT = "Who is the best basketball player of all time? Yes, there are differing opinions, but if you absolutely had to pick one player, who would it be?"
# "Quem é o melhor jogador de basquete de todos os tempos? Sim, existem opiniões divergentes, mas se você absolutamente tivesse que escolher um jogador, quem seria?"

# Imprime a resposta do Claude
# print(get_completion(PROMPT))
```
