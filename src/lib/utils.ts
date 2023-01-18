import type { ImageSize } from '@discordjs/rest'
import { ALLOWED_SIZES } from '@discordjs/rest'

// #region Utility Types
type UnionToIntersection<U> = (
  U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never

type LastOf<T> = UnionToIntersection<
  T extends unknown ? () => T : never
> extends () => infer R
  ? R
  : never

type Push<T extends unknown[], V> = [...T, V]
type TuplifyUnion<
  T,
  L = LastOf<T>,
  N = [T] extends [never] ? true : false,
> = true extends N ? [] : Push<TuplifyUnion<Exclude<T, L>>, L>
// #endregion

type AllowedSizesString = TuplifyUnion<`${ImageSize}`>
export const ALLOWED_SIZES_STRING = ALLOWED_SIZES.map(
  size => `${size}`,
) as AllowedSizesString
