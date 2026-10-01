/* Bloque CIENCIA DE DATOS — clase_4 completa: NumPy (1 y 2), SciPy, Pandas, PyArrow, Polars, Matplotlib, Seaborn, Matplotlib vs Seaborn y PIL */
MODULES.push(

{id:20, cat:"Ciencia de datos", title:"NumPy I: arrays y operaciones", body:()=>`
<div class="theory">
<p>Las listas de Python son flexibles pero lentas para operar con millones de números. <b>NumPy</b> introduce el <code>array</code>: una tabla de números del mismo tipo con la que puedes operar <b>de golpe</b>, sin bucles. Es la base de pandas, SciPy, scikit-learn, Biopython y casi toda la ciencia de datos en Python.</p>
<h3>Vectores, matrices y tensores</h3>
${codeBlock(`import numpy as np

vector = np.array([1, 2, 3])                                         # 1D
matriz = np.array([[1, 2], [3, 4], [5, 6]])                          # 2D: 3 filas, 2 columnas
tensor = np.array([[[0, 1], [2, 3]], [[4, 5], [6, 7]], [[8, 9], [10, 11]]])   # 3D

for nombre, a in [("vector", vector), ("matriz", matriz), ("tensor", tensor)]:
    print(f"{nombre:7s} shape={a.shape}  ndim={a.ndim}  size={a.size}  dtype={a.dtype}")
print(matriz)`)}
${concepto("shape", "es la 'forma' del array: una tupla con el tamaño de cada dimensión. <code>(3, 2)</code> = 3 filas y 2 columnas. Casi todos los errores con NumPy se resuelven mirando el <code>.shape</code>.")}
<h3>Crear arrays sin escribirlos a mano</h3>
${codeBlock(`import numpy as np

print(np.zeros((3, 4)))                 # ceros (equivale a np.full((3, 4), 0))
print(np.ones((2, 3)))                  # unos
print(np.full((2, 3), 5))               # filas, columnas, valor
print(np.arange(0, 10, 1))              # como range: NO incluye el final [0, 10)
print(np.arange(0, 1, 0.25))            # ...pero admite decimales
print(np.linspace(0, 1, 5))             # 5 valores equiespaciados, incluye el final
print(np.linspace(0, 1, 5, endpoint=False))`)}
${tip("<code>arange</code> fija el <b>tamaño del salto</b>; <code>linspace</code> fija el <b>número de valores</b>. Para dibujar curvas suaves, <code>linspace</code> es casi siempre mejor.")}
${codeBlock(`import numpy as np
np.random.seed(0)                                   # resultados reproducibles

print(np.random.rand(5).round(3))                   # uniforme en [0, 1)
print(np.random.rand(2, 2).round(3))                # ...con forma 2x2
print(np.random.randn(5).round(3))                  # normal estándar (media 0, desviación 1)
print(np.random.randint(0, 5, size=(2, 3)))         # enteros en [0, 5)
print(np.random.uniform(4, 10, size=(2, 3)).round(2))   # floats uniformes en [4, 10)`)}
<h3>Seleccionar partes: slicing</h3>
${codeBlock(`import numpy as np

v = np.array([1, 2, 3])
print(v[0:2])

m = np.array([[1, 2], [5, 3], [4, 6]])
print(m[:, :1])          # todas las filas, solo la primera columna (sigue siendo 2D)
print(m[:, 0])           # todas las filas, columna 0 (1D)
print(m[1, :])           # fila 1 completa
print(m[m > 3])          # filtrado booleano: los valores mayores que 3

t = np.array([[[1, 2], [4, 3]], [[2, 7], [9, 8]], [[1, 9], [3, 4]]])
print(t[0, :, :])        # primera "capa" del tensor`)}
<h3>Operaciones elemento a elemento</h3>
${codeBlock(`import numpy as np

a = np.array([1, 2, 3])
b = np.array([4, 5, 6])
print("Suma:", a + b)             # con listas, + concatenaría: [1, 2, 3, 4, 5, 6]
print("Producto:", a * b)
print("División:", np.array([4, 6, 8]) / np.array([2, 3, 4]))
print("Producto escalar:", np.dot(a, b), "=", a @ b)   # 1·4 + 2·5 + 3·6
print("Por un número:", a * 10, " | potencia:", a ** 2)

print([1, 2, 3] + [4, 5, 6])      # recordatorio: así se comportan las LISTAS`)}
${warn("confundir <code>*</code> con el producto matricial. <code>A * B</code> multiplica elemento a elemento; el producto de matrices es <code>A @ B</code> (o <code>np.dot</code>).")}
<h3>Sumar por ejes, trasponer, unir y cambiar de forma</h3>
${codeBlock(`import numpy as np

m = np.array([[1, 2, 3], [4, 5, 6]])
print("Suma axis=0 (por columnas):", np.sum(m, axis=0))
print("Suma axis=1 (por filas):   ", np.sum(m, axis=1))
print("Suma total:", m.sum())

print(np.transpose(m))                                      # = m.T
print(np.concatenate((np.array([1, 2]), np.array([3, 4]))))
print(np.reshape(np.array([1, 2, 3, 4, 5, 6]), (2, 3)))    # mismos datos, otra forma
print(np.array([[[1, 2, 3], [4, 5, 6]], [[7, 8, 9], [10, 11, 12]]]).flatten())   # todo a 1D`)}
${concepto("axis", "<code>axis=0</code> recorre 'hacia abajo' y da un resultado por columna; <code>axis=1</code> recorre 'hacia la derecha' y da uno por fila. Con <code>np.full((3, 3), 2)</code> ambos dan lo mismo porque la matriz es simétrica: pruébalo.")}
<h3>¿De verdad es tan rápido?</h3>
${codeBlock(`import numpy as np, time

size = 200_000                     # en tu ordenador prueba con 10**7
a1, a2 = np.random.rand(size), np.random.rand(size)

def suma_manual(x, y):
    r = np.zeros(len(x))
    for i in range(len(x)):
        r[i] = x[i] + y[i]
    return r

t = time.time(); suma_manual(a1, a2); t_bucle = time.time() - t
t = time.time(); a1 + a2;              t_numpy = time.time() - t
print(f"Bucle for: {t_bucle:.4f} s | NumPy: {t_numpy:.5f} s | ~{t_bucle / t_numpy:.0f} veces más rápido")`)}
${origen("clase_4/1. NUMPY.py")}
${exercise("Matriz de lecturas", "La matriz <code>lecturas</code> tiene 3 muestras (filas) × 4 genes (columnas). Guarda en <code>total_por_muestra</code> la suma de cada fila, en <code>total_por_gen</code> la de cada columna y en <code>normalizada</code> la matriz dividida por el total de su muestra (cada fila debe sumar 1). Pista: <code>keepdims=True</code>.",
`import numpy as np
lecturas = np.array([[10, 20, 30, 40],
                     [ 5,  5, 10, 80],
                     [25, 25, 25, 25]])
total_por_muestra = None
total_por_gen = None
normalizada = None
`,
`<p><code>lecturas.sum(axis=1)</code> suma por filas y <code>axis=0</code> por columnas. Para dividir cada fila por su total, ese total debe tener forma (3, 1): eso hace <code>keepdims=True</code>, y NumPy "expande" la división a cada columna (<i>broadcasting</i>).</p>`,
`import numpy as np
assert list(total_por_muestra) == [100, 100, 100], f"total_por_muestra = {total_por_muestra}"
assert list(total_por_gen) == [40, 50, 65, 145], f"total_por_gen = {total_por_gen}"
assert normalizada is not None and np.allclose(normalizada.sum(axis=1), 1), "Cada fila de normalizada debe sumar 1"
assert normalizada.shape == (3, 4), "normalizada debe conservar la forma (3, 4)"`,
`total_por_muestra = lecturas.sum(axis=1)
total_por_gen = lecturas.sum(axis=0)
normalizada = lecturas / lecturas.sum(axis=1, keepdims=True)
print(normalizada)`)}
${resumen(["<code>np.array</code>: datos homogéneos; <code>.shape</code>, <code>.ndim</code>, <code>.dtype</code>.", "Creación: <code>zeros, ones, full, arange, linspace, random.rand/randn/randint/uniform</code>.", "Slicing <code>m[filas, columnas]</code> y filtrado booleano <code>m[m > 3]</code>.", "Operaciones elemento a elemento; <code>@</code> / <code>np.dot</code> para el producto matricial.", "<code>sum(axis=...)</code>, <code>.T</code>, <code>concatenate</code>, <code>reshape</code>, <code>flatten</code>."])}
${quiz("¿Qué da <code>np.array([1, 2]) + np.array([3, 4])</code>?", ["[1, 2, 3, 4]", "[4, 6]", "10"], 1, "En NumPy + suma elemento a elemento. Con listas, + concatena.")}
${quiz("Tienes una matriz de 100 muestras (filas) × 20 genes (columnas). ¿Qué forma tiene <code>m.mean(axis=0)</code>?", ["(100,)", "(20,)", "Un solo número"], 1, "axis=0 colapsa las filas: obtienes una media por columna, es decir, por gen.")}
</div>`},

{id:21, cat:"Ciencia de datos", title:"NumPy II: aplicaciones en biología", body:()=>`
<div class="theory">
<p>Con las bases de NumPy ya puedes resolver problemas reales: normalizar expresión génica, medir distancias entre perfiles, simular mutaciones o contar nucleótidos sin escribir un solo bucle.</p>
<h3>Normalización y distancias</h3>
${codeBlock(`import numpy as np

genoma = np.array([100, 200, 150, 300])
normalizado = (genoma - np.min(genoma)) / (np.max(genoma) - np.min(genoma))   # min-max: 0..1
print("Min-max:", normalizado)

z = (genoma - genoma.mean()) / genoma.std()                                    # z-score
print("Z-score:", z.round(2))

s1, s2 = np.array([1, 2, 3]), np.array([4, 5, 6])
print("Distancia euclidiana:", np.linalg.norm(s1 - s2))    # raíz de la suma de cuadrados`)}
<h3>Simular mutaciones: muestreo con y sin reemplazo</h3>
${codeBlock(`import numpy as np
np.random.seed(1)

adn = np.array(["A", "T", "G", "C"])
print("Permutación (sin reemplazo):", np.random.choice(adn, size=4, replace=False))
print("Con reemplazo:              ", np.random.choice(adn, size=4, replace=True))
print(np.random.choice(["A", "T", "G", "C"], size=(5, 10), replace=True))   # 5 secuencias de 10 nt`)}
${codeBlock(`import numpy as np
# "Ojo!! ¿Por qué falla?" — la pregunta del script original
try:
    np.random.choice(["A", "T", "G", "C"], size=(5, 10), replace=False)
except ValueError as e:
    print("ValueError:", e)`)}
${concepto("¿Por qué falla?", "sin reemplazo cada elemento solo puede salir una vez: no puedes sacar 50 bases distintas de una bolsa con 4. Con <code>replace=True</code> la base vuelve a la bolsa tras cada extracción.")}
<h3>Contar y comparar</h3>
${codeBlock(`import numpy as np

secuencia = np.array(["A", "T", "G", "C", "A", "G", "T"])
unicos, conteos = np.unique(secuencia, return_counts=True)
print(dict(zip(unicos, conteos)))         # {'A': 2, 'C': 1, 'G': 2, 'T': 2}

# True cuenta como 1 y False como 0: sumar una máscara = contar
secuencias = np.array(["A", "T", "G", "C", "T", "G", "C"])
print(secuencias != "A")
print("Posiciones distintas de A:", np.sum(secuencias != "A"))

referencia = np.array(list("ATGCGTAC"))
muestra    = np.array(list("ATGAGTCC"))
print("Mutaciones:", np.sum(referencia != muestra), "en posiciones", np.where(referencia != muestra)[0])`)}
<h3>Matrices de similitud y concatenación</h3>
${codeBlock(`import numpy as np

perfiles = np.array([[1, 2, 3], [2, 3, 4], [3, 4, 5]])
print("Correlación entre filas:\\n", np.corrcoef(perfiles))

print(np.concatenate((perfiles, perfiles), axis=1))   # pega a la derecha: (3, 6)
print(np.concatenate((perfiles, perfiles), axis=0).shape)   # pega debajo: (6, 3)

genoma = np.array(list("ATGCATGC"))
print("Subsecuencia 2:5 ->", genoma[2:5])`)}
${tip("<code>np.corrcoef</code> da 1 cuando dos perfiles suben y bajan juntos aunque estén en escalas distintas: <code>[1, 2, 3]</code> y <code>[2, 3, 4]</code> correlacionan perfectamente pero su distancia euclidiana no es 0. Distancia y correlación responden a preguntas diferentes.")}
<h3>Expresión génica con ruido</h3>
${codeBlock(`import numpy as np

expresion_base = np.array([10, 20, 30, 40])
np.random.seed(2)
ruido = np.random.normal(0, 1, size=expresion_base.shape)   # media 0, desviación 1
print("Expresión + ruido:", (expresion_base + ruido).round(2))

expresion = np.array([10, 20, 30, 40, 50])
print("Media:", np.mean(expresion), "| desviación típica:", np.std(expresion).round(2))`)}
<h3>reshape para machine learning... con cuidado</h3>
${codeBlock(`import numpy as np

datos = np.arange(12).reshape(4, 3)      # 4 muestras x 3 genes
print("Original (muestras x genes):\\n", datos)
print("reshape(3, 4):\\n", datos.reshape(3, 4))
print("Traspuesta .T (genes x muestras):\\n", datos.T)`)}
${warn("usar <code>reshape</code> para 'girar' una matriz. En el script original, <code>np.reshape(expresion_genica, (10, 100))</code> sobre una matriz de 100 muestras × 10 genes no da 10 genes × 100 muestras: <b>reordena los números en otro orden</b> y mezcla datos de muestras distintas. Para intercambiar filas y columnas se usa <code>.T</code>; compara las dos salidas de arriba.")}
${origen("clase_4/2. NUMPY.py")}
${exercise("Z-score de expresión", "Estandariza el array <code>expr</code> (restar la media y dividir entre la desviación típica) y guárdalo en <code>z</code>. Después guarda en <code>atipicos</code> los valores originales cuyo |z| sea mayor que 1.5.",
`import numpy as np
expr = np.array([10.2, 11.1, 9.8, 10.5, 25.0, 10.0, 9.5])
z = None
atipicos = None
`,
`<p>La estandarización es <code>(expr - expr.mean()) / expr.std()</code>. Para filtrar se usa una máscara booleana con <code>np.abs(z) > 1.5</code>, que se aplica al array original.</p>`,
`import numpy as np
assert z is not None and abs(z.mean()) < 1e-9 and abs(z.std() - 1) < 1e-9, "z debe tener media 0 y desviación 1"
assert list(atipicos) == [25.0], f"El único atípico es 25.0; tienes {atipicos}"`,
`z = (expr - expr.mean()) / expr.std()
atipicos = expr[np.abs(z) > 1.5]`)}
${exercise("Simulador de lecturas", "Con <code>np.random.seed(42)</code> genera <code>lecturas</code>, una matriz de 20 lecturas × 50 bases (letras A, T, G, C con reemplazo). Calcula <code>gc_por_lectura</code>: un array con la fracción de G+C de cada lectura (fila).",
`import numpy as np
np.random.seed(42)
lecturas = None
gc_por_lectura = None
`,
`<p><code>np.random.choice(list("ATGC"), size=(20, 50))</code> crea la matriz. <code>np.isin(lecturas, ["G", "C"])</code> da una máscara booleana; su media por filas (<code>axis=1</code>) es la fracción de GC.</p>`,
`import numpy as np
assert lecturas is not None and lecturas.shape == (20, 50), "lecturas debe tener forma (20, 50)"
assert set(np.unique(lecturas)) <= set("ATGC"), "Solo puede haber A, T, G y C"
assert gc_por_lectura is not None and gc_por_lectura.shape == (20,), "gc_por_lectura debe tener 20 valores"
assert np.allclose(gc_por_lectura, np.isin(lecturas, ["G", "C"]).mean(axis=1)), "Los valores de GC no son correctos"`,
`lecturas = np.random.choice(list("ATGC"), size=(20, 50))
gc_por_lectura = np.isin(lecturas, ["G", "C"]).mean(axis=1)
print(gc_por_lectura.round(2))`)}
${resumen(["Normalización min-max y z-score en una línea; <code>np.linalg.norm</code> para distancias.", "<code>np.random.choice(..., replace=False)</code> no puede sacar más elementos de los que hay.", "<code>np.unique(..., return_counts=True)</code> + <code>dict(zip(...))</code> cuenta categorías.", "Sumar una máscara booleana cuenta los True; <code>np.where</code> da sus posiciones.", "<code>reshape</code> reordena; <code>.T</code> traspone. No son intercambiables."])}
${quiz("¿Qué devuelve <code>np.sum(np.array(['A','T','A']) == 'A')</code>?", ["['A', 'A']", "2", "True"], 1, "La comparación da [True, False, True] y al sumar, cada True vale 1.")}
</div>`},

{id:22, cat:"Ciencia de datos", title:"SciPy: estadística y métodos numéricos", body:()=>`
<div class="theory">
<p><b>SciPy</b> se apoya en NumPy y añade herramientas científicas listas para usar: estadística, integración, optimización, álgebra lineal... Cuando tengas una pregunta del tipo "¿son distintas estas dos condiciones?" o "¿dónde está el mínimo de esta función?", probablemente SciPy ya lo resuelve.</p>
<h3>Estadística descriptiva</h3>
${codeBlock(`import numpy as np
from scipy import stats

data = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
print("Media:", stats.tmean(data))
print("Mediana:", stats.scoreatpercentile(data, 50))
print("Desviación estándar:", round(stats.tstd(data), 3))
print("Varianza:", round(stats.tvar(data), 3))

d = stats.describe(data)                     # todo de una vez
print(d)
print("Funciones de stats que empiezan por 't':", [f for f in dir(stats) if f.startswith("t")][:12])`)}
${concepto("tstd vs np.std", "<code>stats.tstd</code> y <code>tvar</code> usan n−1 en el denominador (estimación muestral); <code>np.std</code> usa n por defecto. Con <code>np.std(data, ddof=1)</code> obtienes lo mismo que <code>tstd</code>. Con pocos datos la diferencia importa.")}
${codeBlock(`import numpy as np
data = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
print(np.std(data), np.std(data, ddof=1))`)}
<h3>Contraste de hipótesis</h3>
${codeBlock(`import numpy as np
from scipy import stats
np.random.seed(3)

control = np.random.normal(10, 1.5, 12)
tratado = np.random.normal(12, 1.5, 12)

t, p = stats.ttest_ind(control, tratado)
print(f"t de Student: t = {t:.2f}, p = {p:.4f}")
u, p_mw = stats.mannwhitneyu(control, tratado)     # alternativa no paramétrica
print(f"Mann-Whitney: p = {p_mw:.4f}")
print("Normalidad (Shapiro) del control: p =", round(stats.shapiro(control).pvalue, 3))
r, p_r = stats.pearsonr(control, tratado)
print(f"Correlación de Pearson: r = {r:.2f}")`)}
${concepto("p-valor", "probabilidad de observar una diferencia al menos tan grande si en realidad no hubiera diferencia. Un p &lt; 0.05 suele considerarse significativo, pero no mide el tamaño del efecto: mira también las medias.")}
<h3>Área bajo la curva (regla de Simpson)</h3>
${codeBlock(`import numpy as np
from scipy.integrate import simpson

x = np.linspace(0, 10, 100)
y = np.sin(x)
print("Área bajo sin(x) entre 0 y 10:", round(simpson(y=y, x=x), 4))
print("Valor exacto: 1 - cos(10) =", round(1 - np.cos(10), 4))

tiempo = np.array([0, 1, 2, 3, 4, 5, 6])            # cinética de expresión
expresion = np.array([0, 2.1, 4.8, 6.0, 5.2, 3.1, 1.0])
print("AUC de la cinética:", round(simpson(y=expresion, x=tiempo), 2))`)}
<h3>Optimización: encontrar el mínimo</h3>
${codeBlock(`import numpy as np
import matplotlib.pyplot as plt
from scipy.optimize import minimize

def func(x):
    return x**2 + 4*x + 4          # = (x + 2)², mínimo en x = -2

res = minimize(func, x0=0)        # x0: punto de partida de la búsqueda
print("Valor mínimo:", round(float(res.fun), 6), "| posición:", res.x.round(4))

x = np.linspace(-19, 15, 100)
plt.plot(x, func(x), color="orange")        # func funciona con arrays: no hace falta [func(i) for i in x]
plt.scatter(res.x, res.fun, color="red", zorder=3, label="mínimo")
plt.xlabel("Eje X"); plt.ylabel("Eje Y"); plt.title("$f(x) = x^2 + 4x + 4$"); plt.legend()
plt.show()`)}
<h3>Sistemas de ecuaciones</h3>
${codeBlock(`import numpy as np
from scipy.linalg import solve

#  3x + 2y = 5
#   x + 2y = 4
A = np.array([[3, 2], [1, 2]])
b = np.array([5, 4])
sol = solve(A, b)
print("Solución (x, y):", sol)
print("Comprobación A @ sol:", A @ sol)`)}
${origen("clase_4/3. SCIPY.py")}
${warn("en SciPy moderno la función es <code>simpson</code> (antes <code>simps</code>, ya eliminada) y conviene pasar los datos por nombre: <code>simpson(y=y, x=x)</code>. Si copias código antiguo y falla el import, este suele ser el motivo.")}
${exercise("¿Funciona el fármaco?", "Compara las dos muestras con una t de Student y guarda el p-valor en <code>p_valor</code> y en <code>significativo</code> un booleano (α = 0.05).",
`from scipy import stats
placebo = [120, 118, 125, 130, 122, 119, 127, 124]
farmaco = [112, 110, 118, 115, 109, 113, 117, 111]
p_valor = None
significativo = None
`,
`<p><code>stats.ttest_ind</code> devuelve el estadístico y el p-valor; basta comparar el p-valor con 0.05.</p>`,
`assert p_valor is not None and p_valor < 0.001, "Revisa el cálculo del p-valor"
assert significativo is True or significativo == True, "Con ese p-valor la diferencia es significativa"`,
`t, p_valor = stats.ttest_ind(placebo, farmaco)
significativo = bool(p_valor < 0.05)`)}
${exercise("Resolver un sistema", "Una mezcla de dos tampones cumple: <code>2a + 3b = 13</code> y <code>a − b = −1</code>. Resuélvelo con <code>solve</code> y guarda las soluciones en <code>a</code> y <code>b</code>.",
`import numpy as np
from scipy.linalg import solve
a = b = None
`,
`<p>La matriz de coeficientes es <code>[[2, 3], [1, -1]]</code> y el vector de términos independientes <code>[13, -1]</code>. <code>solve</code> devuelve un array con las dos incógnitas, que puedes desempaquetar.</p>`,
`assert abs(a - 2) < 1e-9 and abs(b - 3) < 1e-9, f"Esperaba a=2, b=3 y tienes a={a}, b={b}"`,
`a, b = solve(np.array([[2, 3], [1, -1]]), np.array([13, -1]))
print(a, b)`)}
${resumen(["<code>scipy.stats</code>: tmean, tstd, describe, t-test, Mann-Whitney, Shapiro, correlaciones.", "<code>scipy.integrate.simpson(y=..., x=...)</code>: áreas bajo curvas (AUC).", "<code>scipy.optimize.minimize(f, x0)</code>: mínimos de funciones.", "<code>scipy.linalg.solve(A, b)</code>: sistemas de ecuaciones lineales."])}
${quiz("Obtienes p = 0.30 al comparar dos grupos. ¿Qué concluyes?", ["Los grupos son iguales", "No hay evidencia suficiente de diferencia", "La diferencia es del 30 %"], 1, "Un p alto no prueba igualdad: solo indica que los datos no muestran una diferencia clara.")}
</div>`},

{id:23, cat:"Ciencia de datos", title:"pandas I: crear, limpiar y seleccionar", body:()=>`
<div class="theory">
<p><b>pandas</b> es la herramienta para trabajar con tablas: lo que harías en Excel, pero reproducible y sin límite práctico de filas. Tiene dos estructuras: la <code>Series</code> (una columna con índice) y el <code>DataFrame</code> (varias Series que comparten índice).</p>
<h3>Crear DataFrames</h3>
${codeBlock(`import pandas as pd

serie1 = pd.Series([1, 2, 3, 4], name="Columna_A")
serie2 = pd.Series([10, 20, 30, 40], name="Columna_B")
serie3 = pd.Series(["a", "b", "c", "d"], name="Columna_C")

df0 = pd.DataFrame({"Columna_1": serie1, "Columna_2": serie2, "Columna_3": serie3})
print(df0, "\\n")

print(pd.DataFrame([serie1, serie2, serie3]), "\\n")      # una LISTA de Series -> cada Series es una FILA
print(pd.DataFrame([serie1, serie2, serie3]).T)          # .T traspone: vuelven a ser columnas`)}
${codeBlock(`import pandas as pd
import numpy as np

data = {"Nombre": ["Ana", "Luis", "Carlos", "Beatriz"],
        "Edad": [23, None, 45, 29],
        "Ciudad": ["Madrid", "Barcelona", "Valencia", "Sevilla"]}
df = pd.DataFrame(data)                   # diccionario de listas: la forma más habitual
print(df)
print(df.dtypes)
print(df.shape, df.columns.tolist())

df_numpy = pd.DataFrame(np.array([[1, 2], [3, 4], [5, 6]]), columns=["Columna1", "Columna2"])
print(df_numpy)`)}
<h3>Valores nulos</h3>
${codeBlock(`print(df.isnull())                 # True donde falta un dato
print(df.isnull().sum())           # cuántos faltan por columna
print(df.dropna(subset=["Edad"]))  # elimina filas sin Edad
print(df.dropna())                 # elimina filas con cualquier nulo
print(df.fillna({"Edad": df["Edad"].mean()}))   # o rellena con la media`)}
${concepto("None y NaN", "pandas convierte el <code>None</code> de una columna numérica en <code>NaN</code> (<i>Not a Number</i>) y la columna pasa a ser float: por eso 'Edad' aparece como 23.0. <code>NaN</code> no es igual a nada, ni a sí mismo: comprueba los nulos siempre con <code>isnull()</code>/<code>isna()</code>.")}
<h3>Añadir y eliminar</h3>
${codeBlock(`limpio = df.dropna(subset=["Edad"]).copy()
limpio["D"] = [7, 8, 9]                        # la lista debe tener tantos elementos como filas
limpio["Sexo"] = ["Female", "Male", "Female"]
limpio["Edad_en_meses"] = limpio["Edad"] * 12   # columna calculada a partir de otra
print(limpio)
print(limpio.drop(0))                           # elimina la fila con ETIQUETA 0
print(limpio.drop(columns=["D"]))               # elimina una columna`)}
${warn("asignar una lista de longitud distinta al número de filas: <code>ValueError: Length of values does not match length of index</code>. En el script original <code>df['D'] = [7, 8, 9]</code> solo funcionaba porque antes se había eliminado una de las 4 filas.")}
<h3>Filtrar y acceder</h3>
${codeBlock(`print(df[df["Edad"] > 30])                                 # filtrar por condición
print(df[(df["Edad"] > 20) & (df["Ciudad"] != "Madrid")])  # varias condiciones: & y |
print(df[df["Ciudad"].isin(["Madrid", "Sevilla"])])

print(df.iloc[0, 0])            # iloc: por POSICIÓN [fila, columna]
print(df.loc[2, "Ciudad"])      # loc: por ETIQUETA [índice, nombre de columna]
print(df.loc[df["Edad"] > 25, ["Nombre", "Edad"]])
print(df.describe())            # estadísticas de las columnas numéricas`)}
${warn("usar <code>and</code>/<code>or</code> para combinar condiciones. En pandas hay que usar <code>&amp;</code> y <code>|</code> con cada condición entre paréntesis. Y revisa que el texto coincida con el código: el script original anunciaba 'Edad mayor que 22' pero filtraba <code>&gt; 30</code>.")}
<h3>Referencia o copia</h3>
${codeBlock(`import pandas as pd

df_original = pd.DataFrame({"Producto": ["A", "B", "C", "D"], "Precio": [100, 150, 200, 250]})

df_referencia = df_original            # NO copia: dos nombres para el MISMO objeto
df_referencia.loc[0, "Precio"] = 120
print("Original tras tocar la referencia:\\n", df_original)

df_copia = df_original.copy()          # copia independiente
df_copia.loc[1, "Precio"] = 160
print("Original tras tocar la copia:\\n", df_original)
print("Copia:\\n", df_copia)`)}
${concepto("Por qué importa", "es el mismo comportamiento que viste con listas (y con <code>is</code> en el módulo 3): asignar no copia. Si filtras un DataFrame y luego quieres modificar el resultado, usa <code>.copy()</code> para evitar el aviso <i>SettingWithCopyWarning</i> y cambios inesperados en el original.")}
${origen("clase_4/6. PANDAS.py (primera parte)")}
${exercise("Limpieza de un registro clínico", "A partir de <code>pacientes</code>: elimina las filas sin <code>glucosa</code>, añade una columna <code>diabetes</code> con <code>True</code> si la glucosa es ≥ 126 y guarda el resultado en <code>limpio</code>. Guarda en <code>n_diabeticos</code> cuántos pacientes la tienen.",
`import pandas as pd
import numpy as np
pacientes = pd.DataFrame({
    "id": ["P1", "P2", "P3", "P4", "P5", "P6"],
    "edad": [54, 61, 47, 70, 39, 58],
    "glucosa": [99, 140, np.nan, 131, 88, 126],
})
limpio = None
n_diabeticos = None
`,
`<p><code>dropna(subset=["glucosa"])</code> elimina las filas sin dato; la comparación <code>limpio["glucosa"] >= 126</code> ya devuelve una columna de booleanos, y sumarla cuenta los True.</p>`,
`assert limpio is not None and len(limpio) == 5, "limpio debe tener 5 filas (se elimina P3)"
assert "diabetes" in limpio.columns, "Falta la columna diabetes"
assert list(limpio["diabetes"]) == [False, True, True, False, True], f"diabetes = {list(limpio['diabetes'])}"
assert n_diabeticos == 3, f"n_diabeticos = {n_diabeticos}"`,
`limpio = pacientes.dropna(subset=["glucosa"]).copy()
limpio["diabetes"] = limpio["glucosa"] >= 126
n_diabeticos = int(limpio["diabetes"].sum())
print(limpio)`)}
${resumen(["<code>pd.Series</code> = columna; <code>pd.DataFrame</code> = tabla (desde diccionarios, Series o arrays).", "Nulos: <code>isnull().sum()</code>, <code>dropna(subset=...)</code>, <code>fillna</code>.", "Columnas nuevas con <code>df['nueva'] = ...</code>; <code>drop</code> para filas o <code>columns=</code>.", "Filtrar con máscaras y <code>&amp;</code>/<code>|</code>; <code>iloc</code> posición, <code>loc</code> etiqueta.", "<code>df2 = df</code> no copia; <code>df.copy()</code> sí."])}
${quiz("¿Qué diferencia hay entre <code>df.loc[0]</code> y <code>df.iloc[0]</code>?", ["Ninguna", "loc usa la etiqueta del índice; iloc la posición", "loc es para columnas e iloc para filas"], 1, "Tras filtrar u ordenar, la fila con etiqueta 0 puede no estar en la posición 0: por eso existen los dos.")}
</div>`},

{id:24, cat:"Ciencia de datos", title:"pandas II: agrupar, unir y leer archivos", body:()=>`
<div class="theory">
<p>La potencia real de pandas aparece al combinar tablas y resumirlas: sumar ventas por región, calcular la expresión media por condición, unir resultados con una anotación de genes...</p>
<h3>Unir tablas: merge</h3>
${codeBlock(`import pandas as pd

df1 = pd.DataFrame({"ID": [1, 2, 3], "Nombre": ["Ana", "Luis", "Carlos"]})
df2 = pd.DataFrame({"ID": [2, 3, 4], "Ciudad": ["Barcelona", "Valencia", "Sevilla"]})

for como in ["inner", "left", "right", "outer"]:
    print(f"--- how='{como}' ---")
    print(pd.merge(df1, df2, on="ID", how=como))`)}
${concepto("Tipos de unión", "<b>inner</b>: solo los ID presentes en ambas · <b>left</b>: todos los de la izquierda · <b>right</b>: todos los de la derecha · <b>outer</b>: todos, rellenando con NaN lo que falte. Es exactamente el JOIN de SQL.")}
<h3>Agrupar: groupby</h3>
${codeBlock(`import pandas as pd

df_group = pd.DataFrame({"Categoria": ["A", "B", "A", "B", "A", "B"],
                         "Valor": [10, 20, 15, 25, 5, 30]})
agrupado = df_group.groupby("Categoria").sum()
print(agrupado)
print(agrupado.index)          # las categorías pasan a ser el índice

data = {"Región": ["Norte", "Norte", "Sur", "Sur", "Este", "Este", "Norte", "Sur"],
        "Categoría": ["Electrónica", "Electrónica", "Electrónica", "Muebles", "Muebles", "Electrónica", "Muebles", "Electrónica"],
        "Ventas": [1000, 1500, 1200, 2000, 2500, 1800, 1400, 1600],
        "Cantidad": [10, 15, 12, 20, 25, 18, 14, 16]}
ventas = pd.DataFrame(data)
print(ventas["Categoría"].value_counts())
print(ventas["Región"].value_counts())`)}
${codeBlock(`grupos = ventas.groupby(["Región", "Categoría"])

for (region, categoria), sub in grupos:        # cada grupo es un mini-DataFrame
    print(region, categoria, "->", len(sub), "fila(s)")

print(grupos.agg({"Ventas": "mean", "Cantidad": "mean"}))
print(grupos.agg({"Ventas": "sum", "Cantidad": "sum"}).reset_index())   # reset_index: índice -> columnas
print(ventas.groupby("Región")["Ventas"].agg(["sum", "mean", "max"]))`)}
<h3>Concatenar</h3>
${codeBlock(`import pandas as pd
df1 = pd.DataFrame({"ID": [1, 2], "Nombre": ["Ana", "Luis"]})
df2 = pd.DataFrame({"ID": [3, 4], "Nombre": ["Carlos", "Beatriz"]})
print(pd.concat([df1, df2]))                     # el índice se repite: 0, 1, 0, 1
print(pd.concat([df1, df2], ignore_index=True))  # índice nuevo: 0..3
print(pd.concat([df1, df2], axis=1))             # lado a lado`)}
<h3>Leer archivos: separadores, cabecera e índice</h3>
${codeBlock(`import pandas as pd

print(open("archivo.txt").read())                         # veamos el archivo tal cual

df_csv = pd.read_csv("archivo.txt", delimiter=";")        # separado por punto y coma
print(df_csv)

df_tsv = pd.read_csv("ciudades.tsv", delimiter="\\t", index_col="ciudad")   # tabulador + índice
print(df_tsv)
print(df_tsv.loc["Sevilla", "poblacion"])

mal = pd.read_csv("archivo.txt")                          # ¿y si olvido el delimitador?
print(mal.shape, mal.columns.tolist())`)}
${warn("leer un archivo con el separador equivocado: pandas no da error, pero te devuelve <b>una sola columna</b> con todo el texto. Si <code>df.shape</code> tiene 1 columna, sospecha del <code>delimiter</code>. Otros parámetros clave: <code>header=None</code> (sin cabecera), <code>index_col</code>, <code>decimal=','</code> (decimales con coma).")}
${staticCode(`df_excel = pd.read_excel("archivo.xlsx", sheet_name=0)   # requiere openpyxl
df.to_csv("resultado.csv", index=False)
df.to_excel("resultado.xlsx", index=False)`, "Excel y escritura (en tu ordenador)")}
<h3>Aplicar funciones a columnas</h3>
${codeBlock(`import pandas as pd

df = pd.DataFrame({"Producto": ["A", "B", "C", "D"], "Precio": [100, 150, 200, 250]})
df["Doble"] = df["Precio"].apply(lambda x: x * 2)

def aplicar_descuento(precio, descuento=10):        # el descuento ahora es un parámetro
    return precio * (1 - descuento / 100)

df["Con 10 %"] = df["Precio"].apply(aplicar_descuento)
df["Con 25 %"] = df["Precio"].apply(aplicar_descuento, descuento=25)
df["Vectorizado"] = df["Precio"] * 0.9               # para aritmética simple, sin apply es más rápido
print(df)`)}
${tip("En el script original el porcentaje estaba fijo dentro de la función (<code>descuento = 10</code>) y fuera había un comentario '# Definir el porcentaje de descuento' sin código. Convertirlo en parámetro con valor por defecto hace la función reutilizable, y <code>apply</code> le pasa los argumentos extra por nombre.")}
${origen("clase_4/6. PANDAS.py (segunda parte)")}
<h3>Alternativas para grandes volúmenes: PyArrow y Polars</h3>
<p><b>PyArrow</b> es el formato columnar en memoria sobre el que se construyen Parquet y pandas 2. <b>Polars</b> es una librería de DataFrames escrita en Rust, multihilo y muy rápida, con una sintaxis basada en expresiones <code>pl.col(...)</code>. No están disponibles en esta web; este es el contenido de los scripts de clase, actualizado:</p>
${staticCode(`import pyarrow as pa
import pyarrow.compute as pc
import pyarrow.csv as csv

tabla = pa.Table.from_arrays([pa.array([1, 2, 3]), pa.array(["A", "B", "C"]), pa.array([10.1, 20.2, 30.3])],
                             names=["Column1", "Column2", "Column3"])
tabla = tabla.append_column("Column4", pa.array(["Data1", "Data2", "Data3"]))   # añadir columna
tabla = tabla.remove_column(0)                                                 # quitar la primera

t = pa.table({"A": ["foo", "bar", "foo", "bar"], "B": [1, 2, 3, 4], "C": [10, 20, 30, 40]})
print(t.group_by("A").aggregate([("C", "mean"), ("B", "count")]))           # agrupar
print(pa.table({"A": [1, 2, 3], "B": [4, 5, 6]}).filter(pc.field("B") <= 5.5))   # filtrar

t1 = pa.table({"A": [1, 2, 3], "B": ["foo", "bar", "foo"]})
t2 = pa.table({"A": [2, 3, 1], "C": ["baz", "qux", "baz"]})
print(t1.join(t2, "A", join_type="inner"))                                    # unir

tabla_csv = csv.read_csv("archivo.txt", parse_options=csv.ParseOptions(delimiter=";"))
df = tabla_csv.to_pandas()                                                    # puente con pandas`, "PyArrow (pip install pyarrow)")}
${staticCode(`import polars as pl

df = pl.DataFrame({"Gen": ["GEN1", "GEN2", "GEN3", "GEN4"],
                   "Expresión": [5.2, 3.1, 7.4, 2.8],
                   "Significancia": [True, False, True, False]})
df = df.with_columns((pl.col("Expresión") ** 2).alias("Expresión^2"),
                     (pl.col("Expresión") * 0.5).alias("Expresión a la mitad"))
print(df.filter(pl.col("Expresión") > 5))

genes = pl.DataFrame({"ID_Gen": ["GEN1", "GEN2", "GEN3", "GEN4"], "Nombre": ["Gene A", "Gene B", "Gene C", "Gene D"]})
expr  = pl.DataFrame({"ID_Gen": ["GEN1", "GEN2", "GEN2", "GEN3"], "Valor": [5.2, 3.1, 3.0, 7.4]})
print(genes.join(expr, on="ID_Gen", how="full"))          # antes how="outer" (renombrado en Polars 1.0)

datos = pl.DataFrame({"Gen": ["GEN1", "GEN1", "GEN2", "GEN2"], "Condición": ["Control", "Tratamiento"] * 2,
                      "Expresión": [5.2, 6.5, 3.1, 4.0]})
print(datos.group_by(["Gen", "Condición"]).agg(pl.sum("Expresión").alias("Suma"),
                                               pl.mean("Expresión").alias("Promedio")))

a = pl.DataFrame({"ID_Muestra": ["M1", "M2"], "Expresión": [5.2, 3.1]})
b = pl.DataFrame({"ID_Muestra": ["M3", "M4"], "Expresión": [4.5, 6.3]})
print(a.vstack(b))                                        # concatenar vertical (hstack: horizontal)
print(pl.read_csv("archivo.txt", separator=";"))`, "Polars (pip install polars)")}
${note("Si ejecutas el script original de Polars con una versión reciente verás un aviso o error en <code>how='outer'</code>: desde Polars 1.0 se llama <code>how='full'</code>. Las librerías evolucionan; cuando un ejemplo antiguo falle, el mensaje de error y la documentación suelen indicar el nombre nuevo.")}
${origen("clase_4/7.PYARROW.py y 8. POLARS.py")}
${exercise("Expresión media por condición", "Une <code>expresion</code> con <code>anotacion</code> por la columna <code>gen</code> (conservando solo los genes anotados) y calcula, en un DataFrame <code>resumen</code>, la expresión media por <code>condicion</code> y <code>via</code>, con estas dos como columnas (no como índice).",
`import pandas as pd
expresion = pd.DataFrame({
    "gen": ["TP53", "TP53", "MYC", "MYC", "EGFR", "EGFR", "XYZ1"],
    "condicion": ["control", "tratado"] * 3 + ["control"],
    "valor": [5.0, 7.0, 10.0, 14.0, 3.0, 2.0, 9.9],
})
anotacion = pd.DataFrame({"gen": ["TP53", "MYC", "EGFR"],
                          "via": ["apoptosis", "proliferación", "proliferación"]})
resumen = None
`,
`<p>Un <code>merge(..., how="inner")</code> descarta XYZ1, que no está anotado. Después, <code>groupby(["condicion", "via"])["valor"].mean().reset_index()</code> agrupa, promedia y devuelve las claves como columnas.</p>`,
`assert resumen is not None and {"condicion", "via", "valor"} <= set(resumen.columns), f"Columnas: {list(resumen.columns) if resumen is not None else None}"
assert len(resumen) == 4, f"Debe haber 4 combinaciones condición-vía; hay {len(resumen)}"
r = resumen.set_index(["condicion", "via"])["valor"]
assert abs(r[("control", "proliferación")] - 6.5) < 1e-9, "La media control-proliferación debería ser 6.5"
assert abs(r[("tratado", "apoptosis")] - 7.0) < 1e-9`,
`resumen = (pd.merge(expresion, anotacion, on="gen", how="inner")
             .groupby(["condicion", "via"])["valor"].mean()
             .reset_index())
print(resumen)`)}
${exercise("Explorando el Sistema Solar", "Con <code>planetas</code>: guarda en <code>densidad_media</code> la densidad media de los cuerpos con masa &gt; 1 (10^24 kg), y en <code>mas_caliente</code> el nombre del cuerpo con mayor temperatura media.",
`import pandas as pd
planetas = pd.read_csv("Planetas.txt")
densidad_media = None
mas_caliente = None
`,
`<p>Filtra con una máscara booleana y calcula <code>.mean()</code> sobre la columna de densidad. Para el máximo, <code>idxmax()</code> devuelve el índice de la fila con mayor valor, y con <code>loc</code> recuperas el nombre.</p>`,
`assert abs(densidad_media - planetas[planetas["Mass (10^24 kg)"] > 1]["Density (kg/m^3)"].mean()) < 1e-6, "Revisa el filtro de masa o la columna de densidad"
assert mas_caliente == "VENUS", f"El más caliente es VENUS, tienes {mas_caliente}"`,
`densidad_media = planetas[planetas["Mass (10^24 kg)"] > 1]["Density (kg/m^3)"].mean()
mas_caliente = planetas.loc[planetas["Mean Temperature (°C)"].idxmax(), "Planeta"]`)}
${resumen(["<code>pd.merge(a, b, on=..., how='inner'|'left'|'right'|'outer')</code> une tablas.", "<code>groupby(...).agg({...})</code> resume por grupos; <code>reset_index()</code> devuelve las claves a columnas.", "<code>value_counts()</code> cuenta categorías; <code>pd.concat([...], ignore_index=True)</code> apila.", "<code>read_csv</code>: <code>delimiter</code>, <code>header</code>, <code>index_col</code>, <code>decimal</code>.", "<code>apply</code> para funciones propias; operaciones vectorizadas para aritmética simple.", "PyArrow y Polars: alternativas para datos muy grandes."])}
${quiz("Haces <code>pd.merge(muestras, clinica, on='id', how='left')</code> y algunos pacientes no tienen datos clínicos. ¿Qué pasa con ellos?", ["Se eliminan", "Se conservan con NaN en las columnas clínicas", "Da un error"], 1, "Con how='left' se conservan todas las filas de la tabla izquierda; lo que no encuentra pareja se rellena con NaN.")}
</div>`},

{id:25, cat:"Ciencia de datos", title:"Matplotlib: gráficos a medida", body:()=>`
<div class="theory">
<p>Un buen gráfico revela patrones que una tabla esconde. <b>Matplotlib</b> es la librería base de visualización en Python: control total sobre cada elemento (ejes, colores, textos, tamaños). En esta web los gráficos aparecen automáticamente bajo la celda.</p>
<h3>Los cuatro gráficos básicos</h3>
${codeBlock(`import matplotlib.pyplot as plt

x = [1, 2, 3, 4, 5]
y = [2, 3, 5, 7, 11]

plt.figure(figsize=(6, 3.5))
plt.plot(x, y, marker="o")
plt.title("Gráfico de líneas"); plt.xlabel("X"); plt.ylabel("Y"); plt.grid(True)
plt.show()

plt.figure(figsize=(6, 3.5))
plt.bar(["A", "B", "C", "D"], [5, 7, 2, 8], color="skyblue")
plt.title("Gráfico de barras")
plt.xlabel("$Categorías$")
plt.ylabel("$X^2$")                      # entre $...$ el texto se interpreta como LaTeX
plt.show()

plt.figure(figsize=(6, 3.5))
plt.scatter(x, y, color="red", marker="*", s=120)
plt.title("Gráfico de dispersión")
plt.show()`)}
${codeBlock(`import matplotlib.pyplot as plt

x = [1, 2, 3, 4, 5]
y = [2, 3, 5, 7, 11]
plt.figure(figsize=(6, 3.5))
plt.fill_between(x, y, color="skyblue", alpha=0.4)      # rellena bajo la curva
plt.plot(x, y, color="slateblue", alpha=0.6)
for xi, yi in zip(x, y):
    plt.text(xi, yi, f"{yi}\\n", fontsize=9, ha="center")   # anota cada punto
plt.title("Gráfico de área")
plt.show()`)}
${concepto("Anatomía de una figura", "una <b>Figure</b> es el lienzo; dentro hay uno o varios <b>Axes</b> (cada gráfico, con sus ejes). <code>plt.plot()</code> dibuja en el Axes 'actual'; con <code>fig, ax = plt.subplots()</code> trabajas explícitamente sobre <code>ax</code>, que es lo recomendable en cuanto hay más de un gráfico.")}
<h3>Varios gráficos en una figura</h3>
${codeBlock(`import matplotlib.pyplot as plt

x = [1, 2, 3, 4, 5]
y = [2, 3, 5, 7, 11]
fig, axs = plt.subplots(1, 2, figsize=(9, 3.5))
axs[0].plot(x, y, color="blue");  axs[0].set_title("Líneas")
axs[1].bar(x, y, color="green");  axs[1].set_title("Barras")
fig.suptitle("Mis gráficos", fontsize=16)            # título general
plt.tight_layout()                                   # ajusta espacios para que no se solapen
plt.show()`)}
${codeBlock(`import matplotlib.pyplot as plt

x, y = [1, 2, 3, 4, 5], [2, 3, 5, 7, 11]
z, w = [2, 4, 8, 5, 1], [3, 4, 3, 2, 9]

fig, axs = plt.subplots(2, 2, figsize=(9, 6))
axs = axs.flatten()                      # matriz 2x2 de ejes -> lista de 4
datos = [(x, y, "plot"), (x, y, "bar"), (x, w, "plot"), (w, z, "scatter")]
for i, (ax, (a, b, tipo)) in enumerate(zip(axs, datos), start=1):
    getattr(ax, tipo)(a, b)              # llama a ax.plot, ax.bar o ax.scatter
    ax.set_title(f"Gráfico {i}: {tipo}")
fig.suptitle("Cuatro gráficos recorriendo axs como lista", fontsize=14)
plt.tight_layout()
plt.show()`)}
${tip("Con una matriz de ejes puedes usar <code>axs[0][1]</code> o <code>axs[0, 1]</code>; con <code>axs.flatten()</code> la conviertes en lista y la recorres con un bucle, que es más cómodo cuando hay muchos subgráficos.")}
<h3>Funciones matemáticas y ejes</h3>
${codeBlock(`import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(0, 10, 100)
fig, axs = plt.subplots(2, 2, figsize=(9, 6))
axs[0, 0].plot(x, np.sin(x), "r");       axs[0, 0].set_title("Seno")
axs[0, 1].bar(x, np.cos(x), width=0.08); axs[0, 1].set_title("Coseno (barras)")
axs[1, 0].scatter(x, np.tan(x), s=8);    axs[1, 0].set_title("Tangente")
axs[1, 0].set_ylim(-10, 10)              # sin esto, las asíntotas aplastan la gráfica
axs[1, 1].plot(x, np.arctan(x), "r");    axs[1, 1].set_title("Arco tangente")
plt.tight_layout()
plt.show()`)}
${note("En el script original el cuarto gráfico tenía el comentario 'está vacío', pero se dibujaba el arcotangente y después <code>axis('off')</code> ocultaba sus ejes. <code>ax.axis('off')</code> sirve para quitar marcos (por ejemplo al mostrar imágenes); para dejar un hueco realmente vacío, <code>fig.delaxes(ax)</code>. Y la tangente necesita <code>set_ylim</code>: sus valores enormes cerca de π/2 hacen invisible el resto.")}
<h3>Gráficos 3D y guardar a archivo</h3>
${codeBlock(`import numpy as np
import matplotlib.pyplot as plt
import os

t = np.linspace(0, 6 * np.pi, 300)                    # una hélice, como una hebra de ADN
fig = plt.figure(figsize=(5, 4.5))
ax = fig.add_subplot(111, projection="3d")
ax.plot(np.cos(t), np.sin(t), t, color="tab:blue")
ax.plot(np.cos(t + np.pi), np.sin(t + np.pi), t, color="tab:orange")
ax.set_title("Doble hélice")

os.makedirs("plots", exist_ok=True)
fig.savefig("plots/helice.png", dpi=150, bbox_inches="tight")   # png, pdf, svg...
print(os.listdir("plots"))
plt.show()`)}
${origen("clase_4/4. MATPLOTLIB.py y 3. SCIPY.py (gráfico del mínimo)")}
${exercise("Gráfico de composición", "Dibuja un gráfico de barras con el número de cada aminoácido en <code>secuencia</code> (en orden alfabético), con título y etiquetas en los ejes. Guarda la figura en la variable <code>fig</code>.",
`import matplotlib.pyplot as plt
secuencia = "MEEPQSDPSVEPPLSQETFSDLWKLLPENNVLSPLPSQAMDDLMLSPDDIEQWFTEDPGP"
fig = None
`,
`<p>Calcula el conteo con una comprensión de diccionario sobre <code>sorted(set(secuencia))</code>, crea la figura con <code>fig, ax = plt.subplots()</code> y dibuja con <code>ax.bar</code>.</p>`,
`assert fig is not None, "Guarda la figura en la variable fig"
ax = fig.axes[0]
assert len(ax.patches) == len(set(secuencia)), "Debe haber una barra por aminoácido distinto"
assert ax.get_title() != "", "Falta el título"
assert ax.get_xlabel() != "" and ax.get_ylabel() != "", "Faltan las etiquetas de los ejes"`,
`conteo = {aa: secuencia.count(aa) for aa in sorted(set(secuencia))}
fig, ax = plt.subplots(figsize=(8, 3))
ax.bar(conteo.keys(), conteo.values(), edgecolor="black")
ax.set_title("Composición de aminoácidos")
ax.set_xlabel("Aminoácido"); ax.set_ylabel("Frecuencia")
plt.show()`)}
${resumen(["<code>plt.plot, bar, scatter, fill_between, hist, boxplot</code>; <code>plt.text</code> para anotar.", "Siempre: título, etiquetas de ejes y leyenda si hay varias series; <code>$...$</code> para fórmulas.", "<code>fig, axs = plt.subplots(filas, columnas)</code>; <code>axs.flatten()</code> para recorrerlos.", "<code>suptitle</code>, <code>tight_layout</code>, <code>set_ylim</code>, <code>axis('off')</code>.", "3D con <code>projection='3d'</code>; <code>fig.savefig('archivo.png', dpi=...)</code> para guardar."])}
${quiz("Tienes <code>fig, axs = plt.subplots(2, 3)</code>. ¿Cómo accedes al gráfico de la fila de abajo, columna del medio?", ["axs[1, 1]", "axs[2, 2]", "axs[4]"], 0, "Los índices empiezan en 0: fila 1 (la segunda), columna 1 (la segunda). Tras flatten() sería axs[4].")}
</div>`},

{id:26, cat:"Ciencia de datos", title:"Seaborn: gráficos estadísticos", body:()=>`
<div class="theory">
<p><b>Seaborn</b> se construye sobre Matplotlib y está pensado para DataFrames: le dices qué columna va en cada eje y cuál define el color (<code>hue</code>), y él agrupa, calcula y dibuja. Ideal para explorar datos rápidamente.</p>
${note("Los scripts de clase usan <code>sns.load_dataset('iris')</code>, que descarga los datos de internet. En esta web los tienes ya en el disco virtual (<code>iris.csv</code>, <code>tips.csv</code>, <code>titanic.csv</code>), así que se leen con <code>pd.read_csv</code>. El resultado es exactamente el mismo DataFrame. La primera ejecución tarda un poco porque instala seaborn.")}
<h3>Dispersión, histograma y cajas</h3>
${codeBlock(`import seaborn as sns
import matplotlib.pyplot as plt
import pandas as pd

iris = pd.read_csv("iris.csv")            # en tu ordenador: sns.load_dataset("iris")
print(iris.head())
sns.scatterplot(data=iris, x="sepal_length", y="sepal_width", hue="species")
plt.title("Sépalo: longitud vs anchura")
plt.show()

titanic = pd.read_csv("titanic.csv")
sns.histplot(data=titanic, x="age", bins=30, kde=True)    # kde: curva de densidad suavizada
plt.title("Distribución de edades en el Titanic")
plt.show()`)}
${codeBlock(`import seaborn as sns
import matplotlib.pyplot as plt
import pandas as pd

tips = pd.read_csv("tips.csv")
orden = ["Thur", "Fri", "Sat", "Sun"]
sns.boxplot(data=tips, x="day", y="total_bill", order=orden)
plt.title("Cuenta total por día")
plt.show()

sns.scatterplot(data=tips, x="tip", y="total_bill", hue="time")
plt.title("Propina vs cuenta, por comida/cena")
plt.show()

sns.violinplot(data=tips, x="day", y="total_bill", hue="sex", split=True, order=orden)
plt.title("Cuenta total por día y sexo")
plt.show()`)}
${concepto("Boxplot y violinplot", "el <b>boxplot</b> resume la distribución en 5 números (mínimo, Q1, mediana, Q3, máximo) y marca los atípicos. El <b>violinplot</b> añade la forma de la distribución: ves si es bimodal o asimétrica. Con <code>split=True</code> y <code>hue</code>, cada mitad del violín es un grupo.")}
<h3>Pairplot, FacetGrid y regresión</h3>
${codeBlock(`import seaborn as sns
import matplotlib.pyplot as plt
import pandas as pd

iris = pd.read_csv("iris.csv")
g = sns.pairplot(iris, hue="species", height=1.8)
g.fig.suptitle("Pairplot del dataset Iris", y=1.02)   # título de TODA la figura
plt.show()`)}
${warn("en el script original se escribe <code>plt.title(...)</code> después de <code>pairplot</code>: el título aparece solo sobre el último subgráfico. Las figuras de varios paneles de seaborn (<code>pairplot</code>, <code>FacetGrid</code>, <code>relplot</code>...) devuelven un objeto; usa <code>g.fig.suptitle(...)</code>.")}
${codeBlock(`import seaborn as sns
import matplotlib.pyplot as plt
import pandas as pd

tips = pd.read_csv("tips.csv")
g = sns.FacetGrid(tips, col="smoker", row="sex", margin_titles=True, height=2.4)
g.map(sns.scatterplot, "total_bill", "tip")
g.fig.suptitle("Propinas según sexo y si fuma", y=1.03)
g.set_axis_labels("Cuenta total", "Propina")
plt.show()

sns.regplot(data=tips, x="total_bill", y="tip")       # dispersión + recta de regresión + IC 95 %
plt.title("Regresión entre cuenta y propina")
plt.show()`)}
<h3>Matplotlib frente a Seaborn</h3>
<p>El mismo gráfico con las dos librerías, y guardando cada uno en la carpeta <code>plots</code> como en tu script de comparación:</p>
${codeBlock(`import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np
import os

os.makedirs("plots", exist_ok=True)
np.random.seed(42)
df_cat = pd.DataFrame({"categoría": ["A", "B", "C", "D"], "valores": np.random.randint(10, 100, 4)})
x = np.linspace(0, 10, 100)
df_line = pd.DataFrame({"x": x, "y": np.sin(x) + np.random.normal(0, 0.1, 100)})

fig, axs = plt.subplots(2, 3, figsize=(12, 6))
axs[0, 0].bar(df_cat["categoría"], df_cat["valores"], color="skyblue"); axs[0, 0].set_title("Matplotlib · barras")
sns.barplot(data=df_cat, x="categoría", y="valores", hue="categoría", palette="Set2", legend=False, ax=axs[1, 0])
axs[1, 0].set_title("Seaborn · barras")
axs[0, 1].hist(df_line["y"], bins=20, color="purple"); axs[0, 1].set_title("Matplotlib · histograma")
sns.histplot(df_line["y"], bins=20, color="orange", ax=axs[1, 1]); axs[1, 1].set_title("Seaborn · histograma")
axs[0, 2].boxplot(df_line["y"]); axs[0, 2].set_title("Matplotlib · boxplot")
sns.boxplot(y="y", data=df_line, color="lightblue", ax=axs[1, 2]); axs[1, 2].set_title("Seaborn · boxplot")
plt.tight_layout()
fig.savefig("plots/comparacion.png")
plt.show()

sns.heatmap(df_line.corr(), annot=True, cmap="coolwarm")
plt.title("Seaborn · heatmap (no tiene equivalente directo en Matplotlib)")
plt.savefig("plots/seaborn_heatmap.png")
plt.show()
print(sorted(os.listdir("plots")))`)}
${tip("Las funciones de seaborn aceptan <code>ax=</code>: así puedes colocarlas dentro de una cuadrícula hecha con <code>plt.subplots</code> y mezclar ambas librerías en la misma figura.")}
${warn("<code>sns.barplot(..., palette='Set2')</code> sin <code>hue</code> da un aviso de obsolescencia en seaborn 0.13+. La forma actual es <code>hue='categoría', palette='Set2', legend=False</code>.")}
${concepto("¿Matplotlib o Seaborn?", "Seaborn para explorar datos tabulares rápido (hue, distribuciones, correlaciones, pairplot, regresión). Matplotlib cuando necesitas control fino o gráficos poco estándar. Se combinan: Seaborn dibuja sobre ejes de Matplotlib y todo lo de <code>plt</code> (títulos, límites, guardar) funciona igual.")}
${origen("clase_4/9.SEABORN.py y MATPLOTLIB_vs_SEABORN.py")}
${exercise("Supervivencia en el Titanic", "Con <code>titanic</code>: guarda en <code>tasa</code> una Series con la tasa de supervivencia (media de <code>survived</code>) por <code>class</code>, y dibuja un <code>sns.barplot</code> de supervivencia por clase separando por <code>sex</code> con <code>hue</code>. Guarda el Axes que devuelve en <code>ax</code>.",
`import seaborn as sns
import matplotlib.pyplot as plt
import pandas as pd
titanic = pd.read_csv("titanic.csv")
tasa = None
ax = None
`,
`<p><code>titanic.groupby("class")["survived"].mean()</code> calcula la tasa. Seaborn hace ese mismo cálculo por dentro: <code>sns.barplot(data=titanic, x="class", y="survived", hue="sex")</code> dibuja la media de cada grupo con su intervalo de confianza.</p>`,
`assert tasa is not None and abs(tasa["First"] - 0.6296) < 0.001, f"La tasa de primera clase es ≈ 0.63; tienes {None if tasa is None else tasa.get('First')}"
assert ax is not None and ax.get_xlabel() == "class", "El eje X del barplot debe ser 'class'"
assert ax.get_legend() is not None, "Falta el hue='sex' (no hay leyenda)"`,
`tasa = titanic.groupby("class")["survived"].mean()
print(tasa)
ax = sns.barplot(data=titanic, x="class", y="survived", hue="sex", order=["First", "Second", "Third"])
plt.title("Supervivencia por clase y sexo")
plt.show()`)}
${resumen(["Seaborn trabaja con DataFrames: <code>data=</code>, <code>x=</code>, <code>y=</code>, <code>hue=</code>.", "Distribuciones: <code>histplot</code> (kde), <code>boxplot</code>, <code>violinplot</code>.", "Relaciones: <code>scatterplot</code>, <code>regplot</code>, <code>pairplot</code>, <code>heatmap</code>.", "Paneles: <code>FacetGrid(col=, row=)</code> + <code>map</code>; título general con <code>g.fig.suptitle</code>.", "<code>ax=</code> integra seaborn en figuras de Matplotlib; <code>savefig</code> guarda."])}
${quiz("Quieres ver de un vistazo la relación entre todas las variables numéricas de un DataFrame. ¿Qué usarías?", ["plt.plot", "sns.pairplot o un heatmap de correlaciones", "plt.bar"], 1, "pairplot muestra todas las dispersiones por pares; el heatmap resume las correlaciones numéricamente.")}
</div>`},

{id:27, cat:"Ciencia de datos", title:"Imágenes con PIL (Pillow)", body:()=>`
<div class="theory">
<p><b>PIL</b> (hoy se instala como <code>Pillow</code>) abre, transforma y guarda imágenes. En biología la usarás para preparar figuras, recortar microscopías o convertir imágenes en arrays de NumPy para analizarlas.</p>
${note("El script de clase abre una foto de tu ordenador con <code>Image.open('.../cabeza_partes.png')</code>. Aquí generamos una imagen de prueba (unas 'células' de colores) para poder ejecutar lo mismo. En tu equipo, sustituye esa celda por <code>image = Image.open('tu_foto.png')</code>.")}
${codeBlock(`from PIL import Image, ImageDraw
import random

random.seed(3)
image = Image.new("RGB", (300, 300), (20, 20, 35))           # fondo oscuro, como una microscopía
d = ImageDraw.Draw(image)
for _ in range(25):
    x, y, r = random.randint(20, 280), random.randint(20, 280), random.randint(8, 22)
    color = random.choice([(80, 200, 120), (230, 90, 90), (90, 140, 240)])
    d.ellipse((x - r, y - r, x + r, y + r), fill=color, outline=(255, 255, 255))
    d.ellipse((x - r // 3, y - r // 3, x + r // 3, y + r // 3), fill=(250, 230, 120))   # "núcleo"

print(image.size, image.mode)          # (ancho, alto) y modo de color
mostrar_imagen(image)`)}
<h3>Las seis transformaciones del script, en una sola figura</h3>
${codeBlock(`from PIL import ImageFilter, ImageEnhance
import matplotlib.pyplot as plt

fig, ax = plt.subplots(2, 3, figsize=(10, 7))

ax[0, 0].imshow(image);                                   ax[0, 0].set_title("Original")
ax[0, 1].imshow(image.resize((100, 100)));                ax[0, 1].set_title("Redimensionada 100x100")
ax[0, 2].imshow(image.rotate(45));                        ax[0, 2].set_title("Rotada 45°")
ax[1, 0].imshow(image.filter(ImageFilter.BLUR));          ax[1, 0].set_title("Desenfocada")
ax[1, 1].imshow(image.convert("L"), cmap="gray");         ax[1, 1].set_title("Escala de grises")
ax[1, 2].imshow(ImageEnhance.Contrast(image).enhance(2)); ax[1, 2].set_title("Contraste x2")

for a in ax.flatten():
    a.axis("off")              # aquí sí tiene sentido: las imágenes no necesitan ejes
plt.tight_layout()
plt.show()`)}
${tip("<code>imshow</code> pinta una imagen en un Axes de Matplotlib. Para la escala de grises hay que indicar <code>cmap='gray'</code>; si no, Matplotlib la colorea con su paleta por defecto (viridis).")}
${codeBlock(`from PIL import ImageFilter, ImageEnhance, ImageOps

grande = image.rotate(45, expand=True, fillcolor="white")    # expand=True: no recorta las esquinas
print("Tamaño original:", image.size, "-> rotada con expand:", grande.size)
recorte = image.crop((50, 50, 200, 200))                     # (izquierda, arriba, derecha, abajo)
mostrar_imagen(recorte)
mostrar_imagen(image.filter(ImageFilter.FIND_EDGES))         # detección de bordes
mostrar_imagen(ImageOps.mirror(image.resize((150, 150))))     # espejo

image.save("celulas.png")                                     # guardar en el formato que quieras
print(Image.open("celulas.png").size)`)}
<h3>Una imagen es un array</h3>
${codeBlock(`import numpy as np

arr = np.array(image)
print("Forma:", arr.shape, "-> alto x ancho x canales RGB | tipo:", arr.dtype)
print("Píxel (150, 150):", arr[150, 150])

gris = np.array(image.convert("L"))
mascara = gris > 120                          # umbral: píxeles "brillantes"
print(f"Fracción de la imagen ocupada por células: {mascara.mean():.1%}")
mostrar_imagen(Image.fromarray((mascara * 255).astype(np.uint8)))   # de array a imagen`)}
${concepto("Análisis de imagen", "convertir a escala de grises, aplicar un umbral y contar píxeles es el principio de la cuantificación de microscopías (confluencia celular, área de tinción...). Herramientas como scikit-image u OpenCV llevan esto mucho más lejos, pero parten de la misma idea: la imagen es un array de NumPy.")}
${origen("clase_4/5. PIL.py")}
${exercise("Canal rojo", "Calcula en <code>frac_rojas</code> la fracción de píxeles de <code>image</code> en los que el canal rojo es mayor que 200 y los canales verde y azul son menores que 120 (las 'células rojas'). Usa NumPy sobre <code>np.array(image)</code>.",
`import numpy as np
arr = np.array(image)
frac_rojas = None
`,
`<p><code>arr[:, :, 0]</code> es el canal rojo, <code>arr[:, :, 1]</code> el verde y <code>arr[:, :, 2]</code> el azul. Combina tres condiciones con <code>&amp;</code> y calcula la media de la máscara (la fracción de True).</p>`,
`import numpy as np
a = np.array(image)
esperado = ((a[:, :, 0] > 200) & (a[:, :, 1] < 120) & (a[:, :, 2] < 120)).mean()
assert frac_rojas is not None and abs(frac_rojas - esperado) < 1e-12, f"Esperaba {esperado:.4f}; tienes {frac_rojas}"`,
`r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
frac_rojas = ((r > 200) & (g < 120) & (b < 120)).mean()
print(f"{frac_rojas:.2%}")`)}
${resumen(["<code>Image.open</code>, <code>Image.new</code>, <code>.save</code>; <code>.size</code> y <code>.mode</code>.", "Transformaciones: <code>resize, rotate(expand=True), crop, filter(ImageFilter.BLUR), convert('L')</code>, <code>ImageEnhance.Contrast(...).enhance(2)</code>.", "Para mostrar varias imágenes: <code>plt.subplots</code> + <code>imshow</code> + <code>axis('off')</code>.", "<code>np.array(img)</code> y <code>Image.fromarray(arr)</code> conectan PIL con NumPy."])}
${quiz("<code>np.array(img).shape</code> devuelve <code>(480, 640, 3)</code>. ¿Qué significa?", ["640 filas, 480 columnas y 3 imágenes", "480 píxeles de alto, 640 de ancho y 3 canales de color (RGB)", "Una imagen en escala de grises"], 1, "Los arrays de imagen son (alto, ancho, canales). Ojo: PIL da .size como (ancho, alto), al revés.")}
</div>`}
);
