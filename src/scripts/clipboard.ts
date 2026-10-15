/* ══════════ copiar al portapapeles ══════════ */
const timers = new WeakMap<HTMLElement, number>();

/** Cambia el texto del botón un momento (p. ej. «Copiado ✓») y lo restaura. */
export function flash(button: HTMLElement, label: string, cls: 'ok' | 'err') {
  button.dataset.label ??= button.textContent ?? '';
  button.textContent = label;
  button.classList.add(cls);
  clearTimeout(timers.get(button));
  timers.set(button, window.setTimeout(() => {
    button.textContent = button.dataset.label!;
    button.classList.remove(cls);
  }, 1600));
}

/**
 * Copia `text` al portapapeles. Acepta una promesa (p. ej. un enlace que hay que pedir al
 * servidor): Safari solo permite copiar durante el clic, así que se le entrega un
 * ClipboardItem que se resuelve después, en lugar de esperar y copiar al final.
 */
export async function copyInstall(button: HTMLElement, text: string | Promise<string>) {
  try {
    // falla si la página no es segura (HTTPS/localhost), sin permiso o en navegadores sin la API
    if (typeof text !== 'string' && typeof ClipboardItem !== 'undefined') {
      const blob = text.then(s => new Blob([s], { type: 'text/plain' }));
      await navigator.clipboard.write([new ClipboardItem({ 'text/plain': blob })]);
    } else {
      await navigator.clipboard.writeText(await text);
    }
    flash(button, 'Copiado ✓', 'ok');
  } catch {
    flash(button, 'Error', 'err');
  }
}
