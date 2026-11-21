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
    artistas: '/data/artistas.json',
    videos: '/data/videos.json',
    publicaciones: '/data/publicaciones.json'
  });
  const SITE_BASE = location.protocol === 'file:' ? SITE_BASE : new URL('/', location.origin);
  const LOCALE = document.documentElement.lang || 'es';

  const UI = {
  "en": {
    "Abrir menú de navegación": "Open navigation",
    "Cerrar menú de navegación": "Close navigation",
    "Consultar la ficha de": "View the profile of",
    "El archivo digital se está preparando para su publicación.": "The digital archive is being prepared for publication.",
    "El catálogo de artistas no está disponible en este momento.": "The artists archive is currently unavailable.",
    "Fotograma de presentación:": "Video preview:",
    "Reproducir vídeo:": "Play video:",
    "No hay vídeos publicados en esta categoría.": "No published videos in this category.",
    "Todavía no hay vídeos publicados en esta sección.": "No videos have been published in this section yet.",
    "La videoteca no está disponible en este momento.": "The video archive is currently unavailable.",
    "Vídeo de YouTube:": "YouTube video:",
    "Portada de": "Cover of",
    "Publicación digital": "Digital publication",
    "Leer publicación:": "Read publication:",
    "Las publicaciones digitales estarán disponibles aquí tras su revisión editorial.": "Digital publications will be available here after editorial review.",
    "La biblioteca no está disponible en este momento.": "The library is currently unavailable.",
    "Página": "Page",
    "de": "of",
    "Página 0 de 0": "Page 0 of 0",
    "Preparando las páginas de lectura…": "Preparing the pages…",
    "Arrastra una esquina o utiliza Anterior y Siguiente. Las páginas conservan su imagen original.": "Drag a corner or use Previous and Next. Pages retain their original artwork.",
    "No ha sido posible abrir el libro. Comprueba la conexión y las rutas de sus imágenes.": "Unable to open the publication. Check the connection and image paths.",
    "Visor con paso de hojas": "Page-turning reader",
    "Este navegador no admite pantalla completa.": "This browser does not support full screen.",
    "No se pudo activar la pantalla completa.": "Unable to activate full screen.",
    "Salir de pantalla completa": "Exit full screen",
    "Pantalla completa": "Full screen",
    "Para leer los archivos JSON abre esta web mediante un servidor local o desde su alojamiento HTTPS, no con doble clic en index.html.": "To load JSON catalogues, access this site through a local web server or HTTPS hosting, not by double-clicking index.html.",
    "entrevistas": "Interviews",
    "procesos": "Processes",
    "videoarte": "Video art",
    "exposiciones": "Exhibitions"
  },
  "fr": {
    "Abrir menú de navegación": "Ouvrir le menu",
    "Cerrar menú de navegación": "Fermer le menu",
    "Consultar la ficha de": "Voir la fiche de",
    "El archivo digital se está preparando para su publicación.": "Les archives numériques sont en cours de préparation.",
    "El catálogo de artistas no está disponible en este momento.": "Les archives des artistes sont indisponibles pour le moment.",
    "Fotograma de presentación:": "Aperçu de la vidéo :",
    "Reproducir vídeo:": "Lire la vidéo :",
    "No hay vídeos publicados en esta categoría.": "Aucune vidéo publiée dans cette catégorie.",
    "Todavía no hay vídeos publicados en esta sección.": "Aucune vidéo n’a encore été publiée dans cette rubrique.",
    "La videoteca no está disponible en este momento.": "La vidéothèque est indisponible pour le moment.",
    "Vídeo de YouTube:": "Vidéo YouTube :",
    "Portada de": "Couverture de",
    "Publicación digital": "Publication numérique",
    "Leer publicación:": "Lire la publication :",
    "Las publicaciones digitales estarán disponibles aquí tras su revisión editorial.": "Les publications numériques seront disponibles ici après validation éditoriale.",
    "La biblioteca no está disponible en este momento.": "La bibliothèque est indisponible pour le moment.",
    "Página": "Page",
    "de": "sur",
    "Página 0 de 0": "Page 0 sur 0",
    "Preparando las páginas de lectura…": "Préparation des pages…",
    "Arrastra una esquina o utiliza Anterior y Siguiente. Las páginas conservan su imagen original.": "Faites glisser un coin ou utilisez Précédent et Suivant. Les pages conservent leur image originale.",
    "No ha sido posible abrir el libro. Comprueba la conexión y las rutas de sus imágenes.": "Impossible d’ouvrir la publication. Vérifiez la connexion et les chemins des images.",
    "Visor con paso de hojas": "Visionneuse à pages tournantes",
    "Este navegador no admite pantalla completa.": "Ce navigateur ne prend pas en charge le plein écran.",
    "No se pudo activar la pantalla completa.": "Impossible d’activer le plein écran.",
    "Salir de pantalla completa": "Quitter le plein écran",
    "Pantalla completa": "Plein écran",
    "Para leer los archivos JSON abre esta web mediante un servidor local o desde su alojamiento HTTPS, no con doble clic en index.html.": "Pour charger les catalogues JSON, ouvrez ce site depuis un serveur local ou un hébergement HTTPS, et non par double-clic sur index.html.",
    "entrevistas": "Entretiens",
    "procesos": "Processus",
    "videoarte": "Art vidéo",
    "exposiciones": "Expositions"
  },
  "pt": {
    "Abrir menú de navegación": "Abrir navegação",
    "Cerrar menú de navegación": "Fechar navegação",
    "Consultar la ficha de": "Consultar a ficha de",
    "El archivo digital se está preparando para su publicación.": "O arquivo digital está em preparação.",
    "El catálogo de artistas no está disponible en este momento.": "O arquivo de artistas está temporariamente indisponível.",
    "Fotograma de presentación:": "Imagem de apresentação:",
    "Reproducir vídeo:": "Reproduzir vídeo:",
    "No hay vídeos publicados en esta categoría.": "Não há vídeos publicados nesta categoria.",
    "Todavía no hay vídeos publicados en esta sección.": "Ainda não há vídeos publicados nesta secção.",
    "La videoteca no está disponible en este momento.": "A videoteca está temporariamente indisponível.",
    "Vídeo de YouTube:": "Vídeo do YouTube:",
    "Portada de": "Capa de",
    "Publicación digital": "Publicação digital",
    "Leer publicación:": "Ler publicação:",
    "Las publicaciones digitales estarán disponibles aquí tras su revisión editorial.": "As publicações digitais estarão disponíveis aqui após revisão editorial.",
    "La biblioteca no está disponible en este momento.": "A biblioteca está temporariamente indisponível.",
    "Página": "Página",
    "de": "de",
    "Página 0 de 0": "Página 0 de 0",
    "Preparando las páginas de lectura…": "A preparar as páginas…",
    "Arrastra una esquina o utiliza Anterior y Siguiente. Las páginas conservan su imagen original.": "Arrasta um canto ou usa Anterior e Seguinte. As páginas mantêm a imagem original.",
    "No ha sido posible abrir el libro. Comprueba la conexión y las rutas de sus imágenes.": "Não foi possível abrir a publicação. Verifica a ligação e os caminhos das imagens.",
    "Visor con paso de hojas": "Leitor de páginas",
    "Este navegador no admite pantalla completa.": "Este navegador não suporta ecrã inteiro.",
    "No se pudo activar la pantalla completa.": "Não foi possível ativar o ecrã inteiro.",
    "Salir de pantalla completa": "Sair de ecrã inteiro",
    "Pantalla completa": "Ecrã inteiro",
    "Para leer los archivos JSON abre esta web mediante un servidor local o desde su alojamiento HTTPS, no con doble clic en index.html.": "Para carregar os catálogos JSON, abre o site num servidor local ou em HTTPS, não clicando duas vezes em index.html.",
    "entrevistas": "Entrevistas",
    "procesos": "Processos",
    "videoarte": "Videoarte",
    "exposiciones": "Exposições"
  },
  "it": {
    "Abrir menú de navegación": "Apri menu",
    "Cerrar menú de navegación": "Chiudi menu",
    "Consultar la ficha de": "Consulta la scheda di",
    "El archivo digital se está preparando para su publicación.": "L’archivio digitale è in preparazione.",
    "El catálogo de artistas no está disponible en este momento.": "L’archivio degli artisti non è disponibile al momento.",
    "Fotograma de presentación:": "Anteprima del video:",
    "Reproducir vídeo:": "Riproduci video:",
    "No hay vídeos publicados en esta categoría.": "Nessun video pubblicato in questa categoria.",
    "Todavía no hay vídeos publicados en esta sección.": "Non sono ancora stati pubblicati video in questa sezione.",
    "La videoteca no está disponible en este momento.": "La videoteca non è disponibile al momento.",
    "Vídeo de YouTube:": "Video YouTube:",
    "Portada de": "Copertina di",
    "Publicación digital": "Pubblicazione digitale",
    "Leer publicación:": "Leggi la pubblicazione:",
    "Las publicaciones digitales estarán disponibles aquí tras su revisión editorial.": "Le pubblicazioni digitali saranno disponibili qui dopo la revisione editoriale.",
    "La biblioteca no está disponible en este momento.": "La biblioteca non è disponibile al momento.",
    "Página": "Pagina",
    "de": "di",
    "Página 0 de 0": "Pagina 0 di 0",
    "Preparando las páginas de lectura…": "Preparazione delle pagine…",
    "Arrastra una esquina o utiliza Anterior y Siguiente. Las páginas conservan su imagen original.": "Trascina un angolo oppure usa Precedente e Successivo. Le pagine mantengono l’immagine originale.",
    "No ha sido posible abrir el libro. Comprueba la conexión y las rutas de sus imágenes.": "Impossibile aprire la pubblicazione. Controlla la connessione e i percorsi delle immagini.",
    "Visor con paso de hojas": "Lettore sfogliabile",
    "Este navegador no admite pantalla completa.": "Questo browser non supporta lo schermo intero.",
    "No se pudo activar la pantalla completa.": "Impossibile attivare lo schermo intero.",
    "Salir de pantalla completa": "Esci dallo schermo intero",
    "Pantalla completa": "Schermo intero",
    "Para leer los archivos JSON abre esta web mediante un servidor local o desde su alojamiento HTTPS, no con doble clic en index.html.": "Per caricare i cataloghi JSON apri il sito tramite un server locale o HTTPS, non con un doppio clic su index.html.",
    "entrevistas": "Interviste",
    "procesos": "Processi",
    "videoarte": "Videoarte",
    "exposiciones": "Mostre"
  },
  "de": {
    "Abrir menú de navegación": "Navigation öffnen",
    "Cerrar menú de navegación": "Navigation schließen",
    "Consultar la ficha de": "Profil ansehen:",
    "El archivo digital se está preparando para su publicación.": "Das digitale Archiv wird vorbereitet.",
    "El catálogo de artistas no está disponible en este momento.": "Das Künstlerarchiv ist derzeit nicht verfügbar.",
    "Fotograma de presentación:": "Videovorschau:",
    "Reproducir vídeo:": "Video abspielen:",
    "No hay vídeos publicados en esta categoría.": "Keine veröffentlichten Videos in dieser Kategorie.",
    "Todavía no hay vídeos publicados en esta sección.": "In diesem Bereich wurden noch keine Videos veröffentlicht.",
    "La videoteca no está disponible en este momento.": "Die Videothek ist derzeit nicht verfügbar.",
    "Vídeo de YouTube:": "YouTube-Video:",
    "Portada de": "Titelseite von",
    "Publicación digital": "Digitale Publikation",
    "Leer publicación:": "Publikation lesen:",
    "Las publicaciones digitales estarán disponibles aquí tras su revisión editorial.": "Digitale Publikationen werden hier nach redaktioneller Prüfung veröffentlicht.",
    "La biblioteca no está disponible en este momento.": "Die Bibliothek ist derzeit nicht verfügbar.",
    "Página": "Seite",
    "de": "von",
    "Página 0 de 0": "Seite 0 von 0",
    "Preparando las páginas de lectura…": "Seiten werden vorbereitet…",
    "Arrastra una esquina o utiliza Anterior y Siguiente. Las páginas conservan su imagen original.": "Ziehe an einer Ecke oder nutze Zurück und Weiter. Die Seiten behalten ihr Originalbild.",
    "No ha sido posible abrir el libro. Comprueba la conexión y las rutas de sus imágenes.": "Die Publikation konnte nicht geöffnet werden. Bitte Verbindung und Bildpfade prüfen.",
    "Visor con paso de hojas": "Blätteransicht",
    "Este navegador no admite pantalla completa.": "Dieser Browser unterstützt keinen Vollbildmodus.",
    "No se pudo activar la pantalla completa.": "Vollbild konnte nicht aktiviert werden.",
    "Salir de pantalla completa": "Vollbild verlassen",
    "Pantalla completa": "Vollbild",
    "Para leer los archivos JSON abre esta web mediante un servidor local o desde su alojamiento HTTPS, no con doble clic en index.html.": "Zum Laden der JSON-Kataloge öffne die Website über einen lokalen Server oder HTTPS, nicht per Doppelklick auf index.html.",
    "entrevistas": "Interviews",
    "procesos": "Prozesse",
    "videoarte": "Videokunst",
    "exposiciones": "Ausstellungen"
  }
};
  const tx = key => UI[LOCALE]?.[key] || key;

  const VIDEO_CATEGORIES = new Set(['entrevistas', 'procesos', 'videoarte', 'exposiciones']);
  const YOUTUBE_ID = /^[a-zA-Z0-9_-]{11}$/;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const texto = value => typeof value === 'string' ? value.trim() : '';
  const localizado = (item, campo) => {
    const alterno = item?.[campo + '_i18n'];
    return texto((alterno && alterno[LOCALE]) || item?.[campo]);
  }; 
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
      const url = new URL(source, SITE_BASE);
      const assets = new URL('/assets/', SITE_BASE);
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
      const url = new URL(source, SITE_BASE);
      const root = SITE_BASE;
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
      trigger.setAttribute('aria-label', open ? tx('Cerrar menú de navegación') : tx('Abrir menú de navegación'));
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
      const description = localizado(item, 'descripcion');
      const alt = localizado(item,'alt');
      const img = imagePath(item.imagen);
      if (!name || !alt || !img) continue;

      const article = element('article', 'artist-card');
      const page = internalPage(item.url);
      const surface = element(page ? 'a' : 'div', 'artist-card__link');
      if (page) {
        surface.href = page;
        surface.setAttribute('aria-label', `${tx("Consultar la ficha de")} ${name}`);
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
      if (texto(item.disciplina)) surface.append(element('p', 'artist-card__meta', localizado(item,'disciplina')));
      surface.append(element('h3', 'artist-card__title', name));
      if (description) surface.append(element('p', 'artist-card__description', description));
      article.append(surface);
      fragment.append(article);
    }
    container.replaceChildren(fragment);
    if (!container.childElementCount) {
      emptyMessage(container, tx('El archivo digital se está preparando para su publicación.'));
    }
  }

  async function loadArtists() {
    try {
      renderArtists(await readPublicData(DATA.artistas));
    } catch (error) {
      console.warn('UnoKda / artistas:', error);
      emptyMessage($('#artist-grid'), tx('El catálogo de artistas no está disponible en este momento.'));
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
      image.alt = `${tx("Fotograma de presentación:")} ${localizado(video,"titulo")}`;
      $('.video-card__category', card).textContent = tx(video.categoria);
      $('.video-card__title', card).textContent = localizado(video,'titulo');
      button.setAttribute('aria-label', `${tx("Reproducir vídeo:")} ${localizado(video,"titulo")}`);
      button.addEventListener('click', () => openVideo(video));
      fragment.append(card);
    }
    container.replaceChildren(fragment);
    if (!selection.length) {
      const message = records.videos.length
        ? tx('No hay vídeos publicados en esta categoría.')
        : tx('Todavía no hay vídeos publicados en esta sección.');
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
      emptyMessage($('#video-grid'), tx('La videoteca no está disponible en este momento.'));
    }
  }

  function openVideo(video) {
    const dialog = $('#video-dialog');
    const player = $('#video-player');
    if (!dialog || !player || !YOUTUBE_ID.test(video.youtubeId)) return;
    $('#video-dialog-title').textContent = localizado(video,'titulo');
    $('#video-description').textContent = localizado(video,'descripcion');
    player.replaceChildren();

    const iframe = document.createElement('iframe');
    iframe.title = `${tx("Vídeo de YouTube:")} ${localizado(video,"titulo")}`;
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
      cover.alt = localizado(publication,'altPortada') || `${tx("Portada de")} ${localizado(publication,"titulo")}`;
      $('.publication-card__type', card).textContent = localizado(publication,'tipo') || tx('Publicación digital');
      $('.publication-card__title', card).textContent = localizado(publication,'titulo');
      $('.publication-card__author', card).textContent = publication.autor;
      button.setAttribute('aria-label', `${tx("Leer publicación:")} ${localizado(publication,"titulo")}`);
      button.addEventListener('click', () => openBook(publication));
      fragment.append(card);
    }
    container.replaceChildren(fragment);
    if (!items.length) {
      emptyMessage(container, tx('Las publicaciones digitales estarán disponibles aquí tras su revisión editorial.'));
    }
  }

  async function loadPublications() {
    try {
      records.publicaciones = validPublications(await readPublicData(DATA.publicaciones));
      renderPublications(records.publicaciones);
    } catch (error) {
      console.warn('UnoKda / biblioteca:', error);
      emptyMessage($('#publication-grid'), tx('La biblioteca no está disponible en este momento.'));
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
    $('#book-counter').textContent = `${tx("Página")} ${current} ${tx("de")} ${total}`;
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
    host.setAttribute('aria-label', tx('Visor con paso de hojas'));
    host.dataset.librarySrc = libraryURL;
    $('#reader-frame')?.replaceChildren(host);
    bookZoom(100);
    bookButtons(false);
    $('#book-counter').textContent = tx('Página 0 de 0');
    $('#book-status').textContent = '';
  }

  async function openBook(publication) {
    const dialog = $('#book-dialog');
    if (!dialog) return;
    disposeBook();
    const version = bookRequestVersion;
    $('#book-dialog-title').textContent = localizado(publication,'titulo');
    $('#book-status').textContent = tx('Preparando las páginas de lectura…');
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
      $('#book-status').textContent = tx('Arrastra una esquina o utiliza Anterior y Siguiente. Las páginas conservan su imagen original.');
    } catch (error) {
      console.error('UnoKda / lector:', error);
      $('#book-status').textContent = tx('No ha sido posible abrir el libro. Comprueba la conexión y las rutas de sus imágenes.');
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
          $('#book-status').textContent = tx('Este navegador no admite pantalla completa.');
        }
      } catch {
        $('#book-status').textContent = tx('No se pudo activar la pantalla completa.');
      }
    });
    document.addEventListener('fullscreenchange', () => {
      $('#book-fullscreen').textContent = document.fullscreenElement === dialog
        ? tx('Salir de pantalla completa') : tx('Pantalla completa');
      pageFlip?.update?.();
    });
  }

  function init() {
    setupMenu();
    setupVideoFilters();
    setupVideoDialog();
    setupBookDialog();
    if (location.protocol === 'file:') {
      // Vista previa local: conservar los mensajes informativos ya presentes en HTML.
      return;
    }
    loadArtists();
    loadVideos();
    loadPublications();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
