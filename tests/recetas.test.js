'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const N = require('../nucleo.js');
const RECETAS = require('../recetas.js');

test('todas las recetas son válidas', () => {
  assert.ok(Array.isArray(RECETAS) && RECETAS.length >= 1);
  for (const r of RECETAS) assert.deepEqual(N.validarReceta(r), [], r.id);
});

test('ids de receta únicos y aptos para hash', () => {
  const ids = RECETAS.map((r) => r.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.match(id, /^[a-z0-9-]+$/);
});

test('recetas nuevas: cantidades base y escalado de 1 a 12 comensales', () => {
  for (const id of ['cocido-madrileno', 'paella-valenciana', 'fabada-asturiana']) {
    const r = RECETAS.find((x) => x.id === id);
    assert.ok(r, id);
    for (const ingrediente of r.ingredientes.filter((i) => i.cantidad !== null)) {
      assert.equal(N.escalarIngrediente(ingrediente, r.racionesBase, r.racionesBase).valor, ingrediente.cantidad, id + ': ' + ingrediente.nombre);
      let anterior = 0;
      for (let personas = 1; personas <= 12; personas++) {
        const valor = N.escalarIngrediente(ingrediente, personas, r.racionesBase).valor;
        assert.ok(Number.isFinite(valor) && valor > 0 && valor >= anterior, id + ': ' + ingrediente.nombre);
        anterior = valor;
      }
    }
  }
});

test('arroz: 18 pasos, 5 de preparación, 4 manuales, total entre 4200 y 4800 s', () => {
  const r = RECETAS.find((x) => x.id === 'arroz-con-bogavante');
  assert.equal(r.pasos.length, 18);
  assert.equal(r.pasos.filter((p) => p.fase === 'preparacion').length, 5);
  assert.equal(r.pasos.filter((p) => p.duracionSeg === null).length, 4);
  const t = N.duracionTotal(r);
  assert.ok(t >= 4200 && t <= 4800);
});

test("arroz: los textos pasan por aLatin1 sin '?'", () => {
  const r = RECETAS.find((x) => x.id === 'arroz-con-bogavante');
  const textos = [r.nombre, r.subtitulo].concat(r.antesDeEmpezar, [r.avisoMuchos.texto]);
  for (const i of r.ingredientes) textos.push(i.nombre, i.nombrePlural || '', i.nota || '', i.textoFijo || '');
  for (const p of r.pasos) textos.push(p.titulo, p.texto, p.voz, p.consejo || '');
  for (const t of textos) assert.ok(!N.aLatin1(t).includes('?'), t);
});
