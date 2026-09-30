let currentId = 0; // 0 = bienvenida, 1..17 = módulos, 'cert' = certificado
const CATS = ["Fundamentos","Intermedio","Avanzado"];

function catIcon(c){ return c==="Fundamentos"?"🌱":c==="Intermedio"?"⚙️":"🚀"; }

function renderNav(){
  const p = getProgress();
  const q = (document.getElementById('searchBox')?.value || '').toLowerCase();
  const ul = document.getElementById('navList');
  let html = `<li><button class="${currentId===0?'active':''}" onclick="goTo(0)">🏠 Bienvenida</button></li>`;
  CATS.forEach(cat=>{
    const mods = MODULES.filter(m => m.cat===cat && m.title.toLowerCase().includes(q));
    if(!mods.length) return;
    html += `<div class="catlabel">${catIcon(cat)} ${cat}</div><ul>` + mods.map(m => `
      <li><button class="${m.id===currentId?'active':''}" onclick="goTo(${m.id})">
        <span class="chk ${p[m.id]?'done':''}"></span>${m.id}. ${m.title}
      </button></li>`).join('') + `</ul>`;
  });
  html += `<div class="catlabel">🎓 Meta</div><ul>
    <li><button class="${currentId==='cert'?'active':''}" onclick="goTo('cert')">
      <span class="chk ${countDone()===MODULES.length?'done':''}"></span>Certificado
    </button></li></ul>`;
  ul.innerHTML = html;
}

function renderWelcome(){
  document.getElementById('main').innerHTML = `
  <div class="hero">
    <h2>🐍 Aprende Python desde cero</h2>
    <p>Un curso interactivo de 17 módulos pensado para quien nunca ha programado. Cada lección combina teoría breve, ejemplos ejecutables de verdad (Python corre en tu navegador con Pyodide) y ejercicios con solución explicada.</p>
    <p><b>Cómo usar esta web:</b> navega por el menú lateral, agrupado en Fundamentos → Intermedio → Avanzado. Escribe y ejecuta código en cada bloque, marca los módulos como completados y tu progreso se guarda automáticamente en este navegador. Puedes exportarlo como archivo si cambias de ordenador.</p>
    <p><b>Requisitos:</b> ninguno. Solo un navegador moderno y conexión a internet la primera vez (para cargar Python, ~10&nbsp;MB).</p>
    <button class="startbtn" onclick="goTo(${countDone()>0 ? (localStorage.getItem(LAST_KEY)||1) : 1})">Comenzar →</button>
  </div>`;
}

function renderCert(){
  const done = countDone();
  const total = MODULES.length;
  const main = document.getElementById('main');
  if(done < total){
    main.innerHTML = `<div class="cert"><h2>🎓 Certificado</h2>
      <p>Has completado ${done} de ${total} módulos. Termina el curso para desbloquear tu certificado.</p>
      <button class="startbtn" onclick="goTo(${done+1<=total?done+1:1})">Seguir aprendiendo →</button></div>`;
    return;
  }
  const name = localStorage.getItem(NAME_KEY) || '';
  main.innerHTML = `<div class="cert">
    <h2>🎓 ¡Curso completado!</h2>
    <p>Has terminado los 17 módulos de "Aprende Python desde cero". Escribe tu nombre para tu certificado:</p>
    <input id="certName" placeholder="Tu nombre" value="${name}">
    <br>
    <button class="startbtn" onclick="saveNameAndPrint()">🖨️ Generar e imprimir</button>
  </div>`;
}
function saveNameAndPrint(){
  const n = document.getElementById('certName').value.trim() || 'Estudiante';
  localStorage.setItem(NAME_KEY, n);
  window.print();
}

function renderMain(){
  if(currentId === 0){ renderWelcome(); return; }
  if(currentId === 'cert'){ renderCert(); return; }
  const m = MODULES.find(x => x.id === currentId);
  const p = getProgress();
  const done = !!p[m.id];
  document.getElementById('main').innerHTML = `
    <button class="donebtn ${done?'done':''}" onclick="toggleDone(${m.id})">${done? '✓ Completado' : 'Marcar como completado'}</button>
    <h2 class="modtitle">${m.id}. ${m.title}</h2>
    <div class="modmeta"><span class="badge">${catIcon(m.cat)} ${m.cat}</span><span>Módulo ${m.id} de ${MODULES.length}</span></div>
    <section class="block">${m.body()}</section>
    <div class="navfoot">
      <button onclick="goTo(${m.id-1})" ${m.id<=1?'disabled':''}>← Anterior</button>
      <button onclick="goTo(${m.id+1<=MODULES.length? m.id+1 : "'cert'"})">${m.id>=MODULES.length? 'Ver certificado 🎓' : 'Siguiente →'}</button>
    </div>`;
  window.scrollTo(0,0);
}

function goTo(id){
  currentId = id;
  if(typeof id === 'number' && id>0) localStorage.setItem(LAST_KEY, id);
  renderNav(); renderMain();
}
function toggleDone(id){ const p = getProgress(); setDone(id, !p[id]); }

/* Tema claro/oscuro */
function initTheme(){
  const saved = localStorage.getItem('py101_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  document.getElementById('themeBtn').textContent = saved==='dark' ? '🌙' : '☀️';
}
function toggleTheme(){
  const cur = document.documentElement.getAttribute('data-theme');
  const next = cur==='dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('py101_theme', next);
  document.getElementById('themeBtn').textContent = next==='dark' ? '🌙' : '☀️';
}

/* Atajos de teclado (solo si no se está escribiendo) */
document.addEventListener('keydown', e=>{
  const tag = document.activeElement.tagName;
  if(tag==='TEXTAREA' || tag==='INPUT') return;
  if(e.key==='ArrowRight' && typeof currentId==='number' && currentId < MODULES.length) goTo(currentId+1);
  if(e.key==='ArrowLeft' && typeof currentId==='number' && currentId > 0) goTo(currentId-1);
});

/* Init */
(function(){
  initTheme();
  initPyodide();
  const last = parseInt(localStorage.getItem(LAST_KEY));
  currentId = (last && last>=1 && last<=MODULES.length) ? last : 0;
  document.getElementById('searchBox').addEventListener('input', renderNav);
  document.getElementById('exportBtn').addEventListener('click', exportProgress);
  document.getElementById('importInput').addEventListener('change', e=> e.target.files[0] && importProgress(e.target.files[0]));
  renderNav(); renderMain(); updateProgressBar();
})();
