/* Bloque DEEP LEARNING — scripts de Keras/TensorFlow (clase 13), cuadernos de PyTorch (clase 14) y el modelo modelo_mnist_convol.h5 */
MODULES.push(

{id:45, cat:"Deep learning", title:"DL I: redes neuronales con Keras (cáncer de mama)", body:()=>`
<div class="theory">
<p>El <b>aprendizaje profundo</b> (<i>deep learning</i>) usa redes neuronales con varias capas para aprender patrones complejos directamente de los datos: imágenes, secuencias, texto. Cada <b>neurona</b> calcula una suma ponderada de sus entradas, le añade un sesgo y aplica una <b>función de activación</b>; las neuronas se organizan en <b>capas</b> y el entrenamiento ajusta los pesos para reducir una <b>función de pérdida</b>.</p>
${note("Las dos librerías del curso, <b>TensorFlow/Keras</b> (clase 13) y <b>PyTorch</b> (clase 14), no existen para el navegador, igual que RDKit. En este bloque harás en la web todo lo que se puede hacer sin ellas (explorar datos, redes equivalentes con scikit-learn y NumPy, e incluso <b>usar el modelo convolucional que entrenaste en clase</b>), y el código de Keras y PyTorch está listo para Colab en <code>notebooks/</code>, donde ambas librerías ya vienen instaladas.")}
<h3>Los datos: Breast Cancer Wisconsin</h3>
<p>569 tumores de mama descritos por 30 medidas de los núcleos celulares en imágenes de punción con aguja fina: para 10 propiedades (radio, textura, perímetro, área, suavidad, compacidad, concavidad, puntos cóncavos, simetría y dimensión fractal) se dan la media (<i>mean</i>), el error estándar (<i>se</i>) y el peor valor (<i>worst</i>).</p>
${codeBlock(`import pandas as pd
from sklearn.datasets import load_breast_cancer

data = load_breast_cancer()
df = pd.DataFrame(data.data, columns=data.feature_names)
df["target"] = data.target
print(df.shape)
print("Clases:", dict(enumerate(data.target_names)))
print(df["target"].map(dict(enumerate(data.target_names))).value_counts())
print(df.iloc[:, :10].describe().T[["mean", "std", "min", "max"]].round(2))`)}
${warn("dar por hecho qué significa cada etiqueta. En este dataset <b>0 = maligno</b> y <b>1 = benigno</b>, al revés de lo intuitivo. La salida sigmoide de la red da la probabilidad de la clase 1, es decir, de que el tumor sea <i>benigno</i>. Mira siempre <code>target_names</code>.")}
${codeBlock(`import matplotlib.pyplot as plt

medias = [c for c in df.columns if c.startswith("mean")]
df[medias].hist(bins=30, figsize=(13, 8)); plt.tight_layout(); plt.show()

corr = df.corr()["target"].drop("target").sort_values()
print("Variables más relacionadas con el diagnóstico:")
print(corr.head(8).round(2))`)}
${codeBlock(`import seaborn as sns

cols = ["mean radius", "mean perimeter", "worst concave points", "worst radius"]
g = sns.pairplot(df[cols + ["target"]], hue="target", diag_kind="kde", height=2.1)
g.fig.suptitle("Variables clave por diagnóstico (0 = maligno, 1 = benigno)", y=1.02); plt.show()

fig, axs = plt.subplots(1, 2, figsize=(11, 4))
sns.boxplot(data=df, x="target", y="mean radius", ax=axs[0])
axs[0].set_xticks([0, 1], data.target_names); axs[0].set_title("Radio medio por diagnóstico")
sns.scatterplot(data=df, x="mean area", y="mean smoothness", hue="target", palette="coolwarm", ax=axs[1])
axs[1].set_title("Área frente a suavidad")
plt.tight_layout(); plt.show()`)}
${tip("Las correlaciones son <b>negativas</b> porque el objetivo vale 1 para benigno: cuanto mayor es el radio o el número de puntos cóncavos, más probable es que el tumor sea maligno (0). El script de clase llama a <code>sns.set(...)</code>, que cambia el estilo de <i>todos</i> los gráficos posteriores de la sesión; para un solo gráfico, mejor <code>with sns.axes_style('ticks'):</code>.")}
<h3>La neurona y las funciones de activación</h3>
${codeBlock(`import numpy as np

z = np.linspace(-6, 6, 200)
fig, axs = plt.subplots(1, 3, figsize=(12, 3))
axs[0].plot(z, np.maximum(0, z)); axs[0].set_title("ReLU: max(0, z)")
axs[1].plot(z, 1 / (1 + np.exp(-z))); axs[1].set_title("Sigmoide: entre 0 y 1")
logits = np.array([2.0, 1.0, 0.1])
softmax = np.exp(logits) / np.exp(logits).sum()
axs[2].bar(["clase 0", "clase 1", "clase 2"], softmax); axs[2].set_title("Softmax de [2, 1, 0,1]: suma 1")
plt.tight_layout(); plt.show()

# Una neurona: suma ponderada + sesgo + activación
x = np.array([0.5, -1.2, 3.0]); w = np.array([0.8, 0.1, -0.4]); b = 0.2
z = x @ w + b
print(f"z = {z:.2f} -> sigmoide(z) = {1 / (1 + np.exp(-z)):.3f}")`)}
${concepto("Qué activación usar", "<b>ReLU</b> en las capas ocultas (rápida y sin saturarse para valores positivos). En la capa de salida depende del problema: <b>sigmoide</b> con una neurona para clasificación binaria (con la pérdida <code>binary_crossentropy</code>), <b>softmax</b> con una neurona por clase para multiclase (con <code>categorical_crossentropy</code>, o <code>sparse_categorical_crossentropy</code> si las etiquetas son enteros) y ninguna (lineal) para regresión.")}
<h3>La misma red, entrenada en el navegador con scikit-learn</h3>
<p>El script crea en Keras una red densa de 30, 50 y 10 neuronas ocultas con salida sigmoide. <code>MLPClassifier</code> de scikit-learn entrena exactamente esa arquitectura (con el mismo optimizador, Adam), así que puedes ver el proceso completo aquí.</p>
${codeBlock(`from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import classification_report, confusion_matrix

X, y = data.data, data.target
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
scaler = StandardScaler().fit(X_train)                     # ajustado SOLO con entrenamiento
X_train_s, X_test_s = scaler.transform(X_train), scaler.transform(X_test)

red = MLPClassifier(hidden_layer_sizes=(30, 50, 10), activation="relu", solver="adam",
                    max_iter=300, early_stopping=True, validation_fraction=0.2, random_state=42)
red.fit(X_train_s, y_train)
print("Épocas entrenadas:", red.n_iter_)

fig, axs = plt.subplots(1, 2, figsize=(11, 3.6))
axs[0].plot(red.loss_curve_); axs[0].set_title("Pérdida (entrenamiento)"); axs[0].set_xlabel("Época")
axs[1].plot(red.validation_scores_, color="tab:orange"); axs[1].set_title("Accuracy (validación)"); axs[1].set_xlabel("Época")
plt.tight_layout(); plt.show()

y_pred = red.predict(X_test_s)
print(classification_report(y_test, y_pred, target_names=data.target_names))
print(confusion_matrix(y_test, y_pred))`)}
${concepto("Época, lote y validación", "una <b>época</b> es una pasada completa por los datos de entrenamiento; en cada una los datos se procesan en <b>lotes</b> (<code>batch_size</code>) y los pesos se actualizan tras cada lote. <code>validation_split=0.2</code> reserva un 20 % del entrenamiento para vigilar el sobreajuste: si la pérdida de validación deja de bajar mientras la de entrenamiento sigue bajando, el modelo está memorizando. <code>EarlyStopping</code> detiene el entrenamiento en ese punto.")}
${staticCode(`import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt

tf.keras.utils.set_random_seed(42)            # fija Python, NumPy y TensorFlow (np.random.seed solo fija NumPy)

data = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(data.data, data.target, test_size=0.2,
                                                    random_state=42, stratify=data.target)
scaler = StandardScaler().fit(X_train)        # primero separar, después escalar
X_train, X_test = scaler.transform(X_train), scaler.transform(X_test)

model = models.Sequential([
    layers.Input(shape=(X_train.shape[1],)),  # forma recomendada en Keras 3 (en vez de input_shape=)
    layers.Dense(30, activation="relu"),
    layers.Dense(50, activation="relu"),
    layers.Dense(10, activation="relu"),
    layers.Dense(1, activation="sigmoid"),    # probabilidad de la clase 1 (benigno)
])
model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])
model.summary()

parada = tf.keras.callbacks.EarlyStopping(monitor="val_loss", patience=10, restore_best_weights=True)
history = model.fit(X_train, y_train, epochs=100, batch_size=16, validation_split=0.2,
                    callbacks=[parada], verbose=0)
print("Épocas entrenadas:", len(history.history["loss"]))

fig, axs = plt.subplots(1, 2, figsize=(12, 4))
for ax, m in zip(axs, ["loss", "accuracy"]):
    ax.plot(history.history[m], label="entrenamiento")
    ax.plot(history.history["val_" + m], label="validación")
    ax.set_title(m); ax.set_xlabel("Época"); ax.legend()
plt.show()

y_pred = (model.predict(X_test, verbose=0) > 0.5).astype(int).ravel()
print(classification_report(y_test, y_pred, target_names=data.target_names))
print(confusion_matrix(y_test, y_pred))`, "Keras / TensorFlow (Colab: cuaderno del módulo)")}
${warn("en el script, el <code>StandardScaler</code> se ajusta con <b>todos</b> los datos antes de separar entrenamiento y prueba (fuga de información, ya vista en el módulo 39), y <code>np.random.seed(42)</code> no fija los pesos iniciales de TensorFlow, así que cada ejecución da un resultado algo distinto. En Keras 3, <code>input_shape=</code> en la primera capa genera un aviso (se ve en la salida de tu cuaderno Mnist_3_B): la forma actual es empezar con <code>layers.Input(shape=...)</code>.")}
${concepto("Optimizadores", "el script lista los de Keras: <code>sgd</code> (descenso de gradiente estocástico), <code>adam</code> (el más usado por defecto: ajusta el paso de cada peso), <code>rmsprop</code>, <code>adagrad</code>, <code>adadelta</code>, <code>adamax</code>, <code>nadam</code> y <code>ftrl</code>. Todos hacen lo mismo, mover los pesos en la dirección que reduce la pérdida, con distintas reglas para el tamaño del paso.")}
${origen("BreastCancer.py")}
${exercise("No se nos puede escapar un maligno", "En diagnóstico, lo más grave es clasificar como benigno un tumor maligno. Con <code>y_test</code> e <code>y_pred</code> de la red anterior, guarda en <code>sensibilidad_maligno</code> la proporción de tumores malignos (clase 0) que la red detecta, y en <code>falsos_benignos</code> cuántos malignos clasificó como benignos.",
`from sklearn.metrics import recall_score, confusion_matrix
sensibilidad_maligno = None
falsos_benignos = None
`,
`<p><code>recall_score(y_test, y_pred, pos_label=0)</code> calcula la sensibilidad tomando el maligno (0) como clase positiva. En la matriz de confusión, la fila 0 son los malignos reales y la columna 1 los predichos como benignos: <code>confusion_matrix(y_test, y_pred)[0, 1]</code>.</p>`,
`from sklearn.metrics import recall_score, confusion_matrix
assert sensibilidad_maligno is not None and abs(sensibilidad_maligno - recall_score(y_test, y_pred, pos_label=0)) < 1e-9, "Revisa la sensibilidad (pos_label=0)"
assert falsos_benignos == confusion_matrix(y_test, y_pred)[0, 1], f"Los falsos benignos son {confusion_matrix(y_test, y_pred)[0, 1]}"`,
`sensibilidad_maligno = recall_score(y_test, y_pred, pos_label=0)
falsos_benignos = confusion_matrix(y_test, y_pred)[0, 1]
print(f"Sensibilidad para maligno: {sensibilidad_maligno:.1%} | malignos clasificados como benignos: {falsos_benignos}")`)}
${resumen(["Neurona = suma ponderada + sesgo + activación; las capas se apilan en <code>Sequential</code>.", "Salida y pérdida van juntas: sigmoide + <code>binary_crossentropy</code>, softmax + <code>(sparse_)categorical_crossentropy</code>.", "<code>compile</code> (optimizador, pérdida, métricas) → <code>fit</code> (épocas, lotes, validación) → <code>evaluate</code>/<code>predict</code>.", "Separa antes de escalar y fija la semilla con <code>tf.keras.utils.set_random_seed</code>.", "En medicina, mira la sensibilidad de la clase grave, no solo el accuracy."])}
${quiz("Tu red tiene una neurona de salida con activación sigmoide y devuelve 0,93 para un tumor de este dataset. ¿Qué significa?", ["93 % de probabilidad de maligno", "93 % de probabilidad de benigno (clase 1)", "Que el tumor mide 0,93"], 1, "La sigmoide da la probabilidad de la clase 1, y aquí 1 es benigno.")}
</div>`},

{id:46, cat:"Deep learning", title:"DL II: redes convolucionales y el modelo de clase", body:()=>`
<div class="theory">
<p>Una red densa trata cada píxel como una variable independiente: si el dígito se desplaza un poco, para ella es otra imagen. Las <b>redes convolucionales</b> (CNN) aplican pequeños <b>filtros</b> (por ejemplo de 3×3) que recorren toda la imagen buscando el mismo patrón en cualquier posición: bordes, curvas, esquinas. Las capas siguientes combinan esos patrones en formas cada vez más complejas.</p>
${concepto("Las piezas de una CNN", "<b>Conv2D</b>: N filtros que generan N <i>mapas de activación</i>. <b>MaxPooling2D</b>: reduce cada mapa quedándose con el máximo de cada bloque de 2×2 (menos tamaño, más tolerancia a pequeños desplazamientos). <b>Dropout</b>: durante el entrenamiento apaga al azar una fracción de neuronas para evitar el sobreajuste; al predecir no hace nada. <b>Flatten</b>: convierte los mapas en un vector para las capas densas finales. <b>Softmax</b>: probabilidades de las 10 clases.")}
<h3>Abrir el modelo que entrenaste en clase</h3>
<p><code>modelo_mnist_convol.h5</code> es la red convolucional del script <i>Dense + Convolucional Mnist</i>, guardada con <code>model.save(...)</code>. Un <code>.h5</code> es un archivo HDF5: un contenedor jerárquico de datos (como carpetas y tablas) que se lee con <code>h5py</code>, sin necesidad de TensorFlow.</p>
${codeBlock(`import h5py, json

ruta = await cargar_modelo_clase()          # copia el modelo al disco virtual (2,8 MB, solo la primera vez)
f = h5py.File(ruta, "r")
config = json.loads(f.attrs["model_config"])
print("Guardado con Keras", f.attrs["keras_version"], "| tipo de modelo:", config["class_name"])
for capa in config["config"]["layers"]:
    c = capa["config"]
    detalles = {k: c[k] for k in ("filters", "kernel_size", "units", "activation", "pool_size", "rate") if k in c}
    print(f"  {capa['class_name']:13s} {c['name']:16s} {detalles}")`)}
${note("El archivo que subiste pesa 8,4 MB porque también guarda el estado del optimizador (para poder seguir entrenando). Para usar el modelo solo hacen falta la arquitectura y los pesos, así que la web carga una copia de 2,8 MB sin esa parte.")}
${codeBlock(`import numpy as np

pesos = {}
f["model_weights"].visititems(lambda nombre, obj: pesos.__setitem__(nombre, obj[()]) if isinstance(obj, h5py.Dataset) else None)

total = 0
for nombre, w in pesos.items():
    total += w.size
    print(f"{nombre:34s} {str(w.shape):17s} {w.size:>9,d}")
print(f"Total de parámetros: {total:,d}")

def peso(capa, tipo):
    return pesos[f"{capa}/{capa}/{tipo}:0"]
K1, b1 = peso("conv2d_12", "kernel"), peso("conv2d_12", "bias")
K2, b2 = peso("conv2d_13", "kernel"), peso("conv2d_13", "bias")
K3, b3 = peso("conv2d_14", "kernel"), peso("conv2d_14", "bias")
D1, c1 = peso("dense_23", "kernel"), peso("dense_23", "bias")
D2, c2 = peso("dense_24", "kernel"), peso("dense_24", "bias")`)}
${concepto("Contar parámetros", "una Conv2D tiene <code>alto × ancho × canales_entrada × filtros + filtros</code> parámetros: la primera, 3·3·1·32 + 32 = 320. Una Dense tiene <code>entradas × neuronas + neuronas</code>. Fíjate en que 663 680 de los 693 034 parámetros están en la primera capa densa, la que recibe los 9·9·64 = 5184 valores aplanados: las convoluciones son baratas porque cada filtro se reutiliza en toda la imagen.")}
<h3>La red por dentro, en NumPy</h3>
<p>Con los pesos y unas pocas funciones de NumPy puedes reproducir exactamente lo que hace Keras al predecir. Es la mejor manera de entender qué calcula cada capa.</p>
${codeBlock(`from numpy.lib.stride_tricks import sliding_window_view

def conv2d(x, K, b):
    """x: (imágenes, alto, ancho, canales). K: (3, 3, canales, filtros). Sin relleno y con paso 1, como Keras."""
    ventanas = sliding_window_view(x, K.shape[:2], axis=(1, 2))          # todas las ventanas 3x3
    return np.einsum("nhwcij,ijcf->nhwf", ventanas, K, optimize=True) + b

def relu(z):
    return np.maximum(z, 0)

def maxpool(x, p=2):
    n, H, W, C = x.shape
    return x[:, :H // p * p, :W // p * p].reshape(n, H // p, p, W // p, p, C).max(axis=(2, 4))

def softmax(z):
    e = np.exp(z - z.max(axis=1, keepdims=True))
    return e / e.sum(axis=1, keepdims=True)

def predecir(imgs):
    x = np.asarray(imgs, dtype="float32").reshape(-1, 28, 28, 1)
    x = maxpool(relu(conv2d(x, K1, b1)))        # Conv2D(32) + MaxPooling2D  -> (13, 13, 32)
    x = relu(conv2d(x, K2, b2))                 # Conv2D(32)                 -> (11, 11, 32)
    x = relu(conv2d(x, K3, b3))                 # Conv2D(64)                 -> (9, 9, 64)
    x = x.reshape(len(x), -1)                   # Dropout no actúa al predecir; Flatten -> 5184
    x = relu(x @ D1 + c1)                       # Dense(128)
    return softmax(x @ D2 + c2)                 # Dense(10) + softmax

import pandas as pd
import matplotlib.pyplot as plt
ejemplos = pd.read_csv("digitos_ejemplo.csv")
imgs = ejemplos.drop(columns="etiqueta").to_numpy(dtype="float32").reshape(-1, 28, 28)
p = predecir(imgs)
fig, axs = plt.subplots(1, 10, figsize=(13, 1.9))
for ax, img, real, prob in zip(axs, imgs, ejemplos["etiqueta"], p):
    ax.imshow(img, cmap="gray"); ax.axis("off")
    ax.set_title(f"{prob.argmax()} ({prob.max():.0%})", fontsize=9, color="green" if prob.argmax() == real else "red")
plt.show()`)}
${tip("Comprobado al preparar el curso: esta función da las mismas probabilidades que <code>model.predict</code> de Keras con tu modelo (diferencias de 0,0000003, puro redondeo de coma flotante). Los dígitos de ejemplo no son de MNIST: son números de una tipografía, centrados igual que MNIST.")}
${codeBlock(`fig, axs = plt.subplots(4, 8, figsize=(9, 4.8))
for i, ax in enumerate(axs.flat):
    ax.imshow(K1[:, :, 0, i], cmap="RdBu_r"); ax.axis("off")
fig.suptitle("Los 32 filtros 3x3 de la primera capa convolucional"); plt.show()

mapas = relu(conv2d(imgs[3:4, :, :, None], K1, b1))[0]           # el dígito 3
fig, axs = plt.subplots(4, 8, figsize=(9, 4.8))
for i, ax in enumerate(axs.flat):
    ax.imshow(mapas[:, :, i], cmap="magma"); ax.axis("off")
fig.suptitle("Mapas de activación de la primera capa para el 3"); plt.show()`)}
${concepto("Qué detectan los filtros", "cada filtro de la primera capa responde a un patrón local: muchos son detectores de bordes con una orientación concreta (zonas rojas y azules enfrentadas). En los mapas de activación se ve qué partes del 3 encienden cada filtro: unos el trazo superior, otros los bordes izquierdos o las curvas.")}
<h3>Dibuja y deja que tu red lo reconozca</h3>
<p>Ejecuta la celda y dibuja un dígito en la pizarra: al levantar el ratón (o el dedo), el dibujo se recorta, se reduce a 28×28 y se centra como en MNIST, y tu red te da su predicción.</p>
${codeBlock(`def barras(probs):
    orden = probs.argmax()
    filas = "".join(
        f"<div class='pb{' top' if d == orden else ''}'><span>{d}</span><i style='width:{max(p * 100, 1):.0f}%'></i><b>{p:.0%}</b></div>"
        for d, p in enumerate(probs))
    return f"<div class='probs'><div class='pred'>Predicción<b>{orden}</b></div>{filas}</div>"

pizarra(al_dibujar=lambda img: barras(predecir(img[None])[0]))`, true, {label: "Pizarra interactiva"})}
${codeBlock(`img = leer_pizarra()              # la última pizarra, ya como array 28x28
p = predecir(img[None])[0]
fig, axs = plt.subplots(1, 3, figsize=(11, 3.2))
axs[0].imshow(img, cmap="gray"); axs[0].set_title("Lo que ve la red (28x28)")
axs[1].bar(range(10), p); axs[1].set_xticks(range(10)); axs[1].set_title(f"Predicción: {p.argmax()} ({p.max():.0%})")
mapa = relu(conv2d(img[None, :, :, None], K1, b1))[0].mean(axis=2)
axs[2].imshow(mapa, cmap="magma"); axs[2].set_title("Activación media, capa 1")
plt.tight_layout(); plt.show()`)}
${warn("si dibujas un dígito pequeño y en una esquina, o con el trazo muy fino, la red falla más. Por eso la pizarra recorta y centra el trazo: MNIST se construyó así (dígito encajado en 20×20 y centrado por su centro de masa en 28×28). El script de la webcam hace algo parecido con <code>img = 1 - img</code>: invierte la imagen porque en papel escribes negro sobre blanco y MNIST es blanco sobre negro. Un modelo solo funciona bien con datos que se parezcan a los de su entrenamiento.")}
<h3>Densa frente a convolucional, MNIST y Fashion-MNIST</h3>
${staticCode(`import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt
from tensorflow.keras import Sequential, layers

(X_train, y_train), (X_test, y_test) = tf.keras.datasets.mnist.load_data()
X_train, X_test = X_train / 255.0, X_test / 255.0

def curvas(history, titulo):
    fig, axs = plt.subplots(1, 2, figsize=(12, 4))
    for ax, m in zip(axs, ["loss", "accuracy"]):
        ax.plot(history.history[m], label="entrenamiento"); ax.plot(history.history["val_" + m], label="validación")
        ax.set_title(f"{m} ({titulo})"); ax.set_xlabel("Época"); ax.legend()
    plt.show()

# Red densa: cada imagen se aplana a 784 valores
model_dense = Sequential([layers.Input(shape=(784,)),
                          layers.Dense(50, activation="relu"), layers.Dense(50, activation="relu"),
                          layers.Dense(50, activation="relu"), layers.Dense(10, activation="softmax")])
model_dense.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])
h1 = model_dense.fit(X_train.reshape(-1, 784), y_train, epochs=20, batch_size=30, validation_split=0.15, verbose=0)
curvas(h1, "densa")
print("Densa, accuracy en test:", model_dense.evaluate(X_test.reshape(-1, 784), y_test, verbose=0)[1])

# Red convolucional: las imágenes conservan su forma (28, 28, 1)
model_conv = Sequential([layers.Input(shape=(28, 28, 1)),
                         layers.Conv2D(32, (3, 3), activation="relu"), layers.MaxPooling2D((2, 2)),
                         layers.Conv2D(32, (3, 3), activation="relu"), layers.Conv2D(64, (3, 3), activation="relu"),
                         layers.Dropout(0.5), layers.Flatten(),
                         layers.Dense(128, activation="relu"), layers.Dense(10, activation="softmax")])
model_conv.summary()
model_conv.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])
h2 = model_conv.fit(X_train[..., None], y_train, epochs=8, batch_size=32, validation_split=0.15, verbose=0)
curvas(h2, "convolucional")
print("Convolucional, accuracy en test:", model_conv.evaluate(X_test[..., None], y_test, verbose=0)[1])

model_conv.save("modelo_mnist_convol.keras")        # formato nativo de Keras 3 (.h5 es el formato antiguo)`, "Keras: red densa frente a convolucional en MNIST (Colab)")}
${staticCode(`import numpy as np
import tensorflow as tf
from tensorflow.keras import Sequential, layers
from tensorflow.keras.optimizers import Adam

(X_train, Y_train), (X_test, Y_test) = tf.keras.datasets.fashion_mnist.load_data()
X_train, X_test = X_train / 255, X_test / 255
clases = ["camiseta", "pantalón", "jersey", "vestido", "abrigo", "sandalia", "camisa", "zapatilla", "bolso", "botín"]
print(dict(zip(*np.unique(Y_train, return_counts=True))))        # 6000 de cada clase: equilibrado

model = Sequential([layers.Input(shape=(28, 28, 1)),
                    layers.Conv2D(32, (3, 3), activation="relu"), layers.MaxPooling2D((2, 2)),
                    layers.Conv2D(128, (3, 3), activation="relu"), layers.Flatten(),
                    layers.Dense(200, activation="relu"), layers.Dense(10, activation="softmax")])
model.compile(optimizer=Adam(learning_rate=0.001), loss="sparse_categorical_crossentropy", metrics=["accuracy"])
history = model.fit(X_train[..., None], Y_train, epochs=10, batch_size=30, validation_split=0.15, verbose=0)
print("Fashion-MNIST, accuracy en test:", model.evaluate(X_test[..., None], Y_test, verbose=0)[1])`, "Keras: Fashion-MNIST con una red convolucional (Colab)")}
${staticCode(`import datetime
import tensorflow as tf

log_dir = "logs/mnist/" + datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
tensorboard = tf.keras.callbacks.TensorBoard(log_dir=log_dir, histogram_freq=1)

%load_ext tensorboard
%tensorboard --logdir logs/mnist

model_conv.fit(X_train[..., None], y_train, epochs=15, batch_size=32, validation_split=0.15, callbacks=[tensorboard])`, "TensorBoard en Colab (sin montar Drive: los registros se guardan en la sesión)")}
${warn("en el cuaderno de TensorBoard hay dos fallos. En la celda de la red densa se llama a <code>model.evaluate(X_test, y_test)</code>, que evalúa la red <b>convolucional</b> otra vez: el 'accuracy de la red densa' que imprime no es el suyo. Y <code>X_train2 = X_train.reshape(n, 784, 1)</code> crea una forma (784, 1) cuando la capa espera (784,): hay que aplanar a <code>reshape(n, 784)</code>.")}
${origen("Dense + Convolucional Mnist.py, FullyconectedNet + ConcolucionalNeuronalNet Fashion.py, ConvolucionalNet + Dense Minist + Tensorboard.ipynb y modelo_mnist_convol.h5")}
${exercise("Cuenta los parámetros", "Escribe <code>parametros_conv(kh, kw, cin, filtros)</code> y <code>parametros_densa(entradas, neuronas)</code> que devuelvan el número de parámetros (pesos + sesgos) de cada capa. Comprueba que reproduces los números de tu modelo.",
`def parametros_conv(kh, kw, cin, filtros):
    pass

def parametros_densa(entradas, neuronas):
    pass

print(parametros_conv(3, 3, 1, 32), parametros_conv(3, 3, 32, 64), parametros_densa(5184, 128))
`,
`<p>Cada filtro tiene <code>kh × kw × cin</code> pesos más un sesgo: <code>(kh * kw * cin + 1) * filtros</code>. Cada neurona densa tiene un peso por entrada más un sesgo: <code>(entradas + 1) * neuronas</code>.</p>`,
`assert parametros_conv(3, 3, 1, 32) == 320, "La primera Conv2D tiene 320 parámetros"
assert parametros_conv(3, 3, 32, 32) == 9248 and parametros_conv(3, 3, 32, 64) == 18496, "Revisa las Conv2D con varios canales de entrada"
assert parametros_densa(5184, 128) == 663680 and parametros_densa(128, 10) == 1290, "Revisa la fórmula de la capa densa"`,
`def parametros_conv(kh, kw, cin, filtros):
    return (kh * kw * cin + 1) * filtros

def parametros_densa(entradas, neuronas):
    return (entradas + 1) * neuronas`)}
${resumen(["Conv2D busca patrones locales con filtros compartidos; MaxPooling reduce; Flatten conecta con las capas densas.", "Un <code>.h5</code> es un archivo HDF5: arquitectura (JSON) + pesos (arrays), legible con <code>h5py</code>.", "Predecir con una CNN es solo convoluciones, ReLU, max-pooling, productos de matrices y softmax.", "Las entradas nuevas deben prepararse igual que las de entrenamiento (tamaño, centrado, colores, escala 0-1).", "Guarda con <code>model.save('modelo.keras')</code>; <code>.h5</code> es el formato antiguo."])}
${quiz("¿Por qué una CNN tolera mejor que una red densa que el dígito esté un poco desplazado?", ["Porque tiene más parámetros", "Porque el mismo filtro recorre toda la imagen y el pooling resume zonas", "Porque usa softmax"], 1, "Compartir filtros en todas las posiciones y resumir con max-pooling da cierta invariancia a pequeñas traslaciones.")}
</div>`},

{id:47, cat:"Deep learning", title:"DL III: API funcional, HOG y modelos con varias entradas", body:()=>`
<div class="theory">
<p><code>Sequential</code> sirve para pilas de capas con una entrada y una salida. La <b>API funcional</b> de Keras construye el modelo como un grafo: cada capa se <i>llama</i> sobre el resultado de la anterior, lo que permite varias entradas, varias salidas, ramas que se unen (<code>Concatenate</code>) y capas compartidas. El script de clase la usa para combinar dos representaciones de cada dígito: los píxeles y sus características <b>HOG</b>.</p>
${concepto("HOG: histograma de gradientes orientados", "divide la imagen en celdas y, en cada una, cuenta en qué direcciones cambia la intensidad (los bordes). Describe la <i>forma</i> del objeto y es poco sensible a cambios de brillo. Antes del deep learning era una de las mejores características para reconocer objetos; aquí se usa como segunda entrada de la red.")}
<h3>HOG con scikit-image</h3>
${codeBlock(`import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import load_digits
from skimage.feature import hog

digits = load_digits()                    # 1797 dígitos de 8x8 (MNIST no se puede descargar en el navegador)
X_raw = digits.data / 16
y = digits.target

def calc_hog_features(X, image_shape=(8, 8), pixels_per_cell=(4, 4)):
    fd_list = []
    for row in X:
        fd = hog(row.reshape(image_shape), orientations=8, pixels_per_cell=pixels_per_cell, cells_per_block=(1, 1))
        fd_list.append(fd)
    return np.array(fd_list)

X_hog = calc_hog_features(X_raw)
print("Píxeles:", X_raw.shape, "| HOG:", X_hog.shape, " (2x2 celdas x 8 orientaciones)")

fig, axs = plt.subplots(2, 6, figsize=(11, 4))
for i in range(6):
    _, vis = hog(digits.images[i], orientations=8, pixels_per_cell=(2, 2), cells_per_block=(1, 1), visualize=True)
    axs[0, i].imshow(digits.images[i], cmap="gray_r"); axs[0, i].set_title(f"Dígito {y[i]}"); axs[0, i].axis("off")
    axs[1, i].imshow(vis, cmap="magma"); axs[1, i].set_title("HOG"); axs[1, i].axis("off")
plt.tight_layout(); plt.show()`)}
<h3>¿Ayuda combinar las dos representaciones?</h3>
${codeBlock(`from sklearn.preprocessing import normalize
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import accuracy_score

X_hog_n = normalize(X_hog)               # norma L2 por imagen, como en el script
idx_train, idx_test = train_test_split(np.arange(len(y)), test_size=0.3, random_state=42, stratify=y)

conjuntos = {"píxeles (64)": X_raw, "HOG (32)": X_hog_n, "píxeles + HOG (96)": np.hstack([X_raw, X_hog_n])}
for nombre, Xc in conjuntos.items():
    m = MLPClassifier(hidden_layer_sizes=(20,), max_iter=2000, random_state=0).fit(Xc[idx_train], y[idx_train])
    print(f"{nombre:20s} accuracy en test = {accuracy_score(y[idx_test], m.predict(Xc[idx_test])):.3f}")`)}
${note("Aquí se concatenan las dos representaciones <i>antes</i> de una única red (fusión temprana). El script de clase hace algo más flexible con la API funcional: cada entrada pasa por su propia capa oculta y se concatenan las salidas de esas capas (fusión tardía). La idea es la misma: dar a la red información complementaria.")}
${staticCode(`import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Dense, Concatenate
from skimage.feature import hog
from sklearn.preprocessing import normalize

(x_train, y_train), (x_test, y_test) = tf.keras.datasets.mnist.load_data()
x_train_flat = x_train.reshape(len(x_train), -1).astype("float32") / 255     # mejor que escribir 60000 a mano
x_test_flat = x_test.reshape(len(x_test), -1).astype("float32") / 255

def calc_hog_features(X, pixels_per_cell=(4, 4)):
    return np.array([hog(img, orientations=8, pixels_per_cell=pixels_per_cell, cells_per_block=(1, 1)) for img in X])

hog_train = normalize(calc_hog_features(x_train.astype("float32")))    # (60000, 392): 7x7 celdas x 8 orientaciones
hog_test = normalize(calc_hog_features(x_test.astype("float32")))

# Modelo 1: píxeles
entrada1 = Input(shape=(784,))
oculta1 = Dense(20, activation="relu")(entrada1)
model1 = Model(entrada1, Dense(10, activation="softmax")(oculta1))

# Modelo 2: HOG
entrada2 = Input(shape=(392,))
oculta2 = Dense(10, activation="sigmoid")(entrada2)
model2 = Model(entrada2, Dense(10, activation="softmax")(oculta2))

for modelo, (Xtr, Xte) in [(model1, (x_train_flat, x_test_flat)), (model2, (hog_train, hog_test))]:
    modelo.compile(loss="sparse_categorical_crossentropy", optimizer="adam", metrics=["accuracy"])
    modelo.fit(Xtr, y_train, batch_size=32, epochs=10, validation_split=0.15, verbose=0)
    print("Test accuracy:", modelo.evaluate(Xte, y_test, verbose=0)[1])

# Modelo 3: las dos entradas, concatenando las capas ocultas de los modelos anteriores
h = Concatenate()([oculta1, oculta2])
model3 = Model(inputs=[entrada1, entrada2], outputs=Dense(10, activation="softmax")(h))
model3.compile(loss="sparse_categorical_crossentropy", optimizer="adam", metrics=["accuracy"])
model3.fit([x_train_flat, hog_train], y_train, batch_size=32, epochs=10, validation_split=0.15, verbose=0)
print("Modelo combinado, test accuracy:", model3.evaluate([x_test_flat, hog_test], y_test, verbose=0)[1])
tf.keras.utils.plot_model(model3, show_shapes=True, show_layer_names=True)    # necesita pydot y graphviz`, "Keras: API funcional con dos entradas (Colab)")}
${warn("<code>model3</code> <b>reutiliza</b> las capas <code>oculta1</code> y <code>oculta2</code> de los modelos 1 y 2. Son las mismas capas, con los mismos pesos: al entrenar <code>model3</code> se modifican también, y si vuelves a evaluar <code>model1</code> o <code>model2</code> obtendrás otros resultados (el propio script lo advierte en un comentario). Si quieres modelos independientes, crea capas nuevas para el combinado. Compartir capas a propósito, en cambio, es útil, por ejemplo para comparar dos imágenes con la misma red (redes siamesas).")}
${origen("Mnist API Functional.py")}
${exercise("Celdas más pequeñas", "Calcula <code>X_hog2</code> con <code>calc_hog_features</code> usando <code>pixels_per_cell=(2, 2)</code> sobre <code>X_raw</code>. ¿Cuántas características tiene cada dígito? Guarda ese número en <code>n_caracteristicas</code>.",
`X_hog2 = None
n_caracteristicas = None
`,
`<p>Con celdas de 2×2 en una imagen de 8×8 hay 4×4 = 16 celdas, y cada una aporta 8 orientaciones: 128 características. Más celdas describen la forma con más detalle, pero también con más ruido.</p>`,
`_ref = calc_hog_features(X_raw, pixels_per_cell=(2, 2))
assert X_hog2 is not None and X_hog2.shape == _ref.shape and np.allclose(X_hog2, _ref), f"X_hog2 debería tener forma {_ref.shape}"
assert n_caracteristicas == 128, f"Cada dígito tiene 128 características, no {n_caracteristicas}"`,
`X_hog2 = calc_hog_features(X_raw, pixels_per_cell=(2, 2))
n_caracteristicas = X_hog2.shape[1]
print(X_hog2.shape)`)}
${resumen(["API funcional: <code>Input</code> → capas llamadas sobre tensores → <code>Model(inputs, outputs)</code>.", "Permite varias entradas y salidas, ramas y <code>Concatenate</code>.", "Las capas reutilizadas comparten pesos: entrenar un modelo modifica los demás que las usan.", "HOG describe la forma con histogramas de orientaciones de los bordes; combinar representaciones puede ayudar."])}
${quiz("¿Cuándo necesitas la API funcional en lugar de Sequential?", ["Siempre que haya más de dos capas", "Cuando el modelo tiene varias entradas o salidas, ramas o capas compartidas", "Solo para redes convolucionales"], 1, "Sequential solo apila capas en línea. Cualquier topología que no sea una cadena simple requiere la API funcional (o subclases de Model).")}
</div>`},

{id:48, cat:"Deep learning", title:"DL IV: tus propias imágenes, aumento de datos y uso del modelo", body:()=>`
<div class="theory">
<p>Fuera de los datasets de ejemplo, las imágenes llegan como archivos en carpetas o comprimidas en un ZIP, con la etiqueta en el nombre del archivo o de la carpeta. En este módulo reproduces ese flujo completo (el de los cuadernos <i>Mnist_3_B</i> y la actividad grupal) en el disco virtual, aprendes a <b>aumentar</b> los datos y ves cómo se usa un modelo ya entrenado con imágenes nuevas, como hace el script de la webcam.</p>
<h3>De un ZIP de imágenes a un conjunto de datos</h3>
${codeBlock(`import os, zipfile
import numpy as np
from PIL import Image
from sklearn.datasets import load_digits

# Preparamos un ZIP como el de clase: imágenes PNG con la etiqueta en el nombre
digits = load_digits()
os.makedirs("Mnist", exist_ok=True)
for i, (img, etiqueta) in enumerate(zip(digits.images, digits.target)):
    Image.fromarray((img / 16 * 255).astype("uint8")).resize((28, 28), Image.NEAREST).save(f"Mnist/img{i}_label_{etiqueta}.png")
with zipfile.ZipFile("Mnist.zip", "w") as z:
    for nombre in sorted(os.listdir("Mnist")):
        z.write(os.path.join("Mnist", nombre))
print(len(os.listdir("Mnist")), "imágenes en Mnist.zip,", round(os.path.getsize("Mnist.zip") / 1024), "KB")`)}
${codeBlock(`import re, shutil

# 1. Descomprimir
shutil.rmtree("dataset", ignore_errors=True)
with zipfile.ZipFile("Mnist.zip", "r") as zip_ref:
    zip_ref.extractall("dataset")
dataset_path = "dataset/Mnist"

# 2. Leer cada imagen y sacar la etiqueta del nombre del archivo
data, labels = [], []
for archivo in sorted(os.listdir(dataset_path)):
    m = re.search(r"label_(\\d+)", archivo)
    if m is None:
        continue                                           # archivos que no siguen el patrón
    img = Image.open(os.path.join(dataset_path, archivo)).convert("L")
    data.append(np.asarray(img, dtype="float32") / 255)
    labels.append(int(m.group(1)))
data, labels = np.array(data), np.array(labels)
print("Datos:", data.shape, "| imágenes por clase:", np.bincount(labels))`)}
${warn("en <i>Mnist_3_B</i> la etiqueta se saca con <code>int(file[-5])</code>: el carácter que hay 5 posiciones antes del final. Funciona con 'test3555_label_8.png', pero falla en silencio si la etiqueta tiene dos cifras, si la extensión es '.jpeg' o si cambia el nombre. Una expresión regular (<code>label_(\\d+)</code>, módulo 12) dice exactamente qué buscas. Y en la actividad grupal, tras descomprimir el ZIP en <code>/content/dataset</code>, la variable <code>dataset_path</code> se <b>sobrescribe</b> con una ruta de Windows del profesor, así que las imágenes descomprimidas nunca se leen.")}
${codeBlock(`import matplotlib.pyplot as plt
from sklearn.utils import shuffle
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import accuracy_score

data, labels = shuffle(data, labels, random_state=42)
fig, axs = plt.subplots(1, 6, figsize=(10, 2))
for ax, img, et in zip(axs, data, labels):
    ax.imshow(img, cmap="gray"); ax.set_title(str(et)); ax.axis("off")
plt.show()

X_train, X_test, y_train, y_test = train_test_split(data, labels, test_size=0.2, random_state=42, stratify=labels)
modelo = MLPClassifier(hidden_layer_sizes=(100,), max_iter=300, random_state=0).fit(X_train.reshape(len(X_train), -1), y_train)
y_pred = modelo.predict(X_test.reshape(len(X_test), -1))
print("Accuracy en test:", round(accuracy_score(y_test, y_pred), 3))

errores = np.where(y_pred != y_test)[0][:8]
fig, axs = plt.subplots(1, len(errores), figsize=(1.5 * len(errores), 2))
for ax, i in zip(np.atleast_1d(axs), errores):
    ax.imshow(X_test[i], cmap="gray"); ax.set_title(f"real {y_test[i]} / pred {y_pred[i]}", fontsize=8); ax.axis("off")
plt.show()`)}
<h3>Aumento de datos</h3>
<p>Con pocas imágenes, una red memoriza. El <b>aumento de datos</b> (<i>data augmentation</i>) genera en cada época versiones ligeramente distintas de cada imagen (girada, desplazada, ampliada) para que aprenda lo esencial y no los detalles de cada foto.</p>
${codeBlock(`rng = np.random.default_rng(0)

def aumentar(img):
    im = Image.fromarray((img * 255).astype("uint8"))
    im = im.rotate(rng.uniform(-20, 20), resample=Image.BILINEAR)                   # giro
    dx, dy = (int(v) for v in rng.integers(-3, 4, size=2))
    im = im.transform(im.size, Image.AFFINE, (1, 0, -dx, 0, 1, -dy))                # desplazamiento
    zoom = rng.uniform(0.85, 1.15)
    lado = int(28 * zoom)
    im = im.resize((lado, lado), Image.BILINEAR)
    lienzo = Image.new("L", (max(28, lado), max(28, lado)))
    lienzo.paste(im, ((lienzo.width - lado) // 2, (lienzo.height - lado) // 2))
    return np.asarray(lienzo.crop(((lienzo.width - 28) // 2, (lienzo.height - 28) // 2,
                                   (lienzo.width - 28) // 2 + 28, (lienzo.height - 28) // 2 + 28)), dtype="float32") / 255

original = data[0]
fig, axs = plt.subplots(2, 6, figsize=(10, 3.6))
axs[0, 0].imshow(original, cmap="gray"); axs[0, 0].set_title("original")
for ax in list(axs[0, 1:]) + list(axs[1, :4]):
    ax.imshow(aumentar(original), cmap="gray"); ax.set_title("aumentada", fontsize=8)
axs[1, 4].imshow(original[:, ::-1], cmap="gray"); axs[1, 4].set_title("volteo horizontal", fontsize=8)
axs[1, 5].imshow(original[::-1, :], cmap="gray"); axs[1, 5].set_title("volteo vertical", fontsize=8)
for ax in axs.flat: ax.axis("off")
plt.tight_layout(); plt.show()`)}
${warn("las transformaciones deben producir imágenes que <i>podrían existir</i> en la realidad. Un 2 volteado ya no es un 2, así que con dígitos no se usan volteos. En el script de gatos y perros se activan <code>horizontal_flip</code> (razonable: un gato mirando a la izquierda sigue siendo un gato) y también <code>vertical_flip</code> (un gato boca abajo es una foto muy rara), lo que suele empeorar el modelo.")}
${staticCode(`import tensorflow as tf
from tensorflow.keras import layers, models

ancho = 125
# Lee las fotos de PetImages/Cat y PetImages/Dog; la etiqueta es el nombre de la carpeta
train_ds, val_ds = tf.keras.utils.image_dataset_from_directory(
    "PetImages", validation_split=0.2, subset="both", seed=42,
    color_mode="grayscale", image_size=(ancho, ancho), batch_size=32, label_mode="binary")

aumento = models.Sequential([layers.RandomFlip("horizontal"), layers.RandomRotation(0.08),
                             layers.RandomZoom(0.2), layers.RandomTranslation(0.1, 0.1)])

model = models.Sequential([
    layers.Input(shape=(ancho, ancho, 1)),
    aumento,                                   # solo actúa durante el entrenamiento
    layers.Rescaling(1 / 255),
    layers.Conv2D(32, 3, activation="relu"), layers.MaxPooling2D(),
    layers.Conv2D(64, 3, activation="relu"), layers.MaxPooling2D(),
    layers.Conv2D(128, 3, activation="relu"), layers.MaxPooling2D(),
    layers.Conv2D(256, 3, activation="relu"),
    layers.Dropout(0.25), layers.Flatten(),
    layers.Dense(250, activation="relu"), layers.Dropout(0.25),
    layers.Dense(1, activation="sigmoid"),     # probabilidad de perro
])
model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])
parada = tf.keras.callbacks.EarlyStopping(monitor="val_loss", patience=10, restore_best_weights=True)
history = model.fit(train_ds, validation_data=val_ds, epochs=200, callbacks=[parada])
model.save("catvsdog.keras")`, "Keras: gatos frente a perros con aumento de datos (Colab, necesita el dataset PetImages)")}
${note("Cambios respecto al script de clase: <code>ImageDataGenerator</code> está obsoleto y se sustituye por capas de aumento (<code>RandomFlip</code>, <code>RandomRotation</code>...) dentro del modelo; las imágenes se leen con <code>image_dataset_from_directory</code> en lugar de cargar las 25 000 en una lista; y se usa <code>EarlyStopping</code>, que en el script estaba comentado: con 200 épocas sin parada, el modelo acaba sobreajustando. Además, <code>train_test_split</code> no tenía <code>random_state</code>, así que cada ejecución usaba una partición distinta.")}
<h3>Usar un modelo ya entrenado con imágenes nuevas</h3>
${staticCode(`import cv2
import numpy as np
import tensorflow as tf

model = tf.keras.models.load_model("modelo_mnist_convol.h5")

def preprocess_image(frame):
    img = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    img = cv2.resize(img, (28, 28)).astype("float32") / 255
    img = (1 - img) ** 2              # papel: negro sobre blanco -> MNIST: blanco sobre negro, con más contraste
    return img[None, :, :, None]      # (1, 28, 28, 1): lote de una imagen con un canal

cap = cv2.VideoCapture(0)
while True:
    ok, frame = cap.read()
    if not ok:
        break
    probs = model.predict(preprocess_image(frame), verbose=0)[0]
    texto = f"{probs.argmax()} ({probs.max():.2f})" if probs.max() > 0.8 else "dudoso"
    cv2.putText(frame, texto, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)
    cv2.imshow("Webcam", frame)
    tecla = cv2.waitKey(1) & 0xFF           # UNA sola lectura de teclado por fotograma
    if tecla == ord("q"):
        break
cap.release()
cv2.destroyAllWindows()`, "Predicción en directo con la webcam (en tu ordenador: la webcam no es accesible desde Colab con OpenCV)")}
${warn("en los scripts de la webcam se llama dos veces a <code>cv2.waitKey(1)</code> en cada vuelta del bucle (una para la tecla 'r' y otra para la 'q'): cada llamada consume la pulsación, así que muchas veces la tecla se 'pierde'. Se lee una vez y se compara. En el de gatos y perros, el umbral de 0,95/0,05 con la clase 'Uncertain' es una buena idea: un clasificador binario siempre da una respuesta, aunque le enseñes una taza. Y un detalle: <code>import numpy as npq</code> crea un alias que nunca se usa.")}
${origen("Mnist_3_B.ipynb, Extra - Actividad Grupal.py, Cat vs dogs.py, modelo_catvsdog + Webcam V2.py y modelo_mnist_convol + WebCam (Mejorado) V2.py")}
${exercise("Etiquetas robustas", "Escribe <code>etiqueta_de_archivo(nombre)</code> que devuelva la etiqueta (un entero) que sigue a <code>label_</code> en el nombre del archivo, o <code>None</code> si no la hay. Debe funcionar con etiquetas de varias cifras y cualquier extensión.",
`import re

def etiqueta_de_archivo(nombre):
    pass

for n in ["test3555_label_8.png", "img_label_10.jpeg", "notas.txt"]:
    print(n, "->", etiqueta_de_archivo(n))
`,
`<p><code>re.search(r"label_(\\d+)", nombre)</code> busca el patrón; si hay coincidencia, <code>int(m.group(1))</code> convierte el grupo capturado. Con <code>int(nombre[-5])</code>, 'img_label_10.jpeg' daría un error, y otros nombres darían una etiqueta equivocada sin avisar.</p>`,
`assert etiqueta_de_archivo("test3555_label_8.png") == 8, "test3555_label_8.png -> 8"
assert etiqueta_de_archivo("img_label_10.jpeg") == 10, "Debe funcionar con etiquetas de dos cifras y otras extensiones"
assert etiqueta_de_archivo("notas.txt") is None, "Sin 'label_' debe devolver None"`,
`def etiqueta_de_archivo(nombre):
    m = re.search(r"label_(\\d+)", nombre)
    return int(m.group(1)) if m else None`)}
${resumen(["Lee imágenes de carpetas o ZIP con <code>os</code>, <code>zipfile</code> y PIL u OpenCV; extrae la etiqueta con regex o del nombre de la carpeta.", "Comprueba el balance de clases y baraja antes de dividir.", "El aumento de datos solo debe crear imágenes realistas, y solo se aplica al entrenar.", "Al usar el modelo, prepara cada imagen exactamente igual que en el entrenamiento.", "Con clasificadores binarios, un umbral de confianza evita respuestas forzadas."])}
${quiz("Entrenas un detector de perros con fotos de día y falla con fotos nocturnas de la webcam. ¿Qué ocurre?", ["La red está mal programada", "Cambio de dominio: los datos nuevos no se parecen a los de entrenamiento", "Faltan épocas"], 1, "Es el mismo motivo por el que el script de la webcam invierte los colores para MNIST: el modelo solo sabe de lo que ha visto.")}
</div>`},

{id:49, cat:"Deep learning", title:"DL V: PyTorch y el bucle de entrenamiento", body:()=>`
<div class="theory">
<p><b>PyTorch</b> (Meta, 2016) es la otra gran librería de deep learning, muy usada en investigación por ser más 'pythónica': el modelo es una clase y el entrenamiento es un bucle que escribes tú. Sus piezas son los <b>tensores</b> (arrays multidimensionales, como los de NumPy, que pueden vivir en la GPU y recordar cómo se calcularon), <code>nn.Module</code> o <code>nn.Sequential</code> para definir la red, <code>DataLoader</code> para servir los datos en lotes y un <b>optimizador</b> que actualiza los pesos.</p>
${concepto("El bucle de entrenamiento de PyTorch", "para cada lote: <code>optimizer.zero_grad()</code> borra los gradientes del lote anterior → <code>outputs = model(inputs)</code> calcula la salida (<i>forward</i>) → <code>loss = criterion(outputs, labels)</code> mide el error → <code>loss.backward()</code> calcula el gradiente de la pérdida respecto a cada peso (<i>backpropagation</i>) → <code>optimizer.step()</code> mueve los pesos. Para validar: <code>model.eval()</code> y <code>with torch.no_grad():</code>.")}
<h3>El mismo bucle, escrito con NumPy</h3>
<p>PyTorch no funciona en el navegador, pero su bucle se entiende mejor si lo escribes tú: una red de dos capas (como <code>nn.Linear(64, 32)</code> + ReLU + <code>nn.Linear(32, 10)</code>) entrenada con SGD sobre los dígitos de 8×8. Cada línea lleva al lado su equivalente en PyTorch.</p>
${codeBlock(`import numpy as np
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split

digits = load_digits()
X = (digits.data / 16 - 0.5) / 0.5                 # transforms.Normalize((0.5,), (0.5,)): de [0, 1] a [-1, 1]
y = digits.target
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
X_tr, X_val, y_tr, y_val = train_test_split(X_tr, y_tr, test_size=0.15, random_state=42, stratify=y_tr)
print("Entrenamiento:", X_tr.shape, "| validación:", X_val.shape, "| prueba:", X_te.shape)

rng = np.random.default_rng(0)
def lineal(n_in, n_out):                           # inicialización por defecto de nn.Linear
    k = 1 / np.sqrt(n_in)
    return rng.uniform(-k, k, (n_in, n_out)), rng.uniform(-k, k, n_out)
W1, b1 = lineal(64, 32)
W2, b2 = lineal(32, 10)

def forward(X):                                    # model(inputs)
    z1 = X @ W1 + b1
    a1 = np.maximum(z1, 0)                         # nn.ReLU()
    return z1, a1, a1 @ W2 + b2                    # logits: nn.Linear(32, 10) sin softmax

def cross_entropy(logits, y):                      # nn.CrossEntropyLoss() = LogSoftmax + NLLLoss
    z = logits - logits.max(axis=1, keepdims=True)
    log_p = z - np.log(np.exp(z).sum(axis=1, keepdims=True))
    return -log_p[np.arange(len(y)), y].mean(), np.exp(log_p)`)}
${codeBlock(`lr, epochs, batch_size = 0.1, 30, 64
hist = {"train_loss": [], "val_loss": [], "train_acc": [], "val_acc": []}

for epoch in range(epochs):
    orden = rng.permutation(len(X_tr))                         # DataLoader(..., shuffle=True)
    perdidas, aciertos = [], 0
    for i in range(0, len(orden), batch_size):
        idx = orden[i:i + batch_size]
        xb, yb = X_tr[idx], y_tr[idx]
        z1, a1, logits = forward(xb)                           # outputs = model(inputs)
        loss, p = cross_entropy(logits, yb)                    # loss = criterion(outputs, labels)
        # loss.backward(): regla de la cadena, de la salida hacia la entrada
        d_logits = p.copy()
        d_logits[np.arange(len(yb)), yb] -= 1
        d_logits /= len(yb)
        dW2, db2 = a1.T @ d_logits, d_logits.sum(axis=0)
        d_z1 = (d_logits @ W2.T) * (z1 > 0)                    # la ReLU deja pasar el gradiente solo donde z1 > 0
        dW1, db1 = xb.T @ d_z1, d_z1.sum(axis=0)
        for param, grad in ((W1, dW1), (b1, db1), (W2, dW2), (b2, db2)):
            param -= lr * grad                                 # optimizer.step() con SGD
        perdidas.append(loss)
        aciertos += (logits.argmax(axis=1) == yb).sum()        # _, predicted = torch.max(outputs, 1)
    # model.eval() + with torch.no_grad(): solo forward, sin actualizar pesos
    logits_val = forward(X_val)[2]
    hist["train_loss"].append(np.mean(perdidas)); hist["val_loss"].append(cross_entropy(logits_val, y_val)[0])
    hist["train_acc"].append(100 * aciertos / len(X_tr)); hist["val_acc"].append(100 * (logits_val.argmax(axis=1) == y_val).mean())
    if (epoch + 1) % 5 == 0:
        print(f"Epoch {epoch + 1}/{epochs}  Train Loss: {hist['train_loss'][-1]:.4f}  Train Acc: {hist['train_acc'][-1]:.2f}%  "
              f"Val Loss: {hist['val_loss'][-1]:.4f}  Val Acc: {hist['val_acc'][-1]:.2f}%")`)}
${codeBlock(`import matplotlib.pyplot as plt

fig, axs = plt.subplots(1, 2, figsize=(12, 4))
axs[0].plot(hist["train_loss"], label="Train Loss"); axs[0].plot(hist["val_loss"], label="Val Loss")
axs[0].set_title("Loss durante el entrenamiento"); axs[0].set_xlabel("Epochs"); axs[0].legend()
axs[1].plot(hist["train_acc"], label="Train Accuracy"); axs[1].plot(hist["val_acc"], label="Val Accuracy")
axs[1].set_title("Accuracy durante el entrenamiento"); axs[1].set_xlabel("Epochs"); axs[1].set_ylabel("%"); axs[1].legend()
plt.show()

acc_test = (forward(X_te)[2].argmax(axis=1) == y_te).mean()
print(f"Final Test Accuracy: {100 * acc_test:.2f}%")`)}
${tip("Fíjate en que la precisión de validación sube y baja de una época a otra: con <code>lr=0.1</code> los pasos son grandes y el modelo oscila alrededor del mínimo. Prueba <code>lr=0.05</code> o más épocas. La tasa de aprendizaje es uno de los ajustes que más influyen en el entrenamiento, también en PyTorch y Keras.")}
${concepto("Lo que PyTorch te ahorra", "lo único realmente laborioso de la celda anterior son las cuatro líneas de gradientes: con muchas capas y operaciones distintas, derivarlas a mano es inviable. PyTorch guarda el 'historial' de operaciones de cada tensor (<i>autograd</i>) y <code>loss.backward()</code> calcula todos los gradientes automáticamente. Todo lo demás, el bucle por épocas y lotes, la pérdida y el paso del optimizador, es exactamente lo que acabas de escribir.")}
${staticCode(`import torch
import torch.nn as nn
import torch.optim as optim
import torchvision
import torchvision.transforms as transforms
import matplotlib.pyplot as plt

transform = transforms.Compose([transforms.ToTensor(), transforms.Normalize((0.5,), (0.5,))])
train_dataset = torchvision.datasets.MNIST(root="./data", train=True, download=True, transform=transform)
test_dataset = torchvision.datasets.MNIST(root="./data", train=False, download=True, transform=transform)
train_loader = torch.utils.data.DataLoader(train_dataset, batch_size=64, shuffle=True)
test_loader = torch.utils.data.DataLoader(test_dataset, batch_size=64, shuffle=False)

model = nn.Sequential(
    nn.Flatten(),                  # 28x28 -> 784
    nn.Linear(784, 128), nn.ReLU(),
    nn.Linear(128, 64), nn.ReLU(),
    nn.Linear(64, 10),
    nn.LogSoftmax(dim=1),          # log-probabilidades...
)
criterion = nn.NLLLoss()           # ...con NLLLoss equivale a nn.CrossEntropyLoss() sin LogSoftmax
optimizer = optim.SGD(model.parameters(), lr=0.01)

for epoch in range(10):
    running_loss, correct, total = 0.0, 0, 0
    for images, labels in train_loader:
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        running_loss += loss.item()
        correct += (outputs.argmax(dim=1) == labels).sum().item()
        total += labels.size(0)
    print(f"Epoch {epoch + 1}, Loss: {running_loss / len(train_loader):.4f}, Accuracy: {100 * correct / total:.2f}%")

model.eval()
correct = total = 0
with torch.no_grad():
    for images, labels in test_loader:
        correct += (model(images).argmax(dim=1) == labels).sum().item()
        total += labels.size(0)
print(f"Final Test Accuracy: {100 * correct / total:.2f}%")`, "PyTorch: red densa con nn.Sequential (Colab)")}
${staticCode(`import torch
import torch.nn as nn
import torch.optim as optim
import torchvision
import torchvision.transforms as transforms
from torch.utils.data import DataLoader, random_split

device = "cuda" if torch.cuda.is_available() else "cpu"        # en Colab: Entorno de ejecución > GPU
transform = transforms.Compose([transforms.ToTensor(), transforms.Normalize((0.5,), (0.5,))])
trainset = torchvision.datasets.MNIST(root="./data", train=True, download=True, transform=transform)
testset = torchvision.datasets.MNIST(root="./data", train=False, download=True, transform=transform)
n_val = int(0.15 * len(trainset))
train_data, val_data = random_split(trainset, [len(trainset) - n_val, n_val], generator=torch.Generator().manual_seed(42))
trainloader = DataLoader(train_data, batch_size=64, shuffle=True)
valloader = DataLoader(val_data, batch_size=64)
testloader = DataLoader(testset, batch_size=64)

class CNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(1, 32, kernel_size=3, padding=1)
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.conv3 = nn.Conv2d(64, 128, kernel_size=3, padding=1)
        self.pool = nn.MaxPool2d(2, 2)
        self.fc1 = nn.Linear(128 * 3 * 3, 128)       # 28 -> 14 -> 7 -> 3 tras tres max-pooling
        self.fc2 = nn.Linear(128, 10)

    def forward(self, x):
        x = self.pool(torch.relu(self.conv1(x)))
        x = self.pool(torch.relu(self.conv2(x)))
        x = self.pool(torch.relu(self.conv3(x)))
        x = torch.flatten(x, 1)
        x = torch.relu(self.fc1(x))
        return self.fc2(x)                         # logits: CrossEntropyLoss aplica el softmax

model = CNN().to(device)
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

def evaluar(loader):
    model.eval()
    perdida, correctos, total = 0.0, 0, 0
    with torch.no_grad():
        for inputs, labels in loader:
            inputs, labels = inputs.to(device), labels.to(device)
            outputs = model(inputs)
            perdida += criterion(outputs, labels).item()
            correctos += (outputs.argmax(dim=1) == labels).sum().item()
            total += labels.size(0)
    return perdida / len(loader), 100 * correctos / total

for epoch in range(5):
    model.train()
    for inputs, labels in trainloader:
        inputs, labels = inputs.to(device), labels.to(device)
        optimizer.zero_grad()
        loss = criterion(model(inputs), labels)
        loss.backward()
        optimizer.step()
    print(f"Epoch {epoch + 1}: validación (loss, acc) = {evaluar(valloader)}")
print("Test (loss, acc):", evaluar(testloader))`, "PyTorch: red convolucional con nn.Module, validación y test (Colab)")}
${warn("en los cuadernos de PyTorch hay tres detalles. Se crea <code>testloader</code> pero <b>nunca se usa</b>: el modelo solo se mide con validación, y la nota final debería salir del conjunto de prueba. Se separa la validación con <code>train_test_split</code> de scikit-learn sobre el <code>Dataset</code> de torchvision, que funciona pero carga y transforma las 60 000 imágenes en memoria; <code>random_split</code> solo reparte índices. Y <code>outputs.data</code> es una forma antigua; dentro de <code>torch.no_grad()</code> basta con <code>outputs</code>.")}
${concepto("Normalize((0.5,), (0.5,))", "resta 0,5 y divide entre 0,5: los píxeles pasan de [0, 1] a [−1, 1]. Cualquier imagen nueva que des al modelo tiene que pasar por la misma transformación; si le das valores en [0, 1], las predicciones empeoran aunque la red sea perfecta.")}
${origen("Pytorch_Dense_Sequential.ipynb, Pytorch_Dense_Mnist.ipynb, Pytorch_Conv_Mnist.ipynb y Tema 14 (PyTorch)")}
${exercise("CrossEntropy = LogSoftmax + NLLLoss", "Escribe <code>log_softmax(z)</code> (por filas, restando el máximo para evitar desbordamientos) y <code>nll_loss(log_p, y)</code> (la media de −log_p de la clase correcta de cada fila). Comprueba que <code>nll_loss(log_softmax(z), y)</code> coincide con la pérdida de <code>cross_entropy</code>.",
`import numpy as np

def log_softmax(z):
    pass

def nll_loss(log_p, y):
    pass

z = np.array([[2.0, 1.0, 0.1], [0.5, 2.5, 0.3]])
y = np.array([0, 1])
print(nll_loss(log_softmax(z), y), cross_entropy(z, y)[0])
`,
`<p><code>log_softmax(z) = z − max − log(Σ exp(z − max))</code>, fila a fila con <code>keepdims=True</code>. Para la NLL, <code>-log_p[np.arange(len(y)), y].mean()</code> toma de cada fila la columna de su clase correcta. Por eso en PyTorch o pones <code>LogSoftmax</code> + <code>NLLLoss</code>, o dejas la última capa sin activación y usas <code>CrossEntropyLoss</code>, pero nunca softmax + <code>CrossEntropyLoss</code> (se aplicaría dos veces).</p>`,
`_z = np.array([[2.0, 1.0, 0.1], [0.5, 2.5, 0.3], [1000.0, 0.0, -1000.0]])
_y = np.array([0, 1, 0])
_ls = log_softmax(_z)
assert _ls is not None and np.allclose(np.exp(_ls).sum(axis=1), 1), "Las probabilidades de cada fila deben sumar 1 (¿has restado el máximo?)"
assert abs(nll_loss(_ls, _y) - cross_entropy(_z, _y)[0]) < 1e-9, "nll_loss(log_softmax(z), y) debe coincidir con la entropía cruzada"`,
`def log_softmax(z):
    z = z - z.max(axis=1, keepdims=True)
    return z - np.log(np.exp(z).sum(axis=1, keepdims=True))

def nll_loss(log_p, y):
    return -log_p[np.arange(len(y)), y].mean()`)}
${resumen(["Tensores = arrays de NumPy con GPU y <i>autograd</i>.", "Modelo: <code>nn.Sequential</code> o una clase <code>nn.Module</code> con <code>__init__</code> (capas) y <code>forward</code> (cálculo).", "Bucle: <code>zero_grad</code> → forward → pérdida → <code>backward</code> → <code>step</code>; validar con <code>eval()</code> y <code>no_grad()</code>.", "<code>CrossEntropyLoss</code> espera logits; <code>LogSoftmax</code> va con <code>NLLLoss</code>.", "Mide siempre el resultado final en el conjunto de prueba."])}
${quiz("Olvidas <code>optimizer.zero_grad()</code> en el bucle. ¿Qué pasa?", ["Nada: es opcional", "Los gradientes se acumulan de un lote a otro y los pasos del optimizador salen mal", "El modelo no se puede ejecutar"], 1, "PyTorch suma los gradientes nuevos a los que ya hay. Sin borrarlos, cada paso usa la suma de todos los lotes anteriores.")}
</div>`}
);
