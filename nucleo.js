// nucleo.js — lógica pura sin DOM (escalado, formatos, horario, Latin-1, validación, modo cocina).
(function (raiz) {
  'use strict';
  const ORDEN_SECCIONES = ['Pescadería','Carnicería','Verdulería','Lácteos y huevos','Despensa','Bodega','Otros'];
  const REDONDEO_DEFECTO = { g:5, ml:25, ud:0.5, diente:1, cdta:0.5, hebra:5 };
  const UNIDADES = { g:['g','g'], ml:['ml','ml'], diente:['diente','dientes'], cdta:['cdta.','cdtas.'], hebra:['hebra','hebras'], ud:['',''] };
  const ESCALAS = ['lineal', 'porPersonaCeil', 'fijo'];
  const FASES = ['preparacion', 'ejecucion'];

  // ---------- 6.1 Escalado ----------
  function redondear(valor, paso) {
    return Number((Math.round(valor / paso) * paso).toFixed(3));
  }

  function escalarValor(ing, comensales, racionesBase) {
    if (ing.alGusto || ing.escala === 'fijo') return ing.cantidad == null ? null : ing.cantidad;
    if (ing.escala === 'porPersonaCeil') return Math.ceil(comensales / ing.porCada);
    const bruto = ing.cantidad * comensales / racionesBase;
    const paso = ing.redondeo != null ? ing.redondeo : (REDONDEO_DEFECTO[ing.unidad] != null ? REDONDEO_DEFECTO[ing.unidad] : 1);
    const v = redondear(bruto, paso);
    return Math.max(ing.minimo != null ? ing.minimo : paso, v);
  }

  function decimalComa(v, max) {
    let s = Number(v.toFixed(max === undefined ? 2 : max)).toString();
    return s.replace('.', ',');
  }

  // Fracciones: ½ siempre; ¼ y ¾ solo cuando no hay parte entera (2,25 se escribe en decimal).
  function formatearNumero(v, soloDecimal) {
    if (soloDecimal) return decimalComa(v);
    const entero = Math.floor(v + 0.001);
    const frac = v - entero;
    const cerca = (x) => Math.abs(frac - x) < 0.001;
    let glifo = '';
    if (cerca(0.5)) glifo = '½';
    else if (entero === 0 && cerca(0.25)) glifo = '¼';
    else if (entero === 0 && cerca(0.75)) glifo = '¾';
    if (glifo) return entero === 0 ? glifo : entero + ' ' + glifo;
    if (Math.abs(frac) < 0.001) return String(entero);
    return decimalComa(v);
  }

  function formatearCantidad(valor, unidad) {
    if (valor == null) return '';
    if (unidad === 'g') return valor >= 1000 ? formatearNumero(valor / 1000, true) + ' kg' : formatearNumero(valor, true) + ' g';
    if (unidad === 'ml') return valor >= 1000 ? formatearNumero(valor / 1000, true) + ' l' : formatearNumero(valor, true) + ' ml';
    if (unidad === 'diente' || unidad === 'cdta' || unidad === 'hebra') {
      const u = UNIDADES[unidad];
      return formatearNumero(valor) + ' ' + (valor <= 1 ? u[0] : u[1]);
    }
    return formatearNumero(valor);
  }

  function escalarIngrediente(ing, comensales, racionesBase) {
    const valor = escalarValor(ing, comensales, racionesBase);
    let cantidadTexto;
    if (ing.alGusto) cantidadTexto = 'Al gusto';
    else if (ing.textoFijo) cantidadTexto = ing.textoFijo;
    else cantidadTexto = formatearCantidad(valor, ing.unidad);
    const plural = ing.unidad === 'ud' && valor > 1 && ing.nombrePlural;
    return {
      id: ing.id,
      cantidadTexto,
      nombre: plural ? ing.nombrePlural : ing.nombre,
      nota: ing.nota || '',
      opcional: !!ing.opcional,
      seccion: ing.seccion,
      valor
    };
  }

  function agruparPorSeccion(lineas) {
    const grupos = [];
    const mapa = {};
    lineas.forEach((l) => {
      if (!mapa[l.seccion]) { mapa[l.seccion] = { seccion: l.seccion, lineas: [] }; grupos.push(mapa[l.seccion]); }
      mapa[l.seccion].lineas.push(l);
    });
    const idx = (s) => { const i = ORDEN_SECCIONES.indexOf(s); return i < 0 ? ORDEN_SECCIONES.length : i; };
    // sort estable: las desconocidas conservan el orden de aparición al final
    return grupos.map((g, i) => ({ g, i })).sort((a, b) => (idx(a.g.seccion) - idx(b.g.seccion)) || (a.i - b.i)).map((x) => x.g);
  }

  // ---------- 6.2 Duraciones y formatos ----------
  function duracionPaso(p) { return p.duracionSeg != null ? p.duracionSeg : p.duracionEstimadaSeg; }
  function duracionTotal(receta) { return receta.pasos.reduce((a, p) => a + duracionPaso(p), 0); }

  function formatoDuracion(seg) {
    if (seg < 60) return Math.round(seg) + ' s';
    if (seg >= 3600) {
      const min = Math.round(seg / 60);
      const h = Math.floor(min / 60), m = min % 60;
      return m === 0 ? h + ' h' : h + ' h ' + m + ' min';
    }
    if (seg % 60 === 0) return (seg / 60) + ' min';
    return Math.floor(seg / 60) + ' min ' + (seg % 60) + ' s';
  }

  function formatoDuracionVoz(seg) {
    const plural = (n, s, p) => n + ' ' + (n === 1 ? s : p);
    if (seg < 60) return plural(seg, 'segundo', 'segundos');
    if (seg >= 3600) {
      const h = Math.floor(seg / 3600), m = Math.round((seg % 3600) / 60);
      return plural(h, 'hora', 'horas') + (m ? ' y ' + plural(m, 'minuto', 'minutos') : '');
    }
    const m = Math.floor(seg / 60), s = seg % 60;
    if (s === 0) return plural(m, 'minuto', 'minutos');
    if (s === 30) return plural(m, 'minuto', 'minutos') + ' y medio';
    return plural(m, 'minuto', 'minutos') + ' y ' + plural(s, 'segundo', 'segundos');
  }

  function formatoReloj(ms) {
    const t = Math.max(0, Math.ceil(ms / 1000));
    const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
    const dos = (n) => String(n).padStart(2, '0');
    return h > 0 ? h + ':' + dos(m) + ':' + dos(s) : dos(m) + ':' + dos(s);
  }

  function formatoHora(date) {
    return String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0');
  }

  // ---------- 6.3 Horario ----------
  function calcularHorario(receta, opc) {
    const modo = opc.modo, ahora = opc.ahora, horaComer = opc.horaComer;
    const total = duracionTotal(receta) * 1000;
    let inicio, fin, manana = false, noLlegas = false;
    const finSiEmpiezasYa = new Date(ahora.getTime() + total);
    if (modo === 'comer') {
      const partes = String(horaComer || '14:30').split(':');
      const objetivo = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), Number(partes[0]) || 0, Number(partes[1]) || 0, 0, 0);
      if (objetivo.getTime() <= ahora.getTime()) {
        // se suma un día natural (no 24 h fijas) para respetar cambios de hora
        objetivo.setDate(objetivo.getDate() + 1);
        manana = true;
      }
      fin = objetivo;
      inicio = new Date(objetivo.getTime() - total);
      noLlegas = inicio.getTime() < ahora.getTime();
    } else {
      inicio = new Date(ahora.getTime());
      fin = new Date(inicio.getTime() + total);
    }
    let acum = 0;
    const pasos = receta.pasos.map((p) => {
      const ini = new Date(inicio.getTime() + acum * 1000);
      acum += duracionPaso(p);
      return { inicio: ini, fin: new Date(inicio.getTime() + acum * 1000) };
    });
    return { inicio, fin, pasos, manana, noLlegas, finSiEmpiezasYa };
  }

  // ---------- 6.4 Latin-1 ----------
  function aLatin1(s) {
    let r = '';
    for (const c of String(s)) {
      switch (c) {
        case '–': case '—': r += '-'; break;
        case '‘': case '’': r += "'"; break;
        case '“': case '”': r += '"'; break;
        case '…': r += '...'; break;
        case '≈': r += 'aprox. '; break;
        case ' ': case ' ': r += ' '; break;
        default: r += c.codePointAt(0) > 0xFF ? '?' : c;
      }
    }
    return r;
  }

  // ---------- 6.5 Validación ----------
  function validarReceta(r) {
    const err = [];
    const vacio = (v) => typeof v !== 'string' || v.trim() === '';
    if (!r || typeof r !== 'object') return ['receta no es un objeto'];
    if (vacio(r.id) || !/^[a-z0-9-]+$/.test(r.id)) err.push('id inválido');
    ['nombre', 'subtitulo', 'dificultad', 'ilustracion', 'color'].forEach((k) => { if (vacio(r[k])) err.push('falta ' + k); });
    if (['Fácil', 'Media', 'Difícil'].indexOf(r.dificultad) < 0) err.push('dificultad inválida');
    if (!(r.racionesBase > 0)) err.push('racionesBase inválido');
    if (!Array.isArray(r.antesDeEmpezar)) err.push('antesDeEmpezar debe ser array');
    if (!Array.isArray(r.ingredientes) || !r.ingredientes.length) err.push('sin ingredientes');
    if (!Array.isArray(r.pasos) || !r.pasos.length) err.push('sin pasos');
    if (r.avisoMuchos && (!(r.avisoMuchos.desde > 0) || vacio(r.avisoMuchos.texto))) err.push('avisoMuchos inválido');
    const idsIng = {};
    (r.ingredientes || []).forEach((i, n) => {
      const c = 'ingrediente ' + (i && i.id ? i.id : '#' + n);
      if (!i || vacio(i.id)) { err.push(c + ': falta id'); return; }
      if (idsIng[i.id]) err.push(c + ': id duplicado');
      idsIng[i.id] = true;
      if (vacio(i.nombre)) err.push(c + ': falta nombre');
      if (ORDEN_SECCIONES.indexOf(i.seccion) < 0) err.push(c + ': sección inválida');
      if (ESCALAS.indexOf(i.escala) < 0) err.push(c + ': escala inválida');
      if (i.escala === 'porPersonaCeil' && !(i.porCada > 0)) err.push(c + ': porCada inválido');
      if (!i.alGusto && !i.textoFijo && !(i.cantidad > 0)) err.push(c + ': cantidad inválida');
    });
    const idsPaso = {};
    let vistaEjecucion = false, hayPrep = false, hayEj = false;
    (r.pasos || []).forEach((p, n) => {
      const c = 'paso ' + (p && p.id ? p.id : '#' + n);
      if (!p || vacio(p.id)) { err.push(c + ': falta id'); return; }
      if (idsPaso[p.id]) err.push(c + ': id duplicado');
      idsPaso[p.id] = true;
      if (FASES.indexOf(p.fase) < 0) err.push(c + ': fase inválida');
      if (p.fase === 'preparacion') { hayPrep = true; if (vistaEjecucion) err.push(c + ': preparación después de ejecución'); }
      if (p.fase === 'ejecucion') { hayEj = true; vistaEjecucion = true; }
      const fija = p.duracionSeg > 0;
      const manual = p.duracionSeg === null && p.duracionEstimadaSeg > 0;
      if (!fija && !manual) err.push(c + ': duración inválida');
      ['titulo', 'texto', 'voz'].forEach((k) => { if (vacio(p[k])) err.push(c + ': falta ' + k); });
    });
    if (!hayPrep) err.push('falta algún paso de preparación');
    if (!hayEj) err.push('falta algún paso de ejecución');
    return err;
  }

  // ---------- 6.6 Modo cocina ----------
  function durMs(paso, vel) { return paso.duracionSeg * 1000 / vel; }

  function textoVoz(est, i) {
    const pasos = est.receta.pasos, p = pasos[i];
    return 'Paso ' + (i + 1) + ' de ' + pasos.length + '. ' + p.titulo + '. ' + p.voz +
      (p.duracionSeg ? ' Tiempo: ' + formatoDuracionVoz(p.duracionSeg) + '.' : '');
  }

  function iniciarPaso(est, i, ahora) {
    const paso = est.receta.pasos[i];
    const n = Object.assign({}, est, { indice: i, inicioPasoMs: ahora, ultimoTic: 11, restanteMs: null, pausadoDesde: null });
    if (paso.duracionSeg) { n.estado = 'corriendo'; n.finMs = ahora + durMs(paso, est.velocidad); n.durTotalMs = durMs(paso, est.velocidad); }
    else { n.estado = 'esperandoManual'; n.finMs = null; n.durTotalMs = null; }
    return { estado: n, efectos: [{ tipo: 'campana' }, { tipo: 'voz', texto: textoVoz(est, i) }] };
  }

  function terminar(est) {
    const n = Object.assign({}, est, { estado: 'terminado', finMs: null, restanteMs: null, pausadoDesde: null });
    return { estado: n, efectos: [{ tipo: 'fanfarria' }, { tipo: 'voz', texto: 'Listo. ¡Que aproveche!' }] };
  }

  function cocinaInicial(receta, ahora, velocidad) {
    const est = {
      receta, velocidad: velocidad || 1, indice: 0, estado: 'corriendo',
      finMs: null, restanteMs: null, inicioPasoMs: ahora, ultimoTic: 11, pausadoDesde: null
    };
    return iniciarPaso(est, 0, ahora);
  }

  function avanzar(est, ahora) {
    return est.indice >= est.receta.pasos.length - 1 ? terminar(est) : iniciarPaso(est, est.indice + 1, ahora);
  }

  function cocinaReducir(est, accion) {
    const ahora = accion.ahora;
    const sinCambios = { estado: est, efectos: [] };
    const st = est.estado;
    switch (accion.tipo) {
      case 'TICK': {
        if (st !== 'corriendo') return sinCambios;
        const restante = est.finMs - ahora;
        if (restante <= 0) {
          const r = avanzar(est, ahora);
          return { estado: r.estado, efectos: [{ tipo: 'fin' }].concat(r.efectos) };
        }
        const s = Math.ceil(restante / 1000);
        if (s >= 1 && s <= 10 && s < est.ultimoTic) {
          return { estado: Object.assign({}, est, { ultimoTic: s }), efectos: [{ tipo: 'tic', agudo: s <= 3 }] };
        }
        return sinCambios;
      }
      case 'PAUSAR':
        if (st !== 'corriendo') return sinCambios;
        return { estado: Object.assign({}, est, { estado: 'pausado', restanteMs: est.finMs - ahora, pausadoDesde: ahora, finMs: null }), efectos: [{ tipo: 'callar' }] };
      case 'REANUDAR':
        if (st !== 'pausado') return sinCambios;
        return { estado: Object.assign({}, est, { estado: 'corriendo', finMs: ahora + est.restanteMs, restanteMs: null, pausadoDesde: null }), efectos: [] };
      case 'SIGUIENTE':
      case 'HECHO':
        if (st === 'terminado') return sinCambios;
        return avanzar(est, ahora);
      case 'ANTERIOR':
        if (st === 'terminado') return sinCambios;
        return iniciarPaso(est, Math.max(0, est.indice - 1), ahora);
      case 'MAS_TIEMPO': {
        const extra = 60000 / est.velocidad;
        if (st === 'corriendo') {
          const finMs = est.finMs + extra;
          return { estado: Object.assign({}, est, { finMs, durTotalMs: est.durTotalMs + extra, ultimoTic: (finMs - ahora) > 10000 ? 11 : est.ultimoTic }), efectos: [] };
        }
        if (st === 'pausado') {
          const restanteMs = est.restanteMs + extra;
          return { estado: Object.assign({}, est, { restanteMs, durTotalMs: est.durTotalMs + extra, ultimoTic: restanteMs > 10000 ? 11 : est.ultimoTic }), efectos: [] };
        }
        return sinCambios;
      }
      case 'REPETIR_VOZ':
        if (st === 'terminado') return sinCambios;
        return { estado: est, efectos: [{ tipo: 'voz', texto: textoVoz(est, est.indice) }] };
      default:
        return sinCambios;
    }
  }

  // Milisegundos reales que faltan del paso actual (manual: estimación - transcurrido).
  function cocinaRestanteMs(est, ahora) {
    const paso = est.receta.pasos[est.indice];
    if (est.estado === 'corriendo') return Math.max(0, est.finMs - ahora);
    if (est.estado === 'pausado') return Math.max(0, est.restanteMs);
    if (est.estado === 'esperandoManual') {
      return Math.max(0, paso.duracionEstimadaSeg * 1000 / est.velocidad - (ahora - est.inicioPasoMs));
    }
    return 0;
  }

  function cocinaProgreso(est, ahora) {
    if (est.estado === 'terminado') return 1;
    const pasos = est.receta.pasos;
    const total = duracionTotal(est.receta);
    let previo = 0;
    for (let i = 0; i < est.indice; i++) previo += duracionPaso(pasos[i]);
    const dur = duracionPaso(pasos[est.indice]);
    const restanteVirt = cocinaRestanteMs(est, ahora) * est.velocidad / 1000;
    let trans;
    if (est.estado === 'esperandoManual') trans = (ahora - est.inicioPasoMs) * est.velocidad / 1000;
    else trans = dur - restanteVirt;
    trans = Math.min(dur, Math.max(0, trans));
    return Math.min(1, (previo + trans) / total);
  }

  function cocinaEta(est, ahora) {
    if (est.estado === 'terminado') return new Date(ahora);
    const pasos = est.receta.pasos;
    let ms = cocinaRestanteMs(est, ahora);
    for (let i = est.indice + 1; i < pasos.length; i++) ms += duracionPaso(pasos[i]) * 1000 / est.velocidad;
    return new Date(ahora + ms);
  }

  const api = { ORDEN_SECCIONES, redondear, escalarValor, formatearNumero, formatearCantidad, escalarIngrediente,
    agruparPorSeccion, duracionPaso, duracionTotal, calcularHorario, formatoHora, formatoDuracion,
    formatoDuracionVoz, formatoReloj, aLatin1, validarReceta, cocinaInicial, cocinaReducir,
    cocinaProgreso, cocinaEta, cocinaRestanteMs };
  raiz.Nucleo = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
