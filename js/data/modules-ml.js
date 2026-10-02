/* Bloque APRENDIZAJE AUTOMÁTICO — scripts de machine learning del curso:
   LinearRegression Diabetes, PolynomialRegression California, Métodos_Supervisados.ipynb,
   PenguinsLinearRegression, LinerRegressionBabyAmazon, MPL Classifier Mnist, Cluster Kmeans y Cluster DBSCAN */
MODULES.push(

{id:39, cat:"Aprendizaje automático", title:"Machine learning I: regresión y sobreajuste", body:()=>`
<div class="theory">
<p>Un modelo de <b>aprendizaje automático</b> aprende una relación a partir de ejemplos en vez de que tú la programes regla a regla. En <b>regresión</b> predices un número (la progresión de una enfermedad, el precio de una vivienda); en <b>clasificación</b>, una categoría. La pregunta clave nunca es "¿acierta con los datos que ya ha visto?", sino "¿acierta con datos nuevos?".</p>
${concepto("El patrón de scikit-learn", "todos los modelos se usan igual: <code>modelo = Clase(parámetros)</code>, <code>modelo.fit(X_train, y_train)</code> para entrenar y <code>modelo.predict(X_test)</code> para predecir. <code>X</code> es la tabla de variables (una fila por ejemplo) e <code>y</code>, lo que quieres predecir. Cambiar de algoritmo es cambiar una línea.")}
<h3>Diabetes: 442 pacientes y 10 variables</h3>
<p>El conjunto <i>diabetes</i> (incluido en scikit-learn) recoge edad, sexo, índice de masa corporal (bmi), presión arterial (bp) y seis medidas en suero (s1-s6) de 442 pacientes. El objetivo es la progresión de la enfermedad un año después.</p>
${codeBlock(`import pandas as pd
from sklearn import datasets

diabetes = datasets.load_diabetes(scaled=False)          # valores originales, sin escalar
X = pd.DataFrame(diabetes.data, columns=diabetes.feature_names)
y = pd.Series(diabetes.target, name="progresion")
print(X.head())
print(y.describe().round(1))`)}
${codeBlock(`import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)     # aprende media y desviación SOLO del entrenamiento
X_test_scaled = scaler.transform(X_test)           # y las aplica al test

model = LinearRegression()
model.fit(X_train_scaled, y_train)
y_pred = model.predict(X_test_scaled)
print(f"Mean Squared Error: {mean_squared_error(y_test, y_pred):.2f}")
print(f"R² Score: {r2_score(y_test, y_pred):.2f}")

plt.figure(figsize=(5, 4.5))
plt.scatter(y_test, y_pred, alpha=0.5)
plt.plot([y.min(), y.max()], [y.min(), y.max()], "--r")       # predicción perfecta
plt.xlabel("Valores reales"); plt.ylabel("Predicciones"); plt.title("Regresión lineal: real vs predicho")
plt.grid(alpha=0.3); plt.show()`)}
${concepto("fit_transform frente a transform", "el escalador se <b>ajusta</b> con el entrenamiento y después solo se <b>aplica</b> al test. Si lo ajustaras con todos los datos, el modelo 'vería' información del test antes de evaluarse (fuga de datos) y su nota sería optimista. Este script lo hace bien; el de viviendas de la clase de repaso no (módulo 38).")}
${codeBlock(`coeficientes = pd.Series(model.coef_, index=X.columns).sort_values()
coeficientes.plot.barh(figsize=(6, 3.6), color=["tab:red" if c < 0 else "tab:blue" for c in coeficientes])
plt.title("Peso de cada variable (datos escalados)"); plt.axvline(0, color="black", lw=0.8)
plt.show()
print("Ordenada en el origen:", round(model.intercept_, 1))`)}
${tip("Con los datos escalados, los coeficientes son comparables entre sí. <code>s5</code> (triglicéridos), <code>bmi</code> y <code>bp</code> empujan la progresión hacia arriba, como cabría esperar. Pero fíjate en <code>s1</code> y <code>s2</code>: coeficientes grandes y de signo contrario. El colesterol total y el LDL están muy correlacionados, y cuando dos variables son casi redundantes (colinealidad) el modelo reparte su efecto de forma inestable. Antes de interpretar un coeficiente aislado, mira las correlaciones entre variables.")}
<h3>Árboles de decisión y el sobreajuste</h3>
${codeBlock(`from sklearn.tree import DecisionTreeRegressor

arbol = DecisionTreeRegressor(max_depth=3, random_state=42)
arbol.fit(X_train_scaled, y_train)
print(f"Árbol (profundidad 3)  R² test: {r2_score(y_test, arbol.predict(X_test_scaled)):.2f}")

profundidades = range(1, 13)
r2_train, r2_test = [], []
for p in profundidades:
    a = DecisionTreeRegressor(max_depth=p, random_state=42).fit(X_train_scaled, y_train)
    r2_train.append(r2_score(y_train, a.predict(X_train_scaled)))
    r2_test.append(r2_score(y_test, a.predict(X_test_scaled)))

plt.figure(figsize=(6, 3.5))
plt.plot(profundidades, r2_train, "o-", label="entrenamiento")
plt.plot(profundidades, r2_test, "o-", label="test")
plt.xlabel("Profundidad máxima del árbol"); plt.ylabel("R²"); plt.legend(); plt.grid(alpha=0.3)
plt.title("Cuanto más complejo, mejor memoriza... y peor generaliza"); plt.show()`)}
${concepto("Sobreajuste", "un árbol muy profundo llega a R² ≈ 1 en entrenamiento porque memoriza cada paciente, pero en test empeora: ha aprendido el ruido, no el patrón. El punto óptimo de complejidad es donde el error de <b>test</b> es mínimo.")}
${note("En el script original se llama a <code>plt.figure(figsize=(10, 6))</code> dos veces seguidas antes de dibujar: la primera crea una figura vacía que también se muestra. Cada <code>plt.figure()</code> abre un lienzo nuevo.")}
<h3>Regresión polinómica con viviendas de California</h3>
<p>El script de clase usa <code>fetch_california_housing()</code>, que descarga los datos del censo de 1990 de internet (no funciona en el navegador). Aquí usamos <code>housing.csv</code>, una muestra de 2000 grupos de bloques del mismo censo. La idea: añadir potencias y productos de las variables (<code>PolynomialFeatures</code>) para que un modelo lineal capture curvas, y ver qué pasa al subir el grado.</p>
${codeBlock(`import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, PolynomialFeatures
from sklearn.linear_model import LinearRegression
from sklearn.metrics import root_mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

datos = pd.read_csv("housing.csv").drop(columns="ocean_proximity").dropna()
datos = datos[datos["median_house_value"] < 450000]              # quitamos el valor tope del censo
X = datos.drop(columns="median_house_value")
y = datos["median_house_value"] / 100000                           # en cientos de miles de $, como en el script
X_train, X_test, y_train, y_test = train_test_split(X, y, train_size=0.8, random_state=42)

error_train, error_test = [], []
for grado in range(5):
    modelo = Pipeline([("estandarizado", StandardScaler()),
                       ("polinomio", PolynomialFeatures(degree=grado)),
                       ("regresion", LinearRegression())])
    modelo.fit(X_train, y_train)
    error_train.append(root_mean_squared_error(y_train, modelo.predict(X_train)))
    error_test.append(root_mean_squared_error(y_test, modelo.predict(X_test)))
    print(f"Grado {grado}: {modelo['polinomio'].n_output_features_:4d} variables | "
          f"RMSE train {error_train[-1]:.3f} | RMSE test {error_test[-1]:.3f} | R² test {r2_score(y_test, modelo.predict(X_test)):.3f}")

plt.figure(figsize=(6, 3.5))
plt.plot(range(5), error_train, "b*-", label="RMSE entrenamiento")
plt.plot(range(5), error_test, "r*-", label="RMSE test")
plt.xlabel("Grado del polinomio"); plt.ylabel("RMSE (100 000 $)"); plt.legend(); plt.grid(alpha=0.3)
plt.yscale("log"); plt.show()`)}
${warn("en el script original las listas están cruzadas: <code>error_test.append(...(y_train, ...))</code> y <code>error_train.append(...(y_test, ...))</code>. Las gráficas salen 'al revés' y parece que el error de entrenamiento es el mayor. Además, el escalado y los polinomios se ajustan con <b>todos</b> los datos antes de separar train y test. Un <code>Pipeline</code> que incluye el modelo evita los dos problemas: todo se ajusta solo con el entrenamiento.")}
${origen("LinearRegression Diabetes.py y PolynomialRegression California.py")}
${exercise("¿Mejor que adivinar la media?", "Un modelo solo vale si mejora a la predicción más tonta: decir siempre la media del entrenamiento. Con <code>X_train, X_test, y_train, y_test</code> de <b>diabetes</b> (vuelve a ejecutar sus celdas si las has sobrescrito con las de viviendas), calcula <code>rmse_base</code> (predecir siempre <code>y_train.mean()</code>) y <code>rmse_lineal</code> (el modelo lineal escalado). Usa <code>root_mean_squared_error</code>.",
`import numpy as np
from sklearn import datasets
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.metrics import root_mean_squared_error

d = datasets.load_diabetes(scaled=False)
X_train, X_test, y_train, y_test = train_test_split(d.data, d.target, test_size=0.2, random_state=42)
rmse_base = None
rmse_lineal = None
`,
`<p>La predicción base es un array lleno de la media: <code>np.full(len(y_test), y_train.mean())</code>. El modelo lineal necesita el escalador ajustado con el entrenamiento. Deberías ver que el modelo reduce el error de unos 73 a unos 54: mejora, pero la progresión de la diabetes sigue siendo difícil de predecir con estas 10 variables.</p>`,
`import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.metrics import root_mean_squared_error
ref_base = root_mean_squared_error(y_test, np.full(len(y_test), y_train.mean()))
sc = StandardScaler().fit(X_train)
ref_lin = root_mean_squared_error(y_test, LinearRegression().fit(sc.transform(X_train), y_train).predict(sc.transform(X_test)))
assert rmse_base is not None and abs(rmse_base - ref_base) < 1e-6, f"rmse_base debería ser {ref_base:.2f}"
assert rmse_lineal is not None and abs(rmse_lineal - ref_lin) < 1e-6, f"rmse_lineal debería ser {ref_lin:.2f}"`,
`rmse_base = root_mean_squared_error(y_test, np.full(len(y_test), y_train.mean()))
sc = StandardScaler().fit(X_train)
modelo = LinearRegression().fit(sc.transform(X_train), y_train)
rmse_lineal = root_mean_squared_error(y_test, modelo.predict(sc.transform(X_test)))
print(round(rmse_base, 1), round(rmse_lineal, 1))`)}
${resumen(["scikit-learn: <code>fit</code> para entrenar, <code>predict</code> para predecir; separa siempre entrenamiento y test.", "Escalado y demás transformaciones se ajustan solo con el entrenamiento (mejor dentro de un <code>Pipeline</code>).", "Métricas de regresión: MSE, RMSE (mismas unidades que y) y R².", "Más complejidad (profundidad, grado) reduce el error de entrenamiento pero puede subir el de test: sobreajuste.", "Compara siempre con una línea base sencilla."])}
${quiz("Un modelo tiene R² = 0,99 en entrenamiento y 0,35 en test. ¿Qué le pasa?", ["Está infraajustado", "Está sobreajustado: ha memorizado el entrenamiento", "Es un modelo excelente"], 1, "La gran diferencia entre entrenamiento y test es la señal típica del sobreajuste.")}
</div>`},

{id:40, cat:"Aprendizaje automático", title:"Machine learning II: clasificación y fronteras de decisión", body:()=>`
<div class="theory">
<p>Un clasificador divide el espacio de variables en regiones, una por clase. Con dos variables puedes <b>ver</b> esa división (la frontera de decisión) y entender de un vistazo qué tipo de patrones puede aprender cada algoritmo. Este módulo reproduce el cuaderno <i>Métodos supervisados</i> de clase.</p>
${codeBlock(`import numpy as np
import matplotlib.pyplot as plt
import sklearn.datasets

def plot_decision_boundary(model, X, y, ax=None, h=0.03):
    """Colorea el plano según la clase que predice model. X tiene forma (2, m), como en el cuaderno."""
    ax = ax or plt.gca()
    x_min, x_max = X[0, :].min() - 1, X[0, :].max() + 1
    y_min, y_max = X[1, :].min() - 1, X[1, :].max() + 1
    xx, yy = np.meshgrid(np.arange(x_min, x_max, h), np.arange(y_min, y_max, h))
    Z = model(np.c_[xx.ravel(), yy.ravel()]).reshape(xx.shape)
    ax.contourf(xx, yy, Z, cmap=plt.cm.Spectral, alpha=0.8)
    ax.scatter(X[0, :], X[1, :], c=y.flatten(), cmap=plt.cm.Spectral, s=12, edgecolors="k", linewidths=0.3)
    ax.set_xlabel("x1"); ax.set_ylabel("x2")

def load_planar_dataset():
    np.random.seed(1)
    m, D, a = 400, 2, 4                     # ejemplos, dimensiones, radio máximo de la "flor"
    N = m // 2
    X, Y = np.zeros((m, D)), np.zeros((m, 1), dtype="uint8")
    for j in range(2):
        ix = range(N * j, N * (j + 1))
        t = np.linspace(j * 3.12, (j + 1) * 3.12, N) + np.random.randn(N) * 0.2
        r = a * np.sin(4 * t) + np.random.randn(N) * 0.2
        X[ix] = np.c_[r * np.sin(t), r * np.cos(t)]
        Y[ix] = j
    return X.T, Y.T

def load_extra_datasets(N=200, seed=0):
    return {"noisy_circles": sklearn.datasets.make_circles(n_samples=N, factor=.5, noise=.3, random_state=seed),
            "noisy_moons": sklearn.datasets.make_moons(n_samples=N, noise=.2, random_state=seed),
            "blobs": sklearn.datasets.make_blobs(n_samples=N, random_state=5, n_features=2, centers=6),
            "gaussian_quantiles": sklearn.datasets.make_gaussian_quantiles(cov=0.5, n_samples=N, n_features=2, n_classes=3, random_state=seed)}

X, Y = load_planar_dataset()
print("Dimensiones de X:", X.shape, "| de Y:", Y.shape, "| m =", Y.shape[1])
plt.figure(figsize=(4.5, 4)); plt.scatter(X[0, :], X[1, :], c=Y.flatten(), s=14, cmap=plt.cm.Spectral)
plt.title("Dataset 'flor': dos clases entrelazadas"); plt.show()`)}
${note("Este cuaderno guarda los ejemplos en <b>columnas</b> (<code>X</code> tiene forma (2, 400)), la convención de muchos cursos de redes neuronales. scikit-learn espera una fila por ejemplo, por eso verás <code>X.T</code> al entrenar. Además, <code>make_circles</code> y <code>make_moons</code> no tenían semilla en el original, así que cada ejecución daba datos (y precisiones) distintos; aquí llevan <code>random_state</code>.")}
<h3>Regresión logística: una frontera recta</h3>
${codeBlock(`import sklearn.linear_model
from sklearn.metrics import accuracy_score

clf = sklearn.linear_model.LogisticRegression(random_state=42)
clf.fit(X.T, Y.ravel())
plot_decision_boundary(lambda x: clf.predict(x), X, Y)
plt.title("Regresión logística"); plt.show()
print("Train Accuracy:", accuracy_score(Y.ravel(), clf.predict(X.T)))`)}
${codeBlock(`import sklearn.preprocessing

grado = 5
polinomio = sklearn.preprocessing.PolynomialFeatures(degree=grado)
X_pol = polinomio.fit_transform(X.T)                       # x1, x2, x1², x1·x2, ... hasta grado 5
clf_pol = sklearn.linear_model.LogisticRegression(random_state=42, max_iter=5000)
clf_pol.fit(X_pol, Y.ravel())
plot_decision_boundary(lambda x: clf_pol.predict(polinomio.transform(x)), X, Y)
plt.title(f"Regresión logística polinómica, grado {grado}"); plt.show()
print("Train Accuracy:", accuracy_score(Y.ravel(), clf_pol.predict(X_pol)))`)}
${warn("en el cuaderno original, dentro del <code>lambda</code> de la frontera se usa <code>polinomio.fit_transform(x)</code>. Con <code>PolynomialFeatures</code> no cambia el resultado, pero es un mal hábito: con un escalador volverías a ajustarlo con la rejilla de puntos y las predicciones serían incorrectas. Para datos nuevos, siempre <code>transform</code>.")}
<h3>SVM, árboles, bosques y redes neuronales</h3>
${codeBlock(`import sklearn.svm

fig, axs = plt.subplots(1, 4, figsize=(15, 3.6))
for ax, kernel in zip(axs, ["linear", "poly", "rbf", "sigmoid"]):
    svm = sklearn.svm.SVC(kernel=kernel, degree=3, random_state=42).fit(X.T, Y.ravel())
    plot_decision_boundary(lambda x: svm.predict(x), X, Y, ax=ax)
    ax.set_title(f"SVM {kernel}: {accuracy_score(Y.ravel(), svm.predict(X.T)):.2f}")
plt.tight_layout(); plt.show()`)}
${note("En el cuaderno se crea primero un SVM <code>poly</code> y en la línea siguiente se sobrescribe con uno <code>rbf</code>: solo se entrena el segundo. Para comparar kernels hay que entrenarlos todos, como en esta celda. El kernel RBF (base radial) es el que mejor se adapta a formas curvas.")}
${codeBlock(`import sklearn.tree, sklearn.ensemble

fig, axs = plt.subplots(1, 3, figsize=(13, 3.8))
for ax, prof in zip(axs, [2, 4, 12]):
    arbol = sklearn.tree.DecisionTreeClassifier(max_depth=prof, random_state=42).fit(X.T, Y.ravel())
    plot_decision_boundary(lambda x: arbol.predict(x), X, Y, ax=ax)
    ax.set_title(f"Árbol, max_depth={prof}: {accuracy_score(Y.ravel(), arbol.predict(X.T)):.2f}")
plt.tight_layout(); plt.show()

bosque = sklearn.ensemble.RandomForestClassifier(n_estimators=30, max_depth=4, random_state=42).fit(X.T, Y.ravel())
plot_decision_boundary(lambda x: bosque.predict(x), X, Y)
plt.title(f"Random Forest (30 árboles, max_depth=4): {accuracy_score(Y.ravel(), bosque.predict(X.T)):.2f}"); plt.show()`)}
${codeBlock(`import sklearn.neural_network

fig, axs = plt.subplots(1, 2, figsize=(10, 4))
for ax, activacion in zip(axs, ["identity", "relu"]):
    red = sklearn.neural_network.MLPClassifier(hidden_layer_sizes=(50, 50, 50), activation=activacion,
                                               max_iter=1000, random_state=42).fit(X.T, Y.ravel())
    plot_decision_boundary(lambda x: red.predict(x), X, Y, ax=ax)
    ax.set_title(f"MLP (50, 50, 50) activación {activacion}: {accuracy_score(Y.ravel(), red.predict(X.T)):.2f}")
plt.tight_layout(); plt.show()`)}
${warn("el cuaderno usa <code>activation='identity'</code>. Sin una función de activación no lineal, apilar capas no sirve de nada: la composición de funciones lineales es otra función lineal, y la red de 3 capas dibuja una frontera recta, igual que la regresión logística. La potencia de las redes viene de activaciones como <code>relu</code> o <code>tanh</code>.")}
<h3>La pregunta que falta: ¿y con datos nuevos?</h3>
<p>El cuaderno solo mide la precisión de <b>entrenamiento</b>. Así, el árbol más profundo parece el mejor modelo. Separemos un conjunto de test:</p>
${codeBlock(`import pandas as pd
import sklearn.linear_model, sklearn.svm, sklearn.tree, sklearn.ensemble, sklearn.neural_network
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

X_tr, X_te, y_tr, y_te = train_test_split(X.T, Y.ravel(), test_size=0.3, random_state=0, stratify=Y.ravel())
modelos = {
    "Logística": sklearn.linear_model.LogisticRegression(),
    "SVM rbf": sklearn.svm.SVC(kernel="rbf"),
    "Árbol prof. 4": sklearn.tree.DecisionTreeClassifier(max_depth=4, random_state=0),
    "Árbol sin límite": sklearn.tree.DecisionTreeClassifier(random_state=0),
    "Random Forest": sklearn.ensemble.RandomForestClassifier(n_estimators=100, random_state=0),
    "MLP relu": sklearn.neural_network.MLPClassifier((50, 50), max_iter=2000, random_state=0),
}
filas = []
for nombre, m in modelos.items():
    m.fit(X_tr, y_tr)
    filas.append({"modelo": nombre, "train": accuracy_score(y_tr, m.predict(X_tr)), "test": accuracy_score(y_te, m.predict(X_te))})
tabla = pd.DataFrame(filas).set_index("modelo").round(3)
tabla["diferencia"] = (tabla["train"] - tabla["test"]).round(3)
print(tabla.sort_values("test", ascending=False))`)}
${concepto("Lo que enseña la tabla", "el árbol sin límite y el random forest aciertan el 100 % del entrenamiento, pero en test pierden unos 16 puntos: han memorizado parte del ruido. La MLP con relu es la mejor en test y la que menos se aleja de su nota de entrenamiento. La logística apenas supera el azar (su frontera es una recta) y el SVM RBF con los parámetros por defecto se queda corto: subir <code>C</code> o ajustar <code>gamma</code> lo mejora. La precisión de entrenamiento sirve para detectar infraajuste; para elegir modelo, mira la de test.")}
${origen("clase de machine learning/Métodos_Supervisados.ipynb")}
${exercise("Elegir la profundidad del árbol", "Con el dataset <code>noisy_moons</code> (ya preparado abajo) prueba árboles con <code>max_depth</code> de 1 a 10 (<code>random_state=0</code>) y guarda en <code>mejor_profundidad</code> la que da mayor precisión en <b>test</b> (si hay empate, la menor). Guarda en <code>precisiones</code> un diccionario profundidad → precisión de test.",
`from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score

Xm, ym = load_extra_datasets()["noisy_moons"]
Xm_tr, Xm_te, ym_tr, ym_te = train_test_split(Xm, ym, test_size=0.3, random_state=0)
precisiones = {}
mejor_profundidad = None
`,
`<p>Un bucle <code>for p in range(1, 11)</code> que entrena, predice el test y guarda la precisión. <code>max(precisiones, key=precisiones.get)</code> devuelve la clave con el valor máximo; como recorre las profundidades en orden, en caso de empate se queda con la primera, la menor.</p>`,
`from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score
ref = {p: accuracy_score(ym_te, DecisionTreeClassifier(max_depth=p, random_state=0).fit(Xm_tr, ym_tr).predict(Xm_te)) for p in range(1, 11)}
assert set(precisiones) == set(range(1, 11)), "precisiones debe tener las profundidades 1 a 10"
assert all(abs(precisiones[p] - ref[p]) < 1e-12 for p in ref), "Alguna precisión no coincide"
assert mejor_profundidad == max(ref, key=ref.get), f"La mejor profundidad es {max(ref, key=ref.get)}"`,
`for p in range(1, 11):
    arbol = DecisionTreeClassifier(max_depth=p, random_state=0).fit(Xm_tr, ym_tr)
    precisiones[p] = accuracy_score(ym_te, arbol.predict(Xm_te))
mejor_profundidad = max(precisiones, key=precisiones.get)
print(precisiones, "->", mejor_profundidad)`)}
${resumen(["La frontera de decisión muestra qué formas puede aprender cada modelo.", "Lineales (logística, SVM lineal): fronteras rectas; con <code>PolynomialFeatures</code> o kernels, curvas.", "Árboles: fronteras en escalera; profundidad alta = sobreajuste. Random Forest promedia muchos árboles.", "Una red neuronal sin activación no lineal equivale a un modelo lineal.", "Elige el modelo por su rendimiento en test, no en entrenamiento."])}
${quiz("Una red con 3 capas ocultas y <code>activation='identity'</code>, ¿qué fronteras puede dibujar?", ["Cualquier forma, tiene muchas neuronas", "Solo rectas: sin no linealidad, las capas se combinan en una sola transformación lineal", "Solo círculos"], 1, "La no linealidad de la activación es lo que permite a una red aprender curvas.")}
</div>`},

{id:41, cat:"Aprendizaje automático", title:"Machine learning III: clasificar pingüinos y reseñas", body:()=>`
<div class="theory">
<p>Dos problemas reales de clasificación: identificar la especie de un pingüino a partir de sus medidas y decidir si una reseña de un producto es positiva o negativa a partir de su texto. El segundo introduce algo nuevo: convertir <b>palabras en números</b>.</p>
<h3>Pingüinos del archipiélago Palmer</h3>
${codeBlock(`import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

penguins = pd.read_csv("penguins.csv")        # en tu ordenador: sns.load_dataset("penguins")
print(penguins.head())
print(penguins.isnull().sum())

fig, axs = plt.subplots(1, 2, figsize=(11, 3.8))
sns.countplot(data=penguins, x="species", hue="species", palette="pastel", legend=False, ax=axs[0])
axs[0].set_title("Distribución de las especies")
sns.scatterplot(data=penguins, x="bill_length_mm", y="body_mass_g", hue="species", style="species", ax=axs[1])
axs[1].set_title("Longitud del pico frente a masa corporal")
plt.tight_layout(); plt.show()`)}
${codeBlock(`g = sns.pairplot(penguins, hue="species", diag_kind="kde", height=1.8)
g.fig.suptitle("Dataset Penguins", y=1.02)
plt.show()`)}
${tip("En el pairplot se ve que ninguna medida sola separa las tres especies, pero dos juntas (por ejemplo, longitud y profundidad del pico) casi lo consiguen. Esa intuición visual es la que luego confirma el modelo.")}
${codeBlock(`import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.metrics import confusion_matrix, classification_report, accuracy_score

datos = penguins.dropna()
Y = datos[["species"]]
X = pd.get_dummies(datos.drop(columns="species"))           # island y sex -> columnas 0/1

encoder = OneHotEncoder(sparse_output=False)
Y_encoded = encoder.fit_transform(Y)                          # Adelie -> [1,0,0], Chinstrap -> [0,1,0]...
X_train, X_test, Y_train, Y_test = train_test_split(X, Y_encoded, test_size=0.2, random_state=42)

# El "truco" del script de clase: regresión lineal sobre las columnas one-hot y quedarse con la mayor
lineal = LinearRegression().fit(X_train, Y_train)
pred_lineal = np.argmax(lineal.predict(X_test), axis=1)
reales = np.argmax(Y_test, axis=1)
especies = encoder.categories_[0]
print("Regresión lineal + argmax  accuracy:", round(accuracy_score(reales, pred_lineal), 3))

# La herramienta adecuada para clasificar: regresión logística
logistica = LogisticRegression(max_iter=5000).fit(X_train, np.argmax(Y_train, axis=1))
pred_log = logistica.predict(X_test)
print("Regresión logística        accuracy:", round(accuracy_score(reales, pred_log), 3))
print(classification_report(reales, pred_log, target_names=especies))`)}
${concepto("¿Por qué no regresión lineal para clasificar?", "la regresión lineal predice números sin límite (puede dar −0,3 o 1,4 'de Adelie'), no probabilidades, y es sensible a valores extremos. Con clases muy separables, como aquí, funciona por casualidad. La regresión logística está diseñada para clasificar: da probabilidades entre 0 y 1 que suman 1.")}
${codeBlock(`conf = confusion_matrix(reales, pred_log)
plt.figure(figsize=(4.8, 3.8))
sns.heatmap(conf, annot=True, fmt="d", cmap="Blues", xticklabels=especies, yticklabels=especies)
plt.xlabel("Predicción"); plt.ylabel("Real"); plt.title("Matriz de confusión")
plt.show()`)}
${origen("PenguinsLinearRegression.py")}
<h3>Reseñas de productos para bebés: análisis de sentimiento</h3>
<p>El archivo <code>amazon_baby_muestra.csv</code> contiene 2500 reseñas de Amazon (de las 53 072 del original) con su puntuación de 1 a 5 estrellas. Objetivo: predecir si una reseña es positiva (4-5) o negativa (1-2) solo con su texto.</p>
${codeBlock(`import pandas as pd

products = pd.read_csv("amazon_baby_muestra.csv")
print(products.isnull().sum())
products = products.dropna(subset=["review"])
print(products["rating"].value_counts().sort_index())
print(products["review"].iloc[0][:300])`)}
${codeBlock(`import string

stopwords_english = ["a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "could", "did",
    "do", "does", "doing", "down", "during", "each", "few", "for", "from", "further", "had", "has", "have", "having",
    "he", "her", "here", "hers", "herself", "him", "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its",
    "itself", "me", "more", "most", "my", "myself", "of", "off", "on", "once", "only", "or", "other", "our", "ours",
    "ourselves", "out", "over", "own", "same", "she", "should", "so", "some", "such", "than", "that", "the", "their",
    "theirs", "them", "themselves", "then", "there", "these", "they", "this", "those", "through", "to", "too", "under",
    "until", "up", "very", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom", "why", "will",
    "with", "would", "you", "your", "yours", "yourself", "yourselves"]
# (en esta lista quitamos "no", "not", "nor" del original: en sentimiento, "not good" importa)

def text_treatment_original(text):
    """Orden del script de clase: filtra stopwords ANTES de pasar a minúsculas y quitar signos."""
    palabras = [p for p in text.split() if not p.startswith("@") and p not in stopwords_english]
    frase = " ".join(palabras).translate(str.maketrans(string.punctuation, " " * len(string.punctuation)))
    return frase.lower()

def text_treatment(text):
    """Orden correcto: minúsculas -> quitar signos -> separar -> filtrar stopwords."""
    text = text.lower().translate(str.maketrans(string.punctuation, " " * len(string.punctuation)))
    return " ".join(p for p in text.split() if p not in stopwords_english)

ejemplo = "The bottle is great, it's easy to clean. I would NOT buy the other one!"
print("Original:", text_treatment_original(ejemplo))
print("Corregido:", text_treatment(ejemplo))`)}
${warn("en el script de clase se eliminan las <i>stopwords</i> antes de pasar a minúsculas y de quitar la puntuación, así que 'The', 'I' o 'it's,' sobreviven y se cuelan en el vocabulario. El orden importa: primero normaliza (minúsculas, signos) y después filtra. Otro detalle: incluir 'not' y 'no' en las stopwords borra justo las palabras que invierten el sentido de una frase.")}
${codeBlock(`import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report

products["review_filtrada"] = products["review"].apply(text_treatment)
X_txt = products["review_filtrada"]
y_txt = products["rating"].apply(lambda x: 0 if x <= 3 else 1)        # 1 = positiva
print(y_txt.value_counts())

X_train, X_test, y_train, y_test = train_test_split(X_txt, y_txt, test_size=0.2, random_state=14)
vectorizer = CountVectorizer()                       # bolsa de palabras: una columna por palabra
train_matrix = vectorizer.fit_transform(X_train)      # aprende el vocabulario SOLO del entrenamiento
test_matrix = vectorizer.transform(X_test)
print("Documentos x palabras:", train_matrix.shape)

model = LogisticRegression(max_iter=1000).fit(train_matrix, y_train)
pred = model.predict(test_matrix)
print("Test Accuracy:", round(accuracy_score(y_test, pred), 3))
print(classification_report(y_test, pred, target_names=["negativa", "positiva"]))`)}
${codeBlock(`import pandas as pd
import matplotlib.pyplot as plt

df_tokens = pd.DataFrame({"token": vectorizer.get_feature_names_out(), "coeficiente": model.coef_[0]})
extremos = pd.concat([df_tokens.nsmallest(12, "coeficiente"), df_tokens.nlargest(12, "coeficiente")])
plt.figure(figsize=(7, 5.5))
plt.barh(extremos["token"], extremos["coeficiente"], color=["tab:red" if c < 0 else "tab:green" for c in extremos["coeficiente"]])
plt.title("Palabras que más empujan hacia negativa (rojo) o positiva (verde)"); plt.axvline(0, color="black", lw=0.8)
plt.tight_layout(); plt.show()

conf = confusion_matrix(y_test, pred)
print("Matriz de confusión (filas = real, columnas = predicho):")
print(conf)`)}
${concepto("Un modelo que se puede leer", "en la regresión logística cada palabra tiene un coeficiente: positivo si aparece más en reseñas buenas, negativo en las malas. Ver las palabras extremas es la forma más rápida de comprobar que el modelo ha aprendido algo sensato (y no, por ejemplo, el nombre de una marca).")}
${note("El script de clase se llama <i>LinerRegression</i>, pero el modelo es una regresión <b>logística</b> (un clasificador), no una regresión lineal. Los nombres de archivo también comunican: llamar bien a las cosas evita confusiones al revisar el código meses después.")}
${origen("LinerRegressionBabyAmazon.py y amazon_baby.csv")}
${exercise("Tu propio detector de sentimiento", "Escribe <code>predecir_sentimiento(texto)</code> que devuelva <code>1</code> si el modelo considera positiva una reseña y <code>0</code> si negativa. Debe aplicar el mismo tratamiento que el entrenamiento: <code>text_treatment</code>, después <code>vectorizer.transform</code> y por último <code>model.predict</code>.",
`def predecir_sentimiento(texto):
    pass

print(predecir_sentimiento("I love it, perfect for my baby, works great and easy to use"))
print(predecir_sentimiento("Terrible, it broke after one day. Waste of money, I returned it"))
`,
`<p><code>vectorizer.transform</code> espera una <b>lista</b> de textos, así que hay que pasar <code>[text_treatment(texto)]</code>. <code>model.predict</code> devuelve un array: con <code>[0]</code> obtienes el número. El error más común es usar <code>fit_transform</code> aquí, que reaprendería el vocabulario con una sola frase.</p>`,
`assert predecir_sentimiento("I love it, perfect for my baby, works great and easy to use") == 1, "Una reseña claramente positiva debería dar 1"
assert predecir_sentimiento("Terrible, it broke after one day. Waste of money, I returned it") == 0, "Una reseña claramente negativa debería dar 0"`,
`def predecir_sentimiento(texto):
    matriz = vectorizer.transform([text_treatment(texto)])
    return int(model.predict(matriz)[0])`)}
${resumen(["Para clasificar, regresión logística (u otro clasificador), no regresión lineal.", "<code>OneHotEncoder</code> / <code>pd.get_dummies</code> convierten categorías en columnas 0/1.", "Matriz de confusión y <code>classification_report</code> (precision, recall, f1) dicen dónde falla el modelo.", "Texto: normaliza → filtra stopwords → <code>CountVectorizer</code> (bolsa de palabras) → modelo.", "El vocabulario se aprende con el entrenamiento; para datos nuevos, <code>transform</code>."])}
${quiz("Para predecir el sentimiento de una reseña nueva, ¿qué método del vectorizador usas?", ["fit_transform", "transform", "fit"], 1, "fit_transform volvería a crear el vocabulario a partir de esa única reseña y las columnas no coincidirían con las del modelo.")}
</div>`},

{id:42, cat:"Aprendizaje automático", title:"Redes neuronales: reconocer dígitos escritos a mano", body:()=>`
<div class="theory">
<p>Una <b>red neuronal multicapa</b> (MLP) encadena capas de neuronas: cada una calcula una suma ponderada de sus entradas y aplica una activación no lineal. Con suficientes neuronas puede aprender patrones complejos, como distinguir un 3 de un 8 en una imagen.</p>
${note("El script de clase usa <b>MNIST</b> (70 000 imágenes de 28×28 píxeles) con <code>fetch_openml('mnist_784')</code>, una descarga de unos 50 MB que el navegador no puede hacer. Aquí usamos <code>load_digits</code>, incluido en scikit-learn: 1797 dígitos de 8×8 píxeles. El problema y el código son los mismos a menor escala; la versión con MNIST está al final para tu ordenador.")}
${codeBlock(`import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import load_digits

digits = load_digits()
X, y = digits.data, digits.target
print("Imágenes:", X.shape, "-> cada fila son 64 píxeles (8x8) con valores de 0 a 16")
print("Primera imagen como matriz:")
print(X[0].reshape(8, 8).astype(int))

fig, axs = plt.subplots(2, 5, figsize=(9, 4))
for ax, img, etiqueta in zip(axs.flatten(), X, y):
    ax.imshow(img.reshape(8, 8), cmap="gray_r", vmin=0, vmax=16)
    ax.set_title(f"Número {etiqueta}"); ax.axis("off")
plt.tight_layout(); plt.show()`)}
${concepto("De imagen a fila de una tabla", "la red no 've' una imagen: recibe sus píxeles en fila (8×8 = 64 números; en MNIST, 28×28 = 784). Por eso <code>reshape(8, 8)</code> sirve para dibujar y <code>reshape(-1)</code> para entrenar. Dividir por el valor máximo (16 aquí, 255 en MNIST) deja los píxeles entre 0 y 1, lo que ayuda a que la red aprenda.")}
${codeBlock(`from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

X_train, X_test, y_train, y_test = train_test_split(X / 16, y, test_size=0.2, random_state=42, stratify=y)
mlp = MLPClassifier(hidden_layer_sizes=(128, 64), max_iter=300, alpha=0.001, solver="adam", random_state=1)
mlp.fit(X_train, y_train)
y_pred = mlp.predict(X_test)
print("Classification Accuracy:", round(accuracy_score(y_test, y_pred), 4))
print(classification_report(y_test, y_pred))

plt.figure(figsize=(5, 3)); plt.plot(mlp.loss_curve_)
plt.xlabel("Época"); plt.ylabel("Pérdida"); plt.title("Curva de aprendizaje"); plt.grid(alpha=0.3); plt.show()`)}
${tip("El script original entrena solo 15 épocas (<code>max_iter=15</code>) con <code>verbose=10</code>: verás un <i>ConvergenceWarning</i> porque la red aún estaba mejorando. La curva de pérdida te dice si hacen falta más iteraciones (sigue bajando) o si ya se ha estabilizado.")}
${codeBlock(`cm = confusion_matrix(y_test, y_pred)
plt.figure(figsize=(6.5, 5))
plt.imshow(cm, cmap="Blues"); plt.colorbar()
plt.xticks(np.arange(10)); plt.yticks(np.arange(10))
plt.xlabel("Predicción"); plt.ylabel("Realidad"); plt.title("Matriz de confusión")
umbral = cm.max() / 2
for i, j in np.ndindex(cm.shape):
    plt.text(j, i, cm[i, j], ha="center", va="center", color="white" if cm[i, j] > umbral else "black", fontsize=8)
plt.show()

errores = np.where(y_pred != y_test)[0]
fig, axs = plt.subplots(1, min(6, len(errores)), figsize=(9, 2))
for ax, k in zip(np.atleast_1d(axs), errores[:6]):
    ax.imshow(X_test[k].reshape(8, 8), cmap="gray_r"); ax.axis("off")
    ax.set_title(f"real {y_test[k]} / pred {y_pred[k]}", fontsize=8)
plt.show()`)}
${staticCode(`from sklearn.datasets import fetch_openml
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import train_test_split

mnist = fetch_openml("mnist_784", version=1)             # ~50 MB, tarda un rato la primera vez
X, y = mnist["data"], mnist["target"]
X_train, X_test, y_train, y_test = train_test_split(X / 255, y, test_size=0.2, random_state=42)
mlp = MLPClassifier(hidden_layer_sizes=(128, 64), max_iter=15, alpha=0.001, solver="adam", random_state=1, verbose=10)
mlp.fit(X_train, y_train)
print(mlp.score(X_test, y_test))`, "MNIST completo (en tu ordenador o Colab)")}
${origen("MPL Classifier Mnist.py")}
${exercise("Una red más pequeña", "Entrena una red con una sola capa oculta de 32 neuronas (<code>hidden_layer_sizes=(32,)</code>, <code>max_iter=500</code>, <code>random_state=0</code>) con <code>X_train, y_train</code> y guarda en <code>acc</code> su precisión en test. ¿Cuánto pierdes frente a la red de (128, 64)?",
`from sklearn.neural_network import MLPClassifier
from sklearn.metrics import accuracy_score
acc = None
`,
`<p>Es el mismo patrón de siempre: crear, <code>fit</code>, <code>predict</code> y <code>accuracy_score</code>. Con dígitos de 8×8, incluso 32 neuronas superan el 95 %: no siempre hace falta una red grande, y una más pequeña entrena más rápido y sobreajusta menos.</p>`,
`assert acc is not None and 0.9 < acc <= 1, f"La precisión debería superar 0,9; tienes {acc}"`,
`red = MLPClassifier(hidden_layer_sizes=(32,), max_iter=500, random_state=0).fit(X_train, y_train)
acc = accuracy_score(y_test, red.predict(X_test))
print(round(acc, 4))`)}
${resumen(["Una MLP encadena capas densas con activaciones no lineales (relu por defecto).", "Las imágenes se aplanan en filas de píxeles y se escalan a [0, 1].", "<code>loss_curve_</code> indica si la red sigue aprendiendo; <code>max_iter</code> bajo produce <i>ConvergenceWarning</i>.", "La matriz de confusión revela qué dígitos se confunden entre sí (típicamente 3/8, 1/7, 4/9)."])}
${quiz("¿Por qué se dividen los píxeles de MNIST entre 255?", ["Para comprimir las imágenes", "Para dejar las entradas entre 0 y 1 y facilitar el entrenamiento", "Porque la red solo acepta enteros"], 1, "Entradas en rangos pequeños y parecidos hacen que el descenso de gradiente sea más estable.")}
</div>`},

{id:43, cat:"Aprendizaje automático", title:"Aprendizaje no supervisado: clustering con K-means y DBSCAN", body:()=>`
<div class="theory">
<p>En el aprendizaje <b>no supervisado</b> no hay etiquetas que predecir: el objetivo es descubrir estructura en los datos. El <b>clustering</b> agrupa los puntos parecidos entre sí. Se usa para segmentar pacientes, agrupar genes con perfiles de expresión similares o, como aquí, encontrar zonas en un mapa.</p>
${note("Los scripts de clase cargan <code>Posiciones.xlsx</code> (latitud y longitud de unas localidades), que no está entre los materiales. Usamos en su lugar las coordenadas reales de los 2000 grupos de bloques de <code>housing.csv</code>: son puntos de California, donde se intuyen las grandes áreas urbanas.")}
${codeBlock(`import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("housing.csv")[["latitude", "longitude"]].rename(columns={"latitude": "Latitud", "longitude": "Longitud"})
X = df[["Latitud", "Longitud"]]
print(X.describe().round(2))

plt.figure(figsize=(5.5, 5.5))
plt.scatter(df["Longitud"], df["Latitud"], s=8, color="tab:gray")
plt.xlabel("Longitud"); plt.ylabel("Latitud"); plt.title("2000 grupos de bloques del censo de California")
plt.show()`)}
<h3>K-means: k grupos alrededor de k centros</h3>
${codeBlock(`from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
df["cluster"] = kmeans.fit_predict(X_scaled)
print(df["cluster"].value_counts().sort_index())

centros = scaler.inverse_transform(kmeans.cluster_centers_)          # de vuelta a grados
fig, ax = plt.subplots(figsize=(6, 5.5))
puntos = ax.scatter(df["Longitud"], df["Latitud"], c=df["cluster"], cmap="viridis", s=8)
ax.scatter(centros[:, 1], centros[:, 0], marker="^", edgecolor="black", c="red", s=220, label="centros")
ax.set_xlabel("Longitud"); ax.set_ylabel("Latitud"); ax.set_title("K-means con 4 clusters"); ax.legend()
plt.colorbar(puntos, label="Cluster"); plt.show()`)}
${warn("en los scripts de clase el eje X dibuja la longitud pero se rotula 'Latitud' (y al revés): <code>axes.set_xlabel('Latitud')</code> tras <code>plt.scatter(df['Longitud'], df['Latitud'])</code>. Revisa siempre que las etiquetas correspondan a lo que dibujas. Además, en <code>Cluster Kmeans.py</code> la ruta del Excel son dos rutas pegadas (<code>...Posiciones.xlsxC:/Users/...</code>), así que el archivo nunca se encontraría.")}
<h3>¿Cuántos clusters? Codo y silueta</h3>
${codeBlock(`from sklearn.metrics import silhouette_score

ks = range(2, 11)
inercias, siluetas = [], []
for k in ks:
    km = KMeans(n_clusters=k, random_state=42, n_init=10).fit(X_scaled)
    inercias.append(km.inertia_)
    siluetas.append(silhouette_score(X_scaled, km.labels_))

fig, axs = plt.subplots(1, 2, figsize=(10, 3.4))
axs[0].plot(ks, inercias, "o-"); axs[0].set_title("Método del codo (inercia)"); axs[0].set_xlabel("k")
axs[1].plot(ks, siluetas, "o-", color="tab:green"); axs[1].set_title("Coeficiente de silueta"); axs[1].set_xlabel("k")
plt.tight_layout(); plt.show()
print("k con mejor silueta:", list(ks)[siluetas.index(max(siluetas))])`)}
${concepto("Elegir k", "K-means siempre devuelve los k grupos que le pidas, existan o no. La <b>inercia</b> (dispersión dentro de los grupos) baja siempre al aumentar k; se busca el 'codo' donde deja de bajar mucho. La <b>silueta</b> (de −1 a 1) mide si cada punto está más cerca de su grupo que del vecino: cuanto más alta, mejor separados.")}
<h3>DBSCAN: grupos por densidad</h3>
${codeBlock(`from sklearn.cluster import DBSCAN

dbscan = DBSCAN(eps=0.3, min_samples=6).fit(X_scaled)
df["cluster_db"] = dbscan.labels_                         # -1 = ruido (puntos aislados)
n_clusters = len(set(dbscan.labels_)) - (1 if -1 in dbscan.labels_ else 0)
print("Clusters:", n_clusters, "| puntos de ruido:", (dbscan.labels_ == -1).sum())

fig, axs = plt.subplots(1, 3, figsize=(14, 4.4))
for ax, eps in zip(axs, [0.1, 0.2, 0.3]):
    etiquetas = DBSCAN(eps=eps, min_samples=6).fit_predict(X_scaled)
    n = len(set(etiquetas)) - (1 if -1 in etiquetas else 0)
    ax.scatter(df["Longitud"], df["Latitud"], c=etiquetas, cmap="tab20", s=6)
    ax.scatter(df.loc[etiquetas == -1, "Longitud"], df.loc[etiquetas == -1, "Latitud"], c="lightgray", s=6)
    ax.set_title(f"eps={eps}: {n} clusters, {(etiquetas == -1).mean():.0%} ruido")
    ax.set_xlabel("Longitud"); ax.set_ylabel("Latitud")
plt.tight_layout(); plt.show()`)}
${concepto("K-means frente a DBSCAN", "K-means necesita que le digas k, asume grupos más o menos redondos y asigna todos los puntos a algún grupo. DBSCAN encuentra él solo el número de grupos, admite formas arbitrarias y marca como <b>ruido</b> (−1) los puntos en zonas poco densas. Su parámetro clave es <code>eps</code>, el radio de vecindad: pequeño = muchos grupos y mucho ruido; grande = todo se fusiona.")}
${tip("Para coordenadas geográficas reales, DBSCAN admite <code>metric='haversine'</code> con las coordenadas en radianes, que mide distancias sobre la esfera terrestre en lugar de estandarizar latitud y longitud por separado.")}
${origen("Cluster Kmeans.py y Cluster DBSCAN.py")}
${exercise("Afinar DBSCAN", "Con <code>X_scaled</code>, ejecuta DBSCAN con <code>eps=0.15</code> y <code>min_samples=10</code>. Guarda en <code>n_grupos</code> el número de clusters (sin contar el ruido) y en <code>frac_ruido</code> la fracción de puntos marcados como ruido (entre 0 y 1).",
`from sklearn.cluster import DBSCAN
n_grupos = None
frac_ruido = None
`,
`<p>Las etiquetas están en <code>.labels_</code> (o las devuelve <code>fit_predict</code>). <code>set(etiquetas)</code> da los valores distintos; si incluye −1, réstalo del recuento. La fracción de ruido es la media de la máscara <code>etiquetas == -1</code>.</p>`,
`from sklearn.cluster import DBSCAN
import numpy as np
e = DBSCAN(eps=0.15, min_samples=10).fit_predict(X_scaled)
ref_n = len(set(e)) - (1 if -1 in e else 0)
assert n_grupos == ref_n, f"Hay {ref_n} clusters; tienes {n_grupos}"
assert frac_ruido is not None and abs(frac_ruido - (e == -1).mean()) < 1e-12, "La fracción de ruido no es correcta"`,
`etiquetas = DBSCAN(eps=0.15, min_samples=10).fit_predict(X_scaled)
n_grupos = len(set(etiquetas)) - (1 if -1 in etiquetas else 0)
frac_ruido = (etiquetas == -1).mean()
print(n_grupos, round(frac_ruido, 3))`)}
${resumen(["Clustering: agrupar sin etiquetas; estandariza antes, porque se basa en distancias.", "K-means: eliges k; codo (inercia) y silueta ayudan a decidirlo; <code>inverse_transform</code> devuelve los centros a las unidades originales.", "DBSCAN: grupos por densidad, detecta ruido (−1); parámetros <code>eps</code> y <code>min_samples</code>.", "Comprueba siempre que los ejes y etiquetas de tus gráficos dicen lo que muestras."])}
${quiz("Tus datos forman dos medias lunas entrelazadas y algunos puntos sueltos. ¿Qué algoritmo es más adecuado?", ["K-means con k=2", "DBSCAN", "Regresión lineal"], 1, "DBSCAN sigue la densidad y no asume formas redondas; además marca los puntos sueltos como ruido.")}
</div>`}
);
