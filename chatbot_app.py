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
Sua funcao e responder duvidas de visitantes, pesquisadores e avaliadores de forma educada, precisa e fundamentada.

DADOS DA PESQUISADORA NICOLE DE MORI NICOLINI:
- Formacao: Arquiteta e Urbanista pela Universidade Federal do Espirito Santo (UFES).
- Mestrado: Mestranda no Programa de Pos-Graduacao em Arquitetura e Urbanismo (PPGAU/UFES).
  - Tema da dissertacao: "Desenvolvimento de um assistente para projetos de arquitetura articulando um framework IR-BIM e um modelo de linguagem em um fluxo de trabalho".
  - Orientador: Prof. Dr. Jarryer Andrade de Martino.
- Laboratorio de Pesquisa: Grupo TIP (Tecnologias Integradas ao Projeto), do DAU/UFES.
  - Linhas de pesquisa do TIP: sistemas generativos, projeto computacional, prototipagem rapida, fabricacao digital, sistemas bioinspirados e realidades virtuais. Site: http://tip.ufes.br/
- Atuacao Institucional: Conselheira Estadual do IAB-ES (Instituto de Arquitetos do Brasil - Departamento do Espirito Santo), gestao atual desde o fim de 2025. Registro ativo no CAU.
- Projeto de Graduacao (TCC): "Avaliacao de Habitacoes em Dom Joao Batista, Vila Velha - ES, e proposicao de estrategias para a melhoria da habitabilidade nas autoconstrucoes".

DISCIPLINA TUTORES INTELIGENTES (PPGI/UFES):
Nicole cursou a disciplina no Programa de Pos-Graduacao em Informatica e elaborou tres fichamentos centrais:
1. Bradac et al. (2022) - "Design of an Intelligent Tutoring System to Create a Personalized Study Plan Using Expert Systems":
   - Sistema no Moodle com logica fuzzy e modelo VARK para planos personalizados.
   - Reflexao de Nicole fundamentada em Bryan Lawson (2011 - "Como Arquitetos e Designers Pensam"): a IA nao deve atuar na sintese (criacao) nem na avaliacao do projeto (que sao problemas perniciosos / wicked problems com raciocinio nao puramente matematico). O assistente atuara estritamente na etapa de ANALISE (busca de padroes e classificacao de objetivos em arquivos BIM).
2. William van Melle (1978) - "The Structure of the MYCIN System":
   - Sistema especialista para diagnosticos medicos com explicabilidade (HOW e WHY) e fatores de certeza probabilistica.
   - Reflexao de Nicole: transposicao da logica de regras para dados precisos do BIM, gerando um ciclo metodologico de avaliacao, identificacao e sugestoes adaptativas.
3. Clancey & Letsinger (1981/1982) - "NEOMYCIN: Reconfiguring A Rule-Based Expert System for Application to Teaching":
   - Reconfiguracao com regras estrategicas para o tutor GUIDON ensinar estudantes de medicina.
   - Reflexao de Nicole: contraste entre raciocinio medico (diagnostico, convergente) e arquitetonico (propositivo, criativo), propondo instruir LLMs a reproduzir as etapas investigativas da fase de analise do projeto.

DIRETRIZES DE RESPOSTA:
- Responda sempre em portugues claro, formal e academico.
- Seja objetivo e enfatize o papel da IA como assistente de suporte analitico ao arquiteto, preservando a autoria e a criatividade humana.
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
        if self.path == "/" or self.path == "/chat":
            self._set_cors_headers(200, "text/html; charset=utf-8")
            html = self._render_standalone_chat_html()
            self.wfile.write(html.encode("utf-8"))
        elif self.path == "/api/status" or self.path == "/health":
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
        else:
            self._set_cors_headers(404)
            self.wfile.write(json.dumps({"error": "Rota nao encontrada"}).encode("utf-8"))

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
        if "disserta" in msg_lower or "mestrado" in msg_lower or "pesquisa" in msg_lower or "tema" in msg_lower:
            return (
                "A pesquisa de mestrado de Nicole no PPGAU/UFES intitula-se: "
                "**'Desenvolvimento de um assistente para projetos de arquitetura articulando um framework IR-BIM e um modelo de linguagem em um fluxo de trabalho'**, "
                "sob orientacao do Prof. Dr. Jarryer Andrade de Martino no Grupo TIP."
            )
        elif "tip" in msg_lower or "laborat" in msg_lower or "grupo" in msg_lower:
            return (
                "O **Grupo TIP (Tecnologias Integradas ao Projeto)** do DAU/UFES investiga teorias e tecnicas que integram "
                "tecnologias digitais ao processo de projeto em CAAD. Entre suas areas estao: sistemas generativos, projeto computacional, "
                "prototipagem rapida, fabricacao digital, sistemas bioinspirados e realidades virtuais. Saiba mais em: http://tip.ufes.br/"
            )
        elif "lawson" in msg_lower or "sintese" in msg_lower or "analise" in msg_lower or "pernicioso" in msg_lower:
            return (
                "Com base em Bryan Lawson (2011, *Como Arquitetos e Designers Pensam*), Nicole defende que a IA nao deve atuar nas etapas de "
                "**sintese** ou **avaliacao**, visto que o projeto arquitetonico e um 'problema pernicioso' (wicked problem) que nao se reduz a calculos matematicos. "
                "O assistente computacional deve atuar exclusivamente na etapa de **analise**, identificando padroes e organizando informacoes dos modelos BIM."
            )
        elif "mycin" in msg_lower or "fichamento" in msg_lower or "van melle" in msg_lower or "bradac" in msg_lower:
            return (
                "Nos fichamentos da disciplina de Tutores Inteligentes (PPGI/UFES), Nicole estudou o Bradac et al. (ITS no Moodle com logica fuzzy), "
                "o MYCIN (regras e explicabilidade em diagnosticos) e o NEOMYCIN (modelagem cognitiva e regras estrategicas). "
                "Acesse a aba 'Tutores Inteligentes' no site para conferir os resumos completos e reflexoes!"
            )
        elif "iab" in msg_lower or "conselh" in msg_lower or "trabalho" in msg_lower:
            return (
                "Nicole e Conselheira Estadual do **IAB-ES (Instituto de Arquitetos do Brasil - Departamento do Espirito Santo)** "
                "na gestao atual iniciada no fim de 2025, alem de arquiteta com registro profissional ativo no CAU."
            )
        else:
            return (
                "Ola! Sou o assistente academico da Nicole Nicolini. Posso responder sobre a pesquisa de mestrado dela no PPGAU/UFES "
                "(assistente IR-BIM + LLM), o Grupo TIP, sua atuacao no IAB-ES e os artigos estudados na disciplina de Tutores Inteligentes (PPGI). "
                "Em que posso ajudar?"
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
