const API_ORIGIN =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000' : '');

export { API_ORIGIN };
export const API_BASE = API_ORIGIN;

export const resolveImageUrl = (url) => {
  if (!url) return url;
  if (url.startsWith('/uploads/')) return API_ORIGIN + url;
  return url;
};
