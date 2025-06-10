# Capítulo 07: Usando Exemplos (Few-Shot Prompting)

Bem-vindo ao Capítulo 7! Uma das maneiras mais intuitivas e poderosas de ensinar Claude a realizar tarefas complexas ou a responder em formatos específicos é através de exemplos. Esta técnica, conhecida como "few-shot prompting", envolve fornecer a Claude alguns exemplos de pares de entrada/saída antes de apresentar a consulta real. Neste capítulo, exploraremos como estruturar esses exemplos para guiar o comportamento do modelo de forma eficaz, especialmente para tarefas que são difíceis de descrever apenas com instruções.

- [Lição](#licao)
- [Exercícios](#exercicios)
- [Playground de Exemplos](#playground-de-exemplos)

## <a name="configuracao"></a>Configuração

Execute a célula de configuração a seguir para carregar sua chave de API e estabelecer a função auxiliar `get_completion`.

> **Nota:** O comando `!pip install anthropic` é para instalar a biblioteca em ambientes Jupyter. Os comandos `%store -r API_KEY` e `%store -r MODEL_NAME` são específicos do IPython. Em um script Python padrão, defina `API_KEY` e `MODEL_NAME` diretamente. A função `get_completion` utilizada neste capítulo é a mesma dos Capítulos 5 e 6, que sempre inclui um turno de `assistant` com o conteúdo de `prefill` (mesmo que vazio), para permitir que Claude continue a partir de um ponto específico se desejado.

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
        # para sinalizar a Claude que ele deve completar a partir dali, seguindo o padrão dos notebooks originais para estes capítulos.
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
        return response_message.content[0].text
    except Exception as e:
        print(f"Erro ao chamar a API da Anthropic: {e}")
        return f"Erro na API: {e}"
```
*(Os exemplos de código subsequentes assumirão que `client` e `MODEL_NAME` foram devidamente configurados e que `get_completion` está definida como acima).*

---

## <a name="licao"></a>Lição

**Fornecer a Claude exemplos de como você quer que ele se comporte (ou como você não quer que ele se comporte) é extremamente eficaz** para:
- Obter a resposta correta para uma tarefa.
- Conseguir que a resposta seja formatada de uma maneira específica.
- Guiar o modelo em tarefas com nuances ou quando as instruções são complexas para descrever abstratamente.

Esse tipo de prompt é chamado de "**few-shot prompting**" (prompt com poucos exemplos). Você também pode encontrar as frases "**zero-shot**" (sem exemplos), "**one-shot**" (um exemplo) ou "**n-shot**" (n exemplos). O número de "shots" (disparos/tentativas/exemplos) refere-se a quantos exemplos de pares entrada/saída são fornecidos dentro do prompt para condicionar o modelo antes de apresentar a nova consulta.

- **Zero-shot prompting:** Você pede ao modelo para fazer algo sem fornecer nenhum exemplo prévio de como fazer. A maioria dos exemplos nos capítulos anteriores foram zero-shot. O modelo tenta responder com base em seu treinamento geral e na instrução fornecida.
- **Few-shot prompting:** Você fornece ao modelo alguns exemplos (os "shots") de como executar a tarefa antes de pedir que ele a execute em uma nova entrada. Cada exemplo tipicamente consiste em uma entrada de exemplo e a saída desejada correspondente. Isso é particularmente útil para tarefas que exigem um formato de saída específico, um estilo particular, ou a tomada de decisões complexas e com nuances onde a simples instrução pode ser ambígua. Os exemplos ajudam a "calibrar" o modelo para a sua necessidade específica, mostrando o padrão que você espera.

Os exemplos devem demonstrar o comportamento desejado para a tarefa específica, ilustrando o tipo de entrada que você fornecerá e o tipo de saída que espera em troca.

### Exemplos

Finja que você é um desenvolvedor tentando construir um "bot para pais" que responde a perguntas de crianças. **A resposta padrão de Claude (zero-shot) é bastante formal e robótica**, o que pode não ser o ideal para o público infantil.

> **Nota:** Este exemplo mostra a resposta padrão de Claude (zero-shot) a uma pergunta infantil, que pode ser inadequada em tom. (Lembre-se de ter `API_KEY` e `MODEL_NAME` configurados e `client` inicializado para executar.)
```python
# Prompt
# PROMPT_PAI1 = "O Papai Noel vai me trazer presentes no Natal?"
# Original: "Will Santa bring me presents on Christmas?"

# Imprime a resposta do Claude
# print(get_completion(PROMPT_PAI1))
```

Você poderia levar tempo para descrever o tom desejado em detalhes (Capítulo 2), ou atribuir um papel (Capítulo 3), mas muitas vezes é muito mais fácil e eficaz simplesmente **dar a Claude alguns exemplos de respostas ideais (few-shot prompting)**.

> **Nota:** Aqui, usamos few-shot prompting. Fornecemos um exemplo de pergunta e resposta (P: Pergunta sobre a Fada do Dente, R: Resposta carinhosa) para ensinar a Claude o tom desejado antes de fazer a pergunta sobre o Papai Noel. O modelo aprende o padrão de interação a partir do exemplo. O `PROMPT_PAI2` contém tanto os exemplos quanto a nova pergunta.
```python
# Prompt com exemplo few-shot
PROMPT_PAI2 = """Por favor, complete a conversa escrevendo a próxima linha, falando como "R".

P: A fada do dente é real?
R: Claro, meu bem. Embrulhe seu dente e coloque-o debaixo do travesseiro esta noite. Pode haver algo esperando por você pela manhã.

P: O Papai Noel vai me trazer presentes no Natal?"""
# Original: """Please complete the conversation by writing the next line, speaking as "A".
# Q: Is the tooth fairy real?
# A: Of course, sweetie. Wrap up your tooth and put it under your pillow tonight. There might be something waiting for you in the morning.
# Q: Will Santa bring me presents on Christmas?"""


# Imprime a resposta do Claude. Claude deve continuar a partir do "P: O Papai Noel..."
# Para guiar Claude a responder como "R:", poderíamos usar prefill="R: "
# print(get_completion(PROMPT_PAI2, prefill="R: "))
```

No exemplo de formatação a seguir, poderíamos guiar Claude passo a passo através de um conjunto de instruções de formatação sobre como extrair nomes e profissões e depois formatá-los exatamente da maneira que queremos. No entanto, uma alternativa eficaz é **fornecer a Claude alguns exemplos formatados corretamente, e Claude pode extrapolar o padrão a partir daí**. Observe o uso de `PREFILL = "<individuals>"` no código Python: isso inicia a resposta de Claude para o *último* bloco de texto com a tag de abertura correta, ajudando-o a seguir o formato demonstrado nos exemplos anteriores.

Este é um exemplo de "few-shot prompting" onde os "shots" (exemplos) são blocos de texto e suas extrações formatadas correspondentes. Claude aprende o padrão de extração e formatação a partir dos exemplos fornecidos.

> **Nota:** Este exemplo demonstra como usar few-shot prompting para ensinar a Claude um formato de extração específico. Dois exemplos completos de texto e a extração formatada correspondente são fornecidos no prompt antes do texto final que Claude deve processar. O `PREFILL` ajuda a iniciar a última extração no formato correto.
```python
# Prompt template com múltiplos exemplos (shots)
PROMPT_EXTRACAO = """[PRIMEIRO EXEMPLO DE TEXTO LONGO E SUA EXTRAÇÃO FORMATADA, COMO NO NOTEBOOK ORIGINAL]
<individuals>
1. Dr. Liam Patel [NEUROCIRURGIÃO]
2. Olivia Chen [ARQUITETA]
3. Ethan Kovacs [MÚSICO E COMPOSITOR]
4. Isabella Torres [CHEF]
</individuals>

[SEGUNDO EXEMPLO DE TEXTO LONGO E SUA EXTRAÇÃO FORMATADA, COMO NO NOTEBOOK ORIGINAL]
<individuals>
1. Oliver Hamilton [CHEF]
2. Elizabeth Chen [BIBLIOTECÁRIA]
3. Isabella Torres [ARTISTA]
4. Marcus Jenkins [TREINADOR]
</individuals>

[TERCEIRO TEXTO (O QUE CLAUDE DEVE PROCESSAR AGORA), COMO NO NOTEBOOK ORIGINAL]
Oak Valley, uma charmosa cidade pequena, é o lar de um trio notável de indivíduos cujas habilidades e dedicação deixaram um impacto duradouro na comunidade.
No movimentado mercado de agricultores da cidade, você encontrará Laura Simmons, uma apaixonada agricultora orgânica conhecida por seus produtos deliciosos e cultivados de forma sustentável. Sua dedicação em promover uma alimentação saudável inspirou a cidade a adotar um estilo de vida mais consciente ecologicamente.
No centro comunitário de Oak Valley, Kevin Alvarez, um habilidoso instrutor de dança, trouxe a alegria do movimento para pessoas de todas as idades. Suas aulas de dança inclusivas fomentaram um senso de unidade e autoexpressão entre os residentes, enriquecendo a cena artística local.
Por último, Rachel O'Connor, uma voluntária incansável, dedica seu tempo a várias iniciativas de caridade. Seu compromisso em melhorar a vida dos outros tem sido fundamental na criação de um forte senso de comunidade em Oak Valley.
Através de seus talentos únicos e dedicação inabalável, Laura, Kevin e Rachel se entrelaçaram no tecido de Oak Valley, ajudando a criar uma cidade pequena vibrante e próspera."""
# Nota: Os textos originais em inglês foram traduzidos nos exemplos do notebook.
# Para este Markdown, os textos longos dos exemplos foram substituídos por placeholders "[...]"
# para manter a legibilidade. O PROMPT_EXTRACAO completo conteria os textos na íntegra.

# Prefill para a resposta de Claude, para guiar o início da extração do último bloco de texto
PREFILL_EXTRACAO = "<individuals>"

# Imprime a resposta do Claude
# print("--------------------------- Prompt completo com exemplos (few-shot) ---------------------------")
# print("TURNO DO USUÁRIO (contendo os exemplos e o novo texto a ser processado):")
# print(PROMPT_EXTRACAO) # Idealmente, este prompt conteria os textos completos.
# print("\nTURNO DO ASSISTENTE (pré-preenchido):")
# print(PREFILL_EXTRACAO)
# print("\n------------------------------------- Resposta do Claude (para o último texto) ------------------------------------")
# # A resposta de get_completion será o que Claude gera APÓS o prefill.
# print(PREFILL_EXTRACAO + get_completion(PROMPT_EXTRACAO, prefill=PREFILL_EXTRACAO))
```

Se você gostaria de experimentar os prompts da lição sem alterar nenhum conteúdo acima, role até o final do notebook da lição para visitar o [**Playground de Exemplos**](#playground-de-exemplos).

---

## <a name="exercicios"></a>Exercícios
- [Exercício 7.1 - Formatação de Email via Exemplos](#exercicio-71---formatacao-de-email-via-exemplos)

### <a name="exercicio-71---formatacao-de-email-via-exemplos"></a>Exercício 7.1 - Formatação de Email via Exemplos
Vamos refazer o Exercício 6.2 (classificação de emails e formatação da saída), mas desta vez, vamos editar o `PROMPT` para usar exemplos "few-shot" de emails + classificação e formatação adequadas para fazer Claude produzir a resposta correta. Queremos que a saída de Claude para o email a ser classificado seja **exatamente** a letra da categoria, envolta em tags `<answer>`.

Lembre-se de que estas são as categorias para os emails:
- (A) Pergunta de pré-venda
- (B) Item quebrado ou com defeito
- (C) Dúvida sobre cobrança
- (D) Outro (explique, por favor)

> **Nota do Exercício:** O objetivo é usar a técnica de few-shot prompting para ensinar Claude a classificar emails e formatar a saída como `<answer>LETRA_DA_CATEGORIA</answer>`. Você precisará construir o `PROMPT_FEW_SHOT_BASE` para incluir exemplos de emails e suas respectivas saídas formatadas corretamente, antes de apresentar o email final que Claude deve classificar (usando a variável `{email}`). O `PREFILL` ajudará a iniciar a resposta de Claude no formato correto. A função de avaliação original do notebook (não incluída aqui) verificaria se a resposta de Claude era exatamente no formato `<answer>X</answer>`, onde X é a letra da categoria correta.
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
PREFILL_EX7_1 = "<answer>"

# Emails de teste do notebook original
EMAILS_TESTE_EX7_1 = [
    "Hi -- My Mixmaster4000 is producing a strange noise when I operate it. It also smells a bit smoky and plasticky, like burning electronics.  I need a replacement.", # Esperado: <answer>B</answer>
    "Can I use my Mixmaster 4000 to mix paint, or is it only meant for mixing food?", # Esperado: <answer>A</answer> ou <answer>D</answer>
    "I HAVE BEEN WAITING 4 MONTHS FOR MY MONTHLY CHARGES TO END AFTER CANCELLING!!  WTF IS GOING ON???", # Esperado: <answer>C</answer>
    "How did I get here I am not good with computer.  Halp." # Esperado: <answer>D</answer>
]
# Respostas corretas correspondentes (apenas a letra) para fins de validação conceitual
# RESPOSTAS_CORRETAS_TESTE_EX7_1 = [["B"], ["A", "D"], ["C"], ["D"]]

# Exemplo com o primeiro email de teste:
# email_atual_para_teste_ex7_1 = EMAILS_TESTE_EX7_1[0]
# formatted_prompt_ex7_1 = PROMPT_FEW_SHOT_BASE.format(email=email_atual_para_teste_ex7_1)

# # Lógica de avaliação (conceitual):
# # A resposta completa do assistente seria PREFILL_EX7_1 + o que get_completion retorna.
# # response_content_ex7_1 = get_completion(formatted_prompt_ex7_1, prefill=PREFILL_EX7_1)
# # full_assistant_response_ex7_1 = PREFILL_EX7_1 + response_content_ex7_1
# # grade_ex7_1 = full_assistant_response_ex7_1.strip() == f"<answer>{RESPOSTAS_CORRETAS_TESTE_EX7_1[0][0]}</answer>"

# # print("Prompt enviado (com exemplos few-shot):")
# # print(formatted_prompt_ex7_1)
# # print("\nPrefill do Assistente:\n" + PREFILL_EX7_1)
# # print("\nResposta do Claude (completa, com prefill):")
# # print(full_assistant_response_ex7_1)
# # print("\nExercício resolvido corretamente (para este exemplo):", grade_ex7_1)

# Para testar em Markdown (você pode iterar manualmente pelos EMAILS_TESTE_EX7_1):
# print("Prompt formatado com exemplos few-shot (para o primeiro email de teste):")
# print(formatted_prompt_ex7_1)
# print("\nPrefill do Assistente:\n" + PREFILL_EX7_1)
# print("\nResposta do Claude (gerada após o preenchimento):")
# print(PREFILL_EX7_1 + get_completion(formatted_prompt_ex7_1, prefill=PREFILL_EX7_1))
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
(Nota: Esta solução original estrutura os exemplos como turnos de diálogo `Human`/`Assistant`. Para usar com nossa função `get_completion` atual, você adaptaria isso para um único prompt de usuário, como no `PROMPT_FEW_SHOT_BASE`, e usaria o `PREFILL = "<answer>"` para o email final.)

### Parabéns!

Se você resolveu todos os exercícios até este ponto, está pronto para passar para o próximo capítulo. Bom trabalho com os prompts!

---

## <a name="playground-de-exemplos"></a>Playground de Exemplos

Esta é uma área para você experimentar livremente com os exemplos de prompt mostrados nesta lição e ajustar os prompts para ver como isso pode afetar as respostas do Claude. Lembre-se de que para executar os blocos de código Python, você precisará ter configurado sua `API_KEY`, o nome do modelo (`MODEL_NAME`) e inicializado o `client` da Anthropic, conforme mostrado na seção de [Configuração](#configuracao).

> **Playground:** Resposta padrão (zero-shot) de Claude a uma pergunta infantil.
```python
# Prompt
# PROMPT_PG1 = "O Papai Noel vai me trazer presentes no Natal?"

# Imprime a resposta do Claude
# print(get_completion(PROMPT_PG1))
```

> **Playground:** Usando few-shot prompting para ensinar o tom de "bot para pais".
```python
# Prompt com exemplo few-shot
# PROMPT_PG2 = """Por favor, complete a conversa escrevendo a próxima linha, falando como "R".
#
# P: A fada do dente é real?
# R: Claro, meu bem. Embrulhe seu dente e coloque-o debaixo do travesseiro esta noite. Pode haver algo esperando por você pela manhã.
#
# P: O Papai Noel vai me trazer presentes no Natal?"""

# Imprime a resposta do Claude (experimente com prefill="R: ")
# print(get_completion(PROMPT_PG2, prefill="R: "))
```

> **Playground:** Usando few-shot prompting para extração e formatação de informações. Tente adicionar um quarto bloco de texto com novos indivíduos e veja se Claude segue o padrão.
```python
# Prompt template com múltiplos exemplos (shots) - use o PROMPT_EXTRACAO da lição,
# certificando-se de que os textos completos dos exemplos estão incluídos.
# PROMPT_PG_EXTRACAO = """[TEXTO COMPLETO DO EXEMPLO 1 COM SUA EXTRAÇÃO]
#
# [TEXTO COMPLETO DO EXEMPLO 2 COM SUA EXTRAÇÃO]
#
# [SEU NOVO TEXTO AQUI PARA CLAUDE PROCESSAR]"""

# Prefill para a resposta de Claude
# PREFILL_PG_EXTRACAO = "<individuals>"

# Imprime a resposta do Claude
# print("TURNO DO USUÁRIO (Playground - Extração):")
# print(PROMPT_PG_EXTRACAO)
# print("\nTURNO DO ASSISTENTE (Playground - pré-preenchido):")
# print(PREFILL_PG_EXTRACAO)
# print("\nResposta do Claude (Playground - para o seu novo texto):")
# print(PREFILL_PG_EXTRACAO + get_completion(PROMPT_PG_EXTRACAO, prefill=PREFILL_PG_EXTRACAO))
```
---
O "few-shot prompting" é uma técnica fundamental que aproveita a capacidade dos LLMs de aprender padrões a partir de exemplos. Ao fornecer alguns "shots" (exemplos) de alta qualidade de interações entrada/saída, você pode guiar Claude a realizar tarefas complexas, aderir a formatos específicos e responder com o tom ou estilo desejado, muitas vezes com mais eficácia do que apenas com instruções diretas. Esta abordagem é particularmente útil quando a tarefa é difícil de descrever verbalmente, mas fácil de demonstrar.

No próximo capítulo, abordaremos um tópico importante: como minimizar a chance de Claude produzir "alucinações" ou informações factualmente incorretas.
