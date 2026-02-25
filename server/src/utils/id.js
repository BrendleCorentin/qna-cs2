export function makeId(len = 8) {
  return Math.random().toString(36).slice(2, 2 + len);
}
