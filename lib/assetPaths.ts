export const toPublicImagePath = (...parts: string[]) => `/images/${parts.map((part) => part.replace(/^\/+|\/+$/g, '')).join('/')}`;
export const toStagingPath = (...parts: string[]) => `public/images/_staging/${parts.map((part) => part.replace(/^\/+|\/+$/g, '')).join('/')}`;
