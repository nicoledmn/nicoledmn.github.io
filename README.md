# Site Pessoal & Acadêmico — Nicole De Mori Nicolini

Website acadêmico e portfólio profissional de **Nicole De Mori Nicolini**, arquiteta e urbanista (UFES), mestranda no PPGAU/UFES (Grupo TIP) e Conselheira Estadual do IAB-ES.

Este projeto foi construído com HTML5 semântico, CSS3 moderno (com suporte a tema claro e escuro) e JavaScript puro, sem dependências externas pesadas, pronto para publicação instantânea e gratuita no **GitHub Pages**.

---

## 📁 Estrutura de Arquivos

```
nicole-nicolini-site/
├── index.html        # Estrutura e conteúdo da página
├── style.css         # Estilos, tipografia, grid arquitetônico e temas (Light/Dark)
├── main.js           # Alternância de tema, menu responsivo e interações
└── README.md         # Instruções de publicação no GitHub Pages
```

---

## 🚀 Como Publicar Gratuitamente no GitHub Pages

Você pode publicar o seu site em menos de 5 minutos, escolhendo uma das duas opções abaixo:

### Opção 1: Diretamente pelo Navegador (Mais Rápida e Fácil)

1. **Acesse o GitHub:**
   - Faça login na sua conta em [github.com](https://github.com).
2. **Crie um novo repositório:**
   - Clique no botão verde **"New"** (ou acesse [github.com/new](https://github.com/new)).
   - **Nome do repositório:**
     - Se quiser que seu site seja o endereço principal: dê o nome de `<seu-usuario>.github.io` (ex: `nicole-nicolini.github.io`).
     - Ou dê qualquer outro nome, como `nicole-site` ou `portfolio`.
   - Marque o repositório como **Public** (Público).
   - Clique em **"Create repository"**.
3. **Envie os arquivos:**
   - Na página do repositório recém-criado, clique em **"uploading an existing file"** (ou "Add file" > "Upload files").
   - Arraste os arquivos da pasta:
     - `index.html`
     - `style.css`
     - `main.js`
     - `README.md`
   - Clique em **"Commit changes"**.
4. **Ative o GitHub Pages:**
   - No topo do repositório, clique na aba **Settings** (Configurações).
   - No menu lateral esquerdo, clique em **Pages**.
   - Em **"Build and deployment" > "Branch"**, selecione a branch `main` (ou `master`) e a pasta `/(root)`.
   - Clique em **Save**.
5. **Pronto! 🎉**
   - Em cerca de 1 a 2 minutos, o GitHub exibirá o link público do seu site (ex: `https://<seu-usuario>.github.io/nicole-site/`).

---

### Opção 2: Pelo Terminal (Git CLI)

Se você utiliza o Git na sua máquina:

```bash
# 1. Navegue até a pasta do projeto
cd C:\Users\nicol\.gemini\antigravity\scratch\nicole-nicolini-site

# 2. Inicialize o repositório Git
git init
git add .
git commit -m "feat: site acadêmico e profissional de Nicole De Mori Nicolini"

# 3. Conecte ao seu repositório remoto criado no GitHub
git branch -M main
git remote add origin https://github.com/<seu-usuario>/<nome-do-repositorio>.git
git push -u origin main
```

Depois, acesse **Settings > Pages** no GitHub para garantir que a branch `main` está configurada como fonte de publicação.

---

## 🎨 Recursos do Site

- **Design Arquitetônico:** Estética minimalista e elegante inspirada no design editorial e arquitetônico (tipografia Cormorant Garamond + Plus Jakarta Sans).
- **Tema Claro / Escuro:** Botão de alternância com salvamento automático da preferência no navegador (`localStorage`).
- **Totalmente Responsivo:** Adaptado para telas mobile, tablets e desktops.
- **Seções Dedicadas:**
  - **Hero:** Destaque para o projeto de dissertação no PPGAU.
  - **Sobre:** Apresentação profissional e institucional.
  - **Pesquisa & Formação:** Linha do tempo com o Mestrado (BIM + LLM + CAAD) e a Graduação (TCC em Habitação Social / Dom João Batista).
  - **Grupo TIP:** Vinculação com o laboratório de pesquisa do DAU/UFES e links oficiais.
  - **IAB-ES & CAU:** Atuação como Conselheira Estadual e prática profissional.
  - **Contato:** Informações institucionais e botão interativo de cópia de e-mail.

---

## ✏️ Personalização Rápida

Caso queira ajustar suas informações depois:
- **E-mail:** Abra o arquivo `index.html` e procure por `nicole.nicolini@ufes.br` para alterar para o seu e-mail preferido.
- **Links Sociais:** Adicione links para seu LinkedIn, Lattes ou portfólio na seção de contato.
