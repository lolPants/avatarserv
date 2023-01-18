export const resolveQuery: <T>(value: T | T[]) => T = value => {
  return Array.isArray(value) ? value[0] : value
}
