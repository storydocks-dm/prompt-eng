# Capítulo 05: Formatando a Saída e Controlando a "Voz" do Claude

- [Lição](#licao)
- [Exercícios](#exercicios)
- [Playground de Exemplos](#playground-de-exemplos)

## <a name="configuracao"></a>Configuração

Execute a célula de configuração a seguir para carregar sua chave de API e estabelecer a função auxiliar `get_completion`.

> **Nota:** O comando `!pip install anthropic` é para instalar a biblioteca em ambientes Jupyter. Os comandos `%store -r API_KEY` e `%store -r MODEL_NAME` são específicos do IPython. Em um script Python padrão, defina `API_KEY` e `MODEL_NAME` diretamente.
> **Importante:** Nesta lição, a função `get_completion` é modificada para incluir um parâmetro `prefill`. Este parâmetro é usado para fornecer o início da resposta do `assistant` (assistente), uma técnica chamada "speaking for Claude" (falar pelo Claude) ou "prefilling Claude's response" (pré-preencher a resposta do Claude).

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

# Novo argumento adicionado para texto de pré-preenchimento (prefill), com valor padrão de string vazia
def get_completion(prompt: str, system_prompt="", prefill=""):
    # Verifique se client está definido e inicializado corretamente
    # if 'client' not in globals() or not hasattr(client, 'messages'):
    #     print("Cliente Anthropic não inicializado corretamente. Verifique sua API_KEY e a inicialização do cliente.")
    #     return "Erro: Cliente não inicializado."

    # Constrói a lista de mensagens
    messages = [{"role": "user", "content": prompt}]
    # Adiciona o turno do assistente com o preenchimento APENAS se prefill não for uma string vazia.
    # Se prefill for uma string vazia, o SDK tratará isso como Claude começando sua resposta do zero.
    if prefill: # No notebook original, um prefill vazio ainda era passado como um turno de assistente.
                # Para replicar isso estritamente, a condição `if prefill:` pode ser removida,
                # mas geralmente é mais lógico adicionar o turno do assistente apenas se houver conteúdo de preenchimento.
                # O SDK da Anthropic para Python, ao construir o objeto MessageParam,
                # espera um conteúdo não vazio se um turno de assistente for explicitamente adicionado.
                # A lógica do notebook original implica que um {"role": "assistant", "content": ""} é enviado.
        messages.append({"role": "assistant", "content": prefill})

    message_request = {
        "model": MODEL_NAME,
        "max_tokens": 2000,
        "temperature": 0.0,
        "messages": messages
    }
    if system_prompt: # Adiciona system_prompt apenas se fornecido
        message_request["system"] = system_prompt

    response_message = client.messages.create(**message_request)
    return response_message.content[0].text
```

---

## <a name="licao"></a>Lição

**Claude pode formatar sua saída de diversas maneiras**. Você só precisa pedir para ele fazer isso! Uma das formas mais eficazes de garantir o formato desejado é demonstrá-lo com exemplos (técnica conhecida como "few-shot prompting", que veremos em detalhes mais adiante), instruir explicitamente o formato e, em alguns casos, até mesmo iniciar a resposta do Claude para guiá-lo na direção certa.

Você já aprendeu que pode usar tags XML para tornar seu prompt mais claro e analisável para Claude. Acontece que você também pode pedir a Claude para **usar tags XML para tornar sua saída mais clara e facilmente compreensível** para humanos (e para análise programática). Isso é útil para extrair informações específicas da resposta de forma confiável.

### Exemplos

Lembre-se do 'problema do preâmbulo do poema' que resolvemos no Capítulo 2, pedindo a Claude para pular o preâmbulo inteiramente? Acontece que também podemos alcançar um resultado semelhante **dizendo a Claude para colocar o poema em tags XML**.

> **Nota:** Este exemplo pede a Claude para formatar a saída de um haicai usando tags `<haiku>`. (Lembre-se de ter `API_KEY` e `MODEL_NAME` configurados e `client` inicializado para executar.)
```python
# Conteúdo variável
ANIMAL = "Coelho" # Original: "Rabbit"

# Modelo de prompt com um placeholder para o conteúdo variável
PROMPT = f"Por favor, escreva um haicai sobre {ANIMAL}. Coloque-o em tags <haiku>."

# Imprime a resposta do Claude
# print("--------------------------- Prompt completo com substituições de variáveis ---------------------------")
# print(PROMPT)
# print("\n------------------------------------- Resposta do Claude ------------------------------------")
# print(get_completion(PROMPT))
```

Por que isso é algo que gostaríamos de fazer? Bem, ter a saída em **tags XML permite ao usuário final obter de forma confiável o poema e apenas o poema, escrevendo um pequeno programa para extrair o conteúdo entre as tags XML**. Isso é muito útil para processamento automatizado de respostas.

Uma extensão dessa técnica é **colocar a primeira tag XML no turno do `assistant` (assistente). Quando você coloca texto no turno do `assistant`, está basicamente dizendo a Claude que ele já disse algo e que deve continuar a partir daquele ponto. Essa técnica é chamada de "speaking for Claude" (falar pelo Claude) ou "prefilling Claude's response" (pré-preencher a resposta de Claude).**

Abaixo, fizemos isso com a primeira tag XML `<haiku>`. Observe como Claude continua diretamente de onde paramos.

> **Nota:** Demonstração da técnica de "falar pelo Claude", pré-preenchendo o início da resposta do assistente com a tag `<haiku>`.
```python
# Conteúdo variável
ANIMAL = "Gato" # Original: "Cat"

# Modelo de prompt com um placeholder para o conteúdo variável
PROMPT = f"Por favor, escreva um haicai sobre {ANIMAL}. Coloque-o em tags <haiku>."

# Pré-preenchimento para a resposta de Claude
PREFILL = "<haiku>" # Claude continuará a partir daqui

# Imprime a resposta do Claude
# print("--------------------------- Prompt completo com substituições de variáveis ---------------------------")
# print("TURNO DO USUÁRIO:")
# print(PROMPT)
# print("\nTURNO DO ASSISTENTE (pré-preenchido):")
# print(PREFILL)
# print("\n------------------------------------- Resposta do Claude (continuação) ------------------------------------")
# print(get_completion(PROMPT, prefill=PREFILL))
```

Claude também se destaca no uso de outros estilos de formatação de saída, notadamente `JSON`. Se você deseja impor a saída JSON (não deterministicamente, mas com alta probabilidade), também pode pré-preencher a resposta de Claude com o colchete de abertura, `{`.

> **Nota:** Este exemplo mostra como solicitar e pré-preencher uma saída JSON para um haicai.
```python
# Conteúdo variável
ANIMAL = "Gato" # Original: "Cat"

# Modelo de prompt com um placeholder para o conteúdo variável
PROMPT = f"Por favor, escreva um haicai sobre {ANIMAL}. Use o formato JSON com as chaves \"primeira_linha\", \"segunda_linha\" e \"terceira_linha\"."

# Pré-preenchimento para a resposta de Claude
PREFILL = "{" # Inicia a resposta JSON

# Imprime a resposta do Claude
# print("--------------------------- Prompt completo com substituições de variáveis ---------------------------")
# print("TURNO DO USUÁRIO:")
# print(PROMPT)
# print("\nTURNO DO ASSISTENTE (pré-preenchido):")
# print(PREFILL)
# print("\n------------------------------------- Resposta do Claude (continuação) ------------------------------------")
# print(get_completion(PROMPT, prefill=PREFILL))
```

Abaixo está um exemplo de **múltiplas variáveis de entrada no mesmo prompt E especificação de formatação de saída, tudo feito usando tags XML**.

> **Nota:** Exemplo mais complexo combinando múltiplas variáveis, formatação de saída XML e pré-preenchimento.
```python
# Primeira variável de entrada
EMAIL = "Oi Zack, só estou te contatando para uma atualização rápida sobre aquele prompt que você deveria escrever."
# Original: "Hi Zack, just pinging you for a quick update on that prompt you were supposed to write."

# Segunda variável de entrada
ADJECTIVE = "inglês arcaico" # Original: "olde english"

# Modelo de prompt com placeholder para o conteúdo variável
PROMPT = f"Ei Claude. Aqui está um email: <email>{EMAIL}</email>. Torne este email mais em estilo {ADJECTIVE}. Escreva a nova versão nas tags XML <{ADJECTIVE}_email>."
# Original: f"Hey Claude. Here is an email: <email>{EMAIL}</email>. Make this email more {ADJECTIVE}. Write the new version in <{ADJECTIVE}_email> XML tags."


# Pré-preenchimento para a resposta de Claude (agora como uma f-string com uma variável)
PREFILL = f"<{ADJECTIVE}_email>" # Claude começará com esta tag

# Imprime a resposta do Claude
# print("--------------------------- Prompt completo com substituições de variáveis ---------------------------")
# print("TURNO DO USUÁRIO:")
# print(PROMPT)
# print("\nTURNO DO ASSISTENTE (pré-preenchido):")
# print(PREFILL)
# print("\n------------------------------------- Resposta do Claude (continuação) ------------------------------------")
# print(get_completion(PROMPT, prefill=PREFILL))
```

#### Lição Bônus

Se você está chamando Claude através da API, pode passar a tag XML de fechamento para o parâmetro `stop_sequences` para fazer Claude parar de amostrar assim que emitir a tag desejada. Isso pode economizar dinheiro e tempo até o último token, eliminando os comentários finais de Claude depois que ele já forneceu a resposta que lhe interessa.

Se você gostaria de experimentar os prompts da lição sem alterar nenhum conteúdo acima, role até o final do notebook da lição para visitar o [**Playground de Exemplos**](#playground-de-exemplos).

---

## <a name="exercicios"></a>Exercícios
- [Exercício 5.1 - Steph Curry GOAT](#exercicio-51---steph-curry-goat)
- [Exercício 5.2 - Dois Haicais](#exercicio-52---dois-haicais)
- [Exercício 5.3 - Dois Haicais, Dois Animais](#exercicio-53---dois-haicais-dois-animais)

### <a name="exercicio-51---steph-curry-goat"></a>Exercício 5.1 - Steph Curry GOAT
Forçado a fazer uma escolha, Claude designa Michael Jordan como o melhor jogador de basquete de todos os tempos. Podemos fazer Claude escolher outra pessoa?

Altere a variável `PREFILL` para **compelir Claude a apresentar um argumento detalhado de que o melhor jogador de basquete de todos os tempos é Stephen Curry**. Tente não mudar nada exceto `PREFILL`, pois esse é o foco deste exercício.

> **Nota do Exercício:** O objetivo é usar a técnica de "falar pelo Claude" (pré-preenchendo `PREFILL`) para direcionar a resposta de Claude a argumentar que Stephen Curry é o melhor jogador de basquete. A função de avaliação original (não incluída aqui) verificaria se a palavra "Warrior" (time de Curry) estava na resposta.
```python
# Modelo de prompt
PROMPT = "Quem é o melhor jogador de basquete de todos os tempos? Por favor, escolha um jogador específico."

# Pré-preenchimento para a resposta de Claude - MODIFIQUE AQUI
PREFILL = "Embora Michael Jordan seja frequentemente citado como o melhor, uma análise mais aprofundada do impacto revolucionário no jogo aponta para Stephen Curry. Sua habilidade de arremesso de três pontos não apenas quebrou recordes, mas também" # Exemplo de início

# Obtém a resposta de Claude
# response = get_completion(PROMPT, prefill=PREFILL)

# # Código original do exercício:
# # def grade_exercise(text):
# #     return bool(re.search("Warrior", text)) # Verifica se "Warrior" (time de Curry) está na resposta
# # print("--------------------------- Prompt completo com substituições de variáveis ---------------------------")
# # print("TURNO DO USUÁRIO:")
# # print(PROMPT)
# # print("\nTURNO DO ASSISTENTE (pré-preenchido):")
# # print(PREFILL)
# # print("\n------------------------------------- Resposta do Claude (continuação) ------------------------------------")
# # print(response)
# # print("\n------------------------------------------ AVALIAÇÃO ------------------------------------------")
# # print("Este exercício foi resolvido corretamente:", grade_exercise(response))

# Para testar em Markdown:
# print("TURNO DO USUÁRIO:")
# print(PROMPT)
# print("\nTURNO DO ASSISTENTE (pré-preenchido):")
# print(PREFILL)
# print("\nResposta do Claude:")
# print(get_completion(PROMPT, prefill=PREFILL))
```

❓ Se você quiser uma dica:
> **Dica (Exercício 5.1):** A dica original é: "Você pode começar o preenchimento com algo como `Enquanto Michael Jordan é uma escolha popular, Stephen Curry revolucionou o jogo...`"

### <a name="exercicio-52---dois-haicais"></a>Exercício 5.2 - Dois Haicais
Modifique o `PROMPT` abaixo usando tags XML para que Claude escreva dois haicais sobre o animal em vez de apenas um. Deve ficar claro onde um poema termina e o outro começa.

> **Nota do Exercício:** O objetivo é modificar o `PROMPT` para que Claude gere dois haicais distintos sobre o animal especificado ("gatos"), usando tags XML para separar os poemas (por exemplo, `<haiku1></haiku1>` e `<haiku2></haiku2>`, ou múltiplas tags `<haiku></haiku>`). A função de avaliação original (não incluída) verificaria a presença da palavra "cat" (gato), a tag `<haiku>` e se a resposta tinha mais de 5 linhas (indicando múltiplos versos/poemas).
```python
# Conteúdo variável
ANIMAL = "gatos" # Original: "cats"

# Modelo de prompt com um placeholder para o conteúdo variável - MODIFIQUE AQUI
PROMPT = f"Por favor, escreva dois haicais distintos sobre {ANIMAL}. Coloque o primeiro haicai em tags <haiku1> e o segundo haicai em tags <haiku2>."

# Pré-preenchimento para a resposta de Claude (opcional, mas pode guiar o primeiro)
PREFILL = "<haiku1>"

# Obtém a resposta de Claude
# response = get_completion(PROMPT, prefill=PREFILL)

# # Código original do exercício:
# # def grade_exercise(text):
# #     return bool(
# #         (re.search("cat", text.lower()) and re.search("<haiku>", text)) # "<haiku>" pode ser <haiku1> ou <haiku2>
# #         and (text.count("\n") + 1) > 5
# #     )
# # print("--------------------------- Prompt completo com substituições de variáveis ---------------------------")
# # print("TURNO DO USUÁRIO:")
# # print(PROMPT)
# # print("\nTURNO DO ASSISTENTE (pré-preenchido):")
# # print(PREFILL)
# # print("\n------------------------------------- Resposta do Claude (continuação) ------------------------------------")
# # print(response)
# # print("\n------------------------------------------ AVALIAÇÃO ------------------------------------------")
# # print("Este exercício foi resolvido corretamente:", grade_exercise(response))

# Para testar em Markdown:
# print("TURNO DO USUÁRIO:")
# print(PROMPT)
# print("\nTURNO DO ASSISTENTE (pré-preenchido):")
# print(PREFILL)
# print("\nResposta do Claude:")
# print(get_completion(PROMPT, prefill=PREFILL))
```

❓ Se você quiser uma dica:
> **Dica (Exercício 5.2):** A dica original é: "Você pode pedir a Claude para colocar cada haicai em suas próprias tags XML separadas, como `<haiku1>` e `<haiku2>`."

### <a name="exercicio-53---dois-haicais-dois-animais"></a>Exercício 5.3 - Dois Haicais, Dois Animais
Modifique o `PROMPT` abaixo para que **Claude produza dois haicais sobre dois animais diferentes**. Use `{ANIMAL1}` como substituto para a primeira substituição e `{ANIMAL2}` como substituto para a segunda substituição.

> **Nota do Exercício:** O objetivo é modificar o `PROMPT` para que ele aceite duas variáveis, `ANIMAL1` ("Gato") e `ANIMAL2` ("Cachorro"), e peça a Claude para gerar um haicai para cada animal, usando tags XML para distinguir os poemas e os animais (ex: `<haiku_Gato>` e `<haiku_Cachorro>`). A função de avaliação original (não incluída) verificaria a presença de "tail" (cauda), "cat" (gato) e a tag `<haiku>`, sugerindo que a resposta esperada para o gato mencionasse sua cauda.
```python
# Primeira variável de entrada
ANIMAL1 = "Gato" # Original: "Cat"

# Segunda variável de entrada
ANIMAL2 = "Cachorro" # Original: "Dog"

# Modelo de prompt com placeholder para o conteúdo variável - MODIFIQUE AQUI
PROMPT = f"Por favor, escreva um haicai sobre {ANIMAL1} e coloque-o em tags <haiku_{ANIMAL1}>. Em seguida, escreva um haicai sobre {ANIMAL2} e coloque-o em tags <haiku_{ANIMAL2}>."

# Obtém a resposta de Claude (sem PREFILL neste exercício, Claude deve gerar ambos)
# response = get_completion(PROMPT)

# # Código original do exercício (a lógica de "tail" e "cat" é específica para ANIMAL1="Cat"):
# # def grade_exercise(text):
# #     # Verifica se há um haicai sobre gato mencionando "tail" e um haicai sobre cachorro.
# #     haiku_cat_pattern = rf"<haiku_{ANIMAL1}>([\s\S]*?)</haiku_{ANIMAL1}>"
# #     haiku_dog_pattern = rf"<haiku_{ANIMAL2}>([\s\S]*?)</haiku_{ANIMAL2}>"
# #     cat_haiku_match = re.search(haiku_cat_pattern, text, re.IGNORECASE)
# #     dog_haiku_match = re.search(haiku_dog_pattern, text, re.IGNORECASE)
# #     cat_criteria_met = False
# #     if cat_haiku_match:
# #         cat_haiku_content = cat_haiku_match.group(1).lower()
# #         if "tail" in cat_haiku_content and "cat" in cat_haiku_content: # ou ANIMAL1.lower()
# #             cat_criteria_met = True
# #     return bool(cat_criteria_met and dog_haiku_match)
# # print("--------------------------- Prompt completo com substituições de variáveis ---------------------------")
# # print("TURNO DO USUÁRIO:")
# # print(PROMPT)
# # print("\n------------------------------------- Resposta do Claude ------------------------------------")
# # print(response)
# # print("\n------------------------------------------ AVALIAÇÃO ------------------------------------------")
# # print("Este exercício foi resolvido corretamente:", grade_exercise(response))

# Para testar em Markdown:
# print("TURNO DO USUÁRIO:")
# print(PROMPT)
# print("\nResposta do Claude:")
# print(get_completion(PROMPT))
```

❓ Se você quiser uma dica:
> **Dica (Exercício 5.3):** A dica original é: "Você pode usar uma estrutura de prompt como `f'Por favor, escreva um haicai sobre {ANIMAL1} em tags <haiku1> e um haicai sobre {ANIMAL2} em tags <haiku2>.'`" (Lembre-se de adaptar os nomes das tags se quiser usar os nomes dos animais nelas, como `<haiku_Gato>`).

### Parabéns!

Se você resolveu todos os exercícios até este ponto, está pronto para passar para o próximo capítulo. Bom trabalho com os prompts!

---

## <a name="playground-de-exemplos"></a>Playground de Exemplos

Esta é uma área para você experimentar livremente com os exemplos de prompt mostrados nesta lição e ajustar os prompts para ver como isso pode afetar as respostas do Claude. Lembre-se de que para executar os blocos de código Python, você precisará ter configurado sua chave de API (`API_KEY`), o nome do modelo (`MODEL_NAME`) e inicializado o `client` da Anthropic, conforme mostrado na seção de [Configuração](#configuracao).

> **Playground:** Peça a Claude para formatar um haicai usando tags `<haiku>`.
```python
# Conteúdo variável
ANIMAL = "Coelho" # Original: "Rabbit"

# Modelo de prompt com um placeholder para o conteúdo variável
PROMPT = f"Por favor, escreva um haicai sobre {ANIMAL}. Coloque-o em tags <haiku>."

# Imprime a resposta do Claude
# print("--------------------------- Prompt completo com substituições de variáveis ---------------------------")
# print(PROMPT)
# print("\n------------------------------------- Resposta do Claude ------------------------------------")
# print(get_completion(PROMPT))
```

> **Playground:** Use a técnica de "falar pelo Claude" (pré-preenchimento) para iniciar a resposta com `<haiku>`.
```python
# Conteúdo variável
ANIMAL = "Gato" # Original: "Cat"

# Modelo de prompt com um placeholder para o conteúdo variável
PROMPT = f"Por favor, escreva um haicai sobre {ANIMAL}. Coloque-o em tags <haiku>."

# Pré-preenchimento para a resposta de Claude
PREFILL = "<haiku>"

# Imprime a resposta do Claude
# print("--------------------------- Prompt completo com substituições de variáveis ---------------------------")
# print("TURNO DO USUÁRIO:")
# print(PROMPT)
# print("\nTURNO DO ASSISTENTE (pré-preenchido):")
# print(PREFILL)
# print("\n------------------------------------- Resposta do Claude (continuação) ------------------------------------")
# print(get_completion(PROMPT, prefill=PREFILL))
```

> **Playground:** Solicite e pré-preencha uma saída JSON para um haicai.
```python
# Conteúdo variável
ANIMAL = "Gato" # Original: "Cat"

# Modelo de prompt com um placeholder para o conteúdo variável
PROMPT = f"Por favor, escreva um haicai sobre {ANIMAL}. Use o formato JSON com as chaves \"primeira_linha\", \"segunda_linha\" e \"terceira_linha\"."

# Pré-preenchimento para a resposta de Claude
PREFILL = "{"

# Imprime a resposta do Claude
# print("--------------------------- Prompt completo com substituições de variáveis ---------------------------")
# print("TURNO DO USUÁRIO:")
# print(PROMPT)
# print("\nTURNO DO ASSISTENTE (pré-preenchido):")
# print(PREFILL)
# print("\n------------------------------------- Resposta do Claude (continuação) ------------------------------------")
# print(get_completion(PROMPT, prefill=PREFILL))
```

> **Playground:** Múltiplas variáveis, formatação de saída XML e pré-preenchimento.
```python
# Primeira variável de entrada
EMAIL = "Oi Zack, só estou te contatando para uma atualização rápida sobre aquele prompt que você deveria escrever."
# Original: "Hi Zack, just pinging you for a quick update on that prompt you were supposed to write."

# Segunda variável de entrada
ADJECTIVE = "inglês arcaico" # Original: "olde english"

# Modelo de prompt com placeholder para o conteúdo variável
PROMPT = f"Ei Claude. Aqui está um email: <email>{EMAIL}</email>. Torne este email mais em estilo {ADJECTIVE}. Escreva a nova versão nas tags XML <{ADJECTIVE}_email>."
# Original: f"Hey Claude. Here is an email: <email>{EMAIL}</email>. Make this email more {ADJECTIVE}. Write the new version in <{ADJECTIVE}_email> XML tags."

# Pré-preenchimento para a resposta de Claude (agora como uma f-string com uma variável)
PREFILL = f"<{ADJECTIVE}_email>"

# Imprime a resposta do Claude
# print("--------------------------- Prompt completo com substituições de variáveis ---------------------------")
# print("TURNO DO USUÁRIO:")
# print(PROMPT)
# print("\nTURNO DO ASSISTENTE (pré-preenchido):")
# print(PREFILL)
# print("\n------------------------------------- Resposta do Claude (continuação) ------------------------------------")
# print(get_completion(PROMPT, prefill=PREFILL))
```
