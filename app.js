// ══════════════════════════════════════════════════════════════
// NEXUS ENGLISH CENTER - PORTAL DO PROFESSOR (VERSÃO CORRIGIDA)
// ══════════════════════════════════════════════════════════════

const SUPABASE_URL = 'https://macpqlkefvjfrvotkkqh.supabase.co';
const SUPABASE_KEY = 'SUA_KEY_AQUI'; // Lembre-se de manter sua chave real aqui

// ✅ CLIENTE SUPABASE
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
  completedSteps: [], likedPosts: [], levelFilter: 'all', typeFilter: 'all',
};

async function dbSelect(table, order = 'id') {
  const { data, error } = await client.from(table).select('*').order(order);
  if (error) { console.error(table, error); return []; }
  return data || [];
}

async function dbInsert(table, row) {
  const { data, error } = await client.from(table).insert(row).select();
  if (error) { console.error('Insert', error); return null; }
  return data?.[0];
}

async function dbUpdate(table, id, updates) {
  const { error } = await client.from(table).update(updates).eq('id', id);
  if (error) console.error('Update', error);
}

async function dbDelete(table, id) {
  const { error } = await client.from(table).delete().eq('id', id);
  if (error) console.error('Delete', error);
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

function renderLogin() {
  const wrap = h('div', { className: 'login-screen' });
  const box = h('div', { className: 'login-box' });

  box.appendChild(h('div', { className: 'login-logo' },
    h('div', { className: 'icon' }, '🌐'),
    h('h1', {}, 'Nexus ', h('span', {}, 'English')),
    h('p', {}, 'Portal do Professor')
  ));

  const errDiv = h('div', { id: 'login-error', style: { display: 'none', color: '#ff4444', marginBottom: '10px' }, className: 'error-box' });
  const userInput = h('input', { className: 'form-input', placeholder: 'E-mail ou Usuário' });
  const pwInput = h('input', { className: 'form-input', type: 'password', placeholder: 'Senha' });

  const doLogin = async () => {
    const email = userInput.value.trim();
    const password = pwInput.value;

    errDiv.style.display = 'none';

    // 1️⃣ Tenta autenticar no Supabase Auth
    const { data: authData, error: authError } = await client.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (authError) {
      errDiv.textContent = 'E-mail ou senha incorretos';
      errDiv.style.display = 'block';
      return;
    }

    // 2️⃣ Se autenticou, busca os dados do perfil na tabela 'users' pelo ID
    const { data: userData, error: userError } = await client
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError || !userData) {
      // Se o usuário existe no Auth mas não na tabela 'users'
      errDiv.textContent = 'Perfil não encontrado na base de dados.';
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

function renderPortal() {
  // Pegamos o nome da tabela 'users' (coluna 'name') ou usamos o username como fallback
  const displayName = state.user.name || state.user.username || 'Professor';
  return h('div', { style: { padding: '40px', textAlign: 'center' } }, 
    h('h2', { style: { color: '#fff' } }, `Bem-vindo, ${displayName} ✅`),
    h('p', { style: { color: '#ccc' } }, `Cargo: ${state.user.role}`),
    h('button', { 
        style: { marginTop: '20px', padding: '10px 20px', cursor: 'pointer' },
        onClick: () => { window.location.reload(); } 
    }, 'Sair')
  );
}

render();
