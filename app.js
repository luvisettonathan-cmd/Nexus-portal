// ══════════════════════════════════════════════════════════════
// NEXUS ENGLISH CENTER - PORTAL DO PROFESSOR
// ══════════════════════════════════════════════════════════════
 
const SUPABASE_URL = 'https://macpqlkefvjfrvotkkqh.supabase.co';
const SUPABASE_KEY = 'SUA_KEY_AQUI';
 
// 🔥 CORREÇÃO PRINCIPAL
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
 
  const errDiv = h('div', { id: 'login-error', style: { display: 'none' }, className: 'error-box' });
  const userInput = h('input', { className: 'form-input' });
  const pwInput = h('input', { className: 'form-input', type: 'password' });
 
  const doLogin = async () => {
    const username = userInput.value.toLowerCase().trim();
    const password = pwInput.value;
 
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();
 
    if (error || !data) {
      errDiv.textContent = 'Erro login';
      errDiv.style.display = 'block';
      return;
    }
 
    state.user = data;
    state.screen = 'portal';
    await loadAll();
  };
 
  box.append(userInput, pwInput, errDiv,
    h('button', { onClick: doLogin }, 'Entrar')
  );
 
  wrap.appendChild(box);
  return wrap;
}
 
function renderPortal() {
  return h('div', {}, 'LOGADO ✅');
}
 
render();
