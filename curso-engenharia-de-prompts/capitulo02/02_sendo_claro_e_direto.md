# Capítulo 02: Clareza e Objetividade ao Instruir

Bem-vindo ao Capítulo 2! A forma como você estrutura suas instruções para Claude tem um impacto direto na qualidade e relevância das respostas que você recebe. Neste capítulo, focaremos em um dos princípios mais importantes da engenharia de prompts: ser claro e direto. Aprender a formular seus pedidos de maneira explícita e sem ambiguidades é fundamental para aproveitar ao máximo as capacidades de Claude.

- [Lição](#licao)
- [Exercícios](#exercicios)
- [Playground de Exemplos](#playground-de-exemplos)

## <a name="configuracao"></a>Configuração

Antes de prosseguir, certifique-se de que você configurou sua `API_KEY` e `MODEL_NAME` conforme descrito no Capítulo 00. A função `get_completion` abaixo também depende da inicialização do objeto `client` da biblioteca Anthropic.

> **Nota sobre `pip install anthropic`:** Se ainda não o fez, instale a biblioteca Python da Anthropic: `pip install anthropic` em seu terminal (preferencialmente em um ambiente virtual).
> **Nota sobre `max_tokens`:** Para esta lição, a função `get_completion` foi ajustada para usar `max_tokens=4000` (em vez do valor padrão de 2000 usado em outros capítulos) para permitir respostas mais longas nos exercícios, como a geração de histórias.

```python
import re # Importa a biblioteca de expressões regulares embutida do Python
import anthropic

# Recupere ou defina suas variáveis API_KEY e MODEL_NAME aqui
# Exemplo (substitua pelos seus valores reais ou carregue do %store se estiver em Jupyter):
# API_KEY = "sua_chave_api_aqui"
# MODEL_NAME = "claude-3-haiku-20240307" # Ou outro modelo como claude-3-sonnet-...

# Inicialize o cliente Anthropic uma vez.
# Certifique-se de que API_KEY está definida.
# client = anthropic.Anthropic(api_key=API_KEY)
# Esta linha deve ser executada para que 'client' seja reconhecido.
# Se API_KEY ou MODEL_NAME não forem definidas, a função abaixo mostrará um erro.

# Note que alteramos max_tokens para 4000 apenas para esta lição, para permitir conclusões mais longas nos exercícios
def get_completion(prompt_do_usuario: str, system_prompt=""): # Renomeado 'prompt' para maior clareza
    if 'client' not in globals() or not isinstance(client, anthropic.Anthropic):
        print("Erro: O cliente Anthropic (client) não foi inicializado corretamente. Verifique sua API_KEY e a inicialização do client.")
        return "Erro de configuração: cliente não definido ou inicializado incorretamente."
    if 'MODEL_NAME' not in globals() or not MODEL_NAME:
        print("Erro: A variável MODEL_NAME não foi definida. Defina o nome do modelo que deseja usar.")
        return "Erro de configuração: nome do modelo não definido."

    try:
        response = client.messages.create(
            model=MODEL_NAME,
            max_tokens=4000, # Aumentado para esta lição
            temperature=0.0,
            system=system_prompt,
            messages=[
              {"role": "user", "content": prompt_do_usuario}
            ]
        )
        return response.content[0].text
    except Exception as e:
        print(f"Erro ao chamar a API da Anthropic: {e}")
        return f"Erro na API: {e}"
```
*(Os exemplos de código subsequentes assumirão que `client` e `MODEL_NAME` foram devidamente configurados e que `get_completion` está definida como acima).*

---

## <a name="licao"></a>Lição

**Claude responde melhor a instruções claras e diretas.**

Pense no Claude como qualquer outro humano novo no trabalho. **Claude não tem contexto** sobre o que fazer além do que você literalmente diz a ele. Assim como quando você instrui um humano pela primeira vez sobre uma tarefa, quanto mais você explicar exatamente o que quer de maneira direta para o Claude, melhor e mais precisa será a resposta do Claude. Não presuma que Claude "entende" o que você quer dizer; seja explícito.

Na dúvida, siga a **Regra de Ouro da Clareza em Prompts**:
- Mostre seu prompt a um colega ou amigo e peça para que sigam as instruções, como se eles fossem o Claude, para ver se conseguem produzir o resultado que você deseja. Se seu colega ficar confuso com as instruções, Claude provavelmente também ficará.

### Exemplos

Vamos pegar uma tarefa como escrever poesia. (Ignore qualquer incompatibilidade de sílabas - Modelos de Linguagem Grandes, ou LLMs, ainda não são ótimos em contar sílabas com precisão.)

> **Nota:** Este código pede ao Claude para escrever um haicai sobre robôs. (Lembre-se de ter `API_KEY` e `MODEL_NAME` configurados e `client` inicializado para executar.)
```python
# Prompt
# PROMPT_HAIKU1 = "Escreva um haicai sobre robôs." # Original: "Write a haiku about robots."

# Imprime a resposta do Claude
# print(get_completion(PROMPT_HAIKU1))
```

Este haicai é bom o suficiente, mas os usuários podem querer que o Claude vá diretamente para o poema sem o preâmbulo "Aqui está um haicai..." ou similar.

Como conseguimos isso? Nós **pedimos por isso explicitamente**!

> **Nota:** Aqui, instruímos Claude a pular o preâmbulo e ir direto ao poema. Ser direto sobre o formato da saída é fundamental.
```python
# Prompt
# PROMPT_HAIKU2 = "Escreva um haicai sobre robôs. Pule o preâmbulo; vá direto para o poema."
# Original: "Write a haiku about robots. Skip the preamble; go straight into the poem."

# Imprime a resposta do Claude
# print(get_completion(PROMPT_HAIKU2))
```

Aqui está outro exemplo. Vamos perguntar ao Claude quem é o melhor jogador de basquete de todos os tempos. Você pode ver abaixo que, embora o Claude liste alguns nomes, **ele não responde com um "melhor" definitivo**, pois a pergunta é subjetiva e ele tenta ser neutro ou abrangente.

> **Nota:** Este prompt pergunta sobre o melhor jogador de basquete, esperando uma resposta possivelmente evasiva ou que liste múltiplos candidatos.
```python
# Prompt
# PROMPT_BASQUETE1 = "Quem é o melhor jogador de basquete de todos os tempos?"
# Original: "Who is the best basketball player of all time?"

# Imprime a resposta do Claude
# print(get_completion(PROMPT_BASQUETE1))
```

Podemos fazer o Claude se decidir e escolher o melhor jogador? Sim! Basta pedir de forma mais direta e reconhecer a subjetividade, mas ainda assim forçar uma escolha!

> **Nota:** Este prompt pressiona Claude por uma resposta definitiva, instruindo-o a escolher um jogador apesar das opiniões divergentes.
```python
# Prompt
# PROMPT_BASQUETE2 = "Quem é o melhor jogador de basquete de todos os tempos? Sim, existem opiniões divergentes, mas se você absolutamente tivesse que escolher um jogador, quem seria?"
# Original: "Who is the best basketball player of all time? Yes, there are differing opinions, but if you absolutely had to pick one player, who would it be?"

# Imprime a resposta do Claude
# print(get_completion(PROMPT_BASQUETE2))
```

Se você gostaria de experimentar os prompts da lição sem alterar nenhum conteúdo acima, role até o final do notebook da lição para visitar o [**Playground de Exemplos**](#playground-de-exemplos).

---

## <a name="exercicios"></a>Exercícios
- [Exercício 2.1 - Espanhol](#exercicio-21---espanhol)
- [Exercício 2.2 - Apenas Um Jogador](#exercicio-22---apenas-um-jogador)
- [Exercício 2.3 - Escreva uma História](#exercicio-23---escreva-uma-historia)

### <a name="exercicio-21---espanhol"></a>Exercício 2.1 - Espanhol
Modifique o `SYSTEM_PROMPT` para fazer o Claude responder em espanhol.

> **Nota do Exercício:** O objetivo é configurar o `SYSTEM_PROMPT` para que a saída de Claude para a pergunta "Olá Claude, como você está?" seja em espanhol. A função de avaliação original (não incluída aqui) verificaria se a palavra "hola" estava presente na resposta em letras minúsculas. Lembre-se que o `SYSTEM_PROMPT` é o local ideal para instruções de comportamento ou idioma que devem persistir em toda a interação.
```python
# System prompt - este é o único campo que você deve alterar
SYSTEM_PROMPT_EX2_1 = "[Substitua este texto pelo seu system prompt em português, instruindo o Claude a responder em espanhol]"

# Prompt do Usuário
PROMPT_EX2_1 = "Olá Claude, como você está?" # Original: "Hello Claude, how are you?"

# Para este tutorial em Markdown, você pode tentar:
# print(get_completion(PROMPT_EX2_1, system_prompt=SYSTEM_PROMPT_EX2_1))
# E verificar manually se a resposta está em espanhol.

# # Código original do exercício:
# # response = get_completion(PROMPT_EX2_1, system_prompt=SYSTEM_PROMPT_EX2_1)
# # def grade_exercise_2_1(text):
# #     return "hola" in text.lower()
# # print(response)
# # print("\n--------------------------- AVALIAÇÃO ---------------------------")
# # print("Este exercício foi resolvido corretamente:", grade_exercise_2_1(response))
```

❓ Se você quiser uma dica:
> **Dica (Exercício 2.1):** A dica original é: "Você pode simplesmente dizer ao Claude para responder em espanhol." (Ex: "Responda sempre em espanhol.")

### <a name="exercicio-22---apenas-um-jogador"></a>Exercício 2.2 - Apenas Um Jogador

Modifique o `PROMPT` para que o Claude não hesite e responda com **APENAS** o nome de um jogador específico, sem **outras palavras ou pontuação**.

> **Nota do Exercício:** O desafio aqui é fazer Claude responder *apenas* com o nome "Michael Jordan" à pergunta sobre o melhor jogador. A função de avaliação original (não incluída) verificava uma correspondência exata com "Michael Jordan". Para isso, sua instrução no prompt deve ser extremamente específica sobre o formato da saída.
```python
# Prompt - este é o único campo que você deve alterar
PROMPT_EX2_2 = "[Substitua este texto pelo seu prompt para obter apenas o nome 'Michael Jordan' como resposta, sem nenhuma palavra ou pontuação adicional]"
# Exemplo de como você poderia começar: "Quem é o melhor jogador de basquete de todos os tempos? Responda APENAS com o nome do jogador. Não inclua nenhuma outra palavra, explicação ou pontuação. O nome deve ser Michael Jordan."

# Para este tutorial em Markdown, você pode tentar:
# print(get_completion(PROMPT_EX2_2))
# E verificar se a resposta é exatamente "Michael Jordan".

# # Código original do exercício:
# # response = get_completion(PROMPT_EX2_2)
# # def grade_exercise_2_2(text):
# #     return text == "Michael Jordan"
# # print(response)
# # print("\n--------------------------- AVALIAÇÃO ---------------------------")
# # print("Este exercício foi resolvido corretamente:", grade_exercise_2_2(response))
```

❓ Se você quiser uma dica:
> **Dica (Exercício 2.2):** A dica original é: "Seja muito específico sobre o formato de saída desejado. Você pode até dizer explicitamente para não usar nenhuma outra palavra ou pontuação."

### <a name="exercicio-23---escreva-uma-historia"></a>Exercício 2.3 - Escreva uma História

Modifique o `PROMPT` para que Claude responda com a resposta mais longa que você conseguir gerar. Se sua resposta tiver **mais de 800 palavras**, a resposta do Claude será avaliada como correta no notebook original.

> **Nota do Exercício:** O objetivo é criar um prompt que gere uma história com mais de 800 palavras. A função de avaliação original (não incluída) contava as palavras na resposta. Lembre-se que `max_tokens` foi aumentado para 4000 na função `get_completion` desta lição, o que permite respostas mais longas. Pense em como instruir Claude a ser prolixo e detalhado.
```python
# Prompt - este é o único campo que você deve alterar
PROMPT_EX2_3 = "[Substitua este texto pelo seu prompt para gerar uma história longa, com muitos detalhes, personagens e reviravoltas, com o objetivo de ter mais de 800 palavras]"
# Exemplo: "Por favor, escreva uma história de ficção científica épica e muito detalhada sobre uma viagem interestelar para encontrar um novo lar para a humanidade. Descreva os personagens, os desafios tecnológicos, os planetas visitados e os dilemas éticos enfrentados. A história deve ter pelo menos 1000 palavras." (Pedir um pouco mais pode ajudar a atingir o mínimo).

# Para este tutorial em Markdown, você pode tentar:
# response_historia = get_completion(PROMPT_EX2_3)
# print(response_historia) # Imprime a história gerada
# print(f"\nContagem de palavras: {len(response_historia.strip().split())}") # Calcula e imprime a contagem de palavras

# # Código original do exercício:
# # response = get_completion(PROMPT_EX2_3)
# # def grade_exercise_2_3(text):
# #     trimmed = text.strip()
# #     words = len(trimmed.split())
# #     return words >= 800
# # print(response)
# # print("\n--------------------------- AVALIAÇÃO ---------------------------")
# # print("Este exercício foi resolvido corretamente:", grade_exercise_2_3(response))
```

❓ Se você quiser uma dica:
> **Dica (Exercício 2.3):** A dica original é: "Tente pedir uma história muito longa e detalhada sobre um tópico complexo. Você pode especificar um número mínimo de palavras, embora os LLMs não sejam perfeitos em seguir contagens exatas de palavras."

### Parabéns!

Se você resolveu todos os exercícios até este ponto, está pronto para passar para o próximo capítulo. Bom trabalho com os prompts!

---

## <a name="playground-de-exemplos"></a>Playground de Exemplos

Esta é uma área para você experimentar livremente com os exemplos de prompt mostrados nesta lição e ajustar os prompts para ver como isso pode afetar as respostas do Claude. Lembre-se de que para executar os blocos de código Python, você precisará ter configurado sua `API_KEY`, o nome do modelo (`MODEL_NAME`) e inicializado o `client` da Anthropic, conforme mostrado na seção de [Configuração](#configuracao).

> **Playground:** Peça ao Claude para escrever um haicai sobre robôs.
```python
# Prompt
# PROMPT_PG1 = "Escreva um haicai sobre robôs."

# Imprime a resposta do Claude
# print(get_completion(PROMPT_PG1))
```

> **Playground:** Instrua Claude a pular o preâmbulo e ir direto ao poema.
```python
# Prompt
# PROMPT_PG2 = "Escreva um haicai sobre robôs. Pule o preâmbulo; vá direto para o poema."

# Imprime a resposta do Claude
# print(get_completion(PROMPT_PG2))
```

> **Playground:** Pergunte sobre o melhor jogador de basquete, esperando uma resposta possivelmente evasiva.
```python
# Prompt
# PROMPT_PG3 = "Quem é o melhor jogador de basquete de todos os tempos?"

# Imprime a resposta do Claude
# print(get_completion(PROMPT_PG3))
```

> **Playground:** Pressione Claude por uma resposta definitiva sobre o melhor jogador.
```python
# Prompt
# PROMPT_PG4 = "Quem é o melhor jogador de basquete de todos os tempos? Sim, existem opiniões divergentes, mas se você absolutamente tivesse que escolher um jogador, quem seria?"

# Imprime a resposta do Claude
# print(get_completion(PROMPT_PG4))
```

---
Ser claro e direto em seus prompts é uma das formas mais eficazes de melhorar a qualidade das respostas de Claude. Como vimos, não assuma que Claude "sabe" o que você quer ou que ele tem o mesmo contexto que você. Instruções explícitas, detalhando o formato de saída desejado ou o comportamento esperado, levam a resultados muito mais previsíveis e úteis. Lembre-se da Regra de Ouro: se um humano ficaria confuso, Claude provavelmente também ficará.

No próximo capítulo, exploraremos outra técnica poderosa: atribuir papéis a Claude para especializar ainda mais suas respostas.
