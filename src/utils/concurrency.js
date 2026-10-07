export function createLimiter(limit) {
  let active = 0;
  const queue = [];
  async function run(operation) {
    await new Promise((resolve) => {
      if (active < limit) { active++; resolve(); }
      else queue.push(resolve);
    });
    try { return await operation(); }
    finally {
      const next = queue.shift();
      if (next) next();
      else active--;
    }
  }
  return run;
}

const locks = new Map();
export async function withKeyLock(key, operation) {
  const previous = locks.get(key) || Promise.resolve();
  const current = previous.catch(() => {}).then(operation);
  locks.set(key, current);
  try { return await current; }
  finally { if (locks.get(key) === current) locks.delete(key); }
}
