import { registerString } from './register.js'

// #region Globals
const NODE_ENV = registerString('NODE_ENV')
const IS_PROD = NODE_ENV?.toLowerCase() === 'production'
export const IS_DEV = !IS_PROD
// #endregion

// #region Tokens
export const STEAM_KEY = registerString('STEAM_KEY', true)
export const DISCORD_TOKEN = registerString('DISCORD_TOKEN', true)
// #endregion
