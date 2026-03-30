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
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(evt => window.removeEventListener(evt, resetInactivityTimer));
}

// ── VIEWER DE PDF EMBUTIDO ──────────────────────────────────────
// Converte URL do Google Drive para URL de preview embutível
function getDriveEmbedUrl(url) {
    // Formato: https://drive.google.com/file/d/FILE_ID/view
  const fileMatch = url.match(/\/file\/d\/([^/]+)/);
    if (fileMatch) {
          return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
    }
    // Formato: https://drive.google.com/open?id=FILE_ID
  const openMatch = url.match(/[?&]id=([^&]+)/);
    if (openMatch) {
          return `https://drive.google.com/file/d/${openMatch[1]}/preview`;
    }
    return url;
}

function openPdfViewer(title, url) {
    // Remove modal antigo se existir
  const old = document.getElementById('pdf-modal-overlay');
    if (old) old.remove();

  const embedUrl = getDriveEmbedUrl(url);

  const overlay = document.createElement('div');
    overlay.id = 'pdf-modal-overlay';
    overlay.style.cssText = `
        position: fixed; inset: 0; z-index: 9999;
            background: rgba(0,0,0,0.75);
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                  `;

  overlay.innerHTML = `
      <div style="
            background: #1a2b21; border-radius: 12px; width: 92vw; height: 90vh;
                  display: flex; flex-direction: column; overflow: hidden;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
                            ">
                                  <div style="
                                          display: flex; align-items: center; justify-content: space-between;
                                                  padding: 12px 20px; background: #243b2f; border-bottom: 1px solid rgba(255,255,255,0.1);
                                                        ">
                                                                <span style="color: white; font-weight: 700; font-size: 15px;">📖 ${title}</span>
                                                                        <button id="close-pdf-modal" style="
                                                                                  background: rgba(255,255,255,0.15); border: none; color: white;
                                                                                            border-radius: 8px; padding: 6px 14px; cursor: pointer; font-size: 13px; font-weight: 600;
                                                                                                    ">✕ Fechar</button>
                                                                                                          </div>
                                                                                                                <iframe
                                                                                                                        src="${embedUrl}"
                                                                                                                                style="flex: 1; border: none; width: 100%; background: #fff;"
                                                                                                                                        allow="autoplay"
                                                                                                                                                loading="lazy"
                                                                                                                                                      ></iframe>
                                                                                                                                                          </div>
                                                                                                                                                            `;

  document.body.appendChild(overlay);

  document.getElementById('close-pdf-modal').onclick = () => overlay.remove();
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

// ── MODAL DE LISTAGEM DE LIVROS ─────────────────────────────────
// Lista os livros individuais. Substitua os IDs do Drive pelos seus.
const LIVROS_2026 = [
    // Exemplo:
    // { titulo: 'Starter A - Unit 1', url: 'https://drive.google.com/file/d/SEU_ID_AQUI/view' },
    // { titulo: 'Starter B - Unit 2', url: 'https://drive.google.com/file/d/SEU_ID_AQUI/view' },
    //
    // INSTRUCAO: Abra cada PDF no Google Drive, clique em "Compartilhar" > copie o link,
    // e adicione aqui no formato acima. Exemplo de link:
    // https://drive.google.com/file/d/1aBcDeFgHiJkLmNoPqRsTuVwXyZ/view?usp=sharing
  ];

function openBooksModal() {
    const old = document.getElementById('books-modal-overlay');
    if (old) old.remove();

  const overlay = document.createElement('div');
    overlay.id = 'books-modal-overlay';
    overlay.style.cssText = `
        position: fixed; inset: 0; z-index: 9999;
            background: rgba(0,0,0,0.75);
                display: flex; align-items: center; justify-content: center;
                  `;

  const listaHTML = LIVROS_2026.length > 0
      ? LIVROS_2026.map((livro, i) => `
              <div
                        class="book-item"
                                  data-idx="${i}"
                                            style="
                                                        display: flex; align-items: center; gap: 12px;
                                                                    padding: 14px 16px; border-radius: 10px;
                                                                                background: rgba(255,255,255,0.07);
                                                                                            cursor: pointer; transition: background 0.2s;
                                                                                                        margin-bottom: 8px;
                                                                                                                  "
                                                                                                                            onmouseover="this.style.background='rgba(255,255,255,0.15)'"
                                                                                                                                      onmouseout="this.style.background='rgba(255,255,255,0.07)'"
                                                                                                                                              >
                                                                                                                                                        <span style="font-size: 22px;">📄</span>
                                                                                                                                                                  <span style="color: white; font-weight: 600; font-size: 14px;">${livro.titulo}</span>
                                                                                                                                                                            <span style="margin-left: auto; color: rgba(255,255,255,0.5); font-size: 12px;">Abrir →</span>
                                                                                                                                                                                    </div>
                                                                                                                                                                                          `).join('')
        : `<div style="color: rgba(255,255,255,0.6); text-align: center; padding: 30px; font-size: 14px;">
                ⚠️ Nenhum livro cadastrado ainda.<br><br>
                        <small>Adicione os links dos PDFs na variável <strong>LIVROS_2026</strong> no arquivo app.js.</small>
                               </div>`;

  overlay.innerHTML = `
      <div style="
            background: #1a2b21; border-radius: 14px; width: 500px; max-width: 94vw;
                  max-height: 80vh; display: flex; flex-direction: column;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
                            ">
                                  <div style="
                                          display: flex; align-items: center; justify-content: space-between;
                                                  padding: 16px 20px; background: #243b2f; border-radius: 14px 14px 0 0;
                                                          border-bottom: 1px solid rgba(255,255,255,0.1);
                                                                ">
                                                                        <span style="color: white; font-weight: 700; font-size: 16px;">📚 Livros 2026</span>
                                                                                <button id="close-books-modal" style="
                                                                                          background: rgba(255,255,255,0.15); border: none; color: white;
                                                                                                    border-radius: 8px; padding: 6px 14px; cursor: pointer; font-size: 13px; font-weight: 600;
                                                                                                            ">✕ Fechar</button>
                                                                                                                  </div>
                                                                                                                        <div style="padding: 16px; overflow-y: auto; flex: 1;">
                                                                                                                                ${listaHTML}
                                                                                                                                      </div>
                                                                                                                                          </div>
                                                                                                                                            `;

  document.body.appendChild(overlay);

  document.getElementById('close-books-modal').onclick = () => overlay.remove();
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  // Clique em cada livro abre o PDF viewer
  overlay.querySelectorAll('.book-item').forEach(el => {
        el.addEventListener('click', () => {
                const idx = parseInt(el.dataset.idx);
                const livro = LIVROS_2026[idx];
                overlay.remove();
                openPdfViewer(livro.titulo, livro.url);
        });
  });
}

// ── INICIALIZAÇÃO ───────────────────────────────────────────────
async function checkUser() {
    const { data: { session } } = await client.auth.getSession();
    if (session) {
          state.user = session.user;
          state.screen = 'portal';
          startInactivityWatch();
    } else {
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
        <div class="login-box">
              <div style="margin-bottom:20px">
                      <img src="${NEXUS_LOGO_DATA}" alt="Nexus Logo" style="width:100%; max-width:250px; height:auto; display:block; margin:0 auto">
                              <p style="font-size:14px; color:#E76F51; font-weight:700; text-transform:uppercase; letter-spacing:2px; margin-top:10px; text-align:center">Chapecó - SC</p>
                                    </div>
                                          <p style="font-size:12px; color:#555; font-weight:600; text-transform:uppercase; letter-spacing:2px; margin-bottom:25px; text-align:center">Portal do Professor</p>
                                                <div id="login-err" style="display:none; color:#ff4444; margin-bottom:15px; font-size:14px; text-align:center;">E-mail ou senha incorretos</div>
                                                      <input type="text" id="email" class="form-input" placeholder="E-mail" autocomplete="username">
                                                            <input type="password" id="pass" class="form-input" placeholder="Senha" autocomplete="current-password">
                                                                  <button id="btn-entrar" class="btn-full">Entrar</button>
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

// ── PORTAL PRINCIPAL ────────────────────────────────────────────
function renderPortal(app) {
    const teacherName = getTeacherName(state.user?.email);
    const main = document.createElement('div');
    main.innerHTML = `
        <header class="header-main">
              <div style="display:flex; align-items:center">
                      <img src="${NEXUS_LOGO_DATA}" alt="Nexus Logo" style="max-height:45px; margin-right:15px;">
                              <div>
                                        <strong style="font-size:18px">Portal do Professor</strong>
                                                  <div style="font-size:13px; color:rgba(255,255,255,0.95); font-weight:600; letter-spacing:1.5px; margin-top:3px; text-transform:uppercase;">📍 Chapecó - SC</div>
                                                          </div>
                                                                </div>
                                                                      <div style="display:flex; gap:10px; align-items:center;">
                                                                              <div style="background:rgba(255,255,255,0.2); padding:8px 20px; border-radius:30px; font-size:13px; color:white">
                                                                                        👋 Olá, Teacher ${teacherName}!
                                                                                                </div>
                                                                                                        <button id="btn-sair" style="background:none; border:1px solid rgba(255,255,255,0.4); color:white; border-radius:15px; padding:5px 10px; cursor:pointer; font-size:11px;">Sair</button>
                                                                                                              </div>
                                                                                                                  </header>
                                                                                                                      <div class="portal-body">
                                                                                                                            <nav class="sidebar">
                                                                                                                                    <div class="sidebar-item active" data-section="materiais">
                                                                                                                                              <span class="sidebar-icon">📚</span>
                                                                                                                                                        <span>Materiais</span>
                                                                                                                                                                </div>
                                                                                                                                                                        <div class="sidebar-item disabled" data-section="treinamento">
                                                                                                                                                                                  <span class="sidebar-icon">🎓</span>
                                                                                                                                                                                            <span>Treinamento</span>
                                                                                                                                                                                                    </div>
                                                                                                                                                                                                          </nav>
                                                                                                                                                                                                                <div class="main-content">
                                                                                                                                                                                                                        <div class="container">
                                                                                                                                                                                                                                  <h1 style="color:#1a2b21; font-family:serif; margin-bottom:5px;">Materiais Extras</h1>
                                                                                                                                                                                                                                            <p class="subtitle">Acesse os recursos oficiais da Nexus English Center.</p>
                                                                                                                                                                                                                                                      <div class="section-title">Materiais Gerais</div>
                                                                                                                                                                                                                                                                <div class="quick-grid" id="q-gerais"></div>
                                                                                                                                                                                                                                                                          <div class="section-title">Nível B2</div>
                                                                                                                                                                                                                                                                                    <div class="quick-grid" id="q-b2"></div>
                                                                                                                                                                                                                                                                                              <div class="section-title">Suporte</div>
                                                                                                                                                                                                                                                                                                        <div class="quick-grid" id="q-suporte"></div>
                                                                                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                                                                                                      </div>
                                                                                                                                                                                                                                                                                                                          </div>
                                                                                                                                                                                                                                                                                                                            `;
    app.appendChild(main);

  document.getElementById('btn-sair').onclick = async () => {
        stopInactivityWatch();
        await client.auth.signOut();
        state.screen = 'login';
        render();
  };

  // 'viewer: true' = abre PDF embutido no portal
  // 'viewer: false' = abre em nova aba (padrão para pastas/playlists)
  const linksGerais = [
    { t: 'Livros 2026',          i: '📖', viewer: 'books' },
    { t: 'Áudios dos Livros',    i: '🎧', url: 'https://www.youtube.com/playlist?list=PL34IdbZXxdZrPlbPevlLZwszORWe9_G2o' },
    { t: 'Extra Activities',     i: '🎯', url: 'https://drive.google.com/drive/folders/1uz3ATitZpIJM7S_-ve_w6XmqOosmqPvX?usp=sharing' },
    { t: 'Material para Aulas',  i: '📂', url: 'https://drive.google.com/drive/folders/1B3HnQl6Zz8aTj2oi_BwAY7n2jEPV5AHU?usp=drive_link' },
    { t: 'Conversations 2026',   i: '💬', url: 'https://drive.google.com/drive/folders/1ghnIw2A-CCRo_QgXcO1cE39V-8lfop_w?usp=sharing' },
    { t: 'Guias Starter',        i: '📋', url: 'https://docs.google.com/document/d/1s59KaF69-tCAQdg_abUbMjdNVDnhVJ0SDfO5L56n7h0/edit?usp=drive_link' },
    { t: 'Transcripts Listenings', i: '📝', url: 'https://docs.google.com/document/d/15KSATfziQzmvirEy8sKnWgB4TZr3xwRDmXWMLLFTYJE/edit?usp=sharing' }
      ];

  const linksB2 = [
    { t: 'B2 Scripts',   i: '📜', url: 'https://drive.google.com/drive/folders/1yoRbzOyUKuuP-_KQZRZmBigmTh5v6YkX?usp=drive_link' },
    { t: 'Listening B2', i: '🎵', url: 'https://drive.google.com/drive/folders/1JTeOIlIY5wgdGLkuERuj-l2EqNwQNfpA?usp=drive_link' }
      ];

  const linksSuporte = [
    { t: 'Erros e Sugestões', i: '⚠️', url: 'https://docs.google.com/document/d/1C6qYZzcHAA15j0oZzbAb07QF-Gbad6s2ScB8fwAAaFk/edit?tab=t.v471pfad98x' }
      ];

  function buildCards(links, containerId) {
        const area = document.getElementById(containerId);
        links.forEach(link => {
                const card = document.createElement('div');
                card.className = 'card-base';
                card.innerHTML = `<div class="icon-box">${link.i}</div><strong style="color:#1a2b21 !important">${link.t}</strong>`;
                card.onclick = () => {
                          if (link.viewer === 'books') {
                                      openBooksModal();
                          } else if (link.viewer === true) {
                                      openPdfViewer(link.t, link.url);
                          } else {
                                      window.open(link.url, '_blank');
                          }
                };
                area.appendChild(card);
        });
  }

  buildCards(linksGerais, 'q-gerais');
    buildCards(linksB2, 'q-b2');
    buildCards(linksSuporte, 'q-suporte');
}

checkUser();
