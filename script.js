/*
 * UnoKda_3_Días · Interactividad pública
 * Archivo: script.js | JavaScript Vanilla, sin servidor ni base de datos.
 * Dirección editorial: Jorge Boullosa Trejo · BULHOSART
 *
 * Publicar exclusivamente registros con aprobado:true y publicado:true.
 * Las obras y páginas se presentan tal cual fueron suministradas y aprobadas.
 * Ningún documento privado, inscripción, cobro ni dato personal se envía desde aquí.
 */
(() => {
  'use strict';

  const DATA = Object.freeze({
    artistas: './data/artistas.json',
    videos: './data/videos.json',
    publicaciones: './data/publicaciones.json'
  });
  const VIDEO_CATEGORIES = new Set(['entrevistas', 'procesos', 'videoarte', 'exposiciones']);
  const YOUTUBE_ID = /^[a-zA-Z0-9_-]{11}$/;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const texto = value => typeof value === 'string' ? value.trim() : '';
  const publicado = item => item && item.aprobado === true && item.publicado === true;
  const records = { videos: [], publicaciones: [] };
  const libraryURL = $('#flipbook')?.dataset.librarySrc ||
    'https://cdn.jsdelivr.net/npm/page-flip@2.0.7/dist/js/page-flip.browser.min.js';

  let activeVideoFilter = 'todos';
  let pageFlip = null;
  let pageFlipScriptPromise = null;
  let bookRequestVersion = 0;
  let currentZoom = 100;

  // Solo archivos visuales públicos del propio proyecto. Se bloquean URLs externas,
  // rutas fuera de assets/ y formatos ajenos a imágenes.
  function imagePath(value) {
    const source = texto(value);
    if (!source || source.startsWith('//') || /[?#]/.test(source)) return null;
    try {
      const url = new URL(source, document.baseURI);
      const assets = new URL('./assets/', document.baseURI);
      return url.origin === location.origin &&
        url.pathname.startsWith(assets.pathname) &&
        /\.(?:avif|webp|png|jpe?g)$/i.test(url.pathname) ? url.href : null;
    } catch {
      return null;
    }
  }

  // Un enlace a una ficha pública debe pertenecer a esta web, no a un dominio ajeno.
  function internalPage(value) {
    const source = texto(value);
    if (!source || source.startsWith('//') || /[?#]/.test(source)) return null;
    try {
      const url = new URL(source, document.baseURI);
      const root = new URL('./', document.baseURI);
      return url.origin === location.origin &&
        url.pathname.startsWith(root.pathname) &&
        /\.html$/i.test(url.pathname) ? url.href : null;
    } catch {
      return null;
    }
  }

  function element(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  }

  function emptyMessage(target, message) {
    target.replaceChildren(element('p', 'empty-state', message));
  }

  async function readPublicData(path) {
    const response = await fetch(path, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`No se pudo leer ${path} (HTTP ${response.status}).`);
    const json = await response.json();
    if (!Array.isArray(json)) throw new TypeError(`${path} debe contener un array JSON.`);
    return json.filter(publicado);
  }

  // Menú móvil: teclado, enlaces internos, clic exterior y cambio a escritorio.
  function setupMenu() {
    const trigger = $('#menu-toggle');
    const menu = $('#menu-principal');
    if (!trigger || !menu) return;

    const setOpen = open => {
      trigger.setAttribute('aria-expanded', String(open));
      trigger.setAttribute('aria-label', open ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
    };
    trigger.addEventListener('click', () =>
      setOpen(trigger.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', event => {
      if (event.target.closest('a')) setOpen(false);
    });
    document.addEventListener('pointerdown', event => {
      if (!trigger.contains(event.target) && !menu.contains(event.target)) setOpen(false);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && trigger.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        trigger.focus();
      }
    });
    const breakpoint = window.matchMedia('(min-width: 761px)');
    breakpoint.addEventListener?.('change', event => {
      if (event.matches) setOpen(false);
    });
  }

  // Fichas públicas: nunca publicar una obra si no tiene fuente y alt verificados.
  function renderArtists(items) {
    const container = $('#artist-grid');
    if (!container) return;
    const fragment = document.createDocumentFragment();

    for (const item of items) {
      const name = texto(item.nombre);
      const description = texto(item.descripcion);
      const alt = texto(item.alt);
      const img = imagePath(item.imagen);
      if (!name || !alt || !img) continue;

      const article = element('article', 'artist-card');
      const page = internalPage(item.url);
      const surface = element(page ? 'a' : 'div', 'artist-card__link');
      if (page) {
        surface.href = page;
        surface.setAttribute('aria-label', `Consultar la ficha de ${name}`);
      }
      const media = element('span', 'artist-card__media');
      const image = element('img');
      image.src = img;
      image.alt = alt;
      image.width = 640;
      image.height = 800;
      image.loading = 'lazy';
      image.decoding = 'async';
      media.append(image);
      surface.append(media);
      if (texto(item.disciplina)) surface.append(element('p', 'artist-card__meta', texto(item.disciplina)));
      surface.append(element('h3', 'artist-card__title', name));
      if (description) surface.append(element('p', 'artist-card__description', description));
      article.append(surface);
      fragment.append(article);
    }
    container.replaceChildren(fragment);
    if (!container.childElementCount) {
      emptyMessage(container, 'El archivo digital se está preparando para su publicación.');
    }
  }

  async function loadArtists() {
    try {
      renderArtists(await readPublicData(DATA.artistas));
    } catch (error) {
      console.warn('UnoKda / artistas:', error);
      emptyMessage($('#artist-grid'), 'El catálogo de artistas no está disponible en este momento.');
    }
  }

  // Videoteca: miniatura local, sin scripts de YouTube antes de pulsar Reproducir.
  function validVideos(items) {
    return items.filter(item =>
      texto(item.titulo) && YOUTUBE_ID.test(texto(item.youtubeId)) &&
      VIDEO_CATEGORIES.has(texto(item.categoria)) && imagePath(item.miniatura));
  }

  function renderVideos() {
    const container = $('#video-grid');
    const template = $('#video-card-template');
    if (!container || !template) return;
    const selection = records.videos.filter(video =>
      activeVideoFilter === 'todos' || video.categoria === activeVideoFilter);
    const fragment = document.createDocumentFragment();

    for (const video of selection) {
      const card = template.content.firstElementChild.cloneNode(true);
      const button = $('.video-card__play', card);
      const image = $('img', card);
      image.src = imagePath(video.miniatura);
      image.alt = `Fotograma de presentación: ${video.titulo}`;
      $('.video-card__category', card).textContent = video.categoria;
      $('.video-card__title', card).textContent = video.titulo;
      button.setAttribute('aria-label', `Reproducir vídeo: ${video.titulo}`);
      button.addEventListener('click', () => openVideo(video));
      fragment.append(card);
    }
    container.replaceChildren(fragment);
    if (!selection.length) {
      const message = records.videos.length
        ? 'No hay vídeos publicados en esta categoría.'
        : 'Todavía no hay vídeos publicados en esta sección.';
      emptyMessage(container, message);
    }
  }

  function setupVideoFilters() {
    for (const button of $$('[data-video-filter]')) {
      button.addEventListener('click', () => {
        const category = button.dataset.videoFilter;
        if (category !== 'todos' && !VIDEO_CATEGORIES.has(category)) return;
        activeVideoFilter = category;
        for (const other of $$('[data-video-filter]')) {
          const selected = other === button;
          other.setAttribute('aria-pressed', String(selected));
          other.classList.toggle('is-active', selected);
        }
        renderVideos();
      });
    }
  }

  async function loadVideos() {
    try {
      records.videos = validVideos(await readPublicData(DATA.videos));
      renderVideos();
    } catch (error) {
      console.warn('UnoKda / videoteca:', error);
      emptyMessage($('#video-grid'), 'La videoteca no está disponible en este momento.');
    }
  }

  function openVideo(video) {
    const dialog = $('#video-dialog');
    const player = $('#video-player');
    if (!dialog || !player || !YOUTUBE_ID.test(video.youtubeId)) return;
    $('#video-dialog-title').textContent = video.titulo;
    $('#video-description').textContent = texto(video.descripcion);
    player.replaceChildren();

    const iframe = document.createElement('iframe');
    iframe.title = `Vídeo de YouTube: ${video.titulo}`;
    iframe.src = `https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`;
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    iframe.setAttribute('allowfullscreen', '');
    iframe.loading = 'lazy';
    player.append(iframe);
    if (!dialog.open) dialog.showModal();
  }

  function setupVideoDialog() {
    const dialog = $('#video-dialog');
    $('#video-close')?.addEventListener('click', () => dialog.close());
    dialog?.addEventListener('close', () => {
      // Eliminar el iframe detiene el vídeo y libera recursos.
      $('#video-player')?.replaceChildren();
    });
    dialog?.addEventListener('click', event => {
      if (event.target === dialog) dialog.close();
    });
  }

  // Biblioteca: las páginas se obtienen del JSON público, nunca de Drive privado.
  function validPublications(items) {
    return items.filter(item =>
      texto(item.titulo) && texto(item.autor) && imagePath(item.portada) &&
      Array.isArray(item.paginas) && item.paginas.length >= 2 &&
      item.paginas.every(page => imagePath(page)));
  }

  function renderPublications(items) {
    const container = $('#publication-grid');
    const template = $('#publication-card-template');
    if (!container || !template) return;
    const fragment = document.createDocumentFragment();

    for (const publication of items) {
      const card = template.content.firstElementChild.cloneNode(true);
      const button = $('.publication-card__open', card);
      const cover = $('img', card);
      cover.src = imagePath(publication.portada);
      cover.alt = texto(publication.altPortada) || `Portada de ${publication.titulo}`;
      $('.publication-card__type', card).textContent = texto(publication.tipo) || 'Publicación digital';
      $('.publication-card__title', card).textContent = publication.titulo;
      $('.publication-card__author', card).textContent = publication.autor;
      button.setAttribute('aria-label', `Leer publicación: ${publication.titulo}`);
      button.addEventListener('click', () => openBook(publication));
      fragment.append(card);
    }
    container.replaceChildren(fragment);
    if (!items.length) {
      emptyMessage(container, 'Las publicaciones digitales estarán disponibles aquí tras su revisión editorial.');
    }
  }

  async function loadPublications() {
    try {
      records.publicaciones = validPublications(await readPublicData(DATA.publicaciones));
      renderPublications(records.publicaciones);
    } catch (error) {
      console.warn('UnoKda / biblioteca:', error);
      emptyMessage($('#publication-grid'), 'La biblioteca no está disponible en este momento.');
    }
  }

  // Carga diferida de la dependencia StPageFlip. Se comparte una sola promesa.
  function ensureFlipLibrary() {
    if (window.St?.PageFlip) return Promise.resolve(window.St.PageFlip);
    if (pageFlipScriptPromise) return pageFlipScriptPromise;
    pageFlipScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = libraryURL;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.onload = () => window.St?.PageFlip
        ? resolve(window.St.PageFlip)
        : reject(new Error('La librería de paso de hojas no está disponible.'));
      script.onerror = () => reject(new Error('No se pudo descargar StPageFlip. Comprueba la conexión.'));
      document.head.append(script);
    }).catch(error => {
      pageFlipScriptPromise = null;
      throw error;
    });
    return pageFlipScriptPromise;
  }

  function bookButtons(enabled) {
    $('#book-prev').disabled = !enabled;
    $('#book-next').disabled = !enabled;
    $('#book-zoom').disabled = !enabled;
    $('#book-fullscreen').disabled = !enabled;
  }

  function updateBookPage() {
    const total = pageFlip?.getPageCount() || 0;
    const current = total ? pageFlip.getCurrentPageIndex() + 1 : 0;
    $('#book-counter').textContent = `Página ${current} de ${total}`;
    $('#book-prev').disabled = current <= 1;
    $('#book-next').disabled = current >= total;
  }

  function bookZoom(percent) {
    currentZoom = Math.max(100, Math.min(150, Number(percent) || 100));
    const reader = $('#flipbook');
    const frame = $('#reader-frame');
    if (reader) {
      reader.style.transform = `scale(${currentZoom / 100})`;
      reader.style.transformOrigin = 'center top';
    }
    // Reservar espacio extra para evitar que la última página quede cortada.
    if (frame) frame.style.paddingBottom = `${22 + (currentZoom - 100) * 4}px`;
    $('#book-zoom').value = String(currentZoom);
    $('#book-zoom-value').textContent = `${currentZoom} %`;
  }

  function disposeBook() {
    bookRequestVersion += 1; // invalida cargas asíncronas pendientes
    if (document.fullscreenElement === $('#book-dialog')) {
      document.exitFullscreen?.().catch(() => {});
    }
    if (pageFlip) {
      try { pageFlip.destroy(); } catch (error) { console.warn('Cerrar libro:', error); }
      pageFlip = null;
    }
    // StPageFlip puede eliminar su elemento raíz al destruirse: se recrea siempre.
    const host = element('div', 'flipbook');
    host.id = 'flipbook';
    host.setAttribute('aria-label', 'Visor con paso de hojas');
    host.dataset.librarySrc = libraryURL;
    $('#reader-frame')?.replaceChildren(host);
    bookZoom(100);
    bookButtons(false);
    $('#book-counter').textContent = 'Página 0 de 0';
    $('#book-status').textContent = '';
  }

  async function openBook(publication) {
    const dialog = $('#book-dialog');
    if (!dialog) return;
    disposeBook();
    const version = bookRequestVersion;
    $('#book-dialog-title').textContent = publication.titulo;
    $('#book-status').textContent = 'Preparando las páginas de lectura…';
    if (!dialog.open) dialog.showModal();

    try {
      const PageFlip = await ensureFlipLibrary();
      if (version !== bookRequestVersion || !dialog.open) return;

      const host = $('#flipbook');
      pageFlip = new PageFlip(host, {
        width: 400,
        height: 560,
        size: 'stretch',
        minWidth: 210,
        maxWidth: 480,
        minHeight: 294,
        maxHeight: 672,
        maxShadowOpacity: 0.24,
        drawShadow: true,
        showCover: true,
        usePortrait: true,
        mobileScrollSupport: true,
        flippingTime: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 150 : 800,
        startPage: 0,
        swipeDistance: 30,
        autoSize: true
      });
      pageFlip.on('flip', updateBookPage);
      pageFlip.on('changeOrientation', updateBookPage);
      pageFlip.loadFromImages(publication.paginas.map(imagePath));
      bookButtons(true);
      updateBookPage();
      $('#book-status').textContent = 'Arrastra una esquina o utiliza Anterior y Siguiente. Las páginas conservan su imagen original.';
    } catch (error) {
      console.error('UnoKda / lector:', error);
      $('#book-status').textContent = 'No ha sido posible abrir el libro. Comprueba la conexión y las rutas de sus imágenes.';
      bookButtons(false);
    }
  }

  function setupBookDialog() {
    const dialog = $('#book-dialog');
    $('#book-close')?.addEventListener('click', () => dialog.close());
    dialog?.addEventListener('close', disposeBook);
    $('#book-prev')?.addEventListener('click', () => pageFlip?.flipPrev('bottom'));
    $('#book-next')?.addEventListener('click', () => pageFlip?.flipNext('bottom'));
    $('#book-zoom')?.addEventListener('input', event => bookZoom(event.target.value));
    $('#book-fullscreen')?.addEventListener('click', async () => {
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        } else if (dialog.requestFullscreen) {
          await dialog.requestFullscreen();
        } else {
          $('#book-status').textContent = 'Este navegador no admite pantalla completa.';
        }
      } catch {
        $('#book-status').textContent = 'No se pudo activar la pantalla completa.';
      }
    });
    document.addEventListener('fullscreenchange', () => {
      $('#book-fullscreen').textContent = document.fullscreenElement === dialog
        ? 'Salir de pantalla completa' : 'Pantalla completa';
      pageFlip?.update?.();
    });
  }

  function init() {
    setupMenu();
    setupVideoFilters();
    setupVideoDialog();
    setupBookDialog();
    if (location.protocol === 'file:') {
      const warning = 'Para leer los archivos JSON abre esta web mediante un servidor local o desde su alojamiento HTTPS, no con doble clic en index.html.';
      emptyMessage($('#artist-grid'), warning);
      emptyMessage($('#video-grid'), warning);
      emptyMessage($('#publication-grid'), warning);
      return;
    }
    loadArtists();
    loadVideos();
    loadPublications();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
