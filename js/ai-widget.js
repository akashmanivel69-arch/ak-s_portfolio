/* ── AI Chat Widget with Serverless Proxy ────────────────────────────── */
(function () {

  /* ── Inject Styles ── */
  var style = document.createElement('style');
  style.textContent = `
    #ai-launcher {
      position: fixed;
      bottom: 28px;
      left: 28px;
      z-index: 9000;
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #00c896, #3EB489);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      box-shadow: 0 4px 24px rgba(0,200,150,0.4);
      animation: ai-shake 3s ease-in-out infinite;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    #ai-launcher:hover {
      box-shadow: 0 6px 32px rgba(0,200,150,0.6);
      animation: none;
      transform: scale(1.1);
    }
    #ai-launcher svg { width: 26px; height: 26px; fill: #000; }
    @keyframes ai-shake {
      0%,100%  { transform: rotate(0deg)   scale(1);    }
      15%      { transform: rotate(-8deg)  scale(1.05); }
      30%      { transform: rotate(6deg)   scale(1.05); }
      45%      { transform: rotate(-4deg)  scale(1);    }
      60%      { transform: rotate(3deg)   scale(1);    }
      75%      { transform: rotate(-2deg)  scale(1);    }
      85%      { transform: rotate(1deg)   scale(1);    }
    }

    #ai-panel {
      position: fixed;
      bottom: 96px;
      left: 28px;
      width: 360px;
      max-height: 540px;
      z-index: 8999;
      background: #0d1117;
      border: 1px solid rgba(0,200,150,0.25);
      display: flex;
      flex-direction: column;
      clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
      box-shadow: 0 8px 48px rgba(0,0,0,0.6);
      transform: translateY(20px);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s, transform 0.25s;
    }
    #ai-panel.open {
      opacity: 1;
      transform: translateY(0);
      pointer-events: all;
    }
    #ai-panel-header {
      padding: 14px 18px;
      border-bottom: 1px solid rgba(0,200,150,0.12);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(0,200,150,0.05);
      flex-shrink: 0;
    }
    #ai-panel-header .ai-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      letter-spacing: 0.12em;
      color: #00c896;
    }
    #ai-panel-header .ai-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #00c896;
      animation: ai-pulse 2s ease infinite;
    }
    @keyframes ai-pulse {
      0%,100% { box-shadow: 0 0 0 0 rgba(0,200,150,0.4); }
      50%      { box-shadow: 0 0 0 4px rgba(0,200,150,0); }
    }
    #ai-close-btn {
      background: none;
      border: none;
      color: #3d5060;
      cursor: pointer;
      font-size: 18px;
      line-height: 1;
      transition: color 0.2s;
      font-family: 'JetBrains Mono', monospace;
    }
    #ai-close-btn:hover { color: #00c896; }

    #ai-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      scroll-behavior: smooth;
    }
    #ai-messages::-webkit-scrollbar { width: 3px; }
    #ai-messages::-webkit-scrollbar-track { background: transparent; }
    #ai-messages::-webkit-scrollbar-thumb { background: rgba(0,200,150,0.2); }

    .ai-msg {
      max-width: 85%;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      line-height: 1.6;
      padding: 10px 14px;
      animation: ai-fade-in 0.25s ease;
    }
    @keyframes ai-fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
    .ai-msg.ai { 
      align-self: flex-start;
      background: #141c24;
      border: 1px solid rgba(0,200,150,0.12);
      color: #7a909e;
      clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%);
    }
    .ai-msg.user {
      align-self: flex-end;
      background: rgba(0,200,150,0.1);
      border: 1px solid rgba(0,200,150,0.25);
      color: #e2eaf2;
      clip-path: polygon(6px 0, 100% 0, 100% 100%, 0 100%, 0 6px);
    }
    .ai-msg.typing { color: #3d5060; font-style: italic; }

    #ai-input-row {
      padding: 12px 14px;
      border-top: 1px solid rgba(0,200,150,0.12);
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }
    #ai-input {
      flex: 1;
      background: #080c10;
      border: 1px solid rgba(0,200,150,0.15);
      color: #e2eaf2;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      padding: 8px 12px;
      outline: none;
      transition: border-color 0.2s;
    }
    #ai-input:focus { border-color: #00c896; }
    #ai-input::placeholder { color: #3d5060; }
    #ai-send-btn {
      background: #00c896;
      color: #000;
      border: none;
      cursor: pointer;
      padding: 8px 16px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      transition: background 0.2s;
      clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
    }
    #ai-send-btn:hover { background: #00ffb3; }
    #ai-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    @media (max-width: 460px) {
      #ai-panel { width: calc(100vw - 40px); left: 20px; bottom: 88px; }
      #ai-launcher { left: 20px; bottom: 20px; }
    }
  `;
  document.head.appendChild(style);

  /* ── Build DOM ── */
  var launcher = document.createElement('button');
  launcher.id = 'ai-launcher';
  launcher.setAttribute('aria-label', 'Open AI Assistant');
  launcher.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 12 2M9 14a2 2 0 0 0-2 2 2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0-2-2m6 0a2 2 0 0 0-2 2 2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0-2-2z"/>
  </svg>`;

  var panel = document.createElement('div');
  panel.id = 'ai-panel';
  panel.setAttribute('aria-hidden', 'true');
  panel.innerHTML = `
    <div id="ai-panel-header">
      <div class="ai-title"><div class="ai-dot"></div>AI ASSISTANT</div>
      <button id="ai-close-btn" aria-label="Close chat">×</button>
    </div>
    <div id="ai-messages"></div>
    <div id="ai-input-row">
      <input id="ai-input" type="text" placeholder="Ask about Akash..." maxlength="300"/>
      <button id="ai-send-btn">SEND</button>
    </div>
  `;

  document.body.appendChild(launcher);
  document.body.appendChild(panel);

  /* ── Configuration ── */
  // UPDATE THIS with your Vercel URL (or your deployed serverless endpoint)
  var PROXY_URL = 'https://akash-ai.vercel.app/api/api-chat';

  var SYSTEM_PROMPT = 'You are an AI assistant embedded in Akash M\'s personal portfolio website.\n\nAbout Akash M:\n- Data Scientist in training, based in Chennai, Tamil Nadu, India\n- Transitioning into data science with a focus on machine learning, statistical analysis, and business intelligence\n- Available for opportunities — target roles: Data Scientist, ML Engineer, Data Analyst\n\nSkills: Python (80%), SQL (75%), NumPy (90%), Pandas (80%), Matplotlib (60%), Pydantic (85%), ML & DL (60%), Data Science (50%), Scikit-learn (30%), TensorFlow (25%)\n\nLinks:\n- Resume: https://drive.google.com/file/d/1yJ1jHB9g4tk2VCi-35_UljQR8CZSFAlZ/view?usp=sharing\n- GitHub: https://github.com/akashmanivel69-arch\n- LinkedIn: https://www.linkedin.com/in/akash-m-8b134b3a9/\n- Email: akashmanivel69@gmail.com\n\nKeep responses concise and helpful. Answer questions about Akash\'s background, skills, projects, and how to contact him. Speak naturally, not like a robot.';
  var isOpen = false;
  var isWaiting = false;
  var history = [];

  /* ── Helpers ── */
  function addMsg(text, role) {
    var msgs = document.getElementById('ai-messages');
    var div = document.createElement('div');
    div.className = 'ai-msg ' + role;
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }

  function togglePanel() {
    isOpen = !isOpen;
    panel.classList.toggle('open', isOpen);
    panel.setAttribute('aria-hidden', !isOpen);
    if (isOpen && !document.querySelector('.ai-msg')) {
      addMsg("Hi! I'm Akash's AI assistant. Ask me about his skills, projects, background, or how to get in touch.", 'ai');
    }
    if (isOpen) setTimeout(function () { document.getElementById('ai-input').focus(); }, 300);
  }

  async function sendMessage() {
    if (isWaiting) return;
    var input = document.getElementById('ai-input');
    var text = (input.value || '').trim();
    if (!text) return;
    input.value = '';
    addMsg(text, 'user');
    var sendBtn = document.getElementById('ai-send-btn');
    isWaiting = true;
    sendBtn.disabled = true;
    var typingDiv = addMsg('Thinking...', 'ai typing');

    try {
      // Build conversation history for context
      var conversationHistory = history.map(function (h) {
        return (h.role === 'user' ? 'User: ' : 'Assistant: ') + (h.parts ? h.parts[0].text : '');
      }).join('\n');

      var prompt = SYSTEM_PROMPT + '\n\nConversation History:\n' + conversationHistory + '\n\nUser: ' + text;

      var res = await fetch(PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt,
          temperature: 0.7,
          num_predict: 512
        })
      });

      var data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Unknown error: ' + res.status);
      }

      var reply = data.response || 'Sorry, I could not get a response.';

      typingDiv.textContent = reply;
      typingDiv.classList.remove('typing');

      history.push(
        { role: 'user', parts: [{ text: text }] },
        { role: 'model', parts: [{ text: reply }] }
      );
      if (history.length > 20) history = history.slice(-20);

    } catch (err) {
      typingDiv.textContent = 'Error: ' + err.message;
    }

    isWaiting = false;
    sendBtn.disabled = false;
    var msgs = document.getElementById('ai-messages');
    msgs.scrollTop = msgs.scrollHeight;
  }

  /* ── Events ── */
  launcher.addEventListener('click', togglePanel);
  document.getElementById('ai-close-btn').addEventListener('click', function () {
    isOpen = false;
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
  });
  document.getElementById('ai-send-btn').addEventListener('click', sendMessage);
  document.getElementById('ai-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) {
      isOpen = false;
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
    }
  });

})();
