import { NowRequest, NowResponse } from '@vercel/node'
import nc from 'next-connect'
import fetch from 'node-fetch'
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

const handler = nc<NowRequest, NowResponse>()
  .use(cors)
  .get(async (request: NowRequest, resp: NowResponse) => {
    const id = rq(request.query.id)
    const url = `${BASE_URL}?key=${STEAM_KEY}&steamids=${id}`

    const timer = time('lookup')
    const response = await fetch(url)
    timer.end(resp)

    if (response.ok === false) return resp.status(502).end()

    const { response: body }: IBody = await response.json()
    if (body.players.length === 0) return resp.status(404).end()
    const [player] = body.players

    resp.setHeader('Location', player.avatarfull)
    return resp.status(307).end()
  })

export default handler
