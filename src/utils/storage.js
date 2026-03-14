
export const getJson = (key, defVal) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? defVal; }
  catch { return defVal; }
};
export const setJson = (key, val) => localStorage.setItem(key, JSON.stringify(val));
export const uid = () => crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
