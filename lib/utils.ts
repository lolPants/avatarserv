export const resolveQuery: <T>(value: T | T[]) => T = value => Array.isArray(value) ? value[0] : value
