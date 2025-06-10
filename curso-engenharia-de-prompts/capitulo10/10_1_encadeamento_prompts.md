# Apêndice A: Encadeamento de Prompts (Chaining Prompts)

Bem-vindo ao Apêndice A! O "encadeamento de prompts" (prompt chaining) é uma técnica avançada e flexível que permite construir interações mais sofisticadas e realizar tarefas complexas com Claude. Em vez de tentar resolver um problema com um único prompt gigantesco, você o divide em uma série de prompts menores e mais gerenciáveis, onde a saída de um prompt alimenta o próximo. Este capítulo demonstrará como implementar o encadeamento, aproveitando a capacidade da API Messages de lidar com o histórico da conversa.

- [Lição: O que é Encadeamento de Prompts?](#licao)
- [Exemplos de Encadeamento](#exemplos)
- [Playground de Exemplos](#playground-de-exemplos)

## <a name="configuracao"></a>Configuração

Execute a célula de configuração a seguir para carregar sua chave de API e estabelecer a função auxiliar `get_completion`.

> **Nota:** O comando `!pip install anthropic` é para instalar a biblioteca em ambientes Jupyter. Os comandos `%store -r API_KEY` e `%store -r MODEL_NAME` são específicos do IPython. Em um script Python padrão, defina `API_KEY` e `MODEL_NAME` diretamente.
> **Importante:** Nesta lição, a função `get_completion` é projetada para aceitar uma lista de `messages` de tamanho arbitrário. Isso é crucial para o encadeamento de prompts, pois permite construir um histórico de conversação (incluindo turnos de `user` e `assistant`) que é passado a cada nova chamada. Qualquer "pré-preenchimento" do turno do assistente é feito adicionando um dicionário `{"role": "assistant", "content": "texto do prefill..."}` à lista `messages` *antes* de chamar `get_completion`.

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

# Esta versão de get_completion aceita uma lista de mensagens.
def get_completion(messages_history, system_prompt=""): # Renomeado 'messages' para 'messages_history' para clareza
    if 'client' not in globals() or not isinstance(client, anthropic.Anthropic):
        print("Erro: O cliente Anthropic (client) não foi inicializado corretamente.")
        return "Erro de configuração: cliente não definido."
    if 'MODEL_NAME' not in globals() or not MODEL_NAME:
        print("Erro: A variável MODEL_NAME não foi definida.")
        return "Erro de configuração: nome do modelo não definido."

    try:
        message_request = {
            "model": MODEL_NAME,
            "max_tokens": 2000,
            "temperature": 0.0,
            "messages": messages_history # A lista de mensagens (histórico) é passada diretamente
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

## <a name="licao"></a>Lição: O que é Encadeamento de Prompts?

Diz o ditado: "Escrever é reescrever." Acontece que **Claude muitas vezes pode melhorar a precisão de sua resposta quando solicitado a fazê-lo**! Essa ideia de refinar ou construir sobre respostas anteriores é um aspecto central do "encadeamento de prompts" (prompt chaining).

**O que é Encadeamento de Prompts?**

Encadeamento de prompts é uma técnica onde a saída de um prompt (a resposta do assistente) é usada como entrada (parte do histórico da conversa) para um prompt subsequente. Isso permite decompor tarefas complexas em etapas menores e mais gerenciáveis. Em vez de tentar fazer Claude realizar uma tarefa muito complexa em uma única interação (um único prompt), você o guia através de uma série de interações, onde cada nova interação se baseia no que foi dito anteriormente.

**Por que usar Encadeamento de Prompts?**

1.  **Decomposição de Tarefas Complexas:** Tarefas que exigem múltiplos passos de raciocínio ou a geração de diferentes partes de um todo (como escrever um relatório com introdução, desenvolvimento e conclusão) podem ser divididas de forma lógica.
2.  **Melhora da Precisão e Qualidade:** Ao focar em uma sub-tarefa por vez, Claude pode produzir resultados mais precisos para cada etapa. Pedir a Claude para "revisar", "corrigir", "expandir" ou "resumir" seu trabalho anterior são formas de encadeamento que podem levar a melhorias significativas.
3.  **Modularidade e Flexibilidade:** Cada prompt na cadeia pode ser desenvolvido e testado independentemente.
4.  **Custo-Efetividade (Potencial):** Para algumas etapas da cadeia, você pode usar modelos de linguagem menores ou mais rápidos se a sub-tarefa for simples, reservando modelos mais poderosos para as etapas que exigem maior capacidade de raciocínio.
5.  **Controle do Processo:** Permite maior controle sobre o processo de geração, possibilitando intervenção ou modificação entre as etapas, se necessário.
6.  **Superar Limites de Contexto:** Para tarefas que envolvem textos muito longos que excedem o limite de tokens de um único prompt, o encadeamento pode ser usado para processar o texto em partes ou para construir um resumo progressivo.

**Padrões Comuns de Encadeamento:**

*   **Refinamento Iterativo:** Gerar um rascunho e, em seguida, usar prompts subsequentes para pedir melhorias, correções ou expansões.
*   **Extração e Processamento:** Um prompt extrai informações; o próximo usa essas informações para outra tarefa (resumir, traduzir, formatar).
*   **Geração Sequencial:** Gerar partes de um documento em sequência (ex: esboço -> seções -> introdução/conclusão -> revisão final).
*   **Simulação de Diálogo:** Construir uma conversa natural, onde cada nova mensagem do usuário é adicionada ao histórico, e Claude responde com base em todo o diálogo anterior. A função `get_completion` deste capítulo é ideal para isso.

Existem muitas maneiras de pedir a Claude para "pensar novamente" ou construir sobre o trabalho anterior. As formas que parecem naturais para pedir a um humano para verificar novamente seu trabalho geralmente também funcionam para Claude. (Confira a [documentação oficial da Anthropic sobre encadeamento de prompts](https://docs.anthropic.com/claude/docs/chain-prompts) para mais exemplos.)

---
## <a name="exemplos"></a>Exemplos de Encadeamento

Nos exemplos a seguir, construiremos a lista `messages` passo a passo para demonstrar o encadeamento.

**Exemplo 1: Correção de Lista de Palavras**

Primeiro, pedimos a Claude para listar dez palavras. Sua resposta inicial pode conter erros.

> **Nota:** Claude é solicitado a nomear dez palavras terminadas em "ab". (Lembre-se de ter `API_KEY` e `MODEL_NAME` configurados e `client` inicializado para executar.)
```python
# Prompt inicial do usuário
prompt_palavras_inicial = "Nomeie dez palavras que terminam exatamente com as letras 'ab'."

# Array de mensagens da API para a primeira chamada
mensagens_palavras_passo1 = [
    {"role": "user", "content": prompt_palavras_inicial}
]

# Armazena e imprime a resposta de Claude
# resposta_palavras_passo1 = get_completion(mensagens_palavras_passo1)
# print("Resposta do Claude ao primeiro prompt (lista de palavras):")
# print(resposta_palavras_passo1)
```

Em seguida, pegamos a resposta de Claude (mesmo que contenha erros, como "Scrab" no exemplo do notebook) e a adicionamos ao histórico da conversa. Então, pedimos a Claude para corrigir sua própria lista.

> **Nota:** No segundo passo da cadeia, fornecemos a pergunta original do usuário, a resposta anterior de Claude (com o erro), e um novo pedido para corrigir os erros.
```python
# Suponha que 'resposta_palavras_passo1' contenha a saída da célula anterior.
# Exemplo de 'resposta_palavras_passo1' que Claude poderia dar (com um erro):
# resposta_palavras_passo1 = "Aqui estão 10 palavras que terminam com 'ab':\n1. Cab\n2. Dab\n3. Blab\n4. Grab\n5. Scrab\n6. Stab\n7. Flab\n8. Tab\n9. Collab\n10. Vocab"

prompt_correcao_palavras = "Por favor, encontre substituições para todas as 'palavras' na sua lista anterior que não são palavras reais."

# Array de mensagens da API para a segunda chamada, incluindo o histórico
# mensagens_palavras_passo2 = [
#     {"role": "user", "content": prompt_palavras_inicial},
#     {"role": "assistant", "content": resposta_palavras_passo1}, # Resposta de Claude do passo 1
#     {"role": "user", "content": prompt_correcao_palavras}    # Novo pedido de correção
# ]

# Imprime a resposta de Claude ao segundo prompt
# print("------------------------ Array completo de mensagens (Passo 2 - Correção) ------------------------")
# print(mensagens_palavras_passo2)
# print("\n------------------------------------- Resposta Corrigida do Claude ------------------------------------")
# print(get_completion(mensagens_palavras_passo2))
```

**Exemplo 2: Melhorando uma História**

Podemos usar o encadeamento para pedir a Claude que melhore suas próprias criações.

Primeiro, geramos uma história curta:
```python
# Prompt inicial
prompt_historia_inicial = "Escreva uma história curta de três frases sobre uma garota que gosta de correr."

# Array de mensagens da API
# mensagens_historia_passo1 = [
#     {"role": "user", "content": prompt_historia_inicial}
# ]

# Armazena e imprime a resposta de Claude
# resposta_historia_passo1 = get_completion(mensagens_historia_passo1)
# print("Primeira versão da história:")
# print(resposta_historia_passo1)
```

Agora, adicionamos a história gerada ao histórico e pedimos a Claude para melhorá-la:
```python
# Suponha que 'resposta_historia_passo1' contenha a história da célula anterior.
prompt_melhorar_historia = "Melhore a história que você acabou de me contar. Torne-a mais vívida e emocionante."

# Array de mensagens da API
# mensagens_historia_passo2 = [
#     {"role": "user", "content": prompt_historia_inicial},
#     {"role": "assistant", "content": resposta_historia_passo1},
#     {"role": "user", "content": prompt_melhorar_historia}
# ]

# Imprime a resposta de Claude
# print("------------------------ Array completo de mensagens (Melhorar História) ------------------------")
# print(mensagens_historia_passo2)
# print("\n------------------------------------- História Melhorada por Claude ------------------------------------")
# print(get_completion(mensagens_historia_passo2))
```

**Exemplo 3: Extração de Nomes e Ordenação (Múltiplos Passos)**

Aqui, primeiro pedimos a Claude para extrair nomes de um texto. Usamos um "prefill" (adicionando um turno de assistente com conteúdo inicial) para guiar o formato da extração.

> **Nota:** Primeiro, extraímos nomes de um texto. O `prefill_nomes` é adicionado como o início do turno do assistente na lista `messages`.
```python
# Prompt do usuário para extrair nomes
prompt_extrair_nomes = """Encontre todos os nomes no texto abaixo:

"Olá, Jesse. Sou eu, Erin. Estou ligando sobre a festa que o Joey está organizando para amanhã. Keisha disse que viria e acho que Mel também estará lá." """

# Pré-preenchimento para guiar a formatação (início do turno do assistente)
prefill_nomes = "<names>"

# Array de mensagens da API para a primeira chamada
# mensagens_nomes_passo1 = [
#     {"role": "user", "content": prompt_extrair_nomes},
#     {"role": "assistant", "content": prefill_nomes} # Claude continuará a partir daqui
# ]

# Armazena e imprime a resposta de Claude (o conteúdo gerado APÓS o prefill)
# resposta_conteudo_nomes = get_completion(mensagens_nomes_passo1)
# resposta_completa_assistente_nomes = prefill_nomes + "\n" + resposta_conteudo_nomes # Resposta completa do assistente
# print("------------------------ Array de mensagens (Extração de Nomes) ------------------------")
# print(mensagens_nomes_passo1) # Mostra o que foi enviado (incluindo o prefill do assistente)
# print("\n------------------------------------- Nomes Extraídos por Claude (Resposta Completa do Assistente) ------------------------------------")
# print(resposta_completa_assistente_nomes)
```

Agora, passamos esta lista de nomes (a resposta completa do assistente do passo anterior) para outro prompt para ordená-la.

> **Nota:** A lista de nomes extraída é usada como parte do histórico da conversa para o próximo passo: ordenar a lista.
```python
# Suponha que 'resposta_completa_assistente_nomes' contenha a lista de nomes da célula anterior,
# por exemplo: "<names>\nJesse\nErin\nJoey\nKeisha\nMel</names>" (Claude provavelmente adicionaria a tag de fechamento)

prompt_ordenar_nomes = "Ordene a lista de nomes que você forneceu em ordem alfabética."

# Array de mensagens da API para o segundo passo
# mensagens_nomes_passo2 = [
#     {"role": "user", "content": prompt_extrair_nomes}, # Contexto original
#     {"role": "assistant", "content": resposta_completa_assistente_nomes}, # Resposta completa de Claude
#     {"role": "user", "content": prompt_ordenar_nomes} # Nova instrução
# ]

# Imprime a resposta de Claude
# print("------------------------ Array completo de mensagens (Ordenar Nomes) ------------------------")
# print(mensagens_nomes_passo2)
# print("\n------------------------------------- Nomes Ordenados por Claude ------------------------------------")
# print(get_completion(mensagens_nomes_passo2))
```

Agora que você aprendeu sobre o encadeamento de prompts, vá para o Apêndice B para aprender como implementar o uso de ferramentas (function calling), que frequentemente utiliza o encadeamento de prompts.

---

## <a name="playground-de-exemplos"></a>Playground de Exemplos

Esta é uma área para você experimentar livremente com os exemplos de prompt mostrados nesta lição e ajustar os prompts para ver como isso pode afetar as respostas de Claude. Tente encadear diferentes tipos de pedidos!

> **Playground:** Encadeamento - Passo 1: Gerar uma lista de itens.
```python
# Prompt inicial do usuário
# primeiro_usuario_pg = "Liste 5 planetas do nosso sistema solar."

# Array de mensagens da API para a primeira chamada
# mensagens_pg_passo1 = [
#     {
#         "role": "user",
#         "content": primeiro_usuario_pg
#     }
# ]

# Armazena e imprime a resposta de Claude
# primeira_resposta_pg = get_completion(mensagens_pg_passo1)
# print("Resposta do Claude ao primeiro prompt (Playground - Planetas):")
# print(primeira_resposta_pg)
```

> **Playground:** Encadeamento - Passo 2: Usar a saída do Passo 1 para uma nova tarefa (ex: pedir uma característica de cada planeta).
```python
# Supondo que 'primeira_resposta_pg' contenha a lista de planetas da célula anterior.
# segundo_usuario_pg = f"Para cada um dos seguintes planetas, mencione uma característica distintiva:\n{primeira_resposta_pg}"

# Array de mensagens da API para a segunda chamada
# mensagens_pg_passo2 = [
#     {
#         "role": "user",
#         "content": primeiro_usuario_pg # Pergunta original
#     },
#     {
#         "role": "assistant",
#         "content": primeira_resposta_pg # Resposta de Claude
#     },
#     {
#         "role": "user",
#         "content": segundo_usuario_pg # Nova pergunta baseada na resposta anterior
#     }
# ]

# Imprime a resposta de Claude ao segundo prompt
# print("Resposta do Claude ao segundo prompt (Playground - Características dos Planetas):")
# print(get_completion(mensagens_pg_passo2))
```
---
O encadeamento de prompts é uma estratégia poderosa para lidar com tarefas complexas, melhorar a qualidade das respostas e criar fluxos de trabalho interativos com Claude. Ao dividir problemas em etapas menores, passar o histórico da conversa e refinar iterativamente as saídas, você ganha mais controle e pode alcançar resultados que seriam difíceis com um único prompt. Esta técnica é fundamental para muitas aplicações avançadas de LLMs, incluindo a simulação de chamadas de função (uso de ferramentas), que exploraremos no próximo apêndice.
