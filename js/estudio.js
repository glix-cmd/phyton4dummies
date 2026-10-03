/* Herramientas de estudio: portada en pirámide y página de cada bloque
   (mapa mental, apuntes, conceptos clave, autoevaluación y lista de módulos) */

const esBloque = id => typeof id === 'string' && id.startsWith('b:');
const TABS_BLOQUE = [['mapa', 'Mapa mental'], ['apuntes', 'Apuntes'], ['conceptos', 'Conceptos clave'], ['test', 'Autoevaluación'], ['modulos', 'Módulos']];
let tabBloque = 'mapa';
const HERR = {};

/* Recorre el contenido de un módulo y recoge sus resúmenes, conceptos, errores habituales y preguntas */
function herramientas(m){
  if(HERR[m.id]) return HERR[m.id];
  TOOLS_REC = [];
  try{ m.body(); } finally { HERR[m.id] = TOOLS_REC; TOOLS_REC = null; }
  return HERR[m.id];
}
function tituloCorto(m, max = 26){
  let t = m.title.split(':')[0].replace(/\s*\(.*\)\s*$/, '').trim();
  if(t.length > max){ t = t.slice(0, max).replace(/\s+\S*$/, '') + '…'; }
  return t;
}
const escTxt = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function barajar(a){ const b = a.slice(); for(let i = b.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }

/* ---------- Portada ---------- */
function renderWelcome(){
  const total = MODULES.length, hechos = countDone(), p = getProgress();
  const guardado = parseInt(localStorage.getItem(LAST_KEY)), ultimo = modulo(guardado) ? guardado : null;
  const tiles = CATS.map((cat, i) => {
    const mods = MODULES.filter(m => m.cat === cat), h = mods.filter(m => p[m.id]).length;
    const temas = mods.slice(0, 3).map(m => tituloCorto(m, 22)).join(', ');
    return `<button class="tile t${i + 1}" style="--cat:${CAT_INFO[cat].color}" onclick="goTo('b:${cat}')" aria-label="Bloque ${i + 1}: ${cat}, ${h} de ${mods.length} módulos completados">
      <span class="t-top"><span class="t-num">Bloque ${i + 1}</span><span class="t-range">${mods[0].id}–${mods[mods.length - 1].id}</span></span>
      <span class="t-title">${cat}</span>
      <span class="t-desc">${CAT_INFO[cat].desc}</span>
      <span class="t-temas">${temas}…</span>
      <span class="t-foot"><span class="mini-bar"><i style="width:${h / mods.length * 100}%"></i></span><span class="t-count">${h}/${mods.length}</span></span>
    </button>`;
  }).join('');
  const archivos = Object.keys(DATASETS).map(f => `<code>${f}</code>`).join('');
  $('main').innerHTML = `
  <section class="welcome">
    <div class="w-head">
      <h1>Python, de la primera línea al primer genoma</h1>
      <p class="lede">${total} módulos en ${CATS.length} bloques, con código que se ejecuta en tu navegador. Empieza por los fundamentos y sube bloque a bloque, o entra directamente en el que necesites.</p>
      <div class="hero-actions">
        <button class="btn-primary" onclick="goTo(${ultimo || 1})">${ultimo ? `Continuar en el módulo ${ultimo}` : 'Empezar por el módulo 1'}</button>
        <button class="btn-secondary" onclick="openPalette()">Buscar un módulo <kbd>Ctrl K</kbd></button>
        <span class="w-prog">${hechos} de ${total} módulos completados</span>
      </div>
    </div>
    <nav class="pyramid" aria-label="Bloques del curso">${tiles}</nav>
  </section>
  <h2 class="section-h">Herramientas de estudio <small>en la página de cada bloque</small></h2>
  <div class="tools">
    ${[['mapa', 'Mapa mental', 'Los módulos del bloque y sus ideas clave de un vistazo. Cada módulo es un enlace.'],
       ['apuntes', 'Apuntes', 'El resumen teórico de todo el bloque en una página, con sus errores habituales. Se puede imprimir o guardar en PDF.'],
       ['conceptos', 'Conceptos clave', 'Glosario con todas las definiciones del bloque y un buscador.'],
       ['test', 'Autoevaluación', 'Preguntas de todos los módulos del bloque, mezcladas, con tu puntuación al final.']]
      .map(([t, n, d]) => `<button class="tool" onclick="tabBloque='${t}';goTo('b:Fundamentos')"><b>${n}</b><span>${d}</span></button>`).join('')}
  </div>
  <h2 class="section-h">Cómo se trabaja aquí</h2>
  <div class="howto">
    <div><b>Ejecuta y experimenta</b>Cada bloque de código es editable. <kbd>Ctrl Enter</kbd> lo ejecuta. Las celdas comparten memoria, como en Jupyter: ejecútalas en orden.</div>
    <div><b>Ejercicios que se corrigen solos</b>Escribe tu solución y pulsa Comprobar. Si falla, te dice qué no cuadra; la solución explicada está debajo.</div>
    <div><b>Tu progreso se queda aquí</b>Se guarda en este navegador. Para cambiar de equipo, usa Exportar e Importar al pie del explorador.</div>
    <div><b>Internet y Colab</b>Python se descarga la primera vez. Las celdas de APIs consultan bases de datos reales; RDKit, TensorFlow y PyTorch se trabajan en los cuadernos de Colab de <code>notebooks/</code>.</div>
  </div>
  <h2 class="section-h">Archivos de datos incluidos <small>disponibles en el disco virtual de Python</small></h2>
  <div class="files-list">${archivos}</div>`;
}

/* ---------- Página de bloque ---------- */
function renderBlock(){
  const cat = currentId.slice(2), info = CAT_INFO[cat], n = CATS.indexOf(cat) + 1;
  const mods = MODULES.filter(m => m.cat === cat), p = getProgress(), h = mods.filter(m => p[m.id]).length;
  const prev = CATS[n - 2], next = CATS[n];
  $('main').innerHTML = `
    <header class="mod-head blk-head" style="--cat:${info.color}">
      <div class="mod-meta">
        <span class="blk">Bloque ${n} de ${CATS.length}</span>
        <span class="m">Módulos ${mods[0].id}–${mods[mods.length - 1].id}</span>
        <span class="m">${h} de ${mods.length} completados</span>
      </div>
      <h1 class="mod-title">${cat}</h1>
      <p class="blk-intro">${INTRO_BLOQUES[cat] || info.desc}</p>
      ${cat === 'Bioinformática' ? `<div class="chromo"><div class="chromo-head"><span>TP53, primeros 18 codones</span>
        <span class="chromo-legend"><span><i style="background:var(--a)"></i>A</span><span><i style="background:var(--c)"></i>C</span><span><i style="background:var(--g)"></i>G</span><span><i style="background:var(--t)"></i>T</span></span></div>
        <div class="chromo-scroll">${cromatograma(TP53_CDS, TP53_AA)}</div></div>` : ''}
      <div class="seg" role="tablist" aria-label="Herramientas del bloque">
        ${TABS_BLOQUE.map(([k, t]) => `<button role="tab" data-tab="${k}" aria-selected="${k === tabBloque}" onclick="cambiarTab('${k}')">${t}</button>`).join('')}
      </div>
    </header>
    <div id="blkBody"></div>
    <nav class="navfoot" aria-label="Bloques anterior y siguiente">
      <button class="nav-card" ${prev ? `onclick="goTo('b:${prev}')"` : 'disabled'}><span class="lbl"><kbd>Alt ←</kbd>Bloque anterior</span><span class="fname">${prev || ''}</span></button>
      <button class="nav-card next" onclick="goTo(${next ? `'b:${next}'` : mods[0].id})"><span class="lbl">${next ? 'Bloque siguiente' : 'Empezar el bloque'}<kbd>Alt →</kbd></span><span class="fname">${next || fileName(mods[0])}</span></button>
    </nav>`;
  pintarTab(cat, mods);
}
function cambiarTab(k){
  tabBloque = k;
  document.querySelectorAll('.seg [role=tab]').forEach(b => b.setAttribute('aria-selected', b.dataset.tab === k));
  const cat = currentId.slice(2);
  pintarTab(cat, MODULES.filter(m => m.cat === cat));
}
function pintarTab(cat, mods){
  const caja = $('blkBody');
  window.__alResponder = null;
  if(tabBloque === 'mapa') caja.innerHTML = vistaMapa(cat, mods);
  else if(tabBloque === 'apuntes') caja.innerHTML = vistaApuntes(cat, mods);
  else if(tabBloque === 'conceptos') caja.innerHTML = vistaConceptos(mods);
  else if(tabBloque === 'test') vistaTest(caja, mods);
  else caja.innerHTML = vistaModulos(mods);
}

/* Mapa mental: el bloque en el centro, la mitad de los módulos a cada lado y sus ideas clave */
function vistaMapa(cat, mods){
  const W = 1260, cx = W / 2, LH = 21, GAP = 16, color = CAT_INFO[cat].color;
  const mitad = Math.ceil(mods.length / 2), lados = [[mods.slice(0, mitad), -1], [mods.slice(mitad), 1]];
  const altoLado = l => l.reduce((s, m) => s + Math.max((MAPAS[m.id] || []).length, 1) * LH + GAP, -GAP);
  const H = Math.max(...lados.map(([l]) => altoLado(l))) + 60, cy = H / 2;
  const anchoCentro = Math.max(150, cat.length * 10.5 + 40);
  let lineas = '', nodos = '', hojas = '';
  for(const [lado, dir] of lados){
    let y = cy - altoLado(lado) / 2;
    for(const m of lado){
      const ideas = MAPAS[m.id] || [];
      const bloqueH = Math.max(ideas.length, 1) * LH, my = y + bloqueH / 2 - LH / 2 + 4;
      const etiqueta = tituloCorto(m), w = etiqueta.length * 7.1 + 46;
      const mx = cx + dir * Math.max(245, anchoCentro / 2 + 46 + w / 2), borde = mx - dir * w / 2, fuera = mx + dir * w / 2;
      const x0 = cx + dir * anchoCentro / 2, curva = Math.max(Math.abs(borde - x0) * 0.55, 10);   // sin bucles aunque el nodo quede cerca
      lineas += `<path class="mm-l" d="M${x0} ${cy} C${x0 + dir * curva} ${cy}, ${borde - dir * curva} ${my}, ${borde} ${my}"/>`;
      ideas.forEach((idea, k) => {
        const iy = y + k * LH + 4, hx = fuera + dir * 30;
        lineas += `<path class="mm-l mm-l2" d="M${fuera} ${my} C${fuera + dir * 16} ${my}, ${hx - dir * 16} ${iy}, ${hx - dir * 6} ${iy}"/>`;
        hojas += `<circle class="mm-dot" cx="${hx - dir * 6}" cy="${iy}" r="2.6"/><text class="mm-leaf" x="${hx + dir * 2}" y="${iy + 4}" text-anchor="${dir > 0 ? 'start' : 'end'}">${escTxt(idea)}</text>`;
      });
      const hecho = getProgress()[m.id];
      nodos += `<g class="mm-mod${hecho ? ' done' : ''}" role="link" tabindex="0" onclick="goTo(${m.id})" onkeydown="if(event.key==='Enter')goTo(${m.id})">
        <title>Módulo ${m.id}: ${escTxt(m.title)}</title>
        <rect x="${mx - w / 2}" y="${my - 15}" width="${w}" height="30" rx="15"/>
        <circle cx="${mx - w / 2 + 16}" cy="${my}" r="10" class="mm-num"/>
        <text x="${mx - w / 2 + 16}" y="${my + 4}" text-anchor="middle" class="mm-numt">${m.id}</text>
        <text x="${mx - w / 2 + 33}" y="${my + 4.5}" class="mm-modt">${escTxt(etiqueta)}</text></g>`;
      y += bloqueH + GAP;
    }
  }
  const centro = `<g class="mm-center"><rect x="${cx - anchoCentro / 2}" y="${cy - 24}" width="${anchoCentro}" height="48" rx="24"/>
    <text x="${cx}" y="${cy + 6}" text-anchor="middle">${escTxt(cat)}</text></g>`;
  return `<p class="tab-intro">Haz clic en un módulo para abrirlo. Los módulos ya completados aparecen marcados.</p>
    <div class="mm-wrap" style="--cat:${color}"><svg class="mindmap" viewBox="0 0 ${W} ${H}" role="img" aria-label="Mapa mental del bloque ${escTxt(cat)}">${lineas}${hojas}${nodos}${centro}</svg></div>`;
}

/* Apuntes: el resumen de cada módulo, sus ideas clave y sus errores habituales */
function vistaApuntes(cat, mods){
  const p = getProgress();
  const secciones = mods.map(m => {
    const h = herramientas(m);
    const items = h.filter(x => x.tipo === 'resumen').flatMap(x => x.items);
    const errores = h.filter(x => x.tipo === 'warn').map(x => x.html);
    return `<article class="ap-mod">
      <h3><button class="ap-link" onclick="goTo(${m.id})"><span class="ap-n">${String(m.id).padStart(2, '0')}</span>${m.title}</button>${p[m.id] ? '<span class="ap-ok">completado</span>' : ''}</h3>
      <div class="chips">${(MAPAS[m.id] || []).map(i => `<span>${escTxt(i)}</span>`).join('')}</div>
      ${items.length ? `<ul class="ap-list">${items.map(i => `<li>${i}</li>`).join('')}</ul>` : ''}
      ${errores.length ? `<details class="ap-err"><summary>Errores habituales (${errores.length})</summary><ul>${errores.map(e => `<li>${e}</li>`).join('')}</ul></details>` : ''}
    </article>`;
  }).join('');
  return `<div class="tab-tools"><p class="tab-intro">Resumen teórico de los ${mods.length} módulos del bloque.</p>
      <button class="btn" onclick="imprimirApuntes()">Imprimir o guardar en PDF</button></div>
    <div class="apuntes" id="apuntes"><h2 class="print-only">${cat}: apuntes</h2>${secciones}</div>`;
}
function imprimirApuntes(){
  document.querySelectorAll('.ap-err').forEach(d => d.open = true);
  document.body.classList.add('imprimiendo-apuntes');
  window.print();
  setTimeout(() => document.body.classList.remove('imprimiendo-apuntes'), 500);
}

/* Conceptos clave: glosario con buscador */
function vistaConceptos(mods){
  const ids = new Set(mods.map(m => m.id));
  const lista = [...mods.flatMap(m => herramientas(m).filter(x => x.tipo === 'concepto').map(x => Object.assign({m}, x))),
                 ...GLOSARIO_BASE.filter(g => ids.has(g.mod)).map(g => Object.assign({m: modulo(g.mod)}, g))]
    .sort((x, y) => x.m.id - y.m.id);
  if(!lista.length) return '<p class="tab-intro">Este bloque no tiene conceptos destacados.</p>';
  const tarjetas = lista.map(c => `<article class="gl-card" data-q="${escTxt(norm(c.titulo + ' ' + c.html.replace(/<[^>]+>/g, ' ')))}">
      <h4>${c.titulo}</h4><p>${c.html}</p>
      <button class="gl-mod" onclick="goTo(${c.m.id})">Módulo ${c.m.id}: ${escTxt(tituloCorto(c.m, 40))}</button></article>`).join('');
  return `<div class="tab-tools"><p class="tab-intro">${lista.length} conceptos explicados en este bloque.</p>
      <label class="filter gl-filter"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="9" cy="9" r="5.5"/><path d="m13.5 13.5 3.5 3.5"/></svg>
      <input placeholder="Buscar un concepto" oninput="filtrarGlosario(this.value)" aria-label="Buscar un concepto"></label></div>
    <div class="glosario" id="glosario">${tarjetas}</div><p class="tab-intro" id="glVacio" hidden>Ningún concepto coincide con la búsqueda.</p>`;
}
function filtrarGlosario(q){
  q = norm(q.trim()); let visibles = 0;
  document.querySelectorAll('#glosario .gl-card').forEach(c => { const ok = !q || c.dataset.q.includes(q); c.hidden = !ok; visibles += ok; });
  $('glVacio').hidden = visibles > 0;
}

/* Autoevaluación: preguntas de todo el bloque, mezcladas, con puntuación */
function vistaTest(caja, mods){
  const banco = mods.flatMap(m => herramientas(m).filter(x => x.tipo === 'quiz').map(x => Object.assign({m}, x)));
  const ronda = barajar(banco).slice(0, Math.min(10, banco.length));
  let respondidas = 0, aciertos = 0;
  caja.innerHTML = `<div class="tab-tools"><p class="tab-intro">${ronda.length} preguntas al azar de un banco de ${banco.length} del bloque.</p>
      <button class="btn" onclick="cambiarTab('test')">Nueva ronda</button></div>
    <div class="score" id="score" aria-live="polite"><span id="scoreTxt">0 de ${ronda.length} respondidas</span><span class="mini-bar"><i id="scoreBar" style="width:0%"></i></span></div>
    ${ronda.map(q => `<div class="test-q"><span class="test-src">Módulo ${q.m.id}</span>${quiz(q.pregunta, q.opciones, q.correcta, q.explicacion)}</div>`).join('')}`;
  window.__alResponder = ok => {
    respondidas++; aciertos += ok ? 1 : 0;
    $('scoreTxt').textContent = respondidas < ronda.length
      ? `${respondidas} de ${ronda.length} respondidas, ${aciertos} correctas`
      : `Resultado: ${aciertos} de ${ronda.length} correctas (${Math.round(aciertos / ronda.length * 100)} %)${aciertos === ronda.length ? '. ¡Perfecto!' : '. Repasa los módulos de las preguntas falladas.'}`;
    $('scoreBar').style.width = (aciertos / ronda.length * 100) + '%';
    $('score').classList.toggle('done', respondidas === ronda.length);
  };
}

/* Lista de módulos con su progreso y sus ideas clave */
function vistaModulos(mods){
  const p = getProgress();
  return `<div class="mod-list">${mods.map(m => `<button class="mod-row" onclick="goTo(${m.id})">
      <span class="ap-n">${String(m.id).padStart(2, '0')}</span>
      <span class="mr-body"><span class="mr-t">${m.title}</span><span class="chips">${(MAPAS[m.id] || []).map(i => `<span>${escTxt(i)}</span>`).join('')}</span></span>
      <span class="state ${p[m.id] ? 'done' : ''}" aria-label="${p[m.id] ? 'completado' : 'pendiente'}"></span></button>`).join('')}</div>`;
}
