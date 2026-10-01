let currentId = 0; // 0 = bienvenida, 1..17 = módulos, 'cert' = certificado
const CATS = ["Fundamentos","Intermedio","Avanzado","Ciencia de datos","Bioinformática"];

function catIcon(c){ return {"Fundamentos":"🌱","Intermedio":"⚙️","Avanzado":"🚀","Ciencia de datos":"📊","Bioinformática":"🧬"}[c] || "📘"; }

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
  const total = MODULES.length, hechos = countDone();
  const porCat = CATS.map(c => `<li>${catIcon(c)} <b>${c}</b>: ${MODULES.filter(m=>m.cat===c).map(m=>m.id).join(', ')}</li>`).join('');
  const ultimo = parseInt(localStorage.getItem(LAST_KEY)) || 1;
  document.getElementById('main').innerHTML = `
  <div class="hero">
    <h2>🐍 Aprende Python desde cero</h2>
    <p>Un curso interactivo de <b>${total} módulos</b> que te lleva desde tu primer <code>print()</code> hasta analizar secuencias, estructuras de proteínas y fármacos. Python se ejecuta de verdad en tu navegador (Pyodide), con NumPy, pandas, SciPy, Matplotlib, Seaborn, Biopython y scikit-learn disponibles sin instalar nada. RDKit (módulos 36-38) no existe para el navegador: esos módulos traen cuadernos de Google Colab en la carpeta <code>notebooks/</code>.</p>
    <ul class="tracks">${porCat}</ul>
    <p><b>En cada módulo encontrarás:</b> explicación breve, celdas de código editables, conceptos clave, errores habituales, ejercicios con <b>autocorrección</b> (botón ✔ Comprobar) y solución explicada, preguntas tipo test y un resumen final.</p>
    <p><b>Datos reales:</b> el disco virtual incluye archivos del curso: <code>P04637.fasta</code> (p53), <code>citocromo_c.fasta</code>, <code>ejemplo.fastq</code>, <code>1TUP_cadenaB.pdb</code>, <code>aspirin.mol</code>, <code>Planetas.txt</code>, <code>housing.csv</code>, <code>heteromoleculas.csv</code>, <code>archivo.txt</code>, <code>ciudades.tsv</code> y los datasets clásicos <code>iris.csv</code>, <code>tips.csv</code> y <code>titanic.csv</code>.</p>
    <p><b>Consejos:</b> ejecuta las celdas en orden (comparten memoria, como en Colab) · <span class="kbd">Ctrl+Enter</span> ejecuta · <span class="kbd">Tab</span> indenta · las flechas ← → del teclado cambian de módulo · tu progreso se guarda solo en este navegador (expórtalo si cambias de equipo).</p>
    <button class="startbtn" onclick="goTo(${hechos>0 ? ultimo : 1})">${hechos>0 ? `Continuar (módulo ${ultimo}) →` : 'Comenzar →'}</button>
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
    <p>Has terminado los ${total} módulos de "Aprende Python desde cero". Escribe tu nombre para tu certificado:</p>
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
