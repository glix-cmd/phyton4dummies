/* Interfaz: explorador de módulos, pestaña, portada, módulo, certificado, paleta de comandos y atajos */
let currentId = 0;   // 0 = portada · 1..N = módulos · 'cert' = certificado
const CATS = ["Fundamentos", "Intermedio", "Avanzado", "Ciencia de datos", "Bioinformática", "Aprendizaje automático"];
const CAT_INFO = {
  "Fundamentos":      {color: "var(--a)", dir: "fundamentos",      desc: "Sintaxis, variables, decisiones, bucles y funciones: lo que usa cualquier programa."},
  "Intermedio":       {color: "var(--c)", dir: "intermedio",       desc: "Colecciones, cadenas, expresiones regulares, librerías estándar, errores y archivos."},
  "Avanzado":         {color: "var(--v)", dir: "avanzado",         desc: "Clases, generadores, depuración, eficiencia y los primeros proyectos."},
  "Ciencia de datos": {color: "var(--g)", dir: "ciencia_de_datos", desc: "NumPy, SciPy, pandas, gráficos con Matplotlib y Seaborn, e imágenes con PIL."},
  "Bioinformática":   {color: "var(--t)", dir: "bioinformatica",   desc: "Biopython, estructuras 3D, bases de datos por API, RDKit y proyectos completos."},
  "Aprendizaje automático": {color: "var(--m)", dir: "machine_learning", desc: "Regresión, clasificación, texto, redes neuronales y clustering con scikit-learn."},
};
const EX_KEY = 'py101_ex_v1', FOLD_KEY = 'py101_folders_v1';
const $ = id => document.getElementById(id);
const norm = t => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function slug(t){ return norm(t.split(':')[0]).replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').split('_').slice(0, 5).join('_'); }
function fileName(m){ return String(m.id).padStart(2, '0') + '_' + slug(m.title) + '.py'; }
function modulo(id){ return MODULES.find(m => m.id === id); }

/* ---------- Progreso ---------- */
function countDone(){ const p = getProgress(); return MODULES.filter(m => p[m.id]).length; }
function updateProgressBar(){
  const done = countDone(), total = MODULES.length;
  $('progressText').textContent = `${done}/${total}`;
  $('progressFill').style.width = (done / total * 100) + '%';
  $('progressBar').setAttribute('aria-valuenow', done); $('progressBar').setAttribute('aria-valuemax', total);
  $('sbProgress').textContent = `${done} de ${total} módulos completados`;
}
function getEx(){ try{ return JSON.parse(localStorage.getItem(EX_KEY)) || {}; }catch(e){ return {}; } }
function marcarEjercicio(sec){
  if(!sec) return;
  const d = getEx(); d[currentId + '::' + sec.dataset.ex] = true;
  try{ localStorage.setItem(EX_KEY, JSON.stringify(d)); }catch(e){}
  pintarPill(sec);
}
function pintarPill(sec){
  const p = sec.querySelector('.ex-pill');
  if(p && !p.classList.contains('local')){ p.classList.add('ok'); p.textContent = 'Superado'; }
}

/* ---------- Explorador ---------- */
function getClosed(){ try{ return JSON.parse(localStorage.getItem(FOLD_KEY)) || []; }catch(e){ return []; } }
function toggleFolder(cat){
  const c = getClosed(), i = c.indexOf(cat);
  if(i >= 0) c.splice(i, 1); else c.push(cat);
  try{ localStorage.setItem(FOLD_KEY, JSON.stringify(c)); }catch(e){}
  renderNav();
}
function renderNav(){
  const p = getProgress(), q = norm($('searchBox').value || '').trim(), cerradas = getClosed();
  let html = q ? '' : `<ul class="files"><li><button class="file ${currentId === 0 ? 'active' : ''}" onclick="goTo(0)"><span class="num">~</span><span class="ftitle">Portada</span></button></li></ul>`;
  for(const cat of CATS){
    const todos = MODULES.filter(m => m.cat === cat);
    const mods = q ? todos.filter(m => norm(`${m.id} ${m.title} ${fileName(m)}`).includes(q)) : todos;
    if(!mods.length) continue;
    const hechos = todos.filter(m => p[m.id]).length, cerrada = !q && cerradas.includes(cat);
    html += `<div class="folder ${cerrada ? 'closed' : ''}" style="--cat:${CAT_INFO[cat].color}">
      <button class="folder-head" onclick="toggleFolder('${cat}')" aria-expanded="${!cerrada}">
        <svg class="chev" viewBox="0 0 12 12" aria-hidden="true"><path d="m3 4.5 3 3 3-3"/></svg><span class="swatch"></span>${cat}<span class="fcount">${hechos}/${todos.length}</span>
      </button>
      <ul class="files">${mods.map(m => `<li><button class="file ${m.id === currentId ? 'active' : ''}" onclick="goTo(${m.id})" ${m.id === currentId ? 'aria-current="page"' : ''} title="${fileName(m)}">
        <span class="num">${String(m.id).padStart(2, '0')}</span><span class="ftitle">${m.title}</span><span class="state ${p[m.id] ? 'done' : ''}" aria-label="${p[m.id] ? 'completado' : 'pendiente'}"></span></button></li>`).join('')}</ul>
    </div>`;
  }
  if(!q || 'certificado'.includes(q)){
    html += `<ul class="files" style="margin-top:8px"><li><button class="file ${currentId === 'cert' ? 'active' : ''}" onclick="goTo('cert')"><span class="num">✓</span><span class="ftitle">Certificado</span><span class="state ${countDone() === MODULES.length ? 'done' : ''}"></span></button></li></ul>`;
  }
  $('navList').innerHTML = html;
}

/* ---------- Ruta y pestaña ---------- */
function renderChrome(){
  let dir, file;
  if(currentId === 0){ dir = null; file = 'README.md'; }
  else if(currentId === 'cert'){ dir = null; file = 'certificado.txt'; }
  else{ const m = modulo(currentId); dir = CAT_INFO[m.cat].dir; file = fileName(m); }
  $('crumbs').innerHTML = `<span class="sep">/</span>${dir ? `<span>${dir}</span><span class="sep">/</span>` : ''}<span class="here">${file}</span>`;
  const icono = file.endsWith('.py')
    ? '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.8c-3 0-3 1.3-3 2.3v1.6h3.1v.6H3.8C2.5 6.3 1.5 7.4 1.5 9.6s1 3 2.3 3h1v-1.7c0-1.3 1-2.3 2.3-2.3h3.1c1 0 1.8-.8 1.8-1.8V4.1c0-1-.9-2.3-4-2.3z"/><path d="M8 14.2c3 0 3-1.3 3-2.3v-1.6H7.9v-.6h4.3c1.3 0 2.3-1.1 2.3-3.3s-1-3-2.3-3h-1v1.7c0 1.3-1 2.3-2.3 2.3H5.8c-1 0-1.8.8-1.8 1.8v2.7c0 1 .9 2.3 4 2.3z"/></svg>'
    : '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 1.5h5.5L13 5v9.5H4z"/><path d="M9.5 1.5V5H13"/></svg>';
  $('tabs').innerHTML = `<div class="tab" role="tab" aria-selected="true">${icono}${file}</div>`;
  document.title = (currentId === 0 ? 'Aprende Python' : (currentId === 'cert' ? 'Certificado' : modulo(currentId).title)) + ' · aprende-python';
}

/* ---------- Portada ---------- */
const TP53_CDS = 'ATGGAGGAGCCGCAGTCAGATCCTAGCGTCGAGCCCCCTCTGAGTCAGGAAACA';   // traduce a MEEPQSDPSVEPPLSQET (P04637)
const TP53_AA  = 'MEEPQSDPSVEPPLSQET';
function cromatograma(seq, prot){
  const W = 16, n = seq.length, padL = 8, base = 122, width = n * W + padL * 2;
  const color = {A: 'var(--a)', C: 'var(--c)', G: 'var(--g)', T: 'var(--t)'};
  let semilla = 11;
  const rnd = () => { semilla = (semilla * 16807) % 2147483647; return (semilla - 1) / 2147483646; };
  const picos = {A: [], C: [], G: [], T: []};
  for(let i = 0; i < n; i++){
    const x = padL + i * W + W / 2, b = seq[i];
    picos[b].push([x, 0.6 + 0.4 * rnd(), 4.6 + rnd() * 1.1]);
    for(const o of 'ACGT') if(o !== b && rnd() < 0.2) picos[o].push([x + (rnd() - 0.5) * 5, 0.04 + 0.1 * rnd(), 5.5]);
  }
  const trazas = Object.entries(picos).map(([b, ps]) => {
    let d = '';
    for(let x = 0; x <= width; x += 2){
      let y = 0;
      for(const [px, a, sg] of ps){ const dx = x - px; if(Math.abs(dx) < sg * 4) y += a * Math.exp(-dx * dx / (2 * sg * sg)); }
      d += (x ? ' L' : 'M') + x + ' ' + (base - y * 94).toFixed(1);
    }
    return `<path class="trace" pathLength="1" d="${d}" style="stroke:${color[b]}"/>`;
  }).join('');
  const llamadas = [...seq].map((b, i) => `<text class="call" x="${padL + i * W + W / 2}" y="13" style="fill:${color[b]};animation-delay:${(0.2 + 2.1 * i / n).toFixed(2)}s">${b}</text>`).join('');
  let codones = '';
  for(let c = 0; c < n / 3; c++){
    const x0 = padL + c * 3 * W + 3, x1 = padL + (c + 1) * 3 * W - 3;
    codones += `<path class="codon" d="M${x0} ${base + 8} v5 H${x1} v-5"/><text class="aa" x="${(x0 + x1) / 2}" y="${base + 30}">${prot[c]}</text>`;
  }
  return `<svg viewBox="0 0 ${width} ${base + 38}" role="img" aria-label="Cromatograma ilustrativo de los primeros codones de TP53 y su traducción a proteína">
    <line class="base" x1="0" x2="${width}" y1="${base}" y2="${base}"/>${trazas}${llamadas}${codones}</svg>`;
}
function renderWelcome(){
  const total = MODULES.length, hechos = countDone(), p = getProgress();
  const ultimo = parseInt(localStorage.getItem(LAST_KEY)) || 1;
  const filas = CATS.map(cat => {
    const mods = MODULES.filter(m => m.cat === cat), h = mods.filter(m => p[m.id]).length;
    const destino = (mods.find(m => !p[m.id]) || mods[0]).id;
    return `<button class="block-row" style="--cat:${CAT_INFO[cat].color}" onclick="goTo(${destino})">
      <span class="sw"></span><span class="bt">${cat}</span>
      <span class="bp"><span>${mods[0].id}–${mods[mods.length - 1].id}</span><span class="mini-bar"><i style="width:${h / mods.length * 100}%"></i></span><span>${h}/${mods.length}</span></span>
      <span class="bd">${CAT_INFO[cat].desc}</span></button>`;
  }).join('');
  const archivos = Object.keys(DATASETS).map(f => `<code>${f}</code>`).join('');
  $('main').innerHTML = `
  <section class="hero">
    <div class="chromo">
      <div class="chromo-head"><span>TP53, primeros 18 codones</span>
        <span class="chromo-legend"><span><i style="background:var(--a)"></i>A</span><span><i style="background:var(--c)"></i>C</span><span><i style="background:var(--g)"></i>G</span><span><i style="background:var(--t)"></i>T</span></span></div>
      <div class="chromo-scroll">${cromatograma(TP53_CDS, TP53_AA)}</div>
    </div>
    <p class="chromo-cap">Cromatograma ilustrativo sobre la secuencia real del inicio de TP53 y su traducción, el comienzo de la proteína p53 (UniProt P04637). En el bloque de bioinformática harás esto mismo con Biopython.</p>
    <h1>Python, de la primera línea al primer genoma</h1>
    <p class="lede">${total} módulos con código que se ejecuta en tu navegador: fundamentos del lenguaje, ciencia de datos, bioinformática con secuencias, estructuras y bases de datos reales, y aprendizaje automático. No hace falta instalar nada.</p>
    <div class="hero-actions">
      <button class="btn-primary" onclick="goTo(${hechos > 0 ? ultimo : 1})">${hechos > 0 ? `Continuar en el módulo ${ultimo}` : 'Empezar por el módulo 1'}</button>
      <button class="btn-secondary" onclick="openPalette()">Buscar un módulo <kbd>Ctrl K</kbd></button>
    </div>
  </section>
  <h2 class="section-h">Bloques del curso <small>${hechos} de ${total} módulos completados</small></h2>
  <div class="blocks">${filas}</div>
  <h2 class="section-h">Cómo se trabaja aquí</h2>
  <div class="howto">
    <div><b>Ejecuta y experimenta</b>Cada bloque de código es editable. <kbd>Ctrl Enter</kbd> lo ejecuta. Las celdas comparten memoria, como en Jupyter: ejecútalas en orden.</div>
    <div><b>Ejercicios que se corrigen solos</b>Escribe tu solución y pulsa Comprobar. Si falla, te dice qué no cuadra; la solución explicada está debajo.</div>
    <div><b>Tu progreso se queda aquí</b>Se guarda en este navegador. Para cambiar de equipo, usa Exportar e Importar al pie del explorador.</div>
    <div><b>Internet y Colab</b>Python se descarga la primera vez. Las celdas de APIs consultan bases de datos reales; RDKit se trabaja en los cuadernos de Colab de <code>notebooks/</code>.</div>
  </div>
  <h2 class="section-h">Archivos de datos incluidos <small>disponibles en el disco virtual de Python</small></h2>
  <div class="files-list">${archivos}</div>`;
}

/* ---------- Módulo ---------- */
function renderModule(){
  const m = modulo(currentId), p = getProgress(), done = !!p[m.id];
  const cuerpo = m.body();
  const nCeldas = (cuerpo.match(/class="cell"/g) || []).length, nEj = (cuerpo.match(/class="exercise"/g) || []).length;
  const prev = modulo(m.id - 1), next = modulo(m.id + 1);
  $('main').innerHTML = `
    <header class="mod-head">
      <div class="mod-meta">
        <span class="blk" style="--cat:${CAT_INFO[m.cat].color}">${m.cat}</span>
        <span class="m">Módulo ${m.id} de ${MODULES.length}</span>
        <span class="m"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m5.5 4.5-3.5 3.5 3.5 3.5M10.5 4.5l3.5 3.5-3.5 3.5"/></svg>${nCeldas} ${nCeldas === 1 ? 'celda' : 'celdas'}</span>
        ${nEj ? `<span class="m"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3 8.5 3 3 7-7"/></svg>${nEj} ${nEj === 1 ? 'ejercicio' : 'ejercicios'}</span>` : ''}
      </div>
      <h1 class="mod-title">${m.title}</h1>
      <button class="done-toggle ${done ? 'done' : ''}" onclick="toggleDone(${m.id})" aria-pressed="${done}">
        <span class="box"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3 8.5 3 3 7-7"/></svg></span>${done ? 'Módulo completado' : 'Marcar como completado'}</button>
    </header>
    ${cuerpo}
    <nav class="navfoot" aria-label="Módulos anterior y siguiente">
      <button class="nav-card" ${prev ? `onclick="goTo(${prev.id})"` : 'disabled'}><span class="lbl"><kbd>Alt ←</kbd>Anterior</span><span class="fname">${prev ? fileName(prev) : ''}</span></button>
      <button class="nav-card next" onclick="goTo(${next ? next.id : "'cert'"})"><span class="lbl">${next ? 'Siguiente' : 'Has llegado al final'}<kbd>Alt →</kbd></span><span class="fname">${next ? fileName(next) : 'certificado.txt'}</span></button>
    </nav>`;
  initEditors($('main'));
  const d = getEx();
  document.querySelectorAll('#main .exercise').forEach(sec => { if(d[currentId + '::' + sec.dataset.ex]) pintarPill(sec); });
}

/* ---------- Certificado ---------- */
function renderCert(){
  const done = countDone(), total = MODULES.length;
  if(done < total){
    const siguiente = (MODULES.find(m => !getProgress()[m.id]) || MODULES[0]).id;
    $('main').innerHTML = `<div class="cert"><h2>Certificado</h2>
      <p>Llevas ${done} de ${total} módulos. El certificado se desbloquea al marcar todos como completados.</p>
      <button class="btn-primary" onclick="goTo(${siguiente})">Ir al módulo ${siguiente}</button></div>`;
    return;
  }
  const name = localStorage.getItem(NAME_KEY) || '';
  $('main').innerHTML = `<div class="cert">
    <h2>Curso completado</h2>
    <p>Has terminado los ${total} módulos de «Aprende Python». Escribe el nombre que quieres que aparezca y genera tu certificado.</p>
    <input id="certName" placeholder="Tu nombre" value="${name.replace(/"/g, '&quot;')}" aria-label="Nombre para el certificado"><br>
    <button class="btn-primary" onclick="saveNameAndPrint()">Imprimir el certificado</button></div>`;
}
function saveNameAndPrint(){
  const n = $('certName').value.trim() || 'Estudiante';
  try{ localStorage.setItem(NAME_KEY, n); }catch(e){}
  window.print();
}

/* ---------- Navegación ---------- */
function renderMain(){
  if(currentId === 0) renderWelcome();
  else if(currentId === 'cert') renderCert();
  else renderModule();
  renderChrome();
  const main = $('main'); main.classList.remove('enter'); void main.offsetWidth; main.classList.add('enter');
}
function goTo(id){
  if(typeof id === 'number' && id !== 0 && !modulo(id)) return;
  currentId = id;
  if(typeof id === 'number' && id > 0){ try{ localStorage.setItem(LAST_KEY, id); }catch(e){} }
  renderNav(); renderMain();
  $('pane').scrollTop = 0; updateReadProgress();
  closeDrawer();
}
function toggleDone(id){
  const nuevo = !getProgress()[id];
  setDone(id, nuevo);
  const b = document.querySelector('.done-toggle');
  if(b){ b.classList.toggle('done', nuevo); b.setAttribute('aria-pressed', nuevo); b.lastChild.textContent = nuevo ? 'Módulo completado' : 'Marcar como completado'; }
}
function vecino(delta){
  if(currentId === 'cert'){ if(delta < 0) goTo(MODULES.length); return; }
  const n = currentId + delta;
  if(n === MODULES.length + 1) goTo('cert'); else if(n >= 0 && n <= MODULES.length) goTo(n);
}

/* ---------- Paleta de comandos ---------- */
let palSel = 0, palItems = [];
function openPalette(){
  $('palette').hidden = false; $('palInput').value = ''; filtrarPaleta(); $('palInput').focus();
}
function closePalette(){ $('palette').hidden = true; }
let INDICE = null;
function indice(){
  if(INDICE) return INDICE;
  const tmp = document.createElement('div');
  INDICE = {};
  for(const m of MODULES){ tmp.innerHTML = m.body(); INDICE[m.id] = norm(tmp.textContent); }
  return INDICE;
}
const ALIAS = {ml: 'aprendizaje', 'machine learning': 'machine learning', kmeans: 'k-means', clustering: 'clustering', mlp: 'redes neuronales', regex: 'expresiones regulares', poo: 'orientada a objetos', clases: 'orientada a objetos', df: 'pandas', dataframe: 'pandas',
  grafico: 'matplotlib', graficos: 'matplotlib', plot: 'matplotlib', api: 'apis', fasta: 'fasta', fastq: 'fastq', pdb: 'pdb',
  smiles: 'rdkit', farmacos: 'rdkit', json: 'apis', errores: 'excepciones', try: 'excepciones', listas: 'colecciones', diccionarios: 'colecciones'};
function filtrarPaleta(){
  const bruto = norm($('palInput').value.trim()), q = ALIAS[bruto] || bruto;
  const extra = [{id: 0, title: 'Portada', cat: null}, {id: 'cert', title: 'Certificado', cat: null}];
  if(!q){ palItems = [extra[0], ...MODULES, extra[1]]; palSel = 0; pintarPaleta(); return; }
  const enTitulo = [...extra, ...MODULES].filter(m => norm(`${m.id} ${m.title} ${m.cat || ''} ${m.cat ? fileName(m) : ''}`).includes(q));
  const idx = indice();
  const enTexto = MODULES.filter(m => !enTitulo.includes(m) && idx[m.id].includes(q)).map(m => Object.assign({}, m, {_contenido: true}));
  palItems = [...enTitulo, ...enTexto].slice(0, 40);
  palSel = 0; pintarPaleta();
}
function pintarPaleta(){
  $('palList').innerHTML = palItems.length ? palItems.map((m, i) => `<li role="option" class="${i === palSel ? 'sel' : ''}" aria-selected="${i === palSel}" onmousemove="palSel=${i};pintarPaleta()" onclick="irPaleta(${i})">
      <span class="pn">${typeof m.id === 'number' && m.id > 0 ? String(m.id).padStart(2, '0') : '·'}</span><span class="pt">${m.title}</span>
      ${m._contenido ? '<span class="pc-txt">en el contenido</span>' : ''}${m.cat ? `<span class="pc" style="--cat:${CAT_INFO[m.cat].color}">${m.cat}</span>` : ''}</li>`).join('')
    : '<li class="empty">Ningún módulo coincide. Prueba con otra palabra, por ejemplo «bucles» o «PDB».</li>';
  const sel = $('palList').querySelector('.sel'); if(sel) sel.scrollIntoView({block: 'nearest'});
}
function irPaleta(i){ const m = palItems[i]; if(!m) return; closePalette(); goTo(m.id); }
$('palInput').addEventListener('input', filtrarPaleta);
$('palInput').addEventListener('keydown', e => {
  if(e.key === 'ArrowDown'){ e.preventDefault(); palSel = Math.min(palSel + 1, palItems.length - 1); pintarPaleta(); }
  else if(e.key === 'ArrowUp'){ e.preventDefault(); palSel = Math.max(palSel - 1, 0); pintarPaleta(); }
  else if(e.key === 'Enter'){ e.preventDefault(); irPaleta(palSel); }
  else if(e.key === 'Escape'){ closePalette(); }
});
$('palette').addEventListener('click', e => { if(e.target.id === 'palette') closePalette(); });

/* ---------- Cajón (móvil) ---------- */
function openDrawer(){ document.body.classList.add('drawer-open'); $('drawerBtn').setAttribute('aria-expanded', 'true'); }
function closeDrawer(){ document.body.classList.remove('drawer-open'); $('drawerBtn').setAttribute('aria-expanded', 'false'); }
$('drawerBtn').addEventListener('click', () => document.body.classList.contains('drawer-open') ? closeDrawer() : openDrawer());

/* ---------- Tema ---------- */
function initTheme(){
  let t = 'dark';
  try{ t = localStorage.getItem('py101_theme') || 'dark'; }catch(e){}
  document.documentElement.setAttribute('data-theme', t);
}
function toggleTheme(){
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  try{ localStorage.setItem('py101_theme', next); }catch(e){}
}

/* ---------- Progreso de lectura ---------- */
function updateReadProgress(){
  const p = $('pane'), max = p.scrollHeight - p.clientHeight;
  $('readProgress').style.width = (max > 0 ? p.scrollTop / max * 100 : 0) + '%';
}
$('pane').addEventListener('scroll', updateReadProgress, {passive: true});

/* ---------- Atajos de teclado ---------- */
document.addEventListener('keydown', e => {
  const enCampo = e.target.closest && (e.target.closest('.CodeMirror') || ['INPUT', 'TEXTAREA'].includes(e.target.tagName));
  if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k'){ e.preventDefault(); $('palette').hidden ? openPalette() : closePalette(); return; }
  if(e.key === 'Escape'){ if(!$('palette').hidden) closePalette(); closeDrawer(); return; }
  if(!$('palette').hidden) return;
  if(e.altKey && e.key === 'ArrowLeft'){ e.preventDefault(); vecino(-1); return; }
  if(e.altKey && e.key === 'ArrowRight'){ e.preventDefault(); vecino(1); return; }
  if(enCampo) return;
  if(e.key === '/'){ e.preventDefault(); openPalette(); }
  else if(e.key === 'ArrowLeft') vecino(-1);
  else if(e.key === 'ArrowRight') vecino(1);
});

/* ---------- Inicio ---------- */
(function(){
  initTheme();
  initPyodide();
  const last = parseInt(localStorage.getItem(LAST_KEY));
  currentId = (last && modulo(last)) ? last : 0;
  $('searchBox').addEventListener('input', renderNav);
  $('exportBtn').addEventListener('click', exportProgress);
  $('importInput').addEventListener('change', e => e.target.files[0] && importProgress(e.target.files[0]));
  renderNav(); renderMain(); updateProgressBar();
})();
