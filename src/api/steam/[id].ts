import type { VercelRequest, VercelResponse } from '@vercel/node'
import axios from 'axios'
import nc from 'next-connect'
import { cors } from '../../lib/cors'
import { STEAM_KEY } from '../../lib/env'
import { time } from '../../lib/timing'
import { resolveQuery as rq } from '../../lib/utils'

const BASE_URL =
  'http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002'

interface IBody {
  response: {
    players: readonly IPlayer[]
  }
}

interface IPlayer {
  steamid: string
  personaname: string
  avatarfull: string
}

const handler = nc<VercelRequest, VercelResponse>()
  .use(cors)
  .get(async (req, resp) => {
    const id = rq(req.query.id)
    const url = `${BASE_URL}?key=${STEAM_KEY}&steamids=${id}`

    const timer = time('lookup')
    const response = await axios(url)
    timer.end(resp)

    const { data } = resp
    if (data.players.length === 0) return resp.status(404).end()
    const [player] = data.players

    resp.setHeader('Location', player.avatarfull)
    return resp.status(307).end()
  })

export default handler
