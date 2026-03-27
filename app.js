// ══════════════════════════════════════════════════════════════
// NEXUS ENGLISH CENTER - PORTAL DO PROFESSOR
// ══════════════════════════════════════════════════════════════
 
const SUPABASE_URL = 'https://macpqlkefvjfrvotkkqh.supabase.co';
const SUPABASE_KEY = 'sb_publishable__WDHiS8o0XzahIfeuGx4kw_M5iUu-qp';
 
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
 
const MODULES = [
  { id: 'starter', label: 'Starter', color: '#ea580c', accent: '#ffedd5', icon: '🌱' },
  { id: 'a1', label: 'A1', color: '#2563eb', accent: '#bfdbfe', icon: '📘' },
  { id: 'a2', label: 'A2', color: '#7c3aed', accent: '#ddd6fe', icon: '📗' },
  { id: 'b1', label: 'B1', color: '#d97706', accent: '#fde68a', icon: '📙' },
  { id: 'b2', label: 'B2', color: '#dc2626', accent: '#fecaca', icon: '📕' },
];
 
const ICONS = ['📚','🎧','🎯','📜','📂','🎵','💬','📝','📋','🐛','📖','🗂️','🎬','🖼️','📊','🔗','💡','🏗️','✉️','🗣️','⚖️','🎲','🎭','📰','🔍','📄','🎓','🌐','📌','🔔','⭐','❤️','🏆','🎪','🧩','🎨'];
 
// ── State ──
let state = {
  screen: 'login',
  user: null,
  tab: 'materials',
  activeModule: 'starter',
  data: { users: [], quickLinks: [], materials: [], training: [], activities: [], announcements: [], forum: [] },
  completedSteps: [],
  likedPosts: [],
  levelFilter: 'all',
  typeFilter: 'all',
};
 
// ── DB helpers ──
async function dbSelect(table, order = 'id') {
  const { data, error } = await supabase.from(table).select('*').order(order);
  if (error) { console.error(table, error); return []; }
  return data || [];
}
 
async function dbInsert(table, row) {
  const { data, error } = await supabase.from(table).insert(row).select();
  if (error) { console.error('Insert', error); return null; }
  return data?.[0];
}
 
async function dbUpdate(table, id, updates) {
  const { error } = await supabase.from(table).update(updates).eq('id', id);
  if (error) console.error('Update', error);
}
 
async function dbDelete(table, id) {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) console.error('Delete', error);
}
 
// ── Load all data ──
async function loadAll() {
  const [users, quickLinks, materials, training, activities, announcements, forum] = await Promise.all([
    dbSelect('users'), dbSelect('quick_links', 'sort_order'),
    dbSelect('materials', 'sort_order'), dbSelect('training_steps', 'sort_order'),
    dbSelect('activities'), dbSelect('announcements'), dbSelect('forum_posts'),
  ]);
  state.data = { users, quickLinks, materials, training, activities, announcements, forum };
  render();
}
 
// ── Render engine ──
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
 
// ══════════════════════════════════════════════════════════════
// LOGIN
// ══════════════════════════════════════════════════════════════
function renderLogin() {
  const wrap = h('div', { className: 'login-screen' });
  const box = h('div', { className: 'login-box' });
 
  box.appendChild(h('div', { className: 'login-logo' },
    h('div', { className: 'icon' }, '🌐'),
    h('h1', {}, 'Nexus ', h('span', {}, 'English')),
    h('p', {}, 'Portal do Professor')
  ));
 
  const errDiv = h('div', { id: 'login-error', style: { display: 'none' }, className: 'error-box' });
 
  const userInput = h('input', { className: 'form-input', placeholder: 'Ex: admin, ana, carlos...', id: 'login-user' });
  const pwInput = h('input', { className: 'form-input', type: 'password', placeholder: 'Sua senha', id: 'login-pw' });
 
  const doLogin = async () => {
    const username = userInput.value.toLowerCase().trim();
    const password = pwInput.value;
    if (!username || !password) { errDiv.textContent = '⚠️ Preencha todos os campos.'; errDiv.style.display = 'block'; return; }
 
    const { data, error } = await supabase.from('users').select('*').eq('username', username).eq('password', password).single();
    if (error || !data) { errDiv.textContent = '⚠️ Usuário ou senha incorretos.'; errDiv.style.display = 'block'; return; }
 
    state.user = { id: data.id, username: data.username, name: data.name, role: data.role };
    state.screen = 'portal';
    await loadAll();
  };
 
  pwInput.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  userInput.addEventListener('keydown', e => { if (e.key === 'Enter') pwInput.focus(); });
 
  const loginBtn = h('button', { className: 'btn-full', onClick: doLogin }, 'Entrar');
 
  box.append(
    h('label', { className: 'form-label' }, 'Usuário'), userInput,
    h('label', { className: 'form-label' }, 'Senha'), pwInput,
    errDiv, loginBtn,
    h('div', { className: 'login-hint' },
      h('div', { className: 'title' }, '🔑 Primeiro acesso?'),
      h('div', { className: 'text', innerHTML: 'Usuário: <strong>admin</strong><br>Senha: <strong>nexus2026</strong><br><span style="font-size:11px">Crie logins dos teachers na aba ⚙️ Usuários</span>' })
    )
  );
 
  wrap.appendChild(box);
  return wrap;
}
 
// ══════════════════════════════════════════════════════════════
// PORTAL
// ══════════════════════════════════════════════════════════════
function renderPortal() {
  const wrap = h('div');
  const isAdmin = state.user?.role === 'admin';
 
  // Header
  const header = h('header', { className: 'header' });
  const headerTop = h('div', { className: 'header-top' },
    h('div', { className: 'header-brand' },
      h('div', { className: 'logo' }, '🌐'),
      h('div', {},
        h('h1', { innerHTML: 'Nexus <span>English Center</span>' }),
        h('div', { className: 'subtitle' }, 'Portal do Professor')
      )
    ),
    h('div', { className: 'header-right' },
      ...(isAdmin ? [h('span', { className: 'admin-badge' }, 'ADMIN')] : []),
      h('div', { className: 'user-info' },
        h('span', { className: 'name' }, state.user.name),
        h('button', { className: 'logout', onClick: () => { state.user = null; state.screen = 'login'; render(); } }, 'Sair')
      )
    )
  );
 
  const tabs = [
    { id: 'materials', label: '📂 Materiais' },
    { id: 'training', label: '🎓 Treinamento' },
    { id: 'activities', label: '🎯 Atividades' },
    { id: 'calendar', label: '📅 Avisos' },
    { id: 'forum', label: '💬 Mural' },
    ...(isAdmin ? [{ id: 'admin', label: '⚙️ Usuários' }] : []),
  ];
 
  const nav = h('nav', { className: 'nav' });
  tabs.forEach(t => {
    nav.appendChild(h('button', {
      className: `nav-tab ${state.tab === t.id ? 'active' : ''}`,
      onClick: () => { state.tab = t.id; render(); }
    }, t.label));
  });
 
  header.append(headerTop, nav);
  wrap.appendChild(header);
 
  const main = h('main', { className: 'main fade-in' });
 
  switch (state.tab) {
    case 'materials': main.appendChild(renderMaterials(isAdmin)); break;
    case 'training': main.appendChild(renderTraining(isAdmin)); break;
    case 'activities': main.appendChild(renderActivities(isAdmin)); break;
    case 'calendar': main.appendChild(renderCalendar(isAdmin)); break;
    case 'forum': main.appendChild(renderForum()); break;
    case 'admin': if (isAdmin) main.appendChild(renderAdmin()); break;
  }
 
  wrap.appendChild(main);
  return wrap;
}
 
function sectionHeader(title, sub) {
  return h('div', { className: 'section-header' }, h('h2', {}, title), h('p', {}, sub));
}
 
// ══════════════════════════════════════════════════════════════
// MATERIALS TAB
// ══════════════════════════════════════════════════════════════
function renderMaterials(isAdmin) {
  const d = h('div');
  d.appendChild(sectionHeader('Materiais Extras', 'Recursos organizados por módulo. Links abrem no Google Drive ou YouTube.'));
 
  // Quick links
  const qlHeader = h('div', { className: 'section-label' }, '🔗 Acesso Rápido');
  if (isAdmin) {
    const addBtn = h('button', { className: 'btn-small', onClick: async () => {
      const label = prompt('Nome do link:'); if (!label) return;
      const url = prompt('URL (cole o endereço completo):'); if (!url) return;
      const icon = prompt('Ícone (emoji, ex: 📚):', '📚') || '📚';
      await dbInsert('quick_links', { label, url, icon, sort_order: state.data.quickLinks.length + 1 });
      await loadAll();
    }}, '+ Link');
    qlHeader.appendChild(addBtn);
  }
  d.appendChild(qlHeader);
 
  const qlGrid = h('div', { className: 'grid-links' });
  state.data.quickLinks.forEach(ql => {
    const card = h('a', { href: ql.url, target: '_blank', rel: 'noopener', className: 'quick-link' },
      h('span', { className: 'icon' }, ql.icon),
      h('span', {}, ql.label)
    );
    if (isAdmin) {
      card.appendChild(h('div', { className: 'edit-buttons' },
        h('button', { className: 'btn-icon', onClick: async (e) => {
          e.preventDefault(); e.stopPropagation();
          const label = prompt('Nome:', ql.label); if (!label) return;
          const url = prompt('URL:', ql.url); if (!url) return;
          await dbUpdate('quick_links', ql.id, { label, url });
          await loadAll();
        }}, '✏️'),
        h('button', { className: 'btn-icon-danger', onClick: async (e) => {
          e.preventDefault(); e.stopPropagation();
          if (!confirm('Excluir este link?')) return;
          await dbDelete('quick_links', ql.id); await loadAll();
        }}, '🗑️')
      ));
    }
    qlGrid.appendChild(card);
  });
  d.appendChild(qlGrid);
 
  // Module materials
  const matHeader = h('div', { className: 'section-label' }, '📖 Por Módulo');
  if (isAdmin) {
    const addBtn = h('button', { className: 'btn-small', onClick: async () => {
      const title = prompt('Título do material:'); if (!title) return;
      const link = prompt('URL do material:'); if (!link) return;
      const type = prompt('Tipo (DRIVE, DOC, YT, PDF, LINK, VIDEO):', 'DRIVE') || 'DRIVE';
      const icon = prompt('Ícone (emoji):', '📚') || '📚';
      await dbInsert('materials', { module: state.activeModule, title, link, type, icon, sort_order: 0 });
      await loadAll();
    }}, '+ Material');
    matHeader.appendChild(addBtn);
  }
  d.appendChild(matHeader);
 
  const tabs = h('div', { className: 'module-tabs' });
  MODULES.forEach(m => {
    const active = state.activeModule === m.id;
    const tab = h('button', {
      className: `module-tab ${active ? 'active' : ''}`,
      style: active ? { background: m.color, borderColor: 'transparent', color: '#fff' } : {},
      onClick: () => { state.activeModule = m.id; render(); }
    }, m.icon + ' ' + m.label);
    tabs.appendChild(tab);
  });
  d.appendChild(tabs);
 
  const mod = MODULES.find(m => m.id === state.activeModule);
  const mats = state.data.materials.filter(m => m.module === state.activeModule);
  const matGrid = h('div', { className: 'grid-materials' });
 
  mats.forEach(mat => {
    const card = h('a', { href: mat.link, target: '_blank', rel: 'noopener', className: 'material-card' },
      h('div', { className: 'material-icon', style: { background: mod.accent, color: mod.color } }, mat.icon),
      h('div', {},
        h('div', { className: 'material-title' }, mat.title),
        h('span', { className: 'material-badge', style: { background: mod.accent, color: mod.color } }, mat.type)
      )
    );
    if (isAdmin) {
      card.appendChild(h('div', { className: 'edit-buttons' },
        h('button', { className: 'btn-icon', onClick: async (e) => {
          e.preventDefault(); e.stopPropagation();
          const title = prompt('Título:', mat.title); if (!title) return;
          const link = prompt('URL:', mat.link); if (!link) return;
          const type = prompt('Tipo:', mat.type) || mat.type;
          await dbUpdate('materials', mat.id, { title, link, type });
          await loadAll();
        }}, '✏️'),
        h('button', { className: 'btn-icon-danger', onClick: async (e) => {
          e.preventDefault(); e.stopPropagation();
          if (!confirm('Excluir?')) return;
          await dbDelete('materials', mat.id); await loadAll();
        }}, '🗑️')
      ));
    }
    matGrid.appendChild(card);
  });
  d.appendChild(matGrid);
  return d;
}
 
// ══════════════════════════════════════════════════════════════
// TRAINING TAB
// ══════════════════════════════════════════════════════════════
function renderTraining(isAdmin) {
  const d = h('div');
  d.appendChild(sectionHeader('Trilha de Treinamento', 'Onboarding para novos teachers. Marque etapas conforme concluir.'));
 
  const steps = state.data.training;
  const progress = steps.length ? Math.round((state.completedSteps.length / steps.length) * 100) : 0;
 
  d.appendChild(h('div', { className: 'card', style: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' } },
    h('div', { style: { flex: '1' } },
      h('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' } },
        h('span', { style: { fontSize: '14px', fontWeight: '600' } }, 'Progresso'),
        h('span', { style: { fontSize: '14px', fontWeight: '700', color: '#ea580c' } }, progress + '%')
      ),
      h('div', { className: 'progress-bar' },
        h('div', { className: 'progress-fill', style: { width: progress + '%' } })
      )
    ),
    h('div', { style: { textAlign: 'center', minWidth: '60px' } },
      h('div', { style: { fontSize: '26px', fontWeight: '800', color: '#ea580c', lineHeight: '1' } }, state.completedSteps.length + '/' + steps.length)
    )
  ));
 
  if (isAdmin) {
    d.appendChild(h('button', { className: 'btn btn-primary', style: { marginBottom: '14px' }, onClick: async () => {
      const title = prompt('Título da etapa:'); if (!title) return;
      const description = prompt('Descrição:') || '';
      const duration = prompt('Duração (ex: 2h):') || '';
      const itemsStr = prompt('Materiais (separados por vírgula):') || '';
      const items = itemsStr.split(',').map(s => s.trim()).filter(Boolean);
      await dbInsert('training_steps', { title, description, duration, items, sort_order: steps.length + 1 });
      await loadAll();
    }}, '+ Nova Etapa'));
  }
 
  const timeline = h('div', { className: 'timeline' });
  steps.forEach((step, idx) => {
    const isDone = state.completedSteps.includes(step.id);
    const card = h('div', { className: 'timeline-step' });
    const content = h('div', { className: 'card' });
 
    content.appendChild(h('div', { className: `timeline-dot ${isDone ? 'done' : ''}` }));
 
    const headerRow = h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' } },
      h('span', { className: 'step-number' }, 'Etapa ' + (idx + 1)),
      h('div', { style: { display: 'flex', alignItems: 'center', gap: '4px' } },
        h('span', { className: 'step-duration' }, '⏱️ ' + (step.duration || '')),
        ...(isAdmin ? [
          h('button', { className: 'btn-icon', onClick: async () => {
            const title = prompt('Título:', step.title); if (!title) return;
            const description = prompt('Descrição:', step.description) || '';
            const duration = prompt('Duração:', step.duration) || '';
            const itemsStr = prompt('Materiais (vírgula):', (step.items || []).join(', ')) || '';
            const items = itemsStr.split(',').map(s => s.trim()).filter(Boolean);
            await dbUpdate('training_steps', step.id, { title, description, duration, items });
            await loadAll();
          }}, '✏️'),
          h('button', { className: 'btn-icon-danger', onClick: async () => {
            if (!confirm('Excluir esta etapa?')) return;
            await dbDelete('training_steps', step.id); await loadAll();
          }}, '🗑️'),
        ] : [])
      )
    );
    content.appendChild(headerRow);
    content.appendChild(h('div', { style: { fontSize: '15px', fontWeight: '700', marginBottom: '4px' } }, step.title));
    content.appendChild(h('div', { style: { fontSize: '13px', color: '#78716c', lineHeight: '1.5', marginBottom: '10px' } }, step.description || ''));
 
    const itemsRow = h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' } });
    (step.items || []).forEach(item => {
      itemsRow.appendChild(h('span', { className: 'step-item' }, '📄 ' + item));
    });
    content.appendChild(itemsRow);
 
    content.appendChild(h('button', {
      className: `btn-done ${isDone ? 'checked' : ''}`,
      onClick: () => {
        if (isDone) state.completedSteps = state.completedSteps.filter(s => s !== step.id);
        else state.completedSteps.push(step.id);
        render();
      }
    }, isDone ? '✓ Concluída' : 'Marcar concluída'));
 
    card.appendChild(content);
    timeline.appendChild(card);
  });
 
  d.appendChild(timeline);
  return d;
}
 
// ══════════════════════════════════════════════════════════════
// ACTIVITIES TAB
// ══════════════════════════════════════════════════════════════
function renderActivities(isAdmin) {
  const d = h('div');
  d.appendChild(sectionHeader('Banco de Atividades', 'Atividades testadas pelos teachers. Filtre por nível e tipo.'));
 
  if (isAdmin) {
    d.appendChild(h('button', { className: 'btn btn-primary', style: { marginBottom: '14px' }, onClick: async () => {
      const title = prompt('Nome da atividade:'); if (!title) return;
      const description = prompt('Descrição / como aplicar:') || '';
      const time = prompt('Tempo (ex: 15 min):') || '';
      const type = prompt('Tipo (Warm-up, Speaking, Grammar, Listening, Vocabulary, Writing):') || 'Warm-up';
      const levelsStr = prompt('Níveis (separados por vírgula, ex: a1,a2,b1):') || '';
      const levels = levelsStr.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
      await dbInsert('activities', { title, description, time, type, levels });
      await loadAll();
    }}, '+ Nova Atividade'));
  }
 
  // Level filter
  d.appendChild(h('div', { style: { fontSize: '11px', fontWeight: '600', color: '#78716c', marginBottom: '4px' } }, 'Por nível:'));
  const levelChips = h('div', { className: 'chips' });
  ['all', 'starter', 'a1', 'a2', 'b1', 'b2'].forEach(l => {
    levelChips.appendChild(h('button', {
      className: `chip ${state.levelFilter === l ? 'active' : ''}`,
      onClick: () => { state.levelFilter = l; render(); }
    }, l === 'all' ? 'Todos' : l.toUpperCase()));
  });
  d.appendChild(levelChips);
 
  // Type filter
  const types = ['all', ...new Set(state.data.activities.map(a => a.type))];
  d.appendChild(h('div', { style: { fontSize: '11px', fontWeight: '600', color: '#78716c', marginBottom: '4px' } }, 'Por tipo:'));
  const typeChips = h('div', { className: 'chips' });
  types.forEach(t => {
    typeChips.appendChild(h('button', {
      className: `chip ${state.typeFilter === t ? 'active' : ''}`,
      onClick: () => { state.typeFilter = t; render(); }
    }, t === 'all' ? 'Todos' : t));
  });
  d.appendChild(typeChips);
 
  const filtered = state.data.activities.filter(a => {
    const ml = state.levelFilter === 'all' || (a.levels || []).includes(state.levelFilter);
    const mt = state.typeFilter === 'all' || a.type === state.typeFilter;
    return ml && mt;
  });
 
  d.appendChild(h('div', { style: { fontSize: '12px', color: '#78716c', marginBottom: '12px' } }, filtered.length + ' atividade' + (filtered.length !== 1 ? 's' : '')));
 
  const grid = h('div', { className: 'grid-activities' });
  filtered.forEach(a => {
    const card = h('div', { className: 'card' });
 
    const top = h('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' } },
      h('span', { className: 'activity-type' }, a.type),
      h('div', { style: { display: 'flex', alignItems: 'center', gap: '4px' } },
        h('span', { className: 'activity-time' }, '⏱️ ' + (a.time || '')),
        ...(isAdmin ? [
          h('button', { className: 'btn-icon', onClick: async () => {
            const title = prompt('Nome:', a.title); if (!title) return;
            const description = prompt('Descrição:', a.description) || '';
            const time = prompt('Tempo:', a.time) || '';
            const type = prompt('Tipo:', a.type) || a.type;
            const levelsStr = prompt('Níveis (vírgula):', (a.levels || []).join(',')) || '';
            const levels = levelsStr.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
            await dbUpdate('activities', a.id, { title, description, time, type, levels });
            await loadAll();
          }}, '✏️'),
          h('button', { className: 'btn-icon-danger', onClick: async () => {
            if (!confirm('Excluir?')) return;
            await dbDelete('activities', a.id); await loadAll();
          }}, '🗑️'),
        ] : [])
      )
    );
    card.appendChild(top);
    card.appendChild(h('div', { style: { fontSize: '15px', fontWeight: '700', marginBottom: '4px' } }, a.title));
    card.appendChild(h('div', { style: { fontSize: '12px', color: '#78716c', lineHeight: '1.5', marginBottom: '10px' } }, a.description || ''));
 
    const levels = h('div', { style: { display: 'flex', gap: '4px', flexWrap: 'wrap' } });
    (a.levels || []).forEach(l => {
      const mod = MODULES.find(m => m.id === l);
      levels.appendChild(h('span', { className: 'level-pill', style: { background: mod?.accent || '#f5f5f4', color: mod?.color || '#666' } }, l.toUpperCase()));
    });
    card.appendChild(levels);
    grid.appendChild(card);
  });
  d.appendChild(grid);
  return d;
}
 
// ══════════════════════════════════════════════════════════════
// CALENDAR TAB
// ══════════════════════════════════════════════════════════════
function renderCalendar(isAdmin) {
  const d = h('div');
  d.appendChild(sectionHeader('Calendário & Avisos', 'Comunicados da coordenação, datas e lembretes.'));
 
  if (isAdmin) {
    d.appendChild(h('button', { className: 'btn btn-primary', style: { marginBottom: '14px' }, onClick: async () => {
      const title = prompt('Título do aviso:'); if (!title) return;
      const content = prompt('Detalhes:') || '';
      const pinned = confirm('Fixar no topo?');
      await dbInsert('announcements', { title, content, pinned, author: state.user.name });
      await loadAll();
    }}, '+ Novo Aviso'));
  }
 
  const sorted = [...state.data.announcements].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  const list = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px' } });
 
  sorted.forEach(a => {
    const card = h('div', { className: `card announcement ${a.pinned ? 'pinned' : ''}` });
 
    const meta = h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' } },
      h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
        h('span', { style: { fontSize: '12px', color: '#78716c' } }, new Date(a.created_at).toLocaleDateString('pt-BR')),
        ...(a.pinned ? [h('span', { className: 'pin-badge' }, '📌 FIXADO')] : [])
      ),
      ...(isAdmin ? [h('div', { style: { display: 'flex', gap: '3px' } },
        h('button', { className: 'btn-icon', style: { background: '#fff7ed' }, onClick: async () => {
          await dbUpdate('announcements', a.id, { pinned: !a.pinned }); await loadAll();
        }}, '📌'),
        h('button', { className: 'btn-icon', onClick: async () => {
          const title = prompt('Título:', a.title); if (!title) return;
          const content = prompt('Detalhes:', a.content) || '';
          await dbUpdate('announcements', a.id, { title, content }); await loadAll();
        }}, '✏️'),
        h('button', { className: 'btn-icon-danger', onClick: async () => {
          if (!confirm('Excluir?')) return;
          await dbDelete('announcements', a.id); await loadAll();
        }}, '🗑️'),
      )] : [])
    );
    card.appendChild(meta);
    card.appendChild(h('div', { style: { fontSize: '15px', fontWeight: '700', marginBottom: '4px' } }, a.title));
    card.appendChild(h('div', { style: { fontSize: '13px', color: '#78716c', lineHeight: '1.5' } }, a.content || ''));
    card.appendChild(h('div', { style: { fontSize: '11px', color: '#a8a29e', marginTop: '6px', fontStyle: 'italic' } }, '— ' + (a.author || 'Coordenação')));
    list.appendChild(card);
  });
  d.appendChild(list);
  return d;
}
 
// ══════════════════════════════════════════════════════════════
// FORUM TAB
// ══════════════════════════════════════════════════════════════
function renderForum() {
  const d = h('div');
  d.appendChild(sectionHeader('Mural dos Teachers', 'Troque ideias, compartilhe atividades e peça dicas.'));
 
  d.appendChild(h('button', { className: 'btn btn-primary', style: { marginBottom: '14px' }, onClick: async () => {
    const title = prompt('Título da publicação:'); if (!title) return;
    const content = prompt('Conte sua ideia, dica ou experiência:') || '';
    await dbInsert('forum_posts', { author: state.user.name, title, content, likes: 0 });
    await loadAll();
  }}, '✍️ Nova Publicação'));
 
  const list = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px' } });
  const sorted = [...state.data.forum].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
 
  sorted.forEach(p => {
    const card = h('div', { className: 'card' });
 
    card.appendChild(h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' } },
      h('div', { className: 'forum-avatar' }, '👩‍🏫'),
      h('div', {},
        h('div', { style: { fontSize: '13px', fontWeight: '600' } }, p.author),
        h('div', { style: { fontSize: '11px', color: '#a8a29e' } }, new Date(p.created_at).toLocaleDateString('pt-BR'))
      )
    ));
    card.appendChild(h('div', { style: { fontSize: '15px', fontWeight: '700', marginBottom: '4px' } }, p.title));
    card.appendChild(h('div', { style: { fontSize: '13px', color: '#78716c', lineHeight: '1.5', marginBottom: '10px' } }, p.content || ''));
 
    const liked = state.likedPosts.includes(p.id);
    card.appendChild(h('button', {
      className: `like-btn ${liked ? 'liked' : ''}`,
      onClick: async () => {
        const newLikes = liked ? (p.likes || 0) - 1 : (p.likes || 0) + 1;
        if (liked) state.likedPosts = state.likedPosts.filter(id => id !== p.id);
        else state.likedPosts.push(p.id);
        await dbUpdate('forum_posts', p.id, { likes: Math.max(0, newLikes) });
        await loadAll();
      }
    }, (liked ? '❤️' : '🤍') + ' ' + (p.likes || 0)));
 
    list.appendChild(card);
  });
  d.appendChild(list);
  return d;
}
 
// ══════════════════════════════════════════════════════════════
// ADMIN TAB
// ══════════════════════════════════════════════════════════════
function renderAdmin() {
  const d = h('div');
  d.appendChild(sectionHeader('Gerenciar Usuários', 'Crie logins individuais para cada teacher e administradores.'));
 
  d.appendChild(h('div', { className: 'info-box' },
    h('div', { className: 'title' }, '📖 Como funciona:'),
    h('div', { className: 'text', innerHTML: '• <strong>Admin</strong> = setor metodológico. Pode editar tudo.<br>• <strong>Teacher</strong> = professor. Acessa conteúdos, publica no mural, marca etapas da trilha.<br>• Cada pessoa tem seu usuário e senha.' })
  ));
 
  d.appendChild(h('button', { className: 'btn btn-primary', style: { marginBottom: '16px' }, onClick: async () => {
    const username = prompt('Login do usuário (sem espaços, minúsculo):'); if (!username) return;
    const name = prompt('Nome completo:'); if (!name) return;
    const password = prompt('Senha:'); if (!password) return;
    const role = confirm('Este usuário é ADMIN? (OK = Admin, Cancelar = Teacher)') ? 'admin' : 'teacher';
 
    const existing = state.data.users.find(u => u.username === username.toLowerCase().trim());
    if (existing) { alert('Usuário já existe!'); return; }
 
    await dbInsert('users', { username: username.toLowerCase().trim(), name, password, role });
    await loadAll();
  }}, '+ Criar Novo Usuário'));
 
  const grid = h('div', { className: 'grid-users' });
  state.data.users.forEach(u => {
    const card = h('div', { className: 'card' });
    card.appendChild(h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' } },
      h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
        h('div', { className: 'user-avatar', style: { background: u.role === 'admin' ? '#fff7ed' : '#f5f5f4' } }, u.role === 'admin' ? '⚙️' : '👩‍🏫'),
        h('div', {},
          h('div', { style: { fontSize: '14px', fontWeight: '700' } }, u.name),
          h('div', { style: { fontSize: '12px', color: '#78716c' } }, '@' + u.username)
        )
      ),
      h('span', { className: `role-badge ${u.role}` }, u.role)
    ));
 
    const btns = h('div', { style: { display: 'flex', gap: '6px', marginTop: '10px' } });
    btns.appendChild(h('button', { style: { background: '#fef3c7', border: 'none', borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }, onClick: async () => {
      const name = prompt('Nome:', u.name); if (!name) return;
      const password = prompt('Nova senha (deixe vazio para manter):', '');
      const role = confirm('Admin? (OK = Admin, Cancelar = Teacher)') ? 'admin' : 'teacher';
      const updates = { name, role };
      if (password) updates.password = password;
      await dbUpdate('users', u.id, updates); await loadAll();
    }}, '✏️ Editar'));
 
    if (u.username !== 'admin') {
      btns.appendChild(h('button', { style: { background: '#fef2f2', border: 'none', borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', fontSize: '11px', fontWeight: '600', color: '#dc2626' }, onClick: async () => {
        if (!confirm('Excluir ' + u.name + '?')) return;
        await dbDelete('users', u.id); await loadAll();
      }}, '🗑️ Excluir'));
    }
    card.appendChild(btns);
    grid.appendChild(card);
  });
  d.appendChild(grid);
  return d;
}
 
// ── Init ──
render();
 
