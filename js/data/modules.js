/* Datos de contenido del curso. Cada módulo: id, title, category, body() -> HTML */
let codeCounter = 0;
const CODE_ORIG = {}, CODE_TESTS = {}, CODE_SOL = {};
function _esc(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
const ICON = {
  play:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 3.2v9.6c0 .5.5.8 1 .5l7.6-4.8c.4-.3.4-.8 0-1.1L5.5 2.7c-.5-.3-1 0-1 .5z"/></svg>',
  reset:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 8a5.5 5.5 0 1 0 1.7-4"/><path d="M2.5 2.5v3h3"/></svg>',
  check:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3 8.5 3 3 7-7"/></svg>',
  file:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 1.5h5.5L13 5v9.5H4z"/><path d="M9.5 1.5V5H13"/></svg>',
  list:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.5 4h8M5.5 8h8M5.5 12h8M2.5 4h0M2.5 8h0M2.5 12h0"/></svg>',
};
function _cap(html){ return html.replace(/^([a-záéíóúñ])/, c => c.toUpperCase()); }

/* Celda de código editable y ejecutable. opts.test = aserciones Python para autocorrección */
function codeBlock(code, runnable=true, opts={}){
  const id = 'c'+(codeCounter++);
  CODE_ORIG[id] = code;
  if(opts.test) CODE_TESTS[id] = opts.test;
  const rows = Math.min(Math.max(code.split('\n').length + 1, 4), 28);
  return `<div class="cell" data-cell="${id}">
    <div class="cell-head">
      <span class="in-label" id="in-${id}">In [ ]</span>
      ${opts.label ? `<span class="cell-title">${opts.label}</span>` : ''}
      <span class="cell-actions">
        <button class="btn" onclick="resetCode('${id}')" title="Volver al código original">${ICON.reset}Restaurar</button>
        ${opts.test ? `<button class="btn btn-check" onclick="checkExercise('${id}')">${ICON.check}Comprobar</button>` : ''}
        ${runnable ? `<button class="btn btn-run" id="run-${id}" onclick="runCode('${id}')" title="Ejecutar (Ctrl+Enter)">${ICON.play}Ejecutar</button>` : ''}
      </span>
    </div>
    <textarea class="code" id="ta-${id}" rows="${rows}" spellcheck="false" aria-label="Código Python">${_esc(code)}</textarea>
    <div class="output" id="out-${id}"></div>
    ${opts.test ? `<div class="check-res" id="chk-${id}" role="status"></div>` : ''}
  </div>`;
}
/* Código de solo lectura (para código que solo funciona en tu ordenador).
   NB_REC se activa solo al generar los cuadernos de Colab (build): registra cada celda en orden. */
let NB_REC = null;
function _staticHTML(code, label){
  const limpio = label.replace(/^[^\p{L}\p{N}(]+/u, '');
  const tipo = /RDKit|Colab/.test(limpio) ? 'Colab' : 'local';
  return `<div class="static-code"><div class="static-head"><span class="sc-badge">${tipo}</span>${limpio}</div><pre class="hl">${_esc(code)}</pre></div>`;
}
function _rec(item, html){
  if(!NB_REC) return html;
  const i = NB_REC.push(item) - 1;
  return `<!--NB${item.k === 'ex' ? 'X' : 'C'}:${i}-->${html}<!--/NB${item.k === 'ex' ? 'X' : 'C'}-->`;
}
function staticCode(code, label='Para ejecutar en tu ordenador (VS Code / Colab)'){
  return _rec({k:'code', c:code}, _staticHTML(code, label));
}
/* Celda RDKit: RDKit no existe para Python en el navegador, se ejecuta en Colab / en tu ordenador */
function rdkitBlock(code){
  return _rec({k:'code', c:code}, _staticHTML(code, 'RDKit: ejecútalo en Google Colab o en tu ordenador (cuaderno en notebooks/)'));
}
function exerciseLocal(title, prompt, starter, solution, test=null, solCode=null){
  const html = `<section class="exercise" data-ex="${_esc(title)}">
    <header class="ex-head"><span class="ex-k">ejercicio</span><h4>${title}</h4><span class="ex-pill local">En Colab</span></header>
    <p>${prompt}</p>
    ${_staticHTML(starter, 'Escribe tu solución en el cuaderno de Colab (la celda de comprobación está justo debajo)')}
    <details class="sol-d"><summary>Ver la solución explicada</summary><div class="sol-body">${solution}${solCode ? `<pre class="sol hl">${_esc(solCode)}</pre>` : ''}</div></details>
  </section>`;
  return _rec({k:'ex', t:title, p:prompt, s:starter, sol:solution, test, solc:solCode}, html);
}
function noNavegador(nb){
  return `<aside class="callout c-note"><span class="callout-k">RDKit se ejecuta fuera del navegador</span>No existe una versión de RDKit para Python compilada para la web (ni siquiera en Pyodide), así que en este módulo el código se muestra para ejecutarlo en <b>Google Colab</b> o en tu ordenador. Abre <code>notebooks/${nb}</code> (viene en la carpeta del curso) en <a href="https://colab.research.google.com" target="_blank" rel="noopener">colab.research.google.com</a> con <i>Archivo → Subir cuaderno</i>: incluye la instalación, los archivos de datos y la comprobación de cada ejercicio.</aside>`;
}
function _callout(cls, k, html){ return `<aside class="callout ${cls}"><span class="callout-k">${k}</span>${html}</aside>`; }
function tip(html){ return _callout('c-tip', 'Consejo', _cap(html)); }
function warn(html){ return _callout('c-warn', 'Error habitual', _cap(html)); }
function note(html){ return _callout('c-note', 'Nota', _cap(html)); }
function concepto(titulo, html){ return _callout('c-concept', _cap(titulo), _cap(html)); }
function resumen(items){ return `<section class="summary"><h4>${ICON.list}Resumen del módulo</h4><ul>${items.map(i=>`<li>${i}</li>`).join('')}</ul></section>`; }
function origen(txt){
  const partes = txt.split(/,\s*|\s+y\s+/).map(p => p.trim()).filter(Boolean);
  return `<div class="origin">${ICON.file}Basado en ${partes.map(p => `<span>${p}</span>`).join(' ')}</div>`;
}

/* Ejercicio: enunciado + celda + (opcional) autocorrección + solución explicada con código */
function exercise(title, prompt, starter, solution, test=null, solCode=null){
  if(solCode) CODE_SOL['c'+codeCounter] = solCode;
  return `<section class="exercise" data-ex="${_esc(title)}">
    <header class="ex-head"><span class="ex-k">ejercicio</span><h4>${title}</h4><span class="ex-pill">${test ? 'Pendiente' : 'Libre'}</span></header>
    <p>${prompt}</p>
    ${codeBlock(starter, true, {test, label: 'tu solución'})}
    <details class="sol-d"><summary>Ver la solución explicada</summary><div class="sol-body">${solution}${solCode ? `<pre class="sol hl">${_esc(solCode)}</pre>` : ''}</div></details>
  </section>`;
}

/* Pregunta tipo test con corrección inmediata */
let quizCounter = 0;
function quiz(pregunta, opciones, correcta, explicacion){
  const q = 'q'+(quizCounter++);
  return `<div class="quiz" id="${q}"><div class="quiz-q"><span class="quiz-k">?</span><span>${pregunta}</span></div>
    <ol class="quiz-opts">${opciones.map((o,i)=>`<li><button class="quiz-opt" onclick="answerQuiz('${q}',${i},${correcta})"><kbd>${'abcd'[i]}</kbd><span>${o}</span></button></li>`).join('')}</ol>
    <div class="quiz-exp" data-exp="${_esc(explicacion)}" aria-live="polite"></div></div>`;
}
function answerQuiz(q, i, ok){
  const box = document.getElementById(q), btns = box.querySelectorAll('.quiz-opt'), exp = box.querySelector('.quiz-exp');
  btns.forEach((b,j)=>{ b.disabled = true; if(j===ok) b.classList.add('right'); else if(j===i) b.classList.add('wrong'); });
  exp.innerHTML = (i===ok ? '<b class="ok">Correcto.</b> ' : '<b class="ko">No exactamente.</b> ') + exp.dataset.exp;
}

const MODULES = [
{id:1, cat:"Fundamentos", title:"Qué es Python y cómo empezar", body:()=>`
<div class="theory">
<p>Python es un lenguaje de programación pensado para leerse casi como texto normal. Se usa en análisis de datos, bioinformática, automatización, web y mucho más — por eso es una buena primera lengua de programación.</p>
<p>En esta web no necesitas instalar nada: cada bloque de código de abajo es un mini-Python que corre <b>dentro de tu navegador</b> (gracias a Pyodide). Escribe código, pulsa "Ejecutar" y verás el resultado al instante.</p>
${codeBlock(`print("¡Hola, Python!")`)}
${tip("Si quieres instalar Python en tu propio ordenador más adelante, descárgalo de python.org y usa un editor como VS Code.")}
${note("Todos estos ejercicios también funcionan igual si copias el código en Google Colab (colab.research.google.com) o en cualquier editor con Python instalado.")}
${concepto("Cómo funciona esta web", "todas las celdas comparten la misma memoria, como en Jupyter o Colab: si defines una variable en una celda, la puedes usar en la siguiente. Ejecuta las celdas en orden.")}
${codeBlock(`mensaje = "Las celdas comparten memoria"`)}
${codeBlock(`print(mensaje)   # funciona si antes ejecutaste la celda de arriba`)}
${tip("Atajos del editor: <b>Ctrl+Enter</b> ejecuta la celda y <b>Tab</b> inserta 4 espacios de indentación.")}
${resumen(["Python es un lenguaje legible y muy usado en ciencia de datos y bioinformática.", "Aquí se ejecuta en tu navegador; en tu ordenador usarás VS Code, Spyder o Jupyter.", "Las celdas comparten variables: el orden de ejecución importa."])}
${quiz("Si ejecutas una celda que usa una variable definida en otra celda que aún no has ejecutado, ¿qué ocurre?", ["Python la crea vacía automáticamente", "Da un NameError", "Funciona igual"], 1, "Python solo conoce las variables que ya se han ejecutado: verás <code>NameError: name '...' is not defined</code>.")}
</div>`},

{id:2, cat:"Fundamentos", title:"print(), comentarios y sintaxis básica", body:()=>`
<div class="theory">
<p><code>print()</code> muestra información en pantalla — es tu herramienta principal para "ver" lo que hace tu programa. Los comentarios (con <code>#</code>) no se ejecutan: sirven para explicar el código a otras personas o a ti mismo en el futuro.</p>
<p>Python no usa llaves <code>{}</code> ni punto y coma para separar bloques: usa la <b>indentación</b> (espacios al principio de línea). Esto es obligatorio, no un estilo opcional.</p>
${codeBlock(`# Esto es un comentario, Python lo ignora
print("Primera línea")
print("Segunda línea", "con", "varios", "argumentos")
print("Puedo unir texto y números:", 2 + 2)`)}
${warn("mezclar espacios y tabulaciones en la indentación, o desalinear líneas que deberían estar al mismo nivel — Python lanzará <code>IndentationError</code>.")}
${exercise("Preséntate", "Escribe tres líneas con print(): tu nombre, tu edad y una frase sobre por qué quieres aprender Python.",
`print("Me llamo ...")
`,
`<p>Basta con tres <code>print()</code> seguidos, uno por línea, cada uno con su texto entre comillas.</p>`)}
${resumen(["<code>print()</code> muestra valores; acepta varios argumentos separados por comas.", "<code>#</code> crea comentarios que Python ignora.", "La indentación define los bloques de código y es obligatoria."])}
${quiz("¿Qué imprime <code>print(\"A\", \"B\", 3)</code>?", ["AB3", "A B 3", "Error: no se pueden mezclar textos y números"], 1, "print separa sus argumentos con un espacio por defecto (se cambia con <code>sep=</code>).")}
</div>`},

{id:3, cat:"Fundamentos", title:"Variables y tipos de datos", body:()=>`
<div class="theory">
<p>Una variable es un nombre que guarda un valor para poder reutilizarlo. En Python no necesitas declarar el tipo: se deduce automáticamente.</p>
${codeBlock(`nombre = "Guille"        # str (texto)
edad = 30                # int (entero)
altura = 1.75             # float (decimal)
es_biologo = True         # bool (verdadero/falso)

print(nombre, edad, altura, es_biologo)
print(type(edad))`)}
<p>Puedes comprobar el tipo de cualquier valor con <code>type()</code>, y convertir entre tipos con <code>int()</code>, <code>float()</code>, <code>str()</code>.</p>
${warn("intentar sumar texto y número directamente: <code>\"Edad: \" + 30</code> da error. Hay que convertir: <code>\"Edad: \" + str(30)</code>.")}
${exercise("Ficha de datos", "Crea variables para especie, número de cromosomas y si es un organismo modelo (bool). Imprímelas todas en una sola línea usando print con comas.",
`especie = "Drosophila melanogaster"
`,
`<p>Se crean las tres variables con el tipo correcto y se pasan todas juntas a <code>print()</code> separadas por comas — Python las separa con espacios automáticamente.</p>`)}
<p>Los <b>booleanos</b> (<code>True</code>/<code>False</code>) son el resultado de toda comparación, y se combinan con <code>and</code>, <code>or</code> y <code>not</code>. Python también tiene <code>is</code>, que no compara valores sino <b>identidad</b>: si dos nombres apuntan al mismo objeto en memoria.</p>
${codeBlock(`var1, var2 = 1, 2
var3 = var2

print(var1 != var2 and var1 < var2)   # True: se cumplen las dos
print(var1 == var2 or var1 < var2)    # True: basta con una
print(var2 is var3)                   # True: el mismo objeto
print(id(var2), id(var3))             # misma posición en memoria`)}
${warn("usar <code>is</code> para comparar valores. <code>is</code> compara identidad; para valores usa <code>==</code>. La única excepción habitual es <code>x is None</code>.")}
${resumen(["Tipos básicos: <code>int</code>, <code>float</code>, <code>str</code>, <code>bool</code>.", "<code>type()</code> te dice el tipo; <code>int()</code>, <code>float()</code>, <code>str()</code> convierten.", "<code>==</code> compara valores; <code>is</code> compara identidad en memoria."])}
${quiz("¿Qué devuelve <code>type(3.0)</code>?", ["int", "float", "str"], 1, "Cualquier número con punto decimal es <code>float</code>, aunque su parte decimal sea 0.")}
</div>`},

{id:4, cat:"Fundamentos", title:"Operadores y expresiones", body:()=>`
<div class="theory">
<p>Los operadores combinan valores: aritméticos (<code>+ - * / // % **</code>), de comparación (<code>== != &lt; &gt; &lt;= &gt;=</code>) y lógicos (<code>and or not</code>).</p>
${codeBlock(`a, b = 17, 5
print(a / b)    # división real -> 3.4
print(a // b)   # división entera -> 3
print(a % b)    # resto -> 2
print(a ** 2)   # potencia -> 289
print(a > b and b > 0)`)}
${tip("<code>//</code> y <code>%</code> juntos te dan cociente y resto de una división — muy útil para repartir elementos en grupos.")}
${exercise("Calculadora de GC%", "Dado gc_count=45 y total=100, calcula el porcentaje de GC (gc_count/total*100) y guárdalo en una variable gc_percent. Imprímelo.",
`gc_count = 45
total = 100
`,
`<p><code>gc_percent = gc_count / total * 100</code> — la división da el resultado en formato decimal (float), listo para mostrarlo.</p>`)}
<p>El operador <code>in</code> comprueba si algo está contenido en una secuencia — muy usado para buscar patrones en texto o secuencias biológicas.</p>
${codeBlock(`hebra_complementaria = "UUACCAGUCCGGUA"
hebra_molde = hebra_complementaria[::-1]   # [::-1] invierte la cadena
print("Hebra molde:", hebra_molde)

codon_inicio = "AUG"
print("¿Contiene codón de inicio?", codon_inicio in hebra_molde)
print("Posición:", hebra_molde.find(codon_inicio))`)}
${exercise("Buscar un patrón", "Dada secuencia = 'ATGCGTACGGATCC', comprueba con 'in' si contiene el patrón 'GGATCC' (diana de EcoRI) y, si la contiene, imprime en qué posición empieza con .find().",
`secuencia = "ATGCGTACGGATCC"
patron = "GGATCC"
`,
`<p><code>patron in secuencia</code> devuelve True/False; <code>secuencia.find(patron)</code> devuelve el índice donde empieza la coincidencia (o -1 si no la encuentra).</p>`)}
${resumen(["Aritméticos: <code>+ - * / // % **</code>.", "Comparación: <code>== != &lt; &gt; &lt;= &gt;=</code> → devuelven booleanos.", "<code>in</code> comprueba si algo está contenido (texto, listas...).", "<code>[::-1]</code> invierte una secuencia."])}
${quiz("¿Cuánto vale <code>17 % 5</code>?", ["3", "2", "3.4"], 1, "<code>%</code> es el resto de la división entera: 17 = 5·3 + 2.")}
</div>`},

{id:5, cat:"Fundamentos", title:"Entrada y salida de datos", body:()=>`
<div class="theory">
<p><code>input()</code> pide datos al usuario y siempre devuelve texto (str), aunque parezca un número — hay que convertirlo si lo necesitas para cálculos. En esta web <code>input()</code> funciona de verdad: aparecerá una ventanita del navegador pidiéndote el dato. En algunos ejemplos lo simulamos asignando la variable directamente para ir más rápido.</p>
${codeBlock(`# En un script normal harías: nombre = input("¿Cómo te llamas? ")
nombre = "Ana"   # simulamos la respuesta del usuario
print(f"Hola, {nombre}, bienvenida a Python")`)}
<p>Los f-strings (<code>f"..."</code>) son la forma moderna de insertar variables dentro de texto.</p>
${warn("olvidar convertir con <code>int()</code> el resultado de <code>input()</code> antes de hacer cálculos numéricos.")}
${exercise("Saludo personalizado", "Simula edad = \"28\" (como texto, tal cual la devolvería input()), conviértela a entero, suma 1 y muestra un f-string: 'El año que viene tendrás X años'.",
`edad = "28"
`,
`<p>Se convierte con <code>int(edad)</code>, se suma 1, y se inserta en un f-string: <code>f"El año que viene tendrás {int(edad)+1} años"</code>.</p>`)}
${codeBlock(`numero1 = float(input("Ingrese el primer número: "))
numero2 = float(input("Ingrese el segundo número: "))

if numero1 > numero2:
    print("El primer número es mayor que el segundo.")
elif numero1 < numero2:
    print("El primer número es menor que el segundo.")
else:
    print("Ambos números son iguales.")`)}
${origen("11. Bucle if elif else.py — comparador de números")}
<p>Los f-strings admiten formato: <code>{valor:.2f}</code> muestra 2 decimales, <code>{n:,}</code> separa miles, <code>{texto:&gt;10}</code> alinea a la derecha.</p>
${codeBlock(`gc = 0.537812
print(f"Contenido GC: {gc:.2%}")
print(f"Lecturas: {1234567:,}")
print(f"|{'p53':>8}|{'BRCA1':<8}|")`)}
${resumen(["<code>input()</code> siempre devuelve texto: convierte con <code>int()</code>/<code>float()</code>.", "Los f-strings <code>f\"...{variable}...\"</code> insertan valores en texto.", "Formatos útiles: <code>:.2f</code>, <code>:.1%</code>, <code>:,</code>."])}
${quiz("<code>edad = input(\"Edad: \")</code> y escribes 30. ¿Qué es <code>edad + 1</code>?", ["31", "TypeError", "\"301\""], 1, "edad es el texto \"30\": sumar texto + número da <code>TypeError</code>. Hay que hacer <code>int(edad) + 1</code>.")}
</div>`},

{id:6, cat:"Fundamentos", title:"Condicionales", body:()=>`
<div class="theory">
<p><code>if / elif / else</code> permite que tu programa tome decisiones según se cumplan o no condiciones.</p>
${codeBlock(`temperatura = 37.8

if temperatura >= 38:
    print("Fiebre")
elif temperatura >= 37:
    print("Febrícula")
else:
    print("Normal")`)}
${tip("Puedes combinar condiciones con <code>and</code>/<code>or</code>: <code>if edad >= 18 and tiene_carnet:</code>")}
${warn("usar <code>=</code> (asignación) en vez de <code>==</code> (comparación) dentro de un <code>if</code> — Python dará error de sintaxis, cosa que en otros lenguajes pasa desapercibida.")}
${exercise("Clasificador de pH", "Dado ph = 5.5, imprime 'Ácido' si ph < 7, 'Neutro' si ph == 7, y 'Básico' si ph > 7.",
`ph = 5.5
`,
`<p>Una cadena if/elif/else comprobando cada rango en orden cubre los tres casos posibles.</p>`)}
${codeBlock(`edad = 45

if edad < 0:
    print("Edad no puede ser negativa.")
elif edad < 13:
    print("Eres un niño.")
elif edad < 19:
    print("Eres un adolescente.")
elif edad < 65:
    print("Eres un adulto.")
else:
    print("Eres un adulto mayor.")`)}
${origen("11. Bucle if elif else.py — clasificador por edad")}
${tip("Python evalúa las ramas en orden y entra solo en la <b>primera</b> que se cumple. Por eso los rangos se escriben de menor a mayor sin necesidad de poner <code>edad >= 13 and edad < 19</code>.")}
${exercise("Detector de números primos", "Un número es primo si es mayor que 1 y solo es divisible entre 1 y él mismo. Escribe código que guarde en la variable <code>es_primo</code> (True/False) si <code>numero</code> es primo. Prueba con varios valores; la comprobación usa 91. Pista: usa un <code>for</code> con <code>range(2, numero)</code> y <code>break</code>.",
`numero = 91
es_primo = None
`,
`<p>Se supone primo y se busca un divisor; si aparece, se marca como no primo y se corta el bucle. Este patrón también se puede escribir con <code>for ... else</code>: el <code>else</code> de un bucle se ejecuta solo si no hubo <code>break</code>.</p>`,
`assert es_primo is not None, "es_primo sigue valiendo None"
assert es_primo == False, "91 = 7 × 13, así que no es primo"`,
`numero = 91
es_primo = numero > 1
for divisor in range(2, numero):
    if numero % divisor == 0:
        es_primo = False
        break
print(es_primo)`)}
${resumen(["<code>if / elif / else</code>: solo se ejecuta la primera rama verdadera.", "Las condiciones se combinan con <code>and</code>, <code>or</code>, <code>not</code>.", "<code>for ... else</code>: el else se ejecuta si el bucle no terminó con break."])}
${quiz("Con <code>x = 15</code>: <code>if x > 10: print('A') elif x > 5: print('B')</code>. ¿Qué se imprime?", ["A", "A y B", "B"], 0, "Solo se ejecuta la primera rama que se cumple; aunque x > 5 también es cierto, elif ya no se evalúa.")}
</div>`},

{id:7, cat:"Fundamentos", title:"Bucles", body:()=>`
<div class="theory">
<p><code>for</code> recorre una secuencia elemento a elemento; <code>while</code> repite mientras una condición sea verdadera. <code>range()</code> genera secuencias de números.</p>
${codeBlock(`for i in range(5):
    print("Iteración", i)

contador = 0
while contador < 3:
    print("while:", contador)
    contador += 1`)}
${tip("<code>break</code> corta el bucle inmediatamente; <code>continue</code> salta a la siguiente vuelta sin ejecutar el resto del cuerpo.")}
${warn("olvidar actualizar la variable de control en un <code>while</code> (aquí, <code>contador += 1</code>) — crea un bucle infinito.")}
<p><b>Controlar el flujo dentro de un bucle:</b> <code>continue</code> salta directamente a la siguiente vuelta sin ejecutar el resto del cuerpo; <code>break</code> corta el bucle por completo; <code>pass</code> no hace nada — es un "hueco" que rellena la sintaxis cuando aún no has escrito la lógica.</p>
${codeBlock(`numeros = list(range(0, 32, 4))

# continue: salta los que no son múltiplos de 5
for n in numeros:
    if n % 5 != 0:
        continue
    print("Múltiplo de 5:", n)

# break: se detiene en el primer múltiplo de 5
for n in numeros:
    if n % 5 == 0:
        print("Primer múltiplo de 5 encontrado:", n)
        break`)}
${exercise("Suma de secuencia", "Usa un bucle for con range(1, 11) para sumar los números del 1 al 10 en una variable total, e imprime el resultado.",
`total = 0
`,
`<p>Se inicializa <code>total = 0</code> y en cada vuelta del <code>for i in range(1, 11)</code> se hace <code>total += i</code>; al final se imprime <code>total</code> (debe dar 55).</p>`)}
<p><code>pass</code> no hace nada: sirve para dejar un bloque vacío sin error de sintaxis. Compara las tres formas de quedarte con los múltiplos de 5:</p>
${codeBlock(`numeros = list(range(0, 32, 4))

for n in numeros:            # con pass: no hago nada con los que no cumplen
    if n % 5 != 0:
        pass
    else:
        print("pass ->", n)

listas = [[2, 6, 12, 15, 17, 34], [4, 32, 56, 18, 23], [2, 4, 6, 7, 8]]
for sublista in listas:      # bucles anidados
    mayores = [x for x in sublista if x >= 18]
    print(sublista, "-> mayores de edad:", mayores)`)}
${origen("9. for in.py, 10. Bucle while.py y 12. Continue Pass Break.py")}
${exercise("Pares e impares", "Recorre la lista <code>numeros</code> y reparte sus elementos en dos listas: <code>pares</code> e <code>impares</code>.",
`numeros = list(range(0, 11))
pares = []
impares = []
`,
`<p>Para cada número se comprueba el resto de dividir entre 2: si es 0 va a <code>pares</code> con <code>append</code>; si no, a <code>impares</code>.</p>`,
`assert pares == [0,2,4,6,8,10], f"pares debería ser [0, 2, 4, 6, 8, 10] y es {pares}"
assert impares == [1,3,5,7,9], f"impares debería ser [1, 3, 5, 7, 9] y es {impares}"`,
`for n in numeros:
    if n % 2 == 0:
        pares.append(n)
    else:
        impares.append(n)`)}
${resumen(["<code>for x in secuencia</code> recorre elementos; <code>while condicion</code> repite mientras se cumpla.", "<code>range(inicio, fin, paso)</code> no incluye el valor final.", "<code>continue</code> salta a la siguiente vuelta, <code>break</code> sale del bucle, <code>pass</code> no hace nada."])}
${quiz("¿Qué números genera <code>range(10, 0, -3)</code>?", ["10, 7, 4, 1", "10, 7, 4, 1, 0", "0, 3, 6, 9"], 0, "Empieza en 10, resta 3 en cada paso y se detiene antes de llegar a 0.")}
</div>`},

{id:8, cat:"Fundamentos", title:"Funciones", body:()=>`
<div class="theory">
<p>Una función empaqueta código reutilizable. Se define con <code>def</code>, puede recibir parámetros (con valores por defecto opcionales) y devolver un resultado con <code>return</code>.</p>
${codeBlock(`def calcular_gc(secuencia):
    gc = secuencia.count("G") + secuencia.count("C")
    return round(gc / len(secuencia) * 100, 1)

print(calcular_gc("ATGCGCGATTA"))

def saludar(nombre, saludo="Hola"):
    return f"{saludo}, {nombre}"

print(saludar("Marta"))
print(saludar("Marta", saludo="Buenas"))`)}
${warn("olvidar el <code>return</code>: la función seguirá ejecutándose sin errores pero devolverá <code>None</code>.")}
${exercise("Función de conversión", "Escribe una función celsius_a_fahrenheit(c) que devuelva c*9/5+32. Pruébala con 37.",
`def celsius_a_fahrenheit(c):
    pass  # sustituye esto
`,
`<p>El cuerpo es <code>return c * 9/5 + 32</code>. Con 37 grados debería devolver 98.6.</p>`)}
<p><b>Funciones lambda</b> son funciones pequeñas de una sola expresión, sin nombre, útiles cuando necesitas una función "de usar y tirar" (por ejemplo dentro de <code>sorted()</code>).</p>
${codeBlock(`al_cuadrado = lambda x: x ** 2
print(al_cuadrado(5))

organismos = [("mosca", 8), ("humano", 46), ("levadura", 16)]
organismos.sort(key=lambda o: o[1])   # ordena por número de cromosomas
print(organismos)`)}
<p><b>Recursividad:</b> una función puede llamarse a sí misma para resolver un problema dividiéndolo en versiones más pequeñas del mismo problema. Necesita siempre un caso base que detenga las llamadas.</p>
${codeBlock(`def factorial(n):
    if n <= 1:          # caso base
        return 1
    return n * factorial(n - 1)   # llamada recursiva

print(factorial(5))`)}
${warn("olvidar el caso base en una función recursiva — el programa se llamará a sí mismo indefinidamente hasta agotar la memoria (<code>RecursionError</code>).")}
${exercise("Función de GC", "Escribe <code>porcentaje_gc(secuencia)</code> que devuelva el porcentaje de G+C redondeado a 1 decimal. Debe funcionar aunque la secuencia venga en minúsculas.",
`def porcentaje_gc(secuencia):
    pass
`,
`<p>Primero se normaliza con <code>.upper()</code>, luego se cuentan G y C y se divide entre la longitud. <code>round(x, 1)</code> redondea.</p>`,
`assert porcentaje_gc("ATGC") == 50.0, "porcentaje_gc('ATGC') debería ser 50.0"
assert porcentaje_gc("ggcc") == 100.0, "no funciona con minúsculas"
assert porcentaje_gc("ATTA") == 0.0`,
`def porcentaje_gc(secuencia):
    s = secuencia.upper()
    return round((s.count("G") + s.count("C")) / len(s) * 100, 1)`)}
${resumen(["<code>def nombre(parametros):</code> define una función; <code>return</code> devuelve el resultado.", "Los parámetros pueden tener valores por defecto.", "<code>lambda x: ...</code> crea funciones cortas de una expresión.", "Una función recursiva se llama a sí misma y necesita un caso base."])}
${quiz("¿Qué devuelve una función que no tiene <code>return</code>?", ["0", "None", "Un error"], 1, "Toda función devuelve algo; si no hay return, devuelve <code>None</code>.")}
</div>`},

{id:9, cat:"Intermedio", title:"Funciones nativas esenciales", body:()=>`
<div class="theory">
<p>Python trae "de serie" funciones que vas a usar constantemente. Conocerlas bien te ahorra escribir mucho código manual.</p>
${codeBlock(`numeros = [4, 1, 7, 3, 9, 2]

print(len(numeros))          # cuántos elementos tiene
print(max(numeros), min(numeros))
print(sum(numeros))
print(sorted(numeros))                  # ordenada, no modifica la original
print(sorted(numeros, reverse=True))

for indice, valor in enumerate(numeros):   # índice + valor a la vez
    print(indice, "->", valor)

nombres = ["Ana", "Bea", "Carlos"]
edades = [30, 25, 40]
for nombre, edad in zip(nombres, edades):  # recorre dos listas a la vez
    print(nombre, edad)`)}
<p><code>type()</code> dice la clase exacta de un objeto; <code>isinstance()</code> comprueba si es de un tipo (o subtipo) concreto — es la forma recomendada de comprobar tipos.</p>
${codeBlock(`x = 20
print(type(x))
print(isinstance(x, int))
print(isinstance(x, (int, float)))   # ¿es int O float?`)}
${tip("<code>map(funcion, lista)</code> aplica una función a cada elemento sin escribir un bucle explícito: <code>list(map(str, [1,2,3]))</code> da <code>['1','2','3']</code>.")}
${exercise("Resumen estadístico", "Dada temperaturas = [36.5, 37.2, 38.1, 36.8, 39.0], usa funciones nativas para imprimir la máxima, la mínima y la media (sum/len), todo sin bucles manuales.",
`temperaturas = [36.5, 37.2, 38.1, 36.8, 39.0]
`,
`<p><code>max(temperaturas)</code>, <code>min(temperaturas)</code> y <code>sum(temperaturas)/len(temperaturas)</code> resuelven las tres sin necesidad de ningún <code>for</code>.</p>`)}
${codeBlock(`lista = ["a", "b", "c"]
print(list(range(len(lista))))         # funciones anidadas: índices de una lista

print(list(map(str.upper, lista)))    # aplicar una función a cada elemento
print(dir(lista)[-11:])              # métodos disponibles para una lista
print(id(lista))                      # posición en memoria`)}
${origen("8. Funciones nativas MUY IMPORTANTE.py")}
${resumen(["<code>len, max, min, sum, sorted</code> resumen colecciones sin bucles.", "<code>enumerate</code> da índice + valor; <code>zip</code> recorre varias listas en paralelo.", "<code>isinstance(x, tipo)</code> es la forma recomendada de comprobar tipos.", "<code>dir(objeto)</code> lista lo que puedes hacer con un objeto."])}
${quiz("¿Qué diferencia hay entre <code>sorted(lista)</code> y <code>lista.sort()</code>?", ["Ninguna", "sorted devuelve una lista nueva; .sort() modifica la original y devuelve None", "sort() solo funciona con números"], 1, "Un error típico es hacer <code>lista = lista.sort()</code>: la lista pasa a valer None.")}
</div>`},

{id:10, cat:"Intermedio", title:"Colecciones: listas, tuplas, sets y diccionarios", body:()=>`
<div class="theory">
<p>Cuatro estructuras clave. <b>Lista</b> (<code>[]</code>): ordenada y modificable. <b>Tupla</b> (<code>()</code>): ordenada e inmutable. <b>Set</b> (<code>{}</code>): sin orden ni duplicados. <b>Diccionario</b> (<code>{clave: valor}</code>): pares clave-valor.</p>
${codeBlock(`especies = ["humano", "ratón", "mosca"]
especies.append("levadura")
print(especies[0], especies[-1])   # primero y último

coordenadas = (40.4, -3.7)   # tupla: no se puede modificar

genes_unicos = {"BRCA1", "TP53", "BRCA1"}   # set: elimina duplicados
print(genes_unicos)

organismo = {"nombre": "E. coli", "cromosomas": 1}
print(organismo["nombre"])
organismo["dominio"] = "Bacteria"`)}
${tip("Usa listas cuando el orden importa y puede cambiar; sets cuando solo te interesa \"¿está esto o no?\" sin duplicados; diccionarios para asociar datos por nombre.")}
${warn("intentar modificar una tupla (<code>coordenadas[0] = 1</code>) — da <code>TypeError</code>, es su función: proteger datos que no deben cambiar.")}
${exercise("Diccionario de organismo", "Crea un diccionario 'organismo' con claves nombre, cromosomas y habitat. Imprime solo el valor de 'habitat'.",
`organismo = {}
`,
`<p>Se define el diccionario con las tres claves y se accede con <code>organismo["habitat"]</code>.</p>`)}
<p>Métodos que más vas a usar con cada colección:</p>
${codeBlock(`# Listas
genes = ["TP53", "BRCA1", "EGFR"]
genes.insert(0, "KRAS"); genes.remove("EGFR"); ultimo = genes.pop()
print(genes, ultimo, genes.index("TP53"))

# Tuplas: desempaquetado
lat, lon = (40.4, -3.7)
print(lat, lon)

# Sets: operaciones de conjuntos
muestra_a = {"TP53", "BRCA1", "KRAS"}
muestra_b = {"TP53", "EGFR"}
print(muestra_a & muestra_b)   # intersección
print(muestra_a | muestra_b)   # unión
print(muestra_a - muestra_b)   # diferencia

# Diccionarios: recorrer y consultar con seguridad
organismo = {"nombre": "E. coli", "cromosomas": 1}
for clave, valor in organismo.items():
    print(clave, "->", valor)
print(organismo.get("habitat", "desconocido"))`)}
${origen("4. Listas.py, 5. Tuplas.py, 6. Diccionarios.py, 7. Sets.py")}
${exercise("Genes compartidos", "Dadas dos listas de genes mutados en dos pacientes, guarda en <code>compartidos</code> un <b>set</b> con los genes que aparecen en ambos.",
`paciente1 = ["TP53", "KRAS", "BRCA1", "TP53"]
paciente2 = ["EGFR", "TP53", "KRAS"]
compartidos = set()
`,
`<p>Convertir cada lista en set elimina duplicados, y el operador <code>&</code> calcula la intersección.</p>`,
`assert compartidos == {"TP53", "KRAS"}, f"Esperaba {{'TP53', 'KRAS'}} y tengo {compartidos}"`,
`compartidos = set(paciente1) & set(paciente2)`)}
${resumen(["Lista <code>[]</code>: ordenada y modificable.", "Tupla <code>()</code>: ordenada e inmutable; ideal para desempaquetar.", "Set <code>{}</code>: sin duplicados; unión, intersección, diferencia.", "Diccionario <code>{clave: valor}</code>: acceso por nombre; <code>.get()</code> evita KeyError."])}
${quiz("¿Qué estructura usarías para guardar el número de lecturas de cada muestra (p. ej. muestra_1 → 15000)?", ["Lista", "Tupla", "Diccionario"], 2, "Cuando quieres buscar un valor por un nombre/identificador, el diccionario es la estructura natural.")}
</div>`},

{id:11, cat:"Intermedio", title:"Cadenas de texto", body:()=>`
<div class="theory">
<p>Las cadenas (str) tienen muchos métodos útiles: <code>.upper()</code>, <code>.lower()</code>, <code>.split()</code>, <code>.replace()</code>, <code>.strip()</code>, y se pueden "cortar" con slicing (<code>texto[inicio:fin]</code>).</p>
${codeBlock(`secuencia = "atgcgcgatta"
print(secuencia.upper())
print(secuencia[0:3])       # primeros 3 caracteres
print(len(secuencia))
print(secuencia.replace("a", "A"))
partes = "Homo sapiens".split(" ")
print(partes)`)}
${tip("El slicing <code>texto[a:b]</code> incluye el índice a pero NO el b — es la fuente de errores \"off-by-one\" más común.")}
${exercise("Complementaria simple", "Dado adn = 'ATGC', usa .replace() encadenado para obtener su complementaria (A↔T, G↔C). Pista: hazlo con minúsculas intermedias para no sobrescribir letras ya cambiadas.",
`adn = "ATGC"
`,
`<p>Truco clásico: <code>adn.replace("A","t").replace("T","a").replace("G","c").replace("C","g").upper()</code> — se pasa por minúsculas temporales para no confundir una A ya convertida en T con una T original.</p>`)}
${tip("¿Necesitas algo más potente que <code>replace</code> o <code>find</code>, como 'cualquier número' o 'palabras que empiecen por A'? Eso son las expresiones regulares: el siguiente módulo.")}
${exercise("Formateador de cabeceras", "A partir de la cabecera FASTA <code>cab</code>, guarda en <code>identificador</code> el texto entre los dos primeros <code>|</code> y en <code>especie</code> lo que va después de <code>OS=</code> hasta el siguiente espacio + <code>OX=</code>. Usa <code>split</code> y slicing (sin regex).",
`cab = ">sp|P04637|P53_HUMAN Cellular tumor antigen p53 OS=Homo sapiens OX=9606 GN=TP53"
identificador = ""
especie = ""
`,
`<p><code>cab.split("|")[1]</code> da el identificador. Para la especie, localiza con <code>find</code> dónde empiezan <code>"OS="</code> y <code>" OX="</code> y corta entre ambas posiciones.</p>`,
`assert identificador == "P04637", f"identificador = {identificador}"
assert especie == "Homo sapiens", f"especie = {especie}"`,
`identificador = cab.split("|")[1]
inicio = cab.find("OS=") + 3
fin = cab.find(" OX=")
especie = cab[inicio:fin]`)}
${resumen(["Las cadenas son inmutables: los métodos devuelven una cadena nueva.", "Slicing <code>s[a:b:paso]</code>; <code>s[::-1]</code> invierte.", "<code>upper, lower, strip, split, join, replace, find, count, startswith</code> resuelven la mayoría de tareas.", "<code>\"sep\".join(lista)</code> une; <code>texto.split(sep)</code> separa."])}
${quiz("¿Qué devuelve <code>\"-\".join([\"A\", \"T\", \"G\"])</code>?", ["\"ATG\"", "\"A-T-G\"", "[\"A-\", \"T-\", \"G\"]"], 1, "join pone el separador entre cada par de elementos.")}
</div>`},

{id:12, cat:"Intermedio", title:"Expresiones regulares", body:()=>`
<div class="theory">
<p>Cuando <code>.replace()</code> o <code>.find()</code> se quedan cortos, las <b>expresiones regulares</b> describen <i>patrones</i> en vez de textos fijos: "cualquier dígito", "una palabra que empiece por a", "algo con forma de correo electrónico". Se usan para limpiar datos, validar formatos, extraer información de archivos o buscar motivos en secuencias.</p>
${concepto("Las cuatro funciones del módulo re", "<code>re.sub(patrón, reemplazo, texto)</code> sustituye · <code>re.findall(patrón, texto)</code> devuelve todas las coincidencias · <code>re.search(patrón, texto)</code> devuelve la primera (o None) · <code>re.match</code> solo mira al principio del texto.")}
<h3>1. Sustituir con re.sub</h3>
${codeBlock(`import re

print(re.sub(r"Mundo", "Python", "Hola Mundo"))
print(re.sub(r"ATGC", "XXXX", "ATGCATGCATGC"))
print(re.sub(r" ", "_", "BRCA 1, BRCA 2, TP53"))
print(re.sub(r"a", "4", "banana"))

texto = "Muestra 001, Muestra 002, Muestra 003"
print(re.sub(r"\\d", "X", texto))      # \\d  = UN dígito  -> cada dígito se sustituye
print(re.sub(r"\\d+", "X", texto))     # \\d+ = uno o MÁS -> el número entero se sustituye
print(re.sub(r"\\d+", "X", "La temperatura es 25°C"))`)}
${tip("La firma completa es <code>re.sub(patrón, reemplazo, cadena, count=0)</code>: con <code>count=1</code> solo cambia la primera aparición.")}
<h3>2. Conjuntos de caracteres: [...] y [^...]</h3>
${codeBlock(`import re

print(re.sub(r"[^a-zA-Z]", "", "Secuencia@123!#"))           # [^...] = todo lo que NO esté
print(re.sub(r"[ACTG]", "*", "Adenina, Citosina, Guanina, Timina"))   # [...] = cualquiera de estos

problema = "6G1u77845i456l12345l45e978r8m12345i765t09o"
print(re.sub(r"[^a-zA-Z]", "", problema))   # lo que NO es letra -> fuera
print(re.sub(r"\\d+", "", problema))          # lo que SÍ es número -> fuera (mismo resultado)
print(re.findall(r"[^0-9]", problema))       # lista de caracteres que no son dígitos`)}
${note("Dos caminos llevan a 'Guillermito': describir lo que quieres <b>conservar</b> (<code>[^a-zA-Z]</code>, con ^ dentro de los corchetes = negación) o lo que quieres <b>eliminar</b> (<code>\\\\d+</code>). Elige el que sea más fácil de leer.")}
<h3>3. Límites de palabra y cuantificadores</h3>
${codeBlock(`import re

texto = "Hola MUNDO, COmo ESTas"
print(re.sub(r"\\b[A-Z]+\\b", "MAYUSCULA", texto))     # \\b = límite de palabra

texto = "apple and banana are fruits"
print(re.sub(r"\\b[ab]\\w*", "sustituido", texto))      # palabras que empiezan por a o b

print(re.findall(r"\\b\\w{5,}\\b", "El gen BRCA1 codifica una proteína reparadora"))   # 5 o más letras`)}
${concepto("Chuleta de metacaracteres", "<code>.</code> cualquier carácter · <code>\\\\d</code> dígito · <code>\\\\w</code> letra, número o _ · <code>\\\\s</code> espacio · <code>\\\\b</code> límite de palabra · <code>+</code> uno o más · <code>*</code> cero o más · <code>?</code> opcional · <code>{2,4}</code> entre 2 y 4 veces · <code>[ABC]</code> uno de esos · <code>[^ABC]</code> ninguno de esos · <code>^</code> inicio de línea · <code>$</code> final · <code>( )</code> grupo · <code>|</code> o.")}
<h3>4. Buscar y capturar con grupos</h3>
<p>Los paréntesis crean <b>grupos</b>: además de encontrar la coincidencia completa, extraen sus partes por separado.</p>
${codeBlock(`import re

texto = """juan@gmail.com, maria@yahoo.com, laura@universidad.edu,
elena@dominio.es, luis@startup.io, ignacio@global.solutions"""

patron = r"([\\w.-]+)@([\\w.-]+\\.\\w+)"     # grupo 1 = usuario, grupo 2 = dominio

m = re.search(patron, texto)                # solo la PRIMERA coincidencia
if m:
    print("Completo:", m[0], "| usuario:", m[1], "| dominio:", m.group(2))

for usuario, dominio in re.findall(patron, texto):   # con grupos, findall devuelve tuplas
    print(f"{usuario:10s} -> {dominio}")`)}
${codeBlock(`import re
# Grupos con nombre: más legibles
m = re.search(r"(?P<gen>[A-Z0-9]+)_(?P<muestra>M\\d+)_(?P<lectura>R[12])", "TP53_M07_R1.fastq.gz")
print(m["gen"], m["muestra"], m["lectura"])
print(m.groupdict())`)}
<h3>5. Texto largo y archivos reales</h3>
${codeBlock(`import re

quijote = """—¡Ay, señora, no me hagáis decir más de lo que me duele! —dijo Don Quijote—.
No sé por qué me hacéis callar cuando sólo me quejo de no haber cumplido
con el deber que mi corazón me exige en favor de la bella Dulcinea del Toboso."""

print(re.sub(r"del Toboso", "de México", quijote))
print("Palabras con tilde:", re.findall(r"\\w*[áéíóú]\\w*", quijote))`)}
<p>Un uso clásico en bioinformática: filtrar las líneas de un archivo PDB que empiezan por <code>ATOM</code> (con <code>^</code>) y sacar de ellas el elemento y las coordenadas, para después dibujar la proteína en 3D.</p>
${codeBlock(`import re
from collections import Counter

atomos, x, y, z = [], [], [], []
with open("1TUP_cadenaB.pdb") as f:
    for linea in f:
        if re.search(r"^ATOM", linea):
            atomos.append(linea[76:78].strip())   # elemento químico (columnas 77-78)
            x.append(float(linea[30:38]))          # coordenadas: columnas de ancho fijo
            y.append(float(linea[38:46]))
            z.append(float(linea[46:54]))

print(len(atomos), "átomos")
print(Counter(atomos))`)}
${codeBlock(`import matplotlib.pyplot as plt

colores_por_elemento = {"N": "blue", "C": "gray", "O": "red", "S": "gold", "P": "orange"}
colores = [colores_por_elemento.get(e, "black") for e in atomos]

fig = plt.figure(figsize=(7, 6))
ax = fig.add_subplot(111, projection="3d")
ax.scatter(x, y, z, s=6, c=colores)
ax.set_xlabel("X (Å)"); ax.set_ylabel("Y (Å)"); ax.set_zlabel("Z (Å)")
ax.set_title("p53 (1TUP, cadena B) coloreada por elemento")
plt.show()`)}
${warn("en el script original las coordenadas se sacaban con <code>linea.split()[-6]</code>. Funciona casi siempre, pero el formato PDB es de <b>columnas fijas</b>: cuando una coordenada negativa larga se 'pega' a la anterior (p. ej. <code>-100.123-45.678</code>), <code>split()</code> une dos campos y todo se desplaza. Por eso aquí se usa <code>linea[30:38]</code>.")}
${origen("clase_3/metacaracteres.py y Ejemplos_math_y_re.py")}
${tip("Escribe siempre los patrones como <i>raw strings</i>: <code>r\"\\\\d+\"</code>. Sin la r, Python interpreta antes las barras invertidas (<code>\"\\\\b\"</code> sería un carácter de retroceso).")}
${exercise("El mensaje oculto", "En <code>problema</code> hay un nombre escondido entre números. Usa <code>re.sub</code> para eliminar todo lo que no sea una letra y guarda el resultado en <code>nombre</code>.",
`import re
problema = "6G1u77845i456l12345l45e978r8m12345i765t09o"
nombre = ""
`,
`<p>El patrón <code>[^a-zA-Z]</code> significa "cualquier carácter que no sea una letra"; sustituirlo por cadena vacía deja solo las letras.</p>`,
`assert nombre == "Guillermito", f"Esperaba 'Guillermito' y obtuve '{nombre}'"`,
`nombre = re.sub(r"[^a-zA-Z]", "", problema)`)}
${exercise("Dianas de restricción", "Guarda en <code>posiciones</code> una lista con la posición de inicio de <b>todas</b> las dianas de EcoRI (<code>GAATTC</code>) en <code>adn</code>, y en <code>ids</code> los identificadores de muestra (formato <code>M</code> + dígitos) que aparecen en <code>cabeceras</code>. Pista: <code>re.finditer</code> devuelve objetos con <code>.start()</code>.",
`import re
adn = "TTGAATTCAGGCTAGAATTCCGTAGAATTCA"
cabeceras = ">gen1_M12_R1 >gen2_M7_R2 >control >gen5_M103_R1"
posiciones = []
ids = []
`,
`<p><code>[m.start() for m in re.finditer("GAATTC", adn)]</code> recorre todas las coincidencias. Para los ids, <code>re.findall(r"M\\\\d+", cabeceras)</code>.</p>`,
`assert posiciones == [2, 14, 24], f"Esperaba [2, 14, 24] y tienes {posiciones}"
assert ids == ["M12", "M7", "M103"], f"Esperaba ['M12', 'M7', 'M103'] y tienes {ids}"`,
`posiciones = [m.start() for m in re.finditer(r"GAATTC", adn)]
ids = re.findall(r"M\\d+", cabeceras)`)}
${resumen(["<code>re.sub</code> sustituye, <code>re.findall</code> lista todas, <code>re.search</code> devuelve la primera, <code>re.finditer</code> da posiciones.", "<code>[...]</code> cualquiera de estos; <code>[^...]</code> ninguno de estos.", "<code>\\\\d \\\\w \\\\s \\\\b</code> y los cuantificadores <code>+ * ? {n,m}</code> son la base de casi todos los patrones.", "Los paréntesis crean grupos: <code>m[1]</code>, <code>m.group(2)</code>, <code>(?P&lt;nombre&gt;...)</code>.", "Usa raw strings <code>r\"...\"</code>."])}
${quiz("¿Qué devuelve <code>re.findall(r\"\\\\d+\", \"a12b3c456\")</code>?", ["['1','2','3','4','5','6']", "['12','3','456']", "'123456'"], 1, "<code>\\\\d+</code> agrupa dígitos consecutivos en una sola coincidencia.")}
${quiz("¿Qué hace el <code>^</code> en <code>[^0-9]</code> y en <code>^ATOM</code>?", ["Lo mismo en los dos casos", "Dentro de corchetes niega el conjunto; fuera indica el inicio de la línea", "En ambos casos significa 'elevado a'"], 1, "Es uno de los metacaracteres con doble significado según dónde aparezca.")}
</div>`},

{id:13, cat:"Intermedio", title:"Módulos y librerías estándar: math, random y os", body:()=>`
<div class="theory">
<p>Un módulo es un archivo de Python con código reutilizable; un paquete es una colección de módulos. Se importan con <code>import</code>. La librería estándar ya trae módulos útiles como <code>math</code>, <code>random</code> o <code>datetime</code>.</p>
${codeBlock(`import math
import random

print(math.sqrt(16))
print(random.randint(1, 6))

from statistics import mean
print(mean([2, 4, 6, 8]))`)}
${tip("<code>from modulo import funcion</code> te permite usar <code>funcion()</code> directamente, sin escribir <code>modulo.funcion()</code>.")}
${exercise("Números al azar", "Importa random y genera una lista de 5 números aleatorios entre 1 y 100 usando random.randint dentro de un bucle.",
`import random
`,
`<p><code>[random.randint(1,100) for _ in range(5)]</code> genera la lista en una sola línea (comprensión de lista — módulo 17).</p>`)}
<h3>Librerías estándar que usarás a diario</h3>
${codeBlock(`import math
print(math.sqrt(81), math.factorial(5), math.gcd(48, 18))
print(math.log(100, 10), math.pi, round(math.sin(math.pi / 2)))

# Media geométrica (útil para ratios de expresión)
valores = [2, 8, 4]
print(math.prod(valores) ** (1 / len(valores)))`)}
${codeBlock(`import random
random.seed(42)                         # misma semilla = mismos resultados (reproducibilidad)
print(random.random())                  # float entre 0 y 1
print(random.randint(1, 6))             # entero entre 1 y 6 (ambos incluidos)
print(random.choice(["A", "T", "G", "C"]))
print(random.sample(range(100), 5))     # 5 elementos sin repetir
cartas = [1, 2, 3, 4, 5]
random.shuffle(cartas)                  # baraja la lista en su sitio
print(cartas)
adn = "".join(random.choice("ATGC") for _ in range(30))
print(adn)`)}
${codeBlock(`import os
print(os.getcwd())                       # directorio de trabajo
print(os.listdir())                      # archivos disponibles (¡los datos del curso!)
os.makedirs("resultados", exist_ok=True)
print(os.path.exists("resultados"), os.path.isdir("resultados"))

for archivo in os.listdir():
    nombre, extension = os.path.splitext(archivo)
    print(f"{nombre:22s} {extension}")

ruta = os.path.join("resultados", "informe.txt")   # une rutas de forma portable
print(ruta)`)}
<h3>Más aleatoriedad: con y sin reemplazo</h3>
${codeBlock(`import random
random.seed(7)

print(random.randrange(0, 10, 2))          # entero de range(0, 10, 2): 0, 2, 4, 6 u 8
print(round(random.uniform(0, 10), 3))     # float entre 0 y 10
print(random.choices(["a", "b", "c"], k=5))   # CON reemplazo: puede repetir, k puede ser > 3
print(random.sample(["a", "b", "c"], k=3))    # SIN reemplazo: no repite, k como máximo 3
print(random.choices("ATGC", weights=[0.4, 0.4, 0.1, 0.1], k=20))   # con probabilidades

aleatorios = [random.randint(1, 100) for _ in range(10)]   # _ = variable que no vamos a usar
print(sorted(aleatorios, reverse=True))`)}
${concepto("Con o sin reemplazo", "<code>choices</code> devuelve cada elemento a la bolsa tras sacarlo (simula, por ejemplo, lecturas de secuenciación); <code>sample</code> no (simula, por ejemplo, elegir 3 pacientes distintos de una cohorte).")}
${warn("copiar fragmentos de un script sin las líneas que definen sus variables. En <code>Ejemplos_math_y_re.py</code>, <code>print(eleccion_con_reemplazo)</code> da <code>NameError</code> porque esa variable nunca se creó; y en <code>libreria_os_directorios.py</code> se guarda la ruta en <code>path</code> pero se imprime <code>current_directory</code>. Ejecuta tus scripts de arriba abajo en una sesión limpia antes de darlos por buenos.")}
<h3>Gestionar archivos y carpetas con os</h3>
${codeBlock(`import os

with open("Ejemplo1.txt", "w") as f:            # creamos un archivo de prueba
    f.write("hola\\n")
open("archivo_vacio.csv", "w").close()            # archivo vacío

os.rename("Ejemplo1.txt", "Ejemplo2.txt")         # renombrar
print("Tras renombrar:", [a for a in os.listdir() if a.startswith("Ejemplo")])

os.mkdir("Directorio")                            # crear carpeta (falla si ya existe)
print("¿Es carpeta?", os.path.isdir("Directorio"))
os.rmdir("Directorio")                            # borrar carpeta (debe estar vacía)

ruta = os.path.join(os.getcwd(), "archivo_vacio.csv")
carpeta, archivo = os.path.split(ruta)            # separar carpeta y nombre de archivo
print("Carpeta:", carpeta, "| archivo:", archivo)
print("¿Es archivo?", os.path.isfile(ruta), "| ¿existe?", os.path.exists(ruta))
print("Tamaño de Planetas.txt:", os.path.getsize("Planetas.txt"), "bytes")

os.remove("Ejemplo2.txt")                         # borrar archivo (¡sin papelera!)
print("¿Sigue existiendo?", os.path.exists("Ejemplo2.txt"))`)}
${warn("<code>os.remove</code> y <code>os.rmdir</code> borran de verdad, sin pasar por la papelera. Y <code>os.chdir(r'C:\\\\Users\\\\...')</code> con rutas absolutas hace que tu script solo funcione en tu ordenador: usa rutas relativas o <code>os.path.join</code>.")}
${tip("La alternativa moderna a <code>os.path</code> es <code>pathlib</code>: <code>from pathlib import Path; p = Path('datos') / 'muestra.fasta'; p.exists(); p.suffix</code>.")}
${codeBlock(`import math

print(math.pow(4, 4), 4 ** 4)              # pow devuelve siempre float
print(round(math.log(10), 4), math.log10(1000), math.log2(8))   # natural, base 10, base 2
print(math.gcd(48, 180))                    # máximo común divisor

numeros = [4, 8, 16, 32, 64]
producto = math.prod(numeros)
media_geometrica = math.pow(producto, 1 / len(numeros))   # = producto ** (1/n)
print(f"Producto {producto} -> media geométrica {media_geometrica:.1f}")
print("Media aritmética:", sum(numeros) / len(numeros))`)}
${note("La media geométrica (16) es mucho menor que la aritmética (24,8) porque no se deja arrastrar por los valores grandes: por eso se usa con datos multiplicativos, como fold-changes o tasas de crecimiento.")}
${origen("clase_3/libreria math.py, libreria random.py y libreria_os_directorios.py")}
${tip("En esta web, <code>os</code> trabaja sobre un disco virtual que incluye los archivos de datos del curso (FASTA, FASTQ, PDB, CSV...). En tu ordenador funcionará igual sobre tus carpetas reales.")}
${exercise("Simulador de secuencias", "Con <code>random.seed(1)</code>, genera una secuencia aleatoria de ADN de 50 bases en la variable <code>secuencia</code> (usa <code>random.choice</code>).",
`import random
random.seed(1)
secuencia = ""
`,
`<p>Una comprensión dentro de <code>"".join()</code> crea las 50 bases y las une en una sola cadena.</p>`,
`assert len(secuencia) == 50, f"La secuencia tiene {len(secuencia)} bases, no 50"
assert set(secuencia) <= set("ATGC"), "Hay caracteres que no son A, T, G o C"`,
`secuencia = "".join(random.choice("ATGC") for _ in range(50))`)}
${resumen(["<code>import modulo</code>, <code>from modulo import nombre</code>, <code>import modulo as alias</code>.", "<code>math</code>: funciones matemáticas; <code>random</code>: aleatoriedad (usa <code>seed</code> para reproducir).", "<code>os</code> y <code>os.path</code>: carpetas, rutas y archivos.", "Las librerías externas se instalan con <code>pip install nombre</code>."])}
${quiz("¿Para qué sirve <code>random.seed(42)</code>?", ["Para generar números más aleatorios", "Para que la secuencia de números aleatorios sea siempre la misma", "Para limitar los números a 42"], 1, "Fijar la semilla hace los análisis reproducibles: alguien que ejecute tu código obtendrá los mismos resultados.")}
</div>`},

{id:14, cat:"Intermedio", title:"Manejo de errores y excepciones", body:()=>`
<div class="theory">
<p><code>try/except</code> permite capturar errores en tiempo de ejecución sin que el programa se detenga bruscamente.</p>
${codeBlock(`valores = ["10", "20", "abc", "30"]
total = 0
for v in valores:
    try:
        total += int(v)
    except ValueError:
        print(f"'{v}' no es un número, se omite")
print("Total:", total)`)}
${tip("Captura excepciones específicas (<code>ValueError</code>, <code>ZeroDivisionError</code>...) en vez de un <code>except:</code> genérico — así no ocultas errores inesperados.")}
${warn("usar try/except para ignorar silenciosamente cualquier error sin registrar qué pasó — dificulta muchísimo depurar más tarde.")}
${exercise("División segura", "Escribe una función dividir_seguro(a, b) que devuelva a/b, y capture ZeroDivisionError devolviendo None en ese caso.",
`def dividir_seguro(a, b):
    pass
`,
`<p>Dentro de un <code>try</code> se hace <code>return a / b</code>; en el <code>except ZeroDivisionError:</code> se hace <code>return None</code>.</p>`)}
<p><code>finally</code> añade un bloque que se ejecuta siempre, haya habido error o no — ideal para tareas de limpieza (cerrar un archivo, una conexión...).</p>
${codeBlock(`def analizar(valor):
    try:
        resultado = 100 / valor
    except ZeroDivisionError:
        print("No se puede dividir entre 0")
        resultado = None
    finally:
        print("Análisis terminado para", valor)
    return resultado

print(analizar(5))
print(analizar(0))`)}
${codeBlock(`message = {200: "OK", 400: "Bad Request", 404: "Not Found", 500: "Error del servidor"}

def describir_estado(codigo):
    try:
        return message[codigo]
    except KeyError:
        return f"Código {codigo} desconocido"

print(describir_estado(404))
print(describir_estado(418))

# Lanzar tus propias excepciones
def validar_secuencia(seq):
    invalidos = set(seq.upper()) - set("ATGC")
    if invalidos:
        raise ValueError(f"Caracteres no válidos: {invalidos}")
    return True

try:
    validar_secuencia("ATGXCZ")
except ValueError as e:
    print("Error capturado:", e)`)}
${origen("13. Try except finally.py y UNIPROT API.py (diccionario de códigos HTTP)")}
${resumen(["<code>try</code> contiene el código que puede fallar; <code>except Tipo</code> lo gestiona.", "<code>else</code> se ejecuta si no hubo error; <code>finally</code> siempre.", "<code>raise</code> lanza tus propias excepciones con un mensaje claro.", "Excepciones comunes: ValueError, TypeError, KeyError, IndexError, ZeroDivisionError, FileNotFoundError."])}
${quiz("¿Qué excepción se produce con <code>[1, 2, 3][5]</code>?", ["KeyError", "IndexError", "ValueError"], 1, "Acceder a una posición que no existe en una lista o cadena da <code>IndexError</code>; KeyError es para claves de diccionario.")}
</div>`},

{id:15, cat:"Intermedio", title:"Archivos", body:()=>`
<div class="theory">
<p>Tarde o temprano tus datos vivirán en archivos: secuencias FASTA, tablas CSV, resultados de un análisis... Python los abre con <code>open()</code>, idealmente dentro de un bloque <code>with</code> que los cierra automáticamente al terminar, incluso si ocurre un error. Modos comunes: <code>"r"</code> leer (por defecto), <code>"w"</code> escribir (sobrescribe), <code>"a"</code> añadir al final.</p>
${tip("Usa <code>os.listdir()</code> (módulo 13) para ver los archivos de datos del curso disponibles en el disco virtual de esta web.")}
<p><b>Novedad:</b> ahora esta web tiene un disco virtual con archivos reales del curso, así que puedes leer y escribir archivos de verdad:</p>
${codeBlock(`with open("secuencias.txt", "w") as f:
    f.write("ATGCGC\\n")
    f.write("TTAGCC\\n")

with open("secuencias.txt", "a") as f:     # "a" añade al final
    f.write("GGATCC\\n")

with open("secuencias.txt") as f:
    for numero, linea in enumerate(f, start=1):
        print(numero, linea.strip())`)}
${codeBlock(`# Leer un FASTA "a mano" (sin Biopython)
with open("P04637.fasta") as f:
    lineas = f.read().splitlines()

cabecera = lineas[0]
secuencia = "".join(lineas[1:])
print("Cabecera:", cabecera)
print("Longitud:", len(secuencia), "aminoácidos")`)}
${codeBlock(`# Leer un CSV línea a línea
with open("Planetas.txt") as f:
    cabecera = f.readline().strip().split(",")
    for linea in f:
        campos = linea.strip().split(",")
        print(f"{campos[0]:10s} masa={campos[1]:>8s}  lunas={campos[18]}")`)}
${origen("18. Crear y editar txt.py")}
${exercise("Contar lecturas de un FASTQ", "Un archivo FASTQ guarda cada lectura en 4 líneas (identificador, secuencia, '+', calidades). Abre <code>ejemplo.fastq</code> y guarda en <code>n_lecturas</code> cuántas lecturas contiene.",
`n_lecturas = 0
`,
`<p>Basta con contar las líneas y dividir entre 4 (o contar las líneas que ocupan la posición 0, 4, 8... de cada bloque).</p>`,
`assert n_lecturas == 30, f"El archivo tiene 30 lecturas, tu resultado es {n_lecturas}"`,
`with open("ejemplo.fastq") as f:
    n_lecturas = len(f.read().strip().split("\\n")) // 4
print(n_lecturas)`)}
${resumen(["Usa siempre <code>with open(ruta, modo) as f:</code>.", "Modos: <code>'r'</code> leer, <code>'w'</code> sobrescribir, <code>'a'</code> añadir.", "<code>f.read()</code>, <code>f.readline()</code>, <code>for linea in f</code>; <code>.strip()</code> quita el salto de línea.", "Para CSV y tablas, en la práctica usarás pandas (módulos 23 y 24)."])}
${quiz("Abres un archivo existente con modo <code>'w'</code>. ¿Qué pasa con su contenido?", ["Se conserva y escribes al final", "Se borra al abrirlo", "Da error porque ya existe"], 1, "<code>'w'</code> trunca el archivo. Si quieres conservar el contenido usa <code>'a'</code>.")}
</div>`},

{id:16, cat:"Avanzado", title:"Programación orientada a objetos", body:()=>`
<div class="theory">
<p>Una clase es un molde para crear objetos que agrupan datos (atributos) y comportamiento (métodos). <code>__init__</code> es el constructor.</p>
${codeBlock(`class Organismo:
    def __init__(self, nombre, cromosomas):
        self.nombre = nombre
        self.cromosomas = cromosomas

    def describir(self):
        return f"{self.nombre} tiene {self.cromosomas} cromosomas"

humano = Organismo("Homo sapiens", 46)
mosca = Organismo("Drosophila", 8)
print(humano.describir())
print(mosca.describir())`)}
${tip("<code>self</code> es una referencia al propio objeto — es el primer parámetro de todo método, aunque no lo pases explícitamente al llamarlo.")}
${exercise("Clase Gen", "Crea una clase Gen con atributos nombre y longitud, y un método es_largo() que devuelva True si longitud > 1000.",
`class Gen:
    pass
`,
`<p><code>__init__(self, nombre, longitud)</code> guarda ambos atributos; <code>es_largo(self)</code> devuelve <code>self.longitud > 1000</code>.</p>`)}
<h3>Herencia: reutilizar y especializar clases</h3>
<p>Una clase puede <b>heredar</b> de otra: recibe todos sus atributos y métodos y puede añadir nuevos o <b>sobrescribir</b> los existentes. <code>super()</code> llama a la versión de la clase padre.</p>
${codeBlock(`class Proteina:
    def __init__(self, nombre, secuencia, masa_molecular):
        self.nombre = nombre
        self.secuencia = secuencia
        self.masa_molecular = masa_molecular   # en daltons

    def mostrar_informacion(self):
        return f"Nombre: {self.nombre}, Masa: {self.masa_molecular} Da"

class ProteinaEnzima(Proteina):                 # hereda de Proteina
    def __init__(self, nombre, secuencia, masa_molecular, actividad, pH_optimo):
        super().__init__(nombre, secuencia, masa_molecular)
        self.actividad = actividad
        self.pH_optimo = pH_optimo

    def mostrar_informacion(self):              # sobrescribe el método del padre
        return f"{super().mostrar_informacion()}, Actividad: {self.actividad}, pH óptimo: {self.pH_optimo}"

    def es_optimo(self, pH, tolerancia=0.5):
        return abs(pH - self.pH_optimo) <= tolerancia

    def __repr__(self):                         # cómo se ve al hacer print(objeto)
        return f"<Enzima {self.nombre} | pH {self.pH_optimo}>"

lactasa = ProteinaEnzima("Lactasa", "ALPHA-BETA", 67000, "Hidroliza lactosa", 6.0)
print(lactasa.mostrar_informacion())
print(lactasa.es_optimo(6.2), lactasa.es_optimo(7.5))
print(lactasa)
print(isinstance(lactasa, Proteina), isinstance(lactasa, ProteinaEnzima))`)}
${origen("CLASES.py")}
${note("En el script original, <code>ajustar_actividad</code> usaba <code>nuevo_pH % self.pH_optimo</code> para decidir si el pH era óptimo. Con pH 7 y óptimo 6, el resto es 1 → 'no óptimo', pero con pH 12 el resto es 0 → '¡óptimo!'. Aquí se reescribe con <code>abs(pH - óptimo) &lt;= tolerancia</code>, que expresa correctamente la idea de cercanía.")}
${concepto("Métodos especiales", "<code>__init__</code> (constructor), <code>__repr__</code>/<code>__str__</code> (representación como texto), <code>__len__</code> (permite <code>len(obj)</code>), <code>__eq__</code> (permite <code>==</code>).")}
${exercise("Clase Secuencia", "Crea una clase <code>Secuencia</code> con atributo <code>seq</code> (guardado en mayúsculas), un método <code>gc()</code> que devuelva el % de GC y un método especial <code>__len__</code> para que <code>len(obj)</code> funcione.",
`class Secuencia:
    pass
`,
`<p>En <code>__init__</code> se guarda <code>seq.upper()</code>; <code>gc()</code> reutiliza la fórmula del módulo 8, y <code>__len__</code> simplemente devuelve <code>len(self.seq)</code>.</p>`,
`s = Secuencia("atgc")
assert s.seq == "ATGC", "seq debe guardarse en mayúsculas"
assert len(s) == 4, "len(s) debería ser 4"
assert abs(s.gc() - 50) < 0.01, "gc() de ATGC debería ser 50"`,
`class Secuencia:
    def __init__(self, seq):
        self.seq = seq.upper()
    def gc(self):
        return (self.seq.count("G") + self.seq.count("C")) / len(self.seq) * 100
    def __len__(self):
        return len(self.seq)`)}
${resumen(["Una clase define atributos (datos) y métodos (comportamiento).", "<code>self</code> es el propio objeto; <code>__init__</code> lo inicializa.", "La herencia <code>class Hija(Padre)</code> reutiliza código; <code>super()</code> llama al padre.", "Biopython, pandas o RDKit están construidos con clases: <code>Seq</code>, <code>DataFrame</code>, <code>Mol</code>..."])}
${quiz("En <code>class ProteinaEnzima(Proteina)</code>, ¿qué hace <code>super().__init__(...)</code>?", ["Crea un objeto Proteina independiente", "Ejecuta el constructor del padre sobre el objeto actual", "Borra los atributos del padre"], 1, "Reutiliza la inicialización del padre (nombre, secuencia, masa) para no repetir código.")}
</div>`},

{id:17, cat:"Avanzado", title:"Comprensiones, iteradores y generadores", body:()=>`
<div class="theory">
<p>Las comprensiones de lista crean listas en una sola línea: <code>[expresión for elemento in secuencia if condición]</code>. Los generadores (<code>yield</code>) producen valores uno a uno, sin guardar todo en memoria.</p>
${codeBlock(`cuadrados = [x**2 for x in range(10) if x % 2 == 0]
print(cuadrados)

def contar_hasta(n):
    i = 1
    while i <= n:
        yield i
        i += 1

for numero in contar_hasta(5):
    print(numero)`)}
${tip("Usa comprensiones cuando la transformación es simple y cabe en una línea; si necesitas varias líneas de lógica, mejor un bucle for normal — es más legible.")}
${exercise("Filtrar longitudes", "Dada la lista secuencias = ['ATG','ATGCGT','AT','ATGCGTAA'], crea una comprensión con las secuencias de longitud mayor a 3.",
`secuencias = ["ATG","ATGCGT","AT","ATGCGTAA"]
`,
`<p><code>[s for s in secuencias if len(s) > 3]</code> recorre la lista y se queda solo con las que cumplen la condición.</p>`)}
${codeBlock(`secuencia = "MEEPQSDPSVEPPLSQETFSDLWKLLPENNVLSPLPSQAMDDLMLSPDDIEQWFTEDPGP"

# Comprensión de diccionario: frecuencia de cada aminoácido
conteo = {aa: secuencia.count(aa) for aa in set(secuencia)}
top5 = sorted(conteo.items(), key=lambda par: par[1], reverse=True)[:5]
print(top5)

# Comprensión de set y comprensión con if/else
hidrofobicos = {aa for aa in secuencia if aa in "AVILMFWP"}
etiquetas = ["H" if aa in "AVILMFWP" else "-" for aa in secuencia[:20]]
print(hidrofobicos)
print("".join(etiquetas))`)}
${origen("14. Comprhensions.py y UNIPROT API.py (conteo de aminoácidos)")}
${concepto("¿Por qué generadores?", "una lista de 100 millones de números ocupa gigas de memoria; un generador produce cada valor cuando se le pide. Por eso <code>range()</code>, la lectura de archivos línea a línea o <code>SeqIO.parse()</code> de Biopython funcionan así.")}
${codeBlock(`def leer_codones(seq):
    for i in range(0, len(seq) - 2, 3):
        yield seq[i:i+3]

gen = leer_codones("ATGGCCTAA")
print(next(gen), next(gen), next(gen))

suma = sum(x**2 for x in range(1_000_000))   # expresión generadora: sin crear la lista
print(suma)`)}
${resumen(["Lista: <code>[expr for x in it if cond]</code>; set: <code>{...}</code>; diccionario: <code>{k: v for ...}</code>.", "<code>expr if cond else otra</code> va delante del for; el filtro <code>if</code> va detrás.", "<code>yield</code> crea generadores que producen valores bajo demanda.", "<code>next()</code> pide el siguiente valor a un iterador."])}
${quiz("¿Cuál es correcta para obtener los cuadrados de los números pares de 0 a 9?", ["[x**2 if x % 2 == 0 for x in range(10)]", "[x**2 for x in range(10) if x % 2 == 0]", "[for x in range(10): x**2]"], 1, "El filtro va al final. Un <code>if</code> delante del <code>for</code> exige también un <code>else</code>.")}
</div>`},

{id:18, cat:"Avanzado", title:"Pruebas y depuración", body:()=>`
<div class="theory">
<p>Depurar es encontrar por qué el código no hace lo esperado. Herramientas clave: leer el mensaje de error completo (el traceback), usar <code>print()</code> para inspeccionar valores intermedios, y escribir pequeñas pruebas con <code>assert</code>.</p>
${codeBlock(`def cuadrado(n):
    return n * n

assert cuadrado(3) == 9, "cuadrado(3) debería ser 9"
assert cuadrado(0) == 0
print("Todas las pruebas pasaron")

def es_primo(n):
    for i in range(2, n):
        print(f"probando divisor {i}")
        if n % i == 0:
            return False
    return n > 1

print(es_primo(7))`)}
${tip("Lee el traceback de abajo hacia arriba: la última línea suele decirte el error exacto y en qué línea de tu código ocurrió.")}
${note("assert es ideal para comprobaciones rápidas mientras desarrollas; para proyectos serios se usan librerías como pytest.")}
<h3>Eficiencia: no todos los algoritmos son iguales</h3>
<p>La <b>complejidad</b> describe cómo crece el tiempo de un algoritmo con el tamaño de los datos. Una búsqueda lineal revisa elemento a elemento: O(n). Una búsqueda binaria, sobre una lista <b>ordenada</b>, descarta la mitad en cada paso: O(log n).</p>
${codeBlock(`from time import time

def busqueda_lineal(lista, objetivo):
    for i in range(len(lista)):
        if lista[i] == objetivo:
            return i
    return -1

def busqueda_binaria(lista, objetivo):
    izquierda, derecha = 0, len(lista) - 1
    while izquierda <= derecha:
        medio = (izquierda + derecha) // 2
        if lista[medio] == objetivo:
            return medio
        elif lista[medio] < objetivo:
            izquierda = medio + 1
        else:
            derecha = medio - 1
    return -1

datos = list(range(2_000_000))
for funcion in (busqueda_lineal, busqueda_binaria):
    t = time()
    pos = funcion(datos, 1_500_000)
    print(f"{funcion.__name__:18s} -> posición {pos} en {time() - t:.5f} s")`)}
${origen("Script19.py")}
${exercise("Encuentra el bug", "Este código (adaptado del script original) pretende medir la búsqueda binaria, pero los tiempos salen casi iguales que en la lineal. Encuentra y corrige el error para que <code>resultado</code> se calcule con la función correcta.",
`def busqueda_lineal(lista, objetivo):
    for i in range(len(lista)):
        if lista[i] == objetivo:
            return i
    return -1

def busqueda_binaria(lista, objetivo):
    izq, der = 0, len(lista) - 1
    while izq <= der:
        medio = (izq + der) // 2
        if lista[medio] == objetivo: return medio
        elif lista[medio] < objetivo: izq = medio + 1
        else: der = medio - 1
    return -1

# --- código auxiliar para la autocorrección (no lo toques) ---
llamadas = []
_original = busqueda_binaria
def busqueda_binaria(lista, objetivo):
    llamadas.append("binaria")
    return _original(lista, objetivo)
# -------------------------------------------------------------

l1 = list(range(100000))
resultado = busqueda_lineal(l1, 50000)   # <- ¿qué función debería usarse aquí?
print(resultado)
`,
`<p>El script original definía <code>busqueda_binaria</code> pero, en la segunda medición, volvía a llamar a <code>busqueda_lineal</code>. Es un error muy habitual al copiar y pegar bloques: el código no falla, pero mide otra cosa. Leer con atención y añadir comprobaciones (como el registro de <code>llamadas</code>) ayuda a detectarlo.</p>`,
`assert resultado == 50000, "El resultado debería ser 50000"
assert "binaria" in llamadas, "No se ha llamado a busqueda_binaria"`)}
${tip("Antes de optimizar, mide. Python trae el módulo <code>time</code> y, en Jupyter, la orden mágica <code>%timeit</code>.")}
${resumen(["Lee el traceback de abajo hacia arriba: la última línea dice qué falló.", "<code>assert condicion, \"mensaje\"</code> comprueba supuestos; pytest automatiza las pruebas.", "Hay errores que no lanzan excepción (bugs lógicos): compruébalos con casos conocidos.", "O(n) vs O(log n): el algoritmo importa más que la velocidad del ordenador."])}
${quiz("¿Qué requisito tiene la búsqueda binaria?", ["Que la lista no tenga duplicados", "Que la lista esté ordenada", "Que la lista tenga un número par de elementos"], 1, "Solo descartando la mitad 'menor' o 'mayor' tiene sentido si los datos están ordenados.")}
</div>`},

{id:19, cat:"Avanzado", title:"Proyectos prácticos para integrar lo aprendido", body:()=>`
<div class="theory">
<p>Ahora toca combinar todo. Tres mini-proyectos de dificultad creciente — inténtalos sin mirar la solución primero.</p>
${exercise("Proyecto 1: Contador de nucleótidos", "Dada una secuencia de ADN, cuenta cuántas veces aparece cada base (A, T, G, C) usando un diccionario.",
`secuencia = "ATGCGCTATCGATCGATCGGCTA"
conteo = {}
`,
`<p>Se recorre la secuencia con un <code>for</code>; para cada base, si ya está en el diccionario se suma 1, si no se inicializa a 1 (o <code>conteo[b] = conteo.get(b,0)+1</code>).</p>`)}
${exercise("Proyecto 2: Traductor simple", "Escribe código que, dado un diccionario codon->aminoácido y una secuencia de longitud múltiplo de 3, la traduzca codón a codón.",
`tabla = {"ATG":"Met", "TTT":"Phe"}
secuencia = "ATGTTT"
`,
`<p>Se recorre la secuencia en pasos de 3 con <code>range(0, len(secuencia), 3)</code>, se extrae cada codón con slicing y se busca en la tabla.</p>`)}
${exercise("Proyecto 3: Clase Laboratorio", "Crea una clase Muestra con nombre y concentracion, y filtra las que tengan concentracion > 50 con una comprensión de lista.",
`class Muestra:
    def __init__(self, nombre, concentracion):
        self.nombre = nombre
        self.concentracion = concentracion

muestras = [Muestra("A", 30), Muestra("B", 75), Muestra("C", 60)]
`,
`<p><code>[m.nombre for m in muestras if m.concentracion > 50]</code> combina POO con comprensiones de lista.</p>`)}
${note("¡Enhorabuena por llegar hasta aquí! Revisa tu certificado en el menú lateral.")}
${exercise("Proyecto 4: Buscador de ORFs", "Un ORF (marco abierto de lectura) empieza en ATG y termina en el primer codón de parada en el mismo marco (TAA, TAG, TGA). Completa <code>encontrar_orfs(seq, min_len)</code> para que devuelva una lista de tuplas <code>(inicio, fin)</code> de los ORFs con longitud ≥ min_len.",
`def encontrar_orfs(seq, min_len=30):
    orfs = []
    # Recorre cada posición; si hay un ATG, avanza de 3 en 3 hasta un stop
    return orfs

adn = "CCATGAAACCCGGGTTTTAGCCATGCCCTAAGG"
print(encontrar_orfs(adn, min_len=9))
`,
`<p>Doble bucle: el exterior busca cada ATG; el interior avanza de 3 en 3 desde ahí y, al encontrar el primer stop, guarda el ORF (si es lo bastante largo) y hace <code>break</code>. Es el mismo algoritmo de la clase de Biopython, que en el módulo 28 traduciremos a proteína.</p>`,
`r = encontrar_orfs("CCATGAAACCCGGGTTTTAGCCATGCCCTAAGG", min_len=9)
assert (2, 20) in r, f"Falta el ORF (2, 20). Tu resultado: {r}"
assert (22, 31) in r, f"Falta el ORF (22, 31). Tu resultado: {r}"`,
`def encontrar_orfs(seq, min_len=30):
    orfs = []
    for i in range(len(seq) - 2):
        if seq[i:i+3] == "ATG":
            for j in range(i + 3, len(seq) - 2, 3):
                if seq[j:j+3] in ("TAA", "TAG", "TGA"):
                    if j + 3 - i >= min_len:
                        orfs.append((i, j + 3))
                    break
    return orfs`)}
${note("A partir de aquí empieza el bloque <b>Ciencia de datos</b> y después <b>Bioinformática</b>: NumPy, pandas, gráficos, Biopython y bases de datos biológicas, todo ejecutable en esta misma web. La quimioinformática con RDKit se hace en cuadernos de Colab (carpeta <code>notebooks/</code>), porque RDKit no existe para el navegador.")}
</div>`},
];
