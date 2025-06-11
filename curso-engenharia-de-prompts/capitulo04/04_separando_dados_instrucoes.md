# Capítulo 04: Separando Dados e Instruções

Bem-vindo ao Capítulo 4! Um dos desafios ao criar prompts eficazes, especialmente os mais complexos, é garantir que Claude consiga distinguir claramente entre as instruções que você quer que ele siga e os dados que ele deve processar. Misturar instruções e dados sem uma separação clara pode levar a ambiguidades, fazendo com que Claude interprete mal sua intenção. Neste capítulo, aprenderemos a importância de delimitar seus dados e como usar técnicas como tags XML para tornar seus prompts mais robustos e as respostas de Claude mais precisas e confiáveis.

- [Lição](#licao)
- [Exercícios](#exercicios)
- [Playground de Exemplos](#playground-de-exemplos)

## <a name="configuracao"></a>Configuração

Antes de prosseguir, certifique-se de que você configurou sua `API_KEY` e `MODEL_NAME` conforme descrito no Capítulo 00. A função `get_completion` abaixo também depende da inicialização do objeto `client` da biblioteca Anthropic.

> **Nota sobre `pip install anthropic`:** Se ainda não o fez, instale a biblioteca Python da Anthropic: `pip install anthropic` em seu terminal (preferencialmente em um ambiente virtual).

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
# Se API_KEY ou MODEL_NAME não forem definidas, a função abaixo mostrará um erro.

def get_completion(prompt_do_usuario: str, system_prompt=""):
    if 'client' not in globals() or not isinstance(client, anthropic.Anthropic):
        print("Erro: O cliente Anthropic (client) não foi inicializado corretamente. Verifique sua API_KEY e a inicialização do client.")
        return "Erro de configuração: cliente não definido ou inicializado incorretamente."
    if 'MODEL_NAME' not in globals() or not MODEL_NAME:
        print("Erro: A variável MODEL_NAME não foi definida. Defina o nome do modelo que deseja usar.")
        return "Erro de configuração: nome do modelo não definido."

    try:
        response = client.messages.create(
            model=MODEL_NAME,
            max_tokens=2000, # Valor padrão para este curso
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

Muitas vezes, não queremos escrever prompts completos e estáticos, mas sim **modelos de prompt (templates) que podem ser modificados dinamicamente com dados de entrada adicionais antes de serem enviados ao Claude**. Isso é extremamente útil quando você quer que Claude execute a mesma tarefa repetidamente, mas com dados diferentes a cada vez (por exemplo, resumir diferentes artigos, responder a perguntas sobre diferentes documentos, personalizar emails para diferentes destinatários).

Felizmente, podemos fazer isso facilmente **separando o esqueleto fixo do prompt (as instruções) da entrada variável do usuário (os dados)**. Em Python, podemos usar f-strings ou o método `.format()` para inserir os dados no template do prompt antes de enviá-lo ao Claude.

**A principal razão para essa separação é aumentar a clareza e reduzir a ambiguidade.** Se as instruções e os dados estiverem misturados de forma confusa, Claude pode ter dificuldade em entender o que é uma instrução a seguir e o que é um texto a ser processado.

Abaixo, veremos passo a passo como escrever um modelo de prompt substituível e a importância de delimitar claramente os dados.

### Exemplos

Neste primeiro exemplo, estamos pedindo ao Claude para agir como um gerador de sons de animais. O prompt completo enviado ao Claude é o `PROMPT_TEMPLATE` com a variável `ANIMAL` substituída.

**Nota:** O nome da variável placeholder (`ANIMAL` neste caso) pode ser qualquer um, mas nomes descritivos tornam o template mais fácil de entender.

> **Nota:** Este código demonstra um template de prompt simples usando f-string para inserir o nome de um animal. (Lembre-se de ter `API_KEY` e `MODEL_NAME` configurados e `client` inicializado para executar.)
```python
# Conteúdo variável
ANIMAL = "Vaca" # Original: "Cow"

# Modelo de prompt com um placeholder para o conteúdo variável
PROMPT_SOM_ANIMAL = f"Vou te dizer o nome de um animal. Por favor, responda com o som que esse animal faz. O animal é: {ANIMAL}"
# Modificado para maior clareza sobre onde o nome do animal entra.

# Imprime a resposta do Claude
# print("--------------------------- Prompt completo com substituição de variável ---------------------------")
# print(PROMPT_SOM_ANIMAL)
# print("\n------------------------------------- Resposta do Claude ------------------------------------")
# print(get_completion(PROMPT_SOM_ANIMAL))
```

Por que quereríamos separar e substituir entradas assim? Bem, **modelos de prompt simplificam tarefas repetitivas**. Se você está construindo uma aplicação onde usuários fornecem a entrada (neste caso, o animal), eles não precisam ver ou modificar o prompt inteiro, apenas a variável.

**Nota:** Modelos de prompt podem ter quantas variáveis forem desejadas!

Ao introduzir dados variáveis, é crucial **garantir que Claude saiba onde os dados começam e terminam**, distinguindo-os das instruções. Se essa distinção não for clara, Claude pode se confundir.

Vejamos um exemplo onde não há separação clara entre as instruções e os dados variáveis. Para nós, humanos, a distinção pode parecer óbvia no template, mas após a substituição, Claude pode se confundir.

> **Nota:** Este exemplo mostra como a falta de delimitadores pode confundir Claude, fazendo-o tratar parte da instrução como se fosse parte do email a ser reescrito.
```python
# Conteúdo variável
EMAIL_TEXTO = "Apareça às 6 da manhã de amanhã porque sou o CEO e digo isso."
# Original: "Show up at 6am tomorrow because I'm the CEO and I say so."

# Modelo de prompt SEM delimitadores claros para EMAIL_TEXTO
PROMPT_EMAIL_SEM_DELIMITADOR = f"Ei Claude. {EMAIL_TEXTO} <----- Torne este email mais educado, mas não mude mais nada nele."
# Original: f"Yo Claude. {EMAIL_TEXTO} <----- Make this email more polite but don't change anything else about it."

# Imprime a resposta do Claude
# print("--------------------------- Prompt sem delimitadores claros ---------------------------")
# print(PROMPT_EMAIL_SEM_DELIMITADOR)
# print("\n------------------------------------- Resposta do Claude ------------------------------------")
# print(get_completion(PROMPT_EMAIL_SEM_DELIMITADOR))
```

No exemplo acima, **Claude pode pensar que "Ei Claude." é parte do email que deve reescrever**, e começar a resposta com algo como "Prezado Claude,". A fronteira entre a instrução e o dado não está clara para o modelo.

Como resolvemos isso? **Envolvendo a entrada (os dados) em tags XML**! Fizemos isso abaixo. O uso de tags como `<email_original>` e `</email_original>` cria uma fronteira explícita.

As [Tags XML](https://docs.anthropic.com/claude/docs/use-xml-tags) (como `<exemplo></exemplo>`) são um método recomendado para estruturar prompts para Claude, pois ele foi treinado para reconhecê-las. Elas vêm em pares: uma tag de abertura (ex: `<dados>`) e uma de fechamento (ex: `</dados>`). Outros formatos de delimitação, como objetos JSON (ex: `{"instrucao": "resuma", "texto_para_resumir": "..."}`) ou blocos de código Markdown (usando crases triplas ``` ```), também podem ser usados para separar dados e instruções.

**Nota:** Embora Claude possa reconhecer e trabalhar com uma ampla gama de separadores, **o uso de tags XML é uma prática robusta e recomendada**, pois Claude foi treinado para reconhecê-las como um mecanismo de organização de prompt. Não existem tags XML "mágicas" pré-definidas (além das usadas para Tool Use, que veremos depois); o importante é a consistência e clareza que elas trazem.

> **Nota:** Este exemplo corrige o problema anterior usando tags XML `<email_original>` para delimitar claramente os dados do e-mail, separando-os das instruções.
```python
# Conteúdo variável
EMAIL_TEXTO = "Apareça às 6 da manhã de amanhã porque sou o CEO e digo isso."

# Modelo de prompt com tags XML para delimitar os dados
PROMPT_EMAIL_COM_DELIMITADOR = f"Ei Claude. Por favor, reescreva o seguinte email para ser mais educado, sem alterar o significado central. O email original é: <email_original>{EMAIL_TEXTO}</email_original>"
# Modificado para clareza e para que a instrução "<-----" não seja necessária.

# Imprime a resposta do Claude
# print("--------------------------- Prompt com delimitadores XML ---------------------------")
# print(PROMPT_EMAIL_COM_DELIMITADOR)
# print("\n------------------------------------- Resposta do Claude ------------------------------------")
# print(get_completion(PROMPT_EMAIL_COM_DELIMITADOR))
```

Vejamos outro exemplo de como as tags XML podem nos ajudar. No prompt a seguir, sem delimitadores claros, **Claude pode interpretar incorretamente qual parte do prompt é a instrução versus a entrada de dados**. Ele pode considerar `- Cada uma é sobre um animal, como coelhos.` como parte da lista de frases a ser analisada, devido à formatação similar (um hífen no início da linha).

> **Nota:** Outro exemplo de confusão. A linha sobre coelhos é uma instrução, não um item da lista de dados. Sem delimitadores, Claude pode se confundir.
```python
# Conteúdo variável
LISTA_DE_FRASES = """- Eu gosto de como as vacas soam
- Esta frase é sobre aranhas
- Esta frase pode parecer ser sobre cães, mas na verdade é sobre porcos"""

# Modelo de prompt sem delimitadores para a lista de frases
PROMPT_LISTA_SEM_DELIMITADOR = f"""Abaixo está uma lista de frases. Diga-me o segundo item da lista.

- Cada uma é sobre um animal, como coelhos.
{LISTA_DE_FRASES}"""

# Imprime a resposta do Claude
# print("--------------------------- Prompt de lista sem delimitadores ---------------------------")
# print(PROMPT_LISTA_SEM_DELIMITADOR)
# print("\n------------------------------------- Resposta do Claude ------------------------------------")
# print(get_completion(PROMPT_LISTA_SEM_DELIMITADOR))
```

Para corrigir isso, precisamos apenas **envolver as frases de entrada do usuário (os dados) em tags XML**, como `<lista_de_frases></lista_de_frases>`. Isso mostra a Claude onde os dados de entrada começam e terminam, apesar do hífen potencialmente enganoso na linha de instrução.

> **Nota:** O uso de `<lista_de_frases>` e `</lista_de_frases>` resolve a ambiguidade, mostrando claramente ao modelo qual é a lista de sentenças a ser processada.
```python
# Conteúdo variável
LISTA_DE_FRASES = """- Eu gosto de como as vacas soam
- Esta frase é sobre aranhas
- Esta frase pode parecer ser sobre cães, mas na verdade é sobre porcos"""

# Modelo de prompt com tags XML para delimitar a lista de frases
PROMPT_LISTA_COM_DELIMITADOR = f"""Abaixo está uma lista de frases. Diga-me o segundo item da lista.

- Cada uma é sobre um animal, como coelhos.
<lista_de_frases>
{LISTA_DE_FRASES}
</lista_de_frases>"""

# Imprime a resposta do Claude
# print("--------------------------- Prompt de lista com delimitadores XML ---------------------------")
# print(PROMPT_LISTA_COM_DELIMITADOR)
# print("\n------------------------------------- Resposta do Claude ------------------------------------")
# print(get_completion(PROMPT_LISTA_COM_DELIMITADOR))
```

**Nota Adicional:** Na versão incorreta do prompt "Cada uma é sobre um animal", o hífen foi intencionalmente incluído para ilustrar como Claude poderia se confundir. Esta é uma lição importante sobre prompts: **pequenos detalhes importam**! Sempre vale a pena **revisar seus prompts em busca de erros de digitação, gramaticais ou formatações ambíguas**. Claude é sensível a padrões e, embora robusto, fornecer entradas claras e bem estruturadas geralmente leva a melhores resultados.

Se você gostaria de experimentar os prompts da lição sem alterar nenhum conteúdo acima, role até o final do notebook da lição para visitar o [**Playground de Exemplos**](#playground-de-exemplos).

---

## <a name="exercicios"></a>Exercícios
- [Exercício 4.1 - Tópico do Haicai](#exercicio-41---topico-do-haicai)
- [Exercício 4.2 - Pergunta sobre Cães com Erros de Digitação](#exercicio-42---pergunta-sobre-caes-com-erros-de-digitacao)
- [Exercício 4.3 - Pergunta sobre Cães Parte 2](#exercicio-43---pergunta-sobre-caes-parte-2)

### <a name="exercicio-41---topico-do-haicai"></a>Exercício 4.1 - Tópico do Haicai
Modifique o `PROMPT_EX4_1` para que seja um modelo que receba uma variável chamada `TOPIC` e produza um haicai sobre o tópico. Este exercício destina-se apenas a testar sua compreensão da estrutura de modelagem de variáveis com f-strings.

> **Nota do Exercício:** O objetivo é criar um template de prompt que use uma f-string para inserir um `TOPIC` (tópico) e peça a Claude para gerar um haicai sobre esse tópico. A função de avaliação original (não incluída aqui) verificaria se a resposta continha o tópico (ex: "porcos", se `TOPIC = "Porcos"`) e a palavra "haicai", ambos em letras minúsculas.
```python
# Conteúdo variável
TOPIC_EX4_1 = "Porcos" # Original: "Pigs"

# Modelo de prompt com um placeholder para o conteúdo variável - COMPLETE AQUI
PROMPT_EX4_1 = f"Por favor, escreva um haicai sobre o seguinte tópico: {TOPIC_EX4_1}."

# Obtém a resposta do Claude
# response_ex4_1 = get_completion(PROMPT_EX4_1)

# # Código original do exercício (adaptado para o tópico "Porcos"):
# # def grade_exercise_4_1(text, topic):
# #     return bool(re.search(topic.lower(), text.lower()) and re.search("haicai", text.lower()))
# # print("--------------------------- Prompt completo com substituições de variáveis ---------------------------")
# # print(PROMPT_EX4_1)
# # print("\n------------------------------------- Resposta do Claude ------------------------------------")
# # print(response_ex4_1)
# # print("\n------------------------------------------ AVALIAÇÃO ------------------------------------------")
# # print("Este exercício foi resolvido corretamente:", grade_exercise_4_1(response_ex4_1, TOPIC_EX4_1))

# Para testar em Markdown:
# print("Prompt enviado ao Claude:")
# print(PROMPT_EX4_1)
# print("\nResposta do Claude:")
# print(get_completion(PROMPT_EX4_1))
```

❓ Se você quiser uma dica:
> **Dica (Exercício 4.1):** A dica original é: "Seu prompt pode ser tão simples quanto `f'Escreva um haicai sobre {TOPIC}.'`"

### <a name="exercicio-42---pergunta-sobre-caes-com-erros-de-digitacao"></a>Exercício 4.2 - Pergunta sobre Cães com Erros de Digitação
Corrija o `PROMPT_EX4_2` adicionando tags XML para que Claude produza a resposta certa para a `QUESTION_EX4_2`.

Tente não mudar mais nada no prompt além de adicionar as tags. A escrita bagunçada e cheia de erros é intencional, para que você possa ver como Claude reage a tais erros e como as tags ajudam.

> **Nota do Exercício:** O objetivo é usar tags XML (por exemplo, `<pergunta_usuario></pergunta_usuario>`) para delimitar a `QUESTION_EX4_2` (que está confusa e com erros de digitação: "cs sã mrrns?" tentando simular "cães são marrons?"), para que Claude possa entendê-la e responder corretamente (espera-se uma resposta afirmativa ou que contenha "marrom"). A função de avaliação original (não incluída) verificaria se a palavra "brown" (marrom) estava na resposta.
```python
# Conteúdo variável
QUESTION_EX4_2 = "cs sã mrrns?" # Simula "cães são marrons?" (Original: "ar cn brown?")

# Modelo de prompt com um placeholder para o conteúdo variável - ADICIONE TAGS XML AQUI
PROMPT_EX4_2 = f"Oiee sou eu tenho uma p pergunts obre caes jkaerjv <pergunta_usuario>{QUESTION_EX4_2}</pergunta_usuario> jklmvca obgda me ajuda mt mt obgda rapid rapid resp curta curta obgda"
# Original: f"Hia its me i have a q about dogs jkaerjv {QUESTION_EX4_2} jklmvca tx it help me muhch much atx fst fst answer short short tx"

# Obtém a resposta do Claude
# response_ex4_2 = get_completion(PROMPT_EX4_2)

# # Código original do exercício:
# # def grade_exercise_4_2(text):
# #     return bool(re.search("brown", text.lower()) or re.search("marrom", text.lower()))
# # print("--------------------------- Prompt completo com substituições de variáveis ---------------------------")
# # print(PROMPT_EX4_2)
# # print("\n------------------------------------- Resposta do Claude ------------------------------------")
# # print(response_ex4_2)
# # print("\n------------------------------------------ AVALIAÇÃO ------------------------------------------")
# # print("Este exercício foi resolvido corretamente:", grade_exercise_4_2(response_ex4_2))

# Para testar em Markdown:
# print("Prompt enviado ao Claude:")
# print(PROMPT_EX4_2)
# print("\nResposta do Claude:")
# print(get_completion(PROMPT_EX4_2))
```

❓ Se você quiser uma dica:
> **Dica (Exercício 4.2):** A dica original é: "Envolva a variável `QUESTION` em tags XML como `<question></question>`." (Adaptado para `<pergunta_usuario>` no exemplo acima para evitar conflito com a tag `<question>` usada em outros contextos do curso).

### <a name="exercicio-43---pergunta-sobre-caes-parte-2"></a>Exercício 4.3 - Pergunta sobre Cães Parte 2
Corrija o `PROMPT_EX4_3` **SEM** adicionar tags XML. Em vez disso, remova apenas uma ou duas palavras confusas do prompt que estão próximas à variável `QUESTION_EX4_3`.

Assim como nos exercícios anteriores, tente não mudar mais nada no prompt além de remover essas palavras. Isso mostrará que tipo de "ruído" Claude consegue tolerar ou como a remoção de partes confusas pode ajudar na interpretação.

> **Nota do Exercício:** Desta vez, o desafio é corrigir o prompt confuso do exercício anterior removendo palavras-chave que possam estar confundindo Claude (como o texto aleatório "jkaerjv" ou "jklmvca" adjacente à pergunta), em vez de usar tags XML. O objetivo ainda é fazer Claude entender a pergunta "cães são marrons?" e responder afirmativamente ou mencionando "marrom".
```python
# Conteúdo variável
QUESTION_EX4_3 = "cs sã mrrns?" # Simula "cães são marrons?" (Original: "ar cn brown?")

# Modelo de prompt com um placeholder para o conteúdo variável - REMOVA PALAVRAS CONFUSAS AQUI
PROMPT_EX4_3 = f"Oiee sou eu tenho uma p pergunts obre caes {QUESTION_EX4_3} obgda me ajuda mt mt obgda rapid rapid resp curta curta obgda"
# Original com palavras confusas: f"Hia its me i have a q about dogs jkaerjv {QUESTION_EX4_3} jklmvca tx it help me muhch much atx fst fst answer short short tx"
# No exemplo acima, "jkaerjv", "jklmvca" e alguns "tx", "atx" foram removidos do entorno da variável.

# Obtém a resposta do Claude
# response_ex4_3 = get_completion(PROMPT_EX4_3)

# # Código original do exercício:
# # def grade_exercise_4_3(text):
# #     return bool(re.search("brown", text.lower()) or re.search("marrom", text.lower()))
# # print("--------------------------- Prompt completo com substituições de variáveis ---------------------------")
# # print(PROMPT_EX4_3)
# # print("\n------------------------------------- Resposta do Claude ------------------------------------")
# # print(response_ex4_3)
# # print("\n------------------------------------------ AVALIAÇÃO ------------------------------------------")
# # print("Este exercício foi resolvido corretamente:", grade_exercise_4_3(response_ex4_3))

# Para testar em Markdown:
# print("Prompt enviado ao Claude:")
# print(PROMPT_EX4_3)
# print("\nResposta do Claude:")
# print(get_completion(PROMPT_EX4_3))
```

❓ Se você quiser uma dica:
> **Dica (Exercício 4.3):** A dica original é: "Tente remover o texto aleatório (jumbles) em ambos os lados da variável `QUESTION`."

### Parabéns!

Se você resolveu todos os exercícios até este ponto, está pronto para passar para o próximo capítulo. Bom trabalho com os prompts!

---

## <a name="playground-de-exemplos"></a>Playground de Exemplos

Esta é uma área para você experimentar livremente com os exemplos de prompt mostrados nesta lição e ajustar os prompts para ver como isso pode afetar as respostas do Claude. Lembre-se de que para executar os blocos de código Python, você precisará ter configurado sua `API_KEY`, o nome do modelo (`MODEL_NAME`) e inicializado o `client` da Anthropic, conforme mostrado na seção de [Configuração](#configuracao).

> **Playground:** Template de prompt para sons de animais.
```python
# Conteúdo variável
# ANIMAL_PG1 = "Gato"

# Modelo de prompt com um placeholder para o conteúdo variável
# PROMPT_PG1 = f"Vou te dizer o nome de um animal. Por favor, responda com o som que esse animal faz. O animal é: {ANIMAL_PG1}"

# Imprime a resposta do Claude
# print(get_completion(PROMPT_PG1))
```

> **Playground:** Exemplo de reescrita de e-mail sem delimitadores (pode confundir Claude).
```python
# Conteúdo variável
# EMAIL_PG1 = "Apareça às 6 da manhã de amanhã porque sou o CEO e digo isso."

# Modelo de prompt com um placeholder para o conteúdo variável
# PROMPT_PG2 = f"Ei Claude. {EMAIL_PG1} <----- Torne este email mais educado, mas não mude mais nada nele."

# Imprime a resposta do Claude
# print(get_completion(PROMPT_PG2))
```

> **Playground:** Exemplo de reescrita de e-mail com tags XML `<email_original>` para clareza.
```python
# Conteúdo variável
# EMAIL_PG2 = "Apareça às 6 da manhã de amanhã porque sou o CEO e digo isso."

# Modelo de prompt com um placeholder para o conteúdo variável e tags XML
# PROMPT_PG3 = f"Ei Claude. Por favor, reescreva o seguinte email para ser mais educado, sem alterar o significado central. O email original é: <email_original>{EMAIL_PG2}</email_original>"

# Imprime a resposta do Claude
# print(get_completion(PROMPT_PG3))
```

> **Playground:** Exemplo de extração de item de lista sem delimitadores (pode confundir Claude).
```python
# Conteúdo variável
# LISTA_DE_FRASES_PG1 = """- Eu gosto de como as vacas soam
# - Esta frase é sobre aranhas
# - Esta frase pode parecer ser sobre cães, mas na verdade é sobre porcos"""

# Modelo de prompt com um placeholder para o conteúdo variável
# PROMPT_PG4 = f"""Abaixo está uma lista de frases. Diga-me o segundo item da lista.
#
# - Cada uma é sobre um animal, como coelhos.
# {LISTA_DE_FRASES_PG1}"""

# Imprime a resposta do Claude
# print(get_completion(PROMPT_PG4))
```

> **Playground:** Exemplo de extração de item de lista com tags XML `<lista_de_frases>` para clareza.
```python
# Conteúdo variável
# LISTA_DE_FRASES_PG2 = """- Eu gosto de como as vacas soam
# - Esta frase é sobre aranhas
# - Esta frase pode parecer ser sobre cães, mas na verdade é sobre porcos"""

# Modelo de prompt com um placeholder para o conteúdo variável e tags XML
# PROMPT_PG5 = f"""Abaixo está uma lista de frases. Diga-me o segundo item da lista.
#
# - Cada uma é sobre um animal, como coelhos.
# <lista_de_frases>
# {LISTA_DE_FRASES_PG2}
# </lista_de_frases>"""

# Imprime a resposta do Claude
# print(get_completion(PROMPT_PG5))
```
---
Separar claramente os dados das instruções é uma técnica fundamental para construir prompts robustos e eficazes. Ao usar delimitadores como tags XML, você reduz a ambiguidade e ajuda Claude a entender precisamente qual parte do seu prompt é para ser processada e qual parte é uma diretriz a ser seguida. Isso leva a respostas mais confiáveis, especialmente quando se lida com entradas de usuário complexas ou não estruturadas. Lembre-se de que, embora as tags XML sejam recomendadas, outras formas de delimitação, como estruturas JSON ou blocos de Markdown, também podem ser úteis dependendo do contexto.

No próximo capítulo, exploraremos como formatar a saída de Claude e como usar a técnica de "falar por Claude" para guiar suas respostas.
