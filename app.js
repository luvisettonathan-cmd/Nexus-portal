// ══════════════════════════════════════════════════════════════
// NEXUS ENGLISH CENTER - PORTAL DO PROFESSOR
// ══════════════════════════════════════════════════════════════

const SUPABASE_URL = 'https://macpqlkefvjfrvotkkqh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hY3BxbGtlZnZqZnJ2b3Rra3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NzY1NjEsImV4cCI6MjA5MDE1MjU2MX0.dz0dsXVHOPkobv8ZMOg5UfHHVOQcB5gipT_rJkoQMaE';
const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const NEXUS_LOGO_DATA = 'https://i.ibb.co/kVqLf4k3/nexus-logo.png';
const INACTIVITY_LIMIT = 15 * 60 * 1000;

let state = {
        screen: 'login',
        user: null
};

// ── EXTRAI O NOME DO TEACHER A PARTIR DO E-MAIL ────────────────
function getTeacherName(email) {
        if (!email) return 'Teacher';
        const local = email.split('@')[0].toLowerCase();
        const name = local.replace(/^teacher/, '');
        return name.charAt(0).toUpperCase() + name.slice(1);
}

// ── AUTO-LOGOUT POR INATIVIDADE ────────────────────────────────
let inactivityTimer = null;
function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        localStorage.setItem('nexus_last_activity', Date.now().toString());
        inactivityTimer = setTimeout(async () => {
                  await client.auth.signOut();
                  state.user = null;
                  state.screen = 'login';
                  render();
        }, INACTIVITY_LIMIT);
}
function startInactivityWatch() {
        const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
        events.forEach(evt => window.addEventListener(evt, resetInactivityTimer, { passive: true }));
        resetInactivityTimer();
}
function stopInactivityWatch() {
        clearTimeout(inactivityTimer);
        localStorage.removeItem('nexus_last_activity');
        const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
        events.forEach(evt => window.removeEventListener(evt, resetInactivityTimer));
}

// ── VIEWER EMBUTIDO (Drive PDF + Google Docs) ───────────────────
function getEmbedUrl(url) {
        // Google Drive PDF: /file/d/ID/view -> /file/d/ID/preview
  const driveFile = url.match(/\/file\/d\/([^/]+)/);
        if (driveFile) {
                  return 'https://drive.google.com/file/d/' + driveFile[1] + '/preview';
        }
        // Google Drive open?id=ID
  const driveOpen = url.match(/[?&]id=([^&]+)/);
        if (driveOpen) {
                  return 'https://drive.google.com/file/d/' + driveOpen[1] + '/preview';
        }
        // Google Docs: /document/d/ID/edit -> /document/d/ID/preview
  const docsFile = url.match(/\/document\/d\/([^/]+)/);
        if (docsFile) {
                  return 'https://docs.google.com/document/d/' + docsFile[1] + '/preview';
        }
        return url;
}

function openViewer(title, url) {
        const old = document.getElementById('pdf-modal-overlay');
        if (old) old.remove();
        const embedUrl = getEmbedUrl(url);
        const overlay = document.createElement('div');
        overlay.id = 'pdf-modal-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.75);display:flex;flex-direction:column;align-items:center;justify-content:center;';
        overlay.innerHTML =
                '<div style="background:#1a2b21;border-radius:12px;width:92vw;height:90vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.5);">' +
                '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 20px;background:#243b2f;border-bottom:1px solid rgba(255,255,255,0.1);">' +
                '<span style="color:white;font-weight:700;font-size:15px;">📖 ' + title + '</span>' +
                '<button id="close-pdf-modal" style="background:rgba(255,255,255,0.15);border:none;color:white;border-radius:8px;padding:6px 14px;cursor:pointer;font-size:13px;font-weight:600;">✕ Fechar</button>' +
                '</div>' +
                '<iframe src="' + embedUrl + '" style="flex:1;border:none;width:100%;background:#fff;" allow="autoplay" loading="lazy"></iframe>' +
                '</div>';
        document.body.appendChild(overlay);
        document.getElementById('close-pdf-modal').onclick = () => overlay.remove();
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

// ── LIVROS 2026 ─────────────────────────────────────────────────
const LIVROS_2026 = [
      { titulo: 'Starter', url: 'https://drive.google.com/file/d/1risqNij5UoxUk00qT95unmuhUbS04TX7/view?usp=drive_link' },
      { titulo: 'A1',      url: 'https://drive.google.com/file/d/1A8hjwRffJaifwsvKzo6Zq9MUQHJOhGwA/view?usp=drive_link' },
      { titulo: 'A2',      url: 'https://drive.google.com/file/d/19vn9kHlddklZgUgWD5M_SK1p0yLdFtmA/view?usp=drive_link' },
      { titulo: 'B1',      url: 'https://drive.google.com/file/d/1LmpFpKSjfIFsBjD5ItiebZgmVip-upQN/view?usp=drive_link' },
      { titulo: 'B2',      url: 'https://drive.google.com/file/d/1vJUIHER2_6o_SzQry6vtwHLFX1hM1hfb/view?usp=drive_link' }
      ];

// ── MODAL DE LISTAGEM DE LIVROS ─────────────────────────────────
function openBooksModal() {
        const old = document.getElementById('books-modal-overlay');
        if (old) old.remove();

  const overlay = document.createElement('div');
        overlay.id = 'books-modal-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.75);display:flex;align-items:center;justify-content:center;';

  const listaHTML = LIVROS_2026.map((livro, i) =>
            '<div class="book-item" data-idx="' + i + '" style="display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:10px;background:rgba(255,255,255,0.07);cursor:pointer;transition:background 0.2s;margin-bottom:8px;" onmouseover="this.style.background=\'rgba(255,255,255,0.15)\'" onmouseout="this.style.background=\'rgba(255,255,255,0.07)\'">' +
              '<span style="font-size:22px;">📄</span>' +
              '<span style="color:white;font-weight:600;font-size:14px;">' + livro.titulo + '</span>' +
              '<span style="margin-left:auto;color:rgba(255,255,255,0.5);font-size:12px;">Abrir →</span>' +
            '</div>'
                                      ).join('');

  overlay.innerHTML =
            '<div style="background:#1a2b21;border-radius:14px;width:500px;max-width:94vw;max-height:80vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.5);">' +
              '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;background:#243b2f;border-radius:14px 14px 0 0;border-bottom:1px solid rgba(255,255,255,0.1);">' +
                '<span style="color:white;font-weight:700;font-size:16px;">📚 Livros 2026</span>' +
                '<button id="close-books-modal" style="background:rgba(255,255,255,0.15);border:none;color:white;border-radius:8px;padding:6px 14px;cursor:pointer;font-size:13px;font-weight:600;">✕ Fechar</button>' +
              '</div>' +
              '<div style="padding:16px;overflow-y:auto;flex:1;">' + listaHTML + '</div>' +
            '</div>';

  document.body.appendChild(overlay);
        document.getElementById('close-books-modal').onclick = () => overlay.remove();
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  overlay.querySelectorAll('.book-item').forEach(el => {
            el.addEventListener('click', () => {
                        const idx = parseInt(el.dataset.idx);
                        const livro = LIVROS_2026[idx];
                        overlay.remove();
                        openViewer(livro.titulo, livro.url);
            });
  });
}

// ── INICIALIZAÇÃO ───────────────────────────────────────────────
async function checkUser() {
    try {
        const { data: { session } } = await client.auth.getSession();
        const lastActivity = localStorage.getItem('nexus_last_activity');
        const elapsed = lastActivity ? (Date.now() - parseInt(lastActivity, 10)) : null;
        const isExpired = session && elapsed !== null && elapsed > INACTIVITY_LIMIT;
        if (isExpired) {
            await client.auth.signOut();
            localStorage.removeItem('nexus_last_activity');
            state.screen = 'login';
        } else if (session) {
            state.user = session.user;
            state.screen = 'portal';
            startInactivityWatch();
        } else {
            state.screen = 'login';
        }
    } catch (e) {
        console.error('checkUser error:', e);
        state.screen = 'login';
    }
    render();
}

function render() {
        const app = document.getElementById('app');
        if (!app) return;
        app.innerHTML = '';
        if (state.screen === 'login') renderLogin(app);
        else renderPortal(app);
}

// ── TELA DE LOGIN ───────────────────────────────────────────────
function renderLogin(app) {
  const wrap = document.createElement('div');
  wrap.className = 'login-screen';
  wrap.innerHTML = `
    <div class="login-left" style="max-width: 620px;">
      <img src="${NEXUS_LOGO_DATA}" alt="Nexus Logo" class="login-left-logo">
      <div class="login-left-content">
        <h1 class="login-hero-title">Bem-vindo ao<br>Portal do Professor</h1>
      
        <div class="login-city-badge" style="margin-top:16px;display:inline-flex;align-items:center;">📍 Chapecó - SC</div>
      </div>
      <div class="login-illustration">
        <div class="login-illus-scene">
          <div class="illus-monitor">
            <div class="illus-screen">
              <div class="illus-avatar">👤</div>
              <div class="illus-lines">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
          <div class="illus-items">
            <div class="illus-clock">🕒</div>
            <div class="illus-books">📚</div>
            <div class="illus-pencils">✏️</div>
          </div>
        </div>
      </div>
    </div>
    <div class="login-right" style="width: 460px; min-width: 460px;">
      <div class="login-card">
        <h2 class="login-card-title">Login</h2>
        <div id="login-err" class="login-error-msg" style="display:none;">❌ E-mail ou senha incorretos</div>
        <div class="login-field">
          <label class="login-label">Email</label>
          <div class="login-input-wrap">
            <span class="login-input-icon">📧</span>
            <input type="text" id="email" class="login-input" placeholder="Email" autocomplete="username">
          </div>
        </div>
        <div class="login-field">
          <label class="login-label">Senha</label>
          <div class="login-input-wrap">
            <span class="login-input-icon">🔒</span>
            <input type="password" id="pass" class="login-input" placeholder="Senha" autocomplete="current-password">
          </div>
        </div>
        <button id="btn-entrar" class="login-btn-entrar">Entrar</button>
      </div>
    </div>
  `;
  app.appendChild(wrap);

  async function doLogin() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('pass').value;
    const errEl = document.getElementById('login-err');
    errEl.style.display = 'none';
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      errEl.style.display = 'block';
    } else {
      state.user = data.user;
      state.screen = 'portal';
      startInactivityWatch();
      render();
    }
  }

  document.getElementById('btn-entrar').onclick = doLogin;
  ['email', 'pass'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doLogin();
    });
  });
}

// ── PORTAL PRINCIPAL ─────────────────────────────────────────────────────────────
function renderPortal(app) {
  const teacherName = getTeacherName(state.user?.email);
  const main = document.createElement('div');
  main.innerHTML = `
    <div class="portal-wrapper">
      <div class="portal-card">
        <nav class="sidebar">
          <div class="sidebar-logo">
            <img src="${NEXUS_LOGO_DATA}" alt="Nexus Logo">
          </div>
          <div class="sidebar-item active" data-section="materiais">
            <span class="sidebar-icon">📂</span>
            <span>Materiais</span>
          </div>
          <div class="${state.user.email === 'luvisettonathan8@gmail.com' ? 'sidebar-item' : 'sidebar-item disabled'}" data-section="treinamento">
            <span class="sidebar-icon">🎯</span>
            <span>Treinamento</span>
          </div>
          <div class="sidebar-item" data-section="calendario">
            <span class="sidebar-icon">📅</span>
            <span>Calendário</span>
          </div>
          <div class="sidebar-footer"></div>
        </nav>
        <div class="portal-main">
          <div class="header-main">
            <div class="header-title">
              <div class="header-title-icon">📋</div>
              <h1>📍 Chapecó</h1>
            </div>
            <div class="header-user">
              <div class="header-avatar">
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(teacherName)}&background=F4845F&color=fff&size=80" alt="avatar">
              </div>
              <span class="header-greeting">Olá, ${teacherName}!</span>
              <button class="btn-sair" id="btn-sair">Sair</button>
            </div>
          </div>
          <div class="portal-tabs">
            <button class="portal-tab active" data-tab="materiais">📚 Materiais</button>
            <span class="portal-tabs-sep"></span>
            <button class="portal-tab" data-tab="livro-0">📖 Starter</button>
            <button class="portal-tab" data-tab="livro-1">📖 A1</button>
            <button class="portal-tab" data-tab="livro-2">📖 A2</button>
            <button class="portal-tab" data-tab="livro-3">📖 B1</button>
            <button class="portal-tab" data-tab="livro-4">📖 B2</button>
          </div>
          <div class="main-content" id="tab-content"></div>
        </div>
      </div>
    </div>
  `;
  app.innerHTML = '';
  app.appendChild(main);

  const linksGerais = [
      { t: 'Áudios dos Livros', i: '🎧', url: 'https://www.youtube.com/playlist?list=PL34IdbZXxdZrPlbPevlLZwszORWe9_G2o' },
      { t: 'Extra Activities',  i: '📝', url: 'https://drive.google.com/drive/folders/1uz3ATitZpIJM7S_-ve_w6XmqOosmqPvX' },
      { t: 'Material para Aulas',         i: '📂', url: 'https://drive.google.com/drive/folders/1B3HnQl6Zz8aTj2oi_BwAY7n2jEPV5AHU?usp=drive_link' },
      { t: 'Transcript dos Listenings',   i: '📝', url: 'https://docs.google.com/document/d/15KSATfziQzmvirEy8sKnWgB4TZr3xwRDmXWMLLFTYJE/edit?usp=sharing' },
  ];
  function buildCards(links, container) {
    links.forEach(link => {
      const card = document.createElement('div');
      card.className = 'card-base';
      card.innerHTML = '<div class="icon-box">' + link.i + '</div><strong style="color:#1a2b21">' + link.t + '</strong>';
      card.onclick = () => { if (link.t === 'Transcript dos Listenings') { openViewer(link.t, link.url); } else { window.open(link.url, '_blank'); } };
      container.appendChild(card);
    });
  }

  function showTab(tabName) {
    const tabContent = document.getElementById('tab-content');
    if (!tabContent) return;
    document.querySelectorAll('.portal-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    tabContent.innerHTML = '';

    if (tabName === 'materiais') {
      tabContent.innerHTML =
        '<div class="page-title-block"><div class="page-title-text"><h2>Materiais Extras</h2><p class="page-subtitle">Acesse os recursos oficiais da Nexus English Center.</p></div></div>' +
        '<div class="quick-grid" id="q-gerais"></div>';
      buildCards(linksGerais, document.getElementById('q-gerais'));


    } else if (tabName === 'ebook') {
      const iframe = document.createElement('iframe');
      iframe.src = 'ebook.html';
      iframe.style.cssText = 'width:100%;height:calc(100vh - 200px);border:none;border-radius:12px;';
      tabContent.appendChild(iframe);

    } else if (tabName === 'calendario') {
      renderCalendar(tabContent);

    } else if (tabName.startsWith('livro-')) {
      const livroIdx = parseInt(tabName.split('-')[1]);
      const livro = LIVROS_2026[livroIdx];
      if (!livro) return;
      const levelNames = ['Starter','A1','A2','B1','B2'];
      tabContent.innerHTML =
        '<div class="page-title-block">' +
          '<div class="page-title-text">' +
            '<h2>Materiais – ' + livro.titulo + '</h2>' +
            '<p class="page-subtitle">Acesse livros, transcritos e conteúdos extras</p>' +
          '</div>' +
          '<div class="level-tabs" id="level-pills">' +
            LIVROS_2026.map((l,i) =>
              '<button class="level-tab' + (i===livroIdx?' active':'') + '" data-livro="' + i + '">' + (levelNames[i]||l.titulo) + '</button>'
            ).join('') +
          '</div>' +
        '</div>' +
        '<div class="quick-grid" id="q-livro"></div>';
      const card = document.createElement('div');
      card.className = 'card-base';
      card.innerHTML = '<div class="icon-box">📖</div><div><strong style="color:#1a2b21;font-size:17px;display:block;">Student Book</strong><span style="color:#888;font-size:13px;">' + livro.titulo + '</span></div>';
      card.onclick = () => openViewer(livro.titulo, livro.url);
      document.getElementById('q-livro').appendChild(card);
      if (livroIdx === 0) {
        const ebookCard = document.createElement('div');
        ebookCard.className = 'card-base';
        ebookCard.innerHTML = '<div class="icon-box">📘</div><div><strong style="color:#1a2b21;font-size:17px;display:block;">Ebook</strong><span style="color:#888;font-size:13px;">Starter</span></div>';
        ebookCard.onclick = () => openEbookModal();
        document.getElementById('q-livro').appendChild(ebookCard);
              const guiasCard = document.createElement('div');
        guiasCard.className = 'card-base';
        guiasCard.innerHTML = '<div class="icon-box">📋</div><div><strong style="color:#1a2b21;font-size:17px;display:block;">Guias Starter</strong></div>';
        guiasCard.onclick = () => openViewer('Guias Starter', 'https://docs.google.com/document/d/1s59KaF69-tCAQdg_abUbMjdNVDnhVJ0SDfO5L56n7h0/edit?usp=drive_link');
        document.getElementById('q-livro').appendChild(guiasCard);
      }
      if (livroIdx === 4) {
        const b2ScriptsCard = document.createElement('div');
        b2ScriptsCard.className = 'card-base';
        b2ScriptsCard.innerHTML = '<div class="icon-box">📜</div><div><strong style="color:#1a2b21;font-size:17px;display:block;">B2 Scripts</strong></div>';
        b2ScriptsCard.onclick = () => { window.open('https://drive.google.com/drive/folders/1yoRbzOyUKuuP-_KQZRZmBigmTh5v6YkX?usp=drive_link', '_blank'); };
        document.getElementById('q-livro').appendChild(b2ScriptsCard);
        const listeningB2Card = document.createElement('div');
        listeningB2Card.className = 'card-base';
        listeningB2Card.innerHTML = '<div class="icon-box">🎵</div><div><strong style="color:#1a2b21;font-size:17px;display:block;">Listening B2</strong></div>';
        listeningB2Card.onclick = () => { window.open('https://drive.google.com/drive/folders/1JTeOIlIY5wgdGLkuERuj-l2EqNwQNfpA?usp=drive_link', '_blank'); };
        document.getElementById('q-livro').appendChild(listeningB2Card);}
      document.querySelectorAll('.level-tab').forEach(btn => {
        btn.addEventListener('click', () => showTab('livro-' + btn.dataset.livro));
      });
    } else if (tabName === 'treinamento') {
        tabContent.innerHTML = `
          <style>
            *{box-sizing:border-box;margin:0;padding:0}
.nx{border-radius:12px;overflow:hidden;width:100%}
.nx-top{background:transparent;padding:0}
.nx-body{padding:0}
.nx-week-title{font-size:11px;color:#F4845F;letter-spacing:1.5px;margin-bottom:4px;font-weight:600}
.nx-week-sub{font-size:13px;color:#888;margin-bottom:16px;line-height:1.5}
.nx-days{display:flex;flex-direction:column;gap:8px}
.nx-day{background:#ffffff;border-radius:12px;overflow:hidden;border:1.5px solid #efe9e3;box-shadow:0 1px 4px rgba(0,0,0,0.04)}
.nx-day.has-quiz{border-color:#fde8df}
.nx-day-hd{display:flex;align-items:center;gap:10px;padding:12px 16px;cursor:pointer;user-select:none;transition:background .15s}
.nx-day-hd:hover{background:#fdf8f5}
.nx-day-num{font-size:10px;font-weight:600;color:#F4845F;background:#fde8df;padding:3px 8px;border-radius:6px;white-space:nowrap;font-family:monospace}
.nx-day-title{font-size:13px;color:#1a1a1a;flex:1;font-weight:500}
.nx-badges{display:flex;gap:4px;align-items:center;flex-shrink:0}
.nx-quiz-badge{font-size:9px;padding:2px 8px;border-radius:6px;background:#fde8df;color:#F4845F;font-weight:600;white-space:nowrap}
.nx-chevron{width:13px;height:13px;flex-shrink:0;transition:transform .2s;opacity:.4;color:#555}
.nx-chevron.open{transform:rotate(90deg);opacity:.8}
.nx-day-body{display:none;border-top:1px solid #f5f0eb;padding:10px 16px;flex-direction:column;gap:0;background:#fafaf8}
.nx-day-body.open{display:flex}
.nx-item{display:flex;align-items:flex-start;gap:8px;padding:6px 0;border-bottom:1px solid #f0ece8}
.nx-item:last-child{border-bottom:none}
.nx-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;margin-top:5px}
.dot-portal{background:#F4845F}
.dot-live{background:#1d9e75}
.dot-obs{background:#7f77dd}
.dot-prat{background:#e87640}
.nx-item-text{font-size:12px;color:#555;line-height:1.5}
.nx-item-text strong{color:#1a1a1a;font-weight:600}
.nx-tag{display:inline-block;font-size:9px;padding:1px 6px;border-radius:4px;margin-left:4px;vertical-align:middle;font-weight:500}
.tg-portal{background:#fde8df;color:#F4845F}
.tg-live{background:#e0f4ed;color:#1d9e75}
.tg-obs{background:#eeecfa;color:#7f77dd}
.tg-prat{background:#fdeee8;color:#e07040}
            .train-tabs { display:flex; gap:8px; margin-bottom:20px; flex-wrap:wrap; }
            .train-tab { background:#f5f0eb; border:none; border-radius:50px; padding:8px 20px; color:#888; font-size:13px; font-weight:600; cursor:pointer; transition:all .2s; }
            .train-tab.active { background:#F4845F; color:#fff; box-shadow:0 2px 8px rgba(244,132,95,.3); }
            .train-tab:hover:not(.active) { background:#f0e8e3; color:#1a1a1a; }
            .train-content { display:none; }
            .train-content.active { display:block; }
            .nx { background:transparent !important; padding:0 !important; }
          </style>
          <div class="page-title-block">
            <div class="page-title-text">
              <h2>Treinamento</h2>
              <p class="page-subtitle">Programa de onboarding — 3 semanas</p>
            </div>
          </div>
          <div class="train-tabs">
            <button class="train-tab active" data-week="w1">SEMANA 1 — Integração</button>
            <button class="train-tab" data-week="w2">SEMANA 2 — Imersão</button>
            <button class="train-tab" data-week="w3">SEMANA 3 — Prática</button>
          </div>
          <div id="w1" class="train-content active nx"><div id="w1">
      <div class="nx-week-title">SEMANA 1 — INTEGRAÇÃO E CONHECIMENTO GERAL</div>
      <div class="nx-week-sub">Teoria, sistema e materiais. Vídeos introdutórios + quizes de compreensão.</div>
      <div class="nx-days">

        <div class="nx-day has-quiz">
          <div class="nx-day-hd" onclick="tog(this)">
            <span class="nx-day-num">DIA 01</span>
            <span class="nx-day-title">Boas-vindas + sistema</span>
            <div class="nx-badges"><span class="nx-quiz-badge">1 quiz</span></div>
            <svg class="nx-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
          <div class="nx-day-body">
            <div class="nx-item"><div class="nx-dot dot-portal"></div><div class="nx-item-text"><strong>Assistir: Bem-vindo à Nexus</strong> — cultura, valores, expectativas e rotina<span class="nx-tag tg-portal">portal</span></div></div>
            <div class="nx-item"><div class="nx-dot dot-portal"></div><div class="nx-item-text"><strong>Assistir: Tour pelo portal</strong> — navegação, student records e materiais<span class="nx-tag tg-portal">portal</span></div></div>
            <div class="nx-item"><div class="nx-dot dot-live"></div><div class="nx-item-text"><strong>Reunião de boas-vindas</strong> com coordenador — apresentação da equipe e da unidade<span class="nx-tag tg-live">ao vivo</span></div></div>
          </div>
        </div>

        <div class="nx-day has-quiz">
          <div class="nx-day-hd" onclick="tog(this)">
            <span class="nx-day-num">DIA 02</span>
            <span class="nx-day-title">Livros: Starter e A1</span>
            <div class="nx-badges"><span class="nx-quiz-badge">1 quiz</span></div>
            <svg class="nx-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
          <div class="nx-day-body">
            <div class="nx-item"><div class="nx-dot dot-portal"></div><div class="nx-item-text"><strong>Assistir: Starter — objetivo e lesson steps</strong> — vocabulary, repetition, guided practice<span class="nx-tag tg-portal">portal</span></div></div>
            <div class="nx-item"><div class="nx-dot dot-portal"></div><div class="nx-item-text"><strong>Assistir: A1 — objetivo e lesson steps</strong> — gramática estruturada, 3 skills, phrasal verbs<span class="nx-tag tg-portal">portal</span></div></div>
            <div class="nx-item"><div class="nx-dot dot-portal"></div><div class="nx-item-text"><strong>Ler as unidades 1 e 2</strong> do Starter e do A1 fisicamente<span class="nx-tag tg-portal">portal</span></div></div>
          </div>
        </div>

        <div class="nx-day has-quiz">
          <div class="nx-day-hd" onclick="tog(this)">
            <span class="nx-day-num">DIA 03</span>
            <span class="nx-day-title">Livros: A2, B1 e B2</span>
            <div class="nx-badges"><span class="nx-quiz-badge">1 quiz</span></div>
            <svg class="nx-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
          <div class="nx-day-body">
            <div class="nx-item"><div class="nx-dot dot-portal"></div><div class="nx-item-text"><strong>Assistir: A2 e B1 — estrutura e lesson steps</strong> — homework → warm-up → grammar → vocabulary → phrasal verbs<span class="nx-tag tg-portal">portal</span></div></div>
            <div class="nx-item"><div class="nx-dot dot-portal"></div><div class="nx-item-text"><strong>Assistir: O quadro em toda aula</strong> — nunca apagar, organização visual<span class="nx-tag tg-portal">portal</span></div></div>
            <div class="nx-item"><div class="nx-dot dot-portal"></div><div class="nx-item-text"><strong>Ler as unidades 1 e 2</strong> do A2 e do B1 fisicamente<span class="nx-tag tg-portal">portal</span></div></div>
          </div>
        </div>

        <div class="nx-day has-quiz">
          <div class="nx-day-hd" onclick="tog(this)">
            <span class="nx-day-num">DIA 04</span>
            <span class="nx-day-title">Conversation + student records</span>
            <div class="nx-badges"><span class="nx-quiz-badge">1 quiz</span></div>
            <svg class="nx-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
          <div class="nx-day-body">
            <div class="nx-item"><div class="nx-dot dot-portal"></div><div class="nx-item-text"><strong>Assistir: Conversation — os 3 steps</strong> — warm-up, vocabulary spotlight, talking time, pares, forbidden words<span class="nx-tag tg-portal">portal</span></div></div>
            <div class="nx-item"><div class="nx-dot dot-portal"></div><div class="nx-item-text"><strong>Assistir: Student records — como escrever</strong> — o que incluir, o que não fazer<span class="nx-tag tg-portal">portal</span></div></div>
            <div class="nx-item"><div class="nx-dot dot-portal"></div><div class="nx-item-text"><strong>Praticar escrita de student record</strong> — baseado em aula simulada descrita no portal<span class="nx-tag tg-portal">portal</span></div></div>
          </div>
        </div>

        <div class="nx-day has-quiz">
          <div class="nx-day-hd" onclick="tog(this)">
            <span class="nx-day-num">DIA 05</span>
            <span class="nx-day-title">Formatos de aula + quiz final da semana</span>
            <div class="nx-badges"><span class="nx-quiz-badge">quiz final</span></div>
            <svg class="nx-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
          <div class="nx-day-body">
            <div class="nx-item"><div class="nx-dot dot-portal"></div><div class="nx-item-text"><strong>Assistir: Aulas presenciais, online e híbridas</strong> — diferenças práticas, câmeras, engajamento<span class="nx-tag tg-portal">portal</span></div></div>
            <div class="nx-item"><div class="nx-dot dot-live"></div><div class="nx-item-text"><strong>Reunião de revisão</strong> com coordenador — dúvidas da semana antes do quiz<span class="nx-tag tg-live">ao vivo</span></div></div>
          </div>
        </div>

      </div>
    </div>

    <!-- SEMANA 2 -->
    </div>
          <div id="w2" class="train-content nx"><div id="w2">
      <div class="nx-week-title">SEMANA 2 — IMERSÃO E OBSERVAÇÃO</div>
      <div class="nx-week-sub">Observação de aulas reais e gravadas. Quizes de aplicação.</div>
      <div class="nx-days">

        <div class="nx-day">
          <div class="nx-day-hd" onclick="tog(this)">
            <span class="nx-day-num">DIA 06</span>
            <span class="nx-day-title">Observar aulas ao vivo</span>
            <svg class="nx-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
          <div class="nx-day-body">
            <div class="nx-item"><div class="nx-dot dot-obs"></div><div class="nx-item-text"><strong>Observar aula presencial ao vivo</strong> — quadro, ritmo, uso do livro e postura<span class="nx-tag tg-obs">observação</span></div></div>
            <div class="nx-item"><div class="nx-dot dot-obs"></div><div class="nx-item-text"><strong>Observar aula online ao vivo</strong> — plataforma, câmeras, engajamento<span class="nx-tag tg-obs">observação</span></div></div>
            <div class="nx-item"><div class="nx-dot dot-portal"></div><div class="nx-item-text"><strong>Preencher diário de observação</strong> no portal<span class="nx-tag tg-portal">portal</span></div></div>
            <div class="nx-item"><div class="nx-dot dot-live"></div><div class="nx-item-text"><strong>Debriefing</strong> com coordenador<span class="nx-tag tg-live">ao vivo</span></div></div>
          </div>
        </div>

        <div class="nx-day has-quiz">
          <div class="nx-day-hd" onclick="tog(this)">
            <span class="nx-day-num">DIA 07</span>
            <span class="nx-day-title">Aulas gravadas + análise</span>
            <div class="nx-badges"><span class="nx-quiz-badge">1 quiz</span></div>
            <svg class="nx-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
          <div class="nx-day-body">
            <div class="nx-item"><div class="nx-dot dot-portal"></div><div class="nx-item-text"><strong>Assistir aulas gravadas do acervo</strong> — 1 de cada nível: Starter, A1, A2 ou B1<span class="nx-tag tg-portal">portal</span></div></div>
            <div class="nx-item"><div class="nx-dot dot-portal"></div><div class="nx-item-text"><strong>Analisar student records</strong> das aulas assistidas — comparar com o padrão ensinado<span class="nx-tag tg-portal">portal</span></div></div>
            <div class="nx-item"><div class="nx-dot dot-live"></div><div class="nx-item-text"><strong>Debriefing</strong> com coordenador sobre as observações<span class="nx-tag tg-live">ao vivo</span></div></div>
          </div>
        </div>

        <div class="nx-day has-quiz">
          <div class="nx-day-hd" onclick="tog(this)">
            <span class="nx-day-num">DIA 08</span>
            <span class="nx-day-title">Conversation ao vivo + gravada</span>
            <div class="nx-badges"><span class="nx-quiz-badge">1 quiz</span></div>
            <svg class="nx-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
          <div class="nx-day-body">
            <div class="nx-item"><div class="nx-dot dot-obs"></div><div class="nx-item-text"><strong>Observar conversation ao vivo</strong> — 3 steps, vocabulary spotlight, talking time e forbidden words na prática<span class="nx-tag tg-obs">observação</span></div></div>
            <div class="nx-item"><div class="nx-dot dot-portal"></div><div class="nx-item-text"><strong>Assistir conversation gravada</strong> — comparar estilos de facilitação<span class="nx-tag tg-portal">portal</span></div></div>
            <div class="nx-item"><div class="nx-dot dot-portal"></div><div class="nx-item-text"><strong>Preencher ficha de análise</strong> da conversation no portal<span class="nx-tag tg-portal">portal</span></div></div>
          </div>
        </div>

        <div class="nx-day">
          <div class="nx-day-hd" onclick="tog(this)">
            <span class="nx-day-num">DIA 09</span>
            <span class="nx-day-title">Portal livre + planejamento do mock</span>
            <svg class="nx-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
          <div class="nx-day-body">
            <div class="nx-item"><div class="nx-dot dot-portal"></div><div class="nx-item-text"><strong>Exploração livre do portal</strong> — materiais extras, fichas, áudios e vídeos de suporte por nível<span class="nx-tag tg-portal">portal</span></div></div>
            <div class="nx-item"><div class="nx-dot dot-prat"></div><div class="nx-item-text"><strong>Planejar a aula mock</strong> — escolher livro, unidade e montar plano de aula completo<span class="nx-tag tg-prat">prática</span></div></div>
            <div class="nx-item"><div class="nx-dot dot-portal"></div><div class="nx-item-text"><strong>Rever vídeos e gravações com dúvidas específicas</strong> — o acervo serve como suporte permanente<span class="nx-tag tg-portal">portal</span></div></div>
          </div>
        </div>

        <div class="nx-day has-quiz">
          <div class="nx-day-hd" onclick="tog(this)">
            <span class="nx-day-num">DIA 10</span>
            <span class="nx-day-title">Consolidação + orientação para o mock</span>
            <div class="nx-badges"><span class="nx-quiz-badge">quiz final</span></div>
            <svg class="nx-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
          <div class="nx-day-body">
            <div class="nx-item"><div class="nx-dot dot-live"></div><div class="nx-item-text"><strong>Reunião de orientação para o mock</strong> — critérios de avaliação, dúvidas e alinhamento<span class="nx-tag tg-live">ao vivo</span></div></div>
            <div class="nx-item"><div class="nx-dot dot-portal"></div><div class="nx-item-text"><strong>Finalizar plano de aula do mock</strong> e submeter no portal<span class="nx-tag tg-portal">portal</span></div></div>
          </div>
        </div>

      </div>
    </div>

    <!-- SEMANA 3 -->
    </div>
          <div id="w3" class="train-content nx"><div id="w3">
      <div class="nx-week-title">SEMANA 3 — PRÁTICA SUPERVISIONADA</div>
      <div class="nx-week-sub">Mocks e aulas reais. O professor consulta o acervo quando precisar.</div>
      <div class="nx-days">

        <div class="nx-day">
          <div class="nx-day-hd" onclick="tog(this)">
            <span class="nx-day-num">DIA 11</span>
            <span class="nx-day-title">Mock 1 — aula regular</span>
            <svg class="nx-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
          <div class="nx-day-body">
            <div class="nx-item"><div class="nx-dot dot-prat"></div><div class="nx-item-text"><strong>Aula mock</strong> — coordenador observa postura, quadro, steps e student record<span class="nx-tag tg-prat">mock</span></div></div>
            <div class="nx-item"><div class="nx-dot dot-live"></div><div class="nx-item-text"><strong>Feedback estruturado imediato</strong> — formulário do portal + sessão com coordenador<span class="nx-tag tg-live">ao vivo</span></div></div>
            <div class="nx-item"><div class="nx-dot dot-portal"></div><div class="nx-item-text"><strong>Auto-avaliação + rever vídeos relacionados</strong> se houver ponto de melhora específico<span class="nx-tag tg-portal">portal</span></div></div>
          </div>
        </div>

        <div class="nx-day">
          <div class="nx-day-hd" onclick="tog(this)">
            <span class="nx-day-num">DIA 12</span>
            <span class="nx-day-title">Mock 2 — conversation</span>
            <svg class="nx-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
          <div class="nx-day-body">
            <div class="nx-item"><div class="nx-dot dot-prat"></div><div class="nx-item-text"><strong>Aula mock de conversation</strong> — foco nos 3 steps e no papel do professor como facilitador<span class="nx-tag tg-prat">mock</span></div></div>
            <div class="nx-item"><div class="nx-dot dot-live"></div><div class="nx-item-text"><strong>Feedback estruturado</strong> com coordenador — comparar com mock 1<span class="nx-tag tg-live">ao vivo</span></div></div>
            <div class="nx-item"><div class="nx-dot dot-portal"></div><div class="nx-item-text"><strong>Student record da aula mock</strong> — submetido no portal após o feedback<span class="nx-tag tg-portal">portal</span></div></div>
          </div>
        </div>

        <div class="nx-day">
          <div class="nx-day-hd" onclick="tog(this)">
            <span class="nx-day-num">DIA 13</span>
            <span class="nx-day-title">Primeira aula real supervisionada</span>
            <svg class="nx-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
          <div class="nx-day-body">
            <div class="nx-item"><div class="nx-dot dot-prat"></div><div class="nx-item-text"><strong>Aula real com alunos da Nexus</strong> — coordenador presente como observador<span class="nx-tag tg-prat">aula real</span></div></div>
            <div class="nx-item"><div class="nx-dot dot-live"></div><div class="nx-item-text"><strong>Feedback pós-aula</strong> — 30 min com coordenador: pontos fortes e de melhora<span class="nx-tag tg-live">ao vivo</span></div></div>
            <div class="nx-item"><div class="nx-dot dot-portal"></div><div class="nx-item-text"><strong>Student record da aula</strong> — coordenador avalia a qualidade do registro<span class="nx-tag tg-portal">portal</span></div></div>
          </div>
        </div>

        <div class="nx-day">
          <div class="nx-day-hd" onclick="tog(this)">
            <span class="nx-day-num">DIA 14</span>
            <span class="nx-day-title">Segunda aula real supervisionada</span>
            <svg class="nx-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
          <div class="nx-day-body">
            <div class="nx-item"><div class="nx-dot dot-prat"></div><div class="nx-item-text"><strong>Segunda aula real</strong> — formato diferente do dia 13<span class="nx-tag tg-prat">aula real</span></div></div>
            <div class="nx-item"><div class="nx-dot dot-live"></div><div class="nx-item-text"><strong>Feedback comparativo</strong> — evolução em relação ao dia 13<span class="nx-tag tg-live">ao vivo</span></div></div>
            <div class="nx-item"><div class="nx-dot dot-portal"></div><div class="nx-item-text"><strong>Plano de desenvolvimento individual (PDI)</strong> — metas dos próximos 30 dias<span class="nx-tag tg-portal">portal</span></div></div>
          </div>
        </div>

        <div class="nx-day has-quiz">
          <div class="nx-day-hd" onclick="tog(this)">
            <span class="nx-day-num">DIA 15</span>
            <span class="nx-day-title">Conclusão + quiz certificador</span>
            <div class="nx-badges"><span class="nx-quiz-badge">quiz final</span></div>
            <svg class="nx-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
          <div class="nx-day-body">
            <div class="nx-item"><div class="nx-dot dot-live"></div><div class="nx-item-text"><strong>Reunião de conclusão</strong> — resultado do quiz, PDI finalizado e acesso completo ao portal<span class="nx-tag tg-live">ao vivo</span></div></div>
            <div class="nx-item"><div class="nx-dot dot-live"></div><div class="nx-item-text"><strong>Ritual de acompanhamento contínuo</strong> — check-ins mensais, acervo permanente disponível<span class="nx-tag tg-live">ao vivo</span></div></div>
          </div>
        </div>

      </div>
    </div></div>
        `;
        tabContent.querySelectorAll('.train-tab').forEach(btn => {
          btn.addEventListener('click', () => {
            tabContent.querySelectorAll('.train-tab').forEach(t => t.classList.remove('active'));
            tabContent.querySelectorAll('.train-content').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            tabContent.querySelector('#' + btn.dataset.week).classList.add('active');
          });
        });
        tabContent.querySelectorAll('.nx-day-hd').forEach(hd => {
          hd.addEventListener('click', () => {
            const body = hd.nextElementSibling;
            const chev = hd.querySelector('.nx-chevron');
            const open = body.classList.toggle('open');
            if(chev) chev.classList.toggle('open', open);
          });
        });
    }
  }

  document.querySelectorAll('.portal-tab').forEach(btn => {
    btn.addEventListener('click', () => showTab(btn.dataset.tab));
  });

  const matItem = document.querySelector('[data-section="materiais"]');
  if (matItem) {
    matItem.addEventListener('click', () => {
      document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
      matItem.classList.add('active');
      showTab('materiais');
    });
  }

  const calItem = document.querySelector('[data-section="calendario"]');
  if (calItem) {
    calItem.addEventListener('click', () => {
      document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
      calItem.classList.add('active');
      showTab('calendario');
    });
  }

    const trainItem = document.querySelector('[data-section="treinamento"]');
    if (trainItem && !trainItem.classList.contains('disabled')) {
        trainItem.addEventListener('click', () => {
            document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
            trainItem.classList.add('active');
            showTab('treinamento');
        });
    }

    document.getElementById('btn-sair').onclick = async () => {
    await client.auth.signOut();
    state.screen = 'login';
    localStorage.removeItem('nexus_last_activity');
    render();
  };

  showTab('materiais');
}
checkUser();

// ── EBOOK MODAL ──────────────────────────────────────────────────
function openEbookModal() {
  const old = document.getElementById('ebook-modal-overlay');
    if (old) old.remove();
      const overlay = document.createElement('div');
        overlay.id = 'ebook-modal-overlay';
          overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.85);display:flex;flex-direction:column;align-items:center;justify-content:center;';
            overlay.innerHTML =
                '<div style="background:#fff;border-radius:12px;width:96vw;height:94vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.6);">' +
                      '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 20px;background:#1a2b21;border-bottom:1px solid rgba(255,255,255,0.1);">' +
                              '<span style="color:white;font-weight:700;font-size:15px;">📘 Starter</span>' +
                                      '<button id="close-ebook-modal" style="background:rgba(255,255,255,0.15);border:none;color:white;border-radius:8px;padding:6px 14px;cursor:pointer;font-size:13px;font-weight:600;">✕ Fechar</button>' +
                                            '</div>' +
                                                  '<iframe src="ebook.html" style="flex:1;border:none;width:100%;background:#fff;" loading="lazy"></iframe>' +
                                                      '</div>';
                                                        document.body.appendChild(overlay);
                                                          document.getElementById('close-ebook-modal').onclick = () => overlay.remove();
                                                            overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
                                                            }


// ══════════════════════════════════════════════════════════════
// CALENDÁRIO INTERATIVO
// ══════════════════════════════════════════════════════════════
let calState = {
  year: new Date().getFullYear(),
  month: new Date().getMonth(),
  events: JSON.parse(localStorage.getItem('nexus_cal_events') || '{}')
};

function saveCalEvents() {
  localStorage.setItem('nexus_cal_events', JSON.stringify(calState.events));
}

function renderCalendar(container) {
  const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const EVENT_COLORS = ['', 'ev-blue', 'ev-green', 'ev-purple'];

  function buildCalendar() {
    const { year, month } = calState;
    const today = new Date();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();

    container.innerHTML = `
      <div class="calendar-view">
        <div class="calendar-header">
          <h2>📅 ${MONTH_NAMES[month]} ${year}</h2>
          <div style="display:flex;gap:8px;align-items:center;">
            <button class="cal-today-btn" id="cal-btn-today">Hoje</button>
            <button class="cal-nav-btn" id="cal-btn-prev">‹</button>
            <button class="cal-nav-btn" id="cal-btn-next">›</button>
          </div>
        </div>
        <div class="calendar-grid-header">
          ${DAY_NAMES.map(d => `<div class="cal-day-name">${d}</div>`).join('')}
        </div>
        <div class="calendar-grid" id="cal-grid"></div>
      </div>
    `;

    const grid = document.getElementById('cal-grid');
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const cell = document.createElement('div');
      cell.className = 'cal-cell';
      let dayNum, cellYear = year, cellMonth = month;
      let isOtherMonth = false;

      if (i < firstDay) {
        dayNum = daysInPrev - firstDay + i + 1;
        cellMonth = month - 1;
        if (cellMonth < 0) { cellMonth = 11; cellYear = year - 1; }
        isOtherMonth = true;
        cell.classList.add('other-month');
      } else if (i >= firstDay + daysInMonth) {
        dayNum = i - firstDay - daysInMonth + 1;
        cellMonth = month + 1;
        if (cellMonth > 11) { cellMonth = 0; cellYear = year + 1; }
        isOtherMonth = true;
        cell.classList.add('other-month');
      } else {
        dayNum = i - firstDay + 1;
      }

      const isToday = !isOtherMonth && dayNum === today.getDate() && month === today.getMonth() && year === today.getFullYear();
      if (isToday) cell.classList.add('today');

      const dateKey = `${cellYear}-${String(cellMonth+1).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`;
      const dayEvents = calState.events[dateKey] || [];
      if (dayEvents.length > 0) cell.classList.add('has-event');

      cell.innerHTML = `<span class="cal-day-num">${dayNum}</span>` +
        dayEvents.map(ev => `<div class="cal-event ${EVENT_COLORS[ev.color]||''}" data-key="${dateKey}" data-id="${ev.id}">${ev.title}</div>`).join('');

      cell.querySelectorAll('.cal-event').forEach(evEl => {
        evEl.addEventListener('click', (e) => {
          e.stopPropagation();
          openEventModal(evEl.dataset.key, parseInt(evEl.dataset.id));
        });
      });

      cell.addEventListener('click', () => openEventModal(dateKey, null));
      grid.appendChild(cell);
    }

    document.getElementById('cal-btn-prev').onclick = () => {
      calState.month--;
      if (calState.month < 0) { calState.month = 11; calState.year--; }
      buildCalendar();
    };
    document.getElementById('cal-btn-next').onclick = () => {
      calState.month++;
      if (calState.month > 11) { calState.month = 0; calState.year++; }
      buildCalendar();
    };
    document.getElementById('cal-btn-today').onclick = () => {
      calState.year = new Date().getFullYear();
      calState.month = new Date().getMonth();
      buildCalendar();
    };
  }

  function openEventModal(dateKey, eventId) {
    const existing = eventId !== null ? (calState.events[dateKey]||[]).find(e => e.id === eventId) : null;
    const [y,m,d] = dateKey.split('-');
    const dateStr = `${d}/${m}/${y}`;

    const overlay = document.createElement('div');
    overlay.className = 'cal-modal-overlay';
    overlay.innerHTML = `
      <div class="cal-modal">
        <h3>${existing ? '✏️ Editar Evento' : '➕ Novo Evento'} — ${dateStr}</h3>
        <input type="text" id="ev-title" placeholder="Título do evento" value="${existing ? existing.title : ''}">
        <textarea id="ev-desc" placeholder="Descrição (opcional)" rows="3" style="resize:none;">${existing ? (existing.desc||'') : ''}</textarea>
        <select id="ev-color">
          <option value="0" ${(!existing||existing.color===0)?'selected':''}>🟠 Laranja (padrão)</option>
          <option value="1" ${existing&&existing.color===1?'selected':''}>🔵 Azul</option>
          <option value="2" ${existing&&existing.color===2?'selected':''}>🟢 Verde</option>
          <option value="3" ${existing&&existing.color===3?'selected':''}>🟣 Roxo</option>
        </select>
        <div class="cal-modal-actions">
          ${existing ? '<button class="btn-delete-event" id="ev-btn-delete">🗑 Excluir</button>' : ''}
          <button class="btn-cancel-event" id="ev-btn-cancel">Cancelar</button>
          <button class="btn-save-event" id="ev-btn-save">Salvar</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('ev-btn-cancel').onclick = () => overlay.remove();
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

    document.getElementById('ev-btn-save').onclick = () => {
      const title = document.getElementById('ev-title').value.trim();
      if (!title) return;
      const color = parseInt(document.getElementById('ev-color').value);
      const desc = document.getElementById('ev-desc').value.trim();
      if (!calState.events[dateKey]) calState.events[dateKey] = [];
      if (existing) {
        const idx = calState.events[dateKey].findIndex(e => e.id === eventId);
        calState.events[dateKey][idx] = { ...existing, title, color, desc };
      } else {
        calState.events[dateKey].push({ id: Date.now(), title, color, desc });
      }
      saveCalEvents();
      overlay.remove();
      buildCalendar();
    };

    if (existing) {
      document.getElementById('ev-btn-delete').onclick = () => {
        calState.events[dateKey] = calState.events[dateKey].filter(e => e.id !== eventId);
        if (calState.events[dateKey].length === 0) delete calState.events[dateKey];
        saveCalEvents();
        overlay.remove();
        buildCalendar();
      };
    }

    setTimeout(() => document.getElementById('ev-title').focus(), 50);
  }

  buildCalendar();
}
