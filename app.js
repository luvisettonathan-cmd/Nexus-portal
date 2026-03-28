// ══════════════════════════════════════════════════════════════
// NEXUS ENGLISH CENTER - PORTAL DO PROFESSOR
// ══════════════════════════════════════════════════════════════

const SUPABASE_URL = 'https://macpqlkefvjfrvotkkqh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hY3BxbGtlZnZqZnJ2b3Rra3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NzY1NjEsImV4cCI6MjA5MDE1MjU2MX0.dz0dsXVHOPkobv8ZMOg5UfHHVOQcB5gipT_rJkoQMaE';

const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const NEXUS_LOGO_DATA = 'https://i.ibb.co/kVqLf4k3/nexus-logo.png';

let state = {
        screen: 'login',
        user: null
};

async function checkUser() {
        const { data: { session } } = await client.auth.getSession();
        if (session) {
                  state.user = session.user;
                  state.screen = 'portal';
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
                                                          <input type="text" id="email" class="form-input" placeholder="E-mail">
                                                                <input type="password" id="pass" class="form-input" placeholder="Senha">
                                                                      <button id="btn-entrar" class="btn-full">Entrar</button>
                                                                          </div>
                                                                            `;
        app.appendChild(wrap);
        document.getElementById('btn-entrar').onclick = async () => {
                  const email = document.getElementById('email').value.trim();
                  const password = document.getElementById('pass').value;
                  const { data, error } = await client.auth.signInWithPassword({ email, password });
                  if (error) {
                              document.getElementById('login-err').style.display = 'block';
                  } else {
                              state.user = data.user;
                              state.screen = 'portal';
                              render();
                  }
        };
}

function renderPortal(app) {
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
                                                                                  <div style="background:rgba(255,255,255,0.2); padding:8px 20px; border-radius:30px; font-size:13px; color:white">👋 Olá, Teacher!</div>
                                                                                          <button id="btn-sair" style="background:none; border:1px solid rgba(255,255,255,0.4); color:white; border-radius:15px; padding:5px 10px; cursor:pointer; font-size:11px;">Sair</button>
                                                                                                </div>
                                                                                                    </header>
                                                                                                        <div class="nav-bar">
                                                                                                              <div class="nav-item active">Materiais</div>
                                                                                                                    <div class="nav-item" style="opacity:0.5; cursor:default;">Treinamento</div>
                                                                                                                        </div>
                                                                                                                            <div class="container">
                                                                                                                                  <h1 style="color:#1a2b21; font-family:serif; margin-bottom:5px;">Materiais Extras</h1>
                                                                                                                                        <p class="subtitle">Acesse os recursos oficiais da Nexus English Center.</p>
                                                                                                                                        
                                                                                                                                              <div class="section-title">📚 MATERIAIS GERAIS</div>
                                                                                                                                                    <div class="quick-grid" id="q-gerais"></div>
                                                                                                                                                    
                                                                                                                                                          <div class="section-title" style="margin-top:30px;">🎯 NÍVEL B2</div>
                                                                                                                                                                <div class="quick-grid" id="q-b2"></div>
                                                                                                                                                                
                                                                                                                                                                      <div class="section-title" style="margin-top:30px;">⚙️ SUPORTE</div>
                                                                                                                                                                            <div class="quick-grid" id="q-suporte"></div>
                                                                                                                                                                                </div>
                                                                                                                                                                                  `;
        app.appendChild(main);

  document.getElementById('btn-sair').onclick = async () => {
            await client.auth.signOut();
            state.screen = 'login';
            render();
  };

  const linksGerais = [
        {t: 'Livros 2026',        i: '📖', url: 'https://drive.google.com/drive/folders/14Rz1xYSEXvZAVUPzsLA8xP5Ryq-7Gf5v?usp=drive_link'},
        {t: 'Áudios dos Livros',  i: '🎧', url: 'https://www.youtube.com/playlist?list=PL34IdbZXxdZrPlbPevlLZwszORWe9_G2o'},
        {t: 'Extra Activities',   i: '🎯', url: 'https://drive.google.com/drive/folders/1uz3ATitZpIJM7S_-ve_w6XmqOosmqPvX?usp=sharing'},
        {t: 'Material para Aulas',i: '📂', url: 'https://drive.google.com/drive/folders/1B3HnQl6Zz8aTj2oi_BwAY7n2jEPV5AHU?usp=drive_link'},
        {t: 'Conversations 2026', i: '💬', url: 'https://drive.google.com/drive/folders/1ghnIw2A-CCRo_QgXcO1cE39V-8lfop_w?usp=sharing'},
        {t: 'Guias Starter',      i: '📋', url: 'https://docs.google.com/document/d/1s59KaF69-tCAQdg_abUbMjdNVDnhVJ0SDfO5L56n7h0/edit?usp=drive_link'}
          ];

  const linksB2 = [
        {t: 'B2 Scripts',            i: '📜', url: 'https://drive.google.com/drive/folders/1yoRbzOyUKuuP-_KQZRZmBigmTh5v6YkX?usp=drive_link'},
        {t: 'Listening B2',          i: '🎵', url: 'https://drive.google.com/drive/folders/1JTeOIlIY5wgdGLkuERuj-l2EqNwQNfpA?usp=drive_link'},
        {t: 'Transcripts Listenings',i: '📝', url: 'https://docs.google.com/document/d/15KSATfziQzmvirEy8sKnWgB4TZr3xwRDmXWMLLFTYJE/edit?usp=sharing'}
          ];

  const linksSuporte = [
        {t: 'Erros e Sugestões', i: '⚠️', url: 'https://docs.google.com/document/d/1C6qYZzcHAA15j0oZzbAb07QF-Gbad6s2ScB8fwAAaFk/edit?tab=t.v471pfad98x'}
          ];

  function buildCards(links, containerId) {
            const area = document.getElementById(containerId);
            links.forEach(link => {
                        const card = document.createElement('div');
                        card.className = 'card-base';
                        card.innerHTML = `<div class="icon-box">${link.i}</div><strong style="color:#1a2b21 !important">${link.t}</strong>`;
                        card.onclick = () => window.open(link.url, '_blank');
                        area.appendChild(card);
            });
  }

  buildCards(linksGerais,  'q-gerais');
        buildCards(linksB2,      'q-b2');
        buildCards(linksSuporte, 'q-suporte');
}

checkUser();
