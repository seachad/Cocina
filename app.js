// app.js — DOM, router, PDF, audio, voz, wake lock y modo cocina del recetario Socarrat.
(function () {
  'use strict';

  const RECETAS = window.RECETAS || [];
  const Nucleo = window.Nucleo;
  const $ = (id) => document.getElementById(id);

  // ---------- 7.1 Estado y persistencia ----------
  const E = { receta: null, comensales: 4, modo: 'ahora', horaComer: '14:30', silencio: false, refresco: null };
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } }
  };
  E.silencio = LS.get('socarrat:silencio', false) === true;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function sinMovimiento() {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  }

  // ---------- Aviso ----------
  let avisoT = 0;
  function avisar(texto) {
    const a = $('aviso');
    a.textContent = texto;
    a.hidden = false;
    a.style.animation = 'none'; void a.offsetWidth; a.style.animation = '';
    clearTimeout(avisoT);
    avisoT = setTimeout(() => { a.hidden = true; }, 4000);
  }

  // ---------- Ilustraciones SVG ----------
  function svgBogavante(extra) {
    return '<svg viewBox="0 0 200 200" ' + (extra || '') + ' aria-hidden="true">' +
      '<g fill="none" stroke="#FF7A59" stroke-width="3" stroke-linecap="round"><path d="M92 52 C70 30 50 28 34 8"/><path d="M108 52 C130 30 150 28 166 8"/></g>' +
      '<g stroke="#B8321F" stroke-width="3" stroke-linecap="round"><path d="M84 96 L56 112"/><path d="M84 112 L58 130"/><path d="M116 96 L144 112"/><path d="M116 112 L142 130"/></g>' +
      '<g fill="#E2492F" stroke="#B8321F" stroke-width="3">' +
        '<path d="M86 74 C64 70 50 58 48 44" fill="none" stroke-width="9" stroke-linecap="round"/>' +
        '<path d="M114 74 C136 70 150 58 152 44" fill="none" stroke-width="9" stroke-linecap="round"/>' +
        '<ellipse cx="46" cy="32" rx="14" ry="24" transform="rotate(-18 46 32)"/>' +
        '<ellipse cx="154" cy="32" rx="14" ry="24" transform="rotate(18 154 32)"/>' +
        '<ellipse cx="100" cy="78" rx="21" ry="28"/>' +
        '<ellipse cx="100" cy="112" rx="19" ry="10"/><ellipse cx="100" cy="127" rx="18" ry="10"/><ellipse cx="100" cy="141" rx="16" ry="9"/><ellipse cx="100" cy="154" rx="14" ry="8"/>' +
        '<ellipse cx="86" cy="172" rx="8" ry="13" transform="rotate(12 86 172)"/><ellipse cx="114" cy="172" rx="8" ry="13" transform="rotate(-12 114 172)"/><ellipse cx="100" cy="174" rx="8" ry="14"/>' +
      '</g>' +
      '<path d="M46 12 L46 34 M154 12 L154 34" stroke="#B8321F" stroke-width="3" stroke-linecap="round"/>' +
      '<ellipse cx="92" cy="70" rx="6" ry="12" fill="#FF7A59" opacity=".5"/>' +
      '<circle cx="92" cy="56" r="3.5" fill="#071722"/><circle cx="108" cy="56" r="3.5" fill="#071722"/>' +
      '</svg>';
  }

  function svgHeroe() {
    let puntos = '';
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let i = 0; i < 90; i++) {
      const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd());
      const x = 200 + Math.cos(a) * 138 * r, y = 172 + Math.sin(a) * 82 * r;
      puntos += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (2 + rnd() * 2.2).toFixed(1) + '" fill="' + (rnd() > .3 ? '#F4A81D' : '#FFD27A') + '"/>';
    }
    return '<svg class="heroe-svg subir-escala" style="--i:0" viewBox="0 0 400 300" role="img" aria-label="Paellera con arroz y un bogavante">' +
      '<ellipse cx="200" cy="262" rx="150" ry="16" fill="rgba(0,0,0,.35)"/>' +
      '<ellipse cx="22" cy="172" rx="22" ry="10" fill="#1C1917" stroke="#3A332E" stroke-width="3"/><ellipse cx="378" cy="172" rx="22" ry="10" fill="#1C1917" stroke="#3A332E" stroke-width="3"/>' +
      '<ellipse cx="200" cy="172" rx="178" ry="104" fill="#1C1917" stroke="#3A332E" stroke-width="4"/>' +
      '<ellipse cx="200" cy="172" rx="150" ry="88" fill="#2a2118"/>' + puntos +
      '<g transform="translate(142 114) scale(.58)">' + svgBogavante('width="200" height="200"').replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '') + '</g>' +
      '<g class="vapor"><path d="M150 96 C138 82 162 72 150 56"/><path d="M200 90 C188 76 212 66 200 50"/><path d="M250 96 C238 82 262 72 250 56"/></g>' +
      '</svg>';
  }

  function svgGuiso(tipo, extra) {
    const paella = tipo === 'paella';
    let ingredientes = '';
    for (let i = 0; i < 24; i++) {
      const angulo = i * 2.4, radio = 12 + Math.sqrt(i / 24) * 54;
      const x = 100 + Math.cos(angulo) * radio, y = 105 + Math.sin(angulo) * radio * .52;
      ingredientes += '<ellipse cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="' + (paella ? 5 : 7) + '" ry="4" fill="' + (paella ? '#FFD27A' : tipo === 'fabada' ? '#EEE0B9' : '#E4BA70') + '"/>';
    }
    return '<svg viewBox="0 0 200 200" ' + (extra || '') + ' aria-hidden="true"><path d="M28 106H10V125H32M172 106H190V125H168" fill="none" stroke="#A9BFC8" stroke-width="7" stroke-linejoin="round"/><path d="M28 104Q28 169 100 170Q172 169 172 104" fill="#1C1917" stroke="#3A332E" stroke-width="4"/><ellipse cx="100" cy="104" rx="73" ry="43" fill="' + (paella ? '#9D641D' : '#98512D') + '" stroke="#3A332E" stroke-width="5"/>' + ingredientes + '<path d="M64 90l20 10M115 119l22-12" stroke="' + (paella ? '#A7B84A' : '#E2492F') + '" stroke-width="12" stroke-linecap="round"/><g class="vapor"><path d="M70 57Q58 45 70 30"/><path d="M100 52Q88 40 100 25"/><path d="M130 57Q118 45 130 30"/></g></svg>';
  }
  const ILUSTRACIONES = { bogavante: svgBogavante, cocido: (extra) => svgGuiso('cocido', extra), paella: (extra) => svgGuiso('paella', extra), fabada: (extra) => svgGuiso('fabada', extra) };
  function ilustracion(clave, extra) { return (ILUSTRACIONES[clave] || svgBogavante)(extra); }

  // ---------- 7.2 Router ----------
  function limpiarRefresco() { if (E.refresco) { clearInterval(E.refresco); E.refresco = null; } }

  function router() {
    const token = location.hash.slice(1) || 'inicio';
    if (!$('cocina').hidden) cerrarCocina(true);
    limpiarRefresco();
    let r = null;
    if (token !== 'inicio') {
      r = RECETAS.find((x) => x.id === token) || null;
      if (!r) { location.replace('#inicio'); return; }
    }
    window.scrollTo(0, 0);
    if (r) { renderReceta(r); document.title = r.nombre + ' · Socarrat'; }
    else { renderInicio(); document.title = 'Recetario Socarrat'; }
    try { $('app').focus({ preventScroll: true }); } catch (e) { /* ignorar */ }
  }

  // ---------- 7.3 Portada ----------
  function renderInicio() {
    const tarjetas = RECETAS.map((r, n) => {
      const total = Nucleo.duracionTotal(r);
      return '<a class="tarjeta subir" style="--i:' + (3 + n) + ';--color-receta:' + esc(r.color) + '" href="#' + esc(r.id) + '">' +
        '<div class="tarjeta-mini">' + ilustracion(r.ilustracion) + '</div>' +
        '<h2>' + esc(r.nombre) + '</h2><p>' + esc(r.subtitulo) + '</p>' +
        '<div class="chips"><span class="chip">' + esc(Nucleo.formatoDuracion(total)) + '</span><span class="chip">' + esc(r.dificultad) + '</span><span class="chip">' + r.racionesBase + ' raciones</span></div>' +
        '<svg class="flecha" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>' +
        '</a>';
    }).join('');
    $('app').innerHTML =
      '<div class="vista contenedor">' +
        '<header class="heroe">' + svgHeroe() +
          '<h1 class="titulo-marca subir" style="--i:1">Socarrat</h1>' +
          '<p class="lema subir" style="--i:2">Recetas de las de antes, con horas, paso a paso y en voz alta.</p>' +
        '</header>' +
        '<section class="buscador" aria-label="Buscar recetas"><label for="buscar-receta">¿Qué te apetece cocinar?</label><input id="buscar-receta" type="search" placeholder="Busca por receta o ingrediente" aria-controls="lista-recetas" autocomplete="off"><p id="resultados-recetas" role="status" aria-live="polite"></p></section>' +
        '<div id="lista-recetas" class="rejilla">' + tarjetas + '</div>' +
        '<p id="sin-resultados" class="sin-resultados" hidden>No hay recetas con esa búsqueda. Prueba con otro nombre o ingrediente.</p>' +
        '<footer class="pie">Socarrat · recetario</footer>' +
      '</div>';
    const normalizar = (texto) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const tarjetasDOM = $('lista-recetas').querySelectorAll('a');
    const textos = RECETAS.map((r) => normalizar([r.nombre, r.subtitulo].concat(r.ingredientes.map((i) => i.nombre)).join(' ')));
    function buscar() {
      const palabras = normalizar($('buscar-receta').value).trim().split(/\s+/).filter(Boolean);
      let cantidad = 0;
      tarjetasDOM.forEach((tarjeta, i) => {
        tarjeta.hidden = !palabras.every((p) => textos[i].includes(p));
        if (!tarjeta.hidden) cantidad++;
      });
      $('resultados-recetas').textContent = cantidad + (cantidad === 1 ? ' receta' : ' recetas');
      $('sin-resultados').hidden = cantidad > 0;
    }
    $('buscar-receta').addEventListener('input', buscar);
    buscar();
  }

  // ---------- 7.4 Receta ----------
  const ICONO_DOC = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>';
  const ICONO_MENOS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>';
  const ICONO_MAS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14M12 5v14"/></svg>';

  function acotarComensales(v) {
    v = Math.round(Number(v));
    if (!isFinite(v)) return 4;
    return Math.min(12, Math.max(1, v));
  }

  function horaDefectoComer(r) {
    const cuarto = 15 * 60000;
    const t = Date.now() + Nucleo.duracionTotal(r) * 1000;
    return Nucleo.formatoHora(new Date(Math.ceil(t / cuarto) * cuarto));
  }

  function renderReceta(r) {
    E.receta = r;
    E.comensales = acotarComensales(LS.get('socarrat:comensales:' + r.id, 4));
    E.modo = 'ahora';
    E.horaComer = horaDefectoComer(r);
    const total = Nucleo.duracionTotal(r);

    const prep = r.pasos.map((p, i) => ({ p, i })).filter((x) => x.p.fase === 'preparacion');
    const ejec = r.pasos.map((p, i) => ({ p, i })).filter((x) => x.p.fase === 'ejecucion');
    const durFase = (lista) => lista.reduce((a, x) => a + Nucleo.duracionPaso(x.p), 0);
    const bloque = (titulo, lista, cls) =>
      '<div class="fase"><div class="fase-cab"><h3>' + titulo + '</h3><span class="chip">' + esc(Nucleo.formatoDuracion(durFase(lista))) + '</span></div>' +
      '<ol class="linea ' + cls + '">' + lista.map((x) => pasoHTML(x.p, x.i)).join('') + '</ol></div>';

    $('app').innerHTML =
      '<div class="receta vista">' +
        '<header class="receta-cab">' +
          '<a class="volver" href="#inicio">‹ Recetas</a>' +
          '<div class="ilu">' + ilustracion(r.ilustracion, 'class="ilu-svg" width="200" height="200"') + '</div>' +
          '<h1>' + esc(r.nombre) + '</h1><p class="subtitulo">' + esc(r.subtitulo) + '</p>' +
          '<div class="chips"><span class="chip">' + esc(Nucleo.formatoDuracion(total)) + '</span><span class="chip">' + esc(r.dificultad) + '</span><span class="chip">' + r.pasos.length + ' pasos</span></div>' +
        '</header>' +
        '<div class="receta-cols">' +
          '<section class="panel comensales p-com" aria-label="Comensales">' +
            '<span class="etiqueta">¿Para cuántos?</span>' +
            '<div class="comensales-fila">' +
              '<button id="menos" class="stepper" aria-label="Un comensal menos">' + ICONO_MENOS + '</button>' +
              '<div id="num" class="num-comensales" aria-live="polite">' + E.comensales + '</div>' +
              '<button id="mas" class="stepper" aria-label="Un comensal más">' + ICONO_MAS + '</button>' +
            '</div>' +
            '<span class="etiqueta">comensales</span>' +
            '<div id="aviso-muchos" class="aviso-muchos" hidden></div>' +
          '</section>' +
          '<section class="panel p-ing" aria-labelledby="h-ing">' +
            '<h2 id="h-ing">Ingredientes</h2><div id="ing-lista"></div>' +
            '<div class="acciones"><button id="btn-pdf" class="btn btn-sec btn-ancho">' + ICONO_DOC + '<span id="btn-pdf-txt">Descargar lista de la compra (PDF)</span></button></div>' +
            '<div class="antes"><h3>Antes de empezar</h3><ul>' + r.antesDeEmpezar.map((t) => '<li>' + esc(t) + '</li>').join('') + '</ul></div>' +
          '</section>' +
          '<section class="panel p-hor" aria-labelledby="h-hor">' +
            '<h2 id="h-hor">Horario</h2>' +
            '<div class="segmentado"><button id="modo-ahora" aria-pressed="true">Empezar ahora</button><button id="modo-comer" aria-pressed="false">Quiero comer a las</button></div>' +
            '<input id="hora-input" class="hora-input" type="time" step="300" value="' + esc(E.horaComer) + '" aria-label="Hora de comer" hidden>' +
            '<p id="resumen" class="resumen-horario"></p>' +
            '<div id="no-llegas" class="no-llegas" hidden></div>' +
          '</section>' +
        '</div>' +
        '<section class="pasos-sec"><h2>Paso a paso</h2>' + bloque('Preparación previa', prep, 'prep') + bloque('Ejecución', ejec, 'ej') + '</section>' +
      '</div>' +
      '<div class="barra-comenzar"><button id="btn-comenzar" class="btn">Comenzar</button><small id="barra-fin"></small></div>';

    $('menos').addEventListener('click', () => cambiarComensales(-1));
    $('mas').addEventListener('click', () => cambiarComensales(1));
    $('modo-ahora').addEventListener('click', () => setModo('ahora'));
    $('modo-comer').addEventListener('click', () => setModo('comer'));
    $('hora-input').addEventListener('input', (ev) => { if (ev.target.value) { E.horaComer = ev.target.value; actualizarHorario(); } });
    $('btn-pdf').addEventListener('click', descargarPDF);
    $('btn-comenzar').addEventListener('click', comenzar);

    pintarIngredientesBase();
    actualizarIngredientes(false, 0);
    actualizarControlesComensales();
    actualizarHorario();
    E.refresco = setInterval(actualizarHorario, 30000);
  }

  function pasoHTML(p, i) {
    const manual = p.duracionSeg == null;
    const chip = manual ? '≈ ' + Nucleo.formatoDuracion(p.duracionEstimadaSeg) + ' · sin tiempo fijo' : Nucleo.formatoDuracion(p.duracionSeg);
    return '<li class="paso">' +
      '<div class="paso-meta"><span class="paso-hora" data-h="' + i + '">--:--</span><span class="paso-num">Paso ' + (i + 1) + '</span><span class="chip ' + (manual ? 'chip-manual' : '') + '">' + esc(chip) + '</span></div>' +
      '<h4>' + esc(p.titulo) + '</h4><p>' + esc(p.texto) + '</p>' +
      (p.consejo ? '<div class="consejo"><b>Consejo</b>' + esc(p.consejo) + '</div>' : '') +
      '</li>';
  }

  function lineasEscaladas() {
    const r = E.receta;
    return r.ingredientes.map((i) => Nucleo.escalarIngrediente(i, E.comensales, r.racionesBase));
  }

  function pintarIngredientesBase() {
    const grupos = Nucleo.agruparPorSeccion(lineasEscaladas());
    $('ing-lista').innerHTML = grupos.map((g) =>
      '<div class="ing-seccion"><h3>' + esc(g.seccion) + '</h3>' +
      g.lineas.map((l) =>
        '<div class="ing-fila"><span class="cant"><span class="cant-in" data-cant="' + esc(l.id) + '"></span></span>' +
        '<span class="ing-nombre"><span data-nombre="' + esc(l.id) + '"></span>' +
        (l.nota ? ' <span class="nota">' + esc(l.nota) + '</span>' : '') +
        (l.opcional ? ' <span class="opc">(opcional)</span>' : '') + '</span></div>'
      ).join('') + '</div>'
    ).join('');
  }

  // sentido: +1 sube, -1 baja, 0 sin animación
  function actualizarIngredientes(animar, sentido) {
    lineasEscaladas().forEach((l) => {
      const c = document.querySelector('[data-cant="' + l.id + '"]');
      const n = document.querySelector('[data-nombre="' + l.id + '"]');
      if (n) n.textContent = l.nombre;
      if (!c) return;
      if (c.textContent === l.cantidadTexto) return;
      c.textContent = l.cantidadTexto;
      c.classList.remove('rueda-arriba', 'rueda-abajo');
      if (animar && sentido && !sinMovimiento()) {
        void c.offsetWidth;
        c.classList.add(sentido > 0 ? 'rueda-arriba' : 'rueda-abajo');
      }
    });
    const av = $('aviso-muchos');
    const aviso = E.receta.avisoMuchos;
    if (av && aviso) {
      av.hidden = !(E.comensales >= aviso.desde);
      av.textContent = aviso.texto;
    }
  }

  function actualizarControlesComensales() {
    $('num').textContent = E.comensales;
    $('menos').disabled = E.comensales <= 1;
    $('mas').disabled = E.comensales >= 12;
  }

  function cambiarComensales(delta) {
    const n = acotarComensales(E.comensales + delta);
    if (n === E.comensales) return;
    E.comensales = n;
    LS.set('socarrat:comensales:' + E.receta.id, n);
    const b = $(delta > 0 ? 'mas' : 'menos');
    if (b && !sinMovimiento()) { b.classList.remove('rebota'); void b.offsetWidth; b.classList.add('rebota'); }
    actualizarControlesComensales();
    actualizarIngredientes(true, delta > 0 ? 1 : -1);
  }

  function setModo(modo) {
    E.modo = modo;
    $('modo-ahora').setAttribute('aria-pressed', String(modo === 'ahora'));
    $('modo-comer').setAttribute('aria-pressed', String(modo === 'comer'));
    $('hora-input').hidden = modo !== 'comer';
    actualizarHorario();
  }

  function actualizarHorario() {
    if (!E.receta || !$('resumen')) return;
    const h = Nucleo.calcularHorario(E.receta, { modo: E.modo, ahora: new Date(), horaComer: E.horaComer });
    document.querySelectorAll('[data-h]').forEach((el) => {
      el.textContent = Nucleo.formatoHora(h.pasos[Number(el.getAttribute('data-h'))].inicio);
    });
    $('resumen').innerHTML = 'Empiezas a las <b>' + Nucleo.formatoHora(h.inicio) + '</b> · Comes a las <b>' + Nucleo.formatoHora(h.fin) + '</b>' + (h.manana ? ' (mañana)' : '');
    const nl = $('no-llegas');
    if (E.modo === 'comer' && h.noLlegas) {
      nl.hidden = false;
      nl.innerHTML = '<span>No llegas: tendrías que haber empezado a las ' + Nucleo.formatoHora(h.inicio) + '. Si empiezas ya, comerías a las ' + Nucleo.formatoHora(h.finSiEmpiezasYa) + '.</span>' +
        '<button class="btn btn-sec" id="nl-ahora">Empezar ahora</button>';
      $('nl-ahora').addEventListener('click', () => setModo('ahora'));
    } else {
      nl.hidden = true;
      nl.textContent = '';
    }
    $('barra-fin').textContent = 'Terminas hacia las ' + Nucleo.formatoHora(h.finSiEmpiezasYa);
  }

  // ---------- 7.5 PDF ----------
  function conTiempo(promesa, ms) {
    return Promise.race([promesa, new Promise((res) => setTimeout(() => res(null), ms))]);
  }

  async function descargarPDF() {
    const JsPDF = window.jspdf && window.jspdf.jsPDF;
    if (!JsPDF) return avisar('No se ha podido cargar el generador de PDF. Revisa la conexión y vuelve a intentarlo.');
    const btn = $('btn-pdf'), txt = $('btn-pdf-txt');
    const original = txt.textContent;
    btn.disabled = true; txt.textContent = 'Generando…';
    try {
      let doc;
      try { doc = construirPDF(JsPDF, E.receta, E.comensales, new Date()); }
      catch (e) { avisar('No se pudo generar el PDF.'); return; }
      const filename = 'lista-compra-' + E.receta.id + '-' + E.comensales + '.pdf';
      let dl = null;
      try { if (window.claude && window.claude.use) dl = await conTiempo(window.claude.use('downloads'), 3000); } catch (e) { dl = null; }
      if (dl) {
        try { await dl.save({ filename, data: doc.output('blob') }); avisar('Lista de la compra guardada.'); }
        catch (e) { avisar(/declin|cancel|denied/i.test(String(e && (e.name || e.message || e))) ? 'Descarga cancelada.' : 'No se pudo guardar el PDF.'); }
        return;
      }
      try { doc.save(filename); } catch (e) { avisar('No se pudo guardar el PDF.'); }
    } finally {
      btn.disabled = false; txt.textContent = original;
    }
  }

  function construirPDF(JsPDF, receta, n, fecha) {
    const L = (s) => Nucleo.aLatin1(s);
    const doc = new JsPDF({ unit: 'mm', format: 'a4' });
    const gris = [68, 68, 68];
    doc.setFillColor(244, 168, 29);
    doc.rect(0, 0, 210, 34, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(22); doc.setTextColor(7, 23, 34);
    doc.text(L('Lista de la compra'), 18, 16);
    doc.setFontSize(14);
    doc.text(L(receta.nombre), 18, 26);
    const dd = String(fecha.getDate()).padStart(2, '0') + '/' + String(fecha.getMonth() + 1).padStart(2, '0') + '/' + fecha.getFullYear();
    doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor(gris[0], gris[1], gris[2]);
    doc.text(L('Para ' + n + (n === 1 ? ' comensal' : ' comensales') + ' · ' + dd), 18, 44);

    let y = 56;
    const salto = (alto) => { if (y + (alto || 0) > 297 - 24) { doc.addPage(); y = 22; } };
    const grupos = Nucleo.agruparPorSeccion(receta.ingredientes.map((i) => Nucleo.escalarIngrediente(i, n, receta.racionesBase)));
    grupos.forEach((g) => {
      salto(24);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(184, 50, 31);
      doc.text(L(g.seccion), 18, y);
      doc.setDrawColor(184, 50, 31); doc.setLineWidth(0.3);
      doc.line(18, y + 2, 192, y + 2);
      y += 10;
      g.lineas.forEach((l) => {
        salto(14);
        doc.setDrawColor(40, 40, 40); doc.setLineWidth(0.3);
        doc.rect(18, y - 4, 4.5, 4.5);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(7, 23, 34);
        doc.text(doc.splitTextToSize(L(l.cantidadTexto), 32)[0], 27, y);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(11);
        doc.text(L(l.nombre), 62, y);
        let x = 62 + doc.getTextWidth(L(l.nombre)) + 2;
        let extra = '';
        if (l.opcional) extra += '(opcional)';
        if (l.nota) extra += (extra ? ' ' : '') + l.nota;
        if (extra) {
          doc.setFontSize(9); doc.setTextColor(gris[0], gris[1], gris[2]);
          const anchoExtra = doc.getTextWidth(L(extra));
          if (x + anchoExtra <= 192) {
            doc.text(L(extra), x, y);
          } else {
            const lineas = doc.splitTextToSize(L(extra), 130);
            lineas.forEach((t, k) => { doc.text(t, 62, y + 4.5 * (k + 1)); });
            y += 4.5 * lineas.length;
          }
        }
        y += 9;
      });
      y += 4;
    });

    salto(30);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(7, 23, 34);
    doc.text(L('Antes de empezar'), 18, y);
    y += 6;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(gris[0], gris[1], gris[2]);
    receta.antesDeEmpezar.forEach((t) => {
      const lineas = doc.splitTextToSize(L(t), 174);
      salto(lineas.length * 4.5 + 2);
      doc.text(lineas, 18, y);
      y += lineas.length * 4.5 + 2;
    });

    const total = doc.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(120, 120, 120);
      doc.text(L('Socarrat · recetario'), 18, 289);
      doc.text(L('Página ' + i + ' de ' + total), 192, 289, { align: 'right' });
    }
    return doc;
  }

  // ---------- 7.6 Audio ----------
  const Audio = {
    ctx: null,
    iniciar() {
      try {
        this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
        if (this.ctx.state === 'suspended') this.ctx.resume();
      } catch (e) { this.ctx = null; }
    },
    tono(freq, t0, dur, tipo, vol) {
      if (E.silencio || !this.ctx) return;
      try {
        if (this.ctx.state !== 'running') this.ctx.resume().catch(() => {});
        const c = this.ctx, ini = c.currentTime + t0;
        const o = c.createOscillator(), g = c.createGain();
        o.type = tipo || 'sine'; o.frequency.value = freq;
        g.gain.setValueAtTime(0.0001, ini);
        g.gain.linearRampToValueAtTime(vol == null ? 0.25 : vol, ini + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, ini + dur);
        o.connect(g); g.connect(c.destination);
        o.start(ini); o.stop(ini + dur + 0.05);
      } catch (e) { /* sin audio */ }
    },
    campana(t, k) {
      t = t || 0; k = k == null ? 1 : k;
      this.tono(880, t, 0.45, 'sine', 0.25 * k);
      this.tono(1318.5, t + 0.18, 0.6, 'sine', 0.25 * k);
      this.tono(1760, t, 0.45, 'triangle', 0.05 * k);
    },
    fin(t) {
      t = t || 0;
      for (let i = 0; i < 3; i++) this.tono(988, t + i * 0.22, 0.14, 'square', 0.12);
    },
    tic(agudo) { this.tono(agudo ? 1900 : 1400, 0, 0.04, 'sine', agudo ? 0.12 : 0.08); },
    fanfarria(t) {
      t = t || 0;
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.tono(f, t + i * 0.16, i === 3 ? 0.6 : 0.16, 'triangle', 0.22));
    }
  };

  // ---------- 7.7 Voz ----------
  const Voz = {
    voz: null, temporizador: 0,
    elegir() {
      try {
        const vs = speechSynthesis.getVoices();
        this.voz = vs.find((v) => /^es[-_]ES/i.test(v.lang)) || vs.find((v) => /^es/i.test(v.lang)) || null;
      } catch (e) { /* sin voces */ }
    },
    decir(texto, retrasoMs) {
      if (E.silencio || typeof speechSynthesis === 'undefined') return;
      clearTimeout(this.temporizador);
      const hablar = () => {
        try {
          const u = new SpeechSynthesisUtterance(texto);
          u.lang = 'es-ES'; if (this.voz) u.voice = this.voz;
          u.rate = 1; u.pitch = 1;
          speechSynthesis.speak(u);
        } catch (e) { /* ignorar */ }
      };
      try { speechSynthesis.cancel(); } catch (e) { /* ignorar */ }
      if (retrasoMs > 0) this.temporizador = setTimeout(hablar, retrasoMs);
      else hablar();
    },
    callar() {
      clearTimeout(this.temporizador);
      try { speechSynthesis.cancel(); } catch (e) { /* ignorar */ }
    }
  };
  Voz.elegir();
  try { speechSynthesis.addEventListener('voiceschanged', () => Voz.elegir()); } catch (e) { /* ignorar */ }

  // ---------- 7.8 Modo cocina ----------
  let C = null;
  let rafId = 0, intervalo = 0, wakeLock = null;
  let indicePintado = -1, ultimoSegEta = -1, salirTimer = 0, salirArmado = false;
  const LARGO_ARCO = 2 * Math.PI * 90;

  async function pedirWakeLock() {
    try {
      if ('wakeLock' in navigator && document.visibilityState === 'visible') {
        const wl = await navigator.wakeLock.request('screen');
        if ($('cocina').hidden || !C) { wl.release().catch(() => {}); return; }
        wakeLock = wl;
      }
    } catch (e) { wakeLock = null; }
  }

  function comenzar() {
    Audio.iniciar();
    const v = Number(window.SOCARRAT_VELOCIDAD) || 1;
    indicePintado = -1; ultimoSegEta = -1;
    aplicar(Nucleo.cocinaInicial(E.receta, Date.now(), v), true);
    abrirOverlay(); pedirWakeLock();
    try { const p = document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); if (p && p.catch) p.catch(() => {}); } catch (e) { /* ignorar */ }
    clearInterval(intervalo);
    intervalo = setInterval(() => despachar('TICK'), 250);
    cancelAnimationFrame(rafId);
    bucleAnillo();
  }

  function despachar(tipo) {
    if (!C) return;
    aplicar(Nucleo.cocinaReducir(C, { tipo, ahora: Date.now() }));
  }

  function aplicar(r, primero) {
    C = r.estado;
    ejecutarEfectos(r.efectos, !!primero);
    pintarCocina();
  }

  function ejecutarEfectos(efectos, primero) {
    let desfase = 0, hubo = false;
    const hayCampana = efectos.some((x) => x.tipo === 'campana');
    efectos.forEach((e) => {
      switch (e.tipo) {
        case 'fin': Audio.fin(0); desfase = 0.8; hubo = true; break;
        case 'campana': Audio.campana(desfase, primero ? 0.6 : 1); break;
        case 'voz': Voz.decir(e.texto, (primero || !hayCampana) ? 0 : (hubo ? 1700 : 900)); break;
        case 'tic': Audio.tic(e.agudo); break;
        case 'fanfarria': Audio.fanfarria(desfase); break;
        case 'callar': Voz.callar(); break;
        default: break;
      }
    });
  }

  function abrirOverlay() {
    $('cocina').hidden = false;
    try { $('app').inert = true; } catch (e) { /* ignorar */ }
    $('ck-final').hidden = C.estado !== 'terminado';
    try { $('ck-principal').focus({ preventScroll: true }); } catch (e) { /* ignorar */ }
  }

  function reiniciarAnimacion(el) {
    el.classList.remove('entra');
    if (sinMovimiento()) return;
    void el.offsetWidth;
    el.classList.add('entra');
  }

  function pintarCocina() {
    if (!C) return;
    const pasos = C.receta.pasos;
    const p = pasos[C.indice];
    const cocina = $('cocina');
    cocina.classList.toggle('fase-ejecucion', p.fase === 'ejecucion');
    setTxt($('ck-num'), 'Paso ' + (C.indice + 1) + ' de ' + pasos.length);
    setTxt($('ck-fase'), p.fase === 'preparacion' ? 'Preparación previa' : 'Ejecución');
    if (indicePintado !== C.indice) {
      indicePintado = C.indice;
      setTxt($('ck-titulo'), p.titulo);
      setTxt($('ck-texto'), p.texto);
      reiniciarAnimacion($('ck-titulo')); reiniciarAnimacion($('ck-texto'));
      const cons = $('ck-consejo');
      if (p.consejo) { cons.hidden = false; cons.innerHTML = '<b>Consejo</b>' + esc(p.consejo); } else { cons.hidden = true; cons.textContent = ''; }
      const sig = pasos[C.indice + 1];
      setTxt($('ck-siguiente'), sig ? 'Después: ' + sig.titulo + ' · ' + Nucleo.formatoDuracion(Nucleo.duracionPaso(sig)) : 'Último paso');
      const manual = p.duracionSeg == null;
      if (manual) setTxt($('ck-reloj-sub'), 'sin tiempo fijo · ≈ ' + Nucleo.formatoDuracion(p.duracionEstimadaSeg));
      $('ck-arco').classList.toggle('manual', manual);
      $('cocina').querySelector('.cocina-cuerpo').scrollTop = 0;
    }
    const pr = $('ck-principal');
    pr.classList.toggle('hecho', C.estado === 'esperandoManual');
    setTxt(pr, C.estado === 'pausado' ? 'Seguir' : (C.estado === 'esperandoManual' ? 'Hecho' : 'Pausa'));
    const ant = $('ck-anterior'); if (ant.disabled !== (C.indice === 0)) ant.disabled = C.indice === 0;
    const mas = $('ck-mas'); if (mas.hidden !== (C.estado === 'esperandoManual')) mas.hidden = C.estado === 'esperandoManual';
    $('ck-reloj').classList.toggle('parpadea', C.estado === 'pausado');
    const fin = $('ck-final'), terminado = C.estado === 'terminado';
    if (fin.hidden === terminado) {
      fin.hidden = !terminado;
      if (terminado) { try { $('ck-volver').focus({ preventScroll: true }); } catch (e) { /* ignorar */ } }
    }
    if (terminado) { $('ck-progreso').style.transform = 'scaleX(1)'; setTxt($('ck-eta'), Nucleo.formatoHora(new Date())); }
    setAttr($('ck-silencio'), 'aria-pressed', String(!E.silencio));
    const onda = $('ck-onda'), disp = E.silencio ? 'none' : '';
    if (onda.style.display !== disp) onda.style.display = disp;
  }

  function setTxt(el, v) { if (el.textContent !== v) el.textContent = v; }
  function setAttr(el, a, v) { if (el.getAttribute(a) !== v) el.setAttribute(a, v); }

  function bucleAnillo() {
    if (!C || $('cocina').hidden) return;
    const ahora = Date.now();
    const p = C.receta.pasos[C.indice];
    const arco = $('ck-arco'), reloj = $('ck-reloj'), anillo = $('ck-anillo');
    if (C.estado === 'esperandoManual') {
      const seg = Math.floor((ahora - C.inicioPasoMs) * C.velocidad / 1000);
      setTxt(reloj, '+' + Nucleo.formatoReloj(seg * 1000));
      anillo.classList.remove('urgente');
      arco.style.strokeDashoffset = '';
    } else if (C.estado === 'corriendo' || C.estado === 'pausado') {
      const restante = Nucleo.cocinaRestanteMs(C, ahora);
      const dur = C.durTotalMs || (p.duracionSeg * 1000 / C.velocidad);
      setTxt(reloj, Nucleo.formatoReloj(restante));
      setTxt($('ck-reloj-sub'), 'de ' + Nucleo.formatoReloj(dur));
      arco.style.strokeDashoffset = String(LARGO_ARCO * (1 - Math.min(1, Math.max(0, restante / dur))));
      anillo.classList.toggle('urgente', C.estado === 'corriendo' && restante > 0 && restante <= 10000);
    } else {
      anillo.classList.remove('urgente');
    }
    if (C.estado !== 'terminado') {
      $('ck-progreso').style.transform = 'scaleX(' + Nucleo.cocinaProgreso(C, ahora).toFixed(4) + ')';
      const s = Math.floor(ahora / 1000);
      if (s !== ultimoSegEta) { ultimoSegEta = s; $('ck-eta').textContent = Nucleo.formatoHora(Nucleo.cocinaEta(C, ahora)); }
      rafId = requestAnimationFrame(bucleAnillo);
    }
  }

  function cerrarCocina(sinFoco) {
    clearInterval(intervalo); intervalo = 0;
    cancelAnimationFrame(rafId);
    clearTimeout(salirTimer); salirArmado = false;
    const av = document.querySelector('.salir-aviso'); if (av) av.remove();
    Voz.callar();
    try { if (wakeLock && wakeLock.release) wakeLock.release().catch(() => {}); } catch (e) { /* ignorar */ }
    try { $('app').inert = false; } catch (e) { /* ignorar */ }
    wakeLock = null;
    try { if (document.fullscreenElement && document.exitFullscreen) { const p = document.exitFullscreen(); if (p && p.catch) p.catch(() => {}); } } catch (e) { /* ignorar */ }
    $('cocina').hidden = true;
    C = null;
    if (!sinFoco) { const b = $('btn-comenzar'); if (b) { try { b.focus({ preventScroll: true }); } catch (e) { /* ignorar */ } } }
  }

  function intentarSalir() {
    if ($('cocina').hidden) return;
    if (salirArmado || (C && C.estado === 'terminado')) { cerrarCocina(); return; }
    salirArmado = true;
    let av = document.querySelector('.salir-aviso');
    if (!av) { av = document.createElement('div'); av.className = 'salir-aviso'; av.setAttribute('role', 'status'); $('cocina').appendChild(av); }
    av.textContent = 'Pulsa otra vez para salir';
    clearTimeout(salirTimer);
    salirTimer = setTimeout(() => { salirArmado = false; const a = document.querySelector('.salir-aviso'); if (a) a.remove(); }, 3000);
  }

  function iniciarEventosCocina() {
    $('cocina').addEventListener('click', () => Audio.iniciar(), true);
    $('ck-principal').addEventListener('click', () => {
      if (!C) return;
      despachar(C.estado === 'corriendo' ? 'PAUSAR' : (C.estado === 'pausado' ? 'REANUDAR' : 'HECHO'));
    });
    $('ck-anterior').addEventListener('click', () => despachar('ANTERIOR'));
    $('ck-siguiente-btn').addEventListener('click', () => despachar('SIGUIENTE'));
    $('ck-voz').addEventListener('click', () => despachar('REPETIR_VOZ'));
    $('ck-mas').addEventListener('click', () => despachar('MAS_TIEMPO'));
    $('ck-silencio').addEventListener('click', alternarSilencio);
    $('ck-salir').addEventListener('click', intentarSalir);
    $('ck-volver').addEventListener('click', () => cerrarCocina());

    document.addEventListener('keydown', (ev) => {
      if ($('cocina').hidden) return;
      if (ev.key === 'Escape') { ev.preventDefault(); intentarSalir(); return; }
      const enBoton = ev.target && ev.target.tagName === 'BUTTON';
      if (ev.key === ' ' || ev.code === 'Space') { if (!enBoton) { ev.preventDefault(); $('ck-principal').click(); } }
      else if (ev.key === 'ArrowLeft') { ev.preventDefault(); $('ck-anterior').click(); }
      else if (ev.key === 'ArrowRight') { ev.preventDefault(); $('ck-siguiente-btn').click(); }
      else if (ev.key === 'm' || ev.key === 'M') { alternarSilencio(); }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && !$('cocina').hidden && C) {
        try { if (Audio.ctx && Audio.ctx.state !== 'running') Audio.ctx.resume().catch(() => {}); } catch (e) { /* ignorar */ }
        despachar('TICK'); pedirWakeLock();
      }
    });
  }

  function alternarSilencio() {
    E.silencio = !E.silencio;
    LS.set('socarrat:silencio', E.silencio);
    if (E.silencio) Voz.callar();
    if (C) pintarCocina();
  }

  // ---------- Arranque ----------
  function arrancar() {
    iniciarEventosCocina();
    window.addEventListener('hashchange', router);
    router();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
