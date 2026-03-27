const SUPABASE_URL = 'https://macpqlkefvjfrvotkkqh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hY3BxbGtlZnZqZnJ2b3Rra3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NzY1NjEsImV4cCI6MjA5MDE1MjU2MX0.dz0dsXVHOPkobv8ZMOg5UfHHVOQcB5gipT_rJkoQMaE
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
  screen: 'portal', // Pulando login para você ver o ajuste rápido
  user: { name: 'Teacher' }, 
  activeModule: 'starter'
};

function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'className') el.className = v;
    else el.setAttribute(k, v);
  }
  children.flat().forEach(c => {
    if (c) el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  });
  return el;
}

const app = document.getElementById('app');

function render() {
  app.innerHTML = '';
  
  // Header
  const header = h('header', { className: 'header-main' },
    h('div', { style: 'display:flex; align-items:center' },
      h('img', { src: NEXUS_LOGO_URL, style: 'max-height:35px; margin-right:15px' }),
      h('div', {}, h('strong', { style: 'font-size:18px' }, 'Portal do Professor'))
    ),
    h('div', { style: 'background:rgba(255,255,255,0.2); padding:8px 20px; border-radius:30px;' }, `👋 Olá, Teacher!`)
  );

  // Nav
  const nav = h('div', { className: 'nav-bar' },
    ['Materiais', 'Treinamento', 'Atividades', 'Avisos'].map(t => 
      h('div', { className: `nav-item ${t === 'Materiais' ? 'active' : ''}` }, t)
    )
  );

  const container = h('div', { className: 'container' },
    h('h1', { style: 'color:#1a2b21; font-family:serif' }, 'Materiais Extras'),
    h('p', { className: 'subtitle' }, 'Acesse todos os recursos organizados por módulo.'),
    
    h('div', { className: 'section-title' }, '🔗 ACESSO RÁPIDO – TODOS OS RECURSOS'),
    h('div', { className: 'quick-grid' }, 
      renderQuickCard('📚', 'Livros 2026'),
      renderQuickCard('🎧', 'Áudios dos Livros'),
      renderQuickCard('🎯', 'Extra Activities'),
      renderQuickCard('📜', 'B2 Scripts'),
      renderQuickCard('📂', 'Material para Aulas'),
      renderQuickCard('🎵', 'Listening B2'),
      renderQuickCard('💬', 'Conversations 2026'),
      renderQuickCard('📝', 'Transcripts A1/A2/B1'),
      renderQuickCard('📋', 'Guias Starter'),
      renderQuickCard('🐛', 'Erros e Sugestões')
    ),

    h('div', { className: 'section-title' }, '📖 MATERIAIS POR MÓDULO'),
    h('div', { className: 'filter-bar' }, 
      MODULES.map(m => h('button', { 
        className: `btn-filter ${state.activeModule === m.id ? 'active' : ''}`,
        onClick: () => { state.activeModule = m.id; render(); }
      }, h('span', { style: `color:${m.color}` }, '●'), ` ${m.label}`))
    ),
    h('div', { className: 'materials-grid' }, renderModuleContent())
  );

  app.append(header, nav, container);
}

function renderQuickCard(icon, title) {
  return h('div', { className: 'card-base' },
    h('div', { className: 'icon-box' }, icon),
    h('strong', { style: 'color:#1a2b21' }, title)
  );
}

function renderModuleContent() {
  // Simulação de conteúdo para o Starter igual à foto
  if(state.activeModule === 'starter') {
    return [
      renderMaterialCard('Guias Starter', 'DOC'),
      renderMaterialCard('Livros 2026 – Starter', 'DRIVE'),
      renderMaterialCard('Extra Activities', 'DRIVE'),
      renderMaterialCard('Áudios dos Livros', 'YT'),
      renderMaterialCard('Material para Aulas', 'DRIVE')
    ];
  }
  return h('p', { style: 'color:#889e91; padding:20px' }, 'Nenhum material para este nível ainda.');
}

function renderMaterialCard(title, type) {
  const badgeClass = `badge bg-${type.toLowerCase()}`;
  return h('div', { className: 'card-base' },
    h('div', { className: 'icon-box' }, '📄'),
    h('div', {}, 
      h('strong', { style: 'color:#1a2b21' }, title), h('br'),
      h('span', { className: badgeClass }, type)
    )
  );
}

render();
