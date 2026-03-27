const SUPABASE_URL = 'https://macpqlkefvjfrvotkkqh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hY3BxbGtlZnZqZnJ2b3Rra3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NzY1NjEsImV4cCI6MjA5MDE1MjU2MX0.dz0dsXVHOPkobv8ZMOg5UfHHVOQcB5gipT_rJkoQMaE'; // 

const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const MODULES = [
  { id: 'starter', label: 'Starter', color: '#16a34a' },
  { id: 'a1', label: 'A1', color: '#2563eb' },
  { id: 'a2', label: 'A2', color: '#84cc16' },
  { id: 'b1', label: 'B1', color: '#ea580c' },
  { id: 'b2', label: 'B2', color: '#be123c' },
];

let state = {
  screen: 'portal', user: { name: 'Teacher' }, tab: 'materiais', activeModule: 'starter',
  data: { quickLinks: [], materials: [] }
};

// Funções de Renderização
function render() {
  const app = document.getElementById('app');
  app.innerHTML = '';

  // Header
  const header = document.createElement('header');
  header.className = 'header-main';
  header.innerHTML = `
    <div><strong>Nexus English Center</strong><br><small>PORTAL DO PROFESSOR</small></div>
    <div style="background:rgba(255,255,255,0.2); padding:8px 20px; border-radius:30px;">👋 Olá, Teacher!</div>
  `;

  // Nav
  const nav = document.createElement('div');
  nav.className = 'nav-bar';
  ['Materiais', 'Treinamento', 'Atividades', 'Avisos'].forEach(t => {
    const item = document.createElement('div');
    item.className = `nav-item ${state.tab === t.toLowerCase() ? 'active' : ''}`;
    item.innerHTML = t;
    nav.appendChild(item);
  });

  const container = document.createElement('div');
  container.className = 'container';
  
  // Título
  container.innerHTML = `
    <h1>Materiais Extras</h1>
    <p class="subtitle">Acesse todos os recursos organizados por módulo.</p>
    
    <div class="section-title">🔗 Acesso Rápido – Todos os recursos</div>
    <div class="quick-grid" id="quick-links"></div>

    <div class="section-title">📖 Materiais por Módulo</div>
    <div class="filter-bar" id="module-filters"></div>
    <div class="materials-grid" id="module-materials"></div>
  `;

  app.append(header, nav, container);
  renderFilters();
  renderCards();
}

function renderFilters() {
  const div = document.getElementById('module-filters');
  MODULES.forEach(m => {
    const btn = document.createElement('button');
    btn.className = `btn-filter ${state.activeModule === m.id ? 'active' : ''}`;
    btn.innerHTML = `<span>●</span> ${m.label}`;
    btn.onclick = () => { state.activeModule = m.id; render(); };
    div.appendChild(btn);
  });
}

function renderCards() {
  // Aqui você mapearia os dados do seu banco de dados (state.data.materials)
  // Exemplo de preenchimento visual igual à imagem:
  const quick = document.getElementById('quick-links');
  const items = ['Livros 2026', 'Áudios dos Livros', 'Extra Activities', 'B2 Scripts'];
  items.forEach(text => {
    const card = document.createElement('div');
    card.className = 'card-base';
    card.innerHTML = `<div class="icon-box">📚</div> <strong>${text}</strong>`;
    quick.appendChild(card);
  });
}

render();
