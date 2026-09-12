/**
 * Student DZ - Feedback Web App
 *
 * Deploy as: Web app
 * Execute as: Me
 * Who has access: Anyone
 *
 * The endpoint accepts JSON POST requests from Student DZ and stores
 * each report in a separate Google Sheets tab according to pageKey.
 */

const SPREADSHEET_ID = ''; // Optional: leave empty when this script is bound to the target Sheet.
const DEFAULT_SHEET_NAME = 'all_reports';

function doGet() {
  return jsonResponse_({
    ok: true,
    service: 'Student DZ Feedback API',
    version: '1.0'
  });
}

function doPost(e) {
  try {
    const payload = parsePayload_(e);
    validatePayload_(payload);

    const pageKey = sanitizeSheetName_(payload.pageKey || 'unknown_page');
    const sheet = getSpreadsheet_().getSheetByName(pageKey) ||
      getSpreadsheet_().insertSheet(pageKey);

    ensureHeader_(sheet);

    sheet.appendRow([
      new Date(),
      payload.type || '',
      payload.pageKey || '',
      payload.pagePath || '',
      payload.pageUrl || '',
      payload.pageTitle || '',
      payload.description || '',
      payload.userAgent || '',
      payload.timestamp || ''
    ]);

    return jsonResponse_({
      ok: true,
      message: 'Feedback received',
      sheet: pageKey
    });
  } catch (error) {
    return jsonResponse_({
      ok: false,
      error: String(error && error.message ? error.message : error)
    });
  }
}

function parsePayload_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('Empty request body');
  }

  const raw = e.postData.contents;
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error('Invalid JSON payload');
  }
}

function validatePayload_(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid payload');
  }
  if (!payload.description || !String(payload.description).trim()) {
    throw new Error('Description is required');
  }
}

function getSpreadsheet_() {
  if (SPREADSHEET_ID) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function ensureHeader_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'receivedAt',
      'type',
      'pageKey',
      'pagePath',
      'pageUrl',
      'pageTitle',
      'description',
      'userAgent',
      'timestamp'
    ]);
    sheet.setFrozenRows(1);
  }
}

function sanitizeSheetName_(value) {
  const cleaned = String(value || DEFAULT_SHEET_NAME)
    .replace(/[\\/?*\[\]:]/g, '-')
    .replace(/\s+/g, '_')
    .substring(0, 90);
  return cleaned || DEFAULT_SHEET_NAME;
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
