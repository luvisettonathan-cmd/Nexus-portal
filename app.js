const SUPABASE_URL = 'https://macpqlkefvjfrvotkkqh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hY3BxbGtlZnZqZnJ2b3Rra3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NzY1NjEsImV4cCI6MjA5MDE1MjU2MX0.dz0dsXVHOPkobv8ZMOg5UfHHVOQcB5gipT_rJkoQMaE'; // 

const NEXUS_LOGO_URL = 'https://i.ibb.co/6P0J9X4/nexus-logo.png'; 

const MODULES = [
  { id: 'starter', label: 'Starter', color: '#16a34a' },
  { id: 'a1', label: 'A1', color: '#2563eb' },
  { id: 'a2', label: 'A2', color: '#84cc16' },
  { id: 'b1', label: 'B1', color: '#ea580c' },
  { id: 'b2', label: 'B2', color: '#be123c' },
];

let state = {
  screen: 'portal', // Pulando login para testar o visual interno direto
  activeModule: 'starter'
};

function render() {
  const app = document.getElementById('app');
  app.innerHTML = '';

  // ESTRUTURA PRINCIPAL
  const mainLayout = document.createElement('div');
  
  mainLayout.innerHTML = `
    <header class="header-main">
      <div style="display:flex; align-items:center">
        <img src="${NEXUS_LOGO_URL}" style="max-height:35px; margin-right:15px">
        <div><strong style="font-size:18px">Portal do Professor</strong></div>
      </div>
      <div style="background:rgba(255,255,255,0.2); padding:8px 20px; border-radius:30px; font-size:14px;">👋 Olá, Teacher!</div>
    </header>

    <div class="nav-bar">
      <div class="nav-item active">Materiais</div>
      <div class="nav-item">Treinamento</div>
      <div class="nav-item">Atividades</div>
      <div class="nav-item">Avisos</div>
    </div>

    <div class="container">
      <h1 style="color:#1a2b21; font-family:serif; margin-bottom:5px;">Materiais Extras</h1>
      <p class="subtitle">Acesse todos os recursos organizados por módulo.</p>
      
      <div class="section-title">🔗 ACESSO RÁPIDO – TODOS OS RECURSOS</div>
      <div class="quick-grid" id="quick-links-area">
        <!-- Cards de acesso rápido -->
      </div>

      <div class="section-title" style="margin-top:40px">📖 MATERIAIS POR MÓDULO</div>
      <div class="filter-bar" id="filter-area">
        <!-- Botões de filtro -->
      </div>
      <div class="materials-grid" id="materials-area">
        <!-- Cards de materiais -->
      </div>
    </div>
  `;

  app.appendChild(mainLayout);

  // PREENCHER ACESSO RÁPIDO (TEXTOS FIXOS IGUAL À FOTO)
  const quickArea = document.getElementById('quick-links-area');
  const quickItems = [
    {icon: '📚', text: 'Livros 2026'}, {icon: '🎧', text: 'Áudios dos Livros'},
    {icon: '🎯', text: 'Extra Activities'}, {icon: '📜', text: 'B2 Scripts'},
    {icon: '📂', text: 'Material para Aulas'}, {icon: '🎵', text: 'Listening B2'},
    {icon: '💬', text: 'Conversations 2026'}, {icon: '📝', text: 'Transcripts A1/A2/B1'},
    {icon: '📋', text: 'Guias Starter'}, {icon: '🐛', text: 'Erros e Sugestões'}
  ];

  quickItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card-base';
    card.innerHTML = `
      <div class="icon-box">${item.icon}</div>
      <strong style="color:#1a2b21 !important">${item.text}</strong>
    `;
    quickArea.appendChild(card);
  });

  // PREENCHER FILTROS
  const filterArea = document.getElementById('filter-area');
  MODULES.forEach(m => {
    const btn = document.createElement('button');
    btn.className = `btn-filter ${state.activeModule === m.id ? 'active' : ''}`;
    btn.innerHTML = `<span style="color:${m.color}">●</span> ${m.label}`;
    btn.onclick = () => { state.activeModule = m.id; render(); };
    filterArea.appendChild(btn);
  });

  // PREENCHER MATERIAIS DO MÓDULO
  const materialsArea = document.getElementById('materials-area');
  if (state.activeModule === 'starter') {
    const starterItems = [
      {t: 'Guias Starter', type: 'DOC'}, {t: 'Livros 2026 – Starter', type: 'DRIVE'},
      {t: 'Extra Activities', type: 'DRIVE'}, {t: 'Áudios dos Livros', type: 'YT'},
      {t: 'Material para Aulas', type: 'DRIVE'}
    ];
    starterItems.forEach(item => {
      const card = document.createElement('div');
      card.className = 'card-base';
      card.innerHTML = `
        <div class="icon-box">📄</div>
        <div>
          <strong style="color:#1a2b21 !important">${item.t}</strong><br>
          <span class="badge bg-${item.type.toLowerCase()}">${item.type}</span>
        </div>
      `;
      materialsArea.appendChild(card);
    });
  } else {
    materialsArea.innerHTML = '<p style="color:#889e91; padding:20px;">Nenhum material para este nível ainda.</p>';
  }
}

// Iniciar
render();
