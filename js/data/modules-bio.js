/* Bloque BIOINFORMÁTICA — basado en BIOPYTHON_clases6,7, clase_5 (APIs), clase_8_repaso y clase_9 (RDKit) */
MODULES.push(

{id:28, cat:"Bioinformática", title:"Biopython I: secuencias y sus propiedades", body:()=>`
<div class="theory">
<p><b>Biopython</b> es la librería de referencia para biología computacional en Python. Su objeto <code>Seq</code> se comporta como una cadena de texto (puedes indexarlo, cortarlo, buscar en él), pero además "sabe biología": transcribe, traduce, calcula complementarias...</p>
${codeBlock(`from Bio.Seq import Seq

p53 = Seq("MEEPQSDPSVEPPLSQETFSDLWKLLPENNVLSPLPSQAMDDLMLSPDDIEQWFTEDPGPDEAPRMPEAAPPVAPAPAAPTPAAPAPAPSWPL")
print("Primer aminoácido:", p53[0])
print("Subsecuencia 5-15:", p53[5:15])
print("¿Contiene 'PAP'?", "PAP" in p53, "| veces:", p53.count("PAP"))
print("Dividida por 'P':", p53.split("P")[:5])
print("Unida:", Seq("KLLPENNV") + Seq("APTPAAPAPAP"))
print("Invertida:", p53[::-1][:20])`)}
<h3>Contar patrones (y una trampa: Seq no valida)</h3>
${codeBlock(`from Bio.Seq import Seq

secuencia_adn = Seq("ACGGATACGGATAGCTAGTCCGG")
print("Ocurrencias de 'GG':", secuencia_adn.count("GG"))
print("En 'AGGGA', count da", Seq("AGGGA").count("GG"), "y count_overlap da", Seq("AGGGA").count_overlap("GG"))

ejemplo = Seq("AHDSHFBJDS")              # Seq acepta CUALQUIER texto, aunque no sea biológico
print(ejemplo[0:3], "| 'DS' aparece", ejemplo.count("DS"), "veces")

def es_adn(seq):
    return set(str(seq).upper()) <= set("ACGTN")

print("¿ACGG... es ADN?", es_adn(secuencia_adn), "| ¿AHDSHFBJDS es ADN?", es_adn(ejemplo))`)}
${concepto("count frente a count_overlap", "<code>count</code> no solapa coincidencias (como <code>str.count</code>): en AGGGA encuentra un GG y salta. <code>count_overlap</code> cuenta también las solapadas. Para motivos repetitivos (microsatélites, homopolímeros) suele interesar la segunda.")}
${warn("dar por hecho que Biopython comprueba la secuencia. <code>Seq('AHDSHFBJDS')</code> es válido aunque contenga letras que no son nucleótidos, y <code>translate()</code> o <code>gc_fraction</code> darán resultados sin sentido o errores más adelante. Valida tú los datos de entrada.")}
<h3>El dogma central en tres líneas</h3>
${codeBlock(`from Bio.Seq import Seq

adn = Seq("ATGCGCTAATCGCGAAAGCTTAGCGATCGGATCGTAGCTAGCTAGCTACGT")
arn = adn.transcribe()
proteina = arn.translate()
print("ADN:          ", adn)
print("ARN:          ", arn)
print("Proteína:     ", proteina)                         # * = codón de parada
print("Hasta el stop:", adn.translate(to_stop=True))
print("Sin paradas:  ", str(proteina).replace("*", ""))
print("Complementaria:          ", adn.complement())
print("Reversa complementaria:  ", adn.reverse_complement())`)}
${concepto("complement vs reverse_complement", "la hebra opuesta del ADN se lee en sentido contrario (5'→3'). Por eso, para buscar genes o diseñar cebadores en la otra hebra casi siempre necesitas <code>reverse_complement()</code>, no solo <code>complement()</code>.")}
${warn("traducir una secuencia cuya longitud no es múltiplo de 3. Biopython avisa con <i>Partial codon</i>. Recórtala antes: <code>adn[:len(adn) - len(adn) % 3]</code>.")}
${codeBlock(`from Bio.Seq import Seq

proteina = Seq("MEEPQSDPSVEPPLSQETFSDLWKLLPENNVLSPLPSQAMDDLMLSPDDIEQWFTEDPGP")
gc_proteina = (proteina.count("G") + proteina.count("C")) / len(proteina) * 100
print(f"'GC' de la proteína p53: {gc_proteina:.1f} %  <- cuenta glicinas (G) y cisteínas (C): no significa nada")

adn = Seq("ATGCGCTAATCGCGAAAGCTTAGCGATCGGATCGTAGCTAGCTAGCTACGT")
gc_adn = (adn.count("G") + adn.count("C")) / len(adn) * 100
print(f"GC del ADN: {gc_adn:.1f} %")`)}
${warn("en el script de clase el porcentaje GC se calcula sobre la secuencia de la <b>proteína</b> p53. El código no falla, pero el resultado no tiene sentido biológico: en una proteína, G es glicina y C es cisteína. El contenido GC es una propiedad de los ácidos nucleicos (ADN o ARN).")}
<h3>Bio.SeqUtils: propiedades fisicoquímicas</h3>
${codeBlock(`from Bio.Seq import Seq
from Bio.SeqUtils import seq3, seq1, molecular_weight, gc_fraction
from Bio.SeqUtils.IsoelectricPoint import IsoelectricPoint
from Bio.SeqUtils import MeltingTemp as mt

prot = Seq("MAIVMGRWKGAR")
tres = seq3(prot)
print("Tres letras:", tres, "->", seq1(tres))
print("Peso proteína:", round(molecular_weight(prot, "protein"), 1), "Da")

ip = IsoelectricPoint(str(prot))
print("Punto isoeléctrico:", round(ip.pi(), 2), "| carga a pH 7:", round(ip.charge_at_pH(7), 2))

cebador = Seq("ATCGATCGATCGATCGAACTGATCGTAACG")
print("GC:", round(gc_fraction(cebador) * 100, 1), "%")
print("Tm Wallace:", mt.Tm_Wallace(cebador), "°C")
print("Tm por GC:", round(mt.Tm_GC(cebador), 1), "°C")
print("Tm nearest-neighbor:", round(mt.Tm_NN(cebador), 1), "°C")`)}
${codeBlock(`from Bio.SeqUtils.ProtParam import ProteinAnalysis

pa = ProteinAnalysis("MEEPQSDPSVEPPLSQETFSDLWKLLPENNVLSPLPSQAMDDLMLSPDDIEQWFTEDPGP")
print("Peso molecular:", round(pa.molecular_weight(), 1))
print("Aromaticidad:", round(pa.aromaticity(), 3))
print("Índice de inestabilidad:", round(pa.instability_index(), 1), "(>40 = inestable)")
print("GRAVY (hidrofobicidad):", round(pa.gravy(), 3))
print("Punto isoeléctrico:", round(pa.isoelectric_point(), 2))
helice, giro, lamina = pa.secondary_structure_fraction()
print(f"Estructura secundaria estimada: hélice {helice:.0%}, giro {giro:.0%}, lámina {lamina:.0%}")
print(sorted(pa.count_amino_acids().items(), key=lambda x: -x[1])[:5])`)}
${origen("BIOPYTHON_3.py y BIOPYTHON7_6_SeqUtils.py")}
<h3>Buscar ORFs con Biopython</h3>
${codeBlock(`from Bio.Seq import Seq

def encontrar_orfs(secuencia, min_len=30):
    orfs = []
    for i in range(len(secuencia) - 2):
        if secuencia[i:i+3] == "ATG":
            for j in range(i + 3, len(secuencia) - 2, 3):
                if secuencia[j:j+3] in ("TAA", "TAG", "TGA"):
                    if j + 3 - i >= min_len:
                        orfs.append((i, j + 3, Seq(secuencia[i:j+3]).translate()))
                    break
    return orfs

secuencia = (
    "AA TAT TCG TGT TTT TTT CAA ACT GTG AGA GAA AAA GAA AGA GAG AAA GAG ATG GGA GAG ATT GGG TTT A"
    "CA GAG AAG CAA GAA GCT TTG GTG AAG GAA TCG TGG GAG ATA CTG AAA CAA GAC ATC CCC AAA TAC AGC C"
    "TT CAC TTC TTC TCA CAG TAA CCA TAT ATA CTT AGT TAT ATA TAA GCT CTT TAC ATG TTG TTT ATA TAT G"
    "CG AGC TAA TGA ACA ATA TAA TTG TGA TAG GAT ACT GGA GAT AGC ACC AGC AGC AAA AGG CTT GTT CTC T"
    "TT CCT AAG AGA CTC AGA TGA AGT CCC TCA CAA CAA TCC TAA ACT CAA AGC TCA TGC TGT TAA AGT CTT C"
    "AA GAT GGT AAT TAC TTA CTT TCC GAT TTT CCA CAT CTA CAT ATA TGT GAA TCA CTT GCA TAT ACT GTA T"
    "CA TTA TCT TAC CAT TCC TTA AAA TTG AAA GTA GAA TGT TTC ATT ATT TAC AGC TAA GAA TCT TTA TTT A"
    "CT CAT TAT ATA CCA TTT ATA TAT AAT AGA AAA TAG TAG TCT GAA TTA ACT TTT CTT GTC ATT TAT TGA C"
    "GC AGC CAT GTG CAC ACA AGT TGC GAT TTT GTT TGA ACT TGG CTA GTT GGC TTT GTC TTC TTC TTT GAG A"
    "AT AAA AAT CTC ATA CTA GTA AAG AAT ACT CTG TGA TAT TTT ATT TTT AAG AAC AAA CAT AGA TTT CTC T"
    "GT CAA TAA AGA ATT GTT ACT GAA GAA TCC AAG TGG TTC GGG TCG CTT TAT GGA TTT TTA CTT TTT TGC T"
    "AA TCT TAT TAT AAT AGA ACC ATA TAA ACC AAA TTC CGT TTA CTT TTT AAA TTT GGG TTT ATG ACT TGG T"
    "TT GGT TCA ACT CAC TTT TGG CTT CTA AGA CTT TGC ATA ACA TGT TTT AGA CAG ACA AAA AAG AAA AAG A"
    "CTT GCA TAA CAT GTA TGA ATT TTT ATT TTA TTT TGT TTG TGT GTA GAC ATG TGA AAC AGC TAT ACA GCT "
    "GAG GGA GGA AGG AAA GGT GGT AGT GGC TGA CAC AAC CCT CCA ATA TTT AGG CTC AAT TCA TCT CAA AAG "
    "CGG CGT TAT TGA CCC TCA CTT CGA GGT CTG TTA TGT TAA AAA AAA ATA TAT ATA CAC ATT AAT TTT GGC "
    "TGA TTT TGA TTT TCG ATT TGA ACG CAT TTT AAT AAG GTG TGA ATG TGA AAG CAG GTG GTG AAA GAA GCT "
    "TTG CTA AGG ACA TTG AAA GAG GGG TTG GGG GAG AAA TAC AAT GAA GAA GTG GAA GGT GCT TGG TCT CAA "
    "GCT TAT GAT CAC TTG GCT TTA GCC ATC AAG ACC GAG ATG AAA CAA GAA GAG TCA TAA AAC CCT ATT GAT "
    "CAT TGG GTA TCG CAT ACA TGA ATC TAT TCC ACA T"
)
adn = secuencia.replace(" ", "")          # quitamos los espacios entre codones
print("Longitud:", len(adn), "pb")
for inicio, fin, prot in encontrar_orfs(adn):
    print(f"ORF {inicio}-{fin} ({fin - inicio} pb): {prot}")`)}
${warn("en el script original la línea <code>orfs = []      '''lista vacía'''</code> pone un texto entre comillas triples detrás de una instrucción: Python lo interpreta como código y da <code>SyntaxError</code>. Los comentarios van con <code>#</code>; las comillas triples solo sirven como docstring al principio de una función. Además, la secuencia original tiene un grupo de 4 letras (<code>ACTT</code>) entre los tripletes: al quitar los espacios, todo lo que viene detrás cambia de marco de lectura, un recordatorio de que los espacios 'de lectura' no son codones reales.")}
${exercise("ORFs en las dos hebras", "El buscador anterior solo mira la hebra directa. Escribe <code>orfs_dos_hebras(seq, min_len=30)</code> que devuelva una lista de tuplas <code>(hebra, inicio, fin, proteina)</code> con los ORFs de la hebra directa (<code>'+'</code>) y de su <b>reversa complementaria</b> (<code>'-'</code>). Reutiliza <code>encontrar_orfs</code> (ejecuta antes su celda); las coordenadas de la hebra '-' se refieren a la reversa complementaria.",
`from Bio.Seq import Seq

def orfs_dos_hebras(seq, min_len=30):
    resultado = []
    return resultado

print(len(orfs_dos_hebras(adn)), "ORFs en total")
`,
`<p>Recorre los ORFs de <code>encontrar_orfs(seq, min_len)</code> añadiendo <code>'+'</code> delante, y después los de <code>encontrar_orfs(str(Seq(seq).reverse_complement()), min_len)</code> con <code>'-'</code>. Una tupla se amplía con <code>('+',) + orf</code>. En genomas reales, la mitad de los genes están en la hebra opuesta: buscar solo en una es perder la mitad.</p>`,
`from Bio.Seq import Seq
esperado = [("+",) + o for o in encontrar_orfs(adn)] + [("-",) + o for o in encontrar_orfs(str(Seq(adn).reverse_complement()))]
r = orfs_dos_hebras(adn)
assert len(r) == len(esperado), f"Esperaba {len(esperado)} ORFs y tienes {len(r)}"
assert {(h, i, f) for h, i, f, _ in r} == {(h, i, f) for h, i, f, _ in esperado}, "Hebras o coordenadas incorrectas"
assert any(h == "-" for h, *_ in r), "No hay ningún ORF de la hebra '-'"`,
`def orfs_dos_hebras(seq, min_len=30):
    resultado = [("+",) + orf for orf in encontrar_orfs(seq, min_len)]
    reversa = str(Seq(seq).reverse_complement())
    resultado += [("-",) + orf for orf in encontrar_orfs(reversa, min_len)]
    return resultado

for hebra, inicio, fin, prot in orfs_dos_hebras(adn):
    print(hebra, inicio, fin, prot)`)}
${exercise("Ficha de un cebador", "Para el cebador dado, guarda en <code>gc</code> su porcentaje de GC (0-100), en <code>tm</code> la Tm por el método de Wallace y en <code>rc</code> su reversa complementaria como texto (str).",
`from Bio.Seq import Seq
from Bio.SeqUtils import gc_fraction
from Bio.SeqUtils import MeltingTemp as mt
cebador = Seq("GGATCCATGGCTAGCAAGG")
gc = tm = rc = None
`,
`<p><code>gc_fraction</code> devuelve una fracción (0-1), así que hay que multiplicar por 100. <code>reverse_complement()</code> devuelve un <code>Seq</code>: conviértelo con <code>str()</code>.</p>`,
`assert abs(gc - 57.89) < 0.1, f"GC esperado ≈ 57.9 %, tienes {gc}"
assert tm == 60.0, f"Tm Wallace esperada 60.0, tienes {tm}"
assert rc == "CCTTGCTAGCCATGGATCC", f"Reversa complementaria incorrecta: {rc}"`,
`gc = gc_fraction(cebador) * 100
tm = mt.Tm_Wallace(cebador)
rc = str(cebador.reverse_complement())`)}
${resumen(["<code>Seq</code> funciona como un str con métodos biológicos.", "<code>transcribe()</code>, <code>translate(to_stop=True)</code>, <code>complement()</code>, <code>reverse_complement()</code>.", "<code>Bio.SeqUtils</code>: <code>gc_fraction, molecular_weight, seq1/seq3, MeltingTemp, IsoelectricPoint</code>.", "<code>ProteinAnalysis</code>: inestabilidad, GRAVY, aromaticidad, estructura secundaria."])}
${quiz("¿Qué representa el asterisco (*) en una proteína traducida por Biopython?", ["Un aminoácido desconocido", "Un codón de parada", "Un error de lectura"], 1, "Los codones TAA, TAG y TGA se traducen como *. Con <code>to_stop=True</code> la traducción se detiene en el primero.")}
</div>`},

{id:29, cat:"Bioinformática", title:"Biopython II: leer y escribir FASTA y FASTQ", body:()=>`
<div class="theory">
<p>Las secuencias reales llegan en archivos. <code>Bio.SeqIO</code> lee y escribe decenas de formatos con la misma interfaz. Cada secuencia leída es un <code>SeqRecord</code>: la secuencia (<code>.seq</code>) más sus metadatos (<code>.id</code>, <code>.description</code>, calidades...).</p>
${codeBlock(`from Bio import SeqIO

registro = SeqIO.read("P04637.fasta", "fasta")       # read: el archivo tiene UNA secuencia
print("ID:", registro.id)
print("Descripción:", registro.description)
print("Longitud:", len(registro.seq))
print("Inicio:", registro.seq[:40])`)}
${codeBlock(`from Bio import SeqIO

for rec in SeqIO.parse("citocromo_c.fasta", "fasta"):   # parse: VARIAS secuencias (generador)
    print(f"{rec.id:12s} {len(rec.seq)} aa  {rec.description.split(' - ')[-1]}")

secuencias = {rec.id: rec.seq for rec in SeqIO.parse("citocromo_c.fasta", "fasta")}
print(secuencias.keys())`)}
<h3>Descargar un FASTA de UniProt y leerlo</h3>
${codeBlock(`from Bio import SeqIO

async def descargar_fasta(uniprot_id, ruta):
    """Descarga el FASTA de UniProt y lo guarda en ruta (versión web de download_fasta_file)."""
    r = await web.get(f"https://rest.uniprot.org/uniprotkb/{uniprot_id}.fasta")
    if r.status_code != 200:
        raise ValueError(f"Error al descargar el archivo FASTA: {uniprot_id} (HTTP {r.status_code})")
    with open(ruta, "w") as f:
        f.write(r.text)
    print(f"Archivo FASTA descargado y guardado en '{ruta}'.")

await descargar_fasta("P04637", "p53_sequence.fasta")          # requiere conexión
for record in SeqIO.parse("p53_sequence.fasta", "fasta"):
    print("ID de la secuencia:", record.id)
    print("Descripción:", record.description)
    print("Secuencia (primeros 60 aa):", record.seq[:60])
    print("Tamaño de la secuencia:", len(record.seq), "aminoácidos")`)}
${tip("Los scripts de clase descargan de <code>https://www.uniprot.org/uniprot/{id}.fasta</code>, la dirección antigua. Hoy se usa <code>https://rest.uniprot.org/uniprotkb/{id}.fasta</code> (módulo 32). Separar 'descargar' y 'leer' en dos pasos tiene una ventaja: el archivo queda guardado y no hace falta volver a pedirlo al servidor cada vez.")}
${warn("usar <code>SeqIO.read</code> con un archivo que tiene varias secuencias (o ninguna): lanza <code>ValueError</code>. Para varios registros, <code>SeqIO.parse</code>.")}
<h3>FASTQ: secuencias con calidad</h3>
<p>Un FASTQ guarda cada lectura con su calidad por base en escala Phred: Q = −10·log10(P_error). Q20 = 1 % de error; Q30 = 0,1 %. El archivo de ejemplo son lecturas de nanopore de un amplicón 18S.</p>
${codeBlock(`from Bio import SeqIO
import numpy as np

lecturas = list(SeqIO.parse("ejemplo.fastq", "fastq"))
print("Lecturas:", len(lecturas))
primera = lecturas[0]
calidades = primera.letter_annotations["phred_quality"]
print(primera.id[:20], "| longitud:", len(primera.seq), "| Q media:", round(np.mean(calidades), 1))

longitudes = [len(r.seq) for r in lecturas]
q_medias = [np.mean(r.letter_annotations["phred_quality"]) for r in lecturas]
print(f"Longitud media {np.mean(longitudes):.0f} pb, rango {min(longitudes)}-{max(longitudes)}")
print(f"Calidad media global Q{np.mean(q_medias):.1f}")`)}
${codeBlock(`from Bio import SeqIO

def calcular_calidad_promedio(calidades):
    return sum(calidades) / len(calidades)

def calcular_probabilidad_error_media(calidades):
    probabilidades = [10 ** (-q / 10) for q in calidades]
    return sum(probabilidades) / len(probabilidades)

for lectura in list(SeqIO.parse("ejemplo.fastq", "fastq"))[:6]:
    q = lectura.letter_annotations["phred_quality"]
    q_media = calcular_calidad_promedio(q)
    p_media = calcular_probabilidad_error_media(q)
    errores_esperados = sum(10 ** (-x / 10) for x in q)
    print(f"{lectura.id[:10]}  Q media {q_media:5.2f}  P(error) media {p_media:.3f}  "
          f"P(error) de la Q media {10 ** (-q_media / 10):.3f}  errores esperados {errores_esperados:5.1f}")`)}
${concepto("La media de las probabilidades no es la probabilidad de la media", "la escala Phred es logarítmica, así que unas pocas bases muy malas disparan la probabilidad de error media aunque la Q media parezca aceptable (compara las dos columnas). Por eso los filtros modernos (DADA2, VSEARCH) usan los <b>errores esperados</b> de cada lectura, la suma de las probabilidades, en vez de la Q media.")}
${codeBlock(`import matplotlib.pyplot as plt
fig, axs = plt.subplots(1, 2, figsize=(9, 3))
axs[0].hist(longitudes, bins=15, color="tab:blue", edgecolor="black"); axs[0].set_title("Longitud de lecturas")
axs[1].hist(q_medias, bins=15, color="tab:orange", edgecolor="black"); axs[1].set_title("Calidad media (Phred)")
plt.show()`)}
<h3>Control de calidad de una carrera (al estilo FastQC)</h3>
<p>Con 400 lecturas del mismo experimento (<code>ejemplo_qc.fastq</code>) ya puedes hacer lo que hace FastQC: calidad por posición, distribución de longitudes y errores esperados por lectura.</p>
${codeBlock(`import numpy as np
import matplotlib.pyplot as plt
from Bio import SeqIO

lecturas = list(SeqIO.parse("ejemplo_qc.fastq", "fastq"))
longitudes = np.array([len(r) for r in lecturas])
L = int(np.percentile(longitudes, 90))                       # posiciones a mostrar
matriz = np.full((len(lecturas), L), np.nan)
for i, r in enumerate(lecturas):
    q = r.letter_annotations["phred_quality"][:L]
    matriz[i, :len(q)] = q
errores = np.array([sum(10 ** (-q / 10) for q in r.letter_annotations["phred_quality"]) for r in lecturas])

media = np.nanmean(matriz, axis=0)
p10, p90 = np.nanpercentile(matriz, 10, axis=0), np.nanpercentile(matriz, 90, axis=0)
fig, axs = plt.subplots(1, 3, figsize=(13, 3.4))
axs[0].fill_between(range(L), p10, p90, alpha=0.3, label="percentiles 10-90")
axs[0].plot(media, label="media"); axs[0].axhline(20, ls="--", c="red", lw=1, label="Q20")
axs[0].set_title("Calidad por posición"); axs[0].set_xlabel("Posición (pb)"); axs[0].legend(fontsize=7)
axs[1].hist(longitudes, bins=30, edgecolor="black"); axs[1].set_title("Longitud de lecturas")
axs[2].hist(errores, bins=30, color="tab:red", edgecolor="black"); axs[2].set_title("Errores esperados por lectura")
plt.tight_layout(); plt.show()
print(f"{len(lecturas)} lecturas | longitud mediana {np.median(longitudes):.0f} pb | "
      f"{(errores <= 10).mean():.0%} con 10 errores esperados o menos")`)}
${note("Son lecturas de <b>nanopore</b>: largas y con calidades bajas (Q10-15) comparadas con Illumina (Q30+). Por eso la línea de Q20 queda por encima de la curva: no es un fallo del análisis, es la tecnología. Al interpretar un control de calidad, compara siempre con lo esperable para esa plataforma.")}
<h3>Crear, modificar y escribir registros</h3>
${codeBlock(`from Bio import SeqIO
from Bio.Seq import Seq
from Bio.SeqRecord import SeqRecord

nuevos = [
    SeqRecord(Seq("ATGGCCATTGTAATGGGCCGC"), id="seq1", description="ejemplo 1"),
    SeqRecord(Seq("ATGCGTACGTTAGC"), id="seq2", description="ejemplo 2"),
]
SeqIO.write(nuevos, "mis_secuencias.fasta", "fasta")
print(open("mis_secuencias.fasta").read())

# Filtrar lecturas de calidad y convertir FASTQ -> FASTA
buenas = (r for r in SeqIO.parse("ejemplo.fastq", "fastq")
          if sum(r.letter_annotations["phred_quality"]) / len(r) >= 10)
n = SeqIO.write(buenas, "filtradas.fasta", "fasta")
print(n, "lecturas con Q media ≥ 10 guardadas en filtradas.fasta")`)}
${codeBlock(`from Bio import SeqIO
from Bio.Seq import Seq
from Bio.SeqRecord import SeqRecord

secuencia = Seq("ATGCGCTAATCGCGAAAGCTTAGCGATCGGATCGTAGCTAGCTAGCTACG")
record = SeqRecord(secuencia, id="Secuencia_1", description="Esto es una secuencia de ADN")
with open("ejemplo2.fasta", "w") as output_handle:
    SeqIO.write(record, output_handle, "fasta")

with open("ejemplo2.fasta") as handle:
    for record in SeqIO.parse(handle, "fasta"):
        print("Encabezado:", record.id)
        print("Descripción:", record.description)
        print("Secuencia:", record.seq)`)}
${tip("<code>SeqIO.write</code> y <code>SeqIO.parse</code> aceptan tanto un nombre de archivo como un archivo ya abierto (<i>handle</i>). Con el nombre es más corto; con <code>with open(...)</code> controlas tú cuándo se abre y se cierra, que es útil si escribes varias cosas en el mismo archivo.")}
${staticCode(`import requests
from Bio import SeqIO

uniprot_id = "P04637"
r = requests.get(f"https://rest.uniprot.org/uniprotkb/{uniprot_id}.fasta")
if r.status_code == 200:
    with open(f"{uniprot_id}.fasta", "w") as f:
        f.write(r.text)
registro = SeqIO.read(f"{uniprot_id}.fasta", "fasta")`, "Descargar un FASTA de UniProt y leerlo (versión con requests)")}
${origen("BIOPYTHON_1.py, BIOPYTHON_2.py, BIOPYTHON7_1.py y BIOPYTHON7_2.py")}
${exercise("Control de calidad", "Recorre <code>ejemplo.fastq</code> y guarda en <code>ids_buenos</code> una lista con los <code>id</code> de las lecturas de longitud ≥ 150 y calidad media ≥ 12.",
`from Bio import SeqIO
ids_buenos = []
`,
`<p>Dentro del bucle sobre <code>SeqIO.parse</code>, calcula la media de <code>letter_annotations["phred_quality"]</code> y comprueba ambas condiciones con <code>and</code>.</p>`,
`from Bio import SeqIO
esperado = [r.id for r in SeqIO.parse("ejemplo.fastq", "fastq") if len(r) >= 150 and sum(r.letter_annotations["phred_quality"]) / len(r) >= 12]
assert ids_buenos == esperado, f"Esperaba {len(esperado)} lecturas y tienes {len(ids_buenos)}"`,
`for r in SeqIO.parse("ejemplo.fastq", "fastq"):
    q = r.letter_annotations["phred_quality"]
    if len(r) >= 150 and sum(q) / len(q) >= 12:
        ids_buenos.append(r.id)`)}
${resumen(["<code>SeqIO.read</code> (una secuencia) y <code>SeqIO.parse</code> (varias, como generador).", "<code>SeqRecord</code>: <code>.seq</code>, <code>.id</code>, <code>.description</code>, <code>.letter_annotations</code>.", "Calidad Phred: Q = −10·log10(P_error); Q30 ≈ 1 error cada 1000 bases.", "<code>SeqIO.write(registros, archivo, formato)</code> escribe y permite convertir formatos."])}
${quiz("Una base tiene calidad Q20. ¿Qué probabilidad de error tiene?", ["20 %", "1 %", "0,1 %"], 1, "Q = −10·log10(P) → P = 10^(−20/10) = 0,01 = 1 %.")}
</div>`},

{id:30, cat:"Bioinformática", title:"Alineamiento de secuencias", body:()=>`
<div class="theory">
<p>Alinear dos secuencias es colocarlas una sobre otra, introduciendo huecos (<i>gaps</i>), para maximizar las coincidencias. Es la base para inferir homología, función o relaciones evolutivas. El resultado depende del <b>sistema de puntuación</b>: cuánto suma una coincidencia y cuánto resta un fallo o un hueco.</p>
${codeBlock(`from Bio import Align
from Bio.Seq import Seq

aligner = Align.PairwiseAligner(mode="global", match_score=2, mismatch_score=-1, gap_score=-1)
alineamientos = aligner.align(Seq("AGCTAGCTAGCTA"), Seq("AGCTTAGCTAGCTA"))
print("Alineamientos óptimos:", len(alineamientos))
mejor = alineamientos[0]
print("Score:", mejor.score)
print(mejor)`)}
${codeBlock(`# Puede haber varios alineamientos igual de buenos: el script original los recorre todos
print("Alineamientos con la puntuación máxima:", len(alineamientos))
for alignment in sorted(alineamientos):
    print("Score = %.1f:" % alignment.score)
    print(alignment)`)}
${note("Con match = 2, mismatch = −1 y gap = −1, insertar el hueco en una posición u otra puede dar la misma puntuación: el algoritmo devuelve <i>todos</i> los óptimos. Por eso un alineamiento 'óptimo' no es único y conviene fijarse en el score, no en un dibujo concreto.")}
${concepto("Global vs local", "el alineamiento <b>global</b> (Needleman-Wunsch) alinea las secuencias de extremo a extremo: útil para secuencias de longitud parecida. El <b>local</b> (Smith-Waterman) busca la región más parecida: útil para encontrar un dominio dentro de una proteína más larga.")}
${codeBlock(`from Bio import Align
from Bio.Align import substitution_matrices

aligner = Align.PairwiseAligner()
aligner.mode = "local"
aligner.substitution_matrix = substitution_matrices.load("BLOSUM62")
aligner.open_gap_score = -10
aligner.extend_gap_score = -0.5

dominio = "KCSQCHTVEKGGKHKTGPNLHGLFGRKTGQAPGF"
proteina = "MGDVEKGKKIFIMKCSQCHTVEKGGKHKTGPNLHGLFGRKTGQAPGYSYTAANKNKGIIWGEDTLMEYLENPKKYIPGTKMIFVGIKKKEERADLIAYLKKATNE"
mejor = aligner.align(dominio, proteina)[0]
print("Score BLOSUM62:", mejor.score)
print(mejor)`)}
${tip("Para proteínas usa matrices de sustitución (BLOSUM62, PAM250): no es lo mismo cambiar una leucina por una isoleucina (parecidas) que por un aspartato. Y penaliza más abrir un hueco que extenderlo.")}
<h3>Comparar varias secuencias: identidad por pares</h3>
${codeBlock(`from Bio import SeqIO, Align
import numpy as np, pandas as pd

registros = list(SeqIO.parse("citocromo_c.fasta", "fasta"))
aligner = Align.PairwiseAligner(mode="global", match_score=1, mismatch_score=0, gap_score=0)

def identidad(a, b):
    return aligner.score(a, b) / max(len(a), len(b)) * 100

nombres = [r.id.replace("_cytc", "") for r in registros]
matriz = np.array([[identidad(a.seq, b.seq) for b in registros] for a in registros])
print(pd.DataFrame(matriz.round(1), index=nombres, columns=nombres))`)}
${codeBlock(`from Bio.Align import MultipleSeqAlignment
from Bio.SeqRecord import SeqRecord
from Bio.Seq import Seq

msa = MultipleSeqAlignment([
    SeqRecord(Seq("MSRQMMSRQM"), id="pro1"),
    SeqRecord(Seq("M-RQM-SRQM"), id="pro2"),
])
print(msa)
print("Columna 2:", msa[:, 1])`)}
<h3>De distancias a un árbol</h3>
<p>Con la identidad por pares puedes construir un <b>árbol de distancias</b> (distancia = 1 − identidad). <code>Bio.Phylo</code> lo calcula con UPGMA o Neighbor-Joining y lo dibuja.</p>
${codeBlock(`from Bio import SeqIO, Align, Phylo
from Bio.Phylo.TreeConstruction import DistanceMatrix, DistanceTreeConstructor
import matplotlib.pyplot as plt

alineador_id = Align.PairwiseAligner(mode="global", match_score=1, mismatch_score=0, gap_score=0)
def identidad_simple(a, b):
    return alineador_id.score(a, b) / max(len(a), len(b))

def arbol_de(registros, metodo="upgma"):
    nombres = [r.id for r in registros]
    matriz = [[1 - identidad_simple(registros[i].seq, registros[j].seq) if i != j else 0
               for j in range(i + 1)] for i in range(len(registros))]   # triangular inferior
    dm = DistanceMatrix(nombres, matriz)
    constructor = DistanceTreeConstructor()
    return constructor.upgma(dm) if metodo == "upgma" else constructor.nj(dm)

registros = list(SeqIO.parse("citocromo_c.fasta", "fasta"))
arbol = arbol_de(registros)
Phylo.draw_ascii(arbol)
fig, ax = plt.subplots(figsize=(6, 2.8))
Phylo.draw(arbol, axes=ax, do_show=False)
plt.show()`)}
${warn("los datos de ejemplo de clase no son reales. En <code>citocromo_c.fasta</code> las secuencias de levadura y de planta son <b>idénticas</b> letra a letra, y la del citocromo c real de levadura es muy distinta de la humana. Un árbol hecho con ellas sale 'bonito' pero no dice nada de biología. Lo mismo ocurre en el ejemplo de Clustal del script: 'human_HBB' y 'mouse_HBB' son la misma secuencia copiada. Antes de analizar, comprueba de dónde salen tus secuencias.")}
<h3>Con secuencias reales: hemoglobina e insulina de humano y ratón</h3>
<p>Descargamos de UniProt las proteínas reales que el script intentaba comparar. La pregunta biológica es interesante: ¿se agrupan por <b>especie</b> (humano con humano) o por <b>gen</b> (hemoglobina con hemoglobina)? <b>Requiere conexión.</b></p>
${codeBlock(`from io import StringIO
from Bio import SeqIO

ids = {"HBB_humana": "P68871", "HBB_raton": "P02088", "INS_humana": "P01308", "INS_raton": "P01325"}
reales = []
for nombre, acc in ids.items():
    texto = await obtener_texto(f"https://rest.uniprot.org/uniprotkb/{acc}.fasta")
    rec = SeqIO.read(StringIO(texto), "fasta")
    descripcion = rec.description.split(" OS=")[0].split(" ", 1)[1]
    rec.id, rec.description = nombre, descripcion
    reales.append(rec)
    print(f"{nombre:11s} {acc}  {len(rec.seq):4d} aa  {descripcion}")`)}
${codeBlock(`from Bio import Align, Phylo
from Bio.Align import substitution_matrices
import pandas as pd

alineador_prot = Align.PairwiseAligner(mode="global", open_gap_score=-10, extend_gap_score=-0.5)
alineador_prot.substitution_matrix = substitution_matrices.load("BLOSUM62")

def identidad_real(a, b):
    aln = alineador_prot.align(a, b)[0]
    iguales = sum(sum(x == y for x, y in zip(a[s1:e1], b[s2:e2]))
                  for (s1, e1), (s2, e2) in zip(*aln.aligned))
    return iguales / min(len(a), len(b)) * 100

nombres = [r.id for r in reales]
tabla = pd.DataFrame([[identidad_real(a.seq, b.seq) for b in reales] for a in reales], index=nombres, columns=nombres)
print(tabla.round(0))

identidad_simple = lambda a, b: identidad_real(a, b) / 100     # el árbol usará la identidad con BLOSUM62
Phylo.draw_ascii(arbol_de(reales))`)}
${concepto("Ortólogos", "HBB humana y HBB de ratón son <b>ortólogos</b>: el mismo gen en dos especies, separados por la especiación. Se parecen mucho más entre sí que la HBB humana con la insulina humana. Por eso el árbol agrupa por gen y no por especie, y es la base de cómo se infieren funciones por homología.")}
<h3>Alineamiento múltiple real con Clustal Omega (servicio web del EBI)</h3>
<p>El script de clase ejecutaba <code>clustalx.exe</code> desde Python, lo que solo funciona en el ordenador donde está instalado. El EBI ofrece Clustal Omega como API: envías las secuencias, esperas a que termine el trabajo y descargas el alineamiento (el mismo esquema asíncrono que el mapeo de IDs del módulo 33). Necesita un correo electrónico para identificar los trabajos.</p>
${codeBlock(`import asyncio
from io import StringIO
from Bio import AlignIO

EMAIL = "tu_correo@ejemplo.com"           # escribe aquí tu correo real
fasta = "".join(rec.format("fasta") for rec in reales)
base = "https://www.ebi.ac.uk/Tools/services/rest/clustalo"

if EMAIL.endswith("@ejemplo.com"):
    print("Escribe tu correo en EMAIL y vuelve a ejecutar la celda.")
else:
    r = await web.post(f"{base}/run", data={"email": EMAIL, "sequence": fasta, "stype": "protein", "outfmt": "clustal"})
    if r.status_code != 200:
        print("No se pudo lanzar el trabajo:", r.status_code, r.text[:200])
    else:
        trabajo = r.text.strip()
        print("Trabajo enviado:", trabajo)
        estado = "RUNNING"
        for _ in range(40):
            estado = (await web.get(f"{base}/status/{trabajo}")).text.strip()
            if estado not in ("RUNNING", "QUEUED"):
                break
            await asyncio.sleep(3)
        print("Estado final:", estado)
        if estado == "FINISHED":
            texto = (await web.get(f"{base}/result/{trabajo}/aln-clustal")).text
            alineamiento = AlignIO.read(StringIO(texto), "clustal")
            print(alineamiento)
            print(texto[:1200])`)}
${staticCode(`from Bio.Align.Applications import ClustalwCommandline   # obsoleto en Biopython moderno
from Bio import AlignIO
import subprocess

# Alineamiento múltiple con un programa externo (Clustal Omega / MAFFT / MUSCLE)
subprocess.run(["clustalo", "-i", "citocromo_c.fasta", "-o", "citocromo_c.aln", "--outfmt=clustal"])
alineamiento = AlignIO.read("citocromo_c.aln", "clustal")
print(alineamiento)`, "Alineamiento múltiple con un programa externo")}
${note("Los alineamientos múltiples reales los calculan programas externos (Clustal Omega, MAFFT, MUSCLE); Biopython los lee con <code>AlignIO</code>. Los scripts de clase usaban <code>ClustalwCommandline</code>, que en versiones recientes de Biopython está obsoleto: la alternativa actual es llamar al programa con <code>subprocess</code>.")}
${origen("BIOPYTHON_3.py y BIOPYTHON7_9_alinear.py")}
${exercise("¿Qué especie se parece más?", "Usando <code>registros</code> e <code>identidad()</code> de la celda anterior, guarda en <code>mas_parecida</code> el id de la secuencia (distinta de human_cytc) con mayor identidad respecto a <code>human_cytc</code>.",
`mas_parecida = None
`,
`<p>Toma el registro humano, recorre los demás calculando <code>identidad(humano.seq, r.seq)</code> y quédate con el máximo (por ejemplo con <code>max(..., key=...)</code>).</p>`,
`assert mas_parecida == "mouse_cytc", f"La más parecida es mouse_cytc; tienes {mas_parecida}"`,
`humano = registros[0]
otros = [r for r in registros if r.id != "human_cytc"]
mas_parecida = max(otros, key=lambda r: identidad(humano.seq, r.seq)).id`)}
${resumen(["<code>PairwiseAligner</code>: modo global o local, puntuaciones de match/mismatch/gap.", "Matrices de sustitución (BLOSUM62) para proteínas; huecos con penalización de apertura y extensión.", "<code>aligner.score()</code> es rápido cuando solo necesitas la puntuación.", "Alineamientos múltiples: programas externos + <code>AlignIO</code>."])}
${quiz("Buscas un dominio de 30 aminoácidos dentro de una proteína de 800. ¿Qué modo usarías?", ["Global", "Local", "Da igual"], 1, "El global forzaría a alinear las 800 posiciones; el local encuentra la región que mejor encaja.")}
</div>`},

{id:31, cat:"Bioinformática", title:"Estructuras 3D: PDB y mmCIF", body:()=>`
<div class="theory">
<p>Las estructuras tridimensionales de proteínas (cristalografía, crio-EM, RMN) se guardan en el <b>Protein Data Bank</b> en dos formatos: el clásico <b>PDB</b> (columnas de ancho fijo) y el moderno <b>mmCIF</b> (pares clave-valor, sin límites de tamaño). Biopython los lee en una jerarquía: <b>Estructura → Modelo → Cadena → Residuo → Átomo</b>.</p>
${codeBlock(`from Bio.PDB import PDBParser

parser = PDBParser(QUIET=True)
estructura = parser.get_structure("1TUP", "1TUP_cadenaB.pdb")   # p53 unida a ADN (solo cadena B)
print("Cabecera:", estructura.header["name"])
print("Método:", estructura.header["structure_method"], "| Resolución:", estructura.header["resolution"], "Å")

for modelo in estructura:
    for cadena in modelo:
        residuos = [r for r in cadena if r.id[0] == " "]      # solo aminoácidos estándar
        print(f"Cadena {cadena.id}: {len(residuos)} residuos, {len(list(cadena.get_atoms()))} átomos")
        primero = residuos[0]
        print("Primer residuo:", primero.get_resname(), primero.id[1])
        for atomo in list(primero)[:4]:
            print("   ", atomo.get_name(), atomo.coord.round(2))`)}
${codeBlock(`from Bio import PDB

def analizar_pdb(ruta):
    """Resumen de un archivo PDB: modelos, cadenas, tipo de cadena y heteromoléculas."""
    estructura = PDB.PDBParser(QUIET=True).get_structure("proteina", ruta)
    print(f"Archivo '{ruta}': {len(estructura)} modelo(s)")
    for modelo in estructura:
        print(f"Modelo {modelo.id}: {len(modelo)} cadenas")
        for cadena in modelo:
            estandar = [r for r in cadena if r.id[0] == " "]
            es_adn = bool(estandar) and estandar[0].get_resname().strip() in ("DA", "DT", "DG", "DC")
            otros = sorted({r.get_resname() for r in cadena if r.id[0] != " "})
            print(f"  Cadena {cadena.id}: {len(estandar):4d} residuos ({'ADN' if es_adn else 'proteína'})  otros: {otros}")
    return estructura

estructura = analizar_pdb("1TUP.pdb")            # el archivo completo: 3 cadenas de p53 + 2 de ADN

primer = next(iter(estructura[0]["A"]))         # primer residuo de la cadena A, como en el script
print(f"\\nPrimer residuo de A: {primer.get_resname()} {primer.get_id()} con {len(primer)} átomos")
for atomo in primer:
    print(f"   {atomo.get_name():4s} {atomo.get_coord().round(2)}")`)}
${tip("El script de clase usa tres <code>break</code> anidados para imprimir solo el primer modelo, la primera cadena y el primer residuo. Funciona, pero es fácil equivocarse con su sangría. <code>next(iter(...))</code> coge directamente el primer elemento, y un resumen por cadena suele ser más útil que volcar átomos.")}
${concepto("Residuos y heteroátomos", "<code>residuo.id</code> es una tupla <code>(hetero, número, inserción)</code>. Si el primer campo es un espacio es un aminoácido estándar; <code>'W'</code> es agua y <code>'H_ZN'</code> un ligando (aquí, zinc).")}
<h3>Distancias e interacciones</h3>
${codeBlock(`from Bio.PDB import PDBParser, is_aa
import numpy as np

estructura = PDBParser(QUIET=True).get_structure("p53", "1TUP_cadenaB.pdb")
cadena = estructura[0]["B"]

# Restar dos átomos devuelve su distancia en Å
ca = [r["CA"] for r in cadena if is_aa(r) and "CA" in r]
print("Distancia CA1-CA2:", round(ca[0] - ca[1], 2), "Å")

# El zinc de p53 y los residuos que lo coordinan
zinc = [r for r in cadena if r.get_resname() == "ZN"][0]["ZN"]
cercanos = [(r.get_resname(), r.id[1], round(a - zinc, 2))
            for r in cadena if is_aa(r) for a in r if a - zinc < 2.6]
print("Átomos a < 2.6 Å del zinc:", cercanos)`)}
${codeBlock(`from Bio.PDB import NeighborSearch, PDBParser, is_aa

cadena = PDBParser(QUIET=True).get_structure("p53", "1TUP_cadenaB.pdb")[0]["B"]
atomos_ca = [r["CA"] for r in cadena if is_aa(r) and "CA" in r]
ns = NeighborSearch(atomos_ca)
pares = ns.search_all(radius=4.0)                  # pares de CA a menos de 4 Å
pares_no_consecutivos = [(a.get_parent(), b.get_parent()) for a, b in pares
                         if abs(a.get_parent().id[1] - b.get_parent().id[1]) > 1]
print("Pares CA-CA < 4 Å:", len(pares), "| no consecutivos:", len(pares_no_consecutivos))`)}
${codeBlock(`from Bio import PDB
import numpy as np

def calculate_distance(atom1, atom2):
    return np.linalg.norm(atom1.coord - atom2.coord)

def interaction_probability(structure, threshold=4.0):
    """Versión del script de repaso: pares de Cα a menos de threshold Å dentro de cada cadena."""
    interactions, total_pairs = {}, 0
    for model in structure:
        for chain in model:
            residues = list(chain.get_residues())
            for i in range(len(residues)):
                for j in range(i + 1, len(residues)):
                    r1, r2 = residues[i], residues[j]
                    if not (PDB.is_aa(r1) and PDB.is_aa(r2)):
                        continue
                    try:
                        distance = calculate_distance(r1["CA"], r2["CA"])
                    except KeyError:
                        continue
                    total_pairs += 1
                    if distance < threshold:
                        interactions[(r1, r2)] = distance
    return interactions, total_pairs          # el original solo devolvía interactions

structure = PDB.PDBParser(QUIET=True).get_structure("protein", "1TUP.pdb")
interactions, total_pairs = interaction_probability(structure, threshold=3.7)
print(f"Pares de aminoácidos comparados: {total_pairs}")
print(f"Pares a menos de 3,7 Å: {len(interactions)}")
separaciones = [abs(a.id[1] - b.id[1]) for a, b in interactions]
print("Separación en la secuencia de esos pares:", sorted(set(separaciones)))
for (r1, r2), d in list(interactions.items())[:4]:
    print(f"  {r1.get_resname()} {r1.id[1]} - {r2.get_resname()} {r2.id[1]}: {d:.2f} Å")`)}
${warn("el script imprimía <code>len(interactions)</code> con el texto 'Número total de pares de aminoácidos', pero ese número son solo los pares <i>cercanos</i>; el total (<code>total_pairs</code>) se calculaba y nunca se usaba. Y hay un problema biológico: la distancia entre los Cα de dos residuos <b>consecutivos</b> ronda los 3,8 Å por la geometría del enlace peptídico. Con un umbral de 3,7 Å casi todo lo que aparece son vecinos de secuencia (separación 1) con un enlace algo más corto, no interacciones. Para contactos reales se usa un umbral de 6-8 Å entre Cα y se excluyen los residuos cercanos en la secuencia.")}
${codeBlock(`import pandas as pd
from Bio.PDB import NeighborSearch, is_aa

cadena = structure[0]["A"]
ca = [r["CA"] for r in cadena if is_aa(r) and "CA" in r]
contactos = [(a.get_parent(), b.get_parent()) for a, b in NeighborSearch(ca).search_all(8.0)
             if abs(a.get_parent().id[1] - b.get_parent().id[1]) >= 4]          # al menos 4 residuos de separación
print(f"Contactos Cα-Cα < 8 Å no locales en la cadena A: {len(contactos)}")
por_residuo = pd.Series([r.id[1] for par in contactos for r in par]).value_counts()
print("Residuos con más contactos (núcleo de la proteína):", por_residuo.head(6).to_dict())`)}
${tip("El script de clase comparaba todos los pares de residuos con dos bucles (n² comparaciones). <code>NeighborSearch</code> usa un árbol espacial (KD-tree) y es muchísimo más rápido en proteínas grandes: un buen ejemplo de la complejidad algorítmica del módulo 18.")}
<h3>mmCIF como diccionario</h3>
${codeBlock(`from Bio import PDB

parser = PDB.MMCIFParser(QUIET=True)
estructura_cif = parser.get_structure("proteina", "1TUP.cif")      # archivo mmCIF completo
print("Cadenas en el CIF:", [c.id for c in estructura_cif[0]])

cabecera = parser._mmcif_dict          # así lo hace el script de clase (atributo "privado")
for clave in ["_cell.length_a", "_cell.length_b", "_cell.length_c",
              "_cell.angle_alpha", "_cell.angle_beta", "_cell.angle_gamma", "_cell.Z_PDB"]:
    print(f"{clave:20s} {cabecera.get(clave, ['No disponible'])[0]}")`)}
${warn("<code>parser._mmcif_dict</code> empieza por guion bajo: es un detalle interno de Biopython, no parte de su API pública, y puede cambiar o desaparecer en una versión nueva sin aviso. La forma estable es <code>MMCIF2Dict</code>, que lee el mismo diccionario directamente del archivo.")}
${codeBlock(`from Bio.PDB.MMCIF2Dict import MMCIF2Dict

cif = MMCIF2Dict("1TUP.cif")
print("Número de claves:", len(cif))
print("Título:", cif["_struct.title"])
print("Autores:", cif["_audit_author.name"][:4])
print("Celda (a, b, c):", cif["_cell.length_a"], cif["_cell.length_b"], cif["_cell.length_c"])
print("Grupo espacial:", cif["_symmetry.space_group_name_H-M"])
print("Entidades:", cif["_entity.pdbx_description"])`)}
<h3>Heteromoléculas: ligandos, iones y agua</h3>
${codeBlock(`import pandas as pd
from Bio.PDB.MMCIF2Dict import MMCIF2Dict

heteromoleculas = []
for modelo in estructura_cif:
    for cadena in modelo:
        for residuo in cadena:
            if residuo.id[0] != " " and residuo.resname != "HOH":     # hetero, pero no agua
                heteromoleculas.append((cadena.id, residuo.resname, residuo.id[1]))
print("Heteromoléculas encontradas (sin agua):", heteromoleculas)

cif = MMCIF2Dict("1TUP.cif")
df_heteromoleculas = pd.DataFrame({"Nombre": cif.get("_pdbx_entity_nonpoly.name", []),
                                   "ID de tres letras": cif.get("_pdbx_entity_nonpoly.comp_id", [])})
print(df_heteromoleculas)
df_heteromoleculas.to_csv("heteromoleculas_1TUP.csv", index=False)
print(open("heteromoleculas_1TUP.csv").read())`)}
${note("Esta es la 'Actividad 2' del script: una tabla con nombre y código de 3 letras de cada molécula no polimérica. Con una lista de estructuras, la misma idea produce un archivo como <code>heteromoleculas.csv</code>, que en el Proyecto C (módulo 38) se convierte en un SDF con RDKit.")}
${staticCode(`import os, requests
from Bio.PDB import MMCIFParser, PDBList

def descargar(pdb_id, carpeta="estructuras"):
    os.makedirs(carpeta, exist_ok=True)
    for ext in ("pdb", "cif"):
        r = requests.get(f"https://files.rcsb.org/download/{pdb_id}.{ext}")
        if r.status_code == 200:
            with open(os.path.join(carpeta, f"{pdb_id}.{ext}"), "w") as f:
                f.write(r.text)

for pid in ["1TUP", "1A3N", "1MBO"]:
    descargar(pid)

estructura = MMCIFParser(QUIET=True).get_structure("1TUP", "estructuras/1TUP.cif")
# Alternativa integrada: PDBList().retrieve_pdb_file("1TUP", file_format="mmCif")`, "Descarga masiva de estructuras con requests")}
${origen("BIOPYTHON4_PARSEADORES.py, BIOPYTHON7_5_DICCIONARIOS.py, BIOPYTHON7_8_imp.py, Descargar_PDB_y_CIF.py y clase_8_repaso/Script5.py")}
${exercise("Composición de la cadena", "Con la cadena B de 1TUP, construye un diccionario <code>conteo</code> {nombre_residuo: número} solo con aminoácidos estándar, y guarda en <code>mas_frecuente</code> el residuo más abundante.",
`from Bio.PDB import PDBParser, is_aa
cadena = PDBParser(QUIET=True).get_structure("p53", "1TUP_cadenaB.pdb")[0]["B"]
conteo = {}
mas_frecuente = None
`,
`<p>Recorre los residuos filtrando con <code>is_aa(r, standard=True)</code> y usa <code>conteo.get(nombre, 0) + 1</code>. El máximo de un diccionario por valor: <code>max(conteo, key=conteo.get)</code>.</p>`,
`from Bio.PDB import is_aa
ref = {}
for r in cadena:
    if is_aa(r, standard=True):
        ref[r.get_resname()] = ref.get(r.get_resname(), 0) + 1
assert conteo == ref, "El conteo no coincide"
assert mas_frecuente == max(ref, key=ref.get), "mas_frecuente no es el residuo más abundante"`,
`for r in cadena:
    if is_aa(r, standard=True):
        conteo[r.get_resname()] = conteo.get(r.get_resname(), 0) + 1
mas_frecuente = max(conteo, key=conteo.get)
print(mas_frecuente, conteo[mas_frecuente])`)}
${resumen(["Jerarquía SMCRA: Structure → Model → Chain → Residue → Atom.", "<code>PDBParser</code> / <code>MMCIFParser</code> leen estructuras; <code>MMCIF2Dict</code> da acceso a todos los campos del CIF.", "<code>atomo1 - atomo2</code> = distancia en Å; <code>NeighborSearch</code> para búsquedas eficientes.", "<code>is_aa()</code> distingue aminoácidos de agua y ligandos."])}
${quiz("¿Por qué el formato mmCIF sustituyó al PDB clásico?", ["Porque es más fácil de leer a simple vista", "Porque el PDB tiene columnas de ancho fijo que limitan átomos, cadenas y metadatos", "Porque PDB no guarda coordenadas"], 1, "El formato PDB no admite más de 99.999 átomos ni identificadores de cadena largos: las grandes estructuras (ribosomas, virus) solo existen en mmCIF.")}
</div>`},

{id:32, cat:"Bioinformática", title:"APIs I: cómo funciona una API y UniProt", body:()=>`
<div class="theory">
<p>Casi todas las grandes bases de datos (UniProt, PDB, PubChem, NCBI, ChEMBL, cBioPortal) ofrecen una <b>API REST</b>: una URL a la que pides datos y que te responde, normalmente, en <b>JSON</b> (que en Python es un diccionario). Saber consultarlas te permite automatizar búsquedas que a mano llevarían horas, y es la forma de enriquecer tus propios datos con información pública.</p>
${concepto("Anatomía de una consulta", "1) construyes la URL (a menudo con un f-string), 2) haces la petición, 3) compruebas el <b>código de estado</b> (200 = OK, 404 = no existe...), 4) conviertes la respuesta con <code>.json()</code> y 5) navegas el diccionario con claves e índices.")}
${staticCode(`import requests

protein_id = "P04637"
url = f"https://rest.uniprot.org/uniprotkb/{protein_id}.json"
response = requests.get(url)
if response.status_code == 200:
    data = response.json()
    print(data["proteinDescription"]["recommendedName"]["fullName"]["value"])
else:
    print("Error", response.status_code)`, "Patrón básico con requests (en tu ordenador)")}
<p>En esta web no existe <code>requests</code> (el navegador solo hace peticiones asíncronas), pero tienes un sustituto casi idéntico: el objeto <code>web</code>. Cambia <code>requests.get(...)</code> por <code>await web.get(...)</code> y todo lo demás (<code>.status_code</code>, <code>.json()</code>, <code>.text</code>, <code>params=</code>) funciona igual. Para consultas rápidas que solo quieres en JSON hay un atajo: <code>await obtener_json(url)</code>, que además reintenta y te explica los errores. <b>Estas celdas necesitan conexión a internet.</b> Empieza por la celda de diagnóstico: te dice qué servicios responden desde tu navegador.</p>
${codeBlock(`await probar_apis()`, true, {label: "Diagnóstico de conexión"})}
${concepto("Si algún servicio falla", "<b>1)</b> Sin internet o un cortafuegos/VPN que bloquea el dominio. <b>2)</b> <b>CORS</b>: el navegador solo deja leer respuestas de servidores que lo permiten expresamente; si un servicio no lo hace, esa celda solo funcionará con <code>requests</code> en tu ordenador. <b>3)</b> El servicio está caído o limitando peticiones (código 429/503): espera un minuto. <b>4)</b> Abriste la web con doble clic (<code>file://</code>): sírvela con un servidor local, por ejemplo <code>python -m http.server</code> dentro de la carpeta y abre <code>http://localhost:8000</code>.")}
<h3>Los códigos de estado y los errores</h3>
<p>Antes de usar los datos hay que comprobar que la consulta salió bien. Una respuesta con error también es una respuesta: <code>web.get</code> no lanza excepción, te devuelve el código para que decidas qué hacer.</p>
${codeBlock(`message = {200: "OK: La solicitud se procesó correctamente",
           400: "Bad Request: Error en la sintaxis de la solicitud",
           404: "Not Found: El recurso solicitado no existe o ha sido movido",
           500: "Internal Server Error: Problema temporal en el servidor",
           503: "Service Unavailable: El servicio está en mantenimiento o no disponible"}

for protein_id in ["P05A00", "P99999999", "P04637"]:       # los dos primeros no existen
    response = await web.get(f"https://rest.uniprot.org/uniprotkb/{protein_id}.json")
    print(f"{protein_id:10s} -> {response.status_code}  {message.get(response.status_code, 'otro código')}")`)}
${warn("hacer <code>message[response.status_code]</code> con un código que no está en el diccionario da <code>KeyError</code>. Usa <code>message.get(codigo, 'desconocido')</code>. Y llama a <code>.json()</code> solo si el estado es 200: un error devuelve un mensaje, no la proteína.")}
${tip("<b>Rutas antiguas y nuevas:</b> en los scripts de clase aparece <code>https://www.uniprot.org/uniprot/{id}.json</code>. Es la dirección antigua de UniProt; hoy se usa <code>https://rest.uniprot.org/uniprotkb/{id}.json</code>. Cuando una API cambia de dirección, el código antiguo deja de funcionar o tarda más por las redirecciones.")}
<h3>La ficha de una proteína (p53, P04637)</h3>
${codeBlock(`protein_id = "P04637"
response = await web.get(f"https://rest.uniprot.org/uniprotkb/{protein_id}.json")
print(response.status_code, message.get(response.status_code))

if response.status_code == 200:
    data = response.json()
    desc = data["proteinDescription"]
    print("Nombre:", desc["recommendedName"]["fullName"]["value"])
    print("Nombres alternativos:")
    for name in desc.get("alternativeNames", []):
        print("  -", name["fullName"]["value"])
else:
    print("Error:", response.status_code)`)}
${codeBlock(`secuencia = data["sequence"]["value"]
print("Cantidad de aminoácidos:", len(secuencia), "| dato de la API:", data["sequence"]["length"])
print(secuencia[:60] + "...")

organismo = data["organism"]
print("Organismo:", organismo["scientificName"], "-", organismo.get("commonName", "(sin nombre común)"))

gen = data["genes"][0]
nombres_gen = [gen["geneName"]["value"]] + [sinonimo["value"] for sinonimo in gen.get("synonyms", [])]
print("Gen y sinónimos:", nombres_gen)`)}
${tip("Para saber qué claves tiene un JSON desconocido, imprime <code>data.keys()</code> y ve bajando nivel a nivel: <code>data['sequence'].keys()</code>... Usa <code>.get(clave, valor_por_defecto)</code> para los campos que pueden faltar.")}
${codeBlock(`import matplotlib.pyplot as plt

conteo = {aa: secuencia.count(aa) for aa in sorted(set(secuencia))}
plt.figure(figsize=(9, 3.2))
plt.bar(conteo.keys(), conteo.values(), edgecolor="black")
plt.xlabel("Aminoácidos"); plt.ylabel("Frecuencia")
plt.title("Frecuencia de aminoácidos en p53 (UniProt P04637)")
plt.show()`)}
<h3>Buscar proteínas: la ruta /search y sus parámetros</h3>
<p>Para buscar (en vez de pedir una proteína concreta) se usa <code>/uniprotkb/search</code> con <b>parámetros</b>: <code>query</code> (qué buscas), <code>format</code> (json, fasta, tsv...) y <code>size</code> (cuántos resultados, 25 por defecto). Con <code>params=</code> no tienes que construir la URL a mano ni escapar caracteres.</p>
${codeBlock(`url = "https://rest.uniprot.org/uniprotkb/search"
consultas = [
    ("zinc (ChEBI:29105)",                {"query": "chebi:29105", "format": "json"}),
    ("hierro (ChEBI:18248), size=120",    {"query": "chebi:18248", "format": "json", "size": 120}),
    ("ratón (10090) + calcio (29108)",    {"query": '(organism_id:10090) AND (chebi:"29108")', "format": "json", "size": 100}),
    ("humano con estructura 1TUP en PDB", {"query": "(organism_id:9606) AND database:pdb AND 1TUP", "format": "json"}),
]
for nombre, params in consultas:
    r = await web.get(url, params=params)
    if r.status_code == 200:
        print(f"{nombre:36s} {len(r.json()['results']):4d} proteínas")
    else:
        print(f"{nombre:36s} Error {r.status_code}")`)}
${concepto("Cuidado con el tamaño", "<code>len(data['results'])</code> cuenta solo los resultados <i>devueltos</i> (máximo <code>size</code>, tope 500), no todos los que existen: por eso 'zinc' da 25 y 'hierro' 120 sin que haya 25 o 120 proteínas con esos metales en toda UniProt. Para recorrer todos hay que paginar con el parámetro <code>cursor</code>.")}
<h3>De la búsqueda al detalle: encadenar consultas</h3>
<p>Una API suele usarse en dos pasos: una búsqueda devuelve identificadores y una segunda consulta pide el detalle de cada uno.</p>
${codeBlock(`url = "https://rest.uniprot.org/uniprotkb/search"
params = {"query": '(organism_id:10090) AND (chebi:"29108")', "format": "json", "size": 1}
r = await web.get(url, params=params)

if r.status_code == 200 and r.json()["results"]:
    acc = r.json()["results"][0]["primaryAccession"]
    detalle = await web.get(f"https://rest.uniprot.org/uniprotkb/{acc}.json")
    if detalle.status_code == 200:
        d = detalle.json()
        desc = d["proteinDescription"]
        nombre = (desc.get("recommendedName") or desc["submissionNames"][0])["fullName"]["value"]
        genes = [g["geneName"]["value"] for g in d.get("genes", []) if "geneName" in g]
        print("Nombre:", nombre)
        print("Organismo:", d["organism"]["scientificName"])
        print("Genes:", genes)
        print("Longitud de la secuencia:", d["sequence"]["length"], "aminoácidos")
        print("UniProt ID:", d["primaryAccession"])
    else:
        print("Error al obtener la proteína:", detalle.status_code)
else:
    print("No se encontraron proteínas de ratón asociadas con calcio")`)}
${warn("las entradas sin revisar de UniProt (TrEMBL) a veces no tienen <code>recommendedName</code> (usan <code>submissionNames</code>) ni <code>geneName</code>. El script original accedía directamente y fallaba con <code>KeyError</code> según qué proteína devolviera la búsqueda; por eso aquí se usan <code>.get()</code> y comprobaciones. Además, su mensaje final decía 'proteínas asociadas con oxidative stress' tras copiar y pegar de otra consulta: los mensajes de error también hay que revisarlos.")}
${origen("clase_5/UNIPROT API.py")}
${exercise("Ficha automática de proteínas", "Escribe una función asíncrona <code>ficha(acc)</code> que consulte UniProt y devuelva un diccionario con las claves <code>'gen'</code>, <code>'organismo'</code> y <code>'longitud'</code>. Luego construye <code>tabla</code>, un DataFrame con las fichas de P04637, P38398 y P00533. (Requiere conexión.)",
`import pandas as pd

async def ficha(acc):
    data = await obtener_json(f"https://rest.uniprot.org/uniprotkb/{acc}.json")
    return {}

tabla = None
`,
`<p>La función extrae <code>data["genes"][0]["geneName"]["value"]</code>, <code>data["organism"]["scientificName"]</code> y <code>data["sequence"]["length"]</code>. Al ser asíncrona, hay que llamarla con <code>await</code>, por ejemplo dentro de una comprensión: <code>[await ficha(a) for a in ids]</code>.</p>`,
`assert tabla is not None and len(tabla) == 3, "tabla debe tener 3 filas"
assert set(tabla["gen"]) == {"TP53", "BRCA1", "EGFR"}, f"Genes obtenidos: {list(tabla['gen'])}"`,
`async def ficha(acc):
    data = await obtener_json(f"https://rest.uniprot.org/uniprotkb/{acc}.json")
    return {"gen": data["genes"][0]["geneName"]["value"],
            "organismo": data["organism"]["scientificName"],
            "longitud": data["sequence"]["length"]}

tabla = pd.DataFrame([await ficha(a) for a in ["P04637", "P38398", "P00533"]])
print(tabla)`)}
${resumen(["API REST = URL + parámetros + petición + código de estado + JSON.", "<code>await web.get(url, params=...)</code> (como requests) o <code>await obtener_json(url)</code> (directo a diccionario).", "Comprueba siempre <code>status_code</code> (200 OK, 404 no existe, 429 demasiadas peticiones, 5xx fallo del servidor).", "Usa <code>.get()</code> para claves que pueden faltar.", "UniProt: <code>/uniprotkb/{id}.json</code> para una proteína y <code>/uniprotkb/search</code> con <code>query</code>, <code>format</code> y <code>size</code> para buscar."])}
${quiz("La API responde con código 404. ¿Qué significa?", ["El servidor está caído", "El recurso solicitado no existe (p. ej. un ID mal escrito)", "La petición fue correcta pero vacía"], 1, "4xx son errores de la petición (404 = no encontrado); 5xx son errores del servidor.")}
${quiz("Buscas con <code>size=120</code> y obtienes 120 resultados. ¿Significa que solo hay 120 proteínas que cumplen la búsqueda?", ["Sí", "No: solo has pedido 120; puede haber muchas más", "Sí, porque 120 es el máximo de UniProt"], 1, "<code>size</code> limita lo que se devuelve; para obtener todo hay que paginar.")}
</div>`},

{id:33, cat:"Bioinformática", title:"APIs II: RCSB PDB, descarga de estructuras y mapeo de IDs", body:()=>`
<div class="theory">
<p>El <b>Protein Data Bank</b> (RCSB) tiene dos APIs distintas: la de <b>datos</b> (<code>data.rcsb.org</code>), que te da la ficha de una entrada concreta, y la de <b>búsqueda</b> (<code>search.rcsb.org</code>), que recibe una consulta en JSON y devuelve identificadores. Además, los archivos de las estructuras se descargan de <code>files.rcsb.org</code>.</p>
<h3>Datos de una entrada y de un componente químico</h3>
${codeBlock(`import pandas as pd

filas = []
for pdb_id in ["1TUP", "1A3N", "2HHB"]:
    d = await obtener_json(f"https://data.rcsb.org/rest/v1/core/entry/{pdb_id}")
    info = d["rcsb_entry_info"]
    filas.append({"ID de PDB": pdb_id,
                  "título": d["struct"]["title"][:42],
                  "método": info["experimental_method"],
                  "peso (kDa)": info["molecular_weight"],
                  "resolución (Å)": (info.get("resolution_combined") or [None])[0]})
print(pd.DataFrame(filas).to_string(index=False))`)}
${codeBlock(`for comp_id in ["HOH", "ZN", "MG", "MN"]:        # agua y tres iones metálicos
    r = await web.get(f"https://data.rcsb.org/rest/v1/core/chemcomp/{comp_id}")
    if r.status_code == 200:
        c = r.json()["chem_comp"]
        print(f"{comp_id}: {c['name']:16s} fórmula {c['formula']:5s} peso {c['formula_weight']}")
    else:
        print(f"{comp_id}: Error {r.status_code}")`)}
<h3>Buscar estructuras: la API de búsqueda</h3>
<p>Aquí la petición es un <b>POST</b> con un JSON que describe la consulta: qué servicio usar (<code>sequence</code>, <code>full_text</code>, <code>structure</code>...), sus parámetros y qué tipo de resultado quieres (<code>entry</code>, <code>polymer_entity</code>, <code>assembly</code>).</p>
${codeBlock(`secuencia = ("MTEYKLVVVGAGGVGKSALTIQLIQNHFVDEYDPTIEDSYRKQVVIDGETCLLDILDTAGQEEYSAMRDQYMRTGEGFLCVFAINNTKSFEDIHQYREQIKRVKDSDDVPMVLVGNKCDLPARTVETRQAQDLARSYGIPYIETSAKTRQGVEDAFYTLVREIRQHKLRKLNPPDESGPGCMNCKCVIS")

consulta = {
    "query": {"type": "terminal", "service": "sequence",
              "parameters": {"evalue_cutoff": 1,          # umbral estadístico de significancia (E-value)
                             "identity_cutoff": 0.9,      # identidad mínima: 90 %
                             "sequence_type": "protein",
                             "value": secuencia}},
    "request_options": {"scoring_strategy": "sequence", "paginate": {"start": 0, "rows": 10}},
    "return_type": "polymer_entity",
}
r = await web.post("https://search.rcsb.org/rcsbsearch/v2/query", json=consulta)
print("Estado:", r.status_code)
if r.status_code == 200:
    res = r.json()
    print("Resultados totales:", res["total_count"])
    print([x["identifier"] for x in res["result_set"]])
else:
    print("Error", r.status_code, "al consultar la API de búsqueda del PDB")`)}
${note("La secuencia de este ejemplo (<code>MTEYKLVVVGAGGVGKS...</code>) es la de <b>KRAS</b>, no la de p53: los resultados serán estructuras de KRAS y proteínas muy parecidas. Un identificador como <code>4OBE_1</code> significa 'entrada 4OBE, entidad polimérica 1'.")}
${codeBlock(`# Búsqueda por texto: estructuras relacionadas con "p53" con evidencia experimental
consulta = {"query": {"type": "terminal", "service": "full_text", "parameters": {"value": "p53"}},
            "return_type": "entry",
            "request_options": {"results_content_type": ["experimental"], "paginate": {"start": 0, "rows": 25}}}
r = await web.post("https://search.rcsb.org/rcsbsearch/v2/query", json=consulta)
if r.status_code == 200:
    res = r.json()
    print("Entradas experimentales con 'p53':", res["total_count"])
    print([x["identifier"] for x in res["result_set"]])
else:
    print("Error", r.status_code)`)}
${codeBlock(`# Similitud estructural: ¿qué ensamblajes se parecen en forma al de 1TUP?
consulta = {"query": {"type": "terminal", "service": "structure",
                      "parameters": {"value": {"entry_id": "1TUP", "assembly_id": "1"},
                                     "operator": "strict_shape_match"}},      # coincidencia estricta de forma
            "return_type": "assembly",
            "request_options": {"paginate": {"start": 0, "rows": 10}}}
r = await web.post("https://search.rcsb.org/rcsbsearch/v2/query", json=consulta)
print("Estado:", r.status_code)
if r.status_code == 200:
    res = r.json()
    print("Ensamblajes similares:", res["total_count"])
    print([x["identifier"] for x in res["result_set"]])
elif r.status_code == 204:
    print("La consulta es correcta pero no hay resultados")`)}
${note("El código <code>204</code> significa 'todo bien, pero sin contenido': no hay JSON que leer y <code>.json()</code> daría error. Por eso se comprueba el estado antes. En el script original un comentario decía que el resultado '1TSR' era 'Trombina Humana': 1TSR es en realidad otra estructura del dominio central de p53 unido a ADN, justo lo esperable como similar a 1TUP. Comprueba siempre qué hay detrás de un identificador, p. ej. con <code>data.rcsb.org/rest/v1/core/entry/1TSR</code>.")}
${staticCode(`# La misma búsqueda con la librería oficial rcsb-search-api  (pip install rcsb-search-api)
from rcsbsearchapi.search import SequenceQuery, TextQuery, StructSimilarityQuery

resultados = SequenceQuery("MTEYKLVVVGAGGVGKSALTIQLIQNHFVDEYDPTIEDSYRKQVVIDGETCLLDILDTAGQEEYSAMRDQYMRTGEGFLCVFAINNTKSFEDIHQYREQIKRVKDSDDVPMVLVGNKCDLPARTVETRQAQDLARSYGIPYIETSAKTRQGVEDAFYTLVREIRQHKLRKLNPPDESGPGCMNCKCVIS",
                           evalue_cutoff=1, identity_cutoff=0.9, sequence_type="protein")
for polyid in resultados("polymer_entity"):
    print(polyid)

print(list(TextQuery("p53")(return_content_type=["experimental"]))[:50])

q = StructSimilarityQuery(entry_id="1TUP", structure_search_type="entry_id", assembly_id="1",
                          operator="strict_shape_match", target_search_space="assembly")
for id in q("assembly"):
    print(id)`, "Versión con la librería oficial (en tu ordenador)")}
<h3>Descargar estructuras (PDB y mmCIF)</h3>
<p>Los archivos se piden a <code>files.rcsb.org/download/{ID}.pdb</code> o <code>.cif</code>. En el navegador no hay tu disco duro, pero sí el <b>disco virtual</b> de esta web: guardamos ahí los archivos y los leemos con Biopython igual que lo harías en tu ordenador.</p>
${codeBlock(`import os
os.makedirs("estructuras", exist_ok=True)

async def descargar_estructura(pdb_id, formato="pdb", carpeta="estructuras"):
    """Descarga el archivo PDB (formato='pdb') o PDBx/mmCIF (formato='cif') y lo guarda en carpeta."""
    r = await web.get(f"https://files.rcsb.org/download/{pdb_id}.{formato}")
    if r.status_code != 200:
        raise ValueError(f"Error al descargar {pdb_id}.{formato}: HTTP {r.status_code}")
    ruta = os.path.join(carpeta, f"{pdb_id}.{formato}")
    with open(ruta, "w") as f:
        f.write(r.text)
    return ruta

for pdb_id in ["1TUP", "XXXX", "4OGQ"]:                 # "XXXX" no existe a propósito
    for formato in ("pdb", "cif"):
        try:
            ruta = await descargar_estructura(pdb_id, formato)
            print(f"✅ {ruta:22s} {os.path.getsize(ruta) // 1024:5d} KB")
        except ValueError as e:
            print("❌", e)`)}
${codeBlock(`from Bio.PDB import PDBParser

estructura = PDBParser(QUIET=True).get_structure("1TUP", "estructuras/1TUP.pdb")
print("Título:", estructura.header["name"])
print("Cadenas:", [c.id for c in estructura[0]])
print("Átomos:", len(list(estructura.get_atoms())))`)}
${warn("el script original recorría una lista de IDs de relleno (<code>2xyz</code>, <code>3def</code>, <code>5jkl</code>...) sin <code>try/except</code>: al primer ID inexistente lanzaba <code>ValueError</code> y el bucle se detenía, sin llegar a los demás. Con <code>try/except</code> por ID, un fallo no echa abajo todo el proceso. Además usaba rutas absolutas de Windows (<code>C:/Users/...</code>), que solo funcionan en un ordenador: usa carpetas relativas.")}
<h3>De una estructura a su proteína en UniProt (mapeo de IDs)</h3>
<p>El servicio <b>idmapping</b> de UniProt traduce identificadores entre bases de datos. Es una API <b>asíncrona</b> en dos tiempos: envías el trabajo (<code>/idmapping/run</code>), recibes un <code>jobId</code>, y preguntas periódicamente si ha terminado (<code>/idmapping/status/{jobId}</code>).</p>
${codeBlock(`import asyncio

async def uniprot_desde_pdb(pdb_id, espera=2, intentos=10):
    r = await web.post("https://rest.uniprot.org/idmapping/run",
                       data={"from": "PDB", "to": "UniProtKB", "ids": pdb_id})     # data= -> formulario
    if r.status_code != 200:
        print(f"No se pudo lanzar el mapeo de {pdb_id}: HTTP {r.status_code}")
        return None
    job_id = r.json()["jobId"]

    for _ in range(intentos):                          # esperar a que el trabajo termine
        estado = await web.get(f"https://rest.uniprot.org/idmapping/status/{job_id}")
        datos = estado.json() if estado.status_code == 200 else {}
        if datos.get("jobStatus") in ("NEW", "RUNNING"):
            await asyncio.sleep(espera)
            continue
        break
    if "results" not in datos:                         # si no vino ya, pedimos los resultados
        datos = (await web.get(f"https://rest.uniprot.org/idmapping/results/{job_id}")).json()

    resultados = datos.get("results", [])
    if not resultados:
        print(f"No se encontraron resultados para el PDB ID {pdb_id}.")
        return None
    destino = resultados[0]["to"]                      # un diccionario (entrada completa) o un texto
    return destino["primaryAccession"] if isinstance(destino, dict) else destino

for pdb_id in ["1TUP", "4OGQ"]:
    print(pdb_id, "->", await uniprot_desde_pdb(pdb_id))`)}
${warn("el script original pedía los resultados <b>inmediatamente</b> después de lanzar el trabajo, sin esperar a que terminara: a veces funciona (si el servidor es rápido) y a veces devuelve resultados vacíos. Con servicios asíncronos hay que <i>sondear el estado</i> hasta que acabe, con una pausa entre consultas (<code>sleep</code>) para no saturar al servidor.")}
${origen("clase_5/PDB API.py y Descargar_PDB_y_CIF.py")}
${exercise("Resolución de estructuras", "Escribe una función asíncrona <code>resolucion(pdb_id)</code> que devuelva la resolución (en Å, un número) de la entrada del PDB, usando <code>rcsb_entry_info.resolution_combined</code>. Después crea el diccionario <code>resoluciones</code> con las de <code>['1TUP', '1A3N']</code>. (Requiere conexión.)",
`async def resolucion(pdb_id):
    pass

resoluciones = {}
`,
`<p>La API de datos devuelve <code>d["rcsb_entry_info"]["resolution_combined"]</code>, una <i>lista</i> (puede haber varios valores): coge el primero. Para llenar el diccionario, un bucle con <code>await</code>.</p>`,
`assert set(resoluciones) == {"1TUP", "1A3N"}, f"Claves: {list(resoluciones)}"
assert all(isinstance(v, (int, float)) and 0.5 < v < 4 for v in resoluciones.values()), f"Resoluciones no válidas: {resoluciones}"`,
`async def resolucion(pdb_id):
    d = await obtener_json(f"https://data.rcsb.org/rest/v1/core/entry/{pdb_id}")
    return d["rcsb_entry_info"]["resolution_combined"][0]

resoluciones = {}
for pdb_id in ["1TUP", "1A3N"]:
    resoluciones[pdb_id] = await resolucion(pdb_id)
print(resoluciones)`)}
${resumen(["RCSB tiene API de datos (<code>data.rcsb.org</code>), de búsqueda (<code>search.rcsb.org</code>, POST con JSON) y de archivos (<code>files.rcsb.org</code>).", "La búsqueda se describe con <code>service</code> (sequence, full_text, structure), <code>parameters</code> y <code>return_type</code>; el código 204 significa 'sin resultados'.", "Descarga con <code>try/except</code> por ID y rutas relativas.", "<code>idmapping</code> de UniProt es asíncrono: lanzar el trabajo, sondear el estado y leer los resultados."])}
${quiz("La API de búsqueda del PDB responde con código 204. ¿Qué debes hacer?", ["Llamar a .json() igualmente", "Interpretarlo como 'consulta correcta sin resultados' y no leer JSON", "Reintentar indefinidamente"], 1, "204 = sin contenido: la petición es válida pero no hay nada que devolver.")}
</div>`},

{id:34, cat:"Bioinformática", title:"APIs III: PubChem, ChEMBL y ChEBI (química)", body:()=>`
<div class="theory">
<p>Para compuestos químicos y fármacos hay tres bases de referencia: <b>PubChem</b> (millones de compuestos y sustancias), <b>ChEMBL</b> (bioactividad de moléculas y fármacos) y <b>ChEBI</b> (entidades químicas de interés biológico). Cada una usa sus propios identificadores: <b>CID</b> (compuesto) y <b>SID</b> (sustancia) en PubChem, <b>CHEMBLxxx</b> en ChEMBL y <b>CHEBI:xxxx</b> en ChEBI.</p>
${note("En los scripts de clase se usan las librerías <code>pubchempy</code> y <code>chembl_webresource_client</code>. Funcionan en tu ordenador, pero en el navegador no pueden hacer peticiones de red, así que aquí accedes a <b>las mismas APIs directamente</b> con <code>obtener_json</code>/<code>web.get</code>. Es útil porque ves qué hace la librería por dentro. Las versiones con las librerías están al final de cada bloque para ejecutarlas en tu ordenador.")}
<h3>PubChem: compuestos, sustancias y búsquedas</h3>
<p>La dirección tiene la forma <code>.../pug/&lt;dominio&gt;/&lt;qué buscas&gt;/&lt;valor&gt;/&lt;qué quieres&gt;/&lt;formato&gt;</code>, por ejemplo <code>compound/cid/2519/property/MolecularFormula/JSON</code>. Con un f-string cambias el valor y listo.</p>
${codeBlock(`import urllib.parse, asyncio
import pandas as pd

PUG = "https://pubchem.ncbi.nlm.nih.gov/rest/pug"

async def compuesto(cid):
    """Datos básicos de un compuesto por su CID (equivale a pcp.Compound.from_cid(cid).to_dict())."""
    campos = "CanonicalSMILES,Charge,ExactMass,InChI,InChIKey,IUPACName"
    try:
        d = await obtener_json(f"{PUG}/compound/cid/{cid}/property/{campos}/JSON")
    except ConnectionError:                                  # PubChem renombró algunos campos de SMILES
        d = await obtener_json(f"{PUG}/compound/cid/{cid}/property/ConnectivitySMILES,Charge,ExactMass,InChI,InChIKey,IUPACName/JSON")
    return d["PropertyTable"]["Properties"][0]

def mostrar(c):
    print("Smiles    ", c.get("CanonicalSMILES") or c.get("ConnectivitySMILES") or c.get("SMILES"))
    print("Charge    ", c.get("Charge"))
    print("Exact_mass", c.get("ExactMass"))
    print("Inchi     ", c.get("InChI"))
    print("InchiKey  ", c.get("InChIKey"))
    print("Iupac Name", c.get("IUPACName"))

cafeina = await compuesto(2519)             # CID de la cafeína
mostrar(cafeina)`)}
${codeBlock(`# Sustancias: un SID es un registro enviado por un proveedor; sus sinónimos son los nombres que usa
d = await obtener_json(f"{PUG}/substance/sid/223766453/synonyms/JSON")
sinonimos = d["InformationList"]["Information"][0]["Synonym"]
print(len(sinonimos), "sinónimos. Los 10 primeros:")
print(sinonimos[:10])`)}
<h3>Buscar por SMILES, por nombre y por fórmula</h3>
${codeBlock(`fenol = "c1ccccc1O"
smiles_url = urllib.parse.quote(fenol, safe="")             # ¡siempre escapar el SMILES en la URL!
d = await obtener_json(f"{PUG}/compound/smiles/{smiles_url}/cids/JSON")
cids = d["IdentifierList"]["CID"]
print("CIDs del fenol:", cids)
mostrar(await compuesto(cids[0]))`)}
${warn("meter un SMILES directamente en la URL. Caracteres habituales en SMILES como <code>#</code> (triple enlace), <code>/</code> y <code>\\</code> (estereoquímica) o <code>+</code> (carga) tienen significado propio en una URL y la rompen. <code>urllib.parse.quote(smiles, safe='')</code> los escapa. En el script original funcionaba con el fenol solo porque su SMILES no tiene ninguno.")}
${codeBlock(`# Buscar sustancias por nombre y obtener los compuestos asociados
d = await obtener_json(f"{PUG}/substance/name/glucose/cids/JSON")
info = next(i for i in d["InformationList"]["Information"] if i.get("CID"))
print("Primera sustancia (SID):", info["SID"], "-> compuesto (CID):", info["CID"][0])
mostrar(await compuesto(info["CID"][0]))`)}
${note("En el script original la variable que guardaba el resultado se llamaba <code>substance_id</code> pero contenía un <b>CID</b> (un compuesto), no un SID. Mezclar los dos identificadores es un error muy típico: un SID identifica el registro de un proveedor; un CID, la estructura química única.")}
${codeBlock(`# Fórmula molecular. Algunas búsquedas son asíncronas: PubChem responde "Waiting" y hay que volver a preguntar
async def resolver_listkey(resp, campo="cids"):
    for _ in range(6):
        if "Waiting" not in resp:
            return resp
        await asyncio.sleep(2)
        resp = await obtener_json(f"{PUG}/compound/listkey/{resp['Waiting']['ListKey']}/{campo}/JSON")
    return resp

resp = await obtener_json(f"{PUG}/compound/fastformula/C20H41Br/cids/JSON")
resp = await resolver_listkey(resp)
cids_formula = resp.get("IdentifierList", {}).get("CID", [])
print(len(cids_formula), "compuestos con fórmula C20H41Br:", cids_formula[:10])`)}
${codeBlock(`# Compuestos parecidos al ibuprofeno (similitud de Tanimoto >= 85 %)
ibuprofeno = "CC(C)CC1=CC=C(C=C1)C(C)C(=O)O"
url = f"{PUG}/compound/fastsimilarity_2d/smiles/{urllib.parse.quote(ibuprofeno, safe='')}/cids/JSON?Threshold=85&MaxRecords=5"
resp = await resolver_listkey(await obtener_json(url))
similares = resp.get("IdentifierList", {}).get("CID", [])
print("Compuestos similares:", similares)

# Guardar los resultados en un DataFrame
ids = ",".join(str(c) for c in similares)
d = await obtener_json(f"{PUG}/compound/cid/{ids}/property/MolecularFormula,MolecularWeight,IUPACName/JSON")
tabla = pd.DataFrame(d["PropertyTable"]["Properties"])
print(tabla[["CID", "MolecularFormula", "MolecularWeight"]].to_string(index=False))`)}
<h3>Más consultas por atributos: la respuesta completa</h3>
${codeBlock(`d = await obtener_json(f"{PUG}/compound/cid/2519/JSON")           # sin /property/: toda la información
comp = d["PC_Compounds"][0]
print("Claves del compuesto:", list(comp.keys()))
print("Nº de propiedades calculadas:", len(comp["props"]))
print("Primera:", comp["props"][0])`)}
${codeBlock(`# Buscar un elemento por nombre y extraer solo lo que interesa del JSON
elemento = "iron"
datos = await obtener_json(f"{PUG}/compound/name/{elemento}/JSON")
comp = datos["PC_Compounds"][0]
print("CID:", comp["id"]["id"]["cid"])
for propiedad in comp["props"]:
    etiqueta = propiedad["urn"]["label"]
    valor = propiedad["value"].get("sval")
    if etiqueta in ("InChIKey", "InChI", "Molecular Weight"):
        print(f"{etiqueta}: {valor}")`)}
${tip("Cada propiedad lleva una <code>urn</code> con <code>label</code> (el nombre) y <code>name</code> (el método). Por eso hay varios 'SMILES' o 'Molecular Weight' distintos; para quedarte con uno concreto filtra por <code>label</code> y, si hace falta, también por <code>name</code> (p. ej. 'Canonical' o 'Isomeric').")}
${staticCode(`import pubchempy as pcp       # pip install pubchempy

compound = pcp.Compound.from_cid(2519).to_dict()
print(compound["canonical_smiles"], compound["charge"], compound["exact_mass"], compound["inchikey"], compound["iupac_name"])

substance = pcp.Substance.from_sid(223766453).to_dict()
print(substance["synonyms"])

cids_fenol = pcp.get_cids("c1ccccc1O", "smiles", "compound")
cids_glucosa = pcp.get_cids("glucose", "name", "substance", list_return="flat")
por_formula = pcp.get_cids("C20H41Br", "formula")

similares = pcp.get_cids("CC(C)CC1=CC=C(C=C1)C(C)C(=O)O", "smiles", "compound",
                         searchtype="similarity", list_return="flat", listkey_count=3, listkey_start=6)
df = pcp.get_compounds("C20H41Br", "formula", as_dataframe=True)`, "PubChem con la librería pubchempy (en tu ordenador)")}
${origen("clase_5/PubChem API.py y PubChem_busquedas_por_atributos.py")}
<h3>ChEMBL: moléculas, dianas y fármacos</h3>
<p>La API de ChEMBL usa filtros con la sintaxis de Django: <code>campo__operador=valor</code> (<code>iexact</code> = igual sin distinguir mayúsculas, <code>icontains</code> = contiene, <code>in</code> = está en una lista, <code>lte</code> = menor o igual). Las respuestas incluyen una lista (<code>molecules</code>, <code>targets</code>...) y un bloque <code>page_meta</code> con el total.</p>
${codeBlock(`CHEMBL = "https://www.ebi.ac.uk/chembl/api/data"

d = await obtener_json(f"{CHEMBL}/molecule.json?pref_name__iexact=caffeine")
for m in d["molecules"]:
    print(m["molecule_chembl_id"], m["pref_name"], "| peso:", m["molecule_properties"]["full_mwt"])

# Varias moléculas a la vez
d = await obtener_json(f"{CHEMBL}/molecule.json?molecule_chembl_id__in=CHEMBL113,CHEMBL25,CHEMBL192")
for m in d["molecules"]:
    print(m["molecule_chembl_id"], m["pref_name"])`)}
${warn("en el script original se dibuja <code>CHEMBL113</code> con la etiqueta 'Aspirina', pero CHEMBL113 es la <b>cafeína</b> (la aspirina es CHEMBL25, como acabas de ver en la salida). Antes de fiarte de un identificador, mira qué nombre devuelve la propia base de datos.")}
${codeBlock(`# Dibujar una molécula en SVG (ChEMBL la genera en el servidor)
r = await web.get(f"{CHEMBL}/image/CHEMBL25.svg", headers={"Accept": "image/svg+xml"})
print("Aspirina (CHEMBL25) - estado", r.status_code)
if r.status_code == 200:
    mostrar_svg(r.text)`)}
${codeBlock(`# Buscar información sobre un gen: dianas (targets) cuyo sinónimo contiene BRCA1
d = await obtener_json(f"{CHEMBL}/target.json?target_synonym__icontains=BRCA1&limit=10")
print("Dianas encontradas:", d["page_meta"]["total_count"])
for t in d["targets"][:6]:
    print(f"{t['target_chembl_id']:12s} {t['organism']:22s} {t['target_type']:16s} {t['pref_name']}")`)}
${codeBlock(`# Filtrar moléculas por peso molecular (< 100 Da)
d = await obtener_json(f"{CHEMBL}/molecule.json?molecule_properties__mw_freebase__lte=100&limit=5")
print("Moléculas con peso <= 100:", d["page_meta"]["total_count"])
for m in d["molecules"]:
    sinonimos = m.get("molecule_synonyms") or []
    estructuras = m.get("molecule_structures") or {}
    nombre = sinonimos[0]["molecule_synonym"] if sinonimos else m.get("pref_name")
    print(m["molecule_chembl_id"], "|", nombre, "|", estructuras.get("canonical_smiles"))`)}
${codeBlock(`# Moléculas similares a la cafeína (>= 80 % de similitud)
smiles = "Cn1c(=O)c2c(ncn2C)n(C)c1=O"
d = await obtener_json(f"{CHEMBL}/similarity/{urllib.parse.quote(smiles, safe='')}/80.json?limit=6")
for m in d["molecules"]:
    print(m["molecule_chembl_id"], m["pref_name"], "| similitud:", round(float(m["similarity"]), 1), "%")`)}
${codeBlock(`# Fármacos aprobados para una indicación: primero las indicaciones, luego las moléculas
d = await obtener_json(f"{CHEMBL}/drug_indication.json?efo_term__icontains=glioblastoma&limit=50")
ids = sorted({x["molecule_chembl_id"] for x in d["drug_indications"]})
print("Moléculas con indicación para glioblastoma:", len(ids))

d = await obtener_json(f"{CHEMBL}/molecule.json?molecule_chembl_id__in={','.join(ids[:10])}")
for m in d["molecules"]:
    print(m["molecule_chembl_id"], m["pref_name"])`)}
${note("El script original consultaba <code>efo_term__icontains='TOURETTE'</code> (síndrome de Tourette) con el comentario y el nombre de variable <code>glioblastoma</code>: la consulta y su descripción no coincidían. Si el código dice una cosa y el comentario otra, uno de los dos está mal; corrígelo antes de que alguien (tú dentro de un mes) se fíe del comentario.")}
${staticCode(`# pip install chembl_webresource_client
from chembl_webresource_client.new_client import new_client
from IPython.display import SVG, display

molecule = new_client.molecule
print(list(molecule.filter(pref_name__iexact="caffeine")))
print(list(molecule.filter(molecule_synonyms__molecule_synonym__iexact="caffeine").only("molecule_chembl_id")))
print(list(molecule.filter(molecule_chembl_id__in=["CHEMBL113", "CHEMBL25", "CHEMBL192"]).only(["molecule_chembl_id", "pref_name"])))

image = new_client.image
image.set_format("svg")
display(SVG(image.get("CHEMBL25")))                      # aspirina

print(list(new_client.target.filter(target_synonym__icontains="BRCA1").only(["organism", "pref_name", "target_type"])))
ligeras = molecule.filter(molecule_properties__mw_freebase__lte=100)
print(f"Total de {len(ligeras)} moléculas")
for i in new_client.similarity.filter(smiles="Cn1c(=O)c2c(ncn2C)n(C)c1=O", similarity=80).only(["molecule_chembl_id", "pref_name", "similarity"]):
    print(i)

indicaciones = new_client.drug_indication.filter(efo_term__icontains="GLIOBLASTOMA")
mols = molecule.filter(molecule_chembl_id__in=[x["molecule_chembl_id"] for x in indicaciones]).only(["molecule_chembl_id", "pref_name"])
for m in mols[:10]:
    print(m["molecule_chembl_id"], m["pref_name"])`, "ChEMBL con su cliente de Python (en tu ordenador)")}
${origen("clase_5/Chembl API.py")}
<h3>ChEBI: entidades químicas de interés biológico</h3>
${staticCode(`# pip install libchebipy
import libchebipy

chebi_entity = libchebipy.ChebiEntity("CHEBI:17234")      # glucosa

print("ID de ChEBI:", chebi_entity.get_id())
print("Nombre:", chebi_entity.get_name())
for nombre in chebi_entity.get_names():                    # nombres alternativos
    print("  -", nombre)
print("Definición:", chebi_entity.get_definition())
print("Fuente:", chebi_entity.get_source())
print("Creador:", chebi_entity.get_created_by(), "| modificado:", chebi_entity.get_modified_on())
print("¿Marca de 3 estrellas?", "sí" if chebi_entity.get_star() else "no")   # entradas revisadas manualmente
print("Fórmula:", chebi_entity.get_formula())
print("Carga:", chebi_entity.get_charge())
print("Masa:", chebi_entity.get_mass())
print("SMILES:", chebi_entity.get_smiles())`, "ChEBI con libchebipy (en tu ordenador)")}
${note("<code>libchebipy</code> descarga los archivos completos de ChEBI y no se actualiza desde hace tiempo; si falla o da datos raros, consulta los servicios web de ChEBI en <code>ebi.ac.uk/chebi</code>. Otro detalle: el script original usaba <code>CHEBI:17597</code> con el comentario 'glucosa'; el ID de la glucosa en ChEBI es <b>CHEBI:17234</b>, y lo primero que hay que hacer es comprobar que <code>get_name()</code> devuelve lo que esperas.")}
${origen("clase_5/CheBI API.py")}
${exercise("Ficha química en PubChem", "Escribe la función asíncrona <code>ficha_pubchem(nombre)</code> que busque un compuesto por nombre y devuelva un diccionario con <code>'cid'</code> (número), <code>'formula'</code> (texto) y <code>'peso'</code> (número decimal). Usa <code>/compound/name/{nombre}/property/MolecularFormula,MolecularWeight/JSON</code>. (Requiere conexión.)",
`import urllib.parse

async def ficha_pubchem(nombre):
    url = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/" + urllib.parse.quote(nombre) + "/property/MolecularFormula,MolecularWeight/JSON"
    return {}
`,
`<p>El resultado está en <code>d["PropertyTable"]["Properties"][0]</code> con las claves <code>CID</code>, <code>MolecularFormula</code> y <code>MolecularWeight</code>. Ojo: PubChem devuelve el peso como <i>texto</i> ("180.16"); conviértelo con <code>float()</code>.</p>`,
`r = await ficha_pubchem("aspirin")
assert r.get("cid") == 2244, f"El CID de la aspirina es 2244; tienes {r.get('cid')}"
assert r.get("formula") == "C9H8O4", f"Fórmula incorrecta: {r.get('formula')}"
assert isinstance(r.get("peso"), float) and abs(r["peso"] - 180.16) < 0.2, f"Peso incorrecto: {r.get('peso')}"`,
`async def ficha_pubchem(nombre):
    url = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/" + urllib.parse.quote(nombre) + "/property/MolecularFormula,MolecularWeight/JSON"
    d = await obtener_json(url)
    p = d["PropertyTable"]["Properties"][0]
    return {"cid": p["CID"], "formula": p["MolecularFormula"], "peso": float(p["MolecularWeight"])}

print(await ficha_pubchem("aspirin"))`)}
${resumen(["PubChem: <code>CID</code> = compuesto, <code>SID</code> = sustancia; la URL se compone con <code>/compound|substance/&lt;por qué&gt;/&lt;valor&gt;/&lt;qué quieres&gt;/JSON</code>.", "Escapa siempre los SMILES con <code>urllib.parse.quote(smiles, safe='')</code>.", "Algunas búsquedas son asíncronas (<code>Waiting</code> + <code>ListKey</code>): vuelve a preguntar.", "ChEMBL: filtros <code>campo__iexact / icontains / in / lte</code>, resultados en <code>molecules</code>, <code>targets</code>... y <code>page_meta.total_count</code>.", "ChEBI: <code>CHEBI:xxxx</code> con la librería libchebipy.", "Verifica que el identificador devuelve el nombre que esperas."])}
${quiz("¿Qué diferencia hay entre un CID y un SID de PubChem?", ["Ninguna, son sinónimos", "El CID identifica una estructura química única; el SID, un registro de un proveedor", "El CID es para sustancias y el SID para compuestos"], 1, "Muchos SID (de distintos proveedores) pueden apuntar al mismo CID.")}
${quiz("Quieres buscar con el SMILES <code>CC#N</code> (acetonitrilo) en una URL. ¿Qué problema hay?", ["Ninguno", "El carácter # significa 'fragmento' en una URL y corta la dirección: hay que escaparlo", "Los SMILES no se pueden usar en URLs"], 1, "Lo que va detrás de # no llega al servidor. Con <code>quote(smiles, safe='')</code> se convierte en %23.")}
</div>`},

{id:35, cat:"Bioinformática", title:"APIs IV: NCBI Entrez y cBioPortal", body:()=>`
<div class="theory">
<p>Dos APIs más con usos muy distintos: <b>NCBI Entrez (E-utilities)</b> para buscar genes, secuencias y bibliografía (PubMed), y <b>cBioPortal</b> para datos clínicos y genómicos de estudios de cáncer. La mecánica es la misma que en los módulos anteriores: URL con parámetros, comprobar el estado, leer el JSON.</p>
<h3>NCBI Entrez: genes y bibliografía</h3>
${codeBlock(`eutils = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
busqueda = await obtener_json(f"{eutils}/esearch.fcgi?db=pubmed&term=TP53+AND+CRISPR&retmax=5&retmode=json")
ids = busqueda["esearchresult"]["idlist"]
print("Artículos encontrados:", busqueda["esearchresult"]["count"])

resumen = await obtener_json(f"{eutils}/esummary.fcgi?db=pubmed&id={','.join(ids)}&retmode=json")
for pmid in ids:
    art = resumen["result"][pmid]
    print(f"[{art['pubdate'][:4]}] {art['title'][:90]}")`)}
${staticCode(`from Bio import Entrez
Entrez.email = "tu_correo@ejemplo.com"     # NCBI exige identificarse

h = Entrez.esearch(db="gene", term="BRCA1[Gene] AND Homo sapiens[Organism]")
print(Entrez.read(h)["IdList"])

h = Entrez.efetch(db="nucleotide", id="NM_000546", rettype="fasta", retmode="text")
print(h.read()[:200])

h = Entrez.esearch(db="clinvar", term="TP53[gene] AND pathogenic[clinsig]", retmax=10)
print(Entrez.read(h)["Count"])`, "Bio.Entrez (Biopython) — en tu ordenador")}
<h3>cBioPortal: datos clínicos de cáncer</h3>
${codeBlock(`import pandas as pd
import matplotlib.pyplot as plt

base = "https://www.cbioportal.org/api"
estudio = await obtener_json(f"{base}/studies/brca_tcga")
print(estudio["name"], "-", estudio["cancerType"]["name"])

datos = await obtener_json(f"{base}/studies/brca_tcga/clinical-data?clinicalDataType=SAMPLE&attributeId=TMB_NONSYNONYMOUS")
if not datos:
    raise ValueError("cBioPortal no devolvió datos para este estudio/atributo")
df = pd.DataFrame(datos)
df["value"] = pd.to_numeric(df["value"], errors="coerce")
df = df.dropna(subset=["value"])
print(len(df), "muestras | mediana TMB:", round(df["value"].median(), 2), "mut/Mb")

plt.figure(figsize=(7, 3))
plt.hist(df["value"].clip(upper=20), bins=60, color="skyblue", edgecolor="black")
plt.title("Carga mutacional tumoral (TMB) en cáncer de mama TCGA")
plt.xlabel("Mutaciones no sinónimas por Mb (recortado a 20)"); plt.ylabel("Muestras")
plt.show()`)}
<h3>cBioPortal paso a paso: estudio, muestras y datos clínicos</h3>
${codeBlock(`import pandas as pd

BASE_URL = "https://www.cbioportal.org"

async def get_study(study_id):
    response = await web.get(f"{BASE_URL}/api/studies/{study_id}")
    if response.status_code == 200:
        print("✅ Conexión exitosa con cBioPortal")
        return response.json()
    print(f"❌ Error {response.status_code}: no se pudo obtener el estudio {study_id}")
    return None

study = await get_study("brca_tcga")
if study:
    print(f"Descripción: {study.get('description', '')[:160]}...")
    print(f"Tipo: {study.get('cancerTypeId')}")
    print(f"Nombre: {study.get('cancerType', {}).get('name')}")
    print(f"Muestras: {study.get('allSampleCount')}")

samples = (await web.get(f"{BASE_URL}/api/studies/brca_tcga/samples")).json()
print(len(samples), "muestras. Ejemplo:", samples[0])`)}
${note("El script usa <code>f\"Descripción: {study.get(\"description\")}\"</code>, con comillas dobles <b>dentro</b> de un f-string de comillas dobles. Solo es válido desde Python 3.12: en Python 3.11 o anterior es un <code>SyntaxError</code>. Para que tu código funcione en cualquier versión, alterna comillas: <code>f\"... {study.get('description')}\"</code>.")}
${codeBlock(`# Datos clínicos de PACIENTE en formato "ancho" (una fila por paciente), como hace pybioportal
atributos = ["OS_STATUS", "OS_MONTHS", "RACE"]
filas = []
for atributo in atributos:
    datos = await obtener_json(f"{BASE_URL}/api/studies/brca_tcga/clinical-data"
                               f"?clinicalDataType=PATIENT&attributeId={atributo}")
    filas += [{"patientId": d["patientId"], "atributo": d["clinicalAttributeId"], "valor": d["value"]} for d in datos]

largo = pd.DataFrame(filas)
ancho = largo.pivot(index="patientId", columns="atributo", values="valor")
ancho["OS_MONTHS"] = pd.to_numeric(ancho["OS_MONTHS"], errors="coerce")
print(ancho.head())
print(ancho["OS_STATUS"].value_counts())
print(ancho.groupby("OS_STATUS")["OS_MONTHS"].median().round(1))`)}
${concepto("Formato largo y formato ancho", "la API devuelve una fila por <i>dato</i> (paciente, atributo, valor): es el formato <b>largo</b>. Para analizar se suele preferir el <b>ancho</b>, una fila por paciente y una columna por atributo. <code>pivot</code> pasa de largo a ancho y <code>melt</code> hace lo contrario.")}
${staticCode(`# pip install pybioportal
from pybioportal import clinical_attributes as ca
from pybioportal import clinical_data as cd

atributos = ca.fetch_clinical_attributes(study_ids=["brca_tcga", "brca_bccrc"])
df = cd.fetch_all_clinical_data_in_study(study_id="brca_tcga", attribute_ids=["OS_STATUS", "OS_MONTHS", "RACE"],
                                         clinical_data_type="PATIENT", ret_format="WIDE")`, "Lo mismo con la librería pybioportal (en tu ordenador)")}
${tip("El script de clase descarga <b>todos</b> los datos clínicos del estudio (decenas de miles de registros) y después filtra <code>TMB_NONSYNONYMOUS</code> con pandas. Funciona, pero es mucho más eficiente pedir al servidor solo el atributo que necesitas (<code>attributeId=</code>), como en la celda del histograma.")}
${note("Si alguna celda falla con un error de red, usa <code>await probar_apis()</code> (módulo 32) para ver qué servicio no responde desde tu navegador. Sé respetuoso con los servidores: no lances cientos de peticiones seguidas; si haces bucles, añade una pausa (<code>asyncio.sleep(0.3)</code>). NCBI, por ejemplo, limita a 3 peticiones por segundo sin clave de API.")}
${origen("BIOPYTHON7_7_Entrez.py y clase_8_repaso/Cbioportal.py")}
${resumen(["Entrez: <code>esearch</code> busca identificadores, <code>esummary</code>/<code>efetch</code> dan los detalles; <code>db=</code> elige la base (pubmed, gene, nucleotide, clinvar...).", "Con Biopython: <code>Entrez.email = ...</code> es obligatorio; en el navegador, JSON directo con <code>retmode=json</code>.", "cBioPortal: <code>/api/studies/{id}</code> y <code>/clinical-data</code>; conviértelo en un DataFrame y analízalo.", "Respeta los límites de peticiones de cada servicio."])}
${quiz("¿Qué hace <code>esearch</code> en Entrez?", ["Descarga la secuencia completa", "Busca y devuelve los identificadores que cumplen la consulta", "Dibuja la proteína"], 1, "esearch devuelve una lista de IDs; con esummary o efetch pides después los detalles de cada uno.")}
</div>`},

{id:36, cat:"Bioinformática", title:"RDKit I: moléculas, formatos y descriptores", body:()=>`
<div class="theory">
${noNavegador("modulo-36-rdkit-1.ipynb")}
<p><b>RDKit</b> es la librería de referencia en quimioinformática. Convierte representaciones de texto de una molécula en un objeto <code>Mol</code> con el que puedes dibujar, calcular propiedades, buscar subestructuras o comparar fármacos.</p>
${concepto("Formatos químicos", "<b>SMILES</b>: una línea de texto (<code>CCO</code> = etanol). <b>SMARTS</b>: patrones para buscar subestructuras. <b>MOL/SDF</b>: tabla de átomos con coordenadas y enlaces (SDF = varios MOL en un archivo). <b>InChI/InChIKey</b>: identificadores estándar únicos.")}
${rdkitBlock(`from rdkit import Chem

etanol = Chem.MolFromSmiles("CCO")
print("Átomos:", etanol.GetNumAtoms(), [a.GetSymbol() for a in etanol.GetAtoms()])

aspirina = Chem.MolFromSmiles("CC(=O)OC1=CC=CC=C1C(=O)O")
print("SMILES canónico:", Chem.MolToSmiles(aspirina))
aspirina    # en Jupyter/Colab, la última línea de la celda se dibuja sola`)}
${rdkitBlock(`print("InChI:", Chem.MolToInchi(aspirina))
print("InChIKey:", Chem.MolToInchiKey(aspirina))
paracetamol = Chem.MolFromInchi("InChI=1S/C8H9NO2/c1-6(10)9-7-2-4-8(11)5-3-7/h2-5,11H,1H3,(H,9,10)")
print("Desde InChI:", Chem.MolToSmiles(paracetamol))`)}
${rdkitBlock(`from rdkit import Chem

desde_mol = Chem.MolFromMolFile("aspirin.mol")        # archivo MOL real del curso
print("Desde MOL:", Chem.MolToSmiles(desde_mol))
print(Chem.MolToMolBlock(desde_mol)[:300])

malo = Chem.MolFromSmiles("C1CC")      # anillo sin cerrar
print("SMILES inválido devuelve:", malo)`)}
${warn("no comprobar si <code>MolFromSmiles</code> devolvió <code>None</code>. Con un SMILES inválido no hay excepción: obtienes None y el error aparece más tarde, en otra línea. Comprueba siempre <code>if mol is None</code>.")}
<h3>Visualizar varias moléculas</h3>
${rdkitBlock(`from rdkit import Chem
from rdkit.Chem import Draw

farmacos = {"Aspirina": "CC(=O)OC1=CC=CC=C1C(=O)O",
            "Paracetamol": "CC(=O)NC1=CC=C(C=C1)O",
            "Ibuprofeno": "CC(C)CC1=CC=C(C=C1)C(C)C(=O)O",
            "Cafeína": "CN1C=NC2=C1C(=O)N(C(=O)N2C)C"}
mols = [Chem.MolFromSmiles(s) for s in farmacos.values()]
Draw.MolsToGridImage(mols, molsPerRow=4, subImgSize=(200, 170), legends=list(farmacos))`)}
<h3>Descriptores: propiedades calculadas</h3>
${rdkitBlock(`from rdkit import Chem
from rdkit.Chem import Descriptors, QED

mol = Chem.MolFromSmiles("CC(=O)NC1=CC=C(C=C1)O")     # paracetamol
print("Masa molecular:", round(Descriptors.MolWt(mol), 2))
print("LogP:", round(Descriptors.MolLogP(mol), 2), "(lipofilia: >0 prefiere grasa, <0 agua)")
print("Átomos pesados:", Descriptors.HeavyAtomCount(mol))
print("Enlaces rotables:", Descriptors.NumRotatableBonds(mol))
print("Donadores / aceptores de H:", Descriptors.NumHDonors(mol), "/", Descriptors.NumHAcceptors(mol))
print("TPSA:", Descriptors.TPSA(mol), "Å²")
print("QED (parecido a fármaco, 0-1):", round(QED.qed(mol), 3))
print("Átomos totales (con H):", Chem.AddHs(mol).GetNumAtoms())`)}
${concepto("Regla de los 5 de Lipinski", "un fármaco oral suele cumplir: masa ≤ 500 Da, LogP ≤ 5, ≤ 5 donadores de H y ≤ 10 aceptores de H. No es una ley, pero es un filtro muy usado en cribado virtual.")}
${staticCode(`from rdkit import Chem
writer = Chem.SDWriter("farmacos.sdf")
for nombre, smi in farmacos.items():
    m = Chem.MolFromSmiles(smi)
    m.SetProp("_Name", nombre)
    writer.write(m)
writer.close()
for m in Chem.SDMolSupplier("farmacos.sdf"):
    print(m.GetProp("_Name"))`, "Escribir y leer archivos SDF (también funciona en esta web)")}
${origen("clase_9: rdkit_1_formatos.py, rdkit_2_API.py, rdkit_3_visualizar_moleculas.py y rdkit_5_Descriptors.py")}
${exerciseLocal("Filtro de Lipinski", "Escribe <code>cumple_lipinski(smiles)</code> que devuelva <code>True</code> si la molécula cumple las 4 reglas de Lipinski, <code>False</code> si no, y <code>None</code> si el SMILES no es válido.",
`from rdkit import Chem
from rdkit.Chem import Descriptors

def cumple_lipinski(smiles):
    pass
`,
`<p>Primero convierte y comprueba <code>None</code>. Después evalúa las cuatro condiciones con <code>Descriptors.MolWt</code>, <code>MolLogP</code>, <code>NumHDonors</code> y <code>NumHAcceptors</code>, combinadas con <code>and</code>.</p>`,
`assert cumple_lipinski("CC(=O)OC1=CC=CC=C1C(=O)O") is True, "La aspirina cumple Lipinski"
assert cumple_lipinski("C1CC") is None, "Un SMILES inválido debe devolver None"
ciclosporina = "CCC1C(=O)N(CC(=O)N(C(C(=O)NC(C(=O)N(C(C(=O)NC(C(=O)NC(C(=O)N(C(C(=O)N(C(C(=O)N(C(C(=O)N(C(C(=O)N1)C(C(C)CC=CC)O)C)C(C)C)C)CC(C)C)C)CC(C)C)C)C)C)CC(C)C)C)C(C)C)CC(C)C)C)C"
assert cumple_lipinski(ciclosporina) is False, "La ciclosporina (1202 Da) no cumple Lipinski"`,
`def cumple_lipinski(smiles):
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        return None
    return bool(Descriptors.MolWt(mol) <= 500 and Descriptors.MolLogP(mol) <= 5
                and Descriptors.NumHDonors(mol) <= 5 and Descriptors.NumHAcceptors(mol) <= 10)`)}
${resumen(["<code>Chem.MolFromSmiles / MolFromMolFile / MolFromInchi</code> crean objetos Mol (o None si fallan).", "<code>MolToSmiles</code> (canónico), <code>MolToInchi</code>, <code>MolToMolBlock</code> convierten formatos.", "<code>Draw.MolsToGridImage</code> dibuja varias moléculas.", "<code>Descriptors</code>: MolWt, MolLogP, TPSA, NumHDonors/Acceptors, NumRotatableBonds; <code>QED.qed</code>."])}
${quiz("¿Qué representa el SMILES <code>c1ccccc1</code>?", ["Hexano", "Benceno", "Ciclohexano"], 1, "Las letras minúsculas indican átomos aromáticos; el 1 abre y cierra el anillo de 6 carbonos.")}
</div>`},

{id:37, cat:"Bioinformática", title:"RDKit II: subestructuras, edición y similitud", body:()=>`
<div class="theory">
${noNavegador("modulo-37-rdkit-2.ipynb")}
<p>Una vez tienes moléculas como objetos, puedes preguntarles cosas: ¿contienen un grupo funcional?, ¿qué pasa si quito este átomo?, ¿cuánto se parecen a otra molécula? Estas tres operaciones están en el corazón del diseño de fármacos.</p>
<h3>Buscar subestructuras con SMARTS</h3>
${rdkitBlock(`from rdkit import Chem

paracetamol = Chem.MolFromSmiles("CC(=O)NC1=CC=C(C=C1)O")
patrones = {"carbono aromático": "c", "hidroxilo": "[OX2H]", "amida": "C(=O)N",
            "anillo bencénico": "c1ccccc1", "ácido carboxílico": "C(=O)[OH]"}
for nombre, smarts in patrones.items():
    patron = Chem.MolFromSmarts(smarts)
    coincidencias = paracetamol.GetSubstructMatches(patron)
    print(f"{nombre:18s} {len(coincidencias)} coincidencia(s): {coincidencias}")

print(paracetamol.HasSubstructMatch(Chem.MolFromSmarts("C(=O)N")))`)}
${warn("en uno de los scripts de clase aparece <code>mol_paracetamol.c(substructura_ciclica)</code>: ese método no existe y da <code>AttributeError</code>. El correcto es <code>GetSubstructMatches</code>. Cuando no recuerdes un nombre, usa <code>dir(objeto)</code> (módulo 9).")}
${rdkitBlock(`from rdkit.Chem import Draw
amida = Chem.MolFromSmarts("C(=O)N")
atomos = paracetamol.GetSubstructMatch(amida)
from rdkit.Chem.Draw import rdMolDraw2D
d = rdMolDraw2D.MolDraw2DSVG(320, 220)
d.DrawMolecule(paracetamol, highlightAtoms=atomos, legend="Amida resaltada")
d.FinishDrawing()
from IPython.display import SVG
SVG(d.GetDrawingText())`)}
<h3>Modificar moléculas</h3>
${rdkitBlock(`from rdkit import Chem

mol = Chem.MolFromSmiles("CC(=O)NC1=CC=C(C=C1)O")
for atomo in mol.GetAtoms():
    print(atomo.GetIdx(), atomo.GetSymbol(), end=" | ")
print()

editable = Chem.RWMol(mol)                 # versión modificable
editable.RemoveAtom(2)                     # quitamos el oxígeno del carbonilo (índice 2)
nueva = editable.GetMol()
Chem.SanitizeMol(nueva)
print("Sin el O del carbonilo:", Chem.MolToSmiles(nueva))

con_h = Chem.AddHs(mol)
print("Átomos sin H:", mol.GetNumAtoms(), "| con H explícitos:", con_h.GetNumAtoms())
print("Quitando H de nuevo:", Chem.RemoveHs(con_h).GetNumAtoms())
nueva    # se dibuja al final de la celda`)}
${tip("Los índices de los átomos cambian al eliminar átomos. Si vas a quitar varios, hazlo de mayor a menor índice.")}
<h3>Huellas moleculares y similitud de Tanimoto</h3>
<p>Para comparar moléculas, cada una se convierte en una <b>huella</b> (fingerprint): un vector de bits donde cada bit indica la presencia de un fragmento. La huella de <b>Morgan</b> (radio 2 ≈ ECFP4) codifica el entorno de cada átomo hasta 2 enlaces. El <b>coeficiente de Tanimoto</b> mide bits compartidos / bits totales: 1 = idénticas, 0 = nada en común.</p>
${rdkitBlock(`from rdkit import Chem, DataStructs
from rdkit.Chem import rdFingerprintGenerator

generador = rdFingerprintGenerator.GetMorganGenerator(radius=2, fpSize=1024)
ibuprofeno = Chem.MolFromSmiles("CC(C)CC1=CC=C(C=C1)C(C)C(=O)O")
fp = generador.GetFingerprint(ibuprofeno)
print("Bits encendidos:", fp.GetNumOnBits(), "de", fp.GetNumBits())
print(fp.ToBitString()[:80], "...")`)}
${rdkitBlock(`from rdkit import Chem, DataStructs
from rdkit.Chem import rdFingerprintGenerator
import pandas as pd, seaborn as sns, matplotlib.pyplot as plt

farmacos = {"Aspirina": "CC(=O)OC1=CC=CC=C1C(=O)O", "Paracetamol": "CC(=O)NC1=CC=C(C=C1)O",
            "Ibuprofeno": "CC(C)CC1=CC=C(C=C1)C(C)C(=O)O", "Naproxeno": "COC1=CC2=CC(=CC=C2C=C1)C(C)C(=O)O",
            "Diazepam": "CN1C(=O)CN=C(C2=C1C=CC(=C2)Cl)C3=CC=CC=C3", "Cafeína": "CN1C=NC2=C1C(=O)N(C(=O)N2C)C"}
gen = rdFingerprintGenerator.GetMorganGenerator(radius=2, fpSize=2048)
fps = [gen.GetFingerprint(Chem.MolFromSmiles(s)) for s in farmacos.values()]
matriz = [[DataStructs.TanimotoSimilarity(a, b) for b in fps] for a in fps]
df = pd.DataFrame(matriz, index=farmacos, columns=farmacos).round(2)
sns.heatmap(df, annot=True, cmap="YlGnBu", vmin=0, vmax=1)
plt.title("Similitud de Tanimoto (Morgan r=2)")
plt.show()`)}
${note("Fíjate en que ibuprofeno y naproxeno (dos ácidos arilpropiónicos) son los más parecidos. Así funciona el <b>cribado por similitud</b>: buscar en bases de millones de compuestos los que más se parecen a un fármaco conocido.")}
${staticCode(`from rdkit.Chem import AllChem
fp = AllChem.GetMorganFingerprintAsBitVect(mol, 2, nBits=1024)   # API antigua (obsoleta)`, "Forma antigua que aparece en los scripts de clase")}
${origen("clase_9: rdkit_4_modificar_moleculas.py, rdkit_6_GetSubstructMatches.py, rdkit_7_Morgan.Tanimoto.py y Script7.py")}
${exerciseLocal("Buscador de análogos", "Escribe <code>mas_similares(consulta, biblioteca, n)</code> que devuelva una lista con los <code>n</code> nombres de <code>biblioteca</code> (diccionario nombre→SMILES) más parecidos a la molécula <code>consulta</code> (SMILES), ordenados de mayor a menor Tanimoto (Morgan radio 2, 2048 bits).",
`from rdkit import Chem, DataStructs
from rdkit.Chem import rdFingerprintGenerator

def mas_similares(consulta, biblioteca, n=2):
    pass

biblioteca = {"Aspirina": "CC(=O)OC1=CC=CC=C1C(=O)O", "Paracetamol": "CC(=O)NC1=CC=C(C=C1)O",
              "Naproxeno": "COC1=CC2=CC(=CC=C2C=C1)C(C)C(=O)O", "Cafeína": "CN1C=NC2=C1C(=O)N(C(=O)N2C)C",
              "Ketoprofeno": "CC(C1=CC(=CC=C1)C(=O)C2=CC=CC=C2)C(=O)O"}
print(mas_similares("CC(C)CC1=CC=C(C=C1)C(C)C(=O)O", biblioteca))   # ibuprofeno
`,
`<p>Calcula la huella de la consulta una vez; para cada elemento de la biblioteca calcula su similitud y guarda pares (nombre, similitud). Ordena con <code>sorted(..., key=lambda x: x[1], reverse=True)</code> y quédate con los nombres de los primeros n.</p>`,
`r = mas_similares("CC(C)CC1=CC=C(C=C1)C(C)C(=O)O", biblioteca, 2)
assert isinstance(r, list) and len(r) == 2, f"Debe devolver una lista de 2 nombres; devuelve {r}"
assert set(r) == {"Naproxeno", "Ketoprofeno"}, f"Los análogos más cercanos del ibuprofeno son Naproxeno y Ketoprofeno; tienes {r}"`,
`def mas_similares(consulta, biblioteca, n=2):
    gen = rdFingerprintGenerator.GetMorganGenerator(radius=2, fpSize=2048)
    fp_q = gen.GetFingerprint(Chem.MolFromSmiles(consulta))
    puntuaciones = [(nombre, DataStructs.TanimotoSimilarity(fp_q, gen.GetFingerprint(Chem.MolFromSmiles(smi))))
                    for nombre, smi in biblioteca.items()]
    return [nombre for nombre, _ in sorted(puntuaciones, key=lambda x: x[1], reverse=True)[:n]]`)}
${resumen(["<code>Chem.MolFromSmarts</code> + <code>GetSubstructMatches</code> / <code>HasSubstructMatch</code> buscan grupos funcionales.", "<code>Chem.RWMol</code> permite añadir/quitar átomos y enlaces; <code>AddHs</code>/<code>RemoveHs</code> gestionan hidrógenos.", "Huella de Morgan: <code>rdFingerprintGenerator.GetMorganGenerator(radius=2)</code>.", "<code>DataStructs.TanimotoSimilarity</code>: similitud entre 0 y 1."])}
${quiz("Dos moléculas tienen Tanimoto = 0.85. ¿Qué significa?", ["Comparten el 85 % de los átomos", "Comparten una gran proporción de fragmentos estructurales", "Tienen un 85 % de probabilidad de la misma actividad"], 1, "Tanimoto compara bits de la huella (fragmentos). Una similitud alta sugiere actividad parecida, pero no la garantiza (los <i>activity cliffs</i> existen).")}
</div>`},

{id:38, cat:"Bioinformática", title:"Proyectos de repaso: análisis completos", body:()=>`
<div class="theory">
<p>Estos proyectos reproducen los ejercicios de repaso del curso (clase 8), ya corregidos y comentados. Cada uno combina varios módulos: lectura de datos, limpieza, cálculo, visualización y, en algunos casos, modelos o APIs.</p>

<h3>Proyecto A · Exploración del Sistema Solar con pandas</h3>
${codeBlock(`import pandas as pd

pl = pd.read_csv("Planetas.txt").set_index("Planeta")
pl.columns = [c.split(" (")[0] for c in pl.columns]          # nombres de columna más cortos

print("Densidad media (masa > 1):", round(pl[pl["Mass"] > 1]["Density"].mean(), 1), "kg/m³")
pl["Masa/Diametro"] = pl["Mass"] / pl["Diameter"]
print("Correlación gravedad-densidad:", round(pl["Gravity"].corr(pl["Density"]), 3))
print("Distancia media al Sol de los que tienen anillos:", pl[pl["Ring System?"] == "Yes"]["Distance from Sun"].mean())
print(pl.groupby(["Ring System?", "Global Magnetic Field?"]).size())
print("Más caliente:", pl["Mean Temperature"].idxmax(), "| más frío:", pl["Mean Temperature"].idxmin())`)}
${codeBlock(`from pandas.plotting import scatter_matrix
import matplotlib.pyplot as plt

pl.select_dtypes("number").hist(bins=30, figsize=(13, 9), color="tab:blue", edgecolor="black")
plt.suptitle("Histogramas de las características de los planetas"); plt.tight_layout(); plt.show()
scatter_matrix(pl[["Gravity", "Mass", "Escape Velocity"]], figsize=(7, 6)); plt.show()`)}
${origen("clase_8_repaso/Script3.py")}

<h3>Proyecto B · Predicción del precio de viviendas (regresión lineal)</h3>
<p>Un primer contacto con el <b>aprendizaje automático</b> usando scikit-learn sobre el dataset de viviendas de California (una muestra de 2000 casas).</p>
${codeBlock(`import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("housing.csv")
print(df.shape)
print(df["ocean_proximity"].value_counts())
print(df.isnull().sum()[df.isnull().sum() > 0])

corr = df.drop(columns="ocean_proximity").corr()["median_house_value"].sort_values(ascending=False)
print(corr.round(2))

df.plot.scatter(x="median_income", y="median_house_value", alpha=0.3, figsize=(6, 3.5))
plt.title("Valor de la vivienda vs ingresos")
plt.show()`)}
${codeBlock(`import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score

datos = df[df["median_house_value"] < 500000].copy()          # quitamos el valor tope (censurado)
datos = pd.get_dummies(datos, columns=["ocean_proximity"])    # variables categóricas -> 0/1
datos["total_bedrooms"] = datos["total_bedrooms"].fillna(datos["total_bedrooms"].median())

X = datos.drop(columns="median_house_value")
y = datos["median_house_value"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

escalado = StandardScaler().fit(X_train)            # se ajusta SOLO con entrenamiento
modelo = LinearRegression().fit(escalado.transform(X_train), y_train)
y_pred = modelo.predict(escalado.transform(X_test))

rmse = np.sqrt(mean_squared_error(y_test, y_pred))
print(f"RMSE: {rmse:,.0f} $   |   R²: {r2_score(y_test, y_pred):.3f}")

plt.figure(figsize=(5, 4))
plt.scatter(y_test, y_pred, alpha=0.4)
plt.plot([0, 500000], [0, 500000], "r--")
plt.xlabel("Valor real"); plt.ylabel("Predicción"); plt.title("Real vs predicho")
plt.show()`)}
${note("Mejoras respecto al script original: (1) el escalador se ajusta solo con los datos de entrenamiento, para no 'filtrar' información del test; (2) se evalúa sobre el conjunto de test con el split correcto; (3) <code>mean_squared_error(..., squared=False)</code> ya no existe en scikit-learn reciente, así que el RMSE se calcula con <code>np.sqrt</code>; y (4) se añade R², más fácil de interpretar.")}
${origen("clase_8_repaso/Script4.py")}

<h3>Proyecto C · De nombres de ligandos a un archivo SDF</h3>
<p>Partimos de la lista de heteromoléculas del curso (código de 3 letras del PDB), consultamos su SMILES en la API del PDB, construimos las moléculas con RDKit, calculamos su peso molecular y guardamos todo en un SDF. <b>Requiere conexión.</b></p>
${noNavegador("modulo-38-proyecto-rdkit.ipynb")}
${rdkitBlock(`import time
import requests
import pandas as pd
from rdkit import Chem
from rdkit.Chem import Descriptors

het = pd.read_csv("heteromoleculas.csv")
print(het.head())

def smiles_pdb(codigo):
    r = requests.get(f"https://data.rcsb.org/rest/v1/core/chemcomp/{codigo}", timeout=20)
    if r.status_code != 200:
        return None
    return r.json().get("rcsb_chem_comp_descriptor", {}).get("smiles")

smiles = []
for c in het["ID de tres letras"]:
    smiles.append(smiles_pdb(c))
    time.sleep(0.2)                       # cortesía con el servidor
het["SMILES"] = smiles
het["mol"] = het["SMILES"].apply(lambda s: Chem.MolFromSmiles(s) if s else None)
het["peso"] = het["mol"].apply(lambda m: round(Descriptors.MolWt(m), 1) if m else None)
print(het[["ID de tres letras", "peso", "SMILES"]].sort_values("peso", ascending=False).head(10))

writer = Chem.SDWriter("heteromoleculas.sdf")
for _, fila in het.dropna(subset=["peso"]).iterrows():
    fila["mol"].SetProp("_Name", fila["ID de tres letras"])
    fila["mol"].SetProp("MW", str(fila["peso"]))
    writer.write(fila["mol"])
writer.close()
print("Moléculas guardadas:", len(Chem.SDMolSupplier("heteromoleculas.sdf")))`)}
${origen("clase_9/rdkit_8_act2.py, Script8.py y heteromoleculas.xlsx")}

<h3>Proyecto E · De estructuras a proteínas y cofactores</h3>
<p>El Script1 del repaso encadena tres bases de datos: descarga estructuras del PDB, traduce sus IDs a UniProt y enriquece la tabla con información de la proteína y de un cofactor (el zinc de p53) en PubChem. <b>Requiere conexión.</b></p>
${codeBlock(`import asyncio
import pandas as pd

pdb_ids = ["1TUP", "4OGQ", "2XYZ", "1A3N"]          # 2XYZ: veremos qué pasa con un ID que no mapea

async def obtener_uniprot_id_desde_pdb(pdb_id):
    r = await web.post("https://rest.uniprot.org/idmapping/run", data={"from": "PDB", "to": "UniProtKB", "ids": pdb_id})
    if r.status_code != 200:
        return None
    job = r.json()["jobId"]
    for _ in range(10):
        datos = (await web.get(f"https://rest.uniprot.org/idmapping/status/{job}")).json()
        if datos.get("jobStatus") not in ("NEW", "RUNNING"):
            break
        await asyncio.sleep(2)
    if "results" not in datos:
        datos = (await web.get(f"https://rest.uniprot.org/idmapping/results/{job}")).json()
    resultados = datos.get("results", [])
    if not resultados:
        print(f"No se encontraron resultados para el PDB ID {pdb_id}.")
        return None
    destino = resultados[0]["to"]
    return destino["primaryAccession"] if isinstance(destino, dict) else destino

uniprot_ids = [await obtener_uniprot_id_desde_pdb(p) for p in pdb_ids]
df = pd.DataFrame({"pdb_ids": pdb_ids, "uniprot_ids": uniprot_ids}).dropna()
print(df)`)}
${codeBlock(`async def obtener_informacion_uniprot(uniprot_id):
    r = await web.get(f"https://rest.uniprot.org/uniprotkb/{uniprot_id}.json")
    if r.status_code != 200:
        return pd.Series(dtype=object)           # una fila vacía en vez de None: no rompe la tabla
    d = r.json()
    desc = d["proteinDescription"]
    gen = d.get("genes", [{}])[0]
    return pd.Series({
        "fecha_publicacion": d["entryAudit"]["firstPublicDate"],
        "fecha_modificacion": d["entryAudit"]["lastAnnotationUpdateDate"],
        "revisado": "Swiss-Prot" if "unreviewed" not in d["entryType"] else "TrEMBL",
        "nombre_gen": gen.get("geneName", {}).get("value"),
        "sinonimos": ", ".join(s["value"] for s in gen.get("synonyms", [])),
        "organismo": d["organism"]["scientificName"],
        "nombre_proteina": (desc.get("recommendedName") or desc.get("submissionNames", [{}])[0]).get("fullName", {}).get("value"),
        "longitud": d["sequence"]["length"],
        "n_estructuras_pdb": sum(1 for ref in d.get("uniProtKBCrossReferences", []) if ref["database"] == "PDB"),
    })

info = pd.DataFrame([await obtener_informacion_uniprot(u) for u in df["uniprot_ids"]], index=df.index)
df = pd.concat([df, info], axis=1)
print(df.T)`)}
${warn("en el script, <code>revisado = 'Swiss-Prot' if datos['entryType'] else 'Trembl'</code> marca <b>todas</b> las proteínas como Swiss-Prot: <code>entryType</code> siempre es un texto no vacío (por ejemplo 'UniProtKB unreviewed (TrEMBL)') y un texto no vacío es <code>True</code>. Hay que mirar su contenido. Además, si la consulta falla, la función devolvía <code>None</code> y la asignación a varias columnas del DataFrame se rompía; devolver una <code>Series</code> vacía mantiene la tabla.")}
${codeBlock(`# El cofactor: zinc(2+) en PubChem, extrayendo propiedades del JSON completo
async def obtener_informacion_pubchem(nombre):
    datos = await obtener_json(f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/{nombre}/JSON")
    comp = datos["PC_Compounds"][0]
    fila = {"Nombre": nombre, "CID": comp["id"]["id"]["cid"], "IUPAC Name": []}
    for prop in comp["props"]:
        etiqueta, valor = prop["urn"]["label"], prop["value"].get("sval")
        if etiqueta == "IUPAC Name":
            fila["IUPAC Name"].append((valor, prop["urn"].get("name")))
        elif etiqueta in ("InChIKey", "InChI", "Molecular Weight", "SMILES"):
            fila[etiqueta] = valor
    return fila

df_cofactor = pd.DataFrame([await obtener_informacion_pubchem("zinc(2+)")])
print(df_cofactor.T)`)}
${origen("clase_8_repaso/Script1.py")}
<h3>Proyecto F · Proteínas asociadas a neurodegeneración</h3>
<p>El Script2 busca en UniProt 500 proteínas relacionadas con 'neurodegeneration', calcula su punto isoeléctrico y su peso con Biopython y compara humano y ratón. <b>Requiere conexión.</b></p>
${codeBlock(`import pandas as pd

params = {"query": "neurodegeneration", "format": "json", "size": 500,
          "fields": "accession,id,protein_name,organism_name,sequence"}       # solo los campos necesarios
r = await web.get("https://rest.uniprot.org/uniprotkb/search", params=params)
print("Estado:", r.status_code)
filas = []
for protein in r.json()["results"]:
    desc = protein.get("proteinDescription", {})
    nombre = (desc.get("recommendedName") or (desc.get("submissionNames") or [{}])[0]).get("fullName", {}).get("value", "")
    filas.append({"Uniprot_id": protein["uniProtkbId"], "Uniprot_name": nombre,
                  "Uniprot_seq": protein["sequence"]["value"], "Uniprot_lenseq": protein["sequence"]["length"],
                  "Uniprot_Organism": protein["organism"]["scientificName"]})
prot = pd.DataFrame(filas)
print(prot.shape)
print(prot["Uniprot_Organism"].value_counts().head(5))`)}
${tip("Con <code>fields=</code> UniProt devuelve solo las columnas que pides. Para 500 proteínas, la diferencia entre la entrada completa (con anotaciones, referencias cruzadas...) y lo imprescindible es de muchos megabytes.")}
${codeBlock(`from Bio.SeqUtils.IsoelectricPoint import IsoelectricPoint as IP
from Bio.SeqUtils import molecular_weight
from pandas.plotting import scatter_matrix
import matplotlib.pyplot as plt

estandar = set("ACDEFGHIKLMNPQRSTVWY")
validas = prot["Uniprot_seq"].apply(lambda s: set(s) <= estandar)
print("Secuencias con letras no estándar (X, U, B...):", (~validas).sum())
prot = prot[validas].copy()

prot["Isoelectric_point"] = prot["Uniprot_seq"].apply(lambda s: IP(s).pi())
prot["Molecular_weight"] = prot["Uniprot_seq"].apply(lambda s: molecular_weight(s, "protein"))
variables = ["Uniprot_lenseq", "Isoelectric_point", "Molecular_weight"]
print(prot[variables].corr().round(3))
scatter_matrix(prot[variables], figsize=(8, 7), alpha=0.5); plt.show()

fig, axs = plt.subplots(1, 2, figsize=(11, 3.8), sharey=True)
for ax, especie, color in zip(axs, ["Homo sapiens", "Mus musculus"], ["tab:blue", "tab:red"]):
    sub = prot[prot["Uniprot_Organism"] == especie]
    ax.hist(sub["Isoelectric_point"], bins=25, color=color, edgecolor="black")
    ax.set_title(f"{especie} (n={len(sub)}): punto isoeléctrico"); ax.set_xlabel("pI")
plt.tight_layout(); plt.show()`)}
${warn("<code>molecular_weight</code> lanza <code>ValueError</code> si la secuencia contiene letras ambiguas o no estándar, como X (desconocido) o U (selenocisteína), que aparecen en algunas entradas de UniProt. El script original aplicaba la función a todas y podía romperse según qué devolviera la búsqueda. Filtrar o capturar la excepción hace el análisis robusto. Y fíjate en la correlación de casi 1 entre longitud y peso: son la misma información, y en un modelo bastaría con una de las dos.")}
${origen("clase_8_repaso/Script2.py")}
<h3>Proyecto D · Tu propio mini-pipeline</h3>
${exercise("Informe de una proteína", "Combina lo aprendido: a partir de <code>P04637.fasta</code> crea un diccionario <code>informe</code> con las claves <code>'id'</code> (el identificador del registro), <code>'longitud'</code>, <code>'peso_kda'</code> (peso molecular en kDa redondeado a 1 decimal), <code>'pI'</code> (punto isoeléctrico redondeado a 2 decimales) y <code>'top3'</code> (lista con los 3 aminoácidos más frecuentes).",
`from Bio import SeqIO
from Bio.SeqUtils.ProtParam import ProteinAnalysis
informe = {}
`,
`<p>Lee el registro con <code>SeqIO.read</code>, crea un <code>ProteinAnalysis(str(registro.seq))</code> y obtén cada dato. Para el top 3, ordena <code>count_amino_acids().items()</code> por el valor de mayor a menor.</p>`,
`from Bio import SeqIO
from Bio.SeqUtils.ProtParam import ProteinAnalysis
rec = SeqIO.read("P04637.fasta", "fasta"); pa = ProteinAnalysis(str(rec.seq))
assert informe.get("id") == rec.id, "id incorrecto"
assert informe.get("longitud") == len(rec.seq), "longitud incorrecta"
assert informe.get("peso_kda") == round(pa.molecular_weight() / 1000, 1), "peso_kda incorrecto (¿has dividido entre 1000?)"
assert informe.get("pI") == round(pa.isoelectric_point(), 2), "pI incorrecto"
top = [a for a, _ in sorted(pa.count_amino_acids().items(), key=lambda x: -x[1])[:3]]
assert sorted(informe.get("top3", [])) == sorted(top), f"top3 esperado {top}"`,
`registro = SeqIO.read("P04637.fasta", "fasta")
pa = ProteinAnalysis(str(registro.seq))
informe = {
    "id": registro.id,
    "longitud": len(registro.seq),
    "peso_kda": round(pa.molecular_weight() / 1000, 1),
    "pI": round(pa.isoelectric_point(), 2),
    "top3": [aa for aa, _ in sorted(pa.count_amino_acids().items(), key=lambda x: -x[1])[:3]],
}
print(informe)`)}
${note("🎉 Has completado todo el temario. Ideas para seguir: automatiza un informe de calidad de tus propias lecturas FASTQ, construye una pequeña base de datos de ligandos de tus proteínas favoritas o publica tus análisis como notebooks en GitHub.")}
${resumen(["Un análisis completo: cargar → limpiar → explorar → modelar/calcular → visualizar → guardar.", "En ML, separa entrenamiento y test antes de ajustar cualquier transformación.", "Las APIs permiten enriquecer tus datos con información de bases públicas.", "Escribe funciones pequeñas y comprobables: es lo que hace que un script se convierta en un pipeline."])}
</div>`}
);
