# Site Acadêmico — Nicole De Mori Nicolini

Website acadêmico e portfólio de pesquisa de **Nicole De Mori Nicolini**, arquiteta e urbanista (UFES), mestranda no PPGAU/UFES (Grupo TIP) e Conselheira Estadual do IAB-ES.

Estruturado para condensar suas credenciais acadêmicas na página inicial e fornecer seções dedicadas e evidentes para artigos e análises produzidos em sala de aula ao longo do mestrado.

---

## 📁 Estrutura de Arquivos

```
nicole-nicolini-site/
├── index.html               # Página principal: Perfil acadêmico condensado
├── tutores-inteligentes.html# Fichamentos e reflexões da disciplina Tutores Inteligentes (PPGI/UFES)
├── artigos.html             # Artigos científicos e papers de disciplinas
├── analises.html            # Análises críticas e exercícios
├── style.css                # Estilos globais e componentes do chatbot
├── main.js                  # Alternância de tema, menu e scripts base
├── chatbot.js               # Widget de chatbot flutuante presente em todas as páginas
├── chatbot_app.py           # Aplicativo Python integrado ao LM Studio (CLI e Servidor API)
└── README.md                # Documentação do projeto
```

---

## 🤖 Como Usar o Chatbot com LM Studio

O site inclui um assistente virtual flutuante disponível em **todas as páginas**. Ele pode se conectar ao seu servidor local do **LM Studio**:

### 1. Iniciar o LM Studio
1. Abra o **LM Studio** no seu computador.
2. Carregue um modelo LLM de sua preferência (ex: Mistral, Llama 3, Qwen, Gemma, etc.).
3. Vá na aba **Local Server** (ícone `<->`) e clique em **Start Server** na porta padrão `1234`.

### 2. Executar o Chatbot em Python
Você pode executar o chatbot de duas formas:

- **Modo Servidor / Ponte Web (recomendado para conectar ao site):**
  ```powershell
  python chatbot_app.py
  ```
  Isso inicia o servidor na porta `8000` (http://localhost:8000/). O widget do site em `nicoledmn.github.io` ou localmente se comunicará diretamente com esta ponte, que formatará o prompt acadêmico e consultará o LM Studio com suporte a CORS!

- **Modo Linha de Comando (Terminal CLI):**
  ```powershell
  python chatbot_app.py --cli
  ```
  Converse diretamente com o assistente acadêmico pelo terminal.

### 3. Funcionamento no GitHub Pages
Quando visitantes externos acessam `https://nicoledmn.github.io/`, se eles não estiverem rodando o LM Studio localmente, o widget detecta isso e ativa automaticamente o **Modo Autônomo com Base de Conhecimento Acadêmica**, respondendo perguntas sobre sua dissertação, o Grupo TIP, a fundamentação de Bryan Lawson e os fichamentos de Tutores Inteligentes sem quebrar.

---

## 🎨 Principais Recursos

- **Chatbot Flutuante Global:** Presente no canto inferior direito em todas as páginas, integrado ao LM Studio com fallback inteligente.
- **Perfil Condensado:** Primeira página enxuta, focada diretamente no Mestrado (IR-BIM + LLM), Graduação (TCC Dom João Batista), Laboratório Grupo TIP e IAB-ES.
- **Páginas de Disciplinas:** Registro transparente de estudos em sala de aula (ex: Tutores Inteligentes no PPGI).
- **Tema Claro / Escuro:** Alternância fluida com persistência da preferência.
- **Publicado no GitHub Pages:** Acessível diretamente em [https://nicoledmn.github.io/](https://nicoledmn.github.io/).
