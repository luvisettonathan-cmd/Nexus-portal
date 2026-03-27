// ══════════════════════════════════════════════════════════════
// NEXUS ENGLISH CENTER - PORTAL DO PROFESSOR (FINAL)
// ══════════════════════════════════════════════════════════════

const SUPABASE_URL = 'https://macpqlkefvjfrvotkkqh.supabase.co';
const SUPABASE_KEY = 'COLE_SUA_CHAVE_ANON_AQUI'; /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hY3BxbGtlZnZqZnJ2b3Rra3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NzY1NjEsImV4cCI6MjA5MDE1MjU2MX0.dz0dsXVHOPkobv8ZMOg5UfHHVOQcB5gipT_rJkoQMaE/ <--- COLE SUA CHAVE AQUI DENTRO DAS ASPAS

// ✅ INICIALIZAÇÃO DO CLIENTE
const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let state = {
  screen: 'login', 
  user: null, 
  data: { users: [], quickLinks: [], materials: [], training: [], activities: [], announcements: [], forum: [] }
};

// --- FUNÇÕES DE BANCO DE DADOS ---
async function dbSelect(table, order = 'id') {
  const { data, error } = await client.from(table).select('*').order(order);
  if (error) { console.error(table, error); return []; }
  return data || [];
}

async function loadAll() {
  const [users, quickLinks, materials, training, activities, announcements, forum] = await Promise.all([
    dbSelect('users'),
    dbSelect('quick_links', 'sort_order'),
    dbSelect('materials', 'sort_order'),
    dbSelect('training_steps', 'sort_order'),
    dbSelect('activities'),
    dbSelect('announcements'),
    dbSelect('forum_posts'),
  ]);
  state.data = { users, quickLinks, materials, training, activities, announcements, forum };
  render();
}

const app = document.getElementById('app');

// --- HELPER PARA CRIAR HTML ---
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

  box.appendChild(h('div', { className: 'login-logo' },
    h('div', { className: 'icon' }, '🌐'),
    h('h1', {}, 'Nexus ', h('span', {}, 'English')),
    h('p', {}, 'Portal do Professor')
  ));

  const errDiv = h('div', { id: 'login-error', style: { display: 'none', color: '#ff4444', marginBottom: '10px' } });
  const userInput = h('input', { className: 'form-input', placeholder: 'E-mail' });
  const pwInput = h('input', { className: 'form-input', type: 'password', placeholder: 'Senha' });

  const doLogin = async () => {
    const email = userInput.value.trim();
    const password = pwInput.value;
    errDiv.style.display = 'none';

    // 1. Tenta logar oficialmente no Supabase Auth
    const { data: authData, error: authError } = await client.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (authError) {
      errDiv.textContent = 'E-mail ou senha incorretos';
      errDiv.style.display = 'block';
      return;
    }

    // 2. Busca o perfil na tabela 'users' usando o ID do login
    const { data: userData, error: userError } = await client
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError || !userData) {
      errDiv.textContent = 'Perfil não encontrado na tabela de professores.';
      errDiv.style.display = 'block';
      return;
    }

    state.user = userData;
    state.screen = 'portal';
    await loadAll();
  };

  box.append(
    userInput,
    pwInput,
    errDiv,
    h('button', { className: 'btn-full', onClick: doLogin }, 'Entrar')
  );

  wrap.appendChild(box);
  return wrap;
}

// --- TELA DO PORTAL ---
function renderPortal() {
  return h('div', { style: { padding: '40px', color: '#fff', textAlign: 'center' } }, 
    h('h2', {}, `Bem-vindo, ${state.user.name || 'Admin'} ✅`),
    h('p', {}, `Acesso nível: ${state.user.role}`),
    h('button', { 
      style: { marginTop: '20px', padding: '10px' }, 
      onClick: () => window.location.reload() 
    }, 'Sair')
  );
}

render();
