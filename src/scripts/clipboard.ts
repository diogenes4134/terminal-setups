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
  // TODO(human): copia `text` al portapapeles y avisa al usuario con flash().
  //   Éxito → flash(button, 'Copiado ✓', 'ok')
  //   Fallo → flash(button, 'Error', 'err')
}
