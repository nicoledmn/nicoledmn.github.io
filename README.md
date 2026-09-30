# Site Acadêmico — Nicole De Mori Nicolini

Website acadêmico e portfólio de pesquisa de **Nicole De Mori Nicolini**, arquiteta e urbanista (UFES), mestranda no PPGAU/UFES (Grupo TIP) e Conselheira Estadual do IAB-ES.

Estruturado para condensar suas credenciais acadêmicas na página inicial e fornecer seções dedicadas e evidentes para artigos e análises produzidos em sala de aula ao longo do mestrado.

---

## 📁 Estrutura de Arquivos

```
nicole-nicolini-site/
├── index.html        # Página principal: Perfil acadêmico condensado e vitrine dos módulos de aula
├── artigos.html      # Página dedicada a Artigos Científicos e Papers de disciplinas
├── analises.html     # Página dedicada a Análises Críticas, Estudos de Caso e Exercícios
├── style.css         # Estilos globais, tipografia arquitetônica, grid e temas (Light/Dark)
├── main.js           # Alternância de tema, menu responsivo e interações
└── README.md         # Documentação do projeto
```

---

## ✏️ Como Adicionar Novos Artigos ou Análises

Cada página secundária (`artigos.html` e `analises.html`) já possui slots visuais formatados. Para adicionar uma nova produção:

1. Abra o arquivo `artigos.html` ou `analises.html` no seu editor.
2. Localize um dos blocos `<article class="article-card placeholder-card">` ou `<div class="analysis-card placeholder-card">`.
3. Substitua o texto do título, resumo e adicione o link do PDF (se tiver um arquivo PDF, basta salvá-lo na pasta e linkar `<a href="meu-artigo.pdf">`).
4. Salve e envie a alteração para o GitHub!

---

## 🎨 Principais Recursos

- **Perfil Condensado:** Primeira página enxuta, focada diretamente no Mestrado (IR-BIM + LLM), Graduação (TCC Dom João Batista), Laboratório Grupo TIP e IAB-ES.
- **Espaços Evidentes para Produções de Aula:** Módulos destacados com badges indicando áreas reservadas para novas produções.
- **Tema Claro / Escuro:** Alternância fluida com persistência da preferência.
- **Publicado no GitHub Pages:** Acessível diretamente em [https://nicoledmn.github.io/](https://nicoledmn.github.io/).
