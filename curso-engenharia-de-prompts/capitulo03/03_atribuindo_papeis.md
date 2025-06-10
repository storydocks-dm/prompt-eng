# Capítulo 03: Atribuindo Papéis (Role Prompting)

Bem-vindo ao Capítulo 3! Uma técnica poderosa para influenciar o comportamento de Claude é a "atribuição de papéis" (role prompting). Ao designar um papel ou persona para Claude (como "Você é um pirata" ou "Aja como um chef renomado"), você pode moldar significativamente o tom, o estilo, o tipo de linguagem e até mesmo a maneira como ele aborda uma tarefa. Este capítulo mostrará como usar essa técnica, seja através do prompt de sistema ou da mensagem do usuário, para obter respostas mais personalizadas e eficazes.

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

def get_completion(prompt_do_usuario: str, system_prompt=""): # Renomeado 'prompt' para maior clareza
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

Continuando no tema de que o Claude não tem contexto além do que você diz, às vezes é importante **instruir o Claude a assumir um papel específico (incluindo todo o contexto necessário)**. Isso também é conhecido como "role prompting" (atribuição de papéis ou designação de persona). Quanto mais detalhado for o contexto do papel (incluindo a persona, o público-alvo e o objetivo), melhor.

**Preparar o Claude com um papel (ou persona) pode melhorar seu desempenho** em diversas áreas, desde escrita e codificação até resumo e resposta a perguntas. É como os humanos às vezes são ajudados quando lhes dizem para "pensar como um(a) ______" (por exemplo, "pense como um cientista," "pense como um professor de jardim de infância"). A atribuição de papéis também pode mudar o estilo, tom, nível de formalidade e maneira da resposta do Claude.

**Nota Importante:** A atribuição de papéis pode ocorrer de duas formas principais:
1.  **No Prompt de Sistema (System Prompt):** Esta é geralmente a maneira preferida e mais robusta de definir um papel, especialmente se você deseja que Claude mantenha essa persona por toda a conversa. O prompt de sistema é projetado para fornecer instruções de alto nível e contexto que guiam o comportamento do modelo.
2.  **Na Mensagem do Usuário (User Prompt):** Você também pode incluir a instrução de papel diretamente na mensagem do usuário. Isso pode ser útil para atribuições de papel mais pontuais ou que mudam dinamicamente durante uma conversa.

### Exemplos

No exemplo abaixo, vemos que sem a atribuição de papéis, Claude fornece uma **resposta direta e não estilizada** quando solicitado a dar uma perspectiva de uma frase sobre o skate.

No entanto, quando preparamos Claude para assumir o papel de um gato (usando o prompt de sistema), a perspectiva de Claude muda e, assim, **o tom, estilo e conteúdo da resposta de Claude se adaptam ao novo papel**.

**Dica:** Uma técnica bônus que você pode usar é **fornecer a Claude contexto sobre seu público-alvo**. Por exemplo, "Você é um gato" produz uma resposta bem diferente de "Você é um gato falando para uma multidão de skatistas sobre os perigos das rodinhas."

Aqui está o prompt sem atribuição de papéis no prompt de sistema:

> **Nota:** Este código pede a opinião de Claude sobre skate, sem um papel específico atribuído. (Lembre-se de ter `API_KEY` e `MODEL_NAME` configurados e `client` inicializado para executar.)
```python
# Prompt
# PROMPT_SKATE1 = "Em uma frase, o que você acha de andar de skate?"
# Original: "In one sentence, what do you think about skateboarding?"

# Imprime a resposta do Claude
# print(get_completion(PROMPT_SKATE1))
```

Aqui está a mesma pergunta do usuário, exceto com atribuição de papéis via prompt de sistema.

> **Nota:** Aqui, Claude recebe o papel de "gato" através do prompt de sistema, o que deve alterar sua resposta.
```python
# System prompt (Prompt de Sistema)
# SYSTEM_PROMPT_GATO = "Você é um gato." # Original: "You are a cat."

# Prompt (Prompt do Usuário)
# PROMPT_SKATE2 = "Em uma frase, o que você acha de andar de skate?"

# Imprime a resposta do Claude
# print(get_completion(PROMPT_SKATE2, system_prompt=SYSTEM_PROMPT_GATO))
```

Você pode usar a atribuição de papéis como uma forma de fazer Claude emular certos estilos de escrita, falar com uma certa voz ou guiar a complexidade de suas respostas. **A atribuição de papéis também pode tornar Claude melhor na execução de tarefas matemáticas ou lógicas.**

Por exemplo, no enigma de lógica abaixo, há uma resposta correta definitiva (Sim, uma pessoa casada está olhando para uma pessoa não casada, independentemente do estado civil de Anne). Sem uma instrução de papel específica, Claude pode hesitar ou errar.

> **Nota:** Este é um problema de lógica onde Claude, sem um papel específico, pode não chegar à conclusão correta ou pode expressar incerteza desnecessária.
```python
# Prompt
# PROMPT_LOGICA1 = "Jack está olhando para Anne. Anne está olhando para George. Jack é casado, George não é, e não sabemos se Anne é casada. Uma pessoa casada está olhando para uma pessoa não casada?"
# Original: "Jack is looking at Anne. Anne is looking at George. Jack is married, George is not, and we don’t know if Anne is married. Is a married person looking at an unmarried person?"

# Imprime a resposta do Claude
# print(get_completion(PROMPT_LOGICA1))
```

Agora, e se **prepararmos Claude para agir como um bot de lógica**? Como isso mudará a resposta de Claude?

Acontece que, com essa nova atribuição de papel, Claude geralmente acerta o problema de lógica ou, pelo menos, aborda-o de forma mais sistemática, focando nos aspectos lógicos para chegar à conclusão correta.

> **Nota:** Atribuir o papel de "bot de lógica" ajuda Claude a focar nos aspectos lógicos do problema e a resolver o enigma corretamente.
```python
# System prompt (Prompt de Sistema)
# SYSTEM_PROMPT_LOGICA = "Você é um bot de lógica projetado para responder a problemas lógicos complexos de forma precisa e passo a passo."
# Original: "You are a logic bot designed to answer complex logic problems."


# Prompt (Prompt do Usuário)
# PROMPT_LOGICA2 = "Jack está olhando para Anne. Anne está olhando para George. Jack é casado, George não é, e não sabemos se Anne é casada. Uma pessoa casada está olhando para uma pessoa não casada?"

# Imprime a resposta do Claude
# print(get_completion(PROMPT_LOGICA2, system_prompt=SYSTEM_PROMPT_LOGICA))
```

**Nota:** O que você aprenderá ao longo deste curso é que existem **muitas técnicas de engenharia de prompt que você pode usar para obter resultados semelhantes**. Quais técnicas você usa depende de você e de sua preferência! Incentivamos você a **experimentar para encontrar seu próprio estilo de engenharia de prompt**.

Se você gostaria de experimentar os prompts da lição sem alterar nenhum conteúdo acima, role até o final do notebook da lição para visitar o [**Playground de Exemplos**](#playground-de-exemplos).

---

## <a name="exercicios"></a>Exercícios
- [Exercício 3.1 - Correção Matemática](#exercicio-31---correcao-matematica)

### <a name="exercicio-31---correcao-matematica"></a>Exercício 3.1 - Correção Matemática
Em alguns casos, **Claude pode ter dificuldades com matemática**, mesmo matemática simples. Abaixo, Claude é apresentado a uma equação resolvida incorretamente. Sem uma orientação de papel específica, ele pode não identificar o erro ou pode concordar com a solução errada.

Modifique o `PROMPT` do usuário e/ou o `SYSTEM_PROMPT` para fazer Claude atuar como um avaliador matemático rigoroso e identificar que a solução está `incorreta`, explicando o erro.

> **Nota do Exercício:** O objetivo é fazer Claude identificar corretamente um erro em uma simples equação algébrica (2x - 3 = 9 deveria levar a 2x = 12, não 2x = 6) e classificar a solução como "incorreta". Você pode modificar `PROMPT_EX3_1` ou `SYSTEM_PROMPT_EX3_1`. A função de avaliação original (não incluída aqui) verificaria se a resposta continha palavras como "incorreto" ou "não correto".
```python
# System prompt - se você não quiser usar um prompt de sistema, pode deixar esta variável definida como uma string vazia
SYSTEM_PROMPT_EX3_1 = "[Substitua este texto ou deixe em branco. Considere dar a Claude um papel como 'Você é um professor de matemática extremamente rigoroso e seu objetivo é encontrar erros em soluções matemáticas.' ou 'Aja como um verificador de fatos matemáticos detalhista e cético.']"

# Prompt do Usuário
PROMPT_EX3_1 = """A equação abaixo está resolvida corretamente? Analise cada passo.

Equação e Solução Proposta:
2x - 3 = 9
2x = 6  // Potencial erro aqui: 9 + 3 = 12, não 6.
x = 3   // Consequência do erro anterior.
"""

# Para este tutorial em Markdown, você pode tentar:
# response = get_completion(PROMPT_EX3_1, system_prompt=SYSTEM_PROMPT_EX3_1)
# print(response)
# E verificar se Claude identifica o erro e classifica a solução como incorreta, explicando o porquê.

# # Código original do exercício:
# # response = get_completion(PROMPT_EX3_1, system_prompt=SYSTEM_PROMPT_EX3_1)
# # def grade_exercise_3_1(text):
# #     if "incorrect" in text.lower() or "not correct" in text.lower() or "incorreta" in text.lower():
# #         return True
# #     else:
# #         return False
# # print(response)
# # print("\n--------------------------- AVALIAÇÃO ---------------------------")
# # print("Este exercício foi resolvido corretamente:", grade_exercise_3_1(response))
```

❓ Se você quiser uma dica:
> **Dica (Exercício 3.1):** A dica original é: "Tente atribuir a Claude o papel de um professor de matemática ou um especialista em matemática. Você também pode considerar dizer a Claude para prestar muita atenção a cada etapa e verificar a aritmética."

### Parabéns!

Se você resolveu todos os exercícios até este ponto, está pronto para passar para o próximo capítulo. Bom trabalho com os prompts!

---

## <a name="playground-de-exemplos"></a>Playground de Exemplos

Esta é uma área para você experimentar livremente com os exemplos de prompt mostrados nesta lição e ajustar os prompts para ver como isso pode afetar as respostas do Claude. Lembre-se de que para executar os blocos de código Python, você precisará ter configurado sua `API_KEY`, o nome do modelo (`MODEL_NAME`) e inicializado o `client` da Anthropic, conforme mostrado na seção de [Configuração](#configuracao).

> **Playground:** Peça a opinião de Claude sobre skate, sem um papel específico.
```python
# Prompt
# PROMPT_PG_SKATE1 = "Em uma frase, o que você acha de andar de skate?"

# Imprime a resposta do Claude
# print(get_completion(PROMPT_PG_SKATE1))
```

> **Playground:** Atribua a Claude o papel de "gato" e peça sua opinião sobre skate.
```python
# System prompt (Prompt de Sistema)
# SYSTEM_PROMPT_PG_GATO = "Você é um gato persa muito mimado e um pouco medroso."

# Prompt (Prompt do Usuário)
# PROMPT_PG_SKATE2 = "Em uma frase, o que você acha de andar de skate?"

# Imprime a resposta do Claude
# print(get_completion(PROMPT_PG_SKATE2, system_prompt=SYSTEM_PROMPT_PG_GATO))
```

> **Playground:** Problema de lógica sem atribuição de papel específica.
```python
# Prompt
# PROMPT_PG_LOGICA1 = "Jack está olhando para Anne. Anne está olhando para George. Jack é casado, George não é, e não sabemos se Anne é casada. Uma pessoa casada está olhando para uma pessoa não casada?"

# Imprime a resposta do Claude
# print(get_completion(PROMPT_PG_LOGICA1))
```

> **Playground:** Problema de lógica com Claude no papel de "bot de lógica".
```python
# System prompt (Prompt de Sistema)
# SYSTEM_PROMPT_PG_LOGICA = "Você é um bot de lógica extremamente preciso e que explica seu raciocínio passo a passo."

# Prompt (Prompt do Usuário)
# PROMPT_PG_LOGICA2 = "Jack está olhando para Anne. Anne está olhando para George. Jack é casado, George não é, e não sabemos se Anne é casada. Uma pessoa casada está olhando para uma pessoa não casada?"

# Imprime a resposta do Claude
# print(get_completion(PROMPT_PG_LOGICA2, system_prompt=SYSTEM_PROMPT_PG_LOGICA))
```
---
A atribuição de papéis é uma ferramenta versátil em sua caixa de ferramentas de engenharia de prompts. Como vimos, definir uma persona para Claude pode alterar drasticamente suas respostas, tornando-as mais adequadas ao seu contexto, seja para fins criativos, para melhorar a precisão em tarefas lógicas ou para simular interações específicas. Lembre-se que a especificidade do papel e do contexto que você fornece é crucial para o sucesso desta técnica.

No próximo capítulo, aprenderemos sobre a importância de separar claramente os dados das instruções em seus prompts, outra técnica essencial para criar interações robustas e previsíveis com Claude.
