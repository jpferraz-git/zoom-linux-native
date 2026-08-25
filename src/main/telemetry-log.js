'use strict';

const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const TELEMETRY_FILE = path.join(app.getPath('userData'), 'telemetry.jsonl');

/**
 * Tamanho máximo do arquivo de telemetria em bytes (1 MB).
 * Quando ultrapassado, o arquivo é truncado para evitar crescimento infinito.
 */
const MAX_FILE_SIZE = 1 * 1024 * 1024;

/**
 * Registra um evento de telemetria localmente em formato JSONL.
 *
 * Cada linha do arquivo é um objeto JSON independente, facilitando parse
 * incremental e análise com ferramentas de linha de comando (jq, grep).
 *
 * Nenhum dado é enviado externamente — tudo fica em
 * `app.getPath('userData')/telemetry.jsonl`, no mesmo diretório que o
 * `window-state.json` já utiliza.
 *
 * Objetivo: fornecer dados reais sobre frequência e tipo de erros de
 * mídia/WebGL para embasar a decisão de ir ou não para a Fase 2 do
 * ROADMAP.md (motor duplo com Wine), em vez de decidir por estimativa.
 *
 * @param {{ type: string, message?: string, source?: string }} event
 * @param {string} event.type - Categoria do evento (ex: 'webgl-context-lost',
 *   'renderer-crashed', 'media-console-error', 'media-console-warning',
 *   'page-load-failed').
 * @param {string} [event.message] - Mensagem de erro original, se disponível.
 * @param {string} [event.source] - Origem do erro (arquivo:linha), se disponível.
 */
function logTelemetryEvent({ type, message, source }) {
  try {
    rotateIfNeeded();

    const entry = JSON.stringify({
      timestamp: new Date().toISOString(),
      type,
      ...(message && { message }),
      ...(source && { source }),
    });

    fs.appendFileSync(TELEMETRY_FILE, entry + '\n', 'utf-8');
  } catch (err) {
    console.warn('[telemetry-log] Failed to write telemetry event:', err.message);
  }
}

/**
 * Trunca o arquivo de telemetria se ele ultrapassar MAX_FILE_SIZE.
 * Estratégia simples: apaga o arquivo inteiro e recomeça. Dados antigos
 * já cumpriram seu propósito (análise pontual), não precisam ser preservados
 * indefinidamente.
 */
function rotateIfNeeded() {
  try {
    if (!fs.existsSync(TELEMETRY_FILE)) return;

    const stats = fs.statSync(TELEMETRY_FILE);
    if (stats.size > MAX_FILE_SIZE) {
      fs.unlinkSync(TELEMETRY_FILE);
    }
  } catch (err) {
    console.warn('[telemetry-log] Failed to check/rotate telemetry file:', err.message);
  }
}

module.exports = { logTelemetryEvent };
