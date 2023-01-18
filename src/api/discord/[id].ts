import type { NowRequest, NowResponse } from '@vercel/node'
import nc from 'next-connect'
import fetch from 'node-fetch'
import { cors } from '../../lib/cors'
import { DISCORD_TOKEN } from '../../lib/env'
import { time } from '../../lib/timing'
import { resolveQuery as rq } from '../../lib/utils'

interface IUser {
  id: string
  username: string
  avatar: string
  discriminator: string
}

const handler = nc<NowRequest, NowResponse>()
  .use(cors)
  .get(async (request: NowRequest, resp: NowResponse) => {
    const id = rq(request.query.id)

    const url = `https://discord.com/api/v8/users/${id}`
    const headers = { Authorization: `Bot ${DISCORD_TOKEN}` }

    const timer = time('lookup')
    const response = await fetch(url, { headers })
    timer.end(resp)

    if (response.status === 404) return resp.status(404).end()
    if (response.ok === false) return resp.status(502).end()

    const user: IUser = await response.json()
    const animated = user.avatar.startsWith('a_')

    const format = rq(request.query.format) ?? (animated ? 'gif' : 'png')
    const size = rq(request.query.size) ?? '2048'

    const avatarURL = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${format}?size=${size}`

    resp.setHeader('Location', avatarURL)
    return resp.status(307).end()
  })

export default handler
