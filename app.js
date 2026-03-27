// ══════════════════════════════════════════════════════════════
// NEXUS ENGLISH CENTER - PORTAL DO PROFESSOR (VERSÃO FINAL CORRIGIDA)
// ══════════════════════════════════════════════════════════════

const SUPABASE_URL = 'https://macpqlkefvjfrvotkkqh.supabase.co';
// 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hY3BxbGtlZnZqZnJ2b3Rra3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NzY1NjEsImV4cCI6MjA5MDE1MjU2MX0.dz0dsXVHOPkobv8ZMOg5UfHHVOQcB5gipT_rJkoQMaE'; 

const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// LINK DO SEU LOGO VERDADEIRO (PRETO E LARANJA)
const NEXUS_LOGO_URL = 'https://i.ibb.co/6P0J9X4/nexus-logo.png'; 

const MODULES = [
  { id: 'starter', label: 'Starter', color: '#16a34a' },
  { id: 'a1', label: 'A1', color: '#2563eb' },
  { id: 'a2', label: 'A2', color: '#84cc16' },
  { id: 'b1', label: 'B1', color: '#ea580c' },
  { id: 'b2', label: 'B2', color: '#be123c' },
];

let state = {
  screen: 'login', 
  user: null, 
  activeModule: 'starter',
  data: { quickLinks: [], materials: [] }
};

// --- FUNÇÃO PARA VERIFICAR SESSÃO AO CARREGAR ---
async function checkUser() {
  const { data: { session } } = await client.auth.getSession();
  if (session) {
    state.user = session.user;
    state.screen = 'portal';
    await loadAll(); // Carrega os dados reais do banco
  } else {
    state.screen = 'login';
    render();
  }
}

// --- BANCO DE DADOS: PUXAR DADOS REAIS ---
async function dbSelect(table, order = 'id') {
  const { data, error } = await client.from(table).select('*').order(order);
  if (error) { console.error(`Erro na tabela ${table}:`, error); return []; }
  return data || [];
}

async function loadAll() {
  const [links, docs] = await Promise.all([
    dbSelect('quick_links', 'sort_order'),
    dbSelect('materials', 'title')
  ]);
  state.data.quickLinks = links;
  state.data.materials = docs;
  render();
}

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
function renderLogin(app) {
  const wrap = document.createElement('div');
  wrap.className = 'login-screen';
  wrap.innerHTML = `
    <div class="login-box">
      <img src="${NEXUS_LOGO_URL}" alt="Nexus Logo" style="max-width:220px; margin-bottom:20px; display:block; margin:0 auto 20px">
      <p style="font-size:14px; color:#667e70; font-weight:700; text-transform:uppercase; letter-spacing:1px; text-align:center">Portal do Professor</p>
      <div id="login-err" style="display:none; color:#ff4444; margin-bottom:15px; font-size:14px; text-align:center;">E-mail ou senha incorretos</div>
      <input type="text" id="email" class="form-input" placeholder="E-mail">
      <input type="password" id="pass" class="form-input" placeholder="Senha">
      <button id="btn-entrar" class="btn-full">Entrar</button>
    </div>
  `;
  app.appendChild(wrap);

  document.getElementById('btn-entrar').onclick = async () => {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('pass').value;

    if (!email || !password) {
        document.getElementById('login-err').textContent = 'Preencha todos os campos';
        document.getElementById('login-err').style.display = 'block';
        return;
    }

    const { data, error } = await client.auth.signInWithPassword({ email, password });

    if (error) {
      document.getElementById('login-err').textContent = 'E-mail ou senha incorretos';
      document.getElementById('login-err').style.display = 'block';
    } else {
      state.user = data.user;
      state.screen = 'portal';
      await loadAll();
    }
  };
}

// --- TELA DO PORTAL ---
function renderPortal(app) {
  const main = document.createElement('div');
  main.innerHTML = `
    <header class="header-main">
      <div style="display:flex; align-items:center">
        <img src="${NEXUS_LOGO_URL}" alt="Nexus Logo" style="max-height:40px; margin-right:15px">
        <div><strong style="font-size:18px">Portal do Professor</strong></div>
      </div>
      <div style="display:flex; gap:10px; align-items:center;">
        <div style="background:rgba(255,255,255,0.2); padding:8px 20px; border-radius:30px; font-size:13px; color:white">👋 Olá, Teacher!</div>
        <button id="btn-sair" style="background:none; border:1px solid rgba(255,255,255,0.4); color:white; border-radius:15px; padding:5px 10px; cursor:pointer; font-size:11px;">Sair</button>
      </div>
    </header>

    <div class="nav-bar">
      <div class="nav-item active">Materiais</div>
      <div class="nav-item">Treinamento</div>
      <div class="nav-item">Atividades</div>
      <div class="nav-item">Avisos</div>
    </div>

    <div class="container">
      <h1 style="color:#1a2b21; font-family:serif; margin-bottom:5px;">Materiais Extras</h1>
      <p class="subtitle">Acesse todos os recursos organizados por módulo. Os links abrem diretamente no Google Drive ou YouTube.</p>
      
      <div class="section-title">🔗 ACESSO RÁPIDO – TODOS OS RECURSOS</div>
      <div class="quick-grid" id="q-links"></div>

      <div class="section-title" style="margin-top:40px">📖 MATERIAIS POR MÓDULO</div>
      <div class="filter-bar" id="f-bar"></div>
      <div class="materials-grid" id="m-grid"></div>
    </div>
  `;
  app.appendChild(main);

  // Botão Sair
  document.getElementById('btn-sair').onclick = async () => {
    await client.auth.signOut();
    state.screen = 'login';
    state.user = null;
    render();
  };

  // --- SOLUÇÃO PROBLEMA 1: PREENCHER COM LINKS REAIS DO BANCO ---
  
  // 1. Acesso Rápido
  const qLinksArea = document.getElementById('q-links');
  if (state.data.quickLinks.length === 0) {
    qLinksArea.innerHTML = '<p style="color:#889e91; font-size:14px;">Cadastre links na tabela quick_links do Supabase.</p>';
  }

  state.data.quickLinks.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card-base';
    // Adiciona o ícone e o título reais do banco
    card.innerHTML = `<div class="icon-box">${item.icon || '🔗'}</div><strong style="color:#1a2b21 !important">${item.title}</strong>`;
    
    // !!! ESTA É A CORREÇÃO: ADICIONA O CLIQUE !!!
    card.onclick = () => {
        if (item.url) window.open(item.url, '_blank');
        else alert('Este item não possui um link cadastrado.');
    };
    qLinksArea.appendChild(card);
  });

  // 2. Filtros de Módulo
  const fBarArea = document.getElementById('f-bar');
  MODULES.forEach(m => {
    const btn = document.createElement('button');
    btn.className = `btn-filter ${state.activeModule === m.id ? 'active' : ''}`;
    btn.innerHTML = `<span style="color:${m.color}">●</span> ${m.label}`;
    btn.onclick = () => { state.activeModule = m.id; render(); };
    fBarArea.appendChild(btn);
  });

  // 3. Materiais do Módulo (Filtrados)
  const mGridArea = document.getElementById('m-grid');
  const filteredDocs = state.data.materials.filter(doc => doc.level === state.activeModule);

  if (filteredDocs.length === 0) {
    mGridArea.innerHTML = `<p style="color:#889e91; padding:20px; font-size:14px;">Nenhum material cadastrado para o nível ${state.activeModule.toUpperCase()} ainda.</p>`;
  } else {
    filteredDocs.forEach(doc => {
      const card = document.createElement('div');
      card.className = 'card-base';
      const fileType = (doc.type || 'drive').toLowerCase();
      
      card.innerHTML = `
        <div class="icon-box">📄</div>
        <div>
          <strong style="color:#1a2b21 !important">${doc.title}</strong><br>
          <span class="badge bg-${fileType}">${fileType.toUpperCase()}</span>
        </div>
      `;

      // !!! ESTA É A CORREÇÃO: ADICIONA O CLIQUE !!!
      card.onclick = () => {
        if (doc.url) window.open(doc.url, '_blank');
        else alert('Este material não possui um link cadastrado.');
      };
      mGridArea.appendChild(card);
    });
  }
}

// Inicia verificando se já está logado
checkUser();
