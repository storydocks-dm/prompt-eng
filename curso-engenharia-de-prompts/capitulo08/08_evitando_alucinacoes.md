# Capítulo 08: Evitando Alucinações

Bem-vindo ao Capítulo 8! Um dos desafios mais significativos ao trabalhar com Modelos de Linguagem Grandes (LLMs) como o Claude é a tendência que eles têm de "alucinar" – ou seja, gerar informações que parecem factuais mas são incorretas, inventadas ou não fundamentadas no contexto fornecido. Minimizar alucinações é crucial para construir aplicações confiáveis. Neste capítulo, exploraremos o que são alucinações e, mais importante, estratégias eficazes de prompting para reduzi-las e encorajar respostas mais factuais e ancoradas em dados.

- [Lição](#licao)
- [Exercícios](#exercicios)
- [Playground de Exemplos](#playground-de-exemplos)

## <a name="configuracao"></a>Configuração

Execute a célula de configuração a seguir para carregar sua chave de API e estabelecer a função auxiliar `get_completion`.

> **Nota:** O comando `!pip install anthropic` é para instalar a biblioteca em ambientes Jupyter. Os comandos `%store -r API_KEY` e `%store -r MODEL_NAME` são específicos do IPython. Em um script Python padrão, defina `API_KEY` e `MODEL_NAME` diretamente. A função `get_completion` utilizada neste capítulo é a mesma dos Capítulos 5-7, que sempre inclui um turno de `assistant` com o conteúdo de `prefill` (mesmo que vazio). A `temperature` é mantida em `0.0` para promover respostas mais consistentes e factuais, o que é especialmente importante ao tentar evitar alucinações.

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

def get_completion(prompt_do_usuario: str, system_prompt="", prefill=""):
    if 'client' not in globals() or not isinstance(client, anthropic.Anthropic):
        print("Erro: O cliente Anthropic (client) não foi inicializado corretamente.")
        return "Erro de configuração: cliente não definido."
    if 'MODEL_NAME' not in globals() or not MODEL_NAME:
        print("Erro: A variável MODEL_NAME não foi definida.")
        return "Erro de configuração: nome do modelo não definido."

    try:
        # Nota: O turno do assistente é incluído mesmo se prefill for uma string vazia,
        # para sinalizar a Claude que ele deve completar a partir dali, seguindo o padrão do notebook original para estes capítulos.
        messages_to_send = [
            {"role": "user", "content": prompt_do_usuario},
            {"role": "assistant", "content": prefill}
        ]

        message_request = {
            "model": MODEL_NAME,
            "max_tokens": 2000,
            "temperature": 0.0, # Temperatura 0.0 para respostas mais consistentes e menos propensas a alucinações
            "messages": messages_to_send
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

## <a name="licao"></a>Lição

Más notícias: **Claude às vezes "alucina" e faz afirmações que não são verdadeiras ou justificadas**. Alucinações, no contexto de Modelos de Linguagem Grandes (LLMs) como o Claude, referem-se a respostas que são factualmente incorretas, inventadas, sem sentido ou não fundamentadas no contexto fornecido. Elas ocorrem porque os LLMs são modelos generativos que preveem a próxima palavra mais provável em uma sequência com base nos padrões que aprenderam. Embora sejam incrivelmente capazes, eles nem sempre têm acesso ao conhecimento mais atualizado ou priorizam a veracidade factual da mesma forma que um banco de dados ou um especialista humano faria. A tendência do modelo de ser "prestativo" pode, às vezes, levá-lo a inventar informações quando não possui a resposta correta ou quando o prompt é ambíguo.

A boa notícia: existem técnicas de prompting que você pode usar para minimizar significativamente as alucinações e aumentar a confiabilidade e a factualidade das respostas de Claude.

Abaixo, veremos algumas dessas técnicas:
-   **Fornecer Contexto Relevante:** Se você quer que Claude responda com base em um conjunto específico de informações, inclua essas informações diretamente no prompt (por exemplo, dentro de tags `<documento>...</documento>`).
-   **Instruir Claude a Usar Apenas o Contexto Fornecido:** Combine a técnica acima com uma instrução explícita para que Claude baseie sua resposta *exclusivamente* nas informações que você forneceu.
-   **Dar a Claude uma "Saída":** Permita que Claude diga que não sabe a resposta ou que a informação não está disponível no contexto fornecido. Isso é melhor do que forçá-lo a inventar.
-   **Pedir Citações ou Raciocínio (Scratchpad):** Instrua Claude a primeiro extrair evidências do texto fornecido (ou a pensar passo a passo em um "scratchpad") antes de formular sua resposta final. Isso ancora a resposta nos dados.
-   **Fazer Perguntas Específicas:** Perguntas vagas ou muito abertas têm maior probabilidade de gerar respostas especulativas.
-   **Usar Baixa Temperatura:** Como discutido anteriormente, `temperature=0.0` torna as respostas mais determinísticas e menos propensas a divagações criativas que podem levar a alucinações.

No entanto, **existem muitos métodos para evitar alucinações**, incluindo muitas das técnicas que você já aprendeu neste curso (como ser claro e direto, usar exemplos few-shot para guiar o comportamento, etc.). Se Claude alucinar, experimente várias técnicas para aumentar sua precisão.

### Exemplos

Aqui está uma pergunta sobre conhecimento factual geral em resposta à qual **Claude pode alucinar porque tenta ser o mais prestativo possível**, mesmo que não tenha a informação precisa.

> **Nota:** Claude pode inventar informações para tentar satisfazer uma pergunta, como visto neste exemplo sobre o hipopótamo mais pesado. (Lembre-se de ter `API_KEY` e `MODEL_NAME` configurados e `client` inicializado para executar.)
```python
# Prompt
# PROMPT_HIPPO1 = "Quem é o hipopótamo mais pesado de todos os tempos?"

# Imprime a resposta do Claude
# print(get_completion(PROMPT_HIPPO1))
```

Uma solução que podemos tentar aqui é "**dar a Claude uma saída**" — dizer a Claude que não há problema em ele se recusar a responder, ou responder apenas se realmente souber a resposta com certeza. Isso reduz a pressão para que o modelo invente uma resposta.

> **Nota:** Instruir Claude a responder apenas se tiver certeza (e a dizer que não sabe caso contrário) ajuda a reduzir a invenção de fatos.
```python
# Prompt
# PROMPT_HIPPO2 = "Quem é o hipopótamo mais pesado de todos os tempos? Responda apenas se você souber a resposta com certeza. Se não souber, diga 'Não tenho essa informação.'"

# Imprime a resposta do Claude
# print(get_completion(PROMPT_HIPPO2))
```

No prompt abaixo, damos a Claude um longo documento (aqui representado por um placeholder, mas no notebook original é um texto extenso da SEC da Matterport) contendo algumas "informações distratoras" que são quase, mas não totalmente, relevantes para a pergunta do usuário. **Sem ajuda no prompt, Claude pode cair nas informações distratoras** e dar uma resposta incorreta "alucinada".

**Nota:** É uma prática recomendada colocar a pergunta do usuário *após* qualquer documento ou contexto longo. No exemplo original do notebook, a pergunta estava no topo para facilitar a leitura inicial do prompt.

> **Nota:** Este exemplo, usando um documento longo (substituído por um placeholder no Markdown para brevidade), demonstra como Claude pode ser enganado por informações próximas, mas não exatas, no texto. A pergunta é sobre a base de assinantes da Matterport em **31 de maio de 2020**. O documento original menciona números de outras datas.
```python
# Prompt (documento extenso omitido para tradução, consulte o notebook original para o texto completo)
# PROMPT_MATTERPORT_SEM_SCRATCHPAD = """<question>Qual era a base de assinantes da Matterport na data precisa de 31 de maio de 2020?</question>
# Por favor, leia o documento abaixo. Em seguida, escreva uma breve resposta numérica dentro das tags <answer>.
#
# <document>
# [Texto longo do arquivo da SEC da Matterport aqui...]
# </document>"""

# Imprime a resposta do Claude
# print(get_completion(PROMPT_MATTERPORT_SEM_SCRATCHPAD))
# Claude provavelmente alucinará ou usará um número de uma data diferente se não for guiado.
```

Como corrigimos isso? Uma ótima maneira de reduzir alucinações em documentos longos é **fazer Claude reunir evidências primeiro.**

Neste caso, **dizemos a Claude para primeiro extrair citações relevantes (em um "scratchpad" ou área de rascunho) e, em seguida, basear sua resposta *apenas* nessas citações**. Dizer a Claude para fazer isso aqui faz com que ele perceba corretamente que a informação específica não está disponível no texto fornecido, ou que as citações encontradas não respondem precisamente à pergunta.

> **Nota:** Instruir Claude a primeiro encontrar citações relevantes no documento (em tags `<scratchpad>`) e depois responder com base *apenas* nessas citações ajuda a ancorar a resposta no texto e a admitir quando a informação não está presente.
```python
# Prompt (documento extenso omitido para tradução)
# PROMPT_MATTERPORT_COM_SCRATCHPAD = """<question>Qual era a base de assinantes da Matterport na data precisa de 31 de maio de 2020?</question>
# Por favor, leia o documento abaixo. Então, em tags <scratchpad>, extraia a citação mais relevante do documento que possa responder à pergunta e avalie se ela de fato responde ou se carece de detalhes suficientes. Depois, escreva uma breve resposta numérica em tags <answer>. Se a informação não estiver no documento, escreva "Informação não encontrada no documento" dentro das tags <answer>.
#
# <document>
# [Texto longo do arquivo da SEC da Matterport aqui...]
# </document>"""

# Imprime a resposta do Claude
# print(get_completion(PROMPT_MATTERPORT_COM_SCRATCHPAD))
```

#### Lição Bônus: Temperatura

Às vezes, as alucinações de Claude podem ser reduzidas simplesmente ajustando o parâmetro `temperature` na chamada da API. A temperatura controla a aleatoriedade da saída.
-   `temperature = 0.0`: Produz respostas mais determinísticas, focadas e consistentes. É a configuração ideal para tarefas que exigem precisão factual e para minimizar alucinações.
-   `temperature > 0.0` (ex: 0.5, 0.7): Produz respostas mais criativas, variadas, mas também potencialmente mais especulativas e propensas a divagações.

Para todas as lições deste curso, temos usado `temperature=0.0` por padrão na função `get_completion`, o que já é uma boa prática para evitar alucinações. Saiba mais sobre temperatura e outros parâmetros [aqui](https://docs.anthropic.com/claude/reference/messages_post).

Se você gostaria de experimentar os prompts da lição sem alterar nenhum conteúdo acima, role até o final do notebook da lição para visitar o [**Playground de Exemplos**](#playground-de-exemplos).

---

## <a name="exercicios"></a>Exercícios
- [Exercício 8.1 - Alucinação sobre Beyoncé](#exercicio-81---alucinacao-sobre-beyonce)
- [Exercício 8.2 - Alucinação sobre Prospecto](#exercicio-82---alucinacao-sobre-prospecto)

### <a name="exercicio-81---alucinacao-sobre-beyonce"></a>Exercício 8.1 - Alucinação sobre Beyoncé
Modifique o `PROMPT_BEYONCE` para corrigir o problema de alucinação de Claude, dando a Claude uma "saída" (a opção de dizer que não sabe). (O álbum *Renaissance* é o sétimo álbum de estúdio de Beyoncé, não o oitavo.)

Sugerimos que você execute o prompt original (sem modificações) primeiro para ver o que Claude alucina antes de tentar consertá-lo.

> **Nota do Exercício:** O objetivo é modificar o `PROMPT_BEYONCE` para que Claude admita não saber a resposta sobre o suposto "oitavo" álbum de Beyoncé, em vez de inventar uma data ou título. A função de avaliação original do notebook (não incluída aqui) verificaria se a resposta continha frases indicativas de incerteza (como "Infelizmente", "Eu não sei", "Não tenho essa informação") E NÃO contivesse "2022" (o ano de lançamento do *Renaissance*, que é o sétimo álbum e que Claude poderia erroneamente citar como o oitavo).
```python
# Prompt - MODIFIQUE AQUI
PROMPT_BEYONCE = "Em que ano a estrela Beyoncé lançou seu oitavo álbum de estúdio? Se você não tiver certeza ou se essa informação não for publicamente confirmada, por favor, indique que não possui essa informação."
# Original: "In what year did star performer Beyoncé release her eighth studio album?"

# Obtém a resposta de Claude
# response_beyonce = get_completion(PROMPT_BEYONCE)

# # Lógica de avaliação (conceitual):
# # print(response_beyonce)
# # contains_uncertainty = "não sei" in response_beyonce.lower() or "não tenho essa informação" in response_beyonce.lower() or "infelizmente" in response_beyonce.lower()
# # does_not_contain_2022 = "2022" not in response_beyonce
# # grade_beyonce = contains_uncertainty and does_not_contain_2022
# # print("\n------------------------------------------ AVALIAÇÃO ------------------------------------------")
# # print("Este exercício foi resolvido corretamente:", grade_beyonce)

# Para testar em Markdown:
# print("Prompt Modificado:")
# print(PROMPT_BEYONCE)
# print("\nResposta do Claude:")
# print(get_completion(PROMPT_BEYONCE))
```

❓ Se você quiser uma dica:
> **Dica (Exercício 8.1):** A dica original é: "Você pode adicionar uma frase como 'Se você não tem certeza, diga que não sabe' ao seu prompt."

### <a name="exercicio-82---alucinacao-sobre-prospecto"></a>Exercício 8.2 - Alucinação sobre Prospecto
Modifique o `PROMPT_TEMPLATE_MATTERPORT_EXERCICIO` para corrigir o problema de alucinação de Claude, pedindo que ele use um "scratchpad" para extrair citações relevantes do documento antes de responder. A resposta correta para a pergunta sobre o crescimento de assinantes da Matterport (de dezembro de 2018 a dezembro de 2022) é um aumento de 49 vezes ("49-fold"), que está no documento.

> **Nota do Exercício:** O objetivo é fazer Claude extrair corretamente o aumento de "49-fold" (49 vezes) no número de assinantes do documento da Matterport. Você deve modificar o `PROMPT_TEMPLATE_MATTERPORT_EXERCICIO` para instruir Claude a:
> 1.  Primeiro, encontrar e citar a(s) frase(s) exata(s) do documento que contém(êm) essa informação dentro de tags `<scratchpad>`.
> 2.  Depois, com base *apenas* nessa citação, fornecer o valor do aumento em tags `<answer>`.
> 3.  Se a informação não estiver explicitamente no documento (conforme sua análise no scratchpad), ele deve indicar isso.
> A função de avaliação original verificaria se a resposta final continha "49-fold" (ou "49 vezes") e se o scratchpad foi usado. O documento é o mesmo texto longo da Matterport usado na lição.
```python
# Prompt Template - MODIFIQUE AQUI para incluir instruções claras para o scratchpad e a resposta final
PROMPT_TEMPLATE_MATTERPORT_EXERCICIO = """Com base exclusivamente no documento fornecido abaixo, em quanto os assinantes da Matterport cresceram de dezembro de 2018 a dezembro de 2022?

Siga estas etapas:
1. Primeiro, dentro de tags <scratchpad>, encontre e copie a(s) frase(s) exata(s) do documento que responde(m) diretamente à pergunta sobre o crescimento de assinantes nesse período.
2. Em seguida, com base APENAS na informação extraída no scratchpad, forneça o valor do aumento em tags <answer>.
3. Se a informação exata não estiver no documento, escreva "Informação não encontrada no documento" dentro das tags <answer>.

<document>
{documento_matterport}
</document>"""

# Documento da Matterport (representado por uma variável; no uso real, o texto completo seria inserido)
# A frase relevante é: "Our subscribers have grown approximately 49-fold from December 31, 2018 to December 31, 2022."
DOCUMENTO_MATTERPORT_COMPLETO_EX = "[Texto longo do arquivo da SEC da Matterport aqui...]"

# formatted_prompt_matterport_exercicio = PROMPT_TEMPLATE_MATTERPORT_EXERCICIO.format(documento_matterport=DOCUMENTO_MATTERPORT_COMPLETO_EX)

# # Lógica de avaliação (conceitual):
# # response_ex8_2 = get_completion(formatted_prompt_matterport_exercicio)
# # print(response_ex8_2)
# # # Verifica se o scratchpad foi usado e se a resposta final está correta
# # grade_ex8_2 = "<scratchpad>" in response_ex8_2 and ("49-fold" in response_ex8_2 or "49 vezes" in response_ex8_2) and "<answer>" in response_ex8_2
# # print("\n------------------------------------------ AVALIAÇÃO ------------------------------------------")
# # print("Este exercício foi resolvido corretamente:", grade_ex8_2)

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

Esta é uma área para você experimentar livremente com os exemplos de prompt mostrados nesta lição e ajustar os prompts para ver como isso pode afetar as respostas do Claude. Lembre-se de que para executar os blocos de código Python, você precisará ter configurado sua `API_KEY`, o nome do modelo (`MODEL_NAME`) e inicializado o `client` da Anthropic, conforme mostrado na seção de [Configuração](#configuracao).

> **Playground:** Pergunta factual onde Claude pode alucinar. Tente com diferentes perguntas obscuras.
```python
# Prompt
# PROMPT_PG1 = "Qual é a cor da décima terceira pena na cauda do pássaro Lira-de-Ouro da Nova Guiné?"

# Imprime a resposta do Claude
# print(get_completion(PROMPT_PG1))
```

> **Playground:** Dando a Claude uma "saída" para evitar alucinação na pergunta acima.
```python
# Prompt
# PROMPT_PG2 = "Qual é a cor da décima terceira pena na cauda do pássaro Lira-de-Ouro da Nova Guiné? Se você não souber ou essa informação não for factual, diga 'Não sei'."

# Imprime a resposta do Claude
# print(get_completion(PROMPT_PG2))
```

> **Playground:** Pergunta sobre um documento (use um trecho de texto seu) sem instrução para citar.
```python
# MEU_DOCUMENTO_PG = """
# Artigo sobre o Planeta Kepler-186f:
# Kepler-186f é um exoplaneta orbitando a anã vermelha Kepler-186, a cerca de 500 anos-luz da Terra.
# É o primeiro planeta de tamanho terrestre descoberto na zona habitável de outra estrela.
# Sua temperatura de equilíbrio é estimada em -46°C, mas com uma atmosfera densa, a temperatura superficial poderia ser mais alta.
# O período orbital de Kepler-186f é de 129.9 dias. Seu raio é cerca de 1.17 vezes o da Terra.
# """
# PERGUNTA_PG = "Qual a duração do ano em Kepler-186f e qual sua possível temperatura superficial se tiver atmosfera?"

# PROMPT_PG3 = f"""Responda à pergunta com base no documento fornecido.
# Pergunta: {PERGUNTA_PG}
#
# Documento:
# <documento>
# {MEU_DOCUMENTO_PG}
# </documento>
#
# Resposta:
# """
# print(get_completion(PROMPT_PG3))
```

> **Playground:** Mesma pergunta sobre seu documento, MAS com instrução para usar scratchpad e citar.
```python
# PROMPT_PG4 = f"""Responda à pergunta com base exclusivamente no documento fornecido.
# Pergunta: {PERGUNTA_PG}
#
# Documento:
# <documento>
# {MEU_DOCUMENTO_PG}
# </documento>
#
# Instruções de Resposta:
# 1. Primeiro, em tags <scratchpad>, copie as frases exatas do documento que contêm a resposta.
# 2. Depois, em tags <resposta_final>, formule sua resposta à pergunta usando apenas as informações do scratchpad.
# """
# print(get_completion(PROMPT_PG4))
```
---
Evitar alucinações é um aspecto fundamental para construir confiança e confiabilidade nas interações com LLMs. As técnicas discutidas neste capítulo – como fornecer contexto e instruir o modelo a usá-lo exclusivamente, permitir que Claude diga "não sei", incentivá-lo a citar evidências ou usar um "scratchpad" para raciocínio, fazer perguntas específicas e manter a temperatura baixa – são ferramentas poderosas em seu arsenal. Nenhuma técnica isolada garante a eliminação total de alucinações, mas sua combinação criteriosa pode reduzi-las drasticamente.

No próximo capítulo, veremos como todas as técnicas aprendidas até agora podem ser combinadas para construir prompts complexos e robustos para tarefas sofisticadas.
