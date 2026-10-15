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

export async function copyInstall(button: HTMLElement, text: string) {
  try {
    // falla si la página no es segura (HTTPS/localhost), sin permiso o en navegadores sin la API
    await navigator.clipboard.writeText(text);
    flash(button, 'Copiado ✓', 'ok');
  } catch {
    flash(button, 'Error', 'err');
  }
}
