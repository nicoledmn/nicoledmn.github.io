/**
 * Assistente Virtual Acadêmico — Nicole De Mori Nicolini
 * Widget de Chatbot Flutuante Global (Integrado a LM Studio / Python Bridge)
 */

(function () {
  'use strict';

  // Configuração padrão de endpoints
  const DEFAULT_CONFIG = {
    pythonApiUrl: 'http://localhost:8000/api/chat',
    lmStudioDirectUrl: 'http://127.0.0.1:1234/v1/chat/completions',
    activeMode: 'auto', // 'auto', 'python', 'lm_studio', 'demo'
  };

  // Base de conhecimento embutida para visitantes do GitHub Pages quando o servidor local não estiver rodando na máquina deles
  const KNOWLEDGE_BASE = {
    dissertacao: {
      keywords: ['mestrado', 'dissertação', 'dissertacao', 'pesquisa', 'tema', 'ir-bim', 'bim', 'llm', 'assistente', 'orientador', 'jarryer'],
      reply: 'A pesquisa de mestrado de Nicole no PPGAU/UFES intitula-se **"Desenvolvimento de um assistente para projetos de arquitetura articulando um framework IR-BIM e um modelo de linguagem em um fluxo de trabalho"**, sob orientação do Prof. Dr. Jarryer Andrade de Martino no Grupo TIP.'
    },
    laboratorio: {
      keywords: ['tip', 'laboratório', 'laboratorio', 'grupo tip', 'dau', 'pesquisa do grupo'],
      reply: 'O **Grupo TIP (Tecnologias Integradas ao Projeto)** do DAU/UFES pesquisa como as tecnologias digitais integram o processo projetual em CAAD. Suas áreas de ponta abrangem: sistemas generativos, projeto computacional, prototipagem rápida, fabricação digital, sistemas bioinspirados e realidades virtuais. Saiba mais em: http://tip.ufes.br/'
    },
    lawson: {
      keywords: ['lawson', 'bryan lawson', 'síntese', 'sintese', 'avaliação', 'avaliacao', 'análise', 'analise', 'pernicioso', 'wicked'],
      reply: 'Com base em Bryan Lawson (2011, *Como Arquitetos e Designers Pensam*), Nicole fundamenta que a IA **não deve atuar nas etapas de síntese (criação) nem de avaliação**, pois o projeto arquitetônico é um *problema pernicioso (wicked problem)* com variáveis contextuais e humanas irredutíveis à matemática. O assistente computacional deve atuar especificamente na etapa de **análise**, extraindo padrões e organizando informações dos modelos BIM.'
    },
    fichamentos: {
      keywords: ['fichamento', 'mycin', 'neomycin', 'bradac', 'bradáč', 'tutores', 'ppgi', 'moodle', 'fuzzy', 'guidon'],
      reply: 'Na disciplina de Tutores Inteligentes (PPGI/UFES), Nicole realizou 3 fichamentos principais:\\n- **Bradáč et al. (2022):** ITS no Moodle com lógica fuzzy e modelo VARK.\\n- **MYCIN (Van Melle, 1978):** regras, fatores de certeza probabilísticos e explicabilidade (HOW/WHY).\\n- **NEOMYCIN (Clancey & Letsinger, 1981):** regras estratégicas e modelagem cognitiva.\\nConfira os resumos completos na aba **Tutores Inteligentes** no menu!'
    },
    graduacao: {
      keywords: ['graduação', 'graduacao', 'tcc', 'dom joão batista', 'dom joao', 'habitabilidade', 'autoconstrução', 'autoconstrucao'],
      reply: 'O projeto de graduação (TCC) de Nicole na UFES foi: **"Avaliação de Habitações em Dom João Batista, Vila Velha - ES, e proposição de estratégias para a melhoria da habitabilidade nas autoconstruções"**.'
    },
    institucional: {
      keywords: ['iab', 'iab-es', 'conselheira', 'cau', 'trabalho', 'profissional'],
      reply: 'Nicole é **Conselheira Estadual do IAB-ES (Instituto de Arquitetos do Brasil - Departamento do Espírito Santo)** na gestão atual iniciada no fim de 2025, além de arquiteta e urbanista com registro ativo no CAU.'
    }
  };

  function getFallbackAnswer(question) {
    const q = question.toLowerCase();
    for (const key in KNOWLEDGE_BASE) {
      const item = KNOWLEDGE_BASE[key];
      if (item.keywords.some(kw => q.includes(kw))) {
        return item.reply;
      }
    }
    return 'Olá! Sou o assistente acadêmico virtual de Nicole Nicolini. Posso responder sobre a pesquisa de mestrado dela (IR-BIM + LLM no PPGAU/UFES), o Grupo TIP, sua atuação como Conselheira no IAB-ES e os artigos estudados na disciplina de Tutores Inteligentes (PPGI). Como posso ajudar?';
  }

  // Criação dos elementos visuais do Chatbot
  function injectChatbotWidget() {
    if (document.getElementById('academic-chatbot-container')) return;

    const container = document.createElement('div');
    container.id = 'academic-chatbot-container';
    container.innerHTML = `
      <!-- Botão Lançador Flutuante -->
      <button id="chatbot-launcher-btn" class="chatbot-launcher" aria-label="Abrir assistente virtual acadêmico" title="Assistente Acadêmico IA">
        <div class="launcher-pulse"></div>
        <svg class="chat-icon-open" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          <circle cx="9" cy="10" r="1" fill="currentColor"></circle>
          <circle cx="12" cy="10" r="1" fill="currentColor"></circle>
          <circle cx="15" cy="10" r="1" fill="currentColor"></circle>
        </svg>
        <svg class="chat-icon-close" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none;">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <!-- Janela do Chatbot -->
      <div id="chatbot-window" class="chatbot-window" style="display: none;" role="dialog" aria-labelledby="chatbot-title">
        <!-- Topo da Janela -->
        <div class="chatbot-header">
          <div class="chatbot-avatar-info">
            <div class="chatbot-avatar">N</div>
            <div class="chatbot-info-text">
              <h3 id="chatbot-title" class="chatbot-name">Assistente Nicole Nicolini</h3>
              <p class="chatbot-sub"><span id="chatbot-status-indicator" class="status-dot"></span> <span id="chatbot-status-text">Assistente Acadêmico</span></p>
            </div>
          </div>
          <div class="chatbot-header-actions">
            <button id="chatbot-settings-toggle" class="header-icon-btn" title="Configurar conexão LM Studio" aria-label="Configurar conexão">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            </button>
            <button id="chatbot-close-btn" class="header-icon-btn" title="Minimizar chat" aria-label="Fechar janela">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>

        <!-- Painel de Configurações (oculto por padrão) -->
        <div id="chatbot-settings-panel" class="chatbot-settings-panel" style="display: none;">
          <h4>Configurações de Conexão</h4>
          <p class="settings-desc">Conecta o widget ao seu servidor local do LM Studio ou à ponte em Python.</p>
          <label>URL da Ponte Python (ou LM Studio):</label>
          <input type="text" id="cfg-server-url" value="${DEFAULT_CONFIG.pythonApiUrl}" placeholder="http://localhost:8000/api/chat" />
          <div class="settings-actions">
            <button id="cfg-test-btn" class="btn-sm">Testar Conexão</button>
            <button id="cfg-save-btn" class="btn-sm btn-primary">Salvar</button>
          </div>
          <p id="cfg-status-msg" class="cfg-status-msg"></p>
        </div>

        <!-- Mensagens do Chat -->
        <div class="chatbot-messages" id="chatbot-messages">
          <div class="chat-bubble bot-bubble">
            <p>Olá! Sou o assistente acadêmico virtual de <strong>Nicole De Mori Nicolini</strong>. Pergunte-me sobre sua pesquisa de mestrado (IR-BIM + LLM), o Grupo TIP, sua atuação no IAB-ES ou os artigos estudados na disciplina de Tutores Inteligentes.</p>
          </div>

          <!-- Sugestões de Perguntas Rápidas -->
          <div class="quick-prompts" id="quick-prompts">
            <button class="prompt-chip" data-query="Qual é o tema da sua dissertação de mestrado?">Dissertação de mestrado</button>
            <button class="prompt-chip" data-query="O que pesquisa o Grupo TIP da Ufes?">Grupo TIP (UFES)</button>
            <button class="prompt-chip" data-query="Por que a IA não deve fazer a síntese do projeto segundo Lawson?">IA e Bryan Lawson</button>
            <button class="prompt-chip" data-query="Quais artigos foram estudados em Tutores Inteligentes?">Fichamentos do PPGI</button>
          </div>
        </div>

        <!-- Área de Entrada de Texto -->
        <form class="chatbot-input-area" id="chatbot-form">
          <textarea id="chatbot-input" placeholder="Digite sua pergunta..." rows="1" required></textarea>
          <button type="submit" id="chatbot-send-btn" aria-label="Enviar mensagem">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    `;

    document.body.appendChild(container);
    initChatbotEvents();
  }

  function initChatbotEvents() {
    const launcherBtn = document.getElementById('chatbot-launcher-btn');
    const chatWindow = document.getElementById('chatbot-window');
    const closeBtn = document.getElementById('chatbot-close-btn');
    const openIcon = launcherBtn.querySelector('.chat-icon-open');
    const closeIcon = launcherBtn.querySelector('.chat-icon-close');
    const form = document.getElementById('chatbot-form');
    const input = document.getElementById('chatbot-input');
    const messagesContainer = document.getElementById('chatbot-messages');
    const statusText = document.getElementById('chatbot-status-text');
    const statusDot = document.getElementById('chatbot-status-indicator');
    const settingsToggle = document.getElementById('chatbot-settings-toggle');
    const settingsPanel = document.getElementById('chatbot-settings-panel');
    const cfgServerUrl = document.getElementById('cfg-server-url');
    const cfgTestBtn = document.getElementById('cfg-test-btn');
    const cfgSaveBtn = document.getElementById('cfg-save-btn');
    const cfgStatusMsg = document.getElementById('cfg-status-msg');

    const chatHistory = [];
    let savedApiUrl = localStorage.getItem('nicole_chat_api_url') || DEFAULT_CONFIG.pythonApiUrl;
    cfgServerUrl.value = savedApiUrl;

    // Alternar visibilidade da janela
    function toggleChat() {
      const isVisible = chatWindow.style.display !== 'none';
      if (isVisible) {
        chatWindow.style.display = 'none';
        openIcon.style.display = 'block';
        closeIcon.style.display = 'none';
      } else {
        chatWindow.style.display = 'flex';
        openIcon.style.display = 'none';
        closeIcon.style.display = 'block';
        input.focus();
        checkBackendStatus();
      }
    }

    launcherBtn.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);

    // Alternar painel de configurações
    settingsToggle.addEventListener('click', () => {
      const isVisible = settingsPanel.style.display !== 'none';
      settingsPanel.style.display = isVisible ? 'none' : 'block';
    });

    cfgSaveBtn.addEventListener('click', () => {
      savedApiUrl = cfgServerUrl.value.trim() || DEFAULT_CONFIG.pythonApiUrl;
      localStorage.setItem('nicole_chat_api_url', savedApiUrl);
      cfgStatusMsg.textContent = 'Salvo com sucesso!';
      cfgStatusMsg.className = 'cfg-status-msg success';
      setTimeout(() => { settingsPanel.style.display = 'none'; cfgStatusMsg.textContent = ''; }, 1200);
      checkBackendStatus();
    });

    // Testar conexão
    cfgTestBtn.addEventListener('click', async () => {
      cfgStatusMsg.textContent = 'Testando conexão...';
      cfgStatusMsg.className = 'cfg-status-msg';
      const targetUrl = cfgServerUrl.value.trim();
      try {
        const testUrl = targetUrl.replace(/\/chat$/, '/status');
        const res = await fetch(testUrl, { method: 'GET', signal: AbortSignal.timeout(3000) });
        if (res.ok) {
          const data = await res.json();
          cfgStatusMsg.textContent = data.lm_studio_connected ? 'Conectado ao LM Studio!' : 'Ponte ativa (LM Studio offline)';
          cfgStatusMsg.className = 'cfg-status-msg success';
        } else {
          cfgStatusMsg.textContent = 'Servidor respondeu com status ' + res.status;
          cfgStatusMsg.className = 'cfg-status-msg warning';
        }
      } catch (e) {
        cfgStatusMsg.textContent = 'Falha ao conectar no servidor local. Modo autônomo ativado.';
        cfgStatusMsg.className = 'cfg-status-msg warning';
      }
    });

    // Verificar se o servidor Python ou LM Studio está respondendo
    async function checkBackendStatus() {
      try {
        const testUrl = savedApiUrl.replace(/\/chat$/, '/status');
        const res = await fetch(testUrl, { method: 'GET', signal: AbortSignal.timeout(2000) });
        if (res.ok) {
          const data = await res.json();
          if (data.lm_studio_connected) {
            statusDot.className = 'status-dot online';
            statusText.textContent = 'LM Studio Conectado';
            return;
          }
        }
      } catch (err) {
        // Modo fallback
      }
      statusDot.className = 'status-dot demo';
      statusText.textContent = 'Assistente Acadêmico (Web)';
    }

    // Auto-expandir textarea
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        form.dispatchEvent(new Event('submit'));
      }
    });

    // Chips de perguntas rápidas
    document.querySelectorAll('.prompt-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const q = chip.getAttribute('data-query');
        if (q) {
          input.value = q;
          form.dispatchEvent(new Event('submit'));
        }
      });
    });

    // Renderizar mensagem no chat
    function appendMessage(text, sender, note = null) {
      const bubble = document.createElement('div');
      bubble.className = `chat-bubble ${sender}-bubble`;

      // Formatação básica de negrito e links
      let formatted = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>')
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');

      bubble.innerHTML = `<p>${formatted}</p>`;

      if (note) {
        const noteEl = document.createElement('span');
        noteEl.className = 'bubble-note';
        noteEl.textContent = note;
        bubble.appendChild(noteEl);
      }

      messagesContainer.appendChild(bubble);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      return bubble;
    }

    // Enviar mensagem
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const userText = input.value.trim();
      if (!userText) return;

      input.value = '';
      input.style.height = 'auto';

      // Esconde os chips após primeira pergunta
      const chips = document.getElementById('quick-prompts');
      if (chips) chips.style.display = 'none';

      appendMessage(userText, 'user');
      chatHistory.push({ role: 'user', content: userText });

      // Bolha de carregamento
      const loadingBubble = document.createElement('div');
      loadingBubble.className = 'chat-bubble bot-bubble loading-bubble';
      loadingBubble.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
      messagesContainer.appendChild(loadingBubble);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      let answer = '';
      let sourceNote = null;

      try {
        // Tenta enviar para o servidor Python / LM Studio
        const response = await fetch(savedApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userText, history: chatHistory }),
          signal: AbortSignal.timeout(15000)
        });

        if (response.ok) {
          const data = await response.json();
          answer = data.reply || 'Não foi possível obter resposta.';
          if (data.source === 'lm_studio') {
            sourceNote = 'Gerado via LM Studio Local';
          }
        } else {
          throw new Error('Servidor retornou status ' + response.status);
        }
      } catch (err) {
        // Fallback autônomo com base de conhecimento completa de Nicole
        answer = getFallbackAnswer(userText);
        sourceNote = 'Base de Conhecimento Acadêmica';
      } finally {
        loadingBubble.remove();
        appendMessage(answer, 'bot', sourceNote);
        chatHistory.push({ role: 'assistant', content: answer });
      }
    });

    // Checagem inicial
    checkBackendStatus();
  }

  // Inicialização quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectChatbotWidget);
  } else {
    injectChatbotWidget();
  }
})();
