/* Datos de contenido del curso. Cada módulo: id, title, category, body() -> HTML */
let codeCounter = 0;
function codeBlock(code, runnable=true){
  const id = 'c'+(codeCounter++);
  return `<div class="editor-wrap">
    <div class="editor-head"><span>Python</span>
      <span>
        <button class="reset" onclick='resetCode("${id}", ${JSON.stringify(code)})'>↺ reiniciar</button>
        ${runnable? `<button id="run-${id}" onclick="runCode('${id}')">▶ Ejecutar</button>` : ''}
      </span>
    </div>
    <textarea class="code" id="ta-${id}" spellcheck="false">${code}</textarea>
    <div class="output" id="out-${id}"></div>
  </div>`;
}
function tip(html){ return `<div class="callout tip">💡 ${html}</div>`; }
function warn(html){ return `<div class="callout warn">⚠️ Error habitual: ${html}</div>`; }
function note(html){ return `<div class="callout">${html}</div>`; }
function exercise(title, prompt, starter, solution){
  return `<div class="exercise"><h4>✏️ Ejercicio: ${title}</h4>
    <p>${prompt}</p>
    ${codeBlock(starter)}
    <details><summary>Ver solución explicada</summary>${solution}</details>
  </div>`;
}

const MODULES = [
{id:1, cat:"Fundamentos", title:"Qué es Python y cómo empezar", body:()=>`
<div class="theory">
<p>Python es un lenguaje de programación pensado para leerse casi como texto normal. Se usa en análisis de datos, bioinformática, automatización, web y mucho más — por eso es una buena primera lengua de programación.</p>
<p>En esta web no necesitas instalar nada: cada bloque de código de abajo es un mini-Python que corre <b>dentro de tu navegador</b> (gracias a Pyodide). Escribe código, pulsa "Ejecutar" y verás el resultado al instante.</p>
${codeBlock(`print("¡Hola, Python!")`)}
${tip("Si quieres instalar Python en tu propio ordenador más adelante, descárgalo de python.org y usa un editor como VS Code.")}
${note("Todos estos ejercicios también funcionan igual si copias el código en Google Colab (colab.research.google.com) o en cualquier editor con Python instalado.")}
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
</div>`},

{id:5, cat:"Fundamentos", title:"Entrada y salida de datos", body:()=>`
<div class="theory">
<p><code>input()</code> pide datos al usuario y siempre devuelve texto (str), aunque parezca un número — hay que convertirlo si lo necesitas para cálculos. En este entorno del navegador <code>input()</code> no funciona en tiempo real, así que aquí simularemos la entrada asignando la variable directamente.</p>
${codeBlock(`# En un script normal harías: nombre = input("¿Cómo te llamas? ")
nombre = "Ana"   # simulamos la respuesta del usuario
print(f"Hola, {nombre}, bienvenida a Python")`)}
<p>Los f-strings (<code>f"..."</code>) son la forma moderna de insertar variables dentro de texto.</p>
${warn("olvidar convertir con <code>int()</code> el resultado de <code>input()</code> antes de hacer cálculos numéricos.")}
${exercise("Saludo personalizado", "Simula edad = \"28\" (como texto, tal cual la devolvería input()), conviértela a entero, suma 1 y muestra un f-string: 'El año que viene tendrás X años'.",
`edad = "28"
`,
`<p>Se convierte con <code>int(edad)</code>, se suma 1, y se inserta en un f-string: <code>f"El año que viene tendrás {int(edad)+1} años"</code>.</p>`)}
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
</div>`},

{id:9, cat:"Intermedio", title:"Colecciones: listas, tuplas, sets y diccionarios", body:()=>`
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
</div>`},

{id:10, cat:"Intermedio", title:"Cadenas de texto", body:()=>`
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
</div>`},

{id:11, cat:"Intermedio", title:"Módulos y paquetes", body:()=>`
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
`<p><code>[random.randint(1,100) for _ in range(5)]</code> genera la lista en una sola línea (comprensión de lista — módulo 15).</p>`)}
</div>`},

{id:12, cat:"Intermedio", title:"Manejo de errores y excepciones", body:()=>`
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
</div>`},

{id:13, cat:"Intermedio", title:"Archivos", body:()=>`
<div class="theory">
<p>Se abren con <code>open()</code>, idealmente usando <code>with</code> para que se cierren automáticamente. Modos comunes: <code>"r"</code> leer, <code>"w"</code> escribir (sobrescribe), <code>"a"</code> añadir.</p>
<p>En este navegador no hay disco real, pero así se vería en tu ordenador:</p>
${codeBlock(`# with open("secuencias.txt", "w") as f:
#     f.write("ATGCGC\\n")
#     f.write("TTAGCC\\n")
#
# with open("secuencias.txt", "a") as f:        # "a" = añadir sin borrar lo anterior
#     f.write("GGATCC\\n")
#
# with open("secuencias.txt") as f:
#     for linea in f:
#         print(linea.strip())

print("Descomenta el código de arriba y pruébalo en tu editor local (VS Code)")`)}
${tip("<code>with open(...) as f:</code> cierra el archivo aunque ocurra un error dentro del bloque — evita usar <code>f.close()</code> manual salvo que sepas por qué. Modo <code>'w'</code> sobrescribe el archivo entero; <code>'a'</code> añade al final.")}
${note("Este bloque está comentado porque el navegador no tiene sistema de archivos real. Cópialo en VS Code o Colab para probarlo de verdad.")}
${exercise("Simular un archivo de log", "Como aquí no hay disco real, simula un archivo con una lista de líneas. Añade tres líneas de texto a la lista 'log' (como si fueran f.write()) y luego imprímelas todas como si las leyeras de un archivo.",
`log = []
`,
`<p>Se usa <code>log.append("texto")</code> tres veces para simular las escrituras, y después un <code>for linea in log: print(linea)</code> para simular la lectura línea a línea.</p>`)}
</div>`},

{id:14, cat:"Avanzado", title:"Programación orientada a objetos", body:()=>`
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
</div>`},

{id:15, cat:"Avanzado", title:"Comprensiones, iteradores y generadores", body:()=>`
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
</div>`},

{id:16, cat:"Avanzado", title:"Pruebas y depuración", body:()=>`
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
</div>`},

{id:17, cat:"Avanzado", title:"Proyectos prácticos para integrar lo aprendido", body:()=>`
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
</div>`},
];
