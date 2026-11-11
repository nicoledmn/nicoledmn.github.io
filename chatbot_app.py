#!/usr/bin/env python3
"""
Assistente Virtual Academico - Nicole De Mori Nicolini
Ponte e Aplicativo Chatbot integrado ao LM Studio (Local Model Server)
"""

import os
import sys
import json
import argparse
import urllib.request
import urllib.error
from http.server import HTTPServer, BaseHTTPRequestHandler

# Configuracoes padrao do servidor LM Studio
DEFAULT_LM_STUDIO_URL = os.environ.get("LM_STUDIO_URL", "http://127.0.0.1:1234/v1")
SERVER_PORT = int(os.environ.get("CHATBOT_PORT", "8000"))

# Prompt de sistema com a base de conhecimento de Nicole De Mori Nicolini
SYSTEM_PROMPT = """Voce e o Assistente Academico Virtual de Nicole De Mori Nicolini, integrado ao portfolio academico dela.
Sua funcao e responder duvidas de visitantes, pesquisadores e avaliadores de forma educada, precisa, aprofundada e fundamentada.

DADOS DA PESQUISADORA NICOLE DE MORI NICOLINI:
- Formacao: Arquiteta e Urbanista pela Universidade Federal do Espirito Santo (UFES).
- Mestrado: Mestranda no Programa de Pos-Graduacao em Arquitetura e Urbanismo (PPGAU/UFES).
  - Tema da dissertacao: "Desenvolvimento de um assistente para projetos de arquitetura articulando um framework IR-BIM e um modelo de linguagem em um fluxo de trabalho".
  - Orientador: Prof. Dr. Jarryer Andrade de Martino.
- Laboratorio de Pesquisa: Grupo TIP (Tecnologias Integradas ao Projeto), do DAU/UFES.
  - Linhas de pesquisa do TIP: sistemas generativos, projeto computacional, prototipagem rapida, fabricacao digital, sistemas bioinspirados e realidades virtuais. Site: http://tip.ufes.br/
- Atuacao Institucional: Conselheira Estadual do IAB-ES (Instituto de Arquitetos do Brasil - Departamento do Espirito Santo), gestao atual desde o fim de 2025. Registro ativo no CAU.
- Projeto de Graduacao (TCC): "Avaliacao de Habitacoes em Dom Joao Batista, Vila Velha - ES, e proposicao de estrategias para a melhoria da habitabilidade nas autoconstrucoes".

DISCIPLINA TUTORES INTELIGENTES (PPGI/UFES) — FICHAMENTOS DETALHADOS:
Nicole cursou a disciplina no PPGI/UFES e produziu fichamentos analiticos rigorosos sobre tres artigos seminais:

1. Bradac et al. (2022) — "Design of an Intelligent Tutoring System to Create a Personalized Study Plan Using Expert Systems" (Applied Sciences):
   - Proposta: Sistema Tutor Inteligente (ITS) dentro do Moodle que elabora e adapta planos de estudo personalizados considerando o desempenho continuo e as preferencias sensoriais (modelo VARK) do estudante, usando logica fuzzy para modelar niveis de aprendizado com minima intervencao manual do tutor.
   - Aspectos Positivos: Personalizacao dinamica, acompanhamento longitudinal do aluno e uso de logica fuzzy para lidar com incerteza e gradualidade.
   - Aspectos Negativos / Limitacoes: A arquitetura de sistemas especialistas engessa a expansao para novos cursos; aplicacao restrita a um curso especifico (ingles instrumental) sem demonstracao de generalizacao.
   - Duvidas e Trechos Nao Compreendidos: Nicole questionou como na etapa M1B o sistema afere o perfil VARK do aluno: perguntando diretamente? E se o aluno achar que aprende melhor por video, mas na verdade leitura/escrita for mais eficaz? Como conceber um teste objetivo confiavel para isso?
   - Rastreio Metodologico: Design Science Research (DSR).

2. William van Melle (1978) — "The Structure of the MYCIN System" (Int. Journal of Man-Machine Studies):
   - Proposta: Estrutura e funcionamento do MYCIN, sistema especialista para apoiar medicos no diagnostico e tratamento de infeccoes graves sob informacoes imprecisas ou incompletas.
   - Aspectos Positivos: Tratamento probabilistico da incerteza dos relatos clinicos e explicabilidade atraves dos comandos HOW (como concluiu) e WHY (por que solicitou tal informacao).
   - Aspectos Negativos / Limitacoes: Dificuldade de atualizacao do conhecimento da base de regras e barreira dialogica entre o especialista (medico) e o programador (quem codifica a logica).
   - Duvidas e Trechos Nao Compreendidos: Nicole questionou o funcionamento do motor de inferencia: se evidencias clinicas diferentes apontarem para direcoes opostas, como o motor lida com isso? Realiza uma soma probabilistica escolhendo a mais provavel ou pode inferir dois diagnosticos divergentes em paralelo para o mesmo paciente?
   - Transposicao ao BIM: Nicole transpoe a cadeia de decisoes para dados do BIM: Informacoes (arquivos BIM) -> Avaliacao -> Regras -> Decisao (identificacao e categorizacao) -> Elaboracao de novo projeto -> Nova avaliacao -> Sugestoes adaptativas.

3. Clancey & Letsinger (1981/1982) — "NEOMYCIN: Reconfiguring A Rule-Based Expert System for Application to Teaching" (IJCAI / Stanford):
   - Proposta: Reconfiguracao da base do MYCIN para uso pedagogico no tutor GUIDON, ensinando estudantes de medicina a diagnosticar. Demonstra que ter regras estaticas nao basta; e necessario modelar as estrategias cognitivas e o gerenciamento do espaco de hipoteses.
   - Aspectos Positivos: Diferenciacao crucial entre ter conhecimento e entender a estrutura estrategica de raciocinio para aplica-lo.
   - Aspectos Negativos / Limitacoes: Continua dependente da formalizacao computacional, simplificando excessivamente a experiencia e o julgamento humano tacito.
   - Duvidas e Trechos Nao Compreendidos: Nicole nao compreendeu como a reestruturacao em blocos beneficia o raciocinio pratico; como exatamente o sistema e consumido pelo GUIDON; e por que a pesquisa se restringiu ao ensino em vez de mante-lo como assistente de pratica clinica profissional.
   - Contraste Cognitivo: O raciocinio medico e diagnostico/pragmatico; o do arquiteto e propositivo/criativo.

FUNDAMENTACAO EM BRYAN LAWSON (2011 — "Como Arquitetos e Designers Pensam"):
- O projeto de arquitetura e um "problema pernicioso" (wicked problem), com variaveis humanas, culturais e contextuais irredutiveis a modelos puramente matematicos.
- Por isso, a IA e os computadores NAO devem atuar na SINTESE (criacao) nem na AVALIACAO (julgamento de qualidade do projeto).
- O assistente atuara estritamente na etapa de ANALISE ("investigacao das relacoes na busca de algum padrao nas informacoes disponiveis e a classificacao dos objetivos", p. 45), resgatando precedentes em arquivos BIM de escritorios (como creches e escolas) para subsidiar o projetista humano, preservando integralmente a autoria e a criatividade.

DIRETRIZES DE RESPOSTA:
- Responda sempre em portugues claro, formal, seguro e articulado academicamente.
- Seja aprofundado e responda exatamente ao que for perguntado: se perguntarem sobre duvidas, cite as duvidas; se perguntarem sobre aspectos positivos/negativos, detalhe-os; se perguntarem sobre a dissertacao ou Lawson, fundamente com precisao.
- Suas respostas podem ser lidas em voz alta por sintese de voz (TTS) no navegador; mantenha fluidez e boa pontuacao.
"""


def check_lm_studio(base_url=DEFAULT_LM_STUDIO_URL):
    """Verifica se o servidor do LM Studio esta ativo e lista modelos carregados."""
    url = f"{base_url.rstrip('/')}/models"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "NicoleChatbot/1.0"})
        with urllib.request.urlopen(req, timeout=3) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            models = [m.get("id") for m in data.get("data", [])]
            return True, models
    except Exception as e:
        return False, str(e)


def call_lm_studio(messages, base_url=DEFAULT_LM_STUDIO_URL, temperature=0.7, max_tokens=600):
    """Envia a conversa para o endpoint /chat/completions do LM Studio."""
    url = f"{base_url.rstrip('/')}/chat/completions"
    payload = {
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": False
    }
    data_bytes = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data_bytes,
        headers={"Content-Type": "application/json", "User-Agent": "NicoleChatbot/1.0"}
    )
    
    with urllib.request.urlopen(req, timeout=60) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        choices = res.get("choices", [])
        if choices:
            return choices[0].get("message", {}).get("content", "")
        return "Nao foi possivel obter uma resposta do modelo."


class ChatbotHandler(BaseHTTPRequestHandler):
    """Manipulador HTTP com suporte a CORS para servir o chatbot e API."""

    def _set_cors_headers(self, status=200, content_type="application/json; charset=utf-8"):
        self.send_response(status)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Content-Type", content_type)
        self.end_headers()

    def do_OPTIONS(self):
        self._set_cors_headers(204)

    def do_GET(self):
        clean_path = self.path.split("?")[0].lstrip("/")
        if not clean_path:
            clean_path = "index.html"

        if clean_path in ("api/status", "health"):
            is_alive, info = check_lm_studio()
            self._set_cors_headers(200)
            res = {
                "status": "online" if is_alive else "offline",
                "lm_studio_connected": is_alive,
                "lm_studio_url": DEFAULT_LM_STUDIO_URL,
                "models": info if is_alive else [],
                "error": None if is_alive else info
            }
            self.wfile.write(json.dumps(res, ensure_ascii=False).encode("utf-8"))
            return

        # Serve arquivos estaticos locais do site quando acessado via localhost
        base_dir = os.path.dirname(os.path.abspath(__file__))
        target_file = os.path.normpath(os.path.join(base_dir, clean_path))

        if not target_file.startswith(base_dir):
            self._set_cors_headers(403)
            self.wfile.write(b"Acesso negado")
            return

        if os.path.isfile(target_file):
            content_type = "application/octet-stream"
            if target_file.endswith(".html"):
                content_type = "text/html; charset=utf-8"
            elif target_file.endswith(".css"):
                content_type = "text/css; charset=utf-8"
            elif target_file.endswith(".js"):
                content_type = "application/javascript; charset=utf-8"
            elif target_file.endswith(".svg"):
                content_type = "image/svg+xml"
            elif target_file.endswith(".json"):
                content_type = "application/json; charset=utf-8"
            elif target_file.endswith(".png"):
                content_type = "image/png"
            elif target_file.endswith(".jpg") or target_file.endswith(".jpeg"):
                content_type = "image/jpeg"

            self._set_cors_headers(200, content_type)
            with open(target_file, "rb") as f:
                self.wfile.write(f.read())
            return

        self._set_cors_headers(404)
        self.wfile.write(json.dumps({"error": f"Arquivo '{clean_path}' nao encontrado"}, ensure_ascii=False).encode("utf-8"))

    def do_POST(self):
        if self.path == "/api/chat":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            try:
                data = json.loads(body)
                user_msg = data.get("message", "").strip()
                history = data.get("history", [])

                if not user_msg:
                    self._set_cors_headers(400)
                    self.wfile.write(json.dumps({"error": "Mensagem vazia"}).encode("utf-8"))
                    return

                # Monta lista de mensagens com o system prompt
                messages = [{"role": "system", "content": SYSTEM_PROMPT}]
                for h in history[-8:]:  # mantem ultimas interacoes
                    messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
                messages.append({"role": "user", "content": user_msg})

                # Tenta chamar o LM Studio
                is_alive, _ = check_lm_studio()
                if is_alive:
                    try:
                        reply = call_lm_studio(messages)
                        self._set_cors_headers(200)
                        self.wfile.write(json.dumps({
                            "reply": reply,
                            "source": "lm_studio",
                            "status": "success"
                        }, ensure_ascii=False).encode("utf-8"))
                        return
                    except Exception as err:
                        error_msg = f"Erro ao consultar LM Studio: {str(err)}"
                else:
                    error_msg = (
                        "O servidor local LM Studio nao esta ativo no momento em http://127.0.0.1:1234. "
                        "Abra o LM Studio, carregue um modelo e inicie o 'Local Server'."
                    )

                # Fallback inteligente se o LM Studio estiver offline
                fallback_reply = self._get_fallback_reply(user_msg)
                self._set_cors_headers(200)
                self.wfile.write(json.dumps({
                    "reply": fallback_reply,
                    "source": "local_fallback",
                    "note": error_msg,
                    "status": "warning"
                }, ensure_ascii=False).encode("utf-8"))

            except Exception as e:
                self._set_cors_headers(500)
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
        else:
            self._set_cors_headers(404)
            self.wfile.write(json.dumps({"error": "Rota nao encontrada"}).encode("utf-8"))

    def _get_fallback_reply(self, message):
        """Fornece respostas baseadas na base de conhecimento se o LM Studio estiver temporariamente offline."""
        msg_lower = message.lower()

        # 1. Dúvidas nos fichamentos
        if any(w in msg_lower for w in ["duvida", "dúvida", "compreendeu", "nao compreendeu", "não compreendeu", "dificuldade", "incompreensao"]):
            return (
                "Em seus fichamentos na disciplina de Tutores Inteligentes (PPGI/UFES), Nicole formulou questoes e duvidas criticas muito claras:\n\n"
                "1. **No artigo de Bradac et al. (2022 - ITS no Moodle):**\n"
                "Nicole questionou como na etapa M1B o sistema afere o perfil sensorial (VARK) do aluno: *'Perguntando diretamente? Mas e se o aluno achar que aprende melhor por video, quando na verdade ler e escrever for mais adequado para ele? Penso que um teste para isso seria mais adequado, mas como formular um teste como esse?'*\n\n"
                "2. **No artigo do MYCIN (Van Melle, 1978):**\n"
                "A duvida incidiu sobre o motor de inferencia: *'Se informacoes diferentes dadas pelo paciente apontam para direcoes opostas, como o motor lida com isso? E uma soma matematica probabilistica que verifica a maior probabilidade, ou o motor poderia inferir dois diagnosticos simultaneos completamente diferentes a um mesmo paciente?'*\n\n"
                "3. **No artigo do NEOMYCIN (Clancey & Letsinger, 1981):**\n"
                "Nicole apontou nao entender como a arquitetura em blocos influencia positivamente no raciocinio, como o sistema seria usado pelo GUIDON, e por que a pesquisa restringiu o NEOMYCIN ao ensino em vez de mante-lo como assistente de pratica clinica profissional."
            )

        # 2. Aspectos Positivos
        elif any(w in msg_lower for w in ["positivo", "positivos", "vantagem", "vantagens", "pontos fortes"]):
            return (
                "Nos fichamentos, Nicole destacou como aspectos positivos centrais:\n\n"
                "• **Bradac et al. (2022):** A personalizacao do plano de estudos acompanhando o aluno ao longo do tempo e o uso de logica fuzzy para lidar com niveis graduais de aprendizado.\n"
                "• **MYCIN (1978):** A capacidade de lidar com incertezas e dados incompletos por meio de probabilidades, e a explicabilidade das decisoes atraves de comandos HOW e WHY.\n"
                "• **NEOMYCIN (1981):** A clara demonstracao de que apenas armazenar regras estaticas nao basta; e necessario entender e emular a estrutura estrategica do raciocinio clinico."
            )

        # 3. Aspectos Negativos / Limitações
        elif any(w in msg_lower for w in ["negativo", "negativos", "desvantagem", "desvantagens", "limitac", "limitaç", "critica", "crítica", "engessa"]):
            return (
                "Como limitacoes e aspectos negativos, Nicole observou:\n\n"
                "• **Rigidez computacional:** Tanto no Bradac quanto no MYCIN, a arquitetura baseada em regras engessa a inclusao de novos cursos e a atualizacao do conhecimento.\n"
                "• **Barreira de traducao:** No MYCIN, a distancia entre o medico (detentor do saber especialista) e o programador (tradutor para codigo computacional).\n"
                "• **Simplificacao excessiva:** No NEOMYCIN, o modelo continua refem de representacao formal, arriscando simplificar demais um processo que envolve julgamento tacito, experiencia e contexto."
            )

        # 4. Lawson e Projeto de Arquitetura
        elif any(w in msg_lower for w in ["lawson", "bryan lawson", "sintese", "síntese", "pernicioso", "wicked", "avaliacao", "avaliação"]):
            return (
                "Com base em Bryan Lawson (2011, *Como Arquitetos e Designers Pensam*), Nicole defende que a IA **nao deve atuar nas etapas de sintese (criacao) nem de avaliacao**, "
                "pois o projeto arquitetonico e um 'problema pernicioso' (wicked problem) regido por fatores humanos e contextuais que nao se reduzem a fatores puramente matematicos.\n\n"
                "A IA deve atuar estritamente na etapa de **analise** ('investigacao das relacoes na busca de algum padrao nas informacoes disponiveis e a classificacao dos objetivos', p. 45), "
                "organizando e minerando dados de modelos BIM para apoiar o arquiteto."
            )

        # 5. BIM e Creches
        elif any(w in msg_lower for w in ["bim", "ir-bim", "creche", "creches", "escritorio", "escritório"]):
            return (
                "Na pesquisa de Nicole, o assistente acessa arquivos BIM de um escritorio para projetos de escopo semelhante (ex.: creches), "
                "organizando uma base de dados para consulta em linguagem natural. Assim, o projetista consegue resgatar com clareza as decisoes "
                "anteriores e optar por segui-las ou adapta-las no novo projeto."
            )

        # 6. Artigos em Geral / Tutores Inteligentes
        elif any(w in msg_lower for w in ["artigo", "artigos", "tutores inteligentes", "ppgi", "disciplina", "fichamento", "fichamentos"]):
            return (
                "Na disciplina de Tutores Inteligentes (PPGI/UFES), Nicole produziu tres fichamentos detalhados:\n\n"
                "1. **Bradac et al. (2022):** ITS no Moodle com logica fuzzy e modelo VARK para planos de estudo personalizados.\n"
                "2. **MYCIN (William van Melle, 1978):** Sistema especialista para diagnostico com explicabilidade (HOW/WHY) e fatores de certeza.\n"
                "3. **NEOMYCIN (Clancey & Letsinger, 1981):** Modelagem estrategica cognitiva aplicada ao tutor medico GUIDON.\n\n"
                "Voce pode perguntar sobre as duvidas colocadas por Nicole, os pontos positivos/negativos ou as relacoes com sua pesquisa em BIM e Lawson!"
            )

        # 7. Dissertação de Mestrado
        elif any(w in msg_lower for w in ["disserta", "mestrado", "pesquisa", "tema"]):
            return (
                "A pesquisa de mestrado de Nicole no PPGAU/UFES intitula-se: "
                "**'Desenvolvimento de um assistente para projetos de arquitetura articulando um framework IR-BIM e um modelo de linguagem em um fluxo de trabalho'**, "
                "sob orientacao do Prof. Dr. Jarryer Andrade de Martino no Grupo TIP."
            )

        # 8. Grupo TIP
        elif any(w in msg_lower for w in ["tip", "laborat", "grupo"]):
            return (
                "O **Grupo TIP (Tecnologias Integradas ao Projeto)** do DAU/UFES investiga teorias e tecnicas que integram "
                "tecnologias digitais ao processo de projeto em CAAD. Entre suas areas estao: sistemas generativos, projeto computacional, "
                "prototipagem rapida, fabricacao digital, sistemas bioinspirados e realidades virtuais. Saiba mais em: http://tip.ufes.br/"
            )

        # 9. IAB-ES
        elif any(w in msg_lower for w in ["iab", "conselh", "trabalho", "cau"]):
            return (
                "Nicole e Conselheira Estadual do **IAB-ES (Instituto de Arquitetos do Brasil - Departamento do Espirito Santo)** "
                "na gestao atual iniciada no fim de 2025, alem de arquiteta com registro profissional ativo no CAU."
            )

        else:
            return (
                "Ola! Sou o assistente academico da Nicole Nicolini. Posso responder detalhadamente sobre a pesquisa de mestrado dela no PPGAU/UFES "
                "(assistente IR-BIM + LLM), o Grupo TIP, sua atuacao no IAB-ES e os conteudos dos fichamentos da disciplina de Tutores Inteligentes "
                "(incluindo as duvidas que ela anotou, pontos positivos/negativos e a articulacao com Bryan Lawson). Como posso ajudar?"
            )

    def _render_standalone_chat_html(self):
        """Retorna uma interface web simples e elegante para teste local direto pelo navegador."""
        return """<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Chatbot Academico - Nicole Nicolini (LM Studio)</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    :root {
      --bg: #121418;
      --card: #1c2026;
      --text: #f0f2f5;
      --accent: #2563eb;
      --border: #2e3440;
    }
    body { font-family: system-ui, -apple-system, sans-serif; background: var(--bg); color: var(--text); margin: 0; padding: 20px; display: flex; justify-content: center; }
    .chat-box { width: 100%; max-width: 650px; background: var(--card); border: 1px solid var(--border); border-radius: 12px; display: flex; flex-direction: column; height: 90vh; overflow: hidden; }
    .header { padding: 16px; background: rgba(0,0,0,0.2); border-bottom: 1px solid var(--border); font-weight: bold; display: flex; justify-content: space-between; align-items: center; }
    .status { font-size: 12px; color: #10b981; }
    .messages { flex: 1; padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; }
    .msg { padding: 10px 14px; border-radius: 8px; max-width: 80%; line-height: 1.5; font-size: 14px; }
    .msg.bot { background: #262c36; align-self: flex-start; }
    .msg.user { background: var(--accent); color: white; align-self: flex-end; }
    .input-area { display: flex; padding: 12px; border-top: 1px solid var(--border); gap: 8px; }
    input { flex: 1; padding: 12px; border-radius: 6px; border: 1px solid var(--border); background: #121418; color: white; outline: none; }
    button { background: var(--accent); color: white; border: none; padding: 10px 18px; border-radius: 6px; cursor: pointer; font-weight: 600; }
  </style>
</head>
<body>
  <div class="chat-box">
    <div class="header">
      <span>Assistente Academico - Nicole Nicolini</span>
      <span id="status" class="status">● Conectando ao LM Studio...</span>
    </div>
    <div class="messages" id="messages">
      <div class="msg bot">Ola! Sou o assistente academico de Nicole Nicolini. Pergunte-me sobre sua dissertacao de mestrado (IR-BIM + LLM), o Grupo TIP ou os artigos de Tutores Inteligentes!</div>
    </div>
    <div class="input-area">
      <input type="text" id="user-input" placeholder="Digite sua pergunta..." autofocus />
      <button id="send-btn">Enviar</button>
    </div>
  </div>
  <script>
    const input = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const msgs = document.getElementById('messages');
    const statusEl = document.getElementById('status');
    const history = [];

    // Checar status
    fetch('/api/status').then(r => r.json()).then(d => {
      if(d.lm_studio_connected) {
        statusEl.textContent = '● LM Studio Conectado';
        statusEl.style.color = '#10b981';
      } else {
        statusEl.textContent = '○ LM Studio Offline (Modo Local)';
        statusEl.style.color = '#f59e0b';
      }
    }).catch(() => {
      statusEl.textContent = '○ Servidor Offline';
    });

    function addMessage(text, sender) {
      const d = document.createElement('div');
      d.className = 'msg ' + sender;
      d.textContent = text;
      msgs.appendChild(d);
      msgs.scrollTop = msgs.scrollHeight;
      return d;
    }

    async function send() {
      const q = input.value.trim();
      if(!q) return;
      input.value = '';
      addMessage(q, 'user');
      history.push({role: 'user', content: q});
      
      const loading = addMessage('Pensando...', 'bot');
      try {
        const r = await fetch('/api/chat', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({message: q, history: history})
        });
        const data = await r.json();
        loading.textContent = data.reply || data.error;
        history.push({role: 'assistant', content: loading.textContent});
      } catch(e) {
        loading.textContent = 'Erro ao enviar mensagem: ' + e;
      }
    }

    sendBtn.onclick = send;
    input.onkeydown = (e) => { if(e.key === 'Enter') send(); };
  </script>
</body>
</html>"""


def run_cli_chat(base_url=DEFAULT_LM_STUDIO_URL):
    """Executa o chatbot diretamente no terminal."""
    print("=" * 60)
    print("Assistente Academico de Nicole Nicolini — Modo Terminal")
    print("=" * 60)
    is_alive, info = check_lm_studio(base_url)
    if is_alive:
        print(f"[OK] LM Studio ativo em {base_url}")
        print(f"Modelos disponiveis: {info}")
    else:
        print(f"[AVISO] LM Studio nao detectado em {base_url} ({info}).")
        print("Certifique-se de carregar um modelo e ligar o 'Local Server' no LM Studio.\n")

    history = []
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    while True:
        try:
            user_input = input("\nVoce: ").strip()
            if not user_input:
                continue
            if user_input.lower() in ("sair", "exit", "quit"):
                print("Encerrando assistente. Ate logo!")
                break

            messages.append({"role": "user", "content": user_input})
            print("\nAssistente: ...pensando...", end="\r")

            try:
                reply = call_lm_studio(messages, base_url=base_url)
                print(f"Assistente: {reply}\n")
                messages.append({"role": "assistant", "content": reply})
            except Exception as e:
                print(f"\n[Erro LM Studio]: {e}")
                print("[Resposta de Fallback]: " + ChatbotHandler._get_fallback_reply(None, user_input))

        except (KeyboardInterrupt, EOFError):
            print("\nEncerrando chatbot.")
            break


def main():
    global DEFAULT_LM_STUDIO_URL
    parser = argparse.ArgumentParser(description="Chatbot Academico de Nicole Nicolini com LM Studio")
    parser.add_argument("--cli", action="store_true", help="Executar chatbot no terminal (modo linha de comando)")
    parser.add_argument("--port", type=int, default=SERVER_PORT, help=f"Porta do servidor HTTP (padrao: {SERVER_PORT})")
    parser.add_argument("--lm-url", type=str, default=DEFAULT_LM_STUDIO_URL, help=f"URL do LM Studio (padrao: {DEFAULT_LM_STUDIO_URL})")
    args = parser.parse_args()

    DEFAULT_LM_STUDIO_URL = args.lm_url

    if args.cli:
        run_cli_chat(args.lm_url)
    else:
        server_address = ("", args.port)
        httpd = HTTPServer(server_address, ChatbotHandler)
        print("=" * 65)
        print("  Servidor Chatbot Academico - Nicole De Mori Nicolini")
        print("=" * 65)
        print(f"  Interface Web local : http://localhost:{args.port}/")
        print(f"  API Endpoint        : http://localhost:{args.port}/api/chat")
        print(f"  Destino LM Studio   : {args.lm_url}")
        print("=" * 65)
        print("Pressione Ctrl+C para encerrar o servidor.\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor encerrado.")
            httpd.server_close()


if __name__ == "__main__":
    main()
