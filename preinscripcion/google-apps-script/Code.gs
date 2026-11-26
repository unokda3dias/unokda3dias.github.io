/**
 * UnoKda_3_Días — Recepción de preinscripciones (Google Apps Script)
 * No contiene datos de artistas ni claves. Crear y desplegar desde la cuenta oficial.
 * Google Apps Script: https://script.google.com/
 *
 * 1. Crear proyecto Apps Script en la cuenta institucional.
 * 2. Pegar el contenido completo de este archivo en Code.gs.
 * 3. Ejecutar UNA vez prepararCartera(), autorizar los permisos y abrir la hoja.
 * 4. Implementar > Nueva implementación > Aplicación web.
 *    Ejecutar como: Yo. Quién tiene acceso: Cualquier persona.
 * 5. Copiar la URL terminada en /exec a preinscripcion/form-config.js.
 * 6. Realizar envío real de prueba y verificar el registro en la hoja.
 *
 * Los datos de la hoja NUNCA deben publicarse en GitHub.
 */
const UK3D = Object.freeze({
  VERSION: 'UK3D-PRE-2026-11-26',
  HEADERS: ['ID', 'Fecha UTC', 'Nombre completo', 'Correo electrónico',
    'País', 'Localidad', 'Disciplina', 'Mayor de edad',
    'Consentimiento', 'Versión informativa', 'Estado', 'Fecha límite revisión', 'Observaciones internas'],
  PROPERTY_SHEET_ID: 'UK3D_PRIVATE_SHEET_ID'
});

/** Ejecutar manualmente, una sola vez, en la cuenta institucional. */
function prepararCartera() {
  const props = PropertiesService.getScriptProperties();
  const existing = props.getProperty(UK3D.PROPERTY_SHEET_ID);
  if (existing) {
    Logger.log('La cartera ya existe: https://docs.google.com/spreadsheets/d/' + existing + '/edit');
    return;
  }
  const book = SpreadsheetApp.create('UnoKda_3_Días | CARTERA PRIVADA DE ARTISTAS');
  const sheet = book.getSheets()[0];
  sheet.setName('Preinscripciones');
  sheet.appendRow(UK3D.HEADERS);
  sheet.setFrozenRows(1);
  sheet.getRange('A1:M1').setFontWeight('bold');
  props.setProperty(UK3D.PROPERTY_SHEET_ID, book.getId());
  Logger.log('Cartera privada: ' + book.getUrl());
}

/** Sólo ofrece un indicador de servicio, nunca datos privados. */
function doGet() {
  const ready = Boolean(PropertiesService.getScriptProperties().getProperty(UK3D.PROPERTY_SHEET_ID));
  return ContentService.createTextOutput(ready ? 'UnoKda_3_Días: servicio configurado.' : 'UnoKda_3_Días: pendiente de configurar.');
}

/** El navegador envía mediante POST HTML normal, sin CORS ni peticiones fetch. */
function doPost(e) {
  try {
    if (!e || !e.parameter) return resultado_('error', 'No se ha recibido ningún formulario.');
    const p = e.parameter;
    if (p.botcheck) return resultado_('error', 'No se pudo registrar la solicitud.');
    const nombre = limpiar_(p.nombre_y_apellidos, 120);
    const email = limpiar_(p.email, 200).toLowerCase();
    const pais = limpiar_(p.pais_de_residencia, 100);
    const localidad = limpiar_(p.localidad, 120);
    const disciplina = limpiar_(p.disciplina_artistica, 160);
    const version = limpiar_(p.version_privacidad, 50);
    if (nombre.length < 3 || !emailValido_(email) || !pais || !localidad || !disciplina ||
        p.mayoria_de_edad !== 'Sí' || p.consentimiento !== 'Sí' || version !== UK3D.VERSION) {
      return resultado_('error', 'Faltan datos o declaraciones obligatorias. Vuelve al formulario y revísalos.');
    }
    const id = PropertiesService.getScriptProperties().getProperty(UK3D.PROPERTY_SHEET_ID);
    if (!id) return resultado_('error', 'La recepción todavía no está configurada.');
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(12000)) return resultado_('error', 'La recepción está ocupada. Inténtalo de nuevo.');
    try {
      const book = SpreadsheetApp.openById(id);
      const sheet = book.getSheetByName('Preinscripciones');
      if (!sheet) throw new Error('Hoja no encontrada');
      const now = new Date();
      const expiry = new Date(now.getTime());
      expiry.setUTCFullYear(expiry.getUTCFullYear() + 1);
      sheet.appendRow([
        Utilities.getUuid(), now.toISOString(), seguroHoja_(nombre), seguroHoja_(email),
        seguroHoja_(pais), seguroHoja_(localidad), seguroHoja_(disciplina),
        'Sí', 'Sí', UK3D.VERSION, 'PREINSCRITO', expiry.toISOString().slice(0,10), ''
      ]);
      SpreadsheetApp.flush();
    } finally {
      lock.releaseLock();
    }
    return resultado_('ok', 'Tu preinscripción se ha registrado correctamente. Este registro no implica selección ni reserva de plaza.');
  } catch (error) {
    console.error('Error en recepción UnoKda:', error && error.message ? error.message : 'desconocido');
    return resultado_('error', 'No hemos podido confirmar el registro. Vuelve a intentarlo o escribe al correo institucional.');
  }
}
function limpiar_(v, max) {
  return String(v || '').trim().replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').slice(0, max);
}
function emailValido_(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 200; }
function seguroHoja_(v) {
  return /^[=+\-@\t\r]/.test(v) ? "'" + v : v;
}
function resultado_(tipo, mensaje) {
  const ok = tipo === 'ok';
  const color = ok ? '#285c40' : '#9c321c';
  const titulo = ok ? 'Preinscripción recibida' : 'No se ha confirmado el envío';
  const html = '<!doctype html><html lang="es"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>' + titulo + ' | UnoKda_3_Días</title></head>' +
    '<body style="margin:0;background:#F3EFE6;color:#15171A;font:18px/1.7 Georgia,serif;">' +
    '<main style="max-width:680px;padding:55px 24px;margin:auto;">' +
    '<p style="font-size:13px;letter-spacing:.12em;">UNOKDA_3_DÍAS · PREINSCRIPCIÓN</p>' +
    '<h1 style="color:' + color + ';font-size:32px;">' + titulo + '</h1>' +
    '<p>' + mensaje + '</p>' +
    '<p><a href="https://unokda3dias.github.io/preinscripcion/" style="color:#80612E;">Volver a la web institucional</a></p>' +
    '</main></body></html>';
  return HtmlService.createHtmlOutput(html).setTitle(titulo);
}