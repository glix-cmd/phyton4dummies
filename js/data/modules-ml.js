/* Bloque MACHINE LEARNING — scripts de regresión, clasificación, redes neuronales y clustering + Métodos_Supervisados.ipynb */
MODULES.push(

{id:39, cat:"Machine learning", title:"ML I: el flujo de trabajo y la regresión lineal", body:()=>`
<div class="theory">
<p>El <b>aprendizaje automático supervisado</b> consiste en aprender una función a partir de ejemplos con respuesta conocida. Cada ejemplo tiene unas <b>características</b> (la matriz <code>X</code>: edad, IMC, presión...) y un <b>objetivo</b> (<code>y</code>: la progresión de la diabetes). Si el objetivo es un número hablamos de <b>regresión</b>; si es una categoría, de <b>clasificación</b>.</p>
${concepto("El flujo en scikit-learn", "1) separar entrenamiento y prueba con <code>train_test_split</code>, 2) preparar los datos (escalar, codificar) ajustando solo con el entrenamiento, 3) crear el modelo y entrenarlo con <code>.fit(X_train, y_train)</code>, 4) predecir con <code>.predict(X_test)</code> y 5) medir el error con datos que el modelo no ha visto. Todos los modelos de scikit-learn siguen esta misma interfaz.")}
<h3>El conjunto de datos: diabetes</h3>
<p>442 pacientes con 10 variables (edad, sexo, IMC, presión arterial y seis analíticas de suero) y, como objetivo, una medida de la progresión de la enfermedad un año después. Viene incluido en scikit-learn.</p>
${codeBlock(`import pandas as pd
from sklearn import datasets

diabetes = datasets.load_diabetes(scaled=False)       # scaled=False: valores en sus unidades originales
X = pd.DataFrame(diabetes.data, columns=diabetes.feature_names)
y = pd.Series(diabetes.target, name="progresion")

print(X.shape, y.shape)
print(X.head())
print(y.describe().round(1))`)}
${note("Las variables <code>s1</code>-<code>s6</code> son analíticas de suero: colesterol total, LDL, HDL, cociente colesterol/HDL, triglicéridos (en logaritmo) y glucosa. Con <code>scaled=True</code> (el valor por defecto) scikit-learn las devuelve ya centradas y escaladas, y los números no se pueden interpretar.")}
<h3>Entrenar y evaluar una regresión lineal</h3>
${codeBlock(`from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
import numpy as np
import matplotlib.pyplot as plt

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)      # fit SOLO con entrenamiento
X_test_scaled = scaler.transform(X_test)            # al test solo se le aplica

model = LinearRegression()
model.fit(X_train_scaled, y_train)
y_pred = model.predict(X_test_scaled)

mse = mean_squared_error(y_test, y_pred)
print(f"MSE: {mse:.1f} | RMSE: {np.sqrt(mse):.1f} | R²: {r2_score(y_test, y_pred):.3f}")

plt.figure(figsize=(5.5, 4.5))
plt.scatter(y_test, y_pred, alpha=0.6)
plt.plot([y.min(), y.max()], [y.min(), y.max()], "--r")       # predicción perfecta
plt.xlabel("Valores reales"); plt.ylabel("Predicciones"); plt.title("Regresión lineal: real frente a predicho")
plt.grid(alpha=0.3); plt.show()`)}
${concepto("Cómo leer las métricas", "<b>MSE</b> (error cuadrático medio) penaliza mucho los errores grandes y está en unidades al cuadrado. <b>RMSE</b> es su raíz: se lee en las mismas unidades que <code>y</code> (aquí, unos 54 puntos de progresión). <b>R²</b> indica qué fracción de la variabilidad explica el modelo: 1 es perfecto, 0 equivale a predecir siempre la media, y puede ser negativo si el modelo es peor que eso.")}
${warn("ajustar el escalador (o cualquier transformación) con <b>todos</b> los datos antes de separar entrenamiento y prueba. El test 'contamina' el entrenamiento con información que en la realidad no tendrías (<i>data leakage</i>) y las métricas salen optimistas. Por eso <code>fit_transform</code> solo con <code>X_train</code> y <code>transform</code> con <code>X_test</code>.")}
${codeBlock(`# Coeficientes: con los datos escalados son comparables entre sí
coef = pd.Series(model.coef_, index=X.columns).sort_values()
print(coef.round(1))
coef.plot.barh(figsize=(5.5, 3.6), color=["tab:red" if c < 0 else "tab:blue" for c in coef])
plt.title("Peso de cada variable (datos estandarizados)"); plt.tight_layout(); plt.show()`)}
${tip("Triglicéridos (<code>s5</code>) e IMC (<code>bmi</code>) tienen pesos positivos grandes, algo coherente con la clínica. El mayor peso en valor absoluto, sin embargo, es el de <code>s1</code> (colesterol total), <b>negativo</b>, mientras que <code>s2</code> (LDL) sale positivo. No significa que el colesterol proteja: <code>s1</code> y <code>s2</code> están muy correlacionadas y, en ese caso, la regresión reparte los pesos de forma inestable, con signos opuestos que se compensan. Interpreta coeficientes solo con variables poco correlacionadas entre sí.")}
<h3>Otro modelo, la misma interfaz: un árbol de decisión</h3>
${codeBlock(`from sklearn.tree import DecisionTreeRegressor, plot_tree

arbol = DecisionTreeRegressor(max_depth=3, random_state=42)
arbol.fit(X_train_scaled, y_train)
y_pred_arbol = arbol.predict(X_test_scaled)
print(f"Árbol (profundidad 3) -> RMSE: {np.sqrt(mean_squared_error(y_test, y_pred_arbol)):.1f} | R²: {r2_score(y_test, y_pred_arbol):.3f}")

arbol_sin_escalar = DecisionTreeRegressor(max_depth=3, random_state=42).fit(X_train, y_train)
print("Mismo árbol con datos sin escalar, R²:", round(r2_score(y_test, arbol_sin_escalar.predict(X_test)), 3))

plt.figure(figsize=(11, 4.5))
plot_tree(arbol_sin_escalar, feature_names=list(X.columns), filled=True, fontsize=7, impurity=False)
plt.show()`)}
${concepto("Los árboles no necesitan escalar", "un árbol solo pregunta '¿bmi &lt;= 27,3?': cambiar la escala de una variable cambia el umbral pero no la decisión. Por eso los dos árboles dan exactamente el mismo R². El árbol sin escalar, además, se puede leer con valores reales.")}
${warn("en los scripts de clase hay un <code>plt.figure(figsize=(10, 6))</code> repetido antes del gráfico: el primero crea una figura vacía que se queda sin usar. Además <code>y</code> se guardaba como <code>DataFrame</code> de una columna; los modelos funcionan, pero las predicciones salen con forma (n, 1). Para un objetivo único usa una <code>Series</code>.")}
${origen("LinearRegression Diabetes.py")}
${exercise("Un modelo con dos variables", "Entrena una <code>LinearRegression</code> usando solo <code>bmi</code> y <code>s5</code> (sin escalar, con el mismo <code>X_train</code>/<code>X_test</code>) y guarda en <code>r2_dos</code> su R² en el conjunto de prueba. ¿Cuánto se pierde respecto al modelo con las 10 variables?",
`from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score
r2_dos = None
`,
`<p>Selecciona las columnas con <code>X_train[["bmi", "s5"]]</code>, entrena, predice sobre <code>X_test[["bmi", "s5"]]</code> y calcula <code>r2_score</code>. Con solo dos variables se conserva la mayor parte del R²: un modelo sencillo suele ser casi tan bueno y mucho más fácil de explicar.</p>`,
`from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score
_m = LinearRegression().fit(X_train[["bmi", "s5"]], y_train)
_ref = r2_score(y_test, _m.predict(X_test[["bmi", "s5"]]))
assert r2_dos is not None and abs(r2_dos - _ref) < 1e-9, f"Esperaba R² ≈ {_ref:.3f}; tienes {r2_dos}"`,
`m2 = LinearRegression().fit(X_train[["bmi", "s5"]], y_train)
r2_dos = r2_score(y_test, m2.predict(X_test[["bmi", "s5"]]))
print(f"R² con 2 variables: {r2_dos:.3f}")`)}
${resumen(["Supervisado = aprender de ejemplos con respuesta; regresión (número) o clasificación (categoría).", "Flujo: <code>train_test_split</code> → preparar (fit solo con train) → <code>fit</code> → <code>predict</code> → métricas en test.", "MSE, RMSE (unidades de y) y R² (fracción explicada).", "Todos los modelos de scikit-learn comparten la interfaz <code>fit</code>/<code>predict</code>.", "Los árboles no necesitan escalado; los modelos lineales sí, para comparar coeficientes."])}
${quiz("Obtienes R² = 0,95 en entrenamiento y 0,40 en prueba. ¿Qué indica?", ["Que el modelo es excelente", "Sobreajuste: ha memorizado el entrenamiento y generaliza mal", "Que faltan datos de entrenamiento siempre"], 1, "La métrica que importa es la de prueba. Una diferencia grande entre ambas es la firma del sobreajuste (módulo siguiente).")}
</div>`},

{id:40, cat:"Machine learning", title:"ML II: regresión polinómica y sobreajuste", body:()=>`
<div class="theory">
<p>Una recta no siempre basta. La <b>regresión polinómica</b> crea nuevas variables (cuadrados, productos entre variables...) y ajusta una regresión lineal sobre ellas. Cuanto más alto el grado, más flexible el modelo... y más riesgo de que aprenda el ruido de los datos de entrenamiento en lugar del patrón real: el <b>sobreajuste</b>.</p>
<h3>Viviendas de California</h3>
<p>El script de clase usa <code>fetch_california_housing()</code>, que descarga los datos de internet. En el navegador usamos la muestra de 2000 distritos de <code>housing.csv</code> (el mismo censo de 1990) y construimos las mismas variables.</p>
${codeBlock(`import pandas as pd
import matplotlib.pyplot as plt

h = pd.read_csv("housing.csv")
datos = pd.DataFrame({
    "MedInc": h["median_income"],                              # ingreso medio (decenas de miles de $)
    "HouseAge": h["housing_median_age"],
    "AveRooms": h["total_rooms"] / h["households"],            # habitaciones por hogar
    "AveBedrms": h["total_bedrooms"] / h["households"],
    "Population": h["population"],
    "AveOccup": h["population"] / h["households"],             # personas por hogar
    "Latitude": h["latitude"], "Longitude": h["longitude"],
    "House_value": h["median_house_value"] / 100_000,          # en cientos de miles de $
}).dropna()
print(datos.describe().round(2).T[["mean", "min", "max"]])

datos.hist(bins=30, figsize=(11, 7)); plt.tight_layout(); plt.show()`)}
${codeBlock(`from pandas.plotting import scatter_matrix

datos = datos[datos["House_value"] < 4.5]          # quitamos el tope artificial de 500 000 $
print(datos.corr()["House_value"].sort_values(ascending=False).round(2))
scatter_matrix(datos[["MedInc", "HouseAge", "AveRooms", "House_value"]], figsize=(8, 7), alpha=0.3)
plt.show()`)}
${note("En los datos originales, todas las viviendas de más de 500 000 $ se registraron como 500 001 $: es un valor <b>censurado</b>, no real. Quitarlas evita que el modelo intente aprender ese 'techo' artificial.")}
<h3>Pipeline: escalar, crear términos polinómicos y ajustar</h3>
${codeBlock(`from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, PolynomialFeatures
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import root_mean_squared_error, r2_score

X = datos.drop(columns="House_value")
y = datos["House_value"]
X_train, X_test, y_train, y_test = train_test_split(X, y, train_size=0.8, random_state=42)

def modelo_polinomico(grado):
    return Pipeline([("estandarizado", StandardScaler()),
                     ("polinomio", PolynomialFeatures(degree=grado)),
                     ("regresion", LinearRegression())])

modelo = modelo_polinomico(1).fit(X_train, y_train)          # todo el pipeline se ajusta solo con train
y_pred = modelo.predict(X_test)
print(f"Grado 1 -> RMSE: {root_mean_squared_error(y_test, y_pred):.3f} | R²: {r2_score(y_test, y_pred):.3f}")
print("Variables tras PolynomialFeatures de grado 2:", PolynomialFeatures(2).fit(X_train).n_output_features_)`)}
${concepto("Pipeline", "encadena pasos de preparación y un modelo final en un único objeto. <code>pipeline.fit(X_train, y_train)</code> ajusta cada paso solo con el entrenamiento y <code>pipeline.predict(X_test)</code> aplica las mismas transformaciones al test. Es la forma más segura de evitar fugas de información.")}
<h3>La curva del sobreajuste</h3>
${codeBlock(`import numpy as np

grados = [0, 1, 2, 3]
error_train, error_test = [], []
for g in grados:
    m = modelo_polinomico(g).fit(X_train, y_train)
    error_train.append(root_mean_squared_error(y_train, m.predict(X_train)))
    error_test.append(root_mean_squared_error(y_test, m.predict(X_test)))
    print(f"grado {g}: {PolynomialFeatures(g).fit(X_train).n_output_features_:4d} variables | "
          f"RMSE train {error_train[-1]:.3f} | RMSE test {error_test[-1]:.3f}")

fig, ax = plt.subplots(figsize=(7, 4))
ax.plot(grados, error_train, "b-o", label="Entrenamiento")
ax.plot(grados, error_test, "r-o", label="Prueba")
ax.set_xlabel("Grado del polinomio"); ax.set_ylabel("RMSE (cientos de miles de $)"); ax.set_xticks(grados)
ax.set_title("Más complejidad: menos error en train, pero no en test"); ax.legend(); ax.grid(alpha=0.3)
plt.show()`)}
${warn("en el script original las listas están <b>cruzadas</b>: <code>error_test.append(...)</code> guarda el error de <i>entrenamiento</i> y <code>error_train.append(...)</code> el de <i>prueba</i>. El código no falla, pero las gráficas dicen lo contrario de lo que pasa. Además, el pipeline se ajustaba con todo <code>X</code> antes de separar los datos. Revisa siempre que cada nombre guarda lo que dice.")}
${concepto("Grado 0 = la línea base", "con grado 0, <code>PolynomialFeatures</code> solo genera una columna de unos: el modelo predice siempre la media. Cualquier modelo útil tiene que mejorar ese error. Con grado 3 hay 165 variables para unos 1500 distritos: el error de entrenamiento baja, pero el de prueba se dispara.")}
${staticCode(`from sklearn.datasets import fetch_california_housing   # descarga 20 640 distritos (requiere internet en tu ordenador)
dataset = fetch_california_housing()
datos = pd.DataFrame(dataset.data, columns=dataset.feature_names)
datos["House_value"] = dataset.target`, "Datos completos con scikit-learn (en tu ordenador)")}
${origen("PolynomialRegression California.py y clase_8_repaso/Script4.py")}
${exercise("Elegir el grado", "Prueba los grados 1, 2 y 3 con <code>modelo_polinomico</code> y guarda en <code>mejor_grado</code> el que consigue el menor RMSE en el conjunto de <b>prueba</b>.",
`mejor_grado = None
`,
`<p>Calcula el RMSE de prueba de cada grado (por ejemplo en un diccionario <code>{grado: rmse}</code>) y elige el mínimo con <code>min(d, key=d.get)</code>. El mejor modelo no es el más complejo, sino el que mejor generaliza.</p>`,
`_d = {g: root_mean_squared_error(y_test, modelo_polinomico(g).fit(X_train, y_train).predict(X_test)) for g in (1, 2, 3)}
assert mejor_grado == min(_d, key=_d.get), f"Los RMSE de prueba son {({k: round(v, 3) for k, v in _d.items()})}; el mejor grado no es {mejor_grado}"`,
`rmse = {g: root_mean_squared_error(y_test, modelo_polinomico(g).fit(X_train, y_train).predict(X_test)) for g in (1, 2, 3)}
mejor_grado = min(rmse, key=rmse.get)
print(rmse, "->", mejor_grado)`)}
${resumen(["<code>PolynomialFeatures(degree=g)</code> crea potencias y productos de las variables.", "<code>Pipeline</code> encadena preparación y modelo y evita fugas de información.", "Sobreajuste: el error de entrenamiento baja con la complejidad; el de prueba deja de bajar y sube.", "Elige la complejidad mirando el error de prueba (o mejor, validación cruzada)."])}
${quiz("Con grado 3 el RMSE de entrenamiento es el más bajo de todos. ¿Es el mejor modelo?", ["Sí, siempre", "No necesariamente: hay que mirar el error en datos no vistos", "Sí, si tiene más variables"], 1, "Un error de entrenamiento bajo puede ser memorización. La capacidad de generalizar se mide en prueba.")}
</div>`},

{id:41, cat:"Machine learning", title:"ML III: clasificación y fronteras de decisión", body:()=>`
<div class="theory">
<p>Un clasificador divide el espacio de las características en regiones, una por clase. La línea que las separa es la <b>frontera de decisión</b>. Dibujarla con datos de dos dimensiones es la mejor manera de entender qué hace cada algoritmo: los lineales trazan rectas, los árboles cortan en escalones y las redes neuronales y los SVM pueden curvarse.</p>
<h3>Herramientas del cuaderno de clase</h3>
${codeBlock(`import numpy as np
import matplotlib.pyplot as plt
import sklearn.datasets

def plot_decision_boundary(model, X, y, ax=None):
    """Colorea el plano según la clase que predice model (X tiene forma (2, m))."""
    ax = ax or plt.gca()
    x_min, x_max = X[0, :].min() - 1, X[0, :].max() + 1
    y_min, y_max = X[1, :].min() - 1, X[1, :].max() + 1
    xx, yy = np.meshgrid(np.arange(x_min, x_max, 0.02), np.arange(y_min, y_max, 0.02))
    Z = model(np.c_[xx.ravel(), yy.ravel()]).reshape(xx.shape)
    ax.contourf(xx, yy, Z, cmap=plt.cm.Spectral, alpha=0.8)
    ax.scatter(X[0, :], X[1, :], c=y.flatten(), cmap=plt.cm.Spectral, s=14, edgecolors="k", linewidths=0.3)

def load_planar_dataset():
    """La 'flor': dos clases entrelazadas en forma de pétalos."""
    np.random.seed(1)
    m, D, a = 400, 2, 4
    N = m // 2
    X = np.zeros((m, D)); Y = np.zeros((m, 1), dtype="uint8")
    for j in range(2):
        ix = range(N * j, N * (j + 1))
        t = np.linspace(j * 3.12, (j + 1) * 3.12, N) + np.random.randn(N) * 0.2
        r = a * np.sin(4 * t) + np.random.randn(N) * 0.2
        X[ix] = np.c_[r * np.sin(t), r * np.cos(t)]
        Y[ix] = j
    return X.T, Y.T

X, Y = load_planar_dataset()
print("Dimensiones de X:", X.shape, "| de Y:", Y.shape, "| m =", Y.shape[1])
plt.figure(figsize=(5, 4.5)); plt.scatter(X[0, :], X[1, :], c=Y.flatten(), s=20, cmap=plt.cm.Spectral); plt.title("Dataset 'flor'"); plt.show()`)}
${note("El cuaderno guarda los datos con forma <code>(características, ejemplos)</code>, al revés de lo habitual en scikit-learn, que espera <code>(ejemplos, características)</code>. Por eso aparece tanto <code>X.T</code>. Y como <code>Y</code> es una matriz (1, m), conviene pasar <code>Y.ravel()</code>: un vector de una dimensión. Con <code>Y.T</code> scikit-learn da un aviso <i>DataConversionWarning</i>.")}
<h3>Seis clasificadores, una misma frontera que aprender</h3>
${codeBlock(`import sklearn.linear_model, sklearn.preprocessing, sklearn.svm, sklearn.tree, sklearn.ensemble, sklearn.neural_network
from sklearn.pipeline import make_pipeline
from sklearn.metrics import accuracy_score

modelos = {
    "Regresión logística": sklearn.linear_model.LogisticRegression(random_state=42),
    "Logística polinómica (grado 5)": make_pipeline(sklearn.preprocessing.PolynomialFeatures(5),
                                                    sklearn.linear_model.LogisticRegression(max_iter=5000, random_state=42)),
    "SVM (kernel rbf)": sklearn.svm.SVC(kernel="rbf", random_state=42),
    "Árbol (profundidad 4)": sklearn.tree.DecisionTreeClassifier(max_depth=4, random_state=42),
    "Random forest (30 árboles)": sklearn.ensemble.RandomForestClassifier(n_estimators=30, max_depth=4, random_state=42),
    "Red neuronal (50, 50, 50)": sklearn.neural_network.MLPClassifier(hidden_layer_sizes=(50, 50, 50), max_iter=1000, random_state=42),
}
fig, axs = plt.subplots(2, 3, figsize=(13, 8))
for ax, (nombre, clf) in zip(axs.flatten(), modelos.items()):
    clf.fit(X.T, Y.ravel())
    acc = accuracy_score(Y.ravel(), clf.predict(X.T))
    plot_decision_boundary(lambda x: clf.predict(x), X, Y, ax=ax)
    ax.set_title(f"{nombre}\\naccuracy (train) = {acc:.2f}", fontsize=10)
plt.tight_layout(); plt.show()`)}
${concepto("Lineal frente a no lineal", "la regresión logística solo puede trazar una recta, así que con la flor se queda en torno al 47 %: peor que tirar una moneda. Añadir términos polinómicos, usar un kernel (SVM) o capas ocultas (red neuronal) permite fronteras curvas. Los árboles y los random forest cortan el plano con líneas horizontales y verticales.")}
${warn("en el cuaderno, la red neuronal usa <code>activation='identity'</code>. Con esa activación, todas las capas son transformaciones lineales y su composición también lo es: la red, por grande que sea, equivale a una regresión logística y traza una recta. La no linealidad está en la activación (<code>'relu'</code>, el valor por defecto, o <code>'tanh'</code>). Y en la logística polinómica, el <code>lambda</code> del dibujo llamaba a <code>polinomio.fit_transform</code>: para datos nuevos se usa <code>transform</code>.")}
<h3>La trampa del accuracy de entrenamiento</h3>
<p>Todas las medidas del cuaderno son sobre los mismos datos con los que se entrena. Veamos qué pasa al separar una parte para prueba, con las 'lunas' de <code>make_moons</code>.</p>
${codeBlock(`from sklearn.model_selection import train_test_split
import pandas as pd

Xm, ym = sklearn.datasets.make_moons(n_samples=400, noise=0.3, random_state=0)
Xm_train, Xm_test, ym_train, ym_test = train_test_split(Xm, ym, test_size=0.3, random_state=42)

filas = []
for nombre, clf in modelos.items():
    clf.fit(Xm_train, ym_train)
    filas.append({"modelo": nombre,
                  "train": accuracy_score(ym_train, clf.predict(Xm_train)),
                  "test": accuracy_score(ym_test, clf.predict(Xm_test))})
tabla = pd.DataFrame(filas).set_index("modelo")
tabla["diferencia"] = tabla["train"] - tabla["test"]
print(tabla.round(3).sort_values("test", ascending=False))`)}
${tip("Fíjate en la columna <i>diferencia</i>: cuanto mayor es, más se ha ajustado el modelo a los datos que ya conoce. Prueba a cambiar <code>max_depth</code> del árbol (con 12 roza el 100 % en entrenamiento) o el <code>noise</code> de las lunas, y observa cómo se mueven las dos columnas.")}
${staticCode(`def load_extra_datasets():
    N = 200
    noisy_circles = sklearn.datasets.make_circles(n_samples=N, factor=.5, noise=.3)
    noisy_moons = sklearn.datasets.make_moons(n_samples=N, noise=.2)
    blobs = sklearn.datasets.make_blobs(n_samples=N, random_state=5, n_features=2, centers=6)
    gaussian_quantiles = sklearn.datasets.make_gaussian_quantiles(mean=None, cov=0.5, n_samples=N, n_features=2, n_classes=3)
    return noisy_circles, noisy_moons, blobs, gaussian_quantiles

noisy_circles, noisy_moons, blobs, gaussian_quantiles = load_extra_datasets()
X, Y = noisy_circles
X, Y = X.T, Y.reshape(1, Y.shape[0])          # al formato (características, ejemplos) del cuaderno`, "Otros datasets del cuaderno (también funcionan aquí: cópialo en una celda)")}
${origen("Métodos_Supervisados.ipynb")}
${exercise("La profundidad justa", "Con las lunas (<code>Xm_train</code>, <code>Xm_test</code>...), entrena un <code>DecisionTreeClassifier(max_depth=d, random_state=42)</code> para cada profundidad de 1 a 12 y guarda en <code>mejor_profundidad</code> la de mayor accuracy en <b>prueba</b> (si hay empate, la menor).",
`from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score
mejor_profundidad = None
`,
`<p>Guarda los accuracy de prueba en un diccionario y busca el máximo. <code>max(d, key=d.get)</code> devuelve, en caso de empate, la primera clave que alcanza el máximo, que es la menor profundidad porque las insertas en orden.</p>`,
`from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score
_d = {p: accuracy_score(ym_test, DecisionTreeClassifier(max_depth=p, random_state=42).fit(Xm_train, ym_train).predict(Xm_test)) for p in range(1, 13)}
assert mejor_profundidad == max(_d, key=_d.get), f"La mejor profundidad en test es {max(_d, key=_d.get)}; tienes {mejor_profundidad}"`,
`acc = {p: accuracy_score(ym_test, DecisionTreeClassifier(max_depth=p, random_state=42).fit(Xm_train, ym_train).predict(Xm_test))
       for p in range(1, 13)}
mejor_profundidad = max(acc, key=acc.get)
print({p: round(a, 3) for p, a in acc.items()}, "->", mejor_profundidad)`)}
${resumen(["La frontera de decisión muestra cómo separa cada modelo el espacio.", "Lineales: regresión logística; no lineales: polinomios, SVM con kernel, árboles, bosques y redes neuronales.", "Una red neuronal sin activación no lineal es un modelo lineal.", "El accuracy de entrenamiento no mide generalización: separa siempre un conjunto de prueba."])}
${quiz("¿Por qué un random forest suele generalizar mejor que un único árbol profundo?", ["Porque usa redes neuronales", "Porque promedia muchos árboles entrenados con muestras distintas, lo que reduce la varianza", "Porque no necesita datos de entrenamiento"], 1, "Cada árbol sobreajusta a su manera; al votar entre todos, esos errores se compensan.")}
</div>`},

{id:42, cat:"Machine learning", title:"ML IV: evaluar clasificadores con datos reales (pingüinos)", body:()=>`
<div class="theory">
<p>El dataset <b>Palmer Penguins</b> recoge medidas de 344 pingüinos de tres especies (Adelia, barbijo y papúa) de tres islas de la Antártida. Es un buen caso real: variables numéricas y categóricas, valores que faltan y una pregunta clara: ¿se puede saber la especie a partir de las medidas?</p>
${codeBlock(`import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

penguins = pd.read_csv("penguins.csv")        # en tu ordenador: sns.load_dataset("penguins")
print(penguins.head())
print(penguins.isnull().sum())

fig, axs = plt.subplots(1, 2, figsize=(11, 4))
sns.countplot(data=penguins, x="species", hue="species", palette="pastel", legend=False, ax=axs[0])
axs[0].set_title("Individuos por especie")
sns.scatterplot(data=penguins, x="bill_length_mm", y="body_mass_g", hue="species", style="species", ax=axs[1])
axs[1].set_title("Longitud del pico frente a masa corporal")
plt.tight_layout(); plt.show()`)}
${codeBlock(`g = sns.pairplot(penguins, hue="species", diag_kind="kde", height=1.8)
g.fig.suptitle("Distribución del dataset Penguins", y=1.02)
plt.show()`)}
<h3>Preparar los datos: nulos y variables categóricas</h3>
${codeBlock(`import numpy as np
from sklearn.model_selection import train_test_split

penguins = penguins.dropna()
y = penguins["species"]
X = pd.get_dummies(penguins.drop(columns="species"))      # island y sex -> columnas 0/1
print(X.columns.tolist())

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
print("Entrenamiento:", X_train.shape, "| prueba:", X_test.shape)
print(y_test.value_counts())`)}
${tip("<code>stratify=y</code> mantiene la proporción de especies en entrenamiento y prueba. Con clases desequilibradas o pocos datos, sin estratificar podrías quedarte con muy pocos barbijos en el test.")}
<h3>El enfoque del script y el enfoque correcto</h3>
${codeBlock(`from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.metrics import accuracy_score

# 1) Como en el script: regresión LINEAL sobre la especie codificada en 3 columnas 0/1, y argmax
encoder = OneHotEncoder(sparse_output=False)
Y_train = encoder.fit_transform(y_train.to_frame())
lineal = LinearRegression().fit(X_train, Y_train)
pred_lineal = encoder.categories_[0][np.argmax(lineal.predict(X_test), axis=1)]
print("Regresión lineal + argmax -> accuracy:", round(accuracy_score(y_test, pred_lineal), 3))
print("Una 'probabilidad' que da la regresión lineal:", lineal.predict(X_test.iloc[[0]]).round(2))

# 2) Lo habitual: un clasificador (regresión logística) con los datos escalados
logistica = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))
logistica.fit(X_train, y_train)
pred = logistica.predict(X_test)
print("Regresión logística      -> accuracy:", round(accuracy_score(y_test, pred), 3))
print("Probabilidades de verdad:", logistica.predict_proba(X_test.iloc[[0]]).round(3))`)}
${concepto("¿Por qué no regresión lineal para clasificar?", "la regresión lineal predice números sin límite: puede devolver −0,2 o 1,3 para una 'probabilidad'. Con datos tan separables como estos acierta igual al quedarse con el máximo, pero no da probabilidades válidas y falla en cuanto las clases se solapan. La <b>regresión logística</b> (a pesar del nombre, es un clasificador) devuelve probabilidades entre 0 y 1 que suman 1.")}
<h3>Matriz de confusión e informe de clasificación</h3>
${codeBlock(`from sklearn.metrics import confusion_matrix, classification_report

especies = logistica.classes_
cm = confusion_matrix(y_test, pred, labels=especies)
plt.figure(figsize=(5.5, 4.5))
sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", xticklabels=especies, yticklabels=especies)
plt.xlabel("Predicción"); plt.ylabel("Real"); plt.title("Matriz de confusión"); plt.show()
print(classification_report(y_test, pred))`)}
${concepto("Precisión, sensibilidad y F1", "<b>precisión</b>: de los que el modelo llamó 'Gentoo', cuántos lo eran. <b>Sensibilidad</b> (<i>recall</i>): de los Gentoo reales, cuántos encontró. <b>F1</b>: la media armónica de ambas. En diagnóstico es crucial distinguirlas: un test con mucha sensibilidad y poca precisión da muchos falsos positivos.")}
${origen("PenguinsLinearRegression.py")}
${exercise("¿Qué medidas bastan?", "Entrena el mismo pipeline (<code>StandardScaler</code> + <code>LogisticRegression(max_iter=1000)</code>) usando solo <code>bill_length_mm</code> y <code>bill_depth_mm</code>, con el mismo <code>X_train</code>/<code>X_test</code>. Guarda en <code>acc_pico</code> el accuracy en prueba.",
`from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
acc_pico = None
`,
`<p>Selecciona las dos columnas con <code>X_train[["bill_length_mm", "bill_depth_mm"]]</code>. Las medidas del pico solas ya aciertan en torno al 95 %: longitud y profundidad juntas distinguen a los barbijos (pico largo y profundo) de los Adelia (pico corto) y de los papúa (pico largo y estrecho).</p>`,
`from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
_c = ["bill_length_mm", "bill_depth_mm"]
_m = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)).fit(X_train[_c], y_train)
_ref = accuracy_score(y_test, _m.predict(X_test[_c]))
assert acc_pico is not None and abs(acc_pico - _ref) < 1e-9, f"Esperaba {_ref:.3f}; tienes {acc_pico}"`,
`cols = ["bill_length_mm", "bill_depth_mm"]
m = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)).fit(X_train[cols], y_train)
acc_pico = accuracy_score(y_test, m.predict(X_test[cols]))
print(round(acc_pico, 3))`)}
${resumen(["Limpia nulos y convierte categóricas con <code>pd.get_dummies</code> o <code>OneHotEncoder</code>.", "<code>stratify=y</code> conserva las proporciones de clase al dividir.", "Para clasificar, usa un clasificador (logística, árbol, SVM...), no una regresión lineal.", "Matriz de confusión + precisión, sensibilidad y F1 dicen dónde se equivoca el modelo."])}
${quiz("Un modelo detecta el 95 % de los pacientes enfermos, pero la mitad de sus positivos son falsas alarmas. ¿Qué tiene alto y qué bajo?", ["Precisión alta, sensibilidad baja", "Sensibilidad alta, precisión baja", "Las dos altas"], 1, "Encuentra casi a todos los enfermos (sensibilidad) pero se equivoca a menudo cuando dice 'enfermo' (precisión).")}
</div>`},

{id:43, cat:"Machine learning", title:"ML V: texto y redes neuronales (opiniones y dígitos)", body:()=>`
<div class="theory">
<p>Los modelos solo entienden números. Para clasificar texto hay que convertirlo antes en una tabla: la <b>bolsa de palabras</b> cuenta cuántas veces aparece cada palabra en cada documento. Y para imágenes, cada píxel es una variable. En este módulo verás ambos casos.</p>
<h3>¿Opinión positiva o negativa? Reseñas de productos de bebé en Amazon</h3>
<p>Usamos una muestra de 3000 reseñas del archivo de clase (el original tiene 53 000). Etiquetamos como positivas las de 4 y 5 estrellas.</p>
${codeBlock(`import pandas as pd

products = pd.read_csv("amazon_baby_muestra.csv")
print(products.isnull().sum())
products = products.dropna(subset=["review"])
print(products["rating"].value_counts().sort_index())
print(products["review"].iloc[0][:300])`)}
${note("En este archivo no hay ninguna reseña de 3 estrellas: el conjunto se preparó así para que la frontera entre positivo (4-5) y negativo (1-2) sea clara. Por eso el umbral <code>x &lt;= 3</code> del script equivale a <code>x &lt;= 2</code>.")}
${codeBlock(`import string

stopwords_english = {"a", "about", "above", "after", "again", "all", "am", "an", "and", "any", "are", "as", "at", "be",
    "because", "been", "before", "being", "below", "between", "both", "but", "by", "could", "did", "do", "does", "doing",
    "down", "during", "each", "few", "for", "from", "further", "had", "has", "have", "having", "he", "her", "here", "hers",
    "him", "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself", "me", "more", "most", "my", "myself", "of",
    "off", "on", "once", "only", "or", "other", "our", "ours", "out", "over", "own", "same", "she", "should", "so", "some",
    "such", "than", "that", "the", "their", "them", "then", "there", "these", "they", "this", "those", "through", "to", "too",
    "under", "until", "up", "very", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom", "why",
    "will", "with", "would", "you", "your", "yours"}
# 'no', 'not', 'nor' NO están en la lista a propósito: cambian el sentido de la frase

def text_treatment(texto):
    texto = texto.lower()                                                      # 1) minúsculas
    texto = texto.translate(str.maketrans(string.punctuation, " " * len(string.punctuation)))  # 2) sin puntuación
    palabras = [p for p in texto.split() if not p.startswith("@") and p not in stopwords_english]  # 3) filtrar
    return " ".join(palabras)

products["review_filtrada"] = products["review"].apply(text_treatment)
print(products["review"].iloc[1][:160])
print("->", products["review_filtrada"].iloc[1][:160])`)}
${warn("el orden importa. En el script, las <i>stopwords</i> se eliminan <b>antes</b> de pasar a minúsculas y de quitar la puntuación: 'The', 'It' o 'great!' no coinciden con 'the', 'it' o 'great' y se cuelan. Además, la lista original incluía 'no', 'not' y 'nor': para análisis de sentimiento eliminarlas es un error, porque 'not good' pasa a ser 'good'.")}
${codeBlock(`from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

X = products["review_filtrada"]
y = products["rating"].apply(lambda x: 0 if x <= 3 else 1)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=14)

vectorizer = CountVectorizer(min_df=2)                      # palabras que aparecen al menos en 2 reseñas
train_matrix = vectorizer.fit_transform(X_train)            # el vocabulario se aprende SOLO del entrenamiento
test_matrix = vectorizer.transform(X_test)
print("Tamaño de la bolsa de palabras:", train_matrix.shape)

model = LogisticRegression(max_iter=1000).fit(train_matrix, y_train)
y_pred = model.predict(test_matrix)
print("Accuracy en prueba:", round(accuracy_score(y_test, y_pred), 3))
print(classification_report(y_test, y_pred, target_names=["negativa", "positiva"]))`)}
${concepto("Matriz dispersa", "con miles de palabras posibles, cada reseña usa unas pocas: casi todo son ceros. <code>CountVectorizer</code> devuelve una <b>matriz dispersa</b> que solo guarda los valores distintos de cero. No la conviertas a una tabla normal (<code>.toarray()</code>) con datos grandes: ocuparía gigas de memoria.")}
${codeBlock(`import numpy as np
import matplotlib.pyplot as plt

palabras = pd.DataFrame({"palabra": vectorizer.get_feature_names_out(), "coeficiente": model.coef_[0]})
top = pd.concat([palabras.nsmallest(10, "coeficiente"), palabras.nlargest(10, "coeficiente")])
plt.figure(figsize=(7, 5))
plt.barh(top["palabra"], top["coeficiente"], color=["tab:red" if c < 0 else "tab:green" for c in top["coeficiente"]])
plt.title("Palabras que más empujan hacia negativa (rojo) o positiva (verde)"); plt.tight_layout(); plt.show()

conf_matrix = confusion_matrix(y_test, y_pred)
plt.figure(figsize=(4.5, 4))
plt.imshow(conf_matrix, cmap="Blues")
for i, j in np.ndindex(conf_matrix.shape):
    plt.text(j, i, conf_matrix[i, j], ha="center", va="center", color="white" if conf_matrix[i, j] > conf_matrix.max() / 2 else "black")
plt.xticks([0, 1], ["negativa", "positiva"]); plt.yticks([0, 1], ["negativa", "positiva"])
plt.xlabel("Predicción"); plt.ylabel("Realidad"); plt.title("Matriz de confusión"); plt.colorbar(); plt.show()`)}
${tip("Los coeficientes de la regresión logística son interpretables: cada palabra suma o resta 'positividad'. Es una gran ventaja frente a modelos más complejos. Si una palabra rara aparece arriba del todo, sospecha: con pocos datos, el modelo puede aferrarse a palabras que salen en una sola reseña.")}
<h3>Redes neuronales: reconocer dígitos escritos a mano</h3>
<p>El script de clase usa MNIST (70 000 imágenes de 28×28 px), que se descarga de OpenML. En el navegador usamos <code>load_digits</code>, incluido en scikit-learn: 1797 dígitos de 8×8 px. El procedimiento es idéntico.</p>
${codeBlock(`from sklearn.datasets import load_digits
from sklearn.neural_network import MLPClassifier

digits = load_digits()
X_img, y_img = digits.data, digits.target          # cada imagen 8x8 = 64 variables (intensidad 0-16)
fig, axs = plt.subplots(1, 6, figsize=(9, 2))
for ax, img, etiqueta in zip(axs, digits.images, digits.target):
    ax.imshow(img, cmap="gray_r"); ax.set_title(f"Número {etiqueta}"); ax.axis("off")
plt.show()

Xd_train, Xd_test, yd_train, yd_test = train_test_split(X_img / 16, y_img, test_size=0.2, random_state=42)   # /16: escala 0-1
mlp = MLPClassifier(hidden_layer_sizes=(128, 64), max_iter=300, alpha=0.001, solver="adam", random_state=1)
mlp.fit(Xd_train, yd_train)
yd_pred = mlp.predict(Xd_test)
print("Accuracy en prueba:", round(accuracy_score(yd_test, yd_pred), 3))`)}
${codeBlock(`fig, axs = plt.subplots(1, 2, figsize=(11, 4.2))
axs[0].plot(mlp.loss_curve_); axs[0].set_xlabel("Época"); axs[0].set_ylabel("Pérdida"); axs[0].set_title("Curva de aprendizaje")
cm = confusion_matrix(yd_test, yd_pred)
axs[1].imshow(cm, cmap="Blues")
for i, j in np.ndindex(cm.shape):
    if cm[i, j]: axs[1].text(j, i, cm[i, j], ha="center", va="center", fontsize=8, color="white" if cm[i, j] > cm.max() / 2 else "black")
axs[1].set_xticks(range(10)); axs[1].set_yticks(range(10)); axs[1].set_xlabel("Predicción"); axs[1].set_ylabel("Realidad")
axs[1].set_title("Matriz de confusión"); plt.tight_layout(); plt.show()

errores = np.where(yd_test != yd_pred)[0][:6]
fig, axs = plt.subplots(1, len(errores), figsize=(1.6 * len(errores), 2))
for ax, i in zip(np.atleast_1d(axs), errores):
    ax.imshow(Xd_test[i].reshape(8, 8), cmap="gray_r"); ax.set_title(f"real {yd_test[i]} / pred {yd_pred[i]}", fontsize=8); ax.axis("off")
plt.show()`)}
${concepto("Épocas y convergencia", "una <b>época</b> es una pasada completa por los datos de entrenamiento. La curva de pérdida debe bajar y estabilizarse. En el script de MNIST, <code>max_iter=15</code> corta el entrenamiento antes: scikit-learn avisa con <i>ConvergenceWarning</i>. Con MNIST y 15 épocas el resultado ya es bueno, pero conviene saber qué significa el aviso.")}
${staticCode(`from sklearn.datasets import fetch_openml
mnist = fetch_openml("mnist_784", version=1)              # ~50 MB, requiere internet
X, y = mnist["data"], mnist["target"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
X_train, X_test = X_train / 255, X_test / 255             # píxeles 0-255 -> 0-1
mlp = MLPClassifier(hidden_layer_sizes=(128, 64), max_iter=15, alpha=0.001, solver="adam", random_state=1, verbose=10)
mlp.fit(X_train, y_train)
print(accuracy_score(y_test, mlp.predict(X_test)))       # en torno a 0,97-0,98`, "MNIST completo (en tu ordenador o en Colab)")}
${origen("LinerRegressionBabyAmazon.py, amazon_baby.csv y MPL Classifier Mnist.py")}
${exercise("Tu propio clasificador de opiniones", "Escribe <code>predecir_opinion(texto)</code> que limpie el texto con <code>text_treatment</code>, lo transforme con <code>vectorizer</code> y devuelva <code>1</code> si <code>model</code> predice positiva y <code>0</code> si negativa. Pruébala con tus propias frases.",
`def predecir_opinion(texto):
    pass

print(predecir_opinion("Great product, my baby loves it. Highly recommend!"))
print(predecir_opinion("It broke after two days. Waste of money, very disappointed."))
`,
`<p>El texto nuevo debe pasar exactamente por el mismo proceso que los datos de entrenamiento: <code>vectorizer.transform([text_treatment(texto)])</code> (en una lista, porque espera varios documentos) y después <code>model.predict(...)[0]</code>.</p>`,
`assert predecir_opinion("Great product, my baby loves it. Highly recommend!") == 1, "Una opinión claramente positiva debería dar 1"
assert predecir_opinion("It broke after two days. Waste of money, very disappointed.") == 0, "Una opinión claramente negativa debería dar 0"`,
`def predecir_opinion(texto):
    return int(model.predict(vectorizer.transform([text_treatment(texto)]))[0])`)}
${resumen(["Texto → números: limpieza (minúsculas, puntuación, stopwords) y bolsa de palabras con <code>CountVectorizer</code>.", "Ajusta el vocabulario solo con el entrenamiento y transforma igual cualquier texto nuevo.", "Los coeficientes de la regresión logística indican qué palabras pesan más.", "<code>MLPClassifier</code>: capas ocultas, épocas y curva de pérdida; escala las entradas a 0-1."])}
${quiz("Entrenas el <code>CountVectorizer</code> con todas las reseñas antes de separar train y test. ¿Qué problema hay?", ["Ninguno", "Fuga de información: el vocabulario incluye palabras que solo aparecen en el test", "El modelo no se puede entrenar"], 1, "Igual que con el escalado: todo lo que el modelo 'aprende', incluido el vocabulario, debe salir solo del entrenamiento.")}
</div>`},

{id:44, cat:"Machine learning", title:"ML VI: aprendizaje no supervisado (clustering)", body:()=>`
<div class="theory">
<p>Hasta ahora cada ejemplo tenía una respuesta. En el <b>aprendizaje no supervisado</b> no hay etiquetas: el objetivo es descubrir estructura en los datos, por ejemplo grupos (<b>clusters</b>) de elementos parecidos. En biología se usa para agrupar genes con perfiles de expresión similares, tipos celulares en single-cell o pacientes con características comunes.</p>
<h3>Los datos: posiciones geográficas</h3>
<p>Los scripts de clase agrupan puntos por <code>Latitud</code> y <code>Longitud</code> leídos de <code>Posiciones.xlsx</code>, un archivo que no tenemos. Usamos las coordenadas reales de los 2000 distritos de <code>housing.csv</code>: el mismo problema, con datos que conocemos.</p>
${codeBlock(`import pandas as pd
import matplotlib.pyplot as plt
from sklearn.preprocessing import StandardScaler

df = pd.read_csv("housing.csv")[["latitude", "longitude"]].rename(columns={"latitude": "Latitud", "longitude": "Longitud"})
X = df[["Latitud", "Longitud"]]

plt.figure(figsize=(6, 5.5))
plt.scatter(df["Longitud"], df["Latitud"], s=8, color="gray")
plt.xlabel("Longitud"); plt.ylabel("Latitud"); plt.title("Distritos de California"); plt.show()

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)`)}
<h3>K-means: k grupos alrededor de k centros</h3>
${codeBlock(`from sklearn.cluster import KMeans

num_clusters = 4
kmeans = KMeans(n_clusters=num_clusters, random_state=42, n_init=10)
kmeans.fit(X_scaled)
df["cluster"] = kmeans.labels_
print(df["cluster"].value_counts().sort_index())

centros = scaler.inverse_transform(kmeans.cluster_centers_)      # volvemos a grados
fig, ax = plt.subplots(figsize=(6.5, 5.5))
sc = ax.scatter(df["Longitud"], df["Latitud"], c=df["cluster"], cmap="viridis", s=10)
ax.scatter(centros[:, 1], centros[:, 0], marker="^", edgecolor="black", c="red", s=220, label="Centros")
ax.set_xlabel("Longitud"); ax.set_ylabel("Latitud"); ax.set_title("Clusters con K-means"); ax.legend()
plt.colorbar(sc, label="Cluster"); plt.show()`)}
${warn("en los scripts de clase, el eje x muestra la longitud pero se etiqueta 'Latitud' (y al revés), porque los nombres de <code>set_xlabel</code> y <code>set_ylabel</code> están intercambiados. Además, en el de K-means la ruta del Excel son <b>dos rutas pegadas</b> (<code>...Posiciones.xlsxC:/Users/...</code>), lo que da <code>FileNotFoundError</code>. Los centros, en cambio, están bien dibujados: <code>i[1]</code> es la longitud (eje x) porque las columnas de <code>X</code> son [Latitud, Longitud].")}
${concepto("¿Cuántos clusters?", "K-means necesita que le digas k. Dos ayudas: el <b>método del codo</b> (la inercia, la suma de distancias a los centros, deja de bajar mucho a partir de cierto k) y el <b>coeficiente de silueta</b> (de −1 a 1: cuánto más cerca está cada punto de su grupo que del vecino; cuanto más alto, mejor separados).")}
${codeBlock(`from sklearn.metrics import silhouette_score

ks = range(2, 9)
inercias, siluetas = [], []
for k in ks:
    km = KMeans(n_clusters=k, random_state=42, n_init=10).fit(X_scaled)
    inercias.append(km.inertia_)
    siluetas.append(silhouette_score(X_scaled, km.labels_))

fig, axs = plt.subplots(1, 2, figsize=(10, 3.6))
axs[0].plot(list(ks), inercias, "o-"); axs[0].set_title("Método del codo"); axs[0].set_xlabel("k"); axs[0].set_ylabel("Inercia")
axs[1].plot(list(ks), siluetas, "o-", color="tab:green"); axs[1].set_title("Coeficiente de silueta"); axs[1].set_xlabel("k")
plt.tight_layout(); plt.show()`)}
<h3>DBSCAN: grupos por densidad</h3>
<p>DBSCAN no necesita k: agrupa los puntos que tienen al menos <code>min_samples</code> vecinos a menos de <code>eps</code> de distancia, y deja como <b>ruido</b> (etiqueta −1) los que quedan aislados. Encuentra grupos de cualquier forma, no solo 'bolas'.</p>
${codeBlock(`from sklearn.cluster import DBSCAN

dbscan = DBSCAN(eps=0.3, min_samples=6).fit(X_scaled)
df["cluster_dbscan"] = dbscan.labels_
n_clusters = len(set(dbscan.labels_)) - (1 if -1 in dbscan.labels_ else 0)
print("Clusters encontrados:", n_clusters, "| puntos de ruido:", (dbscan.labels_ == -1).sum())

fig, axs = plt.subplots(1, 2, figsize=(12, 5))
for ax, eps in zip(axs, (0.3, 0.15)):
    etiquetas = DBSCAN(eps=eps, min_samples=6).fit(X_scaled).labels_
    ax.scatter(df["Longitud"], df["Latitud"], c=etiquetas, cmap="tab20", s=10)
    ax.scatter(df.loc[etiquetas == -1, "Longitud"], df.loc[etiquetas == -1, "Latitud"], c="black", marker="x", s=12, label="ruido")
    ax.set_title(f"DBSCAN eps={eps}: {len(set(etiquetas)) - (1 if -1 in etiquetas else 0)} clusters")
    ax.set_xlabel("Longitud"); ax.set_ylabel("Latitud"); ax.legend()
plt.tight_layout(); plt.show()`)}
${tip("<code>eps</code> está en las unidades de los datos <i>escalados</i>: cambia mucho el resultado y no hay un valor universal. Con <code>eps</code> grande todo se une en un solo grupo; con <code>eps</code> pequeño los datos se fragmentan en muchos grupos y aumenta el ruido (compara los dos gráficos). Para coordenadas reales sobre la Tierra, lo correcto es usar distancias geográficas (<code>metric='haversine'</code> con radianes) en lugar de escalar grados.")}
${origen("Cluster Kmeans.py y Cluster DBSCAN.py")}
${exercise("El k con mejor silueta", "Prueba K-means (<code>random_state=42, n_init=10</code>) con k de 2 a 8 sobre <code>X_scaled</code> y guarda en <code>mejor_k</code> el valor con mayor coeficiente de silueta.",
`from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
mejor_k = None
`,
`<p>Calcula la silueta de cada k en un diccionario y elige el máximo con <code>max(d, key=d.get)</code>. Compara el resultado con el gráfico del codo: no siempre coinciden, y la decisión final también depende de para qué quieras los grupos.</p>`,
`from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
_s = {k: silhouette_score(X_scaled, KMeans(n_clusters=k, random_state=42, n_init=10).fit(X_scaled).labels_) for k in range(2, 9)}
assert mejor_k == max(_s, key=_s.get), f"El mejor k por silueta es {max(_s, key=_s.get)}; tienes {mejor_k}"`,
`sil = {k: silhouette_score(X_scaled, KMeans(n_clusters=k, random_state=42, n_init=10).fit(X_scaled).labels_) for k in range(2, 9)}
mejor_k = max(sil, key=sil.get)
print({k: round(v, 3) for k, v in sil.items()}, "->", mejor_k)`)}
${resumen(["No supervisado: sin etiquetas, buscamos estructura.", "K-means: k centros, grupos compactos; elige k con el codo y la silueta.", "DBSCAN: grupos por densidad, de cualquier forma, y detecta ruido (−1); depende de <code>eps</code> y <code>min_samples</code>.", "Escala las variables antes de agrupar, y revisa que los ejes del gráfico dicen la verdad."])}
${quiz("En DBSCAN, ¿qué significa la etiqueta −1?", ["El primer cluster", "Puntos de ruido que no pertenecen a ningún grupo", "Un error del algoritmo"], 1, "Son puntos sin suficientes vecinos cercanos. Poder decir 'esto no encaja en ningún grupo' es una ventaja de DBSCAN frente a K-means.")}
</div>`}
);
