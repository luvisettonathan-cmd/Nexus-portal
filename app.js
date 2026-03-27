// ══════════════════════════════════════════════════════════════
// NEXUS ENGLISH CENTER - PORTAL DO PROFESSOR (VERSÃO FINAL VERDE)
// ══════════════════════════════════════════════════════════════

const SUPABASE_URL = 'https://macpqlkefvjfrvotkkqh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hY3BxbGtlZnZqZnJ2b3Rra3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NzY1NjEsImV4cCI6MjA5MDE1MjU2MX0.dz0dsXVHOPkobv8ZMOg5UfHHVOQcB5gipT_rJkoQMaE'; // 

const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const NEXUS_LOGO_URL = 'https://i.ibb.co/6P0J9X4/nexus-logo.png'; 

const MODULES = [
  { id: 'starter', label: 'Starter', color: '#16a34a' },
  { id: 'a1', label: 'A1', color: '#2563eb' },
  { id: 'a2', label: 'A2', color: '#84cc16' },
  { id: 'b1', label: 'B1', color: '#ea580c' },
  { id: 'b2', label: 'B2', color: '#be123c' },
];

let state = {
  screen: 'login', // Inicia sempre na tela de login
  user: null, 
  activeModule: 'starter'
};

function render() {
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = '';

  if (state.screen === 'login') {
    renderLogin(app);
  } else {
    renderPortal(app);
  }
}

// --- TELA DE LOGIN ---
async function renderLogin(app) {
  const wrap = document.createElement('div');
  wrap.className = 'login-screen';
  wrap.innerHTML = `
    <div class="login-box">
      <img src="${NEXUS_LOGO_URL}" style="max-width:220px; margin-bottom:20px; display:block; margin:0 auto 20px">
      <p style="font-size:14px; color:#667e70; font-weight:700; text-transform:uppercase; letter-spacing:1px; text-align:center">Portal do Professor</p>
      <div id="login-err" style="display:none; color:#ff4444; margin-bottom:15px; font-size:14px; text-align:center;">E-mail ou senha incorretos</div>
      <input type="text" id="email" class="form-input" placeholder="E-mail">
      <input type="password" id="pass" class="form-input" placeholder="Senha">
      <button id="btn-entrar" class="btn-full">Entrar</button>
    </div>
  `;
  app.appendChild(wrap);

  document.getElementById('btn-entrar').onclick = async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('pass').value;

    const { data, error } = await client.auth.signInWithPassword({ email, password });

    if (error) {
      document.getElementById('login-err').style.display = 'block';
    } else {
      state.user = data.user;
      state.screen = 'portal';
      render();
    }
  };
}

// --- TELA DO PORTAL (CONTEÚDO INTERNO) ---
function renderPortal(app) {
  const main = document.createElement('div');
  main.innerHTML = `
    <header class="header-main">
      <div style="display:flex; align-items:center">
        <img src="${NEXUS_LOGO_URL}" style="max-height:35px; margin-right:15px">
        <div><strong style="font-size:18px">Portal do Professor</strong></div>
      </div>
      <div style="background:rgba(255,255,255,0.2); padding:8px 20px; border-radius:30px; font-size:13px; color:white">👋 Olá, Teacher!</div>
    </header>

    <div class="nav-bar">
      <div class="nav-item active">Materiais</div>
      <div class="nav-item">Treinamento</div>
      <div class="nav-item">Atividades</div>
      <div class="nav-item">Avisos</div>
    </div>

    <div class="container">
      <h1 style="color:#1a2b21; font-family:serif; margin-bottom:5px;">Materiais Extras</h1>
      <p class="subtitle">Acesse todos os recursos organizados por módulo.</p>
      
      <div class="section-title">🔗 ACESSO RÁPIDO – TODOS OS RECURSOS</div>
      <div class="quick-grid" id="q-links"></div>

      <div class="section-title" style="margin-top:40px">📖 MATERIAIS POR MÓDULO</div>
      <div class="filter-bar" id="f-bar"></div>
      <div class="materials-grid" id="m-grid"></div>
    </div>
  `;
  app.appendChild(main);

  // 1. Preencher ACESSO RÁPIDO (Nomes agora aparecem!)
  const qLinksArea = document.getElementById('q-links');
  const items = [
    {i:'📚', t:'Livros 2026'}, {i:'🎧', t:'Áudios dos Livros'}, {i:'🎯', t:'Extra Activities'},
    {i:'📜', t:'B2 Scripts'}, {i:'📂', t:'Material para Aulas'}, {i:'🎵', t:'Listening B2'},
    {i:'💬', t:'Conversations 2026'}, {i:'📝', t:'Transcripts A1/A2/B1'}, {i:'📋', t:'Guias Starter'}, {i:'🐛', t:'Erros e Sugestões'}
  ];

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card-base';
    card.innerHTML = `
      <div class="icon-box">${item.i}</div>
      <strong style="color:#1a2b21 !important; font-size:14px;">${item.t}</strong>
    `;
    qLinksArea.appendChild(card);
  });

  // 2. Preencher FILTROS (Starter, A1, etc)
  const fBarArea = document.getElementById('f-bar');
  MODULES.forEach(m => {
    const btn = document.createElement('button');
    btn.className = `btn-filter ${state.activeModule === m.id ? 'active' : ''}`;
    btn.innerHTML = `<span style="color:${m.color}">●</span> ${m.label}`;
    btn.onclick = () => { state.activeModule = m.id; render(); };
    fBarArea.appendChild(btn);
  });

  // 3. Preencher MATERIAIS DO MÓDULO
  const mGridArea = document.getElementById('m-grid');
  if (state.activeModule === 'starter') {
    const docs = [
      {t:'Guias Starter', type:'DOC'}, {t:'Livros 2026 – Starter', type:'DRIVE'}, 
      {t:'Extra Activities', type:'DRIVE'}, {t:'Áudios dos Livros', type:'YT'}
    ];
    docs.forEach(d => {
      const card = document.createElement('div');
      card.className = 'card-base';
      card.innerHTML = `
        <div class="icon-box">📄</div>
        <div>
          <strong style="color:#1a2b21 !important">${d.t}</strong><br>
          <span class="badge bg-${d.type.toLowerCase()}">${d.type}</span>
        </div>
      `;
      mGridArea.appendChild(card);
    });
  } else {
    mGridArea.innerHTML = `<p style="color:#889e91; padding:20px; font-size:14px;">Ainda não há materiais para ${state.activeModule.toUpperCase()}.</p>`;
  }
}

// Inicia o app
render();
