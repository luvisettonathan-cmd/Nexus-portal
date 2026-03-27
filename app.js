// ══════════════════════════════════════════════════════════════
// NEXUS ENGLISH CENTER - PORTAL FINAL COM LOGO E GLAMOUR
// ══════════════════════════════════════════════════════════════

const SUPABASE_URL = 'https://macpqlkefvjfrvotkkqh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hY3BxbGtlZnZqZnJ2b3Rra3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NzY1NjEsImV4cCI6MjA5MDE1MjU2MX0.dz0dsXVHOPkobv8ZMOg5UfHHVOQcB5gipT_rJkoQMaEI'; // 

// Link direto para o logo que você me mandou
const NEXUS_LOGO_URL = 'https://i.ibb.co/6P0J9X4/nexus-logo.png'; 

const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const MODULES = [
  { id: 'starter', label: 'Starter', color: '#16a34a' },
  { id: 'a1', label: 'A1', color: '#2563eb' },
  { id: 'a2', label: 'A2', color: '#84cc16' },
  { id: 'b1', label: 'B1', color: '#ea580c' },
  { id: 'b2', label: 'B2', color: '#be123c' },
];

let state = {
  screen: 'login', // Ativa a tela de login
  user: null, 
  tab: 'materiais', 
  activeModule: 'starter',
  data: { quickLinks: [], materials: [] }
};

// --- FUNÇÕES DE BANCO DE DADOS ---
async function dbSelect(table, order = 'id') {
  const { data, error } = await client.from(table).select('*').order(order);
  if (error) return [];
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

// --- HELPER HTML ---
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

// --- TELA DE LOGIN COM LOGO CENTRALIZADO ---
function renderLogin() {
  const wrap = h('div', { className: 'login-screen' });
  const box = h('div', { className: 'login-box' });
  
  // Imagem do logo no topo da caixa de login
  const logoImg = h('img', { 
    src: NEXUS_LOGO_URL, 
    alt: 'Nexus English Center Logo',
    style: { maxWidth: '220px', marginBottom: '20px', display: 'block', margin: '0 auto 20px' } 
  });
  
  const loginHeader = h('div', { className: 'login-logo', style: { textAlign: 'center' } },
    h('p', { style: { fontSize:'14px', color:'#667e70', fontWeight:'700', textTransform:'uppercase', letterSpacing:'1px' } }, 'Portal do Professor')
  );

  const errDiv = h('div', { style: { display: 'none', color: '#ff4444', marginBottom: '15px' } });
  const userInput = h('input', { className: 'form-input', placeholder: 'Seu e-mail cadastrado' });
  const pwInput = h('input', { className: 'form-input', type: 'password', placeholder: 'Sua senha' });

  const doLogin = async () => {
    const email = userInput.value.trim();
    const password = pwInput.value;

    const { data: authData, error: authError } = await client.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (authError) {
      errDiv.textContent = 'E-mail ou senha incorretos';
      errDiv.style.display = 'block';
      return;
    }

    const { data: userData } = await client.from('users').select('*').eq('id', authData.user.id).single();
    state.user = userData || { name: 'Teacher' };
    state.screen = 'portal';
    await loadAll();
  };

  box.append(logoImg, loginHeader, userInput, pwInput, errDiv, h('button', { className: 'btn-full', onClick: doLogin }, 'Entrar'));
  wrap.appendChild(box);
  return wrap;
}

// --- TELA DO PORTAL COM LOGO NO HEADER VERDE ---
function renderPortal() {
  // Imagem do logo no cabeçalho verde, menor e alinhada
  const headerLogo = h('img', { 
    src: NEXUS_LOGO_URL, 
    alt: 'Nexus Logo', 
    style: { maxHeight: '35px', marginRight: '15px' } 
  });

  // Header
  const header = h('header', { className: 'header-main' },
    h('div', { style: { display: 'flex', alignItems: 'center' } },
      headerLogo,
      h('div', {}, h('strong', { style: 'font-size:18px' }, 'Portal do Professor'))
    ),
    h('div', { style: { background:'rgba(255,255,255,0.2)', padding:'8px 20px', borderRadius:'30px', color:'white' } }, `👋 Olá, ${state.user.name}!`)
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
    
    h('div', { className: 'section-title' }, '🔗 ACESSO RÁPIDO – TODOS OS RECURSOS'),
    h('div', { className: 'quick-grid', id: 'quick-box' }),

    h('div', { className: 'section-title' }, '📖 MATERIAIS POR MÓDULO'),
    h('div', { className: 'filter-bar', id: 'filter-box' }),
    h('div', { className: 'materials-grid', id: 'content-box' })
  );

  app.append(header, nav, container);
  
  // 1. Preencher Quick Links (Dados reais do Supabase)
  const quickBox = document.getElementById('quick-box');
  if (state.data.quickLinks.length === 0) {
    quickBox.innerHTML = '<p style="color:#889e91; font-size:14px; padding:10px;">Nenhum link rápido cadastrado no banco.</p>';
  }
  state.data.quickLinks.forEach(link => {
    quickBox.appendChild(h('div', { className: 'card-base', onClick: () => window.open(link.url, '_blank') },
      h('div', { className: 'icon-box' }, link.icon || '📚'),
      h('strong', {}, link.title)
    ));
  });

  // 2. Preencher Filtros (Botoes Starter, A1...)
  const filterBox = document.getElementById('filter-box');
  MODULES.forEach(m => {
    filterBox.appendChild(h('button', { 
      className: `btn-filter ${state.activeModule === m.id ? 'active' : ''}`,
      onClick: () => { state.activeModule = m.id; render(); }
    }, h('span', { style: { color: m.color } }, '●'), ` ${m.label}`));
  });

  // 3. Preencher Materiais (Dados reais e filtrados do Supabase)
  const contentBox = document.getElementById('content-box');
  const filtered = state.data.materials.filter(d => d.level === state.activeModule);
  
  if (filtered.length === 0) {
    contentBox.innerHTML = `<p style="color:#889e91; padding:20px; font-size:14px;">Nenhum material encontrado para o nível ${MODULES.find(m=>m.id===state.activeModule).label}.</p>`;
  } else {
    filtered.forEach(doc => {
      contentBox.appendChild(h('div', { className: 'card-base', onClick: () => window.open(doc.url, '_blank') },
        h('div', { className: 'icon-box' }, '📄'),
        h('div', {}, 
          h('strong', {}, doc.title), h('br'),
          h('span', { className: `badge bg-${doc.type || 'drive'}` }, (doc.type || 'DRIVE').toUpperCase())
        )
      ));
    });
  }
}

// Inicia buscando os dados (e mostra a tela de login primeiro)
render();
