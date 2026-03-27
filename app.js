// ══════════════════════════════════════════════════════════════
// NEXUS ENGLISH CENTER - PORTAL COMPLETO (FINAL CORRIGIDO)
// ══════════════════════════════════════════════════════════════

const SUPABASE_URL = 'https://macpqlkefvjfrvotkkqh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hY3BxbGtlZnZqZnJ2b3Rra3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NzY1NjEsImV4cCI6MjA5MDE1MjU2MX0.dz0dsXVHOPkobv8ZMOg5UfHHVOQcB5gipT_rJkoQMaE'; // 

const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const MODULES = [
  { id: 'starter', label: 'Starter', color: '#ea580c', accent: '#ffedd5', icon: '🌱' },
  { id: 'a1', label: 'A1', color: '#2563eb', accent: '#bfdbfe', icon: '📘' },
  { id: 'a2', label: 'A2', color: '#7c3aed', accent: '#ddd6fe', icon: '📗' },
  { id: 'b1', label: 'B1', color: '#d97706', accent: '#fde68a', icon: '📙' },
  { id: 'b2', label: 'B2', color: '#dc2626', accent: '#fecaca', icon: '📕' },
];

let state = {
  screen: 'login', user: null, tab: 'materials', activeModule: 'starter',
  data: { users: [], quickLinks: [], materials: [], training: [], activities: [], announcements: [], forum: [] },
};

// --- BANCO DE DADOS ---
async function dbSelect(table, order = 'id') {
  const { data, error } = await client.from(table).select('*').order(order);
  if (error) return [];
  return data || [];
}

async function loadAll() {
  const [quickLinks, materials, training, announcements] = await Promise.all([
    dbSelect('quick_links', 'sort_order'),
    dbSelect('materials', 'sort_order'),
    dbSelect('training_steps', 'sort_order'),
    dbSelect('announcements'),
  ]);
  state.data = { ...state.data, quickLinks, materials, training, announcements };
  render();
}

const app = document.getElementById('app');

function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
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

function render() {
  app.innerHTML = '';
  if (state.screen === 'login') app.appendChild(renderLogin());
  else app.appendChild(renderPortal());
}

// --- TELA DE LOGIN ---
function renderLogin() {
  const wrap = h('div', { className: 'login-screen' });
  const box = h('div', { className: 'login-box' });
  box.innerHTML = `
    <div class="login-logo">
      <div class="icon">🌐</div>
      <h1>Nexus <span>English</span></h1>
      <p>Portal do Professor</p>
    </div>
  `;
  
  const errDiv = h('div', { style: { display: 'none', color: '#ff4444', marginBottom: '10px', fontSize: '14px' } });
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
    
    state.user = userData;
    state.screen = 'portal';
    await loadAll();
  };

  box.append(userInput, pwInput, errDiv, h('button', { className: 'btn-full', onClick: doLogin }, 'Entrar'));
  wrap.appendChild(box);
  return wrap;
}

// --- TELA DO PORTAL (COM TODA A INTERFACE) ---
function renderPortal() {
  const mod = MODULES.find(m => m.id === state.activeModule);
  
  return h('div', { className: 'portal-container' },
    // Sidebar
    h('aside', { className: 'sidebar' },
      h('div', { className: 'nav-logo' }, 'NEXUS'),
      h('nav', {}, 
        h('div', { className: `nav-item ${state.tab === 'materials' ? 'active' : ''}`, onClick: () => { state.tab = 'materials'; render(); } }, '📚 Materiais'),
        h('div', { className: `nav-item ${state.tab === 'training' ? 'active' : ''}`, onClick: () => { state.tab = 'training'; render(); } }, '🎓 Treinamento')
      ),
      h('div', { style: { marginTop: 'auto', padding: '10px', fontSize: '12px', opacity: 0.7 } }, `Logado como: ${state.user.name}`)
    ),
    
    // Conteúdo Principal
    h('main', { className: 'main-content' },
      h('header', { className: 'main-header' },
        h('h2', {}, state.tab === 'materials' ? 'Materiais Didáticos' : 'Treinamento Profissional'),
        h('button', { className: 'btn-logout', onClick: () => window.location.reload() }, 'Sair')
      ),
      
      // Se estiver em materiais, mostra os botões de níveis (Starter, A1, etc)
      state.tab === 'materials' ? h('div', { className: 'module-grid' },
        MODULES.map(m => h('div', { 
          className: `module-card ${state.activeModule === m.id ? 'active' : ''}`,
          style: { borderTop: `4px solid ${m.color}` },
          onClick: () => { state.activeModule = m.id; render(); }
        }, 
          h('span', { className: 'module-icon' }, m.icon),
          h('span', {}, m.label)
        ))
      ) : null,

      // Lista de materiais filtrados por nível
      h('section', { className: 'content-section' },
        h('h3', {}, `Arquivos do nível ${mod.label}`),
        h('div', { className: 'files-list' }, 
          state.data.materials
            .filter(item => item.level === state.activeModule)
            .map(item => h('div', { className: 'file-row' }, 
              h('span', {}, '📄'),
              h('span', { style: { flex: 1, marginLeft: '10px' } }, item.title),
              h('a', { href: item.url, target: '_blank', className: 'btn-download' }, 'Abrir')
            ))
        )
      )
    )
  );
}

render();
