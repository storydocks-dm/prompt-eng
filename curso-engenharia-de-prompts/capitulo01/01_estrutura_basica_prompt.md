# Capítulo 01: Estrutura Básica de Prompts

Bem-vindo ao Capítulo 1! Neste capítulo, exploraremos os blocos de construção fundamentais de um prompt ao interagir com Claude através da API Messages. Entender esses componentes básicos é o primeiro passo para se comunicar efetivamente com o modelo e obter as respostas desejadas. Abordaremos os parâmetros essenciais da API, a estrutura das mensagens e o papel crucial dos "system prompts".

- [Lição](#licao)
- [Exercícios](#exercicios)
- [Playground de Exemplos](#playground-de-exemplos)

## <a name="configuracao"></a>Configuração

Antes de prosseguir, certifique-se de que você configurou sua `API_KEY` e `MODEL_NAME` conforme descrito no Capítulo 00. Essas variáveis são essenciais para que os exemplos de código funcionem.

Abaixo, relembramos a inicialização do cliente Anthropic e a definição da função auxiliar `get_completion` que usaremos.

> **Nota sobre `pip install anthropic`:** Se você ainda não instalou a biblioteca Python da Anthropic, precisará fazê-lo. Em um ambiente Jupyter Notebook, você pode executar `!pip install anthropic`. Para um ambiente Python local, use `pip install anthropic` no seu terminal (idealmente dentro de um ambiente virtual).

```python
import re # Importa a biblioteca de expressões regulares embutida do Python
import anthropic

# Recupere ou defina suas variáveis API_KEY e MODEL_NAME aqui
# Exemplo (substitua pelos seus valores reais ou carregue do %store se estiver em Jupyter):
# API_KEY = "sua_chave_api_aqui"
# MODEL_NAME = "claude-3-haiku-20240307"

# Inicialize o cliente Anthropic uma vez.
# Certifique-se de que API_KEY está definida.
# client = anthropic.Anthropic(api_key=API_KEY)
# Esta linha deve ser executada para que 'client' seja reconhecido nas chamadas de get_completion.
# Por favor, certifique-se de que ela foi executada no seu ambiente se você estiver rodando os códigos.
# Se API_KEY ou MODEL_NAME não forem definidas, a função abaixo mostrará um erro.

def get_completion(prompt_do_usuario: str, system_prompt=""): # Renomeado 'prompt' para maior clareza
    # Certifique-se de que 'client' e 'MODEL_NAME' estão definidos e acessíveis globalmente,
    # ou passe-os como argumentos para esta função se preferir.
    if 'client' not in globals() or not isinstance(client, anthropic.Anthropic):
        print("Erro: O cliente Anthropic (client) não foi inicializado corretamente. Verifique sua API_KEY e a inicialização do client.")
        return "Erro de configuração: cliente não definido ou inicializado incorretamente."
    if 'MODEL_NAME' not in globals() or not MODEL_NAME:
        print("Erro: A variável MODEL_NAME não foi definida. Defina o nome do modelo que deseja usar.")
        return "Erro de configuração: nome do modelo não definido."

    try:
        response = client.messages.create(
            model=MODEL_NAME,
            max_tokens=2000,
            temperature=0.0, # Definimos a temperatura como 0.0 para resultados mais determinísticos
            system=system_prompt, # Prompt de sistema (opcional)
            messages=[
              {"role": "user", "content": prompt_do_usuario} # A mensagem do usuário para Claude
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

A Anthropic oferece duas APIs principais para interagir com seus modelos: a API de Conclusões de Texto (Text Completions API), que é mais antiga, e a API de Mensagens (Messages API), que é a mais atual e recomendada. **Para este tutorial, usaremos exclusivamente a Messages API.**

A Messages API é projetada para conversas e interações mais complexas, incluindo diálogos multi-turno. No mínimo, uma chamada ao Claude usando a Messages API requer os seguintes parâmetros:

-   `model`: O identificador do modelo que você pretende chamar (ex: `"claude-3-haiku-20240307"`). Você pode encontrar a lista de modelos disponíveis na [documentação da Anthropic](https://docs.anthropic.com/claude/docs/models-overview#model-recommendations).
-   `max_tokens`: O número máximo de tokens (unidades de texto, aproximadamente palavras ou partes de palavras) que você quer que Claude gere na resposta. Note que Claude pode parar antes de atingir este máximo se concluir sua resposta. Este parâmetro especifica apenas o limite absoluto de tokens a serem gerados. Além disso, esta é uma parada *rígida*, o que significa que pode fazer com que Claude pare de gerar no meio de uma palavra ou frase se o limite for atingido.
-   `messages`: Um array (lista em Python) de objetos de mensagem de entrada. Os modelos Claude são treinados para operar em turnos de conversação alternados entre `user` (usuário) e `assistant` (assistente).
    -   Cada objeto de mensagem dentro do array `messages` deve ter duas chaves:
        -   `role`: Indica quem disse a mensagem. Os valores válidos são `"user"` ou `"assistant"`.
        -   `content`: O conteúdo textual da mensagem.
    -   Ao iniciar uma nova conversa (como na função `get_completion` acima), você normalmente fornecerá uma única mensagem com `role: "user"`.
    -   Para continuar uma conversa existente, a lista `messages` deve incluir os turnos anteriores, alternando entre `user` e `assistant`, começando sempre com um turno do `user`. O modelo então gera o próximo turno da conversa, que será uma mensagem com `role: "assistant"`.

Existem também parâmetros opcionais importantes, como:

-   `system`: O "system prompt" (prompt de sistema). Este é um campo de texto onde você pode fornecer instruções de alto nível, contexto, diretrizes, ou persona para Claude antes de qualquer mensagem de `user` ou `assistant`. Falaremos mais sobre isso abaixo e em capítulos futuros.
-   `temperature`: Um número entre 0.0 e 1.0 que controla o grau de aleatoriedade ou "criatividade" na resposta de Claude. Valores mais altos (ex: 0.7) geram respostas mais variadas e criativas, enquanto valores mais baixos (ex: 0.2 ou 0.0) produzem respostas mais focadas, previsíveis e consistentes. Para estas lições e exercícios, geralmente definimos `temperature` como `0.0` para obter resultados mais determinísticos e facilitar o aprendizado.

Para uma lista completa de todos os parâmetros da API, visite a [documentação oficial da API Messages](https://docs.anthropic.com/claude/reference/messages_post).

### Exemplos

Vamos dar uma olhada em como o Claude responde a alguns prompts formatados corretamente. Se você estiver em um ambiente interativo e tiver configurado `API_KEY`, `MODEL_NAME` e `client`, pode executar estes exemplos.

> **Nota:** O código Python abaixo envia um prompt simples para o Claude e imprime a resposta.
```python
# Prompt
# PROMPT_EX1 = "Oi Claude, como você está?" # Original: "Hi Claude, how are you?"

# Imprime a resposta do Claude
# print(get_completion(PROMPT_EX1))
```

> **Nota:** Este exemplo pede ao Claude a cor do oceano.
```python
# Prompt
# PROMPT_EX2 = "Você pode me dizer a cor do oceano?" # Original: "Can you tell me the color of the ocean?"

# Imprime a resposta do Claude
# print(get_completion(PROMPT_EX2))
```

> **Nota:** Este exemplo pergunta ao Claude o ano de nascimento de Celine Dion.
```python
# Prompt
# PROMPT_EX3 = "Em que ano Celine Dion nasceu?" # Original: "What year was Celine Dion born in?"

# Imprime a resposta do Claude
# print(get_completion(PROMPT_EX3))
```

Agora vamos dar uma olhada em alguns prompts que **não** incluem a formatação correta da Messages API. Para esses prompts malformatados, a API Messages normalmente retorna um erro.

Primeiro, um exemplo de chamada à API Messages que não possui os campos `role` e `content` corretamente estruturados dentro do array `messages`.

> **Nota:** O código Python abaixo, se executado diretamente com a API, demonstraria uma chamada incorreta. A estrutura de cada mensagem no array `messages` deve ser `{"role": "...", "content": "..."}`.
```python
# # Exemplo de chamada incorreta (não execute diretamente sem tratar erros)
# try:
#     response_erro1 = client.messages.create(
#         model=MODEL_NAME,
#         max_tokens=2000,
#         temperature=0.0,
#         messages=[
#           {"Oi Claude, como você está?"} # Formato incorreto: falta 'role' e 'content' como chaves
#         ]
#     )
#     # print(response_erro1.content[0].text)
# except Exception as e:
#     print(f"Erro esperado devido ao formato incorreto: {e}")
```

Aqui está um prompt que falha em alternar entre os papéis `user` e `assistant` (neste caso, duas mensagens `user` seguidas, o que é inválido se for o único conteúdo em `messages`; a API espera que o último turno seja do usuário para que o assistente possa responder).

> **Nota:** O código Python abaixo mostra outra chamada que resultaria em erro. Se múltiplos turnos são fornecidos em `messages`, eles devem alternar `user`, `assistant`, `user`, ... e o último turno para uma nova resposta do assistente deve ser `user`.
```python
# # Exemplo de chamada incorreta (não execute diretamente sem tratar erros)
# try:
#     response_erro2 = client.messages.create(
#         model=MODEL_NAME,
#         max_tokens=2000,
#         temperature=0.0,
#         messages=[
#           {"role": "user", "content": "Em que ano Celine Dion nasceu?"},
#           {"role": "user", "content": "Além disso, você pode me contar outros fatos sobre ela?"} # Erro: duas mensagens 'user' seguidas sem um 'assistant' entre elas.
#         ]
#     )
#     # print(response_erro2.content[0].text)
# except Exception as e:
#     print(f"Erro esperado devido à sequência incorreta de papéis: {e}")
```

As mensagens `user` e `assistant` **DEVEM se alternar** se você estiver construindo um histórico de conversa. E a conversa, para obter uma nova resposta do `assistant`, **DEVE terminar com um turno `user`**. Você pode ter múltiplos pares `user`/`assistant` em um prompt (como se estivesse simulando uma conversa de múltiplos turnos). Você também pode colocar palavras em uma mensagem `assistant` terminal para que o Claude continue de onde você parou (técnica de "prefill", vista no Capítulo 05).

#### System Prompts (Prompts de Sistema)

Você também pode usar **system prompts**. Um prompt de sistema é uma maneira de **fornecer contexto, instruções de alto nível, persona e diretrizes ao Claude** antes de apresentar a primeira mensagem `user`. O system prompt influencia toda a interação subsequente.

Estruturalmente, os prompts de sistema são passados através de um parâmetro `system` dedicado na chamada da API, separado da lista `messages`. Nossa função auxiliar `get_completion` já inclui este parâmetro.

Dentro deste tutorial, sempre que pudermos utilizar um prompt de sistema, você verá o argumento `system_prompt` sendo usado na função `get_completion`. Caso não queira usar um prompt de sistema para uma chamada específica, simplesmente omita o argumento `system_prompt` ou passe uma string vazia.

#### Exemplo de Prompt de Sistema
> **Nota:** Este exemplo demonstra o uso de um "system prompt" para instruir o Claude a responder com perguntas de pensamento crítico em vez de respostas diretas.
```python
# Prompt de Sistema
SYSTEM_PROMPT_EX = "Sua resposta deve ser sempre uma série de perguntas de pensamento crítico que aprofundem a conversa (não forneça respostas às suas perguntas). Não responda efetivamente à pergunta do usuário."

# Prompt do Usuário
PROMPT_USUARIO_EX = "Por que o céu é azul?"

# Imprime a resposta do Claude
# print(get_completion(PROMPT_USUARIO_EX, system_prompt=SYSTEM_PROMPT_EX))
```

Por que usar um prompt de sistema? Um **prompt de sistema bem escrito pode melhorar o desempenho do Claude** de várias maneiras, como aumentar a capacidade do Claude de seguir regras e instruções, adotar uma persona específica, ou manter um certo estilo de resposta consistentemente. Para mais informações, visite nossa documentação sobre [como usar prompts de sistema](https://docs.anthropic.com/claude/docs/how-to-use-system-prompts) com o Claude.

Agora vamos mergulhar em alguns exercícios. Se você gostaria de experimentar os prompts da lição sem alterar nenhum conteúdo acima, role até o final do notebook da lição para visitar o [**Playground de Exemplos**](#playground-de-exemplos).

---

## <a name="exercicios"></a>Exercícios
- [Exercício 1.1 - Contando até Três](#exercicio-11---contando-ate-tres)
- [Exercício 1.2 - Prompt de Sistema](#exercicio-12---prompt-de-sistema)

### <a name="exercicio-11---contando-ate-tres"></a>Exercício 1.1 - Contando até Três
Usando a formatação adequada `user`, edite a variável `PROMPT_EXERCICIO_1_1` abaixo para fazer o Claude **contar até três.**

> **Nota do Exercício:** O objetivo deste exercício é fazer o Claude contar até três. Você precisará modificar a string da variável `PROMPT_EXERCICIO_1_1` que é passada para a função `get_completion`. Tente ser direto e claro em sua instrução ao Claude. A função `grade_exercise` original do notebook (não incluída aqui) verificaria se a resposta do Claude continha "1", "2" e "3". Lembre-se que a função `get_completion` atual envia apenas um único turno de "user".
```python
# Prompt - este é o único campo que você deve alterar
PROMPT_EXERCICIO_1_1 = "[Substitua este texto com seu prompt para fazer o Claude contar até três]"

# Para este tutorial em Markdown, você pode tentar:
# print(get_completion(PROMPT_EXERCICIO_1_1))
# E verificar manualmente se o Claude contou até três.

# # Código original do exercício para obter e avaliar a resposta:
# # response = get_completion(PROMPT_EXERCICIO_1_1)
# # def grade_exercise_1_1(text):
# #     pattern = re.compile(r'^(?=.*1)(?=.*2)(?=.*3).*$', re.DOTALL)
# #     return bool(pattern.match(text))
# # print(response)
# # print("\n--------------------------- AVALIAÇÃO ---------------------------")
# # print("Este exercício foi resolvido corretamente:", grade_exercise_1_1(response))
```

❓ Se você quiser uma dica:
> **Dica (Exercício 1.1):** A dica original para este exercício é: "Você pode precisar usar vários turnos de conversa user/assistant para obter a resposta desejada." (Nota: Com a função `get_completion` atual, que envia um único turno de usuário, você precisaria ser criativo em como formula essa única instrução para que Claude entenda a sequência. Em capítulos posteriores, veremos como enviar múltiplos turnos de forma explícita.)

### <a name="exercicio-12---prompt-de-sistema"></a>Exercício 1.2 - Prompt de Sistema

Modifique o `SYSTEM_PROMPT_EXERCICIO_1_2` para fazer o Claude responder como se fosse uma criança de 3 anos.

> **Nota do Exercício:** O objetivo aqui era modificar o `SYSTEM_PROMPT_EXERCICIO_1_2` para que a resposta do Claude à pergunta "Quão grande é o céu?" soasse como a de uma criança de 3 anos. A função `grade_exercise` original (não incluída) procuraria por palavras indicativas de fala infantil como "giggles" (risadinhas) ou "soo" (tããão) na resposta.
```python
# Prompt de Sistema - este é o único campo que você deve alterar
SYSTEM_PROMPT_EXERCICIO_1_2 = "[Substitua este texto pelo seu prompt de sistema para fazer o Claude soar como uma criança de 3 anos]"

# Prompt do Usuário
PROMPT_USUARIO_EXERCICIO_1_2 = "Quão grande é o céu?"

# Para este tutorial em Markdown, você pode tentar:
# print(get_completion(PROMPT_USUARIO_EXERCICIO_1_2, system_prompt=SYSTEM_PROMPT_EXERCICIO_1_2))
# E verificar manualmente se a resposta parece a de uma criança.

# # Código original do exercício para obter e avaliar a resposta:
# # response = get_completion(PROMPT_USUARIO_EXERCICIO_1_2, system_prompt=SYSTEM_PROMPT_EXERCICIO_1_2)
# # def grade_exercise_1_2(text):
# #     return bool(re.search(r"giggles", text, re.IGNORECASE) or re.search(r"soo", text, re.IGNORECASE) or re.search(r"big big", text, re.IGNORECASE))
# # print(response)
# # print("\n--------------------------- AVALIAÇÃO ---------------------------")
# # print("Este exercício foi resolvido corretamente:", grade_exercise_1_2(response))
```

❓ Se você quiser uma dica:
> **Dica (Exercício 1.2):** A dica original para este exercício é: "Tente incluir palavras como 'giggle' (risadinha) ou 'tiny' (pequenino) no seu prompt de sistema, ou descrever a persona de uma criança de 3 anos."

### Parabéns!

Se você resolveu todos os exercícios até este ponto, está pronto para passar para o próximo capítulo. Bom trabalho com os prompts!

---

## <a name="playground-de-exemplos"></a>Playground de Exemplos

Esta é uma área para você experimentar livremente com os exemplos de prompt mostrados nesta lição e ajustar os prompts para ver como isso pode afectar as respostas do Claude. Lembre-se de que para executar os blocos de código Python, você precisará ter configurado sua `API_KEY`, o nome do modelo (`MODEL_NAME`) e inicializado o `client` da Anthropic, conforme mostrado na seção de [Configuração](#configuracao).

> **Playground:** Envie um prompt simples para o Claude.
```python
# Prompt
# PROMPT_PG1 = "Oi Claude, como você está?"

# Imprime a resposta do Claude
# print(get_completion(PROMPT_PG1))
```

> **Playground:** Peça ao Claude a cor do oceano.
```python
# Prompt
# PROMPT_PG2 = "Você pode me dizer a cor do oceano?"

# Imprime a resposta do Claude
# print(get_completion(PROMPT_PG2))
```

> **Playground:** Pergunte ao Claude o ano de nascimento de Celine Dion.
```python
# Prompt
# PROMPT_PG3 = "Em que ano Celine Dion nasceu?"

# Imprime a resposta do Claude
# print(get_completion(PROMPT_PG3))
```

> **Playground:** Exemplo de chamada incorreta à API (faltando `role` e `content`). Executar isso diretamente com `client.messages.create` causaria um erro.
```python
# # Tentar executar isso diretamente com client.messages.create resultaria em erro.
# # messages_invalidas1 = [{"Oi Claude, como você está?"}]
# # try:
# #     response = client.messages.create(model=MODEL_NAME, max_tokens=100, messages=messages_invalidas1)
# # except Exception as e:
# #     print(f"Erro esperado: {e}")
```

> **Playground:** Exemplo de chamada incorreta à API (turnos `user` não alternados, se fosse uma conversa mais longa). Executar isso diretamente com `client.messages.create` causaria um erro se fosse o único conteúdo.
```python
# # Tentar executar isso diretamente com client.messages.create resultaria em erro
# # se esta fosse a totalidade da lista 'messages', pois o último turno deve ser 'user'.
# # messages_invalidas2 = [
# #           {"role": "user", "content": "Em que ano Celine Dion nasceu?"},
# #           {"role": "user", "content": "Além disso, você pode me contar outros fatos sobre ela?"}
# # ]
# # try:
# #     response = client.messages.create(model=MODEL_NAME, max_tokens=100, messages=messages_invalidas2)
# # except Exception as e:
# #     print(f"Erro esperado: {e}")
```

> **Playground:** Exemplo de uso de "system prompt".
```python
# Prompt de Sistema
# SYSTEM_PROMPT_PG = "Sua resposta deve ser sempre uma série de perguntas de pensamento crítico que aprofundem a conversa (não forneça respostas às suas perguntas). Não responda efetivamente à pergunta do usuário."

# Prompt do Usuário
# PROMPT_USUARIO_PG = "Por que o céu é azul?"

# Imprime a resposta do Claude
# print(get_completion(PROMPT_USUARIO_PG, system_prompt=SYSTEM_PROMPT_PG))
```

---
Dominar a estrutura básica de um prompt é essencial para interagir efetivamente com Claude. Neste capítulo, você aprendeu sobre os componentes chave de uma chamada à API Messages: o modelo, `max_tokens`, a estrutura de `messages` com papéis (`user`, `assistant`) e conteúdo, e os úteis parâmetros opcionais como `system prompts` e `temperature`. Você também viu como Claude responde a prompts bem formados e como erros na estrutura podem levar a falhas. Com esses fundamentos, você está pronto para explorar como a clareza e a objetividade nas suas instruções podem refinar ainda mais as respostas de Claude.

No próximo capítulo, focaremos em como ser claro e direto ao instruir o modelo.
