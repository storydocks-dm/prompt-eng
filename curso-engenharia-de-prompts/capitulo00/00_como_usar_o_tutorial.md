# Capítulo 00: Como Usar Este Tutorial

Bem-vindo ao Curso Completo de Engenharia de Prompts com Claude! Este capítulo introdutório é o seu ponto de partida, fornecendo orientações essenciais sobre como configurar seu ambiente (especialmente se você planeja executar os exemplos de código) e dicas para navegar pelo material do curso. Vamos preparar tudo para que você possa aproveitar ao máximo as lições e exercícios à frente.

Este tutorial **requer uma chave de API** para interação com os modelos Claude. Se você não possui uma chave de API da Anthropic, pode se inscrever para obter uma através do [Console da Anthropic](https://console.anthropic.com/). Se preferir não usar uma API por enquanto, você ainda pode aprender muito com os conceitos e exemplos, ou visualizar nosso [gabarito estático do tutorial](https://docs.google.com/spreadsheets/u/0/d/1jIxjzUWG-6xBVIa2ay6yDpLyeuOh_hR_ZB75a47KX_E/edit) (em inglês) que mostra exemplos de saídas.

## Como começar

1.  **Clone o Repositório (Se Aplicável):** Se você estiver visualizando este curso como parte de um repositório de código (por exemplo, no GitHub), clone-o para sua máquina local para ter acesso a todos os arquivos e exemplos.
    ```bash
    # Exemplo de comando para clonar, substitua pela URL correta do repositório
    # git clone https://github.com/seu-usuario/curso-engenharia-de-prompts.git
    ```

2.  **Instale as Dependências:** A principal dependência para interagir com Claude via código Python é a biblioteca `anthropic`.
    > **Nota:** O comando abaixo é uma forma de instalar bibliotecas Python em ambientes baseados em Jupyter Notebook. Se você estiver configurando um ambiente Python localmente e desejar executar os exemplos de código, utilize o gerenciador de pacotes `pip` diretamente no seu terminal (preferencialmente dentro de um ambiente virtual):
    > ```bash
    > pip install anthropic
    > ```
    No contexto de um Jupyter Notebook, você poderia executar:
    ```python
    # !pip install anthropic
    ```
    *(Nota: Descomente a linha acima em um notebook se precisar instalar a biblioteca.)*

3.  **Configure sua Chave de API e Nome do Modelo:** Para executar os exemplos de código que fazem chamadas para a API da Anthropic, você precisará da sua chave de API.
    > **Nota:** O bloco de código Python abaixo demonstra como as variáveis `API_KEY` e `MODEL_NAME` seriam tipicamente definidas em um ambiente Jupyter Notebook, incluindo o uso de comandos `%store` que são específicos do IPython para persistir variáveis entre sessões.
    >
    > **Para uso fora do Jupyter Notebook (por exemplo, em scripts Python locais):**
    > 1.  **NÃO** use os comandos `%store`.
    > 2.  Defina sua `API_KEY` diretamente no código (substituindo `"sua_chave_api_aqui"`) ou, de forma mais segura, carregue-a de uma variável de ambiente do seu sistema (ex: `API_KEY = os.environ.get("ANTHROPIC_API_KEY")`, após importar o módulo `os`) ou de um arquivo `.env` usando uma biblioteca como `python-dotenv`.
    > 3.  A variável `MODEL_NAME` pode ser definida diretamente como mostrado.
    >
    > Independentemente do seu ambiente, lembre-se de substituir `"sua_chave_api_aqui"` pela sua chave de API real da Anthropic.

    ```python
    # Substitua "sua_chave_api_aqui" pela sua chave de API real.
    API_KEY = "sua_chave_api_aqui"

    # Modelo sugerido para este curso.
    # Claude 3 Haiku é rápido e capaz, ideal para aprendizado e muitos casos de uso.
    MODEL_NAME = "claude-3-haiku-20240307"

    # Os comandos %store abaixo são específicos para Jupyter Notebooks (IPython)
    # e servem para armazenar estas variáveis para uso em outros notebooks da sessão.
    # Se não estiver usando Jupyter, você pode ignorar ou remover estas linhas.
    # Em um script Python normal, API_KEY e MODEL_NAME definidas acima estarão disponíveis.
    # %store API_KEY
    # %store MODEL_NAME
    ```
    *(Nota: Descomente as linhas `%store` em um notebook se desejar usar essa funcionalidade.)*

4.  **Siga as Instruções e Exemplos:** Prossiga pelos capítulos, leia as explicações e, se desejar, execute os exemplos de código fornecidos. Adapte-os conforme necessário para seu ambiente.

---

## Notas de Uso e Dicas 💡

-   **Modelo Utilizado:** Este curso utiliza primariamente o `claude-3-haiku-20240307` com `temperature` (temperatura) definida como `0.0` para a maioria dos exemplos. Falaremos mais sobre temperatura posteriormente no curso. Por enquanto, basta entender que essas configurações produzem resultados mais consistentes e determinísticos. Todas as técnicas de engenharia de prompt neste curso também se aplicam a outros modelos Claude, incluindo Sonnet e Opus, bem como modelos legados da geração anterior (Claude 2, Claude Instant 1.2), embora os resultados exatos possam variar.
-   **Execução de Código em Markdown:** Os blocos de código Python neste tutorial em Markdown são apresentados para ilustração. Para executá-los, você precisará copiá-los para um ambiente Python funcional (como um script local, um IDE Python ou um Jupyter Notebook) que tenha a biblioteca `anthropic` instalada e a `API_KEY` configurada.
-   **Navegação:** Ao chegar ao final de uma página do tutorial, navegue para o próximo arquivo numerado na pasta do capítulo ou para a próxima pasta de capítulo, conforme indicado na [Estrutura do Curso no README principal](../README.md).

### O SDK da Anthropic e a API Messages

Utilizaremos o [SDK Python da Anthropic](https://docs.anthropic.com/claude/reference/client-sdks) e a [API Messages](https://docs.anthropic.com/claude/reference/messages_post) ao longo deste tutorial.

Para interagir com a API, primeiro inicializamos o cliente Anthropic com sua chave de API. Certifique-se de que a variável `API_KEY` foi definida com sua chave conforme instruído anteriormente.

```python
import anthropic

# Inicialize o cliente Anthropic uma vez em seu script ou notebook.
# Certifique-se que API_KEY está definida com sua chave.
# Exemplo: client = anthropic.Anthropic(api_key="sua_chave_api_aqui")
# Ou, se API_KEY foi definida anteriormente:
# client = anthropic.Anthropic(api_key=API_KEY)
```
*(Nota: Se estiver executando os exemplos, certifique-se de que a linha `client = anthropic.Anthropic(api_key=API_KEY)` seja executada após a definição de `API_KEY` e antes de chamar `get_completion`.)*

Abaixo está a função auxiliar `get_completion` que usaremos em muitos exemplos. Ela envia um prompt para o Claude (usando o `MODEL_NAME` que você configurou) e retorna a resposta gerada. Entenderemos mais sobre os parâmetros como `max_tokens` e `temperature` em capítulos posteriores.

```python
# Supondo que 'client' e 'MODEL_NAME' já foram definidos conforme acima.
def get_completion(user_prompt: str): # Renomeado 'prompt' para 'user_prompt' para clareza
    # Certifique-se que MODEL_NAME está definido.
    message = client.messages.create(
        model=MODEL_NAME,
        max_tokens=2000, # Define o limite máximo de tokens para a resposta
        temperature=0.0,  # Define a temperatura como 0.0 para resultados mais determinísticos
        messages=[
          {"role": "user", "content": user_prompt} # A mensagem do usuário para Claude
        ]
    )
    return message.content[0].text # Retorna o conteúdo de texto da resposta de Claude
```

Agora vamos escrever um prompt de exemplo para o Claude e imprimir a saída executando nossa função auxiliar `get_completion`. Se você configurou seu ambiente e a `API_KEY`, pode adaptar e executar este tipo de bloco de código.

Sinta-se à vontade para brincar com a string do prompt para obter diferentes respostas do Claude.
```python
# Exemplo de uso da função get_completion
# Certifique-se de que 'client', 'API_KEY' e 'MODEL_NAME' estão configurados
# e que a função get_completion está definida.

# prompt_exemplo = "Olá, Claude!"
# resposta = get_completion(prompt_exemplo)
# print(resposta)
```

As variáveis `API_KEY` e `MODEL_NAME` definidas anteriormente (ou carregadas de forma segura) serão usadas ao longo do tutorial. Apenas certifique-se de que elas, e o objeto `client`, estejam acessíveis para as funções que os utilizam.

---

Com essas orientações e configurações iniciais, você está pronto para começar sua jornada na engenharia de prompts com Claude! Este capítulo cobriu como obter sua chave de API, instalar as bibliotecas necessárias e entender a estrutura básica dos exemplos de código. Lembre-se de adaptar os exemplos de configuração de chaves e execução de código ao seu ambiente específico.

No próximo capítulo, mergulharemos nos fundamentos da estrutura de um prompt. Avance para aprender como começar a instruir Claude de forma eficaz!
