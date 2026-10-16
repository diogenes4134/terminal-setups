import { $, root, store, toast } from './dom';

/* ══════════ modo CRT ══════════ */
export const isCRT = () => root.classList.contains('crt');
export function setCRT(on: boolean, quiet = false) {
  root.classList.toggle('crt', on);
  $('#crtBtn').setAttribute('aria-pressed', String(on));
  store.set('crt', on ? '1' : '0');
  if (!quiet) toast(on ? 'Modo CRT activado' : 'Modo CRT desactivado');
}
