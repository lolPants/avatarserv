import type { VercelRequest, VercelResponse } from '@vercel/node'
import Axios from 'axios'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import nc from 'next-connect'
import { z } from 'zod'
import { cors } from '../../lib/cors'
import { STEAM_KEY } from '../../lib/env'

const axios = Axios.create({
  baseURL: 'http://api.steampowered.com',
})

const PlayerSchema = z.object({
  steamid: z.string().min(1),
  personaname: z.string(),
  avatarfull: z.string().url(),
})

const BodySchema = z.object({
  response: z.object({
    players: z.array(PlayerSchema),
  }),
})

const QuerySchema = z.object({
  id: z.string().min(1),
})

const handler = nc<VercelRequest, VercelResponse>()
handler.use(cors)
handler.get(async (req, resp) => {
  const result = await QuerySchema.safeParseAsync(req.query)
  if (!result.success) {
    resp.status(StatusCodes.BAD_REQUEST).send(result.error.errors)
    return
  }

  const { data: query } = result
  const response = await axios.get<unknown>(
    '/ISteamUser/GetPlayerSummaries/v0002',
    {
      params: { key: STEAM_KEY, steamids: query.id },
    },
  )

  const body = await BodySchema.parseAsync(response.data)
  const [player] = body.response.players

  if (!player) {
    resp.setHeader('Content-Type', 'text/plain')
    resp.status(StatusCodes.NOT_FOUND).send(ReasonPhrases.NOT_FOUND)

    return
  }

  resp.setHeader('Location', player.avatarfull)
  resp.status(307).end()
})

export default handler
