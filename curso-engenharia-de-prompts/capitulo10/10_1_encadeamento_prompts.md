# Apêndice A: Encadeamento de Prompts (Chaining Prompts)

- [Lição: O que é Encadeamento de Prompts?](#licao)
- [Exemplos de Encadeamento](#exemplos)
- [Playground de Exemplos](#playground-de-exemplos)

## <a name="configuracao"></a>Configuração

Execute a célula de configuração a seguir para carregar sua chave de API e estabelecer a função auxiliar `get_completion`.

> **Nota:** O comando `!pip install anthropic` é para instalar a biblioteca em ambientes Jupyter. Os comandos `%store -r API_KEY` e `%store -r MODEL_NAME` são específicos do IPython. Em um script Python padrão, defina `API_KEY` e `MODEL_NAME` diretamente.
> **Importante:** Nesta lição, a função `get_completion` foi reescrita para aceitar uma lista de `messages` de tamanho arbitrário. Isso é crucial para o encadeamento de prompts, pois permite construir um histórico de conversação que inclui respostas anteriores do Claude como contexto para novas perguntas.

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

# Foi reescrita para receber uma lista de mensagens de tamanho arbitrário
def get_completion(messages, system_prompt=""):
    # Verifique se client está definido e inicializado corretamente
    # if 'client' not in globals() or not hasattr(client, 'messages'):
    #     print("Cliente Anthropic não inicializado corretamente. Verifique sua API_KEY e a inicialização do cliente.")
    #     return "Erro: Cliente não inicializado."

    message_request = {
        "model": MODEL_NAME,
        "max_tokens": 2000,
        "temperature": 0.0,
        "messages": messages # A lista de mensagens é passada diretamente
    }
    if system_prompt:
        message_request["system"] = system_prompt

    response_message = client.messages.create(**message_request)
    return response_message.content[0].text
```

---

## <a name="licao"></a>Lição: O que é Encadeamento de Prompts?

Diz o ditado: "Escrever é reescrever." Acontece que **Claude muitas vezes pode melhorar a precisão de sua resposta quando solicitado a fazê-lo**! Essa ideia de refinar ou construir sobre respostas anteriores é um aspecto do "encadeamento de prompts" (prompt chaining).

**O que é Encadeamento de Prompts?**

Encadeamento de prompts é uma técnica onde a saída de um prompt é usada como entrada (ou parte da entrada) para um prompt subsequente. Isso permite decompor tarefas complexas em etapas menores e mais gerenciáveis. Em vez de tentar fazer Claude realizar uma tarefa muito complexa em uma única interação (um único prompt), você o guia através de uma série de prompts, construindo a solução passo a passo.

**Por que usar Encadeamento de Prompts?**

1.  **Decomposição de Tarefas Complexas:** Tarefas que exigem múltiplos passos de raciocínio ou a geração de diferentes partes de um todo (como escrever um relatório com introdução, desenvolvimento e conclusão) podem ser divididas em sub-tarefas mais simples.
2.  **Melhora da Precisão e Qualidade:** Ao focar em uma sub-tarefa por vez, Claude pode produzir resultados mais precisos para cada etapa. Pedir a Claude para "revisar", "corrigir" ou "expandir" seu trabalho anterior (um tipo de encadeamento) também pode levar a melhorias significativas.
3.  **Modularidade e Flexibilidade:** Cada prompt na cadeia pode ser desenvolvido, testado e otimizado independentemente.
4.  **Custo-Efetividade (Potencial):** Para algumas etapas da cadeia, você pode usar modelos de linguagem menores ou mais rápidos se a sub-tarefa for simples, reservando modelos mais poderosos (e potencialmente mais caros) para as etapas que exigem maior capacidade de raciocínio ou criatividade.
5.  **Controle do Processo:** Permite maior controle sobre o processo de geração de conteúdo ou tomada de decisão, possibilitando intervenção humana ou modificação de lógica entre as etapas, se necessário.
6.  **Superar Limites de Contexto:** Para tarefas que envolvem textos muito longos que excedem o limite de tokens de um único prompt, o encadeamento pode ser usado para processar o texto em partes.

**Padrões Comuns de Encadeamento:**

*   **Refinamento Iterativo:** Pedir a Claude para gerar algo (um rascunho, uma lista, uma ideia) e, em prompts subsequentes, pedir para ele melhorar, corrigir, expandir, resumir ou traduzir a saída anterior.
*   **Extração e Processamento:** Um prompt extrai informações específicas de um texto (ex: datas, nomes, sentimentos); o próximo prompt usa essas informações extraídas para realizar outra tarefa (ex: criar um evento no calendário, gerar um resumo focado nesses nomes, classificar o sentimento).
*   **Geração Sequencial:** Gerar partes de um documento em sequência (ex: gerar um esboço para um artigo, depois gerar cada seção do esboço, depois escrever uma introdução e conclusão, e finalmente, combinar e refinar o texto completo).
*   **Simulação de Diálogo:** Construir uma conversa passo a passo, onde cada novo prompt do usuário se baseia no histórico da conversa (que inclui os turnos anteriores do usuário e as respostas do assistente). A nova função `get_completion` que aceita uma lista de `messages` é ideal para isso.

Existem muitas maneiras de pedir a Claude para "pensar novamente" ou construir sobre o trabalho anterior. As formas que parecem naturais para pedir a um humano para verificar novamente seu trabalho geralmente também funcionam para Claude. (Confira nossa [documentação sobre encadeamento de prompts](https://docs.anthropic.com/claude/docs/chain-prompts) para mais exemplos de quando e como usar o encadeamento de prompts.)

---
## <a name="exemplos"></a>Exemplos de Encadeamento

Neste exemplo, pedimos a Claude para listar dez palavras... mas uma ou mais delas não é uma palavra real. Este é o primeiro passo da nossa cadeia.

> **Nota:** Claude é solicitado a nomear dez palavras terminadas em "ab". Sua primeira resposta pode conter erros. (Lembre-se de ter `API_KEY` e `MODEL_NAME` configurados e `client` inicializado para executar.)
```python
# Prompt inicial do usuário
primeiro_usuario = "Nomeie dez palavras que terminam exatamente com as letras 'ab'."
# Original: "Name ten words that all end with the exact letters 'ab'."

# Array de mensagens da API para a primeira chamada
mensagens_passo1 = [
    {
        "role": "user",
        "content": primeiro_usuario
    }
]

# Armazena e imprime a resposta de Claude
# primeira_resposta = get_completion(mensagens_passo1)
# print("Resposta do Claude ao primeiro prompt:")
# print(primeira_resposta)
```

**Pedir a Claude para tornar sua resposta mais precisa** corrige o erro!

Abaixo, pegamos a resposta (potencialmente incorreta) de Claude de cima e adicionamos outro turno à conversa, pedindo a Claude para corrigir sua resposta anterior. A `primeira_resposta` agora faz parte do histórico da conversa enviado a Claude no segundo passo da cadeia.

> **Nota:** No segundo passo da cadeia, fornecemos a resposta anterior de Claude e pedimos para ele corrigir os erros.
```python
# Suponha que 'primeira_resposta' contenha a saída da célula anterior.
# Exemplo de 'primeira_resposta' que Claude poderia dar (com um erro):
# primeira_resposta = "Aqui estão 10 palavras que terminam com 'ab':\n1. Cab\n2. Dab\n3. Blab\n4. Grab\n5. Scrab\n6. Stab\n7. Flab\n8. Tab\n9. Collab\n10. Vocab" # "Scrab" não é uma palavra comum.

segundo_usuario = "Por favor, encontre substituições para todas as 'palavras' que não são palavras reais."
# Original: "Please find replacements for all 'words' that are not real words."

# Array de mensagens da API para a segunda chamada, incluindo o histórico
# mensagens_passo2 = [
#     {
#         "role": "user",
#         "content": primeiro_usuario # Pergunta original
#     },
#     {
#         "role": "assistant",
#         "content": primeira_resposta # Resposta de Claude do passo 1
#     },
#     {
#         "role": "user",
#         "content": segundo_usuario # Novo pedido de correção
#     }
# ]

# Imprime a resposta de Claude ao segundo prompt
# print("------------------------ Array completo de mensagens (Passo 2) ------------------------")
# print(mensagens_passo2)
# print("\n------------------------------------- Resposta Corrigida do Claude ------------------------------------")
# print(get_completion(mensagens_passo2))
```

Mas Claude está revisando sua resposta apenas porque dissemos para ele fazer? E se começarmos com uma resposta correta? Claude perderá a confiança? Aqui, colocamos uma resposta correta no lugar de `primeira_resposta` e pedimos para ele verificar novamente.

> **Nota:** Testando se Claude muda uma resposta já correta quando solicitado a "corrigir".
```python
# Prompt inicial do usuário (o mesmo)
# primeiro_usuario = "Nomeie dez palavras que terminam exatamente com as letras 'ab'."

# Resposta correta (como se Claude tivesse acertado de primeira)
primeira_resposta_correta = """Aqui estão 10 palavras que terminam com as letras 'ab':

1. Cab
2. Dab
3. Grab
4. Gab
5. Jab
6. Lab
7. Nab
8. Slab
9. Tab
10. Blab"""

# Pedido de correção (o mesmo)
# segundo_usuario = "Por favor, encontre substituições para todas as 'palavras' que não são palavras reais."

# Array de mensagens da API
# mensagens_passo2_correto = [
#     {
#         "role": "user",
#         "content": primeiro_usuario
#     },
#     {
#         "role": "assistant",
#         "content": primeira_resposta_correta
#     },
#     {
#         "role": "user",
#         "content": segundo_usuario
#     }
# ]

# Imprime a resposta de Claude
# print("------------------------ Array completo de mensagens (com resposta inicial correta) ------------------------")
# print(mensagens_passo2_correto)
# print("\n------------------------------------- Resposta do Claude (após verificar resposta correta) ------------------------------------")
# print(get_completion(mensagens_passo2_correto))
```

Você pode notar que, se gerar uma resposta do bloco acima algumas vezes, Claude mantém as palavras como estão na maioria das vezes, mas ainda ocasionalmente muda as palavras, mesmo que todas já estejam corretas. O que podemos fazer para mitigar isso? Conforme o Capítulo 8, podemos dar a Claude uma "saída"! Vamos tentar mais uma vez.

> **Nota:** Refinando o pedido de correção para incluir uma "saída" se a lista já estiver correta, para aumentar a confiabilidade.
```python
# Prompt inicial (o mesmo)
# primeiro_usuario = "Nomeie dez palavras que terminam exatamente com as letras 'ab'."
# primeira_resposta_correta (a mesma da célula anterior)

segundo_usuario_com_saida = "Por favor, encontre substituições para todas as 'palavras' que não são palavras reais. Se todas as palavras forem reais, retorne a lista original."
# Original: "Please find replacements for all 'words' that are not real words. If all the words are real words, return the original list."

# Array de mensagens da API
# mensagens_passo2_com_saida = [
#     {
#         "role": "user",
#         "content": primeiro_usuario
#     },
#     {
#         "role": "assistant",
#         "content": primeira_resposta_correta
#     },
#     {
#         "role": "user",
#         "content": segundo_usuario_com_saida
#     }
# ]

# Imprime a resposta de Claude
# print("------------------------ Array completo de mensagens (com saída para resposta correta) ------------------------")
# print(mensagens_passo2_com_saida)
# print("\n------------------------------------- Resposta do Claude (com instrução de saída) ------------------------------------")
# print(get_completion(mensagens_passo2_com_saida))
```

Tente gerar respostas do código acima algumas vezes para ver que Claude é muito melhor em manter sua posição agora.

Você também pode usar o encadeamento de prompts para **pedir a Claude para melhorar suas respostas**. Abaixo, pedimos a Claude para primeiro escrever uma história e, em seguida, melhorar a história que escreveu.

Primeiro, vamos gerar a primeira versão da história de Claude.
```python
# Prompt inicial
primeiro_usuario_historia = "Escreva uma história curta de três frases sobre uma garota que gosta de correr."
# Original: "Write a three-sentence short story about a girl who likes to run."

# Array de mensagens da API
# mensagens_historia_passo1 = [
#     {
#         "role": "user",
#         "content": primeiro_usuario_historia
#     }
# ]

# Armazena e imprime a resposta de Claude
# primeira_resposta_historia = get_completion(mensagens_historia_passo1)
# print("Primeira versão da história:")
# print(primeira_resposta_historia)
```

Agora vamos fazer Claude melhorar seu primeiro rascunho.
```python
# Suponha que 'primeira_resposta_historia' contenha a história da célula anterior.
# Exemplo: primeira_resposta_historia = "Lily adorava correr. Todas as manhãs ela corria pela floresta perto de sua casa. Ela se sentia livre e feliz enquanto o vento passava por ela."

segundo_usuario_melhorar = "Melhore a história."
# Original: "Make the story better."

# Array de mensagens da API
# mensagens_historia_passo2 = [
#     {
#         "role": "user",
#         "content": primeiro_usuario_historia
#     },
#     {
#         "role": "assistant",
#         "content": primeira_resposta_historia
#     },
#     {
#         "role": "user",
#         "content": segundo_usuario_melhorar
#     }
# ]

# Imprime a resposta de Claude
# print("------------------------ Array completo de mensagens (para melhorar a história) ------------------------")
# print(mensagens_historia_passo2)
# print("\n------------------------------------- História Melhorada por Claude ------------------------------------")
# print(get_completion(mensagens_historia_passo2))
```

Esta forma de substituição (passando a saída anterior como entrada no histórico da conversa) é muito poderosa. Temos usado isso para passar listas, palavras, respostas anteriores de Claude, etc. Você também pode **usar a substituição para fazer o que chamamos de "chamada de função" (function calling)**, que é pedir a Claude para simular a execução de alguma função ou formatar sua saída de uma maneira que possa ser facilmente usada por código externo, e então pegar os resultados dessa "função" e pedir a Claude para fazer ainda mais depois com os resultados. Mais sobre isso no próximo apêndice sobre Uso de Ferramentas.

Abaixo está mais um exemplo de pegar os resultados de uma chamada a Claude e conectá-los a outra chamada. Vamos começar com o primeiro prompt (que inclui o pré-preenchimento da resposta de Claude desta vez para guiar a formatação).

> **Nota:** Primeiro, extraímos nomes de um texto, usando pré-preenchimento para guiar o formato para tags `<names>`.
```python
# Prompt do usuário para extrair nomes
primeiro_usuario_nomes = """Encontre todos os nomes no texto abaixo:

"Olá, Jesse. Sou eu, Erin. Estou ligando sobre a festa que o Joey está organizando para amanhã. Keisha disse que viria e acho que Mel também estará lá." """

# Pré-preenchimento para guiar a formatação
prefill_nomes = "<names>"

# Array de mensagens da API
# mensagens_nomes_passo1 = [
#     {
#         "role": "user",
#         "content": primeiro_usuario_nomes
#     },
#     {
#         "role": "assistant",
#         "content": prefill_nomes # Inicia a resposta do assistente com <names>
#     }
# ]

# Armazena e imprime a resposta de Claude
# primeira_resposta_nomes_conteudo = get_completion(mensagens_nomes_passo1) # Conteúdo gerado por Claude após o prefill
# primeira_resposta_nomes_completa = prefill_nomes + "\n" + primeira_resposta_nomes_conteudo # Adiciona o prefill de volta para a resposta completa
# print("------------------------ Array completo de mensagens (extração de nomes) ------------------------")
# print(mensagens_nomes_passo1)
# print("\n------------------------------------- Nomes Extraídos por Claude ------------------------------------")
# print(primeira_resposta_nomes_completa)
```

Vamos passar esta lista de nomes para outro prompt para ordená-la.

> **Nota:** A lista de nomes extraída (incluindo o prefill `<names>` e a tag de fechamento que Claude adicionaria) é então usada como parte da conversa para o próximo passo: ordenar a lista.
```python
# Suponha que 'primeira_resposta_nomes_completa' contenha a lista de nomes da célula anterior,
# por exemplo: "<names>\nJesse\nErin\nJoey\nKeisha\nMel</names>"

segundo_usuario_ordenar = "Ordene a lista em ordem alfabética."
# Original: "Alphabetize the list."

# Array de mensagens da API
# mensagens_nomes_passo2 = [
#     {
#         "role": "user",
#         "content": primeiro_usuario_nomes
#     },
#     {
#         "role": "assistant",
#         "content": primeira_resposta_nomes_completa # Conteúdo completo do turno do assistente anterior
#     },
#     {
#         "role": "user",
#         "content": segundo_usuario_ordenar
#     }
# ]

# Imprime a resposta de Claude
# print("------------------------ Array completo de mensagens (ordenar nomes) ------------------------")
# print(mensagens_nomes_passo2)
# print("\n------------------------------------- Nomes Ordenados por Claude ------------------------------------")
# print(get_completion(mensagens_nomes_passo2))
```

Agora que você aprendeu sobre o encadeamento de prompts, vá para o Apêndice 10.2 para aprender como implementar a chamada de função (function calling / tool use) usando o encadeamento de prompts e outras técnicas.

---

## <a name="playground-de-exemplos"></a>Playground de Exemplos

Esta é uma área para você experimentar livremente com os exemplos de prompt mostrados nesta lição e ajustar os prompts para ver como isso pode afetar as respostas de Claude. Tente encadear diferentes tipos de pedidos!

> **Playground:** Encadeamento - Passo 1: Gerar uma lista de itens.
```python
# Prompt inicial do usuário
# primeiro_usuario_pg = "Liste 5 frutas tropicais."

# Array de mensagens da API para a primeira chamada
# mensagens_pg_passo1 = [
#     {
#         "role": "user",
#         "content": primeiro_usuario_pg
#     }
# ]

# Armazena e imprime a resposta de Claude
# primeira_resposta_pg = get_completion(mensagens_pg_passo1)
# print("Resposta do Claude ao primeiro prompt (Playground):")
# print(primeira_resposta_pg)
```

> **Playground:** Encadeamento - Passo 2: Usar a saída do Passo 1 para uma nova tarefa (ex: pedir uma descrição curta para cada fruta).
```python
# Supondo que 'primeira_resposta_pg' contenha a lista de frutas da célula anterior.
# segundo_usuario_pg = f"Para cada uma das seguintes frutas, escreva uma descrição de uma frase:\n{primeira_resposta_pg}"

# Array de mensagens da API para a segunda chamada
# mensagens_pg_passo2 = [
#     {
#         "role": "user",
#         "content": primeiro_usuario_pg
#     },
#     {
#         "role": "assistant",
#         "content": primeira_resposta_pg
#     },
#     {
#         "role": "user",
#         "content": segundo_usuario_pg
#     }
# ]

# Imprime a resposta de Claude ao segundo prompt
# print("Resposta do Claude ao segundo prompt (Playground):")
# print(get_completion(mensagens_pg_passo2))
```
