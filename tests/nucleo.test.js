'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const N = require('../nucleo.js');
const RECETAS = require('../recetas.js');
const arroz = RECETAS[0];

const TABLA = {
  bogavante: { 2: ['1','Bogavante'], 4: ['2','Bogavantes'], 7: ['4','Bogavantes'], 12: ['6','Bogavantes'] },
  fumet: { 2: ['1 l'], 4: ['2 l'], 7: ['3,5 l'], 12: ['6 l'] },
  tomate: { 2: ['150 g'], 4: ['300 g'], 7: ['530 g'], 12: ['900 g'] },
  cebolla: { 2: ['½','Cebolla'], 4: ['1','Cebolla'], 7: ['2','Cebollas'], 12: ['3','Cebollas'] },
  pverde: { 2: ['½'], 4: ['1'], 7: ['2'], 12: ['3'] },
  projo: { 2: ['½','Pimiento rojo'], 4: ['½','Pimiento rojo'], 7: ['1','Pimiento rojo'], 12: ['1 ½','Pimientos rojos'] },
  ajo: { 2: ['2 dientes'], 4: ['4 dientes'], 7: ['7 dientes'], 12: ['12 dientes'] },
  perejil: { 2: ['Unas ramitas'], 4: ['Unas ramitas'], 7: ['Unas ramitas'], 12: ['Unas ramitas'] },
  arroz: { 2: ['200 g'], 4: ['400 g'], 7: ['700 g'], 12: ['1,2 kg'] },
  aceite: { 2: ['40 ml'], 4: ['80 ml'], 7: ['140 ml'], 12: ['240 ml'] },
  nora: { 2: ['1'], 4: ['2'], 7: ['4'], 12: ['6'] },
  pimenton: { 2: ['½ cdta.'], 4: ['1 cdta.'], 7: ['2 cdtas.'], 12: ['3 cdtas.'] },
  azafran: { 2: ['10 hebras'], 4: ['20 hebras'], 7: ['35 hebras'], 12: ['60 hebras'] },
  sal: { 2: ['Al gusto'], 4: ['Al gusto'], 7: ['Al gusto'], 12: ['Al gusto'] },
  brandy: { 2: ['25 ml'], 4: ['50 ml'], 7: ['90 ml'], 12: ['150 ml'] }
};

test('escalado: tabla completa para 2, 4, 7 y 12 comensales', () => {
  for (const ing of arroz.ingredientes) {
    for (const n of [2, 4, 7, 12]) {
      const esperado = TABLA[ing.id][n];
      const l = N.escalarIngrediente(ing, n, arroz.racionesBase);
      assert.equal(l.cantidadTexto, esperado[0], ing.id + ' a ' + n);
      if (esperado[1]) assert.equal(l.nombre, esperado[1], ing.id + ' nombre a ' + n);
    }
  }
});

test('formatearNumero: fracciones y decimales', () => {
  assert.equal(N.formatearNumero(0.5), '½');
  assert.equal(N.formatearNumero(0.25), '¼');
  assert.equal(N.formatearNumero(0.75), '¾');
  assert.equal(N.formatearNumero(1.5), '1 ½');
  assert.equal(N.formatearNumero(2), '2');
  assert.equal(N.formatearNumero(2.25), '2,25');
  assert.equal(N.formatearNumero(1.2), '1,2');
});

test('formatearCantidad: g→kg, ml→l, plurales', () => {
  assert.equal(N.formatearCantidad(2000, 'ml'), '2 l');
  assert.equal(N.formatearCantidad(2250, 'ml'), '2,25 l');
  assert.equal(N.formatearCantidad(90, 'ml'), '90 ml');
  assert.equal(N.formatearCantidad(1200, 'g'), '1,2 kg');
  assert.equal(N.formatearCantidad(530, 'g'), '530 g');
  assert.equal(N.formatearCantidad(1, 'diente'), '1 diente');
  assert.equal(N.formatearCantidad(4, 'diente'), '4 dientes');
  assert.equal(N.formatearCantidad(0.5, 'cdta'), '½ cdta.');
  assert.equal(N.formatearCantidad(1.5, 'ud'), '1 ½');
});

test('redondear evita errores de coma flotante', () => {
  assert.equal(N.redondear(0.7, 0.1), 0.7);
  assert.equal(N.redondear(0.30000000004, 0.1), 0.3);
});

test('alGusto y textoFijo no escalan', () => {
  const sal = arroz.ingredientes.find((i) => i.id === 'sal');
  const pere = arroz.ingredientes.find((i) => i.id === 'perejil');
  for (const n of [1, 12]) {
    assert.equal(N.escalarIngrediente(sal, n, 4).cantidadTexto, 'Al gusto');
    assert.equal(N.escalarIngrediente(pere, n, 4).cantidadTexto, 'Unas ramitas');
  }
});

test('duraciones', () => {
  assert.equal(N.duracionTotal(arroz), 4470);
  assert.equal(N.formatoDuracion(4470), '1 h 15 min');
  assert.equal(N.formatoDuracion(3600), '1 h');
  assert.equal(N.formatoDuracion(30), '30 s');
  assert.equal(N.formatoDuracion(480), '8 min');
  assert.equal(N.formatoDuracion(90), '1 min 30 s');
});

test('formatoDuracionVoz', () => {
  assert.equal(N.formatoDuracionVoz(30), '30 segundos');
  assert.equal(N.formatoDuracionVoz(60), '1 minuto');
  assert.equal(N.formatoDuracionVoz(480), '8 minutos');
  assert.equal(N.formatoDuracionVoz(150), '2 minutos y medio');
  assert.equal(N.formatoDuracionVoz(90), '1 minuto y medio');
  assert.equal(N.formatoDuracionVoz(100), '1 minuto y 40 segundos');
});

test('formatoReloj', () => {
  assert.equal(N.formatoReloj(61000), '01:01');
  assert.equal(N.formatoReloj(0), '00:00');
  assert.equal(N.formatoReloj(-5000), '00:00');
  assert.equal(N.formatoReloj(999), '00:01');
  assert.equal(N.formatoReloj(3661000), '1:01:01');
});

function hoy(h, m, s) {
  const d = new Date();
  d.setHours(h, m, s || 0, 0);
  return d;
}

test('horario modo comer', () => {
  const ahora = hoy(10, 0);
  const h = N.calcularHorario(arroz, { modo: 'comer', ahora, horaComer: '14:30' });
  assert.equal(N.formatoHora(h.inicio), '13:15');
  const i = arroz.pasos.findIndex((p) => p.id === 'sellar');
  assert.equal(N.formatoHora(h.pasos[i].inicio), '13:42');
  assert.equal(N.formatoHora(h.fin), '14:30');
  assert.equal(h.manana, false);
  assert.equal(h.noLlegas, false);
});

test('horario hora pasada = mañana', () => {
  const ahora = hoy(22, 0);
  const h = N.calcularHorario(arroz, { modo: 'comer', ahora, horaComer: '14:00' });
  assert.equal(h.manana, true);
  assert.equal(N.formatoHora(h.fin), '14:00');
  assert.ok(h.fin.getTime() > ahora.getTime() + 15 * 3600 * 1000);
  assert.notEqual(h.fin.getDate(), ahora.getDate());
});

test('horario no llegas', () => {
  const ahora = hoy(14, 0);
  const h = N.calcularHorario(arroz, { modo: 'comer', ahora, horaComer: '14:30' });
  assert.equal(h.noLlegas, true);
  assert.equal(h.finSiEmpiezasYa.getTime(), ahora.getTime() + 4470000);
  assert.equal(N.formatoHora(h.finSiEmpiezasYa), '15:14');
  assert.equal(h.finSiEmpiezasYa.getSeconds(), 30);
});

test('horario modo ahora', () => {
  const ahora = hoy(10, 7, 20);
  const h = N.calcularHorario(arroz, { modo: 'ahora', ahora });
  assert.equal(h.pasos[0].inicio.getTime(), ahora.getTime());
  assert.equal(h.fin.getTime() - h.inicio.getTime(), 4470000);
  assert.equal(h.pasos[h.pasos.length - 1].fin.getTime(), h.fin.getTime());
});

test('aLatin1', () => {
  assert.equal(N.aLatin1('600–700 g…'), '600-700 g...');
  assert.equal(N.aLatin1('ñ á ¿ ¡ ½'), 'ñ á ¿ ¡ ½');
  assert.equal(N.aLatin1('≈ 8 min'), 'aprox.  8 min');
  assert.equal(N.aLatin1('a b'), 'a b');
  const salida = N.aLatin1('“hola” ‘x’ — € ñ');
  for (const c of salida) assert.ok(c.charCodeAt(0) <= 0xFF);
});

test('agruparPorSeccion', () => {
  const lineas = arroz.ingredientes.map((i) => N.escalarIngrediente(i, 4, 4));
  const g = N.agruparPorSeccion(lineas);
  assert.deepEqual(g.map((x) => x.seccion), ['Pescadería', 'Verdulería', 'Despensa', 'Bodega']);
  const raras = N.agruparPorSeccion([{ seccion: 'Zeta' }, { seccion: 'Bodega' }, { seccion: 'Alfa' }]);
  assert.deepEqual(raras.map((x) => x.seccion), ['Bodega', 'Zeta', 'Alfa']);
});
