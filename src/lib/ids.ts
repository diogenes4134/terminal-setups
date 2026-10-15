// sin 0/O, 1/l/I: el id se puede leer en voz alta o copiar a mano sin confusiones
const ALPHABET = '23456789abcdefghijkmnpqrstuvwxyz';
export const ID_LENGTH = 7;
export const ID_PATTERN = new RegExp(`^[${ALPHABET}]{${ID_LENGTH}}$`);

/**
 * Id corto y aleatorio para /s/<id>. 32 símbolos ^ 7 ≈ 34 mil millones de valores:
 * con unos pocos miles de diseños la probabilidad de colisión es despreciable,
 * y aun así el guardado reintenta si ocurre.
 */
export function newId(): string {
  // 32 divide a 256 exactamente, así que `byte % 32` no introduce sesgo
  const bytes = crypto.getRandomValues(new Uint8Array(ID_LENGTH));
  return Array.from(bytes, b => ALPHABET[b % ALPHABET.length]).join('');
}
