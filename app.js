// ══════════════════════════════════════════════════════════════
// NEXUS ENGLISH CENTER - PORTAL DO PROFESSOR (VERSÃO FINAL VERDE)
// ══════════════════════════════════════════════════════════════

const SUPABASE_URL = 'https://macpqlkefvjfrvotkkqh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hY3BxbGtlZnZqZnJ2b3Rra3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NzY1NjEsImV4cCI6MjA5MDE1MjU2MX0.dz0dsXVHOPkobv8ZMOg5UfHHVOQcB5gipT_rJkoQMaE'; // 

const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Configuração dos Módulos
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
  tab: 'materiais', 
  activeModule: 'starter',
  data: { quickLinks: [], materials: [] }
};

// --- FUNÇÕES DE BANCO DE DADOS ---
async function dbSelect(table, order = 'id') {
  const { data, error } = await client.from(table).select('*').order(order);
  if (error) { console.error(table, error); return []; }
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

// --- HELPER PARA CRIAR HTML (h function) ---
function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'className') el.className = v;
    else if (k === 'innerHTML') el.innerHTML = v;
    else el.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c == null) continue;
    el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return el;
}

const app = document.getElementById('app');

function render() {
  app.innerHTML = '';
  if (state.screen === 'login') {
    app.appendChild(renderLogin());
  } else {
    renderPortal();
  }
}

// --- TELA DE LOGIN ---
function renderLogin() {
  const wrap = h('div', { className: 'login-screen' });
  const box = h('div', { className: 'login-box' });
  
  box.innerHTML = `
    <div class="login-logo">
      <h1 style="color:white">Nexus <span>English</span></h1>
      <p>Portal do Professor</p>
    </div>
  `;

  const errDiv = h('div', { style: { display: 'none', color: '#ff4444', marginBottom: '15px' } });
  const userInput = h('input', { className: 'form-input', placeholder: 'E-mail' });
  const pwInput = h('input', { className: 'form-input', type: 'password', placeholder: 'Senha' });

  const doLogin = async () => {
    const { data: authData, error: authError } = await client.auth.signInWithPassword({
      email: userInput.value.trim(),
      password: pwInput.value,
    });

    if (authError) {
      errDiv.textContent = 'E-mail ou senha incorretos';
      errDiv.style.display = 'block';
      return;
    }

    const { data: userData } = await client.from('users').select('*').eq('id', authData.user.id).single();
    state.user = userData || { name: 'Professor' };
    state.screen = 'portal';
    await loadAll();
  };

  box.append(userInput, pwInput, errDiv, h('button', { className: 'btn-full', onClick: doLogin }, 'Entrar'));
  wrap.appendChild(box);
  return wrap;
}

// --- TELA DO PORTAL ---
function renderPortal() {
  // Header
  const header = h('header', { className: 'header-main' },
    h('div', {}, h('strong', {}, 'Nexus English Center'), h('br'), h('small', {}, 'PORTAL DO PROFESSOR')),
    h('div', { style: { background:'rgba(255,255,255,0.2)', padding:'8px 20px', borderRadius:'30px', cursor:'pointer' }, onClick: () => window.location.reload() }, `👋 Olá, ${state.user.name || 'Teacher'}!`)
  );

  // Nav
  const nav = h('div', { className: 'nav-bar' },
    ['Materiais', 'Treinamento', 'Atividades', 'Avisos'].map(t => 
      h('div', { 
        className: `nav-item ${state.tab === t.toLowerCase() ? 'active' : ''}`,
        onClick: () => { state.tab = t.toLowerCase(); render(); }
      }, t)
    )
  );

  // Conteúdo Principal
  const container = h('div', { className: 'container' },
    h('h1', {}, 'Materiais Extras'),
    h('p', { className: 'subtitle' }, 'Acesse todos os recursos organizados por módulo.'),
    
    h('div', { className: 'section-title' }, '🔗 Acesso Rápido – Todos os recursos'),
    h('div', { className: 'quick-grid', id: 'quick-links' }),

    h('div', { className: 'section-title' }, '📖 Materiais por Módulo'),
    h('div', { className: 'filter-bar', id: 'module-filters' }),
    h('div', { className: 'materials-grid', id: 'module-materials' })
  );

  app.append(header, nav, container);
  
  // Preencher Links Rápidos
  const quickBox = document.getElementById('quick-links');
  state.data.quickLinks.forEach(link => {
    quickBox.appendChild(h('div', { className: 'card-base', onClick: () => window.open(link.url, '_blank') },
      h('div', { className: 'icon-box' }, link.icon || '📚'),
      h('strong', {}, link.title)
    ));
  });

  // Preencher Filtros de Módulo
  const filterBox = document.getElementById('module-filters');
  MODULES.forEach(m => {
    filterBox.appendChild(h('button', { 
      className: `btn-filter ${state.activeModule === m.id ? 'active' : ''}`,
      onClick: () => { state.activeModule = m.id; render(); }
    }, h('span', { style: { color: m.color } }, '●'), ` ${m.label}`));
  });

  // Preencher Materiais do Módulo
  const materialsBox = document.getElementById('module-materials');
  const filtered = state.data.materials.filter(doc => doc.level === state.activeModule);
  
  if (filtered.length === 0) {
    materialsBox.innerHTML = '<p style="color:#889e91; padding:20px;">Nenhum material para este nível ainda.</p>';
  } else {
    filtered.forEach(doc => {
      materialsBox.appendChild(h('div', { className: 'card-base', onClick: () => window.open(doc.url, '_blank') },
        h('div', { className: 'icon-box' }, '📄'),
        h('div', {}, 
          h('strong', {}, doc.title), h('br'),
          h('span', { className: `badge bg-${doc.type || 'drive'}` }, (doc.type || 'DRIVE').toUpperCase())
        )
      ));
    });
  }
}

render();
