# Capítulo 07: Usando Exemplos (Few-Shot Prompting)

- [Lição](#licao)
- [Exercícios](#exercicios)
- [Playground de Exemplos](#playground-de-exemplos)

## <a name="configuracao"></a>Configuração

Execute a célula de configuração a seguir para carregar sua chave de API e estabelecer a função auxiliar `get_completion`.

> **Nota:** O comando `!pip install anthropic` é para instalar a biblioteca em ambientes Jupyter. Os comandos `%store -r API_KEY` e `%store -r MODEL_NAME` são específicos do IPython. Em um script Python padrão, defina `API_KEY` e `MODEL_NAME` diretamente. A função `get_completion` utilizada neste capítulo é a mesma das anteriores, incluindo o parâmetro `prefill`.

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
        "temperature": 0.0,
        "messages": messages
    }
    if system_prompt:
        message_request["system"] = system_prompt

    response_message = client.messages.create(**message_request)
    return response_message.content[0].text
```

---

## <a name="licao"></a>Lição

**Fornecer a Claude exemplos de como você quer que ele se comporte (ou como você não quer que ele se comporte) é extremamente eficaz** para:
- Obter a resposta correta.
- Obter a resposta no formato correto.
- Guiar o modelo em tarefas com nuances ou quando as instruções são complexas para descrever abstratamente.

Esse tipo de prompt também é chamado de "**few-shot prompting**" (prompt com poucos exemplos). Você também pode encontrar as frases "**zero-shot**" (sem exemplos), "**one-shot**" (um exemplo) ou "**n-shot**" (n exemplos). O número de "shots" (disparos/tentativas/exemplos) refere-se a quantos exemplos de pares entrada/saída são fornecidos dentro do prompt para condicionar o modelo antes de apresentar a nova consulta.

- **Zero-shot prompting:** Você pede ao modelo para fazer algo sem fornecer nenhum exemplo prévio de como fazer. A maioria dos exemplos nos capítulos anteriores foram zero-shot. O modelo tenta responder com base em seu treinamento geral.
- **Few-shot prompting:** Você fornece ao modelo alguns exemplos (shots) de como executar a tarefa antes de pedir que ele a execute em uma nova entrada. Isso é particularmente útil para tarefas que exigem um formato de saída específico, um estilo particular, ou a tomada de decisões complexas e com nuances onde a simples instrução pode ser ambígua. Os exemplos ajudam a "calibrar" o modelo para a sua necessidade específica.

Os exemplos devem demonstrar o comportamento desejado para a tarefa específica, mostrando o tipo de entrada que você fornecerá e o tipo de saída que espera.

### Exemplos

Finja que você é um desenvolvedor tentando construir um "bot para pais" que responde a perguntas de crianças. **A resposta padrão de Claude (zero-shot) é bastante formal e robótica**. Isso vai partir o coração de uma criança.

> **Nota:** Este exemplo mostra a resposta padrão de Claude (zero-shot) a uma pergunta infantil, que pode ser inadequada em tom. (Lembre-se de ter `API_KEY` e `MODEL_NAME` configurados e `client` inicializado para executar.)
```python
# Prompt
PROMPT = "O Papai Noel vai me trazer presentes no Natal?"
# Original: "Will Santa bring me presents on Christmas?"

# Imprime a resposta do Claude
# print(get_completion(PROMPT))
```

Você poderia levar tempo para descrever o tom desejado, mas é muito mais fácil simplesmente **dar a Claude alguns exemplos de respostas ideais (few-shot)**.

> **Nota:** Aqui, usamos few-shot prompting. Fornecemos um exemplo de pergunta e resposta (P: Pergunta sobre a Fada do Dente, R: Resposta carinhosa) para ensinar a Claude o tom desejado antes de fazer a pergunta sobre o Papai Noel. O modelo aprende o padrão de interação a partir do exemplo.
```python
# Prompt com exemplo few-shot
PROMPT = """Por favor, complete a conversa escrevendo a próxima linha, falando como "R".

P: A fada do dente é real?
R: Claro, meu bem. Embrulhe seu dente e coloque-o debaixo do travesseiro esta noite. Pode haver algo esperando por você pela manhã.

P: O Papai Noel vai me trazer presentes no Natal?"""
# Original: """Please complete the conversation by writing the next line, speaking as "A".
# Q: Is the tooth fairy real?
# A: Of course, sweetie. Wrap up your tooth and put it under your pillow tonight. There might be something waiting for you in the morning.
# Q: Will Santa bring me presents on Christmas?"""


# Imprime a resposta do Claude
# print(get_completion(PROMPT))
```

No exemplo de formatação a seguir, poderíamos guiar Claude passo a passo através de um conjunto de instruções de formatação sobre como extrair nomes e profissões e depois formatá-los exatamente da maneira que queremos, ou poderíamos simplesmente **fornecer a Claude alguns exemplos formatados corretamente e Claude pode extrapolar a partir daí**. Observe o `<individuals>` no turno do `assistant` (usando `PREFILL`) para iniciar Claude no caminho certo para o último exemplo de texto a ser processado.

Este é um exemplo de "few-shot prompting" onde os "shots" (exemplos) são blocos de texto e suas extrações formatadas. Claude aprende o padrão de extração e formatação a partir dos exemplos fornecidos.

> **Nota:** Este exemplo demonstra como usar few-shot prompting para ensinar a Claude um formato de extração específico. Dois exemplos completos de texto e extração são fornecidos antes do texto final a ser processado. O `PREFILL` ajuda a iniciar a última extração no formato correto.
```python
# Prompt template com múltiplos exemplos (shots)
PROMPT = """Silvermist Hollow, uma charmosa vila, era o lar de um grupo extraordinário de indivíduos.
Entre eles estava o Dr. Liam Patel, um neurocirurgião que revolucionou as técnicas cirúrgicas no centro médico regional.
Olivia Chen era uma arquiteta inovadora que transformou a paisagem da vila com seus designs sustentáveis e de tirar o fôlego.
O teatro local era agraciado pelas sinfonias encantadoras de Ethan Kovacs, um músico e compositor profissionalmente treinado.
Isabella Torres, uma chef autodidata apaixonada por ingredientes de origem local, criou uma sensação culinária com seu restaurante da fazenda à mesa, que se tornou um destino obrigatório para os amantes da gastronomia.
Esses indivíduos notáveis, cada um com seus talentos distintos, contribuíram para o vibrante tecido da vida em Silvermist Hollow.
<individuals>
1. Dr. Liam Patel [NEUROCIRURGIÃO]
2. Olivia Chen [ARQUITETA]
3. Ethan Kovacs [MÚSICO E COMPOSITOR]
4. Isabella Torres [CHEF]
</individuals>

No coração da cidade, o Chef Oliver Hamilton transformou o cenário culinário com seu restaurante da fazenda à mesa, Green Plate. A dedicação de Oliver em obter ingredientes locais e orgânicos rendeu ao estabelecimento críticas entusiasmadas de críticos gastronômicos e moradores locais.
Descendo a rua, você encontrará a Biblioteca Riverside Grove, onde a bibliotecária chefe Elizabeth Chen trabalhou diligentemente para criar um espaço acolhedor e inclusivo para todos. Seus esforços para expandir as ofertas da biblioteca e estabelecer programas de leitura para crianças tiveram um impacto significativo nas taxas de alfabetização da cidade.
Ao passear pela charmosa praça da cidade, você será cativado pelos belos murais que adornam as paredes. Essas obras-primas são obra da renomada artista Isabella Torres, cujo talento para capturar a essência de Riverside Grove deu vida à cidade.
As conquistas atléticas de Riverside Grove também são dignas de nota, graças ao ex-nadador olímpico que virou treinador, Marcus Jenkins. Marcus usou sua experiência e paixão para treinar os jovens da cidade, levando a Equipe de Natação de Riverside Grove a vários campeonatos regionais.
<individuals>
1. Oliver Hamilton [CHEF]
2. Elizabeth Chen [BIBLIOTECÁRIA]
3. Isabella Torres [ARTISTA]
4. Marcus Jenkins [TREINADOR]
</individuals>

Oak Valley, uma charmosa cidade pequena, é o lar de um trio notável de indivíduos cujas habilidades e dedicação deixaram um impacto duradouro na comunidade.
No movimentado mercado de agricultores da cidade, você encontrará Laura Simmons, uma apaixonada agricultora orgânica conhecida por seus produtos deliciosos e cultivados de forma sustentável. Sua dedicação em promover uma alimentação saudável inspirou a cidade a adotar um estilo de vida mais consciente ecologicamente.
No centro comunitário de Oak Valley, Kevin Alvarez, um habilidoso instrutor de dança, trouxe a alegria do movimento para pessoas de todas as idades. Suas aulas de dança inclusivas fomentaram um senso de unidade e autoexpressão entre os residentes, enriquecendo a cena artística local.
Por último, Rachel O'Connor, uma voluntária incansável, dedica seu tempo a várias iniciativas de caridade. Seu compromisso em melhorar a vida dos outros tem sido fundamental na criação de um forte senso de comunidade em Oak Valley.
Através de seus talentos únicos e dedicação inabalável, Laura, Kevin e Rachel se entrelaçaram no tecido de Oak Valley, ajudando a criar uma cidade pequena vibrante e próspera."""
# Nota: O texto original em inglês foi traduzido para os exemplos acima.

# Prefill para a resposta de Claude, para guiar o início da extração do último bloco de texto
PREFILL = "<individuals>"

# Imprime a resposta do Claude
# print("--------------------------- Prompt completo com exemplos (few-shot) ---------------------------")
# print("TURNO DO USUÁRIO (contendo os exemplos e o novo texto):")
# print(PROMPT)
# print("\nTURNO DO ASSISTENTE (pré-preenchido):")
# print(PREFILL)
# print("\n------------------------------------- Resposta do Claude (para o último texto) ------------------------------------")
# print(get_completion(PROMPT, prefill=PREFILL))
```

Se você gostaria de experimentar os prompts da lição sem alterar nenhum conteúdo acima, role até o final do notebook da lição para visitar o [**Playground de Exemplos**](#playground-de-exemplos).

---

## <a name="exercicios"></a>Exercícios
- [Exercício 7.1 - Formatação de Email via Exemplos](#exercicio-71---formatacao-de-email-via-exemplos)

### <a name="exercicio-71---formatacao-de-email-via-exemplos"></a>Exercício 7.1 - Formatação de Email via Exemplos
Vamos refazer o Exercício 6.2 (classificação de emails e formatação da saída), mas desta vez, vamos editar o `PROMPT` para usar exemplos "few-shot" de emails + classificação e formatação adequadas para fazer Claude produzir a resposta correta. Queremos que a *última letra* da saída de Claude seja a letra da categoria, envolta em tags `<answer>`.

Lembre-se de que estas são as categorias para os emails:
- (A) Pergunta de pré-venda
- (B) Item quebrado ou com defeito
- (C) Dúvida sobre cobrança
- (D) Outro (explique, por favor)

> **Nota do Exercício:** O objetivo é usar a técnica de few-shot prompting para ensinar Claude a classificar emails e formatar a saída como `<answer>LETRA_DA_CATEGORIA</answer>`. Você precisará construir o `PROMPT` para incluir exemplos de emails e suas respectivas saídas formatadas corretamente antes de apresentar o email que Claude deve classificar. A função de avaliação original (não incluída aqui) verificaria se o último caractere da resposta de Claude (desconsiderando a tag de fechamento, ou seja, a própria letra) era a letra correta da categoria para o email de teste.
```python
# Template de prompt que você precisará preencher com exemplos few-shot
# e o email final para classificação.
PROMPT_FEW_SHOT_BASE = """A seguir estão exemplos de emails classificados. Sua tarefa é classificar o email final.
Responda APENAS com a letra da categoria correta, envolta em tags <answer> e </answer>.

Exemplo 1:
Email: "Olá, gostaria de saber se vocês enviam para o Alasca?"
Classificação: <answer>A</answer>

Exemplo 2:
Email: "Meu pedido chegou com a caixa amassada e o produto não liga!"
Classificação: <answer>B</answer>

Exemplo 3:
Email: "Fui cobrado duas vezes este mês, podem verificar por favor?"
Classificação: <answer>C</answer>

Email para classificar:
{email}
"""

# Prefill para a resposta de Claude (para guiar o início da resposta do último email)
PREFILL = "<answer>"

# Emails de teste do notebook original
EMAILS_TESTE = [
    "Hi -- My Mixmaster4000 is producing a strange noise when I operate it. It also smells a bit smoky and plasticky, like burning electronics.  I need a replacement.", # Esperado: <answer>B</answer>
    "Can I use my Mixmaster 4000 to mix paint, or is it only meant for mixing food?", # Esperado: <answer>A</answer> ou <answer>D</answer>
    "I HAVE BEEN WAITING 4 MONTHS FOR MY MONTHLY CHARGES TO END AFTER CANCELLING!!  WTF IS GOING ON???", # Esperado: <answer>C</answer>
    "How did I get here I am not good with computer.  Halp." # Esperado: <answer>D</answer>
]
# Respostas corretas correspondentes (apenas a letra) para fins de validação conceitual
# RESPOSTAS_CORRETAS_TESTE = [["B"], ["A", "D"], ["C"], ["D"]]

# Exemplo com o primeiro email de teste:
# email_atual_para_teste = EMAILS_TESTE[0]
# formatted_prompt = PROMPT_FEW_SHOT_BASE.format(email=email_atual_para_teste)

# # Lógica de avaliação original (simplificada para um email):
# # A lógica original do notebook era: `grade = any([bool(re.search(ans, response[-1])) for ans in ANSWERS[i]])`
# # Isso significava que verificava se a ÚLTIMA LETRA da resposta de Claude (response[-1])
# # correspondia a uma das letras em ANSWERS[i].
# # Para o nosso formato <answer>X</answer>, precisaríamos extrair X antes de comparar.
# # response_content = get_completion(formatted_prompt, prefill=PREFILL)
# # match = re.search(r"<answer>([A-D])</answer>", response_content.strip())
# # extracted_letter = match.group(1) if match else None
# # grade = extracted_letter in RESPOSTAS_CORRETAS_TESTE[0]
# # print("Prompt enviado (com exemplos few-shot):")
# # print(formatted_prompt)
# # print("\nPrefill do Assistente:\n" + PREFILL)
# # print("\nResposta do Claude:")
# # print(response_content)
# # print("\nExercício resolvido corretamente (para este exemplo):", grade)

# Para testar em Markdown (você pode iterar manualmente pelos EMAILS_TESTE):
# print("Prompt formatado com exemplos few-shot (para o primeiro email de teste):")
# print(formatted_prompt)
# print("\nPrefill do Assistente:\n" + PREFILL)
# print("\nResposta do Claude:")
# print(get_completion(formatted_prompt, prefill=PREFILL))
```

❓ Se você quiser uma dica:
> **Dica (Exercício 7.1):** A dica original é: "Você precisará incluir exemplos de pares de email e classificação no seu prompt antes do email final que você quer que Claude classifique. Certifique-se de que seus exemplos sigam o formato de saída desejado, por exemplo: `Email: [texto do email]\nClassificação: <answer>A</answer>`."

Ainda emperrado? A solução do notebook original para o prompt completo (com os exemplos few-shot e o placeholder para o email a ser classificado) é:
`PROMPT = """Human: Email: "Hi -- I'm having trouble with my Mixmaster4000. It's making a weird grinding noise and smells like burning plastic. Can you help?"
Assistant: <answer>B</answer>
Human: Email: "I'm interested in the Mixmaster4000 but I want to know if it can also grind coffee beans. Thanks!"
Assistant: <answer>A</answer>
Human: Email: "I was charged twice for my Mixmaster order #12345. Please issue a refund."
Assistant: <answer>C</answer>
Human: Email: "{email}" """`
(Nota: Esta solução original mistura turnos "Human" e "Assistant" para os exemplos, o que é uma forma válida de fazer few-shot. O `PREFILL = "<answer>"` ainda seria usado para o último email.)
A tradução e adaptação para o nosso formato seria:
`PROMPT_FEW_SHOT_BASE = """Exemplo 1:
Email: "Oi -- Estou tendo problemas com meu Mixmaster4000. Está fazendo um barulho estranho de rangido e cheira a plástico queimado. Vocês podem ajudar?"
Classificação: <answer>B</answer>

Exemplo 2:
Email: "Estou interessado no Mixmaster4000, mas quero saber se ele também pode moer grãos de café. Obrigado!"
Classificação: <answer>A</answer>

Exemplo 3:
Email: "Fui cobrado duas vezes pelo meu pedido Mixmaster #12345. Por favor, emitam um reembolso."
Classificação: <answer>C</answer>

Email para classificar:
{email}
"""`
E então você usaria `PREFILL = "<answer>"`.

### Parabéns!

Se você resolveu todos os exercícios até este ponto, está pronto para passar para o próximo capítulo. Bom trabalho com os prompts!

---

## <a name="playground-de-exemplos"></a>Playground de Exemplos

Esta é uma área para você experimentar livremente com os exemplos de prompt mostrados nesta lição e ajustar os prompts para see como isso pode afetar as respostas do Claude. Lembre-se de que para executar os blocos de código Python, você precisará ter configurado sua chave de API (`API_KEY`), o nome do modelo (`MODEL_NAME`) e inicializado o `client` da Anthropic, conforme mostrado na seção de [Configuração](#configuracao).

> **Playground:** Resposta padrão (zero-shot) de Claude a uma pergunta infantil.
```python
# Prompt
PROMPT = "O Papai Noel vai me trazer presentes no Natal?"

# Imprime a resposta do Claude
# print(get_completion(PROMPT))
```

> **Playground:** Usando few-shot prompting para ensinar o tom de "bot para pais".
```python
# Prompt com exemplo few-shot
PROMPT = """Por favor, complete a conversa escrevendo a próxima linha, falando como "R".

P: A fada do dente é real?
R: Claro, meu bem. Embrulhe seu dente e coloque-o debaixo do travesseiro esta noite. Pode haver algo esperando por você pela manhã.

P: O Papai Noel vai me trazer presentes no Natal?"""

# Imprime a resposta do Claude
# print(get_completion(PROMPT))
```

> **Playground:** Usando few-shot prompting para extração e formatação de informações.
```python
# Prompt template com múltiplos exemplos (shots)
PROMPT = """Silvermist Hollow, uma charmosa vila... (texto completo como na Lição) ...</individuals>

No coração da cidade, o Chef Oliver Hamilton... (texto completo como na Lição) ...</individuals>

Oak Valley, uma charmosa cidade pequena... (texto completo como na Lição)"""
# Para brevidade, o texto completo dos exemplos da lição está omitido aqui, mas seria incluído no prompt real.

# Prefill para a resposta de Claude
PREFILL = "<individuals>"

# Imprime a resposta do Claude
# print("TURNO DO USUÁRIO (contendo os exemplos e o novo texto):")
# print(PROMPT) # Lembre-se de incluir o texto completo dos exemplos aqui
# print("\nTURNO DO ASSISTENTE (pré-preenchido):")
# print(PREFILL)
# print("\nResposta do Claude (para o último texto):")
# print(get_completion(PROMPT, prefill=PREFILL))
```
