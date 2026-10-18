'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const N = require('../nucleo.js');
const arroz = require('../recetas.js')[0];

const T0 = 1_000_000_000_000;
const tipos = (ef) => ef.map((e) => e.tipo);
const R = (est, tipo, ahora) => N.cocinaReducir(est, { tipo, ahora });
const iniciar = (vel) => N.cocinaInicial(arroz, T0, vel || 1).estado;

test('inicial: paso 0 corriendo con efectos campana y voz', () => {
  const r = N.cocinaInicial(arroz, T0, 1);
  assert.equal(r.estado.estado, 'corriendo');
  assert.equal(r.estado.indice, 0);
  assert.equal(r.estado.finMs, T0 + 120000);
  assert.deepEqual(tipos(r.efectos), ['campana', 'voz']);
  assert.ok(r.efectos[1].texto.startsWith('Paso 1 de 18. Remoja las ñoras.'));
  assert.ok(r.efectos[1].texto.endsWith('Tiempo: 2 minutos.'));
});

test('TICK antes de tiempo no avanza; tic en los últimos 10 s, uno por segundo, agudo en ≤3', () => {
  let est = iniciar();
  let r = R(est, 'TICK', T0 + 60000);
  assert.deepEqual(r.efectos, []);
  assert.equal(r.estado.indice, 0);
  // recorre los últimos 11 segundos de 250 en 250 ms
  const tics = [];
  for (let t = T0 + 108000; t < T0 + 120000; t += 250) {
    r = R(est, 'TICK', t);
    est = r.estado;
    r.efectos.forEach((e) => tics.push(e));
  }
  assert.equal(tics.length, 10);
  assert.ok(tics.every((e) => e.tipo === 'tic'));
  assert.deepEqual(tics.map((e) => e.agudo), [false, false, false, false, false, false, false, true, true, true]);
});

test('TICK al vencer: efecto fin + avanza al paso 1 con finMs = ahora + 240000', () => {
  const est = iniciar();
  const ahora = T0 + 120000;
  const r = R(est, 'TICK', ahora);
  assert.equal(r.estado.indice, 1);
  assert.equal(r.estado.finMs, ahora + 240000);
  assert.deepEqual(tipos(r.efectos), ['fin', 'campana', 'voz']);
});

test('TICK tras 10 minutos de ausencia avanza solo un paso', () => {
  const est = iniciar();
  const ahora = T0 + 600000;
  const r = R(est, 'TICK', ahora);
  assert.equal(r.estado.indice, 1);
  assert.equal(r.estado.finMs, ahora + 240000);
});

test('paso manual: esperandoManual, TICK no avanza, HECHO avanza', () => {
  let est = iniciar();
  est = R(est, 'SIGUIENTE', T0).estado;
  est = R(est, 'SIGUIENTE', T0).estado;
  est = R(est, 'SIGUIENTE', T0).estado; // índice 3 = cortar-bogavante
  assert.equal(est.indice, 3);
  assert.equal(est.estado, 'esperandoManual');
  assert.equal(est.finMs, null);
  const r = R(est, 'TICK', T0 + 99999999);
  assert.equal(r.estado.indice, 3);
  assert.deepEqual(r.efectos, []);
  const h = R(r.estado, 'HECHO', T0 + 1000);
  assert.equal(h.estado.indice, 4);
  assert.equal(h.estado.estado, 'corriendo');
});

test('PAUSAR/REANUDAR conserva el tiempo restante', () => {
  let est = iniciar();
  let r = R(est, 'PAUSAR', T0 + 20000);
  assert.equal(r.estado.estado, 'pausado');
  assert.equal(r.estado.restanteMs, 100000);
  assert.deepEqual(tipos(r.efectos), ['callar']);
  // un TICK en pausa no hace nada
  assert.deepEqual(R(r.estado, 'TICK', T0 + 500000).efectos, []);
  r = R(r.estado, 'REANUDAR', T0 + 50000);
  assert.equal(r.estado.estado, 'corriendo');
  assert.equal(r.estado.finMs, T0 + 150000);
});

test('ANTERIOR reinicia el paso previo; en el paso 0 se queda en 0', () => {
  let est = iniciar();
  let r = R(est, 'ANTERIOR', T0 + 5000);
  assert.equal(r.estado.indice, 0);
  assert.equal(r.estado.finMs, T0 + 5000 + 120000);
  est = R(est, 'SIGUIENTE', T0 + 1000).estado;
  assert.equal(est.indice, 1);
  r = R(est, 'ANTERIOR', T0 + 2000);
  assert.equal(r.estado.indice, 0);
  assert.equal(r.estado.finMs, T0 + 2000 + 120000);
});

test('MAS_TIEMPO suma 60 s (corriendo y pausado)', () => {
  const est = iniciar();
  const r = R(est, 'MAS_TIEMPO', T0 + 1000);
  assert.equal(r.estado.finMs, est.finMs + 60000);
  const p = R(est, 'PAUSAR', T0 + 1000).estado;
  const r2 = R(p, 'MAS_TIEMPO', T0 + 2000);
  assert.equal(r2.estado.restanteMs, p.restanteMs + 60000);
});

test('MAS_TIEMPO en pausado reinicia ultimoTic si el restante supera 10 s y amplía durTotalMs', () => {
  let est = iniciar();
  est = R(est, 'TICK', T0 + 111000).estado; // ultimoTic = 9
  assert.equal(est.ultimoTic, 9);
  est = R(est, 'PAUSAR', T0 + 111000).estado; // restante 9000
  const r = R(est, 'MAS_TIEMPO', T0 + 112000);
  assert.equal(r.estado.restanteMs, 69000);
  assert.equal(r.estado.ultimoTic, 11);
  assert.equal(r.estado.durTotalMs, 180000);
});

test('SIGUIENTE en el último paso → terminado con fanfarria', () => {
  let est = iniciar();
  for (let i = 0; i < 17; i++) est = R(est, 'SIGUIENTE', T0).estado;
  assert.equal(est.indice, 17);
  const r = R(est, 'SIGUIENTE', T0);
  assert.equal(r.estado.estado, 'terminado');
  assert.ok(tipos(r.efectos).includes('fanfarria'));
  assert.equal(r.efectos.find((e) => e.tipo === 'voz').texto, 'Listo. ¡Que aproveche!');
  assert.equal(N.cocinaProgreso(r.estado, T0), 1);
});

test('velocidad 30 divide las duraciones', () => {
  const r = N.cocinaInicial(arroz, T0, 30);
  assert.equal(r.estado.finMs, T0 + 4000);
  const mas = R(r.estado, 'MAS_TIEMPO', T0);
  assert.equal(mas.estado.finMs, T0 + 4000 + 2000);
});

test('cocinaProgreso crece de 0 a 1 y cocinaEta en el inicio = ahora + 4470 s', () => {
  let est = iniciar();
  assert.equal(N.cocinaProgreso(est, T0), 0);
  assert.equal(N.cocinaEta(est, T0).getTime(), T0 + 4470000);
  let anterior = 0;
  for (let i = 0; i < 17; i++) {
    est = R(est, 'SIGUIENTE', T0 + i).estado;
    const p = N.cocinaProgreso(est, T0 + i);
    assert.ok(p > anterior && p < 1);
    anterior = p;
  }
  // mitad del primer paso
  const e0 = iniciar();
  assert.ok(Math.abs(N.cocinaProgreso(e0, T0 + 60000) - 60 / 4470) < 1e-9);
  assert.equal(N.cocinaEta(e0, T0 + 60000).getTime(), T0 + 60000 + 4410000);
});
