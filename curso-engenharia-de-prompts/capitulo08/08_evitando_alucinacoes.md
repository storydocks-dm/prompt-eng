# Capítulo 08: Evitando Alucinações

- [Lição](#licao)
- [Exercícios](#exercicios)
- [Playground de Exemplos](#playground-de-exemplos)

## <a name="configuracao"></a>Configuração

Execute a célula de configuração a seguir para carregar sua chave de API e estabelecer a função auxiliar `get_completion`.

> **Nota:** O comando `!pip install anthropic` é para instalar a biblioteca em ambientes Jupyter. Os comandos `%store -r API_KEY` e `%store -r MODEL_NAME` são específicos do IPython. Em um script Python padrão, defina `API_KEY` e `MODEL_NAME` diretamente. A função `get_completion` utilizada neste capítulo é a mesma das anteriores, incluindo o parâmetro `prefill` e utilizando `temperature=0.0` para respostas mais consistentes.

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

def get_completion(prompt: str, system_prompt="", prefill=""):
    messages = [{"role": "user", "content": prompt}]
    if prefill:
        messages.append({"role": "assistant", "content": prefill})

    message_request = {
        "model": MODEL_NAME,
        "max_tokens": 2000,
        "temperature": 0.0, # Temperatura 0.0 para respostas mais consistentes e menos propensas a alucinações
        "messages": messages
    }
    if system_prompt:
        message_request["system"] = system_prompt

    response_message = client.messages.create(**message_request)
    return response_message.content[0].text
```

---

## <a name="licao"></a>Lição

Más notícias: **Claude às vezes "alucina" e faz afirmações que não são verdadeiras ou justificadas**. Alucinações, no contexto de Modelos de Linguagem Grandes (LLMs) como o Claude, referem-se a respostas que são factualmente incorretas, inventadas, sem sentido ou não fundamentadas no contexto fornecido. Elas ocorrem porque os LLMs são modelos generativos que preveem a próxima palavra mais provável em uma sequência, e nem sempre têm acesso ou priorizam a veracidade factual da mesma forma que um banco de dados ou um especialista humano. A tendência do modelo de ser "prestativo" pode, às vezes, levá-lo a inventar informações quando não possui a resposta correta.

A boa notícia: existem técnicas que você pode usar para minimizar as alucinações e aumentar a confiabilidade das respostas de Claude.

Abaixo, veremos algumas dessas técnicas, nomeadamente:
- Dar a Claude a opção de dizer que não sabe a resposta a uma pergunta (ou que a informação não está no contexto fornecido).
- Pedir a Claude para encontrar evidências (ou citar fontes do texto fornecido) antes de responder, usando, por exemplo, um "scratchpad" (rascunho).
- Fornecer todo o contexto relevante dentro do prompt e instruir Claude a basear sua resposta exclusivamente nesse contexto.
- Ser o mais específico possível em suas perguntas.

No entanto, **existem muitos métodos para evitar alucinações**, incluindo muitas das técnicas que você já aprendeu neste curso (como ser claro e direto, usar exemplos few-shot para guiar o comportamento, etc.). Se Claude alucinar, experimente várias técnicas para aumentar sua precisão.

### Exemplos

Aqui está uma pergunta sobre conhecimento factual geral em resposta à qual **Claude alucina alguns hipopótamos enormes porque está tentando ser o mais prestativo possível**, mesmo que não tenha a informação precisa.

> **Nota:** Claude pode inventar informações para tentar satisfazer uma pergunta, como visto neste exemplo sobre o hipopótamo mais pesado. (Lembre-se de ter `API_KEY` e `MODEL_NAME` configurados e `client` inicializado para executar.)
```python
# Prompt
PROMPT = "Quem é o hipopótamo mais pesado de todos os tempos?"
# Original: "Who is the heaviest hippo of all time?"

# Imprime a resposta do Claude
# print(get_completion(PROMPT))
```

Uma solução que podemos tentar aqui é "**dar a Claude uma saída**" — dizer a Claude que não há problema em ele se recusar a responder, ou responder apenas se realmente souber a resposta com certeza. Isso reduz a pressão para que o modelo invente uma resposta.

> **Nota:** Instruir Claude a responder apenas se tiver certeza ajuda a reduzir a invenção de fatos.
```python
# Prompt
PROMPT = "Quem é o hipopótamo mais pesado de todos os tempos? Responda apenas se você souber a resposta com certeza."
# Original: "Who is the heaviest hippo of all time? Only answer if you know the answer with certainty."

# Imprime a resposta do Claude
# print(get_completion(PROMPT))
```

No prompt abaixo, damos a Claude um longo documento contendo algumas "informações distratoras" que são quase, mas não totalmente, relevantes para a pergunta do usuário. **Sem ajuda no prompt, Claude cai nas informações distratoras** e dá uma resposta incorreta "alucinada" sobre o tamanho da base de assinantes da Matterport em 31 de maio de 2020.

**Nota:** É uma prática recomendada colocar a pergunta no final *após* qualquer texto ou documento, mas a colocamos no topo aqui (no exemplo original do notebook) para facilitar a leitura do prompt. O documento fornecido é um trecho de um arquivo da SEC da Matterport.

> **Nota:** Este exemplo (com um documento longo, omitido aqui para brevidade, mas presente no notebook original) mostra Claude sendo enganado por informações próximas, mas não exatas, no texto. A pergunta é sobre a base de assinantes em **31 de maio de 2020**. O documento menciona números de outras datas.
```python
# Prompt (documento extenso omitido para tradução, consulte o notebook original para o texto completo)
PROMPT_MATTERPORT_SEM_SCRATCHPAD = """<question>Qual era a base de assinantes da Matterport na data precisa de 31 de maio de 2020?</question>
Por favor, leia o documento abaixo. Em seguida, escreva uma breve resposta numérica dentro das tags <answer>.

<document>
[Texto longo do arquivo da SEC da Matterport aqui - no notebook original, este é um documento muito extenso.
Um ponto chave é que o documento menciona números de assinantes para Dez 31, 2022 (701.000) e Dez 31, 2021 (503.000), e um crescimento de 49 vezes de Dez 31, 2018 a Dez 31, 2022.
Ele também menciona a introdução do Matterport para iPhone em Maio de 2020, mas não o número de assinantes naquela data específica.]
</document>"""

# Imprime a resposta do Claude
# print(get_completion(PROMPT_MATTERPORT_SEM_SCRATCHPAD))
# Claude provavelmente alucinará ou usará um número de uma data diferente se não for guiado.
```

Como corrigimos isso? Bem, uma ótima maneira de reduzir alucinações em documentos longos é **fazer Claude reunir evidências primeiro.**

Neste caso, **dizemos a Claude para primeiro extrair citações relevantes (em um "scratchpad" ou área de rascunho) e, em seguida, basear sua resposta nessas citações**. Dizer a Claude para fazer isso aqui faz com que ele perceba corretamente que a citação não responde à pergunta ou que a informação específica não está disponível no texto fornecido.

> **Nota:** Instruir Claude a primeiro encontrar citações relevantes no documento (em tags `<scratchpad>`) e depois responder com base *apenas* nessas citações ajuda a ancorar a resposta no texto e a admitir quando a informação não está presente.
```python
# Prompt (documento extenso omitido para tradução)
PROMPT_MATTERPORT_COM_SCRATCHPAD = """<question>Qual era a base de assinantes da Matterport na data precisa de 31 de maio de 2020?</question>
Por favor, leia o documento abaixo. Então, em tags <scratchpad>, extraia a citação mais relevante do documento e considere se ela responde à pergunta do usuário ou se carece de detalhes suficientes. Depois, escreva uma breve resposta numérica em tags <answer>. Se a informação não estiver no documento, escreva "Informação não encontrada no documento" dentro das tags <answer>.

<document>
[Texto longo do arquivo da SEC da Matterport aqui - o mesmo documento do exemplo anterior.]
</document>"""

# Imprime a resposta do Claude
# print(get_completion(PROMPT_MATTERPORT_COM_SCRATCHPAD))
```

#### Lição Bônus

Às vezes, as alucinações de Claude podem ser resolvidas diminuindo a `temperature` (temperatura) das respostas de Claude. A temperatura é uma medida da criatividade ou aleatoriedade da resposta, variando entre 0 e 1. Um valor de 1 torna a resposta mais imprevisível e menos padronizada, enquanto 0 a torna mais consistente e focada.

Perguntar algo a Claude com temperatura 0 (como temos feito por padrão neste curso) geralmente produzirá um conjunto de respostas quase determinístico em tentativas repetidas (embora o determinismo completo não seja garantido). Perguntar algo a Claude com temperatura 1 (ou gradações intermediárias) produzirá respostas mais variáveis. Para tarefas factuais onde a precisão é crucial, uma temperatura baixa é geralmente preferível. Saiba mais sobre temperatura e outros parâmetros [aqui](https://docs.anthropic.com/claude/reference/messages_post).

Se você gostaria de experimentar os prompts da lição sem alterar nenhum conteúdo acima, role até o final do notebook da lição para visitar o [**Playground de Exemplos**](#playground-de-exemplos).

---

## <a name="exercicios"></a>Exercícios
- [Exercício 8.1 - Alucinação sobre Beyoncé](#exercicio-81---alucinacao-sobre-beyonce)
- [Exercício 8.2 - Alucinação sobre Prospecto](#exercicio-82---alucinacao-sobre-prospecto)

### <a name="exercicio-81---alucinacao-sobre-beyonce"></a>Exercício 8.1 - Alucinação sobre Beyoncé
Modifique o `PROMPT` para corrigir o problema de alucinação de Claude, dando a Claude uma "saída" (a opção de dizer que não sabe). (O álbum *Renaissance* é o sétimo álbum de estúdio de Beyoncé, não o oitavo.)

Sugerimos que você execute a célula primeiro para ver o que Claude alucina antes de tentar consertá-la.

> **Nota do Exercício:** O objetivo é modificar o `PROMPT` para que Claude admita não saber a resposta sobre o "oitavo" álbum de Beyoncé, em vez de inventar uma data. A função de avaliação original (não incluída aqui) verificaria se a resposta continha frases como "Infelizmente", "Eu não sei" ou "Eu não tenho" e NÃO contivesse "2022" (o ano de lançamento do *Renaissance*, que é o sétimo, e que Claude poderia alucinar como sendo o oitavo).
```python
# Prompt - MODIFIQUE AQUI
PROMPT_BEYONCE = "Em que ano a estrela Beyoncé lançou seu oitavo álbum de estúdio? Se você não tiver certeza ou a informação não for publicamente conhecida, diga que não sabe."
# Original: "In what year did star performer Beyoncé release her eighth studio album?"

# Obtém a resposta de Claude
# response = get_completion(PROMPT_BEYONCE)

# # Lógica de avaliação original (simplificada):
# # A resposta correta deve indicar incerteza e não afirmar 2022.
# # print(response)
# # contains_uncertainty = bool(
# #     re.search("Unfortunately", response, re.IGNORECASE) or # Infelizmente
# #     re.search("I do not know", response, re.IGNORECASE) or # Eu não sei
# #     re.search("I don't know", response, re.IGNORECASE) or # Eu não sei
# #     re.search("não sei", response, re.IGNORECASE) or
# #     re.search("não tenho certeza", response, re.IGNORECASE) # Não tenho certeza
# # )
# # does_not_contain_2022 = not bool(re.search("2022", response))
# # grade = contains_uncertainty and does_not_contain_2022
# # print("\n------------------------------------------ AVALIAÇÃO ------------------------------------------")
# # print("Este exercício foi resolvido corretamente:", grade)

# Para testar em Markdown:
# print("Prompt Modificado:")
# print(PROMPT_BEYONCE)
# print("\nResposta do Claude:")
# print(get_completion(PROMPT_BEYONCE))
```

❓ Se você quiser uma dica:
> **Dica (Exercício 8.1):** A dica original é: "Você pode adicionar uma frase como 'Se você não tem certeza, diga que não sabe' ao seu prompt."

### <a name="exercicio-82---alucinacao-sobre-prospecto"></a>Exercício 8.2 - Alucinação sobre Prospecto
Modifique o `PROMPT` para corrigir o problema de alucinação de Claude, pedindo citações (ou, neste caso, para basear a resposta estritamente no texto e usar um "scratchpad" para extrair a informação relevante). A resposta correta é que os assinantes aumentaram 49 vezes ("49-fold").

> **Nota do Exercício:** O objetivo é fazer Claude extrair corretamente o aumento de "49-fold" (49 vezes) no número de assinantes do documento da Matterport fornecido. Você deve modificar o `PROMPT` para instruir Claude a encontrar a informação no texto, idealmente usando um "scratchpad" para extrair a citação relevante antes de dar a resposta final, e para responder apenas com base nessa citação. A função de avaliação original verificaria se a resposta continha "49-fold". O documento é o mesmo texto longo da Matterport usado na lição.
```python
# Prompt - MODIFIQUE AQUI para pedir citação/scratchpad
PROMPT_TEMPLATE_MATTERPORT_EXERCICIO = """Com base exclusivamente no documento fornecido, em quanto aumentaram os assinantes da Matterport de dezembro de 2018 a dezembro de 2022?
Primeiro, em tags <scratchpad>, extraia a(s) frase(s) exata(s) do documento que contém(êm) essa informação.
Depois, em tags <answer>, forneça o valor do aumento. Se a informação não estiver explicitamente no documento, diga "Informação não encontrada".

<document>
{documento_matterport}
</document>"""

# Documento da Matterport (muito longo, representado por uma variável aqui para o template)
# No uso real, o texto completo do documento seria inserido.
DOCUMENTO_MATTERPORT_COMPLETO = "[Texto longo do arquivo da SEC da Matterport aqui - o mesmo documento dos exemplos da lição. A frase relevante é: 'Our subscribers have grown approximately 49-fold from December 31, 2018 to December 31, 2022.']"

# formatted_prompt_matterport_exercicio = PROMPT_TEMPLATE_MATTERPORT_EXERCICIO.format(documento_matterport=DOCUMENTO_MATTERPORT_COMPLETO)

# # Lógica de avaliação original (simplificada):
# # A resposta correta deve conter "49-fold" ou "49 vezes" e idealmente a citação no scratchpad.
# # response = get_completion(formatted_prompt_matterport_exercicio)
# # print(response)
# # grade = bool(re.search("49-fold", response, re.IGNORECASE) or re.search("49 vezes", response, re.IGNORECASE)) and "<scratchpad>" in response
# # print("\n------------------------------------------ AVALIAÇÃO ------------------------------------------")
# # print("Este exercício foi resolvido corretamente:", grade)

# Para testar em Markdown (com o documento real, que é muito grande para incluir aqui):
# print("Prompt Modificado (com placeholder para o documento):")
# print(PROMPT_TEMPLATE_MATTERPORT_EXERCICIO.format(documento_matterport="[DOCUMENTO COMPLETO IRIA AQUI]"))
# print("\nResposta do Claude (usando o documento completo, não mostrado aqui):")
# # Supondo que formatted_prompt_matterport_exercicio contenha o prompt com o texto real.
# # print(get_completion(formatted_prompt_matterport_exercicio))
```

❓ Se você quiser uma dica:
> **Dica (Exercício 8.2):** A dica original é: "Você pode usar uma técnica semelhante à usada na lição para o mesmo documento: peça a Claude para primeiro extrair citações relevantes em tags `<scratchpad>` e depois responder com base nessas citações."

### Parabéns!

Se você resolveu todos os exercícios até este ponto, está pronto para passar para o próximo capítulo. Bom trabalho com os prompts!

---

## <a name="playground-de-exemplos"></a>Playground de Exemplos

Esta é uma área para você experimentar livremente com os exemplos de prompt mostrados nesta lição e ajustar os prompts para ver como isso pode afetar as respostas do Claude. Lembre-se de que para executar os blocos de código Python, você precisará ter configurado sua chave de API (`API_KEY`), o nome do modelo (`MODEL_NAME`) e inicializado o `client` da Anthropic, conforme mostrado na seção de [Configuração](#configuracao).

> **Playground:** Pergunta factual onde Claude pode alucinar.
```python
# Prompt
PROMPT = "Quem é o hipopótamo mais pesado de todos os tempos?"

# Imprime a resposta do Claude
# print(get_completion(PROMPT))
```

> **Playground:** Dando a Claude uma "saída" para evitar alucinação.
```python
# Prompt
PROMPT = "Quem é o hipopótamo mais pesado de todos os tempos? Responda apenas se você souber a resposta com certeza."

# Imprime a resposta do Claude
# print(get_completion(PROMPT))
```

> **Playground:** Pergunta sobre documento longo sem instrução para citar (pode levar a erro).
```python
# PROMPT_MATTERPORT_SEM_SCRATCHPAD_PLAYGROUND = """<question>Qual era a base de assinantes da Matterport na data precisa de 31 de maio de 2020?</question>
# Por favor, leia o documento abaixo. Em seguida, escreva uma breve resposta numérica dentro das tags <answer>.
#
# <document>
# [Texto longo do arquivo da SEC da Matterport aqui]
# </document>"""
# print(get_completion(PROMPT_MATTERPORT_SEM_SCRATCHPAD_PLAYGROUND))
```

> **Playground:** Pergunta sobre documento longo COM instrução para usar scratchpad e citar.
```python
# PROMPT_MATTERPORT_COM_SCRATCHPAD_PLAYGROUND = """<question>Qual era a base de assinantes da Matterport na data precisa de 31 de maio de 2020?</question>
# Por favor, leia o documento abaixo. Então, em tags <scratchpad>, extraia a citação mais relevante do documento e considere se ela responde à pergunta do usuário ou se carece de detalhes suficientes. Depois, escreva uma breve resposta numérica em tags <answer>. Se a informação não estiver no documento, escreva "Informação não encontrada no documento" dentro das tags <answer>.
#
# <document>
# [Texto longo do arquivo da SEC da Matterport aqui]
# </document>"""
# print(get_completion(PROMPT_MATTERPORT_COM_SCRATCHPAD_PLAYGROUND))
```
