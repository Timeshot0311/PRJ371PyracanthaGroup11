export const authToken = {
  get(): string | null {
    try {
      return localStorage.getItem("invascan_token");
    } catch {
      return null;
    }
  },
  set(token: string) {
    try {
      localStorage.setItem("invascan_token", token);
    } catch {}
  },
  clear() {
    try {
      localStorage.removeItem("invascan_token");
    } catch {}
  },
};
