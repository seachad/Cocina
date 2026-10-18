// recetas.js — datos de recetas. Para añadir una receta, añade un objeto a RECETAS.
var RECETAS = [
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
},
{
  "id": "cocido-madrileno",
  "nombre": "Cocido madrileño",
  "subtitulo": "A fuego lento y en tres vuelcos: sopa de fideos, garbanzos con verduras y carnes bien tiernas.",
  "dificultad": "Media",
  "racionesBase": 4,
  "ilustracion": "cocido",
  "color": "var(--oliva)",
  "antesDeEmpezar": [
    "Deja los garbanzos en remojo con abundante agua durante 12 horas antes de empezar. El remojo no está incluido en el horario.",
    "Usa una olla de al menos 6 litros y un cazo para la sopa. Esta receta es para olla tradicional, sin presión.",
    "La cocción depende del garbanzo y de la carne. El horario es orientativo: comprueba la ternura antes de continuar."
  ],
  "avisoMuchos": {
    "desde": 7,
    "texto": "Para más de 6 comensales reparte en dos ollas. Mantén los ingredientes cubiertos de agua y comprueba la ternura en ambas."
  },
  "ingredientes": [
    {
      "id": "garbanzos",
      "nombre": "Garbanzos secos",
      "cantidad": 320,
      "unidad": "g",
      "seccion": "Despensa",
      "escala": "lineal",
      "redondeo": 10
    },
    {
      "id": "morcillo",
      "nombre": "Morcillo de ternera",
      "cantidad": 500,
      "unidad": "g",
      "seccion": "Carnicería",
      "escala": "lineal",
      "redondeo": 10
    },
    {
      "id": "pollo",
      "nombre": "Pollo con hueso",
      "cantidad": 400,
      "unidad": "g",
      "seccion": "Carnicería",
      "escala": "lineal",
      "redondeo": 10
    },
    {
      "id": "tocino",
      "nombre": "Tocino fresco",
      "cantidad": 150,
      "unidad": "g",
      "seccion": "Carnicería",
      "escala": "lineal",
      "redondeo": 10
    },
    {
      "id": "jamon",
      "nombre": "Hueso de jamón",
      "cantidad": 1,
      "unidad": "ud",
      "seccion": "Carnicería",
      "escala": "lineal",
      "redondeo": 0.5,
      "nota": "pequeño; pide que lo corten si haces menos raciones"
    },
    {
      "id": "chorizo",
      "nombre": "Chorizo",
      "cantidad": 150,
      "unidad": "g",
      "seccion": "Carnicería",
      "escala": "lineal",
      "redondeo": 10
    },
    {
      "id": "patata",
      "nombre": "Patata",
      "cantidad": 400,
      "unidad": "g",
      "seccion": "Verdulería",
      "escala": "lineal",
      "redondeo": 10
    },
    {
      "id": "zanahoria",
      "nombre": "Zanahoria",
      "cantidad": 200,
      "unidad": "g",
      "seccion": "Verdulería",
      "escala": "lineal",
      "redondeo": 10
    },
    {
      "id": "repollo",
      "nombre": "Repollo",
      "cantidad": 400,
      "unidad": "g",
      "seccion": "Verdulería",
      "escala": "lineal",
      "redondeo": 10
    },
    {
      "id": "fideos",
      "nombre": "Fideos finos",
      "cantidad": 100,
      "unidad": "g",
      "seccion": "Despensa",
      "escala": "lineal",
      "redondeo": 10
    },
    {
      "id": "agua",
      "nombre": "Agua",
      "cantidad": 3000,
      "unidad": "ml",
      "seccion": "Otros",
      "escala": "lineal",
      "redondeo": 50,
      "nota": "aproximada; añade la necesaria para cubrir"
    },
    {
      "id": "sal",
      "nombre": "Sal",
      "cantidad": null,
      "unidad": null,
      "seccion": "Despensa",
      "escala": "fijo",
      "alGusto": true
    }
  ],
  "pasos": [
    {
      "id": "escurrir",
      "fase": "preparacion",
      "titulo": "Escurre los garbanzos",
      "duracionSeg": 180,
      "texto": "Escurre los garbanzos que dejaste en remojo y enjuágalos. Si usas una malla de cocción, mételos dentro dejando espacio para que crezcan.",
      "voz": "Escurre y enjuaga los garbanzos remojados."
    },
    {
      "id": "preparar-verduras",
      "fase": "preparacion",
      "titulo": "Prepara las verduras",
      "duracionSeg": 480,
      "texto": "Pela las patatas y las zanahorias. Deja las patatas enteras si son pequeñas o córtalas en mitades grandes. Lava el repollo y córtalo en trozos. Reserva todo.",
      "voz": "Pela patatas y zanahorias. Lava y corta el repollo."
    },
    {
      "id": "espumar",
      "fase": "ejecucion",
      "titulo": "Arranca el caldo y espuma",
      "duracionSeg": 1200,
      "texto": "Pon el morcillo, el tocino y el hueso de jamón en la olla con el agua fría. Lleva a ebullición suave y retira con una espumadera la espuma de la superficie.",
      "voz": "Pon ternera, tocino y hueso de jamón en agua fría. Calienta y retira la espuma.",
      "consejo": "No añadas sal todavía: el jamón y el chorizo aportan la suya."
    },
    {
      "id": "garbanzos",
      "fase": "ejecucion",
      "titulo": "Añade los garbanzos y cuece despacio",
      "duracionSeg": 5400,
      "texto": "Con el agua ya caliente, incorpora los garbanzos. Baja el fuego y deja un hervor muy suave, con la tapa entreabierta. Vigila de vez en cuando y añade agua caliente si dejan de estar cubiertos.",
      "voz": "Añade los garbanzos al caldo caliente. Cuece a fuego suave noventa minutos y vigila el agua."
    },
    {
      "id": "pollo",
      "fase": "ejecucion",
      "titulo": "Incorpora el pollo y el chorizo",
      "duracionSeg": 1800,
      "texto": "Añade el pollo y el chorizo. Mantén el hervor suave durante media hora y retira la grasa que vaya subiendo si quieres un caldo más ligero.",
      "voz": "Añade el pollo y el chorizo. Cuece suavemente media hora."
    },
    {
      "id": "verduras",
      "fase": "ejecucion",
      "titulo": "Añade las verduras",
      "duracionSeg": 1800,
      "texto": "Incorpora patatas, zanahorias y repollo. Cuece suavemente unos 30 minutos, hasta que las verduras estén tiernas. Si la olla está muy llena, cuece el repollo aparte con un poco del caldo.",
      "voz": "Añade las verduras y cuece treinta minutos a fuego suave."
    },
    {
      "id": "ternura",
      "fase": "ejecucion",
      "titulo": "Comprueba garbanzos y carnes",
      "duracionSeg": null,
      "duracionEstimadaSeg": 300,
      "texto": "Prueba un garbanzo: debe estar cremoso por dentro, sin centro duro. El morcillo debe ceder al pincharlo y el pollo estar bien cocinado junto al hueso. Si falta cocción, retira lo que ya esté tierno y sigue cociendo el resto. Pulsa «Hecho» solo cuando esté listo.",
      "voz": "Comprueba que los garbanzos y las carnes estén tiernos. Si hace falta, prolonga la cocción. Pulsa hecho cuando estén listos.",
      "consejo": "El tiempo extra retrasará la hora de servir."
    },
    {
      "id": "separar",
      "fase": "ejecucion",
      "titulo": "Separa los vuelcos y prepara la sopa",
      "duracionSeg": 300,
      "texto": "Saca las carnes y las verduras a una fuente y los garbanzos a otra. Mantenlos tapados y calientes con un poco de caldo. Cuela caldo en un cazo: calcula unos 250 ml por persona. Prueba y ajusta la sal.",
      "voz": "Separa carnes, verduras y garbanzos. Cuela el caldo para la sopa y prueba la sal."
    },
    {
      "id": "fideos",
      "fase": "ejecucion",
      "titulo": "Cuece los fideos",
      "duracionSeg": 240,
      "texto": "Lleva el caldo del cazo a ebullición y añade los fideos. Cuece el tiempo indicado en el paquete; la referencia es de 4 minutos. Usa «+1 min» si necesitan más.",
      "voz": "Añade los fideos al caldo hirviendo y cuécelos según el paquete."
    },
    {
      "id": "servir",
      "fase": "ejecucion",
      "titulo": "Sirve en tres vuelcos",
      "duracionSeg": null,
      "duracionEstimadaSeg": 180,
      "texto": "Sirve primero la sopa. Lleva después los garbanzos con las verduras y por último las carnes troceadas. Pulsa «Hecho» al servir.",
      "voz": "Sirve la sopa, después garbanzos y verduras y finalmente las carnes."
    }
  ]
},
{
  "id": "paella-valenciana",
  "nombre": "Paella valenciana",
  "subtitulo": "Arroz seco de pollo y conejo, judía verde y garrofón, con azafrán y reposo corto.",
  "dificultad": "Media",
  "racionesBase": 4,
  "ilustracion": "paella",
  "color": "var(--azafran)",
  "antesDeEmpezar": [
    "Usa una paella de 38–42 cm para 4 personas, con una fuente de calor que alcance bien toda la base.",
    "El garrofón de esta receta es cocido y escurrido. Si lo compras seco, remójalo y cuécelo antes: ese tiempo no está incluido.",
    "La evaporación cambia con el recipiente y el fuego. Ten agua caliente de reserva y consulta el tiempo del arroz."
  ],
  "avisoMuchos": {
    "desde": 7,
    "texto": "Para más de 6 comensales usa dos paellas con fuegos adecuados. No amontones el arroz en una capa gruesa."
  },
  "ingredientes": [
    {
      "id": "arroz",
      "nombre": "Arroz bomba",
      "cantidad": 400,
      "unidad": "g",
      "seccion": "Despensa",
      "escala": "lineal",
      "redondeo": 10
    },
    {
      "id": "pollo",
      "nombre": "Pollo troceado",
      "cantidad": 600,
      "unidad": "g",
      "seccion": "Carnicería",
      "escala": "lineal",
      "redondeo": 10
    },
    {
      "id": "conejo",
      "nombre": "Conejo troceado",
      "cantidad": 400,
      "unidad": "g",
      "seccion": "Carnicería",
      "escala": "lineal",
      "redondeo": 10
    },
    {
      "id": "judia",
      "nombre": "Judía verde plana",
      "cantidad": 300,
      "unidad": "g",
      "seccion": "Verdulería",
      "escala": "lineal",
      "redondeo": 10
    },
    {
      "id": "garrofon",
      "nombre": "Garrofón cocido",
      "cantidad": 200,
      "unidad": "g",
      "seccion": "Despensa",
      "escala": "lineal",
      "redondeo": 10,
      "nota": "peso escurrido"
    },
    {
      "id": "tomate",
      "nombre": "Tomate maduro",
      "cantidad": 200,
      "unidad": "g",
      "seccion": "Verdulería",
      "escala": "lineal",
      "redondeo": 10
    },
    {
      "id": "aceite",
      "nombre": "Aceite de oliva virgen extra",
      "cantidad": 80,
      "unidad": "ml",
      "seccion": "Despensa",
      "escala": "lineal",
      "redondeo": 10
    },
    {
      "id": "pimenton",
      "nombre": "Pimentón dulce",
      "cantidad": 1,
      "unidad": "cdta",
      "seccion": "Despensa",
      "escala": "lineal",
      "redondeo": 0.5
    },
    {
      "id": "azafran",
      "nombre": "Azafrán en hebras",
      "cantidad": 20,
      "unidad": "hebra",
      "seccion": "Despensa",
      "escala": "lineal",
      "redondeo": 5
    },
    {
      "id": "agua",
      "nombre": "Agua",
      "cantidad": 1600,
      "unidad": "ml",
      "seccion": "Otros",
      "escala": "lineal",
      "redondeo": 50,
      "nota": "más agua caliente para reponer lo evaporado antes del arroz"
    },
    {
      "id": "sal",
      "nombre": "Sal",
      "cantidad": null,
      "unidad": null,
      "seccion": "Despensa",
      "escala": "fijo",
      "alGusto": true
    }
  ],
  "pasos": [
    {
      "id": "verduras",
      "fase": "preparacion",
      "titulo": "Prepara las verduras",
      "duracionSeg": 480,
      "texto": "Lava las judías, retira las puntas y córtalas en trozos de unos 4 cm. Ralla el tomate y desecha la piel. Escurre el garrofón cocido.",
      "voz": "Trocea las judías, ralla el tomate y escurre el garrofón."
    },
    {
      "id": "carne",
      "fase": "preparacion",
      "titulo": "Prepara la carne y el azafrán",
      "duracionSeg": 300,
      "texto": "Seca los trozos de pollo y conejo y sálalos ligeramente. Desmenuza el azafrán en un cuenco con un poco de agua caliente. Deja medidos el arroz y el agua.",
      "voz": "Seca y sala las carnes. Pon el azafrán en un poco de agua caliente."
    },
    {
      "id": "dorar",
      "fase": "ejecucion",
      "titulo": "Dora el pollo y el conejo",
      "duracionSeg": 1200,
      "texto": "Calienta el aceite en la paella a fuego medio-alto. Añade la carne y dórala por todos sus lados, girándola con pinzas. Busca un dorado uniforme, sin quemar el fondo.",
      "voz": "Dora el pollo y el conejo por todos sus lados durante unos veinte minutos.",
      "consejo": "Un buen dorado da profundidad al caldo."
    },
    {
      "id": "judias",
      "fase": "ejecucion",
      "titulo": "Sofríe las judías",
      "duracionSeg": 300,
      "texto": "Aparta la carne hacia el borde y añade las judías en el centro. Rehoga cinco minutos, removiendo las judías y vigilando la carne.",
      "voz": "Añade las judías en el centro y sofríe cinco minutos."
    },
    {
      "id": "tomate",
      "fase": "ejecucion",
      "titulo": "Reduce el tomate",
      "duracionSeg": 360,
      "texto": "Añade el tomate rallado y cocina hasta que pierda el agua y se vuelva espeso. Mézclalo con la carne y las judías.",
      "voz": "Cocina el tomate hasta que espese y mézclalo con la carne y las judías."
    },
    {
      "id": "pimenton",
      "fase": "ejecucion",
      "titulo": "Añade el pimentón",
      "duracionSeg": 30,
      "texto": "Baja el fuego, incorpora el pimentón y remueve durante 30 segundos. Ten el agua preparada para cortar el sofrito antes de que se queme.",
      "voz": "Añade el pimentón a fuego bajo y remueve treinta segundos."
    },
    {
      "id": "caldo",
      "fase": "ejecucion",
      "titulo": "Forma el caldo en la paella",
      "duracionSeg": 1200,
      "texto": "Vierte el agua medida y la infusión de azafrán. Fíjate en el nivel inicial del líquido. Deja hervir suavemente unos 20 minutos para cocinar la carne y formar el caldo.",
      "voz": "Añade el agua y el azafrán. Fíjate en el nivel y deja hervir veinte minutos."
    },
    {
      "id": "nivel",
      "fase": "ejecucion",
      "titulo": "Ajusta el caldo antes del arroz",
      "duracionSeg": null,
      "duracionEstimadaSeg": 180,
      "texto": "Comprueba que la carne esté cocinada. Repón con agua caliente hasta el nivel inicial, añade el garrofón y prueba la sal. Lleva de nuevo a hervor. Pulsa «Hecho» cuando esté listo.",
      "voz": "Comprueba la carne, repón el agua evaporada, añade el garrofón y ajusta la sal. Pulsa hecho.",
      "consejo": "La referencia es de cuatro partes de agua por una de arroz bomba en peso; ajusta a tu marca y recipiente."
    },
    {
      "id": "arroz",
      "fase": "ejecucion",
      "titulo": "Reparte el arroz",
      "duracionSeg": 60,
      "texto": "Añade el arroz y distribúyelo en una capa uniforme entre la carne y las verduras. A partir de este momento no remuevas con cuchara.",
      "voz": "Añade y reparte el arroz. Desde ahora no lo remuevas."
    },
    {
      "id": "fuerte",
      "fase": "ejecucion",
      "titulo": "Cuece a fuego vivo",
      "duracionSeg": 480,
      "texto": "Mantén un hervor vivo y uniforme durante 8 minutos. Si el fuego no alcanza los bordes, gira con cuidado la paella para repartir el calor.",
      "voz": "Cuece ocho minutos a fuego vivo y reparte el calor por toda la base."
    },
    {
      "id": "suave",
      "fase": "ejecucion",
      "titulo": "Termina a fuego suave",
      "duracionSeg": 600,
      "texto": "Baja el fuego y cocina unos 10 minutos más. El caldo debe ir desapareciendo. Si el arroz sigue duro y se seca antes de tiempo, añade un poco de agua muy caliente por los bordes.",
      "voz": "Baja el fuego y cocina diez minutos más. Si sigue duro y seco, añade un poco de agua caliente."
    },
    {
      "id": "punto",
      "fase": "ejecucion",
      "titulo": "Comprueba el grano",
      "duracionSeg": null,
      "duracionEstimadaSeg": 120,
      "texto": "Prueba el arroz: debe estar cocinado y entero, sin centro duro ni caldo libre. Si falta cocción, continúa unos minutos vigilando la humedad. Apaga el fuego cuando esté listo y pulsa «Hecho».",
      "voz": "Prueba el arroz y prolonga la cocción si hace falta. Apaga el fuego y pulsa hecho.",
      "consejo": "No fuerces el socarrat: un fondo quemado amarga toda la paella."
    },
    {
      "id": "reposo",
      "fase": "ejecucion",
      "titulo": "Deja reposar",
      "duracionSeg": 300,
      "texto": "Retira del fuego y deja reposar 5 minutos. Si el grano está todavía un poco firme, cubre ligeramente con una tapa; si está en su punto, deja destapado.",
      "voz": "Retira del fuego y deja reposar cinco minutos."
    },
    {
      "id": "servir",
      "fase": "ejecucion",
      "titulo": "A la mesa",
      "duracionSeg": null,
      "duracionEstimadaSeg": 120,
      "texto": "Sirve el arroz repartiendo pollo, conejo y verduras entre los platos. Pulsa «Hecho» cuando esté servido.",
      "voz": "Reparte arroz, carnes y verduras. Que aproveche."
    }
  ]
},
{
  "id": "fabada-asturiana",
  "nombre": "Fabada asturiana",
  "subtitulo": "Fabes cremosas, compango y caldo ligado: una olla tranquila, sin prisas y sin remover.",
  "dificultad": "Fácil",
  "racionesBase": 4,
  "ilustracion": "fabada",
  "color": "var(--coral)",
  "antesDeEmpezar": [
    "Remoja las fabes en abundante agua fría durante 12 horas antes de empezar. El remojo queda fuera del horario.",
    "Usa una olla ancha para que las fabes no se amontonen. El hervor debe ser muy suave para conservar la piel.",
    "El compango lleva chorizo, morcilla asturiana y panceta. Si la panceta es salada, desálala antes siguiendo las indicaciones del producto.",
    "El tiempo de cocción depende de las fabes: calcula unas 2–3 horas de hervor y comprueba la ternura."
  ],
  "avisoMuchos": {
    "desde": 7,
    "texto": "Para más de 6 comensales reparte en dos ollas anchas. Vigila el nivel de agua y la ternura de las fabes en cada una."
  },
  "ingredientes": [
    {
      "id": "fabes",
      "nombre": "Fabes secas",
      "cantidad": 400,
      "unidad": "g",
      "seccion": "Despensa",
      "escala": "lineal",
      "redondeo": 10,
      "nota": "de la Granja, para fabada"
    },
    {
      "id": "chorizo",
      "nombre": "Chorizo asturiano",
      "cantidad": 180,
      "unidad": "g",
      "seccion": "Carnicería",
      "escala": "lineal",
      "redondeo": 10
    },
    {
      "id": "morcilla",
      "nombre": "Morcilla asturiana",
      "cantidad": 180,
      "unidad": "g",
      "seccion": "Carnicería",
      "escala": "lineal",
      "redondeo": 10
    },
    {
      "id": "panceta",
      "nombre": "Panceta curada",
      "cantidad": 200,
      "unidad": "g",
      "seccion": "Carnicería",
      "escala": "lineal",
      "redondeo": 10,
      "nota": "desalada si hace falta"
    },
    {
      "id": "azafran",
      "nombre": "Azafrán en hebras",
      "cantidad": 15,
      "unidad": "hebra",
      "seccion": "Despensa",
      "escala": "lineal",
      "redondeo": 5
    },
    {
      "id": "agua",
      "nombre": "Agua",
      "cantidad": 1500,
      "unidad": "ml",
      "seccion": "Otros",
      "escala": "lineal",
      "redondeo": 50,
      "nota": "aproximada; la necesaria para cubrir dos dedos por encima"
    },
    {
      "id": "sal",
      "nombre": "Sal",
      "cantidad": null,
      "unidad": null,
      "seccion": "Despensa",
      "escala": "fijo",
      "alGusto": true
    }
  ],
  "pasos": [
    {
      "id": "escurrir",
      "fase": "preparacion",
      "titulo": "Escurre y revisa las fabes",
      "duracionSeg": 300,
      "texto": "Escurre las fabes remojadas, enjuágalas con cuidado y retira las que estén dañadas. Colócalas en una olla ancha.",
      "voz": "Escurre, enjuaga y revisa las fabes. Ponlas en una olla ancha."
    },
    {
      "id": "compango",
      "fase": "preparacion",
      "titulo": "Prepara el compango",
      "duracionSeg": 180,
      "texto": "Ten a mano el chorizo, la morcilla y la panceta desalada si correspondía. Déjalos enteros para que no se deshagan durante la cocción.",
      "voz": "Prepara el chorizo, la morcilla y la panceta. Déjalos enteros."
    },
    {
      "id": "arranque",
      "fase": "ejecucion",
      "titulo": "Cubre con agua fría y espuma",
      "duracionSeg": 900,
      "texto": "Añade el compango a las fabes y cubre con agua fría unos dos dedos por encima. Calienta hasta que empiece a hervir y retira la espuma con cuidado. No remuevas con cuchara.",
      "voz": "Cubre las fabes y el compango con agua fría. Calienta y retira la espuma."
    },
    {
      "id": "azafran",
      "fase": "ejecucion",
      "titulo": "Añade el azafrán y baja el fuego",
      "duracionSeg": 120,
      "texto": "Desmenuza el azafrán en un poco del caldo caliente y devuélvelo a la olla. Baja el fuego hasta lograr un hervor apenas perceptible. Deja la tapa entreabierta.",
      "voz": "Añade el azafrán desmenuzado en caldo. Baja a un hervor muy suave."
    },
    {
      "id": "primera-coccion",
      "fase": "ejecucion",
      "titulo": "Primera cocción suave",
      "duracionSeg": 3600,
      "texto": "Cuece durante una hora a fuego muy suave. Vigila cada cierto tiempo: las fabes deben seguir cubiertas. Si baja el agua, añade un poco de agua fría para recuperar el nivel y suavizar el hervor. Mueve la olla por las asas.",
      "voz": "Cuece suavemente una hora. Vigila el agua y mueve la olla por las asas, sin cuchara."
    },
    {
      "id": "segunda-coccion",
      "fase": "ejecucion",
      "titulo": "Continúa la cocción",
      "duracionSeg": 3600,
      "texto": "Continúa otra hora con el mismo hervor suave. Comprueba el nivel de agua de vez en cuando. Si la morcilla ya está tierna, puedes retirarla a un plato tapado para que no se rompa y devolverla al final.",
      "voz": "Sigue cociendo otra hora a fuego muy suave. Vigila el agua y retira la morcilla si ya está tierna."
    },
    {
      "id": "ternura",
      "fase": "ejecucion",
      "titulo": "Comprueba la ternura",
      "duracionSeg": null,
      "duracionEstimadaSeg": 1200,
      "texto": "Prueba varias fabes: deben estar mantecosas, sin centro duro. Si todavía ofrecen resistencia, sigue cociendo suavemente y comprueba cada 10–15 minutos; pueden necesitar otra hora. Pulsa «Hecho» solo cuando estén tiernas.",
      "voz": "Prueba varias fabes. Sigue cociendo si están duras y pulsa hecho cuando estén cremosas.",
      "consejo": "Este paso es manual: la hora de servir se ajustará si necesitas más tiempo."
    },
    {
      "id": "ligar",
      "fase": "ejecucion",
      "titulo": "Ajusta el caldo y la sal",
      "duracionSeg": 300,
      "texto": "Retira el exceso de grasa de la superficie. Prueba antes de salar. Si el caldo está muy líquido, aplasta unas pocas fabes con caldo en un cuenco y devuélvelas a la olla. Reincorpora la morcilla si la retiraste y calienta todo suavemente.",
      "voz": "Retira el exceso de grasa, prueba la sal y liga el caldo con unas fabes aplastadas si hace falta."
    },
    {
      "id": "reposo",
      "fase": "ejecucion",
      "titulo": "Deja reposar la fabada",
      "duracionSeg": 1200,
      "texto": "Apaga el fuego y deja reposar la olla tapada durante 20 minutos. El caldo se asentará y quedará más ligado.",
      "voz": "Apaga el fuego y deja reposar veinte minutos con la olla tapada."
    },
    {
      "id": "servir",
      "fase": "ejecucion",
      "titulo": "Trocea el compango y sirve",
      "duracionSeg": null,
      "duracionEstimadaSeg": 240,
      "texto": "Saca el compango, córtalo en porciones y repártelo junto con las fabes y su caldo en platos hondos. Pulsa «Hecho» cuando termines.",
      "voz": "Trocea el compango y sirve con las fabes y su caldo. Que aproveche."
    }
  ]
}
];
if (typeof window !== 'undefined') window.RECETAS = RECETAS;
if (typeof module === 'object' && module.exports) module.exports = RECETAS;
