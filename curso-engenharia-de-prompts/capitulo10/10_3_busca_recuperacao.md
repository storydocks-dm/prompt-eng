# Apêndice C: Busca e Recuperação (Search & Retrieval)

- [Lição: O que é Busca e Recuperação Aumentada por Geração (RAG)?](#licao)
- [Recursos Adicionais](#recursos)
- [Exercício Conceitual](#exercicio)
- [Playground de Ideias](#playground)

## <a name="configuracao"></a>Configuração (Conceitual)

Embora este apêndice específico do notebook original não contenha código executável, uma implementação típica de RAG em Python com Claude envolveria a configuração usual:

> **Nota:** Para implementar um sistema RAG, você normalmente precisaria:
> 1.  Configurar sua chave de API da Anthropic.
> 2.  Usar a função `get_completion` (ou chamadas diretas à API `client.messages.create`) dos capítulos anteriores.
> 3.  Instalar e usar bibliotecas para busca e recuperação, como:
>     *   `numpy` para cálculos numéricos.
>     *   `sklearn` (scikit-learn) para vetorização de texto (ex: `TfidfVectorizer`) e cálculo de similaridade (ex: `cosine_similarity`).
>     *   Clientes para bancos de dados vetoriais (ex: Pinecone, Weaviate, FAISS) se estiver usando embeddings para busca semântica.
>     *   Bibliotecas para criar embeddings (ex: sentence-transformers, ou a própria API de embeddings da Anthropic, se disponível e aplicável para seu modelo de embedding).

```python
# Exemplo conceitual de importações que poderiam ser usadas em um script RAG:
import re
import anthropic
# import numpy as np # Para operações vetoriais
# from sklearn.feature_extraction.text import TfidfVectorizer # Para busca baseada em TF-IDF
# from sklearn.metrics.pairwise import cosine_similarity # Para calcular similaridade
# import pinecone # Exemplo de cliente de banco de dados vetorial

# Configuração do cliente Anthropic (como nos capítulos anteriores)
# API_KEY = "sua_chave_api_aqui"
# client = anthropic.Anthropic(api_key=API_KEY)

# def get_completion(messages, system_prompt="", model_name="claude-3-haiku-20240307"): # Model pode variar
#     # Adapte a função get_completion conforme necessário.
#     # Para RAG, você passaria o contexto recuperado junto com a pergunta do usuário.
#     message_request = {
#         "model": model_name,
#         "max_tokens": 2000,
#         "temperature": 0.0, # Baixa temperatura para respostas factuais baseadas em contexto
#         "messages": messages
#     }
#     if system_prompt:
#         message_request["system"] = system_prompt

#     response_message = client.messages.create(**message_request)
#     if response_message.content and isinstance(response_message.content[0], anthropic.types.TextBlock):
#         return response_message.content[0].text
#     return ""
```

---

## <a name="licao"></a>Lição: O que é Busca e Recuperação Aumentada por Geração (RAG)?

Modelos de Linguagem Grandes (LLMs) como o Claude possuem um vasto conhecimento adquirido durante o treinamento, mas esse conhecimento é estático (fixo no tempo do treinamento) e não inclui informações privadas ou proprietárias, nem eventos ocorridos após o corte de treinamento do modelo. Para superar essas limitações e tornar as respostas dos LLMs mais precisas, relevantes e baseadas em fatos específicos ou dados atualizados, utilizamos técnicas de **Busca e Recuperação (Search and Retrieval)**, mais comumente implementadas através de um padrão chamado **Recuperação Aumentada por Geração (Retrieval Augmented Generation - RAG)**.

**O que é RAG?**

RAG é um processo que permite a um LLM acessar e utilizar informações de fontes de dados externas ao seu modelo de treinamento para gerar respostas. Em vez de depender apenas do seu conhecimento interno, o modelo tem sua capacidade "aumentada" por informações relevantes recuperadas em tempo real de um corpus de documentos específico (como sua base de conhecimento, documentos internos, artigos da Wikipedia, etc.).

**Por que usar RAG?**

*   **Aterramento (Grounding) em Fatos:** Fornece a Claude dados factuais e específicos de um domínio para basear suas respostas, tornando-as mais precisas e confiáveis.
*   **Redução de Alucinações:** Ao basear as respostas em informações recuperadas e instruir o modelo a usar *apenas* essa informação, o RAG diminui significativamente a probabilidade de o LLM inventar fatos (alucinar).
*   **Informações Atualizadas:** Permite que Claude acesse e utilize dados mais recentes do que seu corte de treinamento, respondendo a perguntas sobre eventos recentes ou informações dinâmicas.
*   **Conhecimento Específico de Domínio/Privado:** Possibilita o uso de documentos internos, bases de conhecimento proprietárias, manuais técnicos, ou qualquer coleção de textos que não faziam parte dos dados de treinamento do LLM.

**Fluxo Típico de Trabalho RAG:**

1.  **Consulta do Usuário (User Query):** O usuário faz uma pergunta ou envia uma instrução.
2.  **Etapa de Recuperação (Retrieval):**
    *   A consulta do usuário é usada para buscar informações relevantes em um conjunto de documentos (corpus).
    *   Isso geralmente envolve converter a consulta do usuário em um vetor de embedding (uma representação numérica do significado do texto) e usar esse vetor para encontrar documentos (ou trechos de documentos) com embeddings semanticamente similares em um **banco de dados vetorial**.
    *   Alternativamente, para conjuntos de dados menores ou casos de uso mais simples, a recuperação pode ser baseada em palavras-chave (como a busca TF-IDF ou BM25).
3.  **Aumento do Prompt (Augmentation):** Os trechos de texto mais relevantes recuperados na etapa anterior (o "contexto") são combinados com a consulta original do usuário para formar um prompt mais rico e contextualizado.
4.  **Etapa de Geração (Generation):** Este prompt aumentado é então enviado ao LLM (Claude), com instruções claras para formular uma resposta baseada *apenas* no contexto fornecido (os documentos recuperados).
5.  **Resposta ao Usuário:** O LLM gera uma resposta que idealmente sintetiza as informações dos documentos recuperados para atender à consulta do usuário de forma precisa e contextualizada.

**Componentes Comuns (em alto nível):**

*   **Corpus de Documentos:** Sua coleção de dados (arquivos de texto, PDFs, HTML, entradas de banco de dados, etc.), frequentemente dividida em pedaços (chunks) menores.
*   **Mecanismo de Indexação e Busca:**
    *   **Modelos de Embedding:** Usados para converter texto (tanto os chunks dos documentos do corpus quanto as consultas do usuário) em representações vetoriais numéricas.
    *   **Bancos de Dados Vetoriais:** Armazenam esses embeddings de documentos e permitem buscas rápidas por similaridade semântica.
    *   Algoritmos de busca mais simples (ex: TF-IDF, BM25) para busca por palavras-chave, que podem ser usados sozinhos ou em combinação com busca vetorial (busca híbrida).
*   **Modelo de Linguagem Grande (LLM):** Como o Claude, para entender o prompt aumentado e gerar a resposta final.

O notebook original menciona:
> Você sabia que pode usar Claude para **pesquisar na Wikipedia para você**? Claude pode encontrar e recuperar artigos, momento em que você também pode usar Claude para resumi-los e sintetizá-los, escrever novo conteúdo a partir do que encontrou e muito mais. E não apenas a Wikipedia! Você também pode pesquisar em seus próprios documentos, sejam eles armazenados como texto simples ou incorporados em um datastore vetorial.

Este apêndice serve como um ponto de partida para explorar esses conceitos mais a fundo através dos recursos recomendados.

---
## <a name="recursos"></a>Recursos Adicionais

Para aprender como implementar RAG e complementar o conhecimento de Claude para melhorar a precisão e relevância de suas respostas com dados recuperados:

*   Veja nossos [exemplos de cookbook RAG da Anthropic](https://github.com/anthropics/anthropic-cookbook/blob/main/third_party/Wikipedia/wikipedia-search-cookbook.ipynb) (em inglês) para implementações práticas, incluindo busca na Wikipedia e uso de bancos de dados vetoriais.
*   Aprenda sobre como usar certos [embeddings](https://docs.anthropic.com/claude/docs/embeddings) (em inglês) e ferramentas de banco de dados vetoriais.
*   Se você está interessado em aprender sobre arquiteturas RAG avançadas usando Claude, confira nossos [slides da apresentação técnica do Claude 3 sobre arquiteturas RAG](https://docs.google.com/presentation/d/1zxkSI7lLUBrZycA-_znwqu8DDyVhHLkQGScvzaZrUns/edit#slide=id.g2c736259dac_63_782) (em inglês).

---
## <a name="exercicio"></a>Exercício Conceitual: Implementando um Fluxo RAG Básico

Dado o foco deste apêndice em direcionar para recursos externos, o exercício aqui é mais conceitual e de planejamento:

1.  **Escolha uma pequena coleção de documentos:** Podem ser alguns parágrafos de texto sobre um tópico de seu interesse (ex: a história de uma invenção, regras de um jogo, descrição de um produto, alguns e-mails de exemplo).
2.  **Formule uma Pergunta:** Crie uma pergunta cuja resposta esteja contida nesses documentos, mas que Claude provavelmente não saberia sem eles.
3.  **Simule a Recuperação (Manualmente ou com Código Simples):**
    *   Manualmente, identifique o(s) trecho(s) mais relevante(s) de seus documentos que respondem à pergunta. Copie e cole esses trechos.
    *   (Opcional Avançado): Se você estiver familiarizado com Python e bibliotecas como `scikit-learn`, tente implementar uma busca por similaridade de cosseno baseada em TF-IDF para automatizar essa etapa para seus documentos. Isso envolveria:
        *   Criar um vetorizador TF-IDF a partir de seus documentos.
        *   Transformar sua pergunta usando o mesmo vetorizador.
        *   Calcular a similaridade de cosseno entre o vetor da pergunta e os vetores dos documentos.
        *   Selecionar o(s) documento(s) com maior similaridade.
4.  **Aumente o Prompt:** Construa um prompt para Claude que inclua:
    *   Sua pergunta original.
    *   Os trechos relevantes que você recuperou, claramente delimitados (ex: usando tags `<documento_relevante>...</documento_relevante>` ou `<contexto_fornecido>...</contexto_fornecido>`).
    *   Uma instrução clara para Claude responder à pergunta usando *exclusivamente* as informações dos trechos fornecidos e, se a informação não estiver lá, para indicar isso (ex: "Com base apenas no texto fornecido... Se a resposta não estiver no texto, diga 'Não consigo encontrar a resposta no texto fornecido.'").
5.  **Gere e Avalie:** Envie o prompt para Claude (usando a função `get_completion` dos capítulos anteriores) e avalie a qualidade da resposta em termos de relevância, precisão e fidelidade aos documentos fornecidos.

Este exercício ajudará você a entender o fluxo fundamental do RAG. Para implementações mais robustas e escaláveis, explore os cookbooks e a documentação da Anthropic sobre embeddings e bancos de dados vetoriais.

---
## <a name="playground"></a>Playground de Ideias

Use este espaço para refletir sobre como você poderia aplicar o RAG em seus próprios projetos ou áreas de interesse:

*   **Fontes de Dados:** Quais fontes de dados você gostaria que Claude acessasse? (Ex: documentação interna da sua empresa, seus e-mails para um assistente pessoal, artigos de notícias recentes sobre um tópico específico, manuais de produtos, regulamentos legais).
*   **Perguntas dos Usuários:** Que tipo de perguntas os usuários fariam que exigiriam essas informações externas?
*   **Estratégia de Recuperação:** Como você poderia estruturar um sistema de recuperação para esses dados?
    *   Busca por palavras-chave seria suficiente?
    *   Seria necessário usar embeddings para busca por significado semântico?
    *   Uma combinação de ambas (busca híbrida) seria melhor?
*   **Construção do Prompt:** Como você instruiria Claude a usar os resultados da pesquisa para responder às perguntas de forma útil, factual e concisa? Como você lidaria com casos em que a informação recuperada não é suficiente ou é contraditória?
*   **Interface com o Usuário:** Como você apresentaria as respostas aos usuários? Mostraria as fontes recuperadas?

Experimentar com os cookbooks fornecidos pela Anthropic é um ótimo próximo passo prático para transformar essas ideias em realidade.
