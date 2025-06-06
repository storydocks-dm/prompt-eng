# Capítulo 04: Separando Dados e Instruções

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

Muitas vezes, não queremos escrever prompts completos, mas sim **modelos de prompt (templates) que podem ser modificados posteriormente com dados de entrada adicionais antes de enviar ao Claude**. Isso pode ser útil se você quiser que o Claude faça a mesma coisa sempre, mas os dados que o Claude usa para sua tarefa podem ser diferentes a cada vez. A separação clara entre o que são as instruções e o que são os dados a serem processados é fundamental para obter resultados consistentes e previsíveis.

Felizmente, podemos fazer isso facilmente **separando o esqueleto fixo do prompt da entrada variável do usuário e, em seguida, substituindo a entrada do usuário no prompt** antes de enviar o prompt completo ao Claude. Essa prática aumenta a clareza e reduz a ambiguidade, ajudando o modelo a entender exatamente qual parte é instrução e qual parte é dado a ser processado.

Abaixo, veremos passo a passo como escrever um modelo de prompt substituível, bem como como substituir a entrada do usuário.

### Exemplos

Neste primeiro exemplo, estamos pedindo ao Claude para agir como um gerador de sons de animais. Observe que o prompt completo enviado ao Claude é apenas o `PROMPT_TEMPLATE` substituído pela entrada (neste caso, "Vaca"). A palavra "Vaca" substitui o marcador de lugar `ANIMAL` por meio de uma f-string quando imprimimos o prompt completo.

**Nota:** Você não precisa chamar sua variável de placeholder de algo específico na prática. Nós a chamamos de `ANIMAL` neste exemplo, mas poderíamos facilmente tê-la chamado de `CRIATURA` ou `A` (embora geralmente seja bom que os nomes de suas variáveis sejam específicos e relevantes para que seu modelo de prompt seja fácil de entender mesmo sem a substituição, apenas para facilitar a leitura pelo usuário). Apenas certifique-se de que qualquer nome que você der à sua variável seja o que você usa para a f-string do modelo de prompt.

> **Nota:** Este código demonstra um template de prompt simples usando f-string para inserir o nome de um animal. (Lembre-se de ter `API_KEY` e `MODEL_NAME` configurados e `client` inicializado para executar.)
```python
# Conteúdo variável
ANIMAL = "Vaca" # Original: "Cow"

# Modelo de prompt com um placeholder para o conteúdo variável
PROMPT = f"Vou te dizer o nome de um animal. Por favor, responda com o som que esse animal faz. {ANIMAL}"

# Imprime a resposta do Claude
# print("--------------------------- Prompt completo com substituições de variáveis ---------------------------")
# print(PROMPT)
# print("\n------------------------------------- Resposta do Claude ------------------------------------")
# print(get_completion(PROMPT))
```

Por que quereríamos separar e substituir entradas assim? Bem, **modelos de prompt simplificam tarefas repetitivas**. Digamos que você construa uma estrutura de prompt que convide usuários terceiros a enviar conteúdo para o prompt (neste caso, o animal cujo som eles querem gerar). Esses usuários terceiros não precisam escrever ou mesmo ver o prompt completo. Tudo o que eles precisam fazer é preencher variáveis.

Fazemos essa substituição aqui usando variáveis e f-strings, mas você também pode fazer isso com o método `format()`.

**Nota:** Modelos de prompt podem ter quantas variáveis forem desejadas!

Ao introduzir variáveis de substituição como esta, é muito importante **garantir que Claude saiba onde as variáveis (dados) começam e terminam**, em oposição às instruções ou descrições de tarefas. Vejamos um exemplo onde não há separação clara entre as instruções e os dados da variável. Delimitar claramente os dados das instruções é crucial para evitar que o modelo interprete mal o que deve processar versus o que deve fazer.

Para nossos olhos humanos, é muito claro onde a variável começa e termina no modelo de prompt abaixo. No entanto, no prompt totalmente substituído, essa delimitação se torna incerta.

> **Nota:** Este exemplo mostra como a falta de delimitadores claros pode confundir Claude, fazendo-o tratar parte da instrução como dado.
```python
# Conteúdo variável
EMAIL = "Apareça às 6 da manhã de amanhã porque sou o CEO e digo isso."
# Original: "Show up at 6am tomorrow because I'm the CEO and I say so."

# Modelo de prompt com um placeholder para o conteúdo variável
PROMPT = f"Ei Claude. {EMAIL} <----- Torne este email mais educado, mas não mude mais nada nele."
# Original: f"Yo Claude. {EMAIL} <----- Make this email more polite but don't change anything else about it."

# Imprime a resposta do Claude
# print("--------------------------- Prompt completo com substituições de variáveis ---------------------------")
# print(PROMPT)
# print("\n------------------------------------- Resposta do Claude ------------------------------------")
# print(get_completion(PROMPT))
```

Aqui, **Claude pensa que "Ei Claude" é parte do email que deve reescrever**! Você pode perceber porque ele começa sua reescrita com "Prezado Claude". Para o olho humano, é claro, particularmente no modelo de prompt, onde o email começa e termina, mas se torna muito menos claro no prompt após a substituição.

Como resolvemos isso? **Envolvendo a entrada em tags XML**! Fizemos isso abaixo e, como você pode ver, não há mais "Prezado Claude" na saída. O uso de tags como `<email>` e `</email>` cria uma fronteira clara para o modelo, indicando exatamente qual texto constitui o e-mail a ser processado.

[Tags XML](https://docs.anthropic.com/claude/docs/use-xml-tags) são tags entre colchetes angulares como `<tag></tag>`. Elas vêm em pares e consistem em uma tag de abertura, como `<tag>`, e uma tag de fechamento marcada por uma `/`, como `</tag>`. Tags XML são usadas para envolver conteúdo, assim: `<tag>conteúdo</tag>`. Outros formatos de delimitação, como JSON (`{"data_a_ser_processada": "seu texto aqui"}`) ou blocos de código Markdown (por exemplo, usando ```seu texto aqui``` para delimitar dados), também podem ser eficazes. A escolha do delimitador pode depender da natureza dos dados e da complexidade do prompt.

**Nota:** Embora Claude possa reconhecer e trabalhar com uma ampla gama de separadores e delimitadores, recomendamos que você **use especificamente tags XML como separadores** para Claude, pois Claude foi treinado especificamente para reconhecer tags XML como um mecanismo de organização de prompt. Fora da chamada de função, **não há tags XML especiais nas quais Claude foi treinado que você deva usar para maximizar seu desempenho**. Fizemos Claude propositalmente muito maleável e personalizável desta forma.

> **Nota:** Este exemplo corrige o problema anterior usando tags XML `<email>` para delimitar claramente os dados do e-mail, separando-os das instruções.
```python
# Conteúdo variável
EMAIL = "Apareça às 6 da manhã de amanhã porque sou o CEO e digo isso."
# Original: "Show up at 6am tomorrow because I'm the CEO and I say so."

# Modelo de prompt com um placeholder para o conteúdo variável e tags XML
PROMPT = f"Ei Claude. <email>{EMAIL}</email> <----- Torne este email mais educado, mas não mude mais nada nele."
# Original: f"Yo Claude. <email>{EMAIL}</email> <----- Make this email more polite but don't change anything else about it."

# Imprime a resposta do Claude
# print("--------------------------- Prompt completo com substituições de variáveis ---------------------------")
# print(PROMPT)
# print("\n------------------------------------- Resposta do Claude ------------------------------------")
# print(get_completion(PROMPT))
```

Vejamos outro exemplo de como as tags XML podem nos ajudar.

No prompt a seguir, **Claude interpreta incorretamente qual parte do prompt é a instrução versus a entrada**. Ele considera incorretamente `- Cada uma é sobre um animal, como coelhos` como parte da lista de frases a ser analisada, devido à formatação similar (um hífen no início da linha), quando o usuário (aquele que preenche a variável `SENTENCES`) presumivelmente não queria isso.

> **Nota:** Outro exemplo de confusão sem delimitadores claros para uma lista de sentenças. Claude pode interpretar mal onde os dados realmente começam.
```python
# Conteúdo variável
SENTENCES = """- Eu gosto de como as vacas soam
- Esta frase é sobre aranhas
- Esta frase pode parecer ser sobre cães, mas na verdade é sobre porcos"""
# Original: """- I like how cows sound\n- This sentence is about spiders\n- This sentence may appear to be about dogs but it's actually about pigs"""

# Modelo de prompt com um placeholder para o conteúdo variável
PROMPT = f"""Abaixo está uma lista de frases. Diga-me o segundo item da lista.

- Cada uma é sobre um animal, como coelhos.
{SENTENCES}"""

# Imprime a resposta do Claude
# print("--------------------------- Prompt completo com substituições de variáveis ---------------------------")
# print(PROMPT)
# print("\n------------------------------------- Resposta do Claude ------------------------------------")
# print(get_completion(PROMPT))
```

Para corrigir isso, precisamos apenas **envolver as frases de entrada do usuário em tags XML**, como `<sentences></sentences>`. Isso mostra a Claude onde os dados de entrada começam e terminam, apesar do hífen enganoso antes de `- Cada uma é sobre um animal, como coelhos.` As tags XML fornecem uma delimitação explícita que remove a ambiguidade.

> **Nota:** O uso de `<sentences>` e `</sentences>` resolve a ambiguidade, mostrando claramente ao modelo qual é a lista de sentenças a ser processada.
```python
# Conteúdo variável
SENTENCES = """- Eu gosto de como as vacas soam
- Esta frase é sobre aranhas
- Esta frase pode parecer ser sobre cães, mas na verdade é sobre porcos"""
# Original: """- I like how cows sound\n- This sentence is about spiders\n- This sentence may appear to be about dogs but it's actually about pigs"""

# Modelo de prompt com um placeholder para o conteúdo variável e tags XML
PROMPT = f"""Abaixo está uma lista de frases. Diga-me o segundo item da lista.

- Cada uma é sobre um animal, como coelhos.
<sentences>
{SENTENCES}
</sentences>"""

# Imprime a resposta do Claude
# print("--------------------------- Prompt completo com substituições de variáveis ---------------------------")
# print(PROMPT)
# print("\n------------------------------------- Resposta do Claude ------------------------------------")
# print(get_completion(PROMPT))
```

**Nota:** Na versão incorreta do prompt "Cada uma é sobre um animal", tivemos que incluir o hífen para fazer Claude responder incorretamente da maneira que queríamos para este exemplo. Esta é uma lição importante sobre prompts: **pequenos detalhes importam**! Sempre vale a pena **revisar seus prompts em busca de erros de digitação e gramaticais**. Claude é sensível a padrões (em seus primeiros anos, antes do ajuste fino, era uma ferramenta bruta de previsão de texto), e é mais provável que cometa erros quando você comete erros, seja mais inteligente quando você soa inteligente, mais bobo quando você soa bobo, e assim por diante.

Se você gostaria de experimentar os prompts da lição sem alterar nenhum conteúdo acima, role até o final do notebook da lição para visitar o [**Playground de Exemplos**](#playground-de-exemplos).

---

## <a name="exercicios"></a>Exercícios
- [Exercício 4.1 - Tópico do Haicai](#exercicio-41---topico-do-haicai)
- [Exercício 4.2 - Pergunta sobre Cães com Erros de Digitação](#exercicio-42---pergunta-sobre-caes-com-erros-de-digitacao)
- [Exercício 4.3 - Pergunta sobre Cães Parte 2](#exercicio-43---pergunta-sobre-caes-parte-2)

### <a name="exercicio-41---topico-do-haicai"></a>Exercício 4.1 - Tópico do Haicai
Modifique o `PROMPT` para que seja um modelo que receba uma variável chamada `TOPIC` e produza um haicai sobre o tópico. Este exercício destina-se apenas a testar sua compreensão da estrutura de modelagem de variáveis com f-strings.

> **Nota do Exercício:** O objetivo é criar um template de prompt que use uma f-string para inserir um `TOPIC` (tópico) e peça a Claude para gerar um haicai sobre esse tópico. A função de avaliação original (não incluída aqui) verificaria se a resposta continha o tópico (ex: "porcos", se `TOPIC = "Porcos"`) e a palavra "haicai", ambos em letras minúsculas.
```python
# Conteúdo variável
TOPIC = "Porcos" # Original: "Pigs"

# Modelo de prompt com um placeholder para o conteúdo variável - COMPLETE AQUI
PROMPT = f"Escreva um haicai sobre o seguinte tópico: {TOPIC}"

# Obtém a resposta do Claude
# response = get_completion(PROMPT)

# # Código original do exercício (adaptado para o tópico "Porcos"):
# # def grade_exercise(text):
# #     return bool(re.search("porcos", text.lower()) and re.search("haicai", text.lower()))
# # print("--------------------------- Prompt completo com substituições de variáveis ---------------------------")
# # print(PROMPT)
# # print("\n------------------------------------- Resposta do Claude ------------------------------------")
# # print(response)
# # print("\n------------------------------------------ AVALIAÇÃO ------------------------------------------")
# # print("Este exercício foi resolvido corretamente:", grade_exercise(response))

# Para testar em Markdown:
# print("Prompt enviado ao Claude:")
# print(PROMPT)
# print("\nResposta do Claude:")
# print(get_completion(PROMPT))
```

❓ Se você quiser uma dica:
> **Dica (Exercício 4.1):** A dica original é: "Seu prompt pode ser tão simples quanto `f'Escreva um haicai sobre {TOPIC}.'`"

### <a name="exercicio-42---pergunta-sobre-caes-com-erros-de-digitacao"></a>Exercício 4.2 - Pergunta sobre Cães com Erros de Digitação
Corrija o `PROMPT` adicionando tags XML para que Claude produza a resposta certa.

Tente não mudar mais nada no prompt. A escrita bagunçada e cheia de erros é intencional, para que você possa see como Claude reage a tais erros.

> **Nota do Exercício:** O objetivo é usar tags XML (por exemplo, `<pergunta></pergunta>`) para delimitar a `QUESTION` (pergunta) confusa e com erros de digitação, para que Claude possa entendê-la e responder corretamente à pergunta "cães são marrons?" (espera-se uma resposta afirmativa ou que contenha "marrom"). A função de avaliação original (não incluída) verificaria se a palavra "brown" (marrom) estava na resposta.
```python
# Conteúdo variável
QUESTION = "cs sã mrrns?" # Simula "cães são marrons?" (Original: "ar cn brown?")

# Modelo de prompt com um placeholder para o conteúdo variável - ADICIONE TAGS XML AQUI
PROMPT = f"Oiee sou eu tenho uma p pergunts obre caes jkaerjv <pergunta>{QUESTION}</pergunta> jklmvca obgda me ajuda mt mt obgda rapid rapid resp curta curta obgda"
# Original: f"Hia its me i have a q about dogs jkaerjv {QUESTION} jklmvca tx it help me muhch much atx fst fst answer short short tx"

# Obtém a resposta do Claude
# response = get_completion(PROMPT)

# # Código original do exercício:
# # def grade_exercise(text):
# #     return bool(re.search("brown", text.lower())) # "brown" (marrom)
# # print("--------------------------- Prompt completo com substituições de variáveis ---------------------------")
# # print(PROMPT)
# # print("\n------------------------------------- Resposta do Claude ------------------------------------")
# # print(response)
# # print("\n------------------------------------------ AVALIAÇÃO ------------------------------------------")
# # print("Este exercício foi resolvido corretamente:", grade_exercise(response))

# Para testar em Markdown:
# print("Prompt enviado ao Claude:")
# print(PROMPT)
# print("\nResposta do Claude:")
# print(get_completion(PROMPT))
```

❓ Se você quiser uma dica:
> **Dica (Exercício 4.2):** A dica original é: "Envolva a variável `QUESTION` em tags XML como `<question></question>`."

### <a name="exercicio-43---pergunta-sobre-caes-parte-2"></a>Exercício 4.3 - Pergunta sobre Cães Parte 2
Corrija o `PROMPT` **SEM** adicionar tags XML. Em vez disso, remova apenas uma ou duas palavras do prompt.

Assim como nos exercícios anteriores, tente não mudar mais nada no prompt. Isso mostrará que tipo de linguagem Claude consegue analisar e entender.

> **Nota do Exercício:** Desta vez, o desafio é corrigir o prompt confuso do exercício anterior removendo uma ou duas palavras-chave que possam estar confundindo Claude (como o texto aleatório "jkaerjv" ou "jklmvca" adjacente à pergunta), em vez de usar tags XML. O objetivo ainda é fazer Claude entender a pergunta "cães são marrons?" e responder afirmativamente ou mencionando "marrom".
```python
# Conteúdo variável
QUESTION = "cs sã mrrns?" # Simula "cães são marrons?" (Original: "ar cn brown?")

# Modelo de prompt com um placeholder para o conteúdo variável - REMOVA PALAVRAS CONFUSAS AQUI
PROMPT = f"Oiee sou eu tenho uma p pergunts obre caes {QUESTION} obgda me ajuda mt mt obgda rapid rapid resp curta curta obgda"
# Original com palavras confusas: f"Hia its me i have a q about dogs jkaerjv {QUESTION} jklmvca tx it help me muhch much atx fst fst answer short short tx"
# Removido "jkaerjv" e "jklmvca" e alguns "tx" e "atx"


# Obtém a resposta do Claude
# response = get_completion(PROMPT)

# # Código original do exercício:
# # def grade_exercise(text):
# #     return bool(re.search("brown", text.lower()))
# # print("--------------------------- Prompt completo com substituições de variáveis ---------------------------")
# # print(PROMPT)
# # print("\n------------------------------------- Resposta do Claude ------------------------------------")
# # print(response)
# # print("\n------------------------------------------ AVALIAÇÃO ------------------------------------------")
# # print("Este exercício foi resolvido corretamente:", grade_exercise(response))

# Para testar em Markdown:
# print("Prompt enviado ao Claude:")
# print(PROMPT)
# print("\nResposta do Claude:")
# print(get_completion(PROMPT))
```

❓ Se você quiser uma dica:
> **Dica (Exercício 4.3):** A dica original é: "Tente remover o texto aleatório (jumbles) em ambos os lados da variável `QUESTION`."

### Parabéns!

Se você resolveu todos os exercícios até este ponto, está pronto para passar para o próximo capítulo. Bom trabalho com os prompts!

---

## <a name="playground-de-exemplos"></a>Playground de Exemplos

Esta é uma área para você experimentar livremente com os exemplos de prompt mostrados nesta lição e ajustar os prompts para ver como isso pode afetar as respostas do Claude. Lembre-se de que para executar os blocos de código Python, você precisará ter configurado sua chave de API (`API_KEY`), o nome do modelo (`MODEL_NAME`) e inicializado o `client` da Anthropic, conforme mostrado na seção de [Configuração](#configuracao).

> **Playground:** Template de prompt para sons de animais.
```python
# Conteúdo variável
ANIMAL = "Gato" # Original: "Cow"

# Modelo de prompt com um placeholder para o conteúdo variável
PROMPT = f"Vou te dizer o nome de um animal. Por favor, responda com o som que esse animal faz. {ANIMAL}"

# Imprime a resposta do Claude
# print("--------------------------- Prompt completo com substituições de variáveis ---------------------------")
# print(PROMPT)
# print("\n------------------------------------- Resposta do Claude ------------------------------------")
# print(get_completion(PROMPT))
```

> **Playground:** Exemplo de reescrita de e-mail sem delimitadores (pode confundir Claude).
```python
# Conteúdo variável
EMAIL = "Apareça às 6 da manhã de amanhã porque sou o CEO e digo isso."
# Original: "Show up at 6am tomorrow because I'm the CEO and I say so."

# Modelo de prompt com um placeholder para o conteúdo variável
PROMPT = f"Ei Claude. {EMAIL} <----- Torne este email mais educado, mas não mude mais nada nele."
# Original: f"Yo Claude. {EMAIL} <----- Make this email more polite but don't change anything else about it."

# Imprime a resposta do Claude
# print("--------------------------- Prompt completo com substituições de variáveis ---------------------------")
# print(PROMPT)
# print("\n------------------------------------- Resposta do Claude ------------------------------------")
# print(get_completion(PROMPT))
```

> **Playground:** Exemplo de reescrita de e-mail com tags XML `<email>` para clareza.
```python
# Conteúdo variável
EMAIL = "Apareça às 6 da manhã de amanhã porque sou o CEO e digo isso."
# Original: "Show up at 6am tomorrow because I'm the CEO and I say so."

# Modelo de prompt com um placeholder para o conteúdo variável e tags XML
PROMPT = f"Ei Claude. <email>{EMAIL}</email> <----- Torne este email mais educado, mas não mude mais nada nele."
# Original: f"Yo Claude. <email>{EMAIL}</email> <----- Make this email more polite but don't change anything else about it."

# Imprime a resposta do Claude
# print("--------------------------- Prompt completo com substituições de variáveis ---------------------------")
# print(PROMPT)
# print("\n------------------------------------- Resposta do Claude ------------------------------------")
# print(get_completion(PROMPT))
```

> **Playground:** Exemplo de extração de item de lista sem delimitadores (pode confundir Claude).
```python
# Conteúdo variável
SENTENCES = """- Eu gosto de como as vacas soam
- Esta frase é sobre aranhas
- Esta frase pode parecer ser sobre cães, mas na verdade é sobre porcos"""
# Original: """- I like how cows sound\n- This sentence is about spiders\n- This sentence may appear to be about dogs but it's actually about pigs"""

# Modelo de prompt com um placeholder para o conteúdo variável
PROMPT = f"""Abaixo está uma lista de frases. Diga-me o segundo item da lista.

- Cada uma é sobre um animal, como coelhos.
{SENTENCES}"""

# Imprime a resposta do Claude
# print("--------------------------- Prompt completo com substituições de variáveis ---------------------------")
# print(PROMPT)
# print("\n------------------------------------- Resposta do Claude ------------------------------------")
# print(get_completion(PROMPT))
```

> **Playground:** Exemplo de extração de item de lista com tags XML `<sentences>` para clareza.
```python
# Conteúdo variável
SENTENCES = """- Eu gosto de como as vacas soam
- Esta frase é sobre aranhas
- Esta frase pode parecer ser sobre cães, mas na verdade é sobre porcos"""
# Original: """- I like how cows sound\n- This sentence is about spiders\n- This sentence may appear to be about dogs but it's actually about pigs"""

# Modelo de prompt com um placeholder para o conteúdo variável e tags XML
PROMPT = f"""Abaixo está uma lista de frases. Diga-me o segundo item da lista.

- Cada uma é sobre um animal, como coelhos.
<sentences>
{SENTENCES}
</sentences>"""

# Imprime a resposta do Claude
# print("--------------------------- Prompt completo com substituições de variáveis ---------------------------")
# print(PROMPT)
# print("\n------------------------------------- Resposta do Claude ------------------------------------")
# print(get_completion(PROMPT))
```
