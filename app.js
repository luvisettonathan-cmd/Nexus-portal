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
          <div class="sidebar-item disabled" data-section="treinamento">
            <span class="sidebar-icon">🎯</span>
            <span>Treinamento</span>
          </div>
          <div class="sidebar-footer"></div>
        </nav>
        <div class="portal-main">
          <div class="header-main">
            <div class="header-title">
              <div class="header-title-icon">📋</div>
              <h1>Portal</h1>
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
            <button class="portal-tab" data-tab="calendario">📅 Calendário</button>
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
      { t: 'Extra Activities',  i: '📝', url: 'https://drive.google.com/drive/folders/1uz3ATitZpIJM7S_-ve_w6Xmf' },
      { t: 'Certificates',      i: '🏆', url: 'https://drive.google.com/drive/folders/1G9JnTl3CaFaE_Y0jqHYVQfT' },
  ];
  const linksB2 = [
      { t: 'Áudios B2', i: '🎧', url: 'https://youtube.com/playlist?list=PL34IdbZXxdZqsOg8M3JHxb1DF2t9ItLK_' },
  ];
  const linksSuporte = [
      { t: 'Suporte WhatsApp', i: '💬', url: 'https://wa.me/554788061119' },
  ];

  function buildCards(links, container) {
    links.forEach(link => {
      const card = document.createElement('div');
      card.className = 'card-base';
      card.innerHTML = '<div class="icon-box">' + link.i + '</div><strong style="color:#1a2b21">' + link.t + '</strong>';
      card.onclick = () => { window.open(link.url, '_blank'); };
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
        '<div class="quick-grid" id="q-gerais"></div>' +
        '<p class="section-title">B2</p><div class="quick-grid" id="q-b2"></div>' +
        '<p class="section-title">Suporte</p><div class="quick-grid" id="q-suporte"></div>';
      buildCards(linksGerais, document.getElementById('q-gerais'));
      buildCards(linksB2, document.getElementById('q-b2'));
      buildCards(linksSuporte, document.getElementById('q-suporte'));

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
      }
      document.querySelectorAll('.level-tab').forEach(btn => {
        btn.addEventListener('click', () => showTab('livro-' + btn.dataset.livro));
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

  document.getElementById('btn-sair').onclick = async () => {
    await client.auth.signOut();
    state.screen = 'login';
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
