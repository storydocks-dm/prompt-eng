# Capítulo 05: Formatando a Saída e Controlando a "Voz" do Claude

Bem-vindo ao Capítulo 5! Além de apenas obter respostas textuais, muitas vezes você precisará que Claude forneça informações em um formato específico para facilitar o processamento por outros programas, para exibição consistente em uma interface de usuário, ou simplesmente para tornar a saída mais organizada. Neste capítulo, exploraremos técnicas para instruir Claude a formatar sua saída (por exemplo, em JSON ou usando tags XML específicas) e a poderosa técnica de "falar por Claude" (pré-preenchendo o início da resposta dele) para guiar o resultado com ainda mais precisão.

- [Lição](#licao)
- [Exercícios](#exercicios)
- [Playground de Exemplos](#playground-de-exemplos)

## <a name="configuracao"></a>Configuração

Antes de prosseguir, certifique-se de que você configurou sua `API_KEY` e `MODEL_NAME` conforme descrito no Capítulo 00. A função `get_completion` abaixo também depende da inicialização do objeto `client` da biblioteca Anthropic.

> **Nota sobre `pip install anthropic`:** Se ainda não o fez, instale a biblioteca Python da Anthropic: `pip install anthropic` em seu terminal (preferencialmente em um ambiente virtual).
> **Importante:** Nesta lição, a função `get_completion` é modificada para incluir um parâmetro `prefill`. Este parâmetro é usado para fornecer o início da resposta do `assistant` (assistente), uma técnica chamada "speaking for Claude" (falar pelo Claude) ou "prefilling Claude's response" (pré-preencher a resposta do Claude). **Mesmo um `prefill` vazio é enviado como um início de turno de assistente**, o que pode influenciar Claude a seguir uma estrutura ou formato implícito.

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
# Esta linha deve ser executada para que 'client' seja reconhecido.

# Novo argumento adicionado para texto de pré-preenchimento (prefill).
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
        # A resposta de Claude será o texto que ele adiciona após o 'prefill' (se houver)
        return response_message.content[0].text
    except Exception as e:
        print(f"Erro ao chamar a API da Anthropic: {e}")
        return f"Erro na API: {e}"
```
*(Os exemplos de código subsequentes assumirão que `client` e `MODEL_NAME` foram devidamente configurados e que `get_completion` está definida como acima).*

---

## <a name="licao"></a>Lição

**Claude pode formatar sua saída de diversas maneiras**. Você só precisa pedir para ele fazer isso! Uma das formas mais eficazes de garantir o formato desejado é:
1.  Instruir explicitamente o formato desejado (ex: "Responda em formato JSON", "Use tags XML <poema></poema>").
2.  Fornecer exemplos do formato na sua solicitação (técnica de "few-shot prompting", que veremos em detalhes no Capítulo 07).
3.  Iniciar a resposta de Claude com o começo do formato desejado (técnica de "prefilling" ou "falar por Claude").

Você já aprendeu que pode usar tags XML para tornar seu prompt mais claro e analisável para Claude (Capítulo 04). Acontece que você também pode pedir a Claude para **usar tags XML para tornar sua saída mais clara e facilmente compreensível** para humanos e, crucialmente, para análise programática por outros sistemas. Isso é útil para extrair informações específicas da resposta de forma confiável.

### Exemplos

Lembre-se do 'problema do preâmbulo do poema' que resolvemos no Capítulo 2, pedindo a Claude para pular o preâmbulo inteiramente? Acontece que também podemos alcançar um resultado semelhante **dizendo a Claude para colocar o poema em tags XML**.

> **Nota:** Este exemplo pede a Claude para formatar a saída de um haicai usando tags `<haiku>`. (Lembre-se de ter `API_KEY` e `MODEL_NAME` configurados e `client` inicializado para executar.)
```python
# Conteúdo variável
ANIMAL_EX1 = "Coelho" # Original: "Rabbit"

# Modelo de prompt com um placeholder para o conteúdo variável
PROMPT_EX1 = f"Por favor, escreva um haicai sobre {ANIMAL_EX1}. Coloque-o em tags <haiku>."

# Imprime a resposta do Claude
# print("--------------------------- Prompt completo (Exemplo 1) ---------------------------")
# print(PROMPT_EX1)
# print("\n------------------------------------- Resposta do Claude ------------------------------------")
# print(get_completion(PROMPT_EX1))
```

Por que isso é algo que gostaríamos de fazer? Bem, ter a saída em **tags XML permite ao usuário final (ou a um programa) obter de forma confiável o poema e apenas o poema, escrevendo um pequeno script para extrair o conteúdo entre as tags XML**. Isso é muito útil para processamento automatizado de respostas.

Uma extensão dessa técnica é **colocar a primeira tag XML (ou o início de qualquer estrutura desejada) no turno do `assistant`. Quando você coloca texto no turno do `assistant` (via o parâmetro `prefill` na nossa função `get_completion`), está basicamente dizendo a Claude que ele já "disse" aquilo, e que deve continuar a partir daquele ponto. Essa técnica é chamada de "speaking for Claude" (falar pelo Claude) ou "prefilling Claude's response" (pré-preencher a resposta de Claude).**

Abaixo, fizemos isso com a primeira tag XML `<haiku>`. Observe como Claude continua diretamente de onde paramos, preenchendo o conteúdo do haicai e, idealmente, fechando a tag.

> **Nota:** Demonstração da técnica de "falar pelo Claude", pré-preenchendo o início da resposta do assistente com a tag `<haiku>`.
```python
# Conteúdo variável
ANIMAL_EX2 = "Gato" # Original: "Cat"

# Modelo de prompt com um placeholder para o conteúdo variável
PROMPT_EX2 = f"Por favor, escreva um haicai sobre {ANIMAL_EX2}. Coloque-o em tags <haiku>."

# Pré-preenchimento para a resposta de Claude
PREFILL_EX2 = "<haiku>" # Claude continuará a partir daqui

# Imprime a resposta do Claude
# print("--------------------------- Prompt completo (Exemplo 2) ---------------------------")
# print("TURNO DO USUÁRIO:")
# print(PROMPT_EX2)
# print("\nTURNO DO ASSISTENTE (pré-preenchido):")
# print(PREFILL_EX2)
# print("\n------------------------------------- Resposta do Claude (continuação) ------------------------------------")
# # A função get_completion anexa o prefill ao turno do assistente
# print(PREFILL_EX2 + get_completion(PROMPT_EX2, prefill=PREFILL_EX2))
```
*(Nota: A resposta real de `get_completion` já incluirá o texto gerado *após* o `prefill`. Para ver a resposta completa como Claude a "vê", você concatenaria o `prefill` com a saída da função, como mostrado no print acima).*

Claude também se destaca no uso de outros estilos de formatação de saída, notadamente `JSON`. Se você deseja impor a saída JSON (não deterministicamente, mas com alta probabilidade), pode instruir Claude a usar JSON e também pré-preencher a resposta de Claude com o colchete de abertura, `{`.

> **Nota:** Este exemplo mostra como solicitar e pré-preencher uma saída JSON para um haicai.
```python
# Conteúdo variável
ANIMAL_EX3 = "Gato" # Original: "Cat"

# Modelo de prompt com um placeholder para o conteúdo variável
PROMPT_EX3 = f"Por favor, escreva um haicai sobre {ANIMAL_EX3}. Use o formato JSON com as chaves \"primeira_linha\", \"segunda_linha\" e \"terceira_linha\"."

# Pré-preenchimento para a resposta de Claude
PREFILL_EX3 = "{" # Inicia a resposta JSON

# Imprime a resposta do Claude
# print("--------------------------- Prompt completo (Exemplo 3) ---------------------------")
# print("TURNO DO USUÁRIO:")
# print(PROMPT_EX3)
# print("\nTURNO DO ASSISTENTE (pré-preenchido):")
# print(PREFILL_EX3)
# print("\n------------------------------------- Resposta do Claude (continuação) ------------------------------------")
# print(PREFILL_EX3 + get_completion(PROMPT_EX3, prefill=PREFILL_EX3))
```

Abaixo está um exemplo de **múltiplas variáveis de entrada no mesmo prompt E especificação de formatação de saída, tudo feito usando tags XML** e pré-preenchimento.

> **Nota:** Exemplo mais complexo combinando múltiplas variáveis, solicitação de formatação de saída XML e pré-preenchimento para guiar o início da resposta.
```python
# Primeira variável de entrada
EMAIL_TEXTO = "Oi Zack, só estou te contatando para uma atualização rápida sobre aquele prompt que você deveria escrever."
# Original: "Hi Zack, just pinging you for a quick update on that prompt you were supposed to write."

# Segunda variável de entrada
ESTILO_ADJETIVO = "inglês arcaico" # Original: "olde english"

# Modelo de prompt com placeholder para o conteúdo variável
PROMPT_EX4 = f"Ei Claude. Aqui está um email: <email_original>{EMAIL_TEXTO}</email_original>. Torne este email mais no estilo {ESTILO_ADJETIVO}. Escreva a nova versão nas tags XML <email_{ESTILO_ADJETIVO.replace(' ', '_')}></email_{ESTILO_ADJETIVO.replace(' ', '_')}>."
# Original: f"Hey Claude. Here is an email: <email>{EMAIL_TEXTO}</email>. Make this email more {ESTILO_ADJETIVO}. Write the new version in <{ESTILO_ADJETIVO}_email> XML tags."

# Pré-preenchimento para a resposta de Claude (agora como uma f-string com uma variável)
PREFILL_EX4 = f"<email_{ESTILO_ADJETIVO.replace(' ', '_')}>" # Claude começará com esta tag

# Imprime a resposta do Claude
# print("--------------------------- Prompt completo (Exemplo 4) ---------------------------")
# print("TURNO DO USUÁRIO:")
# print(PROMPT_EX4)
# print("\nTURNO DO ASSISTENTE (pré-preenchido):")
# print(PREFILL_EX4)
# print("\n------------------------------------- Resposta do Claude (continuação) ------------------------------------")
# print(PREFILL_EX4 + get_completion(PROMPT_EX4, prefill=PREFILL_EX4))
```

#### Lição Bônus

Se você está chamando Claude através da API, pode passar a tag XML de fechamento (ou qualquer string que sinalize o fim da parte desejada) para o parâmetro `stop_sequences` da API. Isso instrui Claude a parar de gerar texto assim que ele emitir essa sequência. Isso pode economizar custos (menos tokens gerados) e tempo de resposta, eliminando comentários finais ou texto supérfluo de Claude depois que ele já forneceu a informação principal que você solicitou.

Se você gostaria de experimentar os prompts da lição sem alterar nenhum conteúdo acima, role até o final do notebook da lição para visitar o [**Playground de Exemplos**](#playground-de-exemplos).

---

## <a name="exercicios"></a>Exercícios
- [Exercício 5.1 - Steph Curry GOAT](#exercicio-51---steph-curry-goat)
- [Exercício 5.2 - Dois Haicais](#exercicio-52---dois-haicais)
- [Exercício 5.3 - Dois Haicais, Dois Animais](#exercicio-53---dois-haicais-dois-animais)

### <a name="exercicio-51---steph-curry-goat"></a>Exercício 5.1 - Steph Curry GOAT
Em capítulos anteriores, vimos que Claude, quando forçado a escolher o melhor jogador de basquete de todos os tempos, tende a nomear Michael Jordan. Podemos fazer Claude escolher outra pessoa e argumentar a favor dela?

Altere a variável `PREFILL_EX5_1` para **compelir Claude a apresentar um argumento detalhado de que o melhor jogador de basquete de todos os tempos é Stephen Curry**. Tente não mudar nada no `PROMPT_EX5_1`, pois o foco deste exercício é a técnica de pré-preenchimento.

> **Nota do Exercício:** O objetivo é usar a técnica de "falar pelo Claude" (pré-preenchendo `PREFILL_EX5_1`) para direcionar a resposta de Claude a argumentar que Stephen Curry é o melhor jogador de basquete. A função de avaliação original (não incluída aqui) verificaria se a palavra "Warrior" (time de Curry) ou "Stephen Curry" estava na resposta.
```python
# Modelo de prompt
PROMPT_EX5_1 = "Quem é o melhor jogador de basquete de todos os tempos? Por favor, escolha um jogador específico e justifique sua escolha detalhadamente."

# Pré-preenchimento para a resposta de Claude - MODIFIQUE AQUI
PREFILL_EX5_1 = "Embora Michael Jordan seja uma escolha lendária, o título de melhor de todos os tempos pertence, na verdade, a Stephen Curry. Sua influência revolucionária no jogo é inegável, principalmente por causa de" # Exemplo de início para guiar Claude

# Obtém a resposta de Claude
# response_ex5_1 = get_completion(PROMPT_EX5_1, prefill=PREFILL_EX5_1)

# # Código original do exercício:
# # def grade_exercise_5_1(text):
# #     return bool(re.search("Warrior", text, re.IGNORECASE) or re.search("Stephen Curry", text, re.IGNORECASE))
# # print("TURNO DO USUÁRIO:")
# # print(PROMPT_EX5_1)
# # print("\nTURNO DO ASSISTENTE (pré-preenchido):")
# # print(PREFILL_EX5_1)
# # print("\n------------------------------------- Resposta do Claude (continuação) ------------------------------------")
# # print(PREFILL_EX5_1 + response_ex5_1) # Mostra o prefill + o que Claude gerou
# # print("\n------------------------------------------ AVALIAÇÃO ------------------------------------------")
# # print("Este exercício foi resolvido corretamente:", grade_exercise_5_1(PREFILL_EX5_1 + response_ex5_1))

# Para testar em Markdown:
# print("TURNO DO USUÁRIO:")
# print(PROMPT_EX5_1)
# print("\nTURNO DO ASSISTENTE (pré-preenchido):")
# print(PREFILL_EX5_1)
# print("\nResposta do Claude (gerada após o preenchimento):")
# print(PREFILL_EX5_1 + get_completion(PROMPT_EX5_1, prefill=PREFILL_EX5_1))
```

❓ Se você quiser uma dica:
> **Dica (Exercício 5.1):** A dica original é: "Você pode começar o preenchimento com algo como `Enquanto Michael Jordan é uma escolha popular, Stephen Curry revolucionou o jogo...`" Tente elaborar sobre o impacto de Curry.

### <a name="exercicio-52---dois-haicais"></a>Exercício 5.2 - Dois Haicais
Modifique o `PROMPT_EX5_2` abaixo usando tags XML para que Claude escreva dois haicais sobre o animal especificado, em vez de apenas um. Deve ficar claro onde um poema termina e o outro começa, usando tags distintas para cada haicai.

> **Nota do Exercício:** O objetivo é modificar o `PROMPT_EX5_2` para que Claude gere dois haicais distintos sobre "gatos", usando tags XML diferentes para cada um (por exemplo, `<haiku_1></haiku_1>` e `<haiku_2></haiku_2>`). O pré-preenchimento (`PREFILL_EX5_2`) pode ser usado para iniciar o primeiro haicai. A função de avaliação original (não incluída) verificaria a presença da palavra "gato" (cat), a presença de tags `<haiku` e se a resposta tinha mais de 5 linhas (indicando múltiplos versos/poemas).
```python
# Conteúdo variável
ANIMAL_EX5_2 = "gatos" # Original: "cats"

# Modelo de prompt com um placeholder para o conteúdo variável - MODIFIQUE AQUI
PROMPT_EX5_2 = f"Por favor, escreva dois haicais distintos sobre {ANIMAL_EX5_2}. Coloque o primeiro haicai em tags <haiku_um> e o segundo haicai em tags <haiku_dois>."

# Pré-preenchimento para a resposta de Claude (para o primeiro haicai)
PREFILL_EX5_2 = "<haiku_um>"

# Obtém a resposta de Claude
# response_ex5_2 = get_completion(PROMPT_EX5_2, prefill=PREFILL_EX5_2)

# # Código original do exercício:
# # def grade_exercise_5_2(text): # A 'text' aqui seria PREFILL_EX5_2 + response_ex5_2
# #     return bool(
# #         (re.search("gato", text.lower()) or re.search("cat", text.lower())) and # Verificando o animal
# #         (re.search("<haiku_um>", text) and re.search("</haiku_um>", text)) and
# #         (re.search("<haiku_dois>", text) and re.search("</haiku_dois>", text)) and
# #         (text.count("\n") + 1) > 5 # Verifica se tem linhas suficientes para dois haicais
# #     )
# # print("TURNO DO USUÁRIO:")
# # print(PROMPT_EX5_2)
# # print("\nTURNO DO ASSISTENTE (pré-preenchido):")
# # print(PREFILL_EX5_2)
# # print("\n------------------------------------- Resposta do Claude (continuação) ------------------------------------")
# # print(PREFILL_EX5_2 + response_ex5_2)
# # print("\n------------------------------------------ AVALIAÇÃO ------------------------------------------")
# # print("Este exercício foi resolvido corretamente:", grade_exercise_5_2(PREFILL_EX5_2 + response_ex5_2))

# Para testar em Markdown:
# print("TURNO DO USUÁRIO:")
# print(PROMPT_EX5_2)
# print("\nTURNO DO ASSISTENTE (pré-preenchido):")
# print(PREFILL_EX5_2)
# print("\nResposta do Claude (gerada após o preenchimento):")
# print(PREFILL_EX5_2 + get_completion(PROMPT_EX5_2, prefill=PREFILL_EX5_2))
```

❓ Se você quiser uma dica:
> **Dica (Exercício 5.2):** A dica original é: "Você pode pedir a Claude para colocar cada haicai em suas próprias tags XML separadas, como `<haiku1>` e `<haiku2>`." (Ou `<haiku_um>` e `<haiku_dois>` como no exemplo).

### <a name="exercicio-53---dois-haicais-dois-animais"></a>Exercício 5.3 - Dois Haicais, Dois Animais
Modifique o `PROMPT_EX5_3` abaixo para que **Claude produza dois haicais sobre dois animais diferentes**. Use `{ANIMAL1_EX5_3}` como substituto para o primeiro animal e `{ANIMAL2_EX5_3}` para o segundo. Certifique-se de que a saída use tags XML distintas para cada haicai, como `<haiku_ANIMAL1></haiku_ANIMAL1>` e `<haiku_ANIMAL2></haiku_ANIMAL2>`.

> **Nota do Exercício:** O objetivo é modificar o `PROMPT_EX5_3` para que ele aceite duas variáveis, `ANIMAL1_EX5_3` ("Gato") e `ANIMAL2_EX5_3` ("Cachorro"), e peça a Claude para gerar um haicai para cada animal, usando tags XML dinâmicas que incluam o nome do animal (ex: `<haiku_Gato>` e `<haiku_Cachorro>`). Não é necessário usar pré-preenchimento aqui; Claude deve gerar ambos os haicais a partir da instrução do usuário. A função de avaliação original (não incluída) era um pouco específica, verificando a presença de "tail" (cauda) e "cat" (gato) no primeiro haicai e a estrutura geral.
```python
# Primeira variável de entrada
ANIMAL1_EX5_3 = "Gato" # Original: "Cat"

# Segunda variável de entrada
ANIMAL2_EX5_3 = "Cachorro" # Original: "Dog"

# Modelo de prompt com placeholder para o conteúdo variável - MODIFIQUE AQUI
PROMPT_EX5_3 = f"Por favor, escreva um haicai sobre {ANIMAL1_EX5_3}. Coloque-o em tags <haiku_{ANIMAL1_EX5_3}>. Depois, por favor, escreva um haicai sobre {ANIMAL2_EX5_3}. Coloque este segundo haicai em tags <haiku_{ANIMAL2_EX5_3}>."

# Obtém a resposta de Claude (sem PREFILL neste exercício)
# response_ex5_3 = get_completion(PROMPT_EX5_3)

# # Código original do exercício (a lógica de "tail" e "cat" é específica para ANIMAL1="Cat"):
# # def grade_exercise_5_3(text, animal1, animal2):
# #     # Verifica se há um haicai sobre o animal1 (gato) mencionando "cauda" (tail) e "gato" (cat)
# #     # E se há um haicai para o animal2 (cachorro)
# #     haiku_animal1_pattern = rf"<haiku_{animal1}>([\s\S]*?)</haiku_{animal1}>"
# #     haiku_animal2_pattern = rf"<haiku_{animal2}>([\s\S]*?)</haiku_{animal2}>"
# #     animal1_haiku_match = re.search(haiku_animal1_pattern, text, re.IGNORECASE)
# #     animal2_haiku_match = re.search(haiku_animal2_pattern, text, re.IGNORECASE)
# #     animal1_criteria_met = False
# #     if animal1_haiku_match:
# #         animal1_haiku_content = animal1_haiku_match.group(1).lower()
# #         if "cauda" in animal1_haiku_content and animal1.lower() in animal1_haiku_content:
# #             animal1_criteria_met = True
# #     return bool(animal1_criteria_met and animal2_haiku_match)
# # print("TURNO DO USUÁRIO:")
# # print(PROMPT_EX5_3)
# # print("\n------------------------------------- Resposta do Claude ------------------------------------")
# # print(response_ex5_3)
# # print("\n------------------------------------------ AVALIAÇÃO ------------------------------------------")
# # print("Este exercício foi resolvido corretamente:", grade_exercise_5_3(response_ex5_3, ANIMAL1_EX5_3, ANIMAL2_EX5_3))

# Para testar em Markdown:
# print("TURNO DO USUÁRIO:")
# print(PROMPT_EX5_3)
# print("\nResposta do Claude:")
# print(get_completion(PROMPT_EX5_3))
```

❓ Se você quiser uma dica:
> **Dica (Exercício 5.3):** A dica original é: "Você pode usar uma estrutura de prompt como `f'Por favor, escreva um haicai sobre {ANIMAL1} em tags <haiku1> e um haicai sobre {ANIMAL2} em tags <haiku2>.'`" (Lembre-se de adaptar os nomes das tags se quiser usar os nomes dos animais nelas, como `<haiku_Gato>` e `<haiku_Cachorro>`, conforme o exemplo de solução).

### Parabéns!

Se você resolveu todos os exercícios até este ponto, está pronto para passar para o próximo capítulo. Bom trabalho com os prompts!

---

## <a name="playground-de-exemplos"></a>Playground de Exemplos

Esta é uma área para você experimentar livremente com os exemplos de prompt mostrados nesta lição e ajustar os prompts para ver como isso pode afetar as respostas do Claude. Lembre-se de que para executar os blocos de código Python, você precisará ter configurado sua `API_KEY`, o nome do modelo (`MODEL_NAME`) e inicializado o `client` da Anthropic, conforme mostrado na seção de [Configuração](#configuracao).

> **Playground:** Peça a Claude para formatar um haicai usando tags `<haiku>`.
```python
# Conteúdo variável
# ANIMAL_PG1 = "Coelho"

# Modelo de prompt com um placeholder para o conteúdo variável
# PROMPT_PG1 = f"Por favor, escreva um haicai sobre {ANIMAL_PG1}. Coloque-o em tags <haiku>."

# Imprime a resposta do Claude
# print(get_completion(PROMPT_PG1))
```

> **Playground:** Use a técnica de "falar pelo Claude" (pré-preenchimento) para iniciar a resposta com `<haiku>`.
```python
# Conteúdo variável
# ANIMAL_PG2 = "Gato"

# Modelo de prompt com um placeholder para o conteúdo variável
# PROMPT_PG2 = f"Por favor, escreva um haicai sobre {ANIMAL_PG2}. Coloque-o em tags <haiku>."

# Pré-preenchimento para a resposta de Claude
# PREFILL_PG2 = "<haiku>"

# Imprime a resposta do Claude (lembre-se de concatenar o prefill para ver a "resposta completa" que Claude construiria)
# resposta_gerada_pg2 = get_completion(PROMPT_PG2, prefill=PREFILL_PG2)
# print(PREFILL_PG2 + resposta_gerada_pg2)
```

> **Playground:** Solicite e pré-preencha uma saída JSON para um haicai.
```python
# Conteúdo variável
# ANIMAL_PG3 = "Cachorro" # Mudado para variar

# Modelo de prompt com um placeholder para o conteúdo variável
# PROMPT_PG3 = f"Por favor, escreva um haicai sobre {ANIMAL_PG3}. Use o formato JSON com as chaves \"linha1\", \"linha2\" e \"linha3\"." # Chaves alteradas para variar

# Pré-preenchimento para a resposta de Claude
# PREFILL_PG3 = "{\n  \"linha1\": \"" # Exemplo de preenchimento mais específico

# Imprime a resposta do Claude
# resposta_gerada_pg3 = get_completion(PROMPT_PG3, prefill=PREFILL_PG3)
# print(PREFILL_PG3 + resposta_gerada_pg3)
```

> **Playground:** Múltiplas variáveis, formatação de saída XML e pré-preenchimento.
```python
# Primeira variável de entrada
# EMAIL_TEXTO_PG = "Lembrete: Reunião de equipe às 15h na sala de conferências. Traga suas atualizações."

# Segunda variável de entrada
# ESTILO_ADJETIVO_PG = "extremamente formal e profissional"

# Modelo de prompt com placeholder para o conteúdo variável
# PROMPT_PG4 = f"Ei Claude. Aqui está um lembrete de email: <email_original>{EMAIL_TEXTO_PG}</email_original>. Reformule este email para ter um tom {ESTILO_ADJETIVO_PG}. Escreva a nova versão nas tags XML <email_{ESTILO_ADJETIVO_PG.replace(' ', '_').replace('ê', 'e')}></email_{ESTILO_ADJETIVO_PG.replace(' ', '_').replace('ê', 'e')}>." # Simplificando nome da tag

# Pré-preenchimento para a resposta de Claude
# PREFILL_PG4 = f"<email_{ESTILO_ADJETIVO_PG.replace(' ', '_').replace('ê', 'e')}>"

# Imprime a resposta do Claude
# resposta_gerada_pg4 = get_completion(PROMPT_PG4, prefill=PREFILL_PG4)
# print(PREFILL_PG4 + resposta_gerada_pg4)
```
---
Controlar o formato da saída de Claude e saber como "falar por ele" usando o pré-preenchimento (prefill) são habilidades cruciais para criar aplicações robustas e previsíveis. Ao solicitar formatos como XML ou JSON, ou ao iniciar a resposta de Claude, você pode guiar o modelo para produzir resultados que se integram facilmente com seus sistemas ou que seguem um padrão consistente. Lembre-se que a clareza nas suas instruções de formatação é tão importante quanto o próprio conteúdo do prompt.

No próximo capítulo, vamos nos aprofundar em como fazer Claude "pensar antes de falar", usando técnicas para encorajar o raciocínio passo a passo.
