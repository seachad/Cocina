# PLAN — Recetario «Socarrat» (web de recetas con modo cocina)

Plan autosuficiente para un agente programador. Ejecutar al pie de la letra. Todo el texto visible en español de España.

---

## 0. Decisiones abiertas

**Ninguna bloquea.** Todo lo que sigue está decidido. Las decisiones que he tomado yo (el usuario puede cambiarlas después sin tocar la arquitectura) son estas:

| # | Decisión | Por qué |
|---|----------|---------|
| D1 | Nombre: **Socarrat**. `<title>Recetario Socarrat</title>` | Nombre corto, del mundo del arroz, sin nombres de persona. |
| D2 | Archivos: `index.html` (marcado + CSS inline) + `recetas.js` (datos) + `nucleo.js` (lógica pura testeable en Node) + `app.js` (DOM, audio, voz, PDF) | En el Artifact solo valen estilos externos de Google Fonts, así que el CSS va inline. Los JS propios publicados junto a la página sí cargan. Separar `nucleo.js` permite tests con `node --test` sin navegador. |
| D3 | Un único mundo visual **oscuro** («mar de noche + hierro de paellera + azafrán»), con `color-scheme: dark`. Sin tema claro. | El modo cocina se usa con poca luz y manos sucias; un solo tema simplifica. |
| D4 | Tipografías: **Shrikhand** (títulos), **Atkinson Hyperlegible** (texto), **Chivo Mono** (relojes y cantidades) | Shrikhand tiene carácter de rótulo de bar mediterráneo; Atkinson es de las más legibles a distancia; Chivo Mono tiene cifras de ancho fijo. |
| D5 | En modo cocina, si la pestaña estuvo en segundo plano y vence un paso, se avanza **solo un paso** por tick y el siguiente empieza a contar desde ese momento (sin avances en cascada). | Así el usuario nunca se salta instrucciones. |
| D6 | Pasos sin tiempo fijo: `duracionSeg: null` + `duracionEstimadaSeg` (para el horario y la hora de fin). | El horario necesita una estimación. |
| D7 | Las horas de inicio de cada paso se muestran **truncadas** al minuto (mejor empezar antes que tarde). | Criterio prudente. |
| D8 | Si la hora de comer ya ha pasado hoy, se entiende que es **mañana** (se indica «mañana»). Si no da tiempo, aviso con la hora a la que comerías empezando ya. | Evita horarios negativos sin preguntar. |
| D9 | No se hace `git init` ni se publica el Artifact: eso lo hace la sesión coordinadora. | Fuera de alcance del programador. |
| D10 | Variable de depuración `window.SOCARRAT_VELOCIDAD` (por defecto 1) que acelera los temporizadores, para probar el modo cocina. | Permite verificar el avance sin esperar 75 min. |

---

## 1. Objetivo y alcance

### Entra
- Portada atractiva con rejilla de recetas (1 receta real + 1 tarjeta fantasma «Más recetas pronto», que no se puede pulsar).
- Vista de receta: selector de comensales (1–12, por defecto 4), ingredientes escalados por sección, PDF de la lista de la compra, horario (empezar ahora / quiero comer a las HH:MM), pasos de preparación previa y de ejecución con hora, duración, instrucción y consejo.
- Modo cocina a pantalla completa: cuenta atrás por paso, sonidos, voz, avance automático, pasos manuales con «Hecho», controles grandes, progreso global, hora estimada de fin, pantalla final.
- Receta 1: **Arroz caldoso con bogavante** (contenido completo en §5).
- Tests en Node para la lógica pura.

### No entra
- Backend, cuentas, buscador, filtros, favoritos, service worker o modo sin conexión.
- Imágenes externas (todo SVG inline / CSS).
- Tema claro.
- Publicar el Artifact, git.
- Pasos en paralelo (el horario es secuencial; lo que ocurre «mientras» se explica en el texto).

---

## 2. Árbol de archivos

```
C:\SEACHAD\Cocina\
├─ index.html          Empieza por <title>. Fuentes, <style> con TODO el CSS, esqueleto del DOM, <script> en orden.
├─ recetas.js          Datos: var RECETAS = [...] (y module.exports para Node). Añadir una receta = añadir un objeto.
├─ nucleo.js           Lógica pura sin DOM: escalado, formato, horario, duraciones, Latin-1, validación, reductor del modo cocina.
├─ app.js              Router por hash, render de vistas, animaciones, PDF, Web Audio, voz, Wake Lock, fullscreen, localStorage.
├─ package.json        Solo scripts de comprobación (sin dependencias).
├─ tests\
│  ├─ nucleo.test.js   Escalado, formato, horario, duraciones, Latin-1.
│  ├─ recetas.test.js  Validez de los datos de todas las recetas.
│  └─ cocina.test.js   Máquina de estados del modo cocina (reductor puro).
└─ docs\PLAN.md        Este archivo.
```

### Reglas del Artifact (obligatorias en `index.html`)
- Sin `<!doctype>`, `<html>`, `<head>` ni `<body>`. Primera línea: `<title>Recetario Socarrat</title>`.
- Luego `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">` (necesario para `env(safe-area-inset-*)` en local; inocuo en el Artifact).
- `<link rel="preconnect" href="https://fonts.googleapis.com">`, `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` y:
  `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=Chivo+Mono:wght@400;600&family=Shrikhand&display=swap">`
- `<style>…</style>` con todo el CSS. **Ningún otro `<link rel=stylesheet>`.**
- Al final del marcado, en este orden, todos con `defer`:
  ```html
  <script defer src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
  <script defer src="recetas.js"></script>
  <script defer src="nucleo.js"></script>
  <script defer src="app.js"></script>
  ```
- Prohibido: `alert(`, `confirm(`, `prompt(`, `window.print(`, `<img src="http…">`, cualquier otro script o CSS externo, emojis como marcadores.
- Rutas por hash: `#inicio` y `#<id-receta>` (p. ej. `#arroz-con-bogavante`). Sin `=` ni query string.

---

## 3. Esqueleto del DOM (`index.html`)

IDs fijos (app.js depende de ellos):

```html
<div class="fondo" aria-hidden="true"></div>        <!-- glow + burbujas CSS -->
<main id="app" tabindex="-1"></main>                 <!-- app.js renderiza aquí la vista -->
<section id="cocina" class="cocina" hidden aria-label="Modo cocina">
  <header class="cocina-barra">
    <button id="ck-salir" class="btn-icono" aria-label="Salir del modo cocina">…svg X…</button>
    <div class="cocina-cuenta"><span id="ck-num">Paso 1 de 18</span><span id="ck-fase">Preparación previa</span></div>
    <div class="cocina-eta">Terminas <b id="ck-eta">--:--</b></div>
    <button id="ck-silencio" class="btn-icono" aria-pressed="false" aria-label="Silenciar">…svg altavoz…</button>
  </header>
  <div class="cocina-progreso"><div id="ck-progreso"></div></div>
  <div class="cocina-cuerpo">
    <div class="anillo">
      <svg viewBox="0 0 200 200"><circle class="anillo-fondo" cx="100" cy="100" r="90"/><circle id="ck-arco" class="anillo-arco" cx="100" cy="100" r="90"/></svg>
      <div class="anillo-centro"><div id="ck-reloj" class="reloj">00:00</div><div id="ck-reloj-sub" class="reloj-sub">de 8:00</div></div>
    </div>
    <h2 id="ck-titulo" aria-live="polite"></h2>
    <p id="ck-texto"></p>
    <aside id="ck-consejo" class="consejo" hidden></aside>
    <p id="ck-siguiente" class="cocina-siguiente"></p>
  </div>
  <footer class="cocina-controles">
    <div class="fila-principal">
      <button id="ck-anterior" class="btn-ctrl">Anterior</button>
      <button id="ck-principal" class="btn-ctrl btn-grande">Pausa</button>  <!-- Pausa / Seguir / Hecho -->
      <button id="ck-siguiente-btn" class="btn-ctrl">Siguiente</button>
    </div>
    <div class="fila-secundaria">
      <button id="ck-voz" class="btn-sec">Repetir voz</button>
      <button id="ck-mas" class="btn-sec">+1 min</button>
    </div>
  </footer>
  <div id="ck-final" class="cocina-final" hidden>…«¡A la mesa!», SVG con vapor, botón #ck-volver «Volver a la receta»…</div>
</section>
<div id="aviso" class="aviso" role="status" aria-live="polite" hidden></div>
```

---

## 4. Modelo de datos (`recetas.js`)

```js
// recetas.js — datos de recetas. Para añadir una receta, añade un objeto a RECETAS.
var RECETAS = [ { /* receta */ } ];
if (typeof window !== 'undefined') window.RECETAS = RECETAS;
if (typeof module === 'object' && module.exports) module.exports = RECETAS;
```

### Esquema de receta

| Campo | Tipo | Notas |
|---|---|---|
| `id` | string | slug, solo `[a-z0-9-]`, se usa como hash |
| `nombre` | string | |
| `subtitulo` | string | |
| `dificultad` | `'Fácil'｜'Media'｜'Difícil'` | |
| `racionesBase` | number | cantidades de los ingredientes están para estas raciones |
| `ilustracion` | string | clave de un SVG definido en app.js (`'bogavante'`) |
| `color` | string | acento de la tarjeta (token CSS, p. ej. `'var(--bogavante)'`) |
| `antesDeEmpezar` | string[] | avisos previos (se muestran en la receta) |
| `avisoMuchos` | `{ desde:number, texto:string }` | aviso que aparece si comensales ≥ `desde` |
| `ingredientes` | Ingrediente[] | |
| `pasos` | Paso[] | en orden |

**No hay `tiempoTotal` en los datos**: se calcula sumando pasos (`duracionTotal`).

### Ingrediente

| Campo | Tipo | Notas |
|---|---|---|
| `id` | string | único en la receta |
| `nombre` | string | singular («Pimiento rojo») |
| `nombrePlural` | string? | para unidad `'ud'` cuando cantidad > 1 |
| `cantidad` | number｜null | para `racionesBase`; null si `alGusto` |
| `unidad` | `'g'｜'ml'｜'ud'｜'diente'｜'cdta'｜'hebra'｜null` | |
| `seccion` | string | una de `ORDEN_SECCIONES` |
| `escala` | `'lineal'｜'porPersonaCeil'｜'fijo'` | |
| `porCada` | number? | solo `porPersonaCeil`: 1 unidad por cada `porCada` comensales, redondeo hacia arriba |
| `redondeo` | number? | paso de redondeo en la unidad base (5, 10, 50, 0.5, 1…). Por defecto: g→5, ml→25, ud→0.5, diente→1, cdta→0.5, hebra→5 |
| `minimo` | number? | por defecto = `redondeo` |
| `alGusto` | boolean? | muestra «Al gusto»; no escala |
| `textoFijo` | string? | para `fijo` sin número, p. ej. «Unas ramitas» |
| `nota` | string? | aclaración en gris («600–700 g cada uno») |
| `opcional` | boolean? | muestra «(opcional)» |

### Paso

| Campo | Tipo | Notas |
|---|---|---|
| `id` | string | único |
| `fase` | `'preparacion'｜'ejecucion'` | |
| `titulo` | string | corto |
| `texto` | string | instrucción detallada |
| `voz` | string | frase corta para leer en voz alta |
| `duracionSeg` | number｜null | null = manual («Hecho») |
| `duracionEstimadaSeg` | number? | obligatorio si `duracionSeg` es null |
| `consejo` | string? | |

---

## 5. Contenido completo de la receta (copiar tal cual en `recetas.js`)

```js
{
  id: 'arroz-con-bogavante',
  nombre: 'Arroz con bogavante',
  subtitulo: 'Caldoso, a la manera de siempre: sofrito oscuro, fumet con azafrán y el bogavante entero dentro.',
  dificultad: 'Media',
  racionesBase: 4,
  ilustracion: 'bogavante',
  color: 'var(--bogavante)',
  antesDeEmpezar: [
    'Si el bogavante está vivo, mételo en el congelador 20–30 minutos antes de empezar: se adormece y se corta mejor.',
    'Usa una cazuela ancha de barro o acero de 32–36 cm para 4 personas, o una paellera honda.',
    'El fumet tiene que estar caliente cuando lo añadas al arroz, nunca frío.'
  ],
  avisoMuchos: { desde: 7, texto: 'Para más de 6 comensales usa dos cazuelas y reparte los ingredientes a medias. Los tiempos no cambian.' },
  ingredientes: [
    { id:'bogavante', nombre:'Bogavante', nombrePlural:'Bogavantes', cantidad:2, unidad:'ud', seccion:'Pescadería', escala:'porPersonaCeil', porCada:2, nota:'vivo o cocido, de 600–700 g cada uno' },
    { id:'fumet', nombre:'Fumet de pescado', cantidad:2000, unidad:'ml', seccion:'Pescadería', escala:'lineal', redondeo:50, nota:'casero o de brik' },
    { id:'tomate', nombre:'Tomate maduro', cantidad:300, unidad:'g', seccion:'Verdulería', escala:'lineal', redondeo:10, nota:'tomates maduros medianos' },
    { id:'cebolla', nombre:'Cebolla', nombrePlural:'Cebollas', cantidad:1, unidad:'ud', seccion:'Verdulería', escala:'lineal', redondeo:0.5, nota:'mediana' },
    { id:'pverde', nombre:'Pimiento verde italiano', nombrePlural:'Pimientos verdes italianos', cantidad:1, unidad:'ud', seccion:'Verdulería', escala:'lineal', redondeo:0.5 },
    { id:'projo', nombre:'Pimiento rojo', nombrePlural:'Pimientos rojos', cantidad:0.5, unidad:'ud', seccion:'Verdulería', escala:'lineal', redondeo:0.5 },
    { id:'ajo', nombre:'Ajo', cantidad:4, unidad:'diente', seccion:'Verdulería', escala:'lineal', redondeo:1, minimo:2 },
    { id:'perejil', nombre:'Perejil fresco', cantidad:null, unidad:null, seccion:'Verdulería', escala:'fijo', textoFijo:'Unas ramitas', opcional:true },
    { id:'arroz', nombre:'Arroz bomba', cantidad:400, unidad:'g', seccion:'Despensa', escala:'lineal', redondeo:10, nota:'o arroz redondo tipo senia' },
    { id:'aceite', nombre:'Aceite de oliva virgen extra', cantidad:80, unidad:'ml', seccion:'Despensa', escala:'lineal', redondeo:10 },
    { id:'nora', nombre:'Ñora', nombrePlural:'Ñoras', cantidad:2, unidad:'ud', seccion:'Despensa', escala:'lineal', redondeo:1, minimo:1, nota:'secas' },
    { id:'pimenton', nombre:'Pimentón dulce de la Vera', cantidad:1, unidad:'cdta', seccion:'Despensa', escala:'lineal', redondeo:0.5 },
    { id:'azafran', nombre:'Azafrán en hebras', cantidad:20, unidad:'hebra', seccion:'Despensa', escala:'lineal', redondeo:5 },
    { id:'sal', nombre:'Sal', cantidad:null, unidad:null, seccion:'Despensa', escala:'fijo', alGusto:true },
    { id:'brandy', nombre:'Brandy o coñac', cantidad:50, unidad:'ml', seccion:'Bodega', escala:'lineal', redondeo:5 }
  ],
  pasos: [
    // ---------- PREPARACIÓN PREVIA (1620 s) ----------
    { id:'remojar-noras', fase:'preparacion', titulo:'Remoja las ñoras', duracionSeg:120,
      texto:'Quita el rabito y las pepitas a las ñoras y ponlas en un cuenco con agua muy caliente. Se quedarán ahí hidratándose mientras haces lo demás; más adelante rascarás su carne.',
      voz:'Quita el rabito y las pepitas a las ñoras y déjalas en un cuenco con agua muy caliente.',
      consejo:'Si no encuentras ñoras, añade media cucharadita más de pimentón dulce en el paso del pimentón.' },
    { id:'calentar-fumet', fase:'preparacion', titulo:'Calienta el fumet con el azafrán', duracionSeg:240,
      texto:'Pon el fumet en un cazo a fuego medio. Tuesta las hebras de azafrán 20 segundos en una sartén seca, desmenúzalas con los dedos y échalas al fumet. Cuando hierva, baja el fuego al mínimo y tápalo: tiene que seguir caliente hasta el final.',
      voz:'Pon el fumet a calentar. Tuesta el azafrán veinte segundos, desmenúzalo y échalo al fumet. Cuando hierva, al mínimo y tapado.',
      consejo:'Prueba el fumet: si ya está salado, sala con prudencia el resto del arroz.' },
    { id:'picar', fase:'preparacion', titulo:'Pica las verduras', duracionSeg:480,
      texto:'Pica la cebolla, el pimiento verde y el pimiento rojo en dados pequeños, de 3 a 4 milímetros. Pela los ajos y pícalos muy finos. Deja el ajo aparte: entra más tarde.',
      voz:'Pica la cebolla y los pimientos en dados pequeños. Pela y pica los ajos muy finos y déjalos aparte.',
      consejo:'Cuanto más fino el picado, mejor se funde el sofrito con el caldo.' },
    { id:'cortar-bogavante', fase:'preparacion', titulo:'Corta el bogavante', duracionSeg:null, duracionEstimadaSeg:480,
      texto:'Sobre una tabla, sujeta el bogavante por el cuerpo. Clava un cuchillo grande y firme en la cruz de la cabeza y córtala en dos a lo largo. Separa la cola y córtala en 3 o 4 medallones por las articulaciones. Separa las pinzas y cáscalas con el lomo del cuchillo para que luego se puedan comer. Retira el saquito de arena de la cabeza y guarda en un cuenco el coral y los jugos: darán mucho sabor. Pulsa «Hecho» cuando termines.',
      voz:'Corta el bogavante: la cabeza en dos a lo largo, la cola en medallones, y casca las pinzas. Guarda los jugos de la cabeza. Pulsa hecho cuando acabes.',
      consejo:'Si el bogavante ya está cocido, córtalo igual y al sellarlo dale solo 30 segundos por cada lado.' },
    { id:'tomate-noras', fase:'preparacion', titulo:'Ralla el tomate y rasca las ñoras', duracionSeg:300,
      texto:'Parte los tomates por la mitad y rállalos por el lado del corte; desecha la piel. Saca las ñoras del agua, ábrelas y rasca su carne con una cucharilla. Mezcla la carne de ñora con el tomate rallado.',
      voz:'Ralla el tomate y tira la piel. Rasca la carne de las ñoras con una cucharilla y mézclala con el tomate.',
      consejo:'Guarda un poco del agua de las ñoras: si el sofrito se seca, añade un chorrito.' },

    // ---------- EJECUCIÓN (2850 s) ----------
    { id:'sellar', fase:'ejecucion', titulo:'Sella el bogavante', duracionSeg:240,
      texto:'Pon la cazuela a fuego fuerte con el aceite. Sala ligeramente los trozos de bogavante. Cuando el aceite esté caliente, márcalos 2 minutos por cada lado, primero con la carne hacia abajo, hasta que la cáscara se ponga roja. Sácalos a un plato y resérvalos. No apagues el fuego.',
      voz:'Fuego fuerte con el aceite. Sella el bogavante dos minutos por cada lado y resérvalo en un plato.',
      consejo:'No lo cocines del todo: terminará de hacerse dentro del arroz.' },
    { id:'sofrito', fase:'ejecucion', titulo:'Sofríe la cebolla y los pimientos', duracionSeg:480,
      texto:'Baja a fuego medio. En el mismo aceite, que ya sabe a bogavante, añade la cebolla y los pimientos con una pizca de sal. Remueve de vez en cuando hasta que estén blandos y empiecen a dorarse.',
      voz:'Fuego medio. Añade la cebolla y los pimientos con una pizca de sal y sofríe removiendo de vez en cuando.',
      consejo:'Raspa el fondo con la cuchara: esos tostados son sabor.' },
    { id:'ajo', fase:'ejecucion', titulo:'Añade el ajo', duracionSeg:60,
      texto:'Incorpora el ajo picado y remueve durante un minuto, sin que llegue a tostarse.',
      voz:'Añade el ajo y remueve un minuto, sin que se tueste.' },
    { id:'tomate', fase:'ejecucion', titulo:'Cocina el tomate', duracionSeg:480,
      texto:'Añade el tomate con la carne de ñora y los jugos que guardaste de la cabeza del bogavante. Cocina a fuego medio, removiendo, hasta que pierda el agua, oscurezca y el aceite empiece a asomar por los bordes.',
      voz:'Añade el tomate con la ñora y los jugos del bogavante. Cocina removiendo hasta que oscurezca.',
      consejo:'Este sofrito es la base del arroz: sin prisa. Tiene que quedar como una mermelada oscura.' },
    { id:'pimenton', fase:'ejecucion', titulo:'Pimentón', duracionSeg:30,
      texto:'Añade el pimentón y remueve sin parar durante 30 segundos. Si el fuego está muy fuerte, aparta la cazuela un momento: el pimentón quemado amarga.',
      voz:'Pimentón. Remueve sin parar treinta segundos, que no se queme.' },
    { id:'flambear', fase:'ejecucion', titulo:'Flambea con el brandy', duracionSeg:null, duracionEstimadaSeg:60,
      texto:'Apaga la campana extractora. Vierte el brandy, deja que se caliente unos segundos y préndelo con un mechero de cocina largo, apartando la cara. Mueve la cazuela hasta que la llama se apague sola. Pulsa «Hecho» cuando se apague.',
      voz:'Apaga la campana. Echa el brandy y préndelo con cuidado, apartando la cara. Pulsa hecho cuando se apague la llama.',
      consejo:'Si prefieres no flambear, deja hervir el brandy un minuto para que se evapore el alcohol.' },
    { id:'nacarar', fase:'ejecucion', titulo:'Nacara el arroz', duracionSeg:120,
      texto:'Sube a fuego medio-alto, añade el arroz y remuévelo 2 minutos para que se impregne bien del sofrito y el grano se vuelva translúcido por los bordes.',
      voz:'Añade el arroz y remuévelo dos minutos con el sofrito.' },
    { id:'caldo', fase:'ejecucion', titulo:'Añade el fumet caliente', duracionSeg:60,
      texto:'Vierte de golpe el fumet caliente, pero deja en el cazo un vaso (unos 250 ml) para corregir al final. Remueve una vez para repartir el arroz, prueba de sal y corrige. A partir de aquí, casi no remuevas.',
      voz:'Vierte el fumet caliente y deja un vaso en el cazo para el final. Remueve una vez y prueba de sal.' },
    { id:'fuego-fuerte', fase:'ejecucion', titulo:'Fuego fuerte', duracionSeg:600,
      texto:'Mantén un hervor vivo a fuego fuerte durante 10 minutos. En lugar de remover con la cuchara, mueve la cazuela de vez en cuando cogiéndola por las asas.',
      voz:'Fuego fuerte, hervor vivo, diez minutos. Mueve la cazuela por las asas en vez de remover.' },
    { id:'bogavante-dentro', fase:'ejecucion', titulo:'Bogavante dentro, fuego medio', duracionSeg:420,
      texto:'Coloca los trozos de bogavante sobre el arroz, con la carne hacia abajo, y húndelos un poco. Baja a fuego medio y deja que siga cociendo 7 minutos. Si ves que se queda seco, añade el fumet reservado: tiene que quedar caldoso, con el grano nadando en caldo.',
      voz:'Pon el bogavante sobre el arroz con la carne hacia abajo y baja a fuego medio. Si se seca, añade el fumet reservado.',
      consejo:'Debe quedar más caldo del que parece: el arroz lo seguirá bebiendo en la mesa.' },
    { id:'punto', fase:'ejecucion', titulo:'Comprueba el punto', duracionSeg:null, duracionEstimadaSeg:60,
      texto:'Prueba un grano: debe estar al dente, con un puntito firme en el centro. Rectifica de sal y, si hace falta, añade caldo caliente. Apaga el fuego y pulsa «Hecho».',
      voz:'Prueba un grano: tiene que estar al dente. Rectifica de sal, apaga el fuego y pulsa hecho.' },
    { id:'reposo', fase:'ejecucion', titulo:'Reposo', duracionSeg:180,
      texto:'Tapa la cazuela con un paño limpio y deja reposar 3 minutos fuera del fuego. El arroz termina de hacerse con el calor que le queda.',
      voz:'Tapa la cazuela con un paño y deja reposar tres minutos fuera del fuego.',
      consejo:'En un arroz caldoso el reposo es corto: si esperas más, el grano se pasa y se bebe el caldo.' },
    { id:'servir', fase:'ejecucion', titulo:'A la mesa', duracionSeg:null, duracionEstimadaSeg:60,
      texto:'Espolvorea perejil picado si quieres y sirve enseguida en platos hondos, con un trozo de cola y una pinza para cada uno. ¡Que aproveche!',
      voz:'Sirve enseguida en platos hondos. Que aproveche.' }
  ]
}
```

Total: preparación 1620 s + ejecución 2850 s = **4470 s ≈ 1 h 15 min**. 18 pasos (4 manuales).

### Tabla de escalado esperada (la usan los tests)

| Ingrediente | 2 | 4 | 7 | 12 |
|---|---|---|---|---|
| Bogavante | 1 bogavante | 2 bogavantes | 4 bogavantes | 6 bogavantes |
| Fumet | 1 l | 2 l | 3,5 l | 6 l |
| Tomate | 150 g | 300 g | 530 g | 900 g |
| Cebolla | ½ cebolla | 1 cebolla | 2 cebollas | 3 cebollas |
| Pimiento verde | ½ | 1 | 2 | 3 |
| Pimiento rojo | ½ | ½ | 1 | 1 ½ |
| Ajo | 2 dientes | 4 dientes | 7 dientes | 12 dientes |
| Perejil | Unas ramitas | = | = | = |
| Arroz | 200 g | 400 g | 700 g | 1,2 kg |
| Aceite | 40 ml | 80 ml | 140 ml | 240 ml |
| Ñora | 1 | 2 | 4 | 6 |
| Pimentón | ½ cdta. | 1 cdta. | 2 cdtas. | 3 cdtas. |
| Azafrán | 10 hebras | 20 hebras | 35 hebras | 60 hebras |
| Sal | Al gusto | = | = | = |
| Brandy | 25 ml | 50 ml | 90 ml | 150 ml |

(Comprobaciones: tomate 7 → 525 → `Math.round(52.5)*10` = 530; pimiento rojo 2 → 0,25 → `Math.round(0.5)*0.5` = 0,5; 7 → 0,875 → 1; ñora 7 → 3,5 → 4; brandy 7 → 87,5 → `Math.round(17.5)*5` = 90.)

---

## 6. `nucleo.js` — lógica pura

Envoltorio (sirve en navegador y en Node):

```js
(function (raiz) {
  'use strict';
  const ORDEN_SECCIONES = ['Pescadería','Carnicería','Verdulería','Lácteos y huevos','Despensa','Bodega','Otros'];
  const REDONDEO_DEFECTO = { g:5, ml:25, ud:0.5, diente:1, cdta:0.5, hebra:5 };
  const UNIDADES = { g:['g','g'], ml:['ml','ml'], diente:['diente','dientes'], cdta:['cdta.','cdtas.'], hebra:['hebra','hebras'], ud:['',''] };
  // … funciones …
  const api = { ORDEN_SECCIONES, redondear, escalarValor, formatearNumero, formatearCantidad, escalarIngrediente,
    agruparPorSeccion, duracionPaso, duracionTotal, calcularHorario, formatoHora, formatoDuracion,
    formatoDuracionVoz, formatoReloj, aLatin1, validarReceta, cocinaInicial, cocinaReducir };
  raiz.Nucleo = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
```

### 6.1 Escalado

```js
function redondear(valor, paso) {           // evita 0.30000000004
  return Number((Math.round(valor / paso) * paso).toFixed(3));
}
function escalarValor(ing, comensales, racionesBase) // -> number | null
```
Reglas:
- `alGusto` o `escala === 'fijo'` → devuelve `null` si `cantidad` es null; si `fijo` con `cantidad` numérica, devuelve `cantidad` sin cambiar.
- `porPersonaCeil` → `Math.ceil(comensales / porCada)`.
- `lineal` → `bruto = cantidad * comensales / racionesBase`; `paso = ing.redondeo ?? REDONDEO_DEFECTO[unidad] ?? 1`; `v = redondear(bruto, paso)`; `return Math.max(ing.minimo ?? paso, v)`.

```js
function formatearNumero(v)   // 0.5→'½', 0.25→'¼', 0.75→'¾', 1.5→'1 ½', 2→'2', 2.25→'2,25', 1.2→'1,2'
```
- Separa parte entera y fraccionaria; si la fracción (con tolerancia 0.001) es .25/.5/.75 usa `¼ ½ ¾` (todos Latin-1, válidos en el PDF). Entero 0 → solo el glifo. Si no, decimal con coma, máximo 2 decimales, sin ceros finales.
- Excepción: para `ml`/`l` y `kg` (ver abajo) se usa siempre decimal con coma, nunca glifos (`2,25 l`, no `2 ¼ l`).

```js
function formatearCantidad(valor, unidad) // -> string
```
- `g` ≥ 1000 → `kg` con decimal (`1200` → `'1,2 kg'`); si no `'530 g'`.
- `ml` ≥ 1000 → `l` con decimal (`2000` → `'2 l'`, `3500` → `'3,5 l'`, `2250` → `'2,25 l'`); si no `'90 ml'`.
- `diente`, `cdta`, `hebra` → número + singular si `valor <= 1`, plural si > 1 (`'½ cdta.'`, `'2 cdtas.'`, `'4 dientes'`).
- `ud` → solo el número (`'2'`, `'½'`, `'1 ½'`).

```js
function escalarIngrediente(ing, comensales, racionesBase)
// -> { id, cantidadTexto, nombre, nota, opcional, seccion, valor }
```
- `alGusto` → `cantidadTexto: 'Al gusto'`. `textoFijo` → ese texto.
- `nombre`: si `unidad === 'ud'` y `valor > 1` y existe `nombrePlural` → plural; si no, `nombre`.
- La vista pinta dos columnas: cantidad (Chivo Mono, grande) | nombre (+ nota en gris + «(opcional)»).

```js
function agruparPorSeccion(lineas) // -> [{ seccion, lineas:[…] }] en ORDEN_SECCIONES; secciones desconocidas al final, en orden de aparición
```

### 6.2 Duraciones y formatos

```js
duracionPaso(p)        // p.duracionSeg ?? p.duracionEstimadaSeg
duracionTotal(receta)  // suma; 4470 para el arroz
formatoDuracion(seg)   // <60 → '30 s'; múltiplo de 60 → '8 min'; resto <3600 → '1 min 30 s'; ≥3600 → redondeo a minuto: '1 h 15 min' (4470 → '1 h 15 min'), 3600 → '1 h'
formatoDuracionVoz(seg)// 30 → '30 segundos'; 60 → '1 minuto'; 480 → '8 minutos'; 150 → '2 minutos y medio'; 90 → '1 minuto y medio'; 100 → '1 minuto y 40 segundos'
formatoReloj(ms)       // cuenta atrás 'MM:SS' (o 'H:MM:SS' si ≥ 1 h); usa Math.ceil(ms/1000), nunca negativo
formatoHora(date)      // 'HH:MM' 24 h, truncado al minuto, con ceros (padStart)
```
Pasos manuales en la lista: chip `'≈ 8 min · sin tiempo fijo'`.

### 6.3 Horario

```js
function calcularHorario(receta, { modo, ahora, horaComer })
// modo: 'ahora' | 'comer'; ahora: Date; horaComer: 'HH:MM'
// -> { inicio:Date, fin:Date, pasos:[{inicio:Date, fin:Date}], manana:boolean, noLlegas:boolean, finSiEmpiezasYa:Date }
```
- `total = duracionTotal(receta) * 1000`.
- `modo 'ahora'`: `inicio = ahora`; `fin = inicio + total`.
- `modo 'comer'`: `objetivo` = hoy a `horaComer`:00.000 (hora local). Si `objetivo <= ahora` → `objetivo += 24 h`, `manana = true`. `fin = objetivo`; `inicio = objetivo - total`. `noLlegas = inicio < ahora`; `finSiEmpiezasYa = ahora + total`.
- `pasos[i].inicio = inicio + Σ duracionPaso(pasos[0..i-1])*1000`.
- Ejemplo (test): ahora = hoy 10:00, comer `'14:30'` → inicio 13:15:30 → `formatoHora` `'13:15'`; paso `sellar` (offset 1620 s) → 13:42:30 → `'13:42'`; fin `'14:30'`.

### 6.4 Latin-1 para el PDF

```js
function aLatin1(s) // sustituye: '–','—'→'-'; '‘','’'→"'"; '“','”'→'"'; '…'→'...'; '≈'→'aprox. '; ' ' (U+202F) y ' '→' '; cualquier otro >U+00FF → '?'
```
Conserva `á é í ó ú ü ñ Ñ ¿ ¡ ½ ¼ ¾ «»` (todos ≤ U+00FF).

### 6.5 Validación

```js
function validarReceta(r) // -> string[] de errores (vacío = válida)
```
Comprueba: `id` con `/^[a-z0-9-]+$/`; campos obligatorios; ids de ingredientes y pasos únicos; cada `seccion` en `ORDEN_SECCIONES`; `escala` válida; `porPersonaCeil` con `porCada > 0`; ingredientes sin `alGusto`/`textoFijo` con `cantidad > 0`; cada paso con `fase` válida, `duracionSeg > 0` o (`null` y `duracionEstimadaSeg > 0`), `titulo`, `texto`, `voz` no vacíos; al menos un paso de cada fase y los de `preparacion` antes que los de `ejecucion`.

### 6.6 Máquina de estados del modo cocina (reductor puro)

Estados: `'corriendo' | 'pausado' | 'esperandoManual' | 'terminado'` (antes de pulsar Comenzar no existe estado: es «idle», la vista de receta).

```js
function cocinaInicial(receta, ahora, velocidad = 1)
// -> { receta, velocidad, indice:0, estado, finMs, restanteMs, inicioPasoMs, ultimoTic, pausadoDesde }
//    + efectos del primer paso (devuelve { estado, efectos } igual que cocinaReducir)
function cocinaReducir(est, accion)   // accion = { tipo, ahora }
// -> { estado: nuevoEst, efectos: Efecto[] }
```
- `ahora` siempre viene de fuera (`Date.now()`), así el reductor es puro y testeable. Temporización **por marca de fin** (`finMs`), nunca contando ticks.
- `durMs(paso) = paso.duracionSeg * 1000 / velocidad`.
- **`iniciarPaso(i, ahora)`** (interno): `indice = i`, `inicioPasoMs = ahora`, `ultimoTic = 11`. Si el paso tiene `duracionSeg` → `estado = 'corriendo'`, `finMs = ahora + durMs`. Si no → `'esperandoManual'`, `finMs = null`. Efectos: `{tipo:'campana'}`, `{tipo:'voz', texto: textoVoz(paso, i)}` con
  `textoVoz = 'Paso ' + (i+1) + ' de ' + N + '. ' + titulo + '. ' + voz + (duracionSeg ? ' Tiempo: ' + formatoDuracionVoz(duracionSeg) + '.' : '')`.
- Acciones:

| Acción | Desde | Resultado |
|---|---|---|
| `TICK` | `corriendo` | `restante = finMs - ahora`; `s = Math.ceil(restante/1000)`. Si `1 ≤ s ≤ 10` y `s < ultimoTic` → efecto `{tipo:'tic', agudo: s <= 3}` y `ultimoTic = s` (como mucho un tic por TICK; no se recuperan tics perdidos). Si `restante ≤ 0` → efecto `{tipo:'fin'}` y luego: si es el último paso → `terminado` + `{tipo:'fanfarria'}` + `{tipo:'voz', texto:'Listo. ¡Que aproveche!'}`; si no → `iniciarPaso(indice+1, ahora)` (solo un paso, decisión D5). |
| `TICK` | otros | sin cambios, sin efectos |
| `PAUSAR` | `corriendo` | `pausado`, `restanteMs = finMs - ahora`, efecto `{tipo:'callar'}` |
| `REANUDAR` | `pausado` | `corriendo`, `finMs = ahora + restanteMs` |
| `SIGUIENTE` / `HECHO` | `corriendo`, `pausado`, `esperandoManual` | último paso → `terminado` (+ fanfarria + voz); si no → `iniciarPaso(indice+1)` |
| `ANTERIOR` | cualquiera salvo `terminado` | `iniciarPaso(max(0, indice-1))` (reinicia el tiempo de ese paso) |
| `MAS_TIEMPO` | `corriendo` | `finMs += 60000/velocidad`; `ultimoTic = 11` si el nuevo restante > 10 s |
| `MAS_TIEMPO` | `pausado` | `restanteMs += 60000/velocidad` |
| `REPETIR_VOZ` | cualquiera salvo `terminado` | efecto `voz` con `textoVoz` del paso actual |

Funciones derivadas (también en `nucleo.js`, puras):
```js
function cocinaProgreso(est, ahora) // 0..1 = (Σ duracionPaso anteriores + transcurrido del actual, acotado a su duración) / duracionTotal
function cocinaEta(est, ahora)      // Date = ahora + restante del actual (manual: max(0, estimada - transcurrido)) + Σ duracionPaso siguientes, todo /velocidad
```
(Añadirlas también al objeto `api`.)

---

## 7. `app.js` — DOM y servicios del navegador

`'use strict'`, todo dentro de una IIFE. Arranca en `DOMContentLoaded` (los scripts son `defer`; basta con ejecutar al cargar). Usa `window.RECETAS` y `window.Nucleo`. Sin framework; plantillas con template strings y **`esc()`** (escapar `& < > " '`) en todo texto de datos.

### 7.1 Estado y persistencia
```js
const E = { receta:null, comensales:4, modo:'ahora', horaComer:'14:30', silencio:false, refresco:null };
const LS = { get(k, d){ try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
             set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };
// claves: 'socarrat:comensales:<id>' (número 1–12), 'socarrat:silencio' (bool)
```

### 7.2 Router
- `window.addEventListener('hashchange', router)` y `router()` al iniciar.
- `token = location.hash.slice(1) || 'inicio'`. Si `token === 'inicio'` → `renderInicio()`. Si hay receta con ese id → `renderReceta(r)`. Si no → `location.replace('#inicio')`.
- Al cambiar de vista: si el modo cocina está abierto, cerrarlo; limpiar `E.refresco`; `scrollTo(0,0)`; enfocar `#app`; actualizar `document.title` (`'Recetario Socarrat'` / `'Arroz con bogavante · Socarrat'`).
- Transición: el contenedor nuevo lleva la clase `vista` con animación `entrar-vista` (ver §8.5).

### 7.3 Vista portada (`#inicio`)
1. **Héroe**: SVG grande de paellera vista desde arriba (elipse de hierro con dos asas, arroz como puntos azafrán, un bogavante rojo estilizado: cuerpo segmentado, dos pinzas, antenas en curva) con tres volutas de vapor animadas encima. Título «Socarrat» en Shrikhand (azafrán), lema: «Arroces de los de antes, con horas, paso a paso y en voz alta.» Entrada orquestada (§8.5).
2. **Rejilla** `.rejilla` (1 columna < 640 px; 2 columnas ≥ 640; 3 ≥ 1000): una `<a class="tarjeta" href="#<id>">` por receta con: miniatura SVG sobre círculo de hierro, nombre (Shrikhand), subtítulo (2 líneas máx. con `-webkit-line-clamp`), chips: `formatoDuracion(total)`, dificultad, `racionesBase` raciones; flecha. Después, una tarjeta fantasma `<div class="tarjeta tarjeta-fantasma" aria-hidden="true">` con borde discontinuo y texto «Más recetas pronto».
3. Pie discreto: «Socarrat · recetario».

### 7.4 Vista receta (`#arroz-con-bogavante`)
Orden en una columna (máx. 760 px de ancho de lectura; en ≥ 1000 px, ingredientes y horario pueden ir en dos columnas lado a lado, pasos debajo a ancho completo):

1. **Cabecera**: enlace «‹ Recetas» a `#inicio` (botón ≥ 56 px), ilustración SVG, nombre, subtítulo, chips (tiempo total, dificultad, «18 pasos»).
2. **Comensales**: tarjeta con etiqueta «¿Para cuántos?», botón «−» (72 × 72), número enorme (Chivo Mono, `clamp(56px, 16vw, 88px)`, `aria-live="polite"`), botón «+» (72 × 72), texto «comensales». Límites 1–12 (botón deshabilitado en el límite). Inicial: `LS.get('socarrat:comensales:'+id, 4)` acotado. Cada cambio: guarda en LS, `actualizarIngredientes(true)`, muestra/oculta `avisoMuchos` (si `comensales >= desde`).
3. **Ingredientes**: por sección (`agruparPorSeccion`), título de sección en versalitas azafrán; filas con cantidad | nombre (+nota). Botón ancho «Descargar lista de la compra (PDF)» (icono SVG de documento). Debajo, «Antes de empezar» con los `antesDeEmpezar` en lista con marcador SVG/CSS (no emoji).
   - **Números que ruedan**: cada cantidad es `<span class="cant"><span class="cant-in">400 g</span></span>`. Al cambiar, si el texto cambia: se escribe el nuevo texto, se quita la clase `rueda-arriba`/`rueda-abajo`, `void el.offsetWidth`, se añade la clase según el sentido (+ → sube, − → baja). Animación de 320 ms (§8.5). Con `prefers-reduced-motion` no se añade clase.
4. **Horario**: control segmentado (dos botones ≥ 56 px, `aria-pressed`): «Empezar ahora» | «Quiero comer a las». En el segundo, `<input type="time" step="300">` grande (Chivo Mono 28 px). Valor por defecto de la hora de comer: `ahora + total` redondeado hacia arriba al siguiente cuarto de hora. Resumen destacado: «Empiezas a las **HH:MM** · Comes a las **HH:MM**» (+ « (mañana)» si `manana`). Si `noLlegas`: aviso en coral «No llegas: tendrías que haber empezado a las HH:MM. Si empiezas ya, comerías a las HH:MM.» con botón «Empezar ahora» que cambia el modo. En modo `ahora`, `setInterval(actualizarHorario, 30000)` mientras la vista esté abierta (guardar el id en `E.refresco`).
5. **Pasos**: dos bloques, «Preparación previa» y «Ejecución», cada uno con su duración total. Línea de tiempo vertical (línea a la izquierda con nodos circulares; nodos de ejecución en azafrán, de preparación en azul). Cada paso: hora (Chivo Mono, grande), nº, chip de duración, título (texto 700, 22 px), texto (18–19 px, interlineado 1.55), consejo opcional en callout (borde izquierdo azafrán, etiqueta «Consejo»). Las horas se actualizan con el horario.
6. **Barra fija inferior** (`position: sticky; bottom: 0` o `fixed` con hueco al final del contenido): botón «Comenzar» a todo el ancho (altura 64 px, fondo bogavante, texto 22 px 700) + texto pequeño «Terminas hacia las HH:MM». `padding-bottom: calc(12px + env(safe-area-inset-bottom))`.

### 7.5 PDF de la lista de la compra
```js
async function descargarPDF() {
  const JsPDF = window.jspdf && window.jspdf.jsPDF;
  if (!JsPDF) return avisar('No se ha podido cargar el generador de PDF. Revisa la conexión y vuelve a intentarlo.');
  const doc = construirPDF(JsPDF, E.receta, E.comensales, new Date());
  const filename = `lista-compra-${E.receta.id}-${E.comensales}.pdf`;
  let dl = null;
  try { if (window.claude && window.claude.use) dl = await conTiempo(window.claude.use('downloads'), 3000); } catch { dl = null; }
  if (dl) {
    try { await dl.save({ filename, data: doc.output('blob') }); avisar('Lista de la compra guardada.'); }
    catch (e) { avisar(/declin|cancel|denied/i.test(String(e && (e.name || e.message || e))) ? 'Descarga cancelada.' : 'No se pudo guardar el PDF.'); }
    return;
  }
  try { doc.save(filename); } catch { avisar('No se pudo guardar el PDF.'); }
}
// conTiempo(promesa, ms): Promise.race con un temporizador que resuelve null.
```
- `claude.use` solo se llama dentro del clic. Nunca bloquea el render.
- El botón se deshabilita mientras genera y muestra «Generando…».

`construirPDF(JsPDF, receta, n, fecha)` — A4 vertical, unidades mm, `new JsPDF({ unit:'mm', format:'a4' })`. **Todo texto pasa por `Nucleo.aLatin1()`.** Fuente `helvetica`.
- Banda superior: rectángulo 0,0 → 210×34 en azafrán `#F4A81D`; «Lista de la compra» (helvetica bold 22, color `#071722`) en x=18,y=16; nombre de la receta (bold 14) en y=26.
- Línea: `Para ${n} comensales · ${dd/mm/aaaa}` (normal 11, gris `#444`) en y=44. (El «·» es U+00B7, Latin-1, vale.)
- Por sección (`agruparPorSeccion`): título bold 13 color `#B8321F` con línea fina debajo; filas de 9 mm: casilla `doc.rect(18, y-4, 4.5, 4.5)`, cantidad bold 11 en x=27 (ancho máx. 32 mm), nombre normal 11 en x=62, nota normal 9 gris en la misma fila tras el nombre o en la línea siguiente si no cabe (`doc.splitTextToSize` con ancho 130 mm). «(opcional)» en gris.
- Salto de página si `y > 297 - 24`: `doc.addPage()`, `y = 22`.
- Al final, «Antes de empezar» (bold 11) y sus frases (normal 9.5, `splitTextToSize` 174 mm).
- Pie en todas las páginas (bucle `doc.getNumberOfPages()` / `doc.setPage(i)`): `Socarrat · recetario` a la izquierda y `Página i de N` a la derecha, normal 8, gris, y=289.

### 7.6 Audio (Web Audio)
```js
const Audio = { ctx:null,
  iniciar(){ try { this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)(); if (this.ctx.state === 'suspended') this.ctx.resume(); } catch { this.ctx = null; } },
  tono(freq, t0, dur, tipo='sine', vol=0.25) { /* oscilador + GainNode: 0 → vol en 10 ms, exponentialRamp a 0.0001 al final */ },
  campana(t=0), fin(t=0), tic(agudo), fanfarria(t=0) };
```
- `iniciar()` se llama **solo dentro del clic** en «Comenzar» (y en cualquier botón del modo cocina por si se suspendió).
- `campana`: 880 Hz 0,45 s + 1318,5 Hz empezando a +0,18 s 0,6 s (sine, con un triangle a la octava a volumen 0,05).
- `fin`: tres pitidos 988 Hz, 0,14 s cada uno, separados 0,22 s (square a vol 0,12).
- `tic`: 1400 Hz, 0,04 s, vol 0,08; `agudo` → 1900 Hz vol 0,12.
- `fanfarria`: arpegio 523,25 / 659,25 / 783,99 / 1046,5 Hz, 0,16 s cada uno, el último 0,6 s.
- Si `E.silencio` o `!ctx`, no suena nada.
- Ejecutar efectos en orden dentro de un lote: si hay `fin` y luego `campana`, la campana empieza en `ctx.currentTime + 0.8`.

### 7.7 Voz
```js
const Voz = { voz:null,
  elegir(){ try { const vs = speechSynthesis.getVoices(); this.voz = vs.find(v => /^es[-_]ES/i.test(v.lang)) || vs.find(v => /^es/i.test(v.lang)) || null; } catch {} },
  decir(texto, retrasoMs=0){ /* si silencio o no hay speechSynthesis → nada; cancel(); setTimeout → new SpeechSynthesisUtterance(texto), lang 'es-ES', voice=this.voz, rate 1, pitch 1, speak; todo en try */ },
  callar(){ try { speechSynthesis.cancel(); } catch {} } };
// al cargar: Voz.elegir(); try { speechSynthesis.addEventListener('voiceschanged', () => Voz.elegir()); } catch {}
```
- En el clic de «Comenzar», la primera locución se lanza **de forma síncrona** dentro del gestor del clic (iOS exige gesto); en ese primer paso `retrasoMs = 0` y la campana suena a la vez, a volumen menor.
- En los demás pasos, la voz empieza 900 ms después de la campana (1700 ms si hubo `fin` antes).

### 7.8 Modo cocina (controlador)
```js
let C = null;            // estado del reductor
let rafId = 0, intervalo = 0, wakeLock = null;
function comenzar() {
  Audio.iniciar();
  const v = Number(window.SOCARRAT_VELOCIDAD) || 1;
  aplicar(Nucleo.cocinaInicial(E.receta, Date.now(), v), true);
  abrirOverlay(); pedirWakeLock(); try { document.documentElement.requestFullscreen?.().catch(()=>{}); } catch {}
  intervalo = setInterval(() => despachar('TICK'), 250);
  bucleAnillo();
}
function despachar(tipo) { aplicar(Nucleo.cocinaReducir(C, { tipo, ahora: Date.now() })); }
function aplicar({ estado, efectos }, primero=false) { C = estado; ejecutarEfectos(efectos, primero); pintarCocina(); }
```
- `bucleAnillo()` con `requestAnimationFrame`: actualiza `stroke-dashoffset` del arco (`C = 2π·90 ≈ 565.49`; `offset = C * (1 - restante/duración)`), el reloj `formatoReloj`, la barra global (`cocinaProgreso`, `transform: scaleX()`), y la ETA (`formatoHora(cocinaEta)`) una vez por segundo.
- En `esperandoManual`: el reloj muestra el tiempo transcurrido creciendo (`'+01:23'`), subtítulo «sin tiempo fijo · ≈ 8 min», el arco hace la animación indeterminada (`.anillo-arco.manual`, rotación continua de un arco del 25 %), y el botón principal pasa a **«Hecho»** (fondo oliva). Se ocultan «+1 min» y se mantiene Anterior/Siguiente.
- En `corriendo`: botón principal «Pausa»; en `pausado`: «Seguir» y el reloj parpadea suavemente (opacidad 1 ↔ 0,45).
- Últimos 10 s: clase `.urgente` en el anillo (arco en bogavante, pulso de escala 1 → 1,03 cada segundo).
- `#ck-siguiente`: «Después: <título> · <duración>» o «Último paso».
- Fondo del overlay según fase: preparación → glow azul (`--mar-500`); ejecución → glow azafrán/bogavante.
- Al cambiar de paso: título y texto entran con animación `entrar-paso` (deslizar 24 px + fundido, 280 ms).
- Botones: `#ck-principal` → `PAUSAR` / `REANUDAR` / `HECHO` según estado; `#ck-anterior` → `ANTERIOR` (deshabilitado en el paso 1); `#ck-siguiente-btn` → `SIGUIENTE`; `#ck-voz` → `REPETIR_VOZ`; `#ck-mas` → `MAS_TIEMPO`; `#ck-silencio` → alterna `E.silencio`, guarda en LS, `Voz.callar()` si se silencia, actualiza `aria-pressed` e icono.
- **Salir** (`#ck-salir`, también tecla Escape): primer toque muestra en el propio botón/aviso «Pulsa otra vez para salir» durante 3 s; segundo toque dentro de ese plazo → `cerrarCocina()`: `clearInterval`, `cancelAnimationFrame`, `Voz.callar()`, liberar wake lock, `document.exitFullscreen?.()` en try, ocultar overlay, devolver el foco a «Comenzar».
- Teclado (solo con overlay abierto): Espacio → botón principal; ← Anterior; → Siguiente; M silencio.
- `terminado`: se muestra `#ck-final` («¡A la mesa!», vapor animado, botón «Volver a la receta» → `cerrarCocina()`).
- `document.addEventListener('visibilitychange', …)`: al volver a visible y con el modo abierto → `despachar('TICK')` inmediato y `pedirWakeLock()`.

```js
async function pedirWakeLock() { try { if ('wakeLock' in navigator && document.visibilityState === 'visible') wakeLock = await navigator.wakeLock.request('screen'); } catch { wakeLock = null; } }
```

### 7.9 Aviso
`avisar(texto)`: pone el texto en `#aviso`, lo muestra 4 s con animación y lo oculta. Nunca `alert`.

---

## 8. Diseño

### 8.1 Concepto
Mar mediterráneo de noche + hierro de paellera + azafrán y rojo de bogavante cocido. Formas circulares (la paellera) como motivo: anillos, nodos, tarjetas con esquinas muy redondeadas. Nada de crema/serif/terracota, nada de degradado morado-azul, nada de Inter/Space Grotesk.

### 8.2 Tokens (`:root` en el `<style>`)
```css
:root {
  /* Layout: una sola columna central (máx. 1080 px) que se abre como una paellera; en móvil, columna única con gutter 16–32 px */
  color-scheme: dark;
  --mar-900:#071722; --mar-800:#0C2433; --mar-700:#123247; --mar-500:#2B5A73;
  --hierro:#1C1917; --hierro-borde:#3A332E;
  --azafran:#F4A81D; --azafran-claro:#FFD27A;
  --bogavante:#E2492F; --coral:#FF7A59;
  --oliva:#A7B84A;
  --espuma:#EEF4F1; --niebla:#A9BFC8;
  --fuente-display:'Shrikhand', Georgia, serif;
  --fuente-texto:'Atkinson Hyperlegible', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --fuente-num:'Chivo Mono', ui-monospace, 'Cascadia Mono', monospace;
  --t-hero:clamp(56px, 17vw, 128px); --t-h1:clamp(36px, 9vw, 64px); --t-h2:clamp(26px, 6vw, 36px);
  --t-cuerpo:clamp(18px, 4.6vw, 20px); --t-peq:16px;
  --gutter:clamp(16px, 5vw, 32px); --ancho:1080px; --lectura:760px;
  --toque:56px; --toque-grande:72px;
  --radio-s:12px; --radio-m:20px; --radio-l:32px;
  --sombra:0 18px 40px -18px rgba(0,0,0,.65);
  --ease-salida:cubic-bezier(.2,.8,.2,1); --ease-rebote:cubic-bezier(.34,1.56,.64,1);
}
html, body { background:var(--mar-900); color:var(--espuma); }
body { margin:0; font:400 var(--t-cuerpo)/1.55 var(--fuente-texto); overflow-x:hidden; -webkit-text-size-adjust:100%; }
*, *::before, *::after { box-sizing:border-box; }
```
- `.fondo` fijo: `radial-gradient` cálido de azafrán (opacidad 0,12) arriba a la derecha + uno azul `--mar-500` abajo a la izquierda sobre `--mar-900`; 6–8 burbujas CSS (círculos de 4–10 px con borde `rgba(238,244,241,.12)`) subiendo lentamente (`@keyframes burbuja`, 14–26 s, infinito).
- Contraste: texto `--espuma` sobre `--mar-800` ≥ 12:1; `--niebla` solo para secundario; botones bogavante con texto `#fff` 700.

### 8.3 Tipografía
- Shrikhand solo en títulos (héroe, h1, nombres de tarjeta, «¡A la mesa!»). Nunca en párrafos ni botones.
- Atkinson Hyperlegible 400/700 para todo el texto y botones.
- Chivo Mono (con `font-variant-numeric: tabular-nums`) para relojes, horas, comensales y cantidades.

### 8.4 Componentes
- **Botón primario** (`.btn`): altura mínima 56 px (64 en «Comenzar»), padding 0 24px, radio 999px, fondo `--bogavante`, texto blanco 700 20px; `:active` scale .97; `:focus-visible` anillo 3px `--azafran-claro` con offset 3px.
- **Botón secundario**: fondo `--mar-700`, borde 1px `--mar-500`.
- **Stepper** de comensales: botones circulares 72 px, fondo `--hierro` con borde `--hierro-borde`, símbolo «−»/«+» dibujado con CSS o SVG de 28 px; al pulsar, rebote `--ease-rebote`.
- **Tarjeta**: fondo `--mar-800`, radio `--radio-l`, borde 1px `rgba(255,255,255,.06)`, sombra; hover (solo `@media (hover:hover)`): `translateY(-6px)`, borde con el `color` de la receta, la miniatura gira 6°; tap: scale .98.
- **Chip**: radio 999px, fondo `rgba(244,168,29,.12)`, texto `--azafran-claro`, 15px.
- **Callout consejo**: fondo `rgba(244,168,29,.08)`, borde izquierdo 4px `--azafran`, radio `--radio-s`.
- **Modo cocina**: overlay `position:fixed; inset:0; z-index:50`, fondo `--hierro` con glow de fase; barra superior con `padding-top: calc(10px + env(safe-area-inset-top))`; controles inferiores con `padding-bottom: calc(14px + env(safe-area-inset-bottom))`; botones de control 64 px de alto (principal 72 px, ancho doble), secundarios 56 px. Anillo de `min(72vw, 40vh, 360px)`; trazo 12 px, `stroke-linecap: round`, arco rotado -90°. Reloj Chivo Mono `clamp(56px, 18vw, 112px)`. Título de paso Shrikhand no: Atkinson 700 `clamp(26px, 7vw, 40px)`; texto `clamp(20px, 5.2vw, 24px)`. El cuerpo es desplazable (`overflow-y:auto`) entre barra y controles. En pantallas apaisadas bajas (`max-height: 500px`), anillo a la izquierda y texto a la derecha.

### 8.5 Animaciones (todas con keyframes que se ejecutan al instante; ninguna depende de IntersectionObserver)
- `subir`: `from {opacity:0; transform:translateY(24px)}` → `to {opacity:1; transform:none}`, 600 ms `--ease-salida`, `animation-fill-mode: both`, retardo `calc(var(--i) * 90ms)`. Portada: paellera (i=0, además `escala` .9→1), título (1), lema (2), tarjetas (3, 4…).
- `vapor`: tres trazos SVG; cada uno `translateY(0)→(-28px)`, opacidad 0→.6→0, 3,2 s infinito, desfases 0 / 1 / 2 s.
- `entrar-vista`: opacidad 0→1 y `translateY(12px)`→0 en 360 ms.
- `rueda-arriba`: `from {transform:translateY(60%); opacity:0}` → `to {none; 1}`, 320 ms; `rueda-abajo` igual con -60 %. El `.cant` tiene `display:inline-block; overflow:hidden`.
- Anillo: transición `stroke-dashoffset 250ms linear`; `.urgente` pulso; `.manual` rotación 1,6 s infinita.
- `entrar-paso`: `translateX(24px)` + fundido, 280 ms.
- Tarjetas: transición `transform .25s var(--ease-salida), border-color .25s`.
- `@media (prefers-reduced-motion: reduce)`: `*, *::before, *::after { animation-duration:.01ms !important; animation-iteration-count:1 !important; transition-duration:.01ms !important; }` y ocultar burbujas y vapor (`display:none`). El contenido queda siempre visible (los keyframes acaban en opacidad 1).

### 8.6 Responsive
- Base móvil 375 px: una columna, `padding-inline: var(--gutter)`, nada con ancho fijo > 343 px; SVG con `width:100%; height:auto; max-width:…`; textos largos con `overflow-wrap:anywhere` en nombres.
- ≥ 640 px: rejilla de 2; ≥ 1000 px: rejilla de 3 y receta en dos columnas (ingredientes | comensales + horario).
- Comprobación: `document.documentElement.scrollWidth <= document.documentElement.clientWidth` a 375 px en portada, receta y modo cocina.

---

## 9. Pasos de implementación (en orden)

1. **package.json** con
   ```json
   { "name":"socarrat", "private":true,
     "scripts": { "check":"node --check recetas.js && node --check nucleo.js && node --check app.js",
                  "test":"node --test tests/nucleo.test.js tests/recetas.test.js tests/cocina.test.js" } }
   ```
   Hecho: el archivo existe y es JSON válido.
2. **recetas.js** con el contenido de §5. Hecho: `node --check recetas.js` sin errores y `require('./recetas.js')` devuelve un array de 1 receta.
3. **nucleo.js** §6.1–6.5 (escalado, formatos, horario, Latin-1, validación). Hecho: `tests/nucleo.test.js` y `tests/recetas.test.js` en verde.
4. **nucleo.js** §6.6 (reductor de cocina, progreso, ETA). Hecho: `tests/cocina.test.js` en verde.
5. **index.html**: cabecera del Artifact, fuentes, `<style>` completo (tokens §8.2, componentes §8.4, animaciones §8.5, responsive §8.6), esqueleto §3, scripts. Hecho: se abre en local sin errores en consola (aunque `app.js` aún esté vacío).
6. **app.js** router + portada + SVG (§7.2–7.3). Hecho: `#inicio` muestra héroe animado y la tarjeta; pulsar la tarjeta lleva a `#arroz-con-bogavante`; un hash desconocido vuelve a `#inicio`.
7. **app.js** vista receta (§7.4): comensales, ingredientes con números que ruedan, aviso para ≥ 7, horario, pasos con horas, barra «Comenzar». Hecho: a 2 y 7 comensales las cantidades coinciden con la tabla de §5; cambiar a «Quiero comer a las 14:30» recalcula horas; recargar recuerda los comensales.
8. **app.js** PDF (§7.5). Hecho: en local, el clic descarga `lista-compra-arroz-con-bogavante-4.pdf` con acentos y «ñ» correctos, secciones y casillas.
9. **app.js** audio, voz, wake lock y modo cocina (§7.6–7.8). Hecho: con `window.SOCARRAT_VELOCIDAD = 30` en consola y «Comenzar», suena la campana, se lee el paso, la cuenta atrás baja, hay tics en los últimos 10 s, al llegar a 0 suenan tres pitidos y avanza; en «Corta el bogavante» espera a «Hecho»; Pausa/Seguir, Anterior, Siguiente, +1 min, Repetir voz y Silenciar funcionan; al acabar sale «¡A la mesa!».
10. **Revisión final**: comandos de §11 y checklist manual de §11. Hecho: todo en verde.

---

## 10. Casos límite y riesgos

| Caso | Tratamiento |
|---|---|
| `window.claude` no existe (local) o `use('downloads')` devuelve `null` o tarda | `doc.save()` (timeout de 3 s en `use`). |
| El usuario rechaza la descarga en el Artifact | Aviso «Descarga cancelada.» Sin reintentos automáticos. |
| jsPDF no carga (sin red) | Aviso; el resto de la web funciona. |
| Caracteres fuera de Latin-1 en el PDF (– … ≈) | `aLatin1()` antes de cada `doc.text`. Test dedicado. |
| `speechSynthesis` no existe o no hay voz es-ES | Try/catch; se usa la voz por defecto con `lang='es-ES'`; si no existe, solo sonidos. |
| iOS bloquea audio/voz sin gesto | `AudioContext` y primera locución dentro del clic de «Comenzar». |
| Pestaña en segundo plano / pantalla bloqueada | Tiempo por `finMs`; al volver, TICK inmediato; avanza como mucho un paso (D5); wake lock re-pedido. |
| Wake Lock o fullscreen no soportados/rechazados | Try/catch silencioso. |
| `localStorage` bloqueado | Envoltorio `LS` con try/catch; valores por defecto. |
| Hora de comer pasada o sin tiempo suficiente | D8: «mañana» o aviso «No llegas…». |
| Cruce de medianoche | Se usa `Date` completo; `formatoHora` solo muestra HH:MM. |
| Comensales fuera de 1–12 en LS | Se acota. |
| Flotantes (0,1+0,2) | `redondear()` con `toFixed(3)`. |
| Más de 6 comensales | `avisoMuchos` (dos cazuelas). |
| Pulsaciones dobles en «Siguiente» | El reductor es síncrono; cada pulsación avanza un paso (aceptable). |
| Seguridad del bogavante vivo | Texto con método de corte rápido y consejo del congelador; sin más detalle gráfico. |
| Flambeado | Texto avisa de apagar la campana y apartar la cara; alternativa sin flambear en el consejo. |

---

## 11. Tests y criterios de aceptación

### 11.1 Automáticos (deben pasar)
Desde `C:\SEACHAD\Cocina`:
```
node --check recetas.js
node --check nucleo.js
node --check app.js
node --test tests/nucleo.test.js tests/recetas.test.js tests/cocina.test.js
```
Los tests usan `node:test` y `node:assert/strict`, y `require('../nucleo.js')` / `require('../recetas.js')`.

**tests/nucleo.test.js**
- `escalado: tabla completa para 2, 4, 7 y 12 comensales` — compara `cantidadTexto` + `nombre` con la tabla de §5 (p. ej. 7 → `'530 g'` tomate, `'3,5 l'` fumet, `'4'` + `'Bogavantes'`; 12 → `'1,2 kg'` arroz, `'1 ½'` pimiento rojo + `'Pimientos rojos'`; 2 → `'½ cdta.'` pimentón, `'1'` + `'Bogavante'`).
- `formatearNumero: fracciones y decimales` — 0.5→`½`, 0.25→`¼`, 0.75→`¾`, 1.5→`1 ½`, 2→`2`, 1.2→`1,2`.
- `formatearCantidad: g→kg, ml→l, plurales` — 2000 ml→`2 l`, 2250 ml→`2,25 l`, 90 ml→`90 ml`, 1200 g→`1,2 kg`, 1 diente→`1 diente`, 4→`4 dientes`.
- `redondear evita errores de coma flotante` — `redondear(0.7, 0.1) === 0.7`.
- `alGusto y textoFijo no escalan` — Sal → `'Al gusto'` para 1 y 12; Perejil → `'Unas ramitas'`.
- `duraciones` — `duracionTotal(arroz) === 4470`; `formatoDuracion(4470) === '1 h 15 min'`; `formatoDuracion(30) === '30 s'`; `formatoDuracion(480) === '8 min'`.
- `formatoDuracionVoz` — 30, 60, 90, 150, 480, 100 con los textos de §6.2.
- `formatoReloj` — 61000 → `'01:01'`, 0 y negativos → `'00:00'`, 999 → `'00:01'`.
- `horario modo comer` — ahora = hoy 10:00, `'14:30'` → inicio `'13:15'`, paso `sellar` `'13:42'`, fin `'14:30'`, `manana=false`, `noLlegas=false`.
- `horario hora pasada = mañana` — ahora = hoy 22:00, `'14:00'` → `manana=true`, fin al día siguiente.
- `horario no llegas` — ahora = 14:00, `'14:30'` → `noLlegas=true`, `finSiEmpiezasYa` = 15:14:30.
- `horario modo ahora` — `pasos[0].inicio` = ahora; `fin - inicio === 4470000`.
- `aLatin1` — `'600–700 g…'` → `'600-700 g...'`; conserva `'ñ á ¿ ¡ ½'`; ningún carácter > U+00FF en la salida.
- `agruparPorSeccion` — orden Pescadería, Verdulería, Despensa, Bodega para el arroz.

**tests/recetas.test.js**
- `todas las recetas son válidas` — `validarReceta(r)` devuelve `[]` para cada receta.
- `ids de receta únicos y aptos para hash`.
- `arroz: 18 pasos, 5 de preparación, 4 manuales, total entre 4200 y 4800 s`.
- `arroz: todos los textos de ingredientes y antesDeEmpezar pasan por aLatin1 sin '?'` (es decir, no hay caracteres irrecuperables).

**tests/cocina.test.js** (usar `velocidad: 1`, `ahora` simulado)
- `inicial: paso 0 corriendo con efectos campana y voz` (la voz empieza por `'Paso 1 de 18. Remoja las ñoras.'`).
- `TICK antes de tiempo no avanza; tic en los últimos 10 s, uno por segundo, agudo en ≤3`.
- `TICK al vencer: efecto fin + avanza al paso 1 con finMs = ahora + 240000`.
- `TICK tras 10 minutos de ausencia avanza solo un paso`.
- `paso manual: estado esperandoManual, TICK no avanza, HECHO avanza`.
- `PAUSAR/REANUDAR conserva el tiempo restante`.
- `ANTERIOR reinicia el paso previo; en el paso 0 se queda en 0`.
- `MAS_TIEMPO suma 60 s (corriendo y pausado)`.
- `SIGUIENTE en el último paso → terminado con fanfarria`.
- `velocidad 30 divide las duraciones`.
- `cocinaProgreso` crece de 0 a 1 y `cocinaEta` en el inicio = ahora + 4470 s.

### 11.2 Manuales (los comprueba quien tenga navegador; anotar resultado)
1. Abrir `index.html` en local (doble clic): portada animada, sin errores en consola.
2. DevTools a 375 × 812: en portada, receta y modo cocina, `document.documentElement.scrollWidth <= document.documentElement.clientWidth` es `true`; gutter ≥ 16 px; botones ≥ 56 px.
3. Comensales 2 y 7: cantidades de la tabla de §5; los números ruedan; a 7 aparece el aviso de dos cazuelas; al recargar se recuerda el valor.
4. «Quiero comer a las» 14:30 → horas coherentes; hora ya pasada → «(mañana)».
5. PDF en local: se descarga, A4, acentos y «ñ» bien, casillas, secciones, pie con páginas.
6. Modo cocina con `window.SOCARRAT_VELOCIDAD = 30`: suena campana al empezar paso, tics finales, tres pitidos al acabar, avance automático, voz en español (si el sistema la tiene), pasos manuales esperan a «Hecho», Pausa/Seguir/Anterior/Siguiente/+1 min/Repetir voz/Silenciar funcionan, barra global y ETA avanzan, pantalla final.
7. Con `prefers-reduced-motion` emulado: sin animaciones y todo el contenido visible.
8. Búsqueda en los tres archivos: no aparecen `alert(`, `confirm(`, `prompt(`, `window.print`, ni URLs externas salvo `fonts.googleapis.com`, `fonts.gstatic.com` y `cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/`.
9. `index.html` empieza exactamente por `<title>Recetario Socarrat</title>` y no contiene `<!doctype`, `<html`, `<head` ni `<body`.

La tarea está cerrada cuando §11.1 está en verde y los puntos 1–9 de §11.2 están comprobados (o, si el agente no tiene navegador, anotados como pendientes para la sesión coordinadora).
