/**
 * Assistente Virtual Acadêmico — Nicole De Mori Nicolini
 * Widget de Chatbot Flutuante Global com Avatar Personalizado,
 * Comando de Voz (Speech-to-Text) e Resposta por Voz (Text-to-Speech),
 * integrado ao LM Studio (Local Model Server) com fallback resiliente.
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
      reply: 'Na disciplina de Tutores Inteligentes (PPGI/UFES), Nicole realizou 3 fichamentos principais:\n- **Bradáč et al. (2022):** ITS no Moodle com lógica fuzzy e modelo VARK.\n- **MYCIN (Van Melle, 1978):** regras, fatores de certeza probabilísticos e explicabilidade (HOW/WHY).\n- **NEOMYCIN (Clancey & Letsinger, 1981):** regras estratégicas e modelagem cognitiva.\nConfira os resumos completos na aba **Tutores Inteligentes** no menu!'
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

  // Definição vetorial do Avatar do Assistente (Arquitetura + IA + Voz)
  const AVATAR_SVG = `
    <svg viewBox="0 0 120 120" class="chatbot-avatar-svg" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Avatar do Assistente Acadêmico">
      <defs>
        <linearGradient id="avBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="50%" stop-color="#1e293b" />
          <stop offset="100%" stop-color="#090d16" />
        </linearGradient>
        <linearGradient id="avBorder" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#38bdf8" />
          <stop offset="50%" stop-color="#6366f1" />
          <stop offset="100%" stop-color="#f59e0b" />
        </linearGradient>
        <linearGradient id="avSkin" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#fde68a" />
          <stop offset="100%" stop-color="#f59e0b" />
        </linearGradient>
        <linearGradient id="avHair" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#334155" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>
        <linearGradient id="avSuit" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e293b" />
          <stop offset="100%" stop-color="#090d16" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="58" fill="url(#avBg)" stroke="url(#avBorder)" stroke-width="2.5" />
      <g stroke="#38bdf8" stroke-width="0.8" fill="none" opacity="0.35">
        <polygon points="60,14 86,28 60,42 34,28" />
        <polyline points="34,28 34,56 60,70 86,56 86,28" />
        <line x1="60" y1="42" x2="60" y2="70" />
        <circle cx="34" cy="28" r="1.8" fill="#38bdf8" />
        <circle cx="86" cy="28" r="1.8" fill="#38bdf8" />
        <circle cx="60" cy="14" r="1.8" fill="#818cf8" />
        <circle cx="60" cy="42" r="1.8" fill="#f59e0b" />
      </g>
      <path d="M22,116 C24,96 40,86 52,84 L68,84 C80,86 96,96 98,116 Z" fill="url(#avSuit)" />
      <path d="M48,84 L60,102 L72,84 L65,84 L60,94 L55,84 Z" fill="#38bdf8" opacity="0.8" />
      <path d="M52,84 L60,100 L68,84" stroke="#60a5fa" stroke-width="1.2" fill="none" />
      <polygon points="56,84 64,84 60,93" fill="#e2e8f0" />
      <rect x="53" y="70" width="14" height="17" rx="3" fill="url(#avSkin)" />
      <path d="M53,74 C57,78 63,78 67,74 L67,70 L53,70 Z" fill="#d97706" opacity="0.3" />
      <ellipse cx="60" cy="56" rx="17" ry="20" fill="url(#avSkin)" />
      <circle cx="60" cy="30" r="12" fill="url(#avHair)" />
      <path d="M39,52 C39,36 47,28 60,28 C73,28 81,36 81,52 C81,58 79,64 77,66 C75,56 71,44 60,44 C49,44 45,56 43,66 C41,64 39,58 39,52 Z" fill="url(#avHair)" />
      <rect x="46" y="50" width="11" height="8" rx="2" fill="#0284c7" fill-opacity="0.15" stroke="#38bdf8" stroke-width="1.4" />
      <rect x="63" y="50" width="11" height="8" rx="2" fill="#0284c7" fill-opacity="0.15" stroke="#38bdf8" stroke-width="1.4" />
      <line x1="57" y1="53" x2="63" y2="53" stroke="#38bdf8" stroke-width="1.4" />
      <line x1="46" y1="53" x2="41" y2="51" stroke="#38bdf8" stroke-width="1.2" />
      <line x1="74" y1="53" x2="79" y2="51" stroke="#38bdf8" stroke-width="1.2" />
      <circle cx="51.5" cy="54" r="1.3" fill="#0f172a" />
      <circle cx="68.5" cy="54" r="1.3" fill="#0f172a" />
      <path d="M59.5,58 L60.5,62 L58.5,63" stroke="#b45309" stroke-width="0.9" fill="none" stroke-linecap="round" />
      <path d="M56,66.5 Q60,69 64,66.5" stroke="#b45309" stroke-width="1.1" fill="none" stroke-linecap="round" />
      <path d="M41,50 C40,42 43,36 49,32" stroke="#94a3b8" stroke-width="1.5" fill="none" stroke-linecap="round" />
      <circle cx="41" cy="52" r="3.5" fill="#1e293b" stroke="#38bdf8" stroke-width="1" />
      <path d="M41,54 Q44,64 53,65" stroke="#38bdf8" stroke-width="1.2" fill="none" stroke-linecap="round" />
      <circle cx="53" cy="65" r="1.6" fill="#38bdf8" class="headset-mic-glow" />
      <g stroke="#38bdf8" stroke-width="1" fill="none" opacity="0.85" stroke-linecap="round" class="avatar-sound-waves">
        <path d="M96,52 Q99,58 96,64" />
        <path d="M100,48 Q105,58 100,68" opacity="0.6" />
        <path d="M104,44 Q111,58 104,72" opacity="0.3" />
      </g>
    </svg>
  `;

  // Limpeza de texto Markdown para pronúncia limpa em português
  function cleanTextForSpeech(text) {
    if (!text) return '';
    return text
      .replace(/https?:\/\/[^\s]+/g, 'link informado na página')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/#+\s+/g, '')
      .replace(/^[•\-\*]\s+/gm, '')
      .replace(/\n+/g, '. ')
      .replace(/\s+/g, ' ')
      .replace(/IR-BIM/gi, 'I R BIM')
      .replace(/LLM's|LLMs|LLM/gi, 'L L M')
      .replace(/CAAD/gi, 'CADE')
      .replace(/PPGAU/gi, 'P P GAU')
      .replace(/PPGI/gi, 'P P G I')
      .replace(/UFES/gi, 'Ufes')
      .replace(/IAB-ES/gi, 'I A B Espírito Santo')
      .replace(/CAU/gi, 'C A U')
      .trim();
  }

  // Criação dos elementos visuais do Chatbot
  function injectChatbotWidget() {
    if (document.getElementById('academic-chatbot-container')) return;

    const container = document.createElement('div');
    container.id = 'academic-chatbot-container';
    container.innerHTML = `
      <!-- Botão Lançador Flutuante com Avatar Personalizado -->
      <button id="chatbot-launcher-btn" class="chatbot-launcher" aria-label="Abrir assistente virtual acadêmico de Nicole" title="Assistente Acadêmico IA">
        <div class="launcher-pulse"></div>
        <div class="launcher-avatar-wrap">
          ${AVATAR_SVG}
        </div>
        <span class="launcher-voice-badge" title="Voz Ativa">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path></svg>
        </span>
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
            <div class="chatbot-avatar" id="chatbot-header-avatar">
              ${AVATAR_SVG}
              <div class="avatar-live-glow"></div>
            </div>
            <div class="chatbot-info-text">
              <h3 id="chatbot-title" class="chatbot-name">Assistente Nicole Nicolini</h3>
              <p class="chatbot-sub">
                <span id="chatbot-status-indicator" class="status-dot"></span>
                <span id="chatbot-status-text">Assistente Acadêmico</span>
              </p>
            </div>
          </div>
          <div class="chatbot-header-actions">
            <!-- Botão de Resposta por Voz (TTS Toggle) -->
            <button id="chatbot-tts-toggle" class="header-icon-btn active" title="Respostas em áudio ativadas (clique para silenciar)" aria-label="Ativar ou silenciar resposta por voz">
              <svg class="tts-icon-on" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
              </svg>
              <svg class="tts-icon-off" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none;">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <line x1="23" y1="9" x2="17" y2="15"></line>
                <line x1="17" y1="9" x2="23" y2="15"></line>
              </svg>
            </button>

            <!-- Botão de Configurações do LM Studio -->
            <button id="chatbot-settings-toggle" class="header-icon-btn" title="Configurar conexão LM Studio" aria-label="Configurar conexão">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            </button>
            <button id="chatbot-close-btn" class="header-icon-btn" title="Minimizar chat" aria-label="Fechar janela">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>

        <!-- Indicador de Áudio Ativo / Falando -->
        <div id="chatbot-speaking-bar" class="chatbot-speaking-bar" style="display: none;">
          <div class="speaking-equalizer">
            <span></span><span></span><span></span><span></span>
          </div>
          <span class="speaking-text">Assistente falando...</span>
          <button id="chatbot-stop-speech-btn" class="speaking-stop-btn" title="Parar áudio">Parar</button>
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
          <div class="bot-msg-row">
            <div class="bot-msg-avatar" title="Assistente Nicole Nicolini">
              ${AVATAR_SVG}
            </div>
            <div class="chat-bubble bot-bubble">
              <p>Olá! Sou o assistente acadêmico virtual de <strong>Nicole De Mori Nicolini</strong>. Você pode digitar ou <strong>conversar comigo por comando de voz</strong> usando o microfone abaixo!</p>
              <p style="margin-top: 6px; font-size: 0.82rem; opacity: 0.9;">Pergunte sobre a dissertação (IR-BIM + LLM), o Grupo TIP, o IAB-ES ou os artigos de Tutores Inteligentes.</p>
            </div>
          </div>

          <!-- Sugestões de Perguntas Rápidas -->
          <div class="quick-prompts" id="quick-prompts">
            <button class="prompt-chip" data-query="Qual é o tema da sua dissertação de mestrado?">🎯 Dissertação de mestrado</button>
            <button class="prompt-chip" data-query="O que pesquisa o Grupo TIP da Ufes?">🏛️ Grupo TIP (UFES)</button>
            <button class="prompt-chip" data-query="Por que a IA não deve fazer a síntese do projeto segundo Lawson?">📐 IA e Bryan Lawson</button>
            <button class="prompt-chip" data-query="Quais artigos foram estudados em Tutores Inteligentes?">📚 Fichamentos do PPGI</button>
          </div>
        </div>

        <!-- Barra de Reconhecimento de Voz Ativo -->
        <div id="voice-listening-bar" class="voice-listening-bar" style="display: none;">
          <div class="voice-recording-dot"></div>
          <span id="voice-listening-label">Ouvindo... Fale agora em português</span>
          <div class="voice-wave-bars">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
          <button type="button" id="voice-cancel-btn" class="voice-cancel-btn" title="Cancelar gravação">Cancelar</button>
        </div>

        <!-- Área de Entrada de Texto + Comando de Voz -->
        <form class="chatbot-input-area" id="chatbot-form">
          <textarea id="chatbot-input" placeholder="Digite sua pergunta ou use o microfone..." rows="1" required></textarea>
          
          <!-- Botão de Microfone / Comando de Voz -->
          <button type="button" id="chatbot-voice-btn" class="chatbot-voice-btn" title="Falar por voz (Comando de Voz)" aria-label="Ativar comando de voz">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
          </button>

          <!-- Botão de Enviar Mensagem -->
          <button type="submit" id="chatbot-send-btn" aria-label="Enviar mensagem" title="Enviar">
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
    const openAvatar = launcherBtn.querySelector('.launcher-avatar-wrap');
    const openBadge = launcherBtn.querySelector('.launcher-voice-badge');
    const closeIcon = launcherBtn.querySelector('.chat-icon-close');
    const form = document.getElementById('chatbot-form');
    const input = document.getElementById('chatbot-input');
    const messagesContainer = document.getElementById('chatbot-messages');
    const statusText = document.getElementById('chatbot-status-text');
    const statusDot = document.getElementById('chatbot-status-indicator');
    const headerAvatar = document.getElementById('chatbot-header-avatar');
    const settingsToggle = document.getElementById('chatbot-settings-toggle');
    const settingsPanel = document.getElementById('chatbot-settings-panel');
    const cfgServerUrl = document.getElementById('cfg-server-url');
    const cfgTestBtn = document.getElementById('cfg-test-btn');
    const cfgSaveBtn = document.getElementById('cfg-save-btn');
    const cfgStatusMsg = document.getElementById('cfg-status-msg');

    // Elementos de Áudio e Voz
    const ttsToggleBtn = document.getElementById('chatbot-tts-toggle');
    const ttsIconOn = ttsToggleBtn.querySelector('.tts-icon-on');
    const ttsIconOff = ttsToggleBtn.querySelector('.tts-icon-off');
    const speakingBar = document.getElementById('chatbot-speaking-bar');
    const stopSpeechBtn = document.getElementById('chatbot-stop-speech-btn');
    const voiceBtn = document.getElementById('chatbot-voice-btn');
    const listeningBar = document.getElementById('voice-listening-bar');
    const listeningLabel = document.getElementById('voice-listening-label');
    const voiceCancelBtn = document.getElementById('voice-cancel-btn');

    const chatHistory = [];
    let savedApiUrl = localStorage.getItem('nicole_chat_api_url') || DEFAULT_CONFIG.pythonApiUrl;
    cfgServerUrl.value = savedApiUrl;

    // Estado da Resposta por Voz (TTS): por padrão ativado
    let voiceOutputEnabled = localStorage.getItem('nicole_chat_voice_output') !== 'false';
    updateTTSButtonState();

    function updateTTSButtonState() {
      if (voiceOutputEnabled) {
        ttsToggleBtn.classList.add('active');
        ttsIconOn.style.display = 'block';
        ttsIconOff.style.display = 'none';
        ttsToggleBtn.title = 'Respostas em áudio ativadas (clique para silenciar)';
      } else {
        ttsToggleBtn.classList.remove('active');
        ttsIconOn.style.display = 'none';
        ttsIconOff.style.display = 'block';
        ttsToggleBtn.title = 'Respostas em áudio silenciadas (clique para ativar som)';
      }
    }

    ttsToggleBtn.addEventListener('click', () => {
      voiceOutputEnabled = !voiceOutputEnabled;
      localStorage.setItem('nicole_chat_voice_output', voiceOutputEnabled);
      updateTTSButtonState();
      if (!voiceOutputEnabled) {
        stopSpeaking();
      }
    });

    // =========================================================================
    // SÍNTESE DE VOZ (TEXT-TO-SPEECH)
    // =========================================================================
    let currentUtterance = null;

    function getPortugueseVoice() {
      if (!window.speechSynthesis) return null;
      const voices = window.speechSynthesis.getVoices();
      if (!voices || !voices.length) return null;

      // 1. Prioriza vozes femininas ou naturais em pt-BR
      const naturalPtBr = voices.find(v => v.lang === 'pt-BR' && 
        (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Francisca') || v.name.includes('Maria') || v.name.includes('Luciana') || v.name.includes('Heloisa')));
      if (naturalPtBr) return naturalPtBr;

      // 2. Qualquer voz pt-BR
      const ptBr = voices.find(v => v.lang === 'pt-BR');
      if (ptBr) return ptBr;

      // 3. Qualquer voz pt
      return voices.find(v => v.lang && v.lang.startsWith('pt')) || null;
    }

    // Carrega vozes no navegador caso sejam carregadas assincronamente
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {
        getPortugueseVoice();
      };
    }

    function speakText(text) {
      if (!voiceOutputEnabled || !window.speechSynthesis) return;

      stopSpeaking();

      const speakableText = cleanTextForSpeech(text);
      if (!speakableText) return;

      const utterance = new SpeechSynthesisUtterance(speakableText);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.05; // Cadência agradável e fluida
      utterance.pitch = 1.02;

      const voice = getPortugueseVoice();
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        currentUtterance = utterance;
        speakingBar.style.display = 'flex';
        headerAvatar.classList.add('is-speaking');
        launcherBtn.classList.add('is-speaking');
      };

      utterance.onend = () => {
        stopSpeaking();
      };

      utterance.onerror = () => {
        stopSpeaking();
      };

      currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    }

    function stopSpeaking() {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      currentUtterance = null;
      speakingBar.style.display = 'none';
      headerAvatar.classList.remove('is-speaking');
      launcherBtn.classList.remove('is-speaking');
    }

    stopSpeechBtn.addEventListener('click', stopSpeaking);

    // =========================================================================
    // RECONHECIMENTO DE VOZ (SPEECH-TO-TEXT / COMANDO DE VOZ)
    // =========================================================================
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;
    let isListening = false;
    let autoSubmitTimeout = null;

    if (SpeechRecognition) {
      recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        isListening = true;
        voiceBtn.classList.add('listening');
        listeningBar.style.display = 'flex';
        listeningLabel.textContent = 'Ouvindo... Pode falar em português';
        stopSpeaking(); // Interrompe fala anterior se o usuário começar a falar
      };

      recognition.onresult = (event) => {
        let transcript = '';
        let isFinal = false;

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            isFinal = true;
          }
        }

        input.value = transcript;
        input.dispatchEvent(new Event('input'));
        listeningLabel.textContent = `"${transcript}"`;

        if (isFinal && transcript.trim()) {
          clearTimeout(autoSubmitTimeout);
          autoSubmitTimeout = setTimeout(() => {
            stopListening();
            form.dispatchEvent(new Event('submit'));
          }, 600);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Erro de reconhecimento de voz:', event.error);
        if (event.error === 'not-allowed') {
          listeningLabel.textContent = 'Permissão de microfone negada no navegador.';
        } else if (event.error === 'no-speech') {
          listeningLabel.textContent = 'Nenhuma fala detectada. Tente novamente.';
        } else {
          listeningLabel.textContent = 'Erro ao ouvir. Tente novamente.';
        }
        setTimeout(stopListening, 1800);
      };

      recognition.onend = () => {
        isListening = false;
        voiceBtn.classList.remove('listening');
        listeningBar.style.display = 'none';
      };
    } else {
      voiceBtn.title = 'Reconhecimento de voz não suportado neste navegador (recomendamos Chrome, Edge ou Safari)';
      voiceBtn.classList.add('disabled');
    }

    function startListening() {
      if (!SpeechRecognition) {
        alert('Seu navegador atual não suporta a API de Reconhecimento de Voz. Experimente utilizar o Google Chrome, Microsoft Edge ou Safari.');
        return;
      }
      try {
        stopSpeaking();
        recognition.start();
      } catch (err) {
        console.warn('Falha ao iniciar reconhecimento de voz:', err);
      }
    }

    function stopListening() {
      if (recognition && isListening) {
        try {
          recognition.stop();
        } catch (e) {}
      }
      isListening = false;
      voiceBtn.classList.remove('listening');
      listeningBar.style.display = 'none';
      clearTimeout(autoSubmitTimeout);
    }

    voiceBtn.addEventListener('click', () => {
      if (isListening) {
        stopListening();
      } else {
        startListening();
      }
    });

    voiceCancelBtn.addEventListener('click', () => {
      stopListening();
      input.value = '';
    });

    // =========================================================================
    // CONTROLES DE JANELA E INTERAÇÃO DO CHAT
    // =========================================================================
    function toggleChat() {
      const isVisible = chatWindow.style.display !== 'none';
      if (isVisible) {
        chatWindow.style.display = 'none';
        openAvatar.style.display = 'block';
        openBadge.style.display = 'flex';
        closeIcon.style.display = 'none';
        stopSpeaking();
        stopListening();
      } else {
        chatWindow.style.display = 'flex';
        openAvatar.style.display = 'none';
        openBadge.style.display = 'none';
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

    // Testar conexão com LM Studio / Servidor Python
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

    // Checagem de status de conexão
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
      } catch (err) {}
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

    // Renderizar mensagem no chat com avatar e botão de ouvir
    function appendMessage(text, sender, note = null) {
      let bubble;

      // Formatação básica de negrito e links
      let formatted = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>')
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');

      if (sender === 'bot') {
        const row = document.createElement('div');
        row.className = 'bot-msg-row';

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'bot-msg-avatar';
        avatarDiv.title = 'Assistente Nicole Nicolini';
        avatarDiv.innerHTML = AVATAR_SVG;

        bubble = document.createElement('div');
        bubble.className = 'chat-bubble bot-bubble';
        bubble.innerHTML = `<p>${formatted}</p>`;

        if (note) {
          const noteEl = document.createElement('span');
          noteEl.className = 'bubble-note';
          noteEl.textContent = note;
          bubble.appendChild(noteEl);
        }

        // Ações da mensagem (Botão de Ouvir/Repetir)
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'msg-actions';

        const playBtn = document.createElement('button');
        playBtn.type = 'button';
        playBtn.className = 'msg-action-btn speak-msg-btn';
        playBtn.title = 'Ouvir esta resposta';
        playBtn.innerHTML = `
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg> Ouvir
        `;
        playBtn.addEventListener('click', () => {
          speakText(text);
        });

        actionsDiv.appendChild(playBtn);
        bubble.appendChild(actionsDiv);

        row.appendChild(avatarDiv);
        row.appendChild(bubble);
        messagesContainer.appendChild(row);
      } else {
        bubble = document.createElement('div');
        bubble.className = 'chat-bubble user-bubble';
        bubble.innerHTML = `<p>${formatted}</p>`;
        messagesContainer.appendChild(bubble);
      }

      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      return bubble;
    }

    // Enviar mensagem
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const userText = input.value.trim();
      if (!userText) return;

      stopListening();

      input.value = '';
      input.style.height = 'auto';

      // Esconde os chips após primeira pergunta
      const chips = document.getElementById('quick-prompts');
      if (chips) chips.style.display = 'none';

      appendMessage(userText, 'user');
      chatHistory.push({ role: 'user', content: userText });

      // Bolha de carregamento com avatar
      const loadingRow = document.createElement('div');
      loadingRow.className = 'bot-msg-row loading-row';
      loadingRow.innerHTML = `
        <div class="bot-msg-avatar">${AVATAR_SVG}</div>
        <div class="chat-bubble bot-bubble loading-bubble">
          <div class="typing-indicator"><span></span><span></span><span></span></div>
        </div>
      `;
      messagesContainer.appendChild(loadingRow);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      let answer = '';
      let sourceNote = null;

      try {
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
        answer = getFallbackAnswer(userText);
        sourceNote = 'Base de Conhecimento Acadêmica';
      } finally {
        loadingRow.remove();
        appendMessage(answer, 'bot', sourceNote);
        chatHistory.push({ role: 'assistant', content: answer });

        // Responde automaticamente por voz se ativado
        if (voiceOutputEnabled) {
          speakText(answer);
        }
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
