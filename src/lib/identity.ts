/** A stable anonymous id per browser: flag stickiness and analytics both key on it. */
function stored(key: string, make: () => string) {
  try {
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const value = make();
    localStorage.setItem(key, value);
    return value;
  } catch {
    return make();
  }
}

export const userId = stored('kc.userId', () => `u_${crypto.randomUUID().slice(0, 12)}`);
export const sessionId = `s_${crypto.randomUUID().slice(0, 12)}`;
