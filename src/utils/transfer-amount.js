export const ALL = Symbol("transfer all");

export function parseTransferAmount(text) {
  if (/^вс[её]$/i.test(text ?? "")) return ALL;
  if (!/^\d+$/.test(text ?? "")) return null;
  const amount = Number(text);
  return Number.isSafeInteger(amount) && amount > 0 ? amount : null;
}
