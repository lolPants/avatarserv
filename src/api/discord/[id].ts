import { API } from '@discordjs/core'
import type { ImageSize } from '@discordjs/rest'
import { ALLOWED_EXTENSIONS, REST } from '@discordjs/rest'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { StatusCodes } from 'http-status-codes'
import nc from 'next-connect'
import { z } from 'zod'
import { cors } from '../../lib/cors'
import { DISCORD_TOKEN } from '../../lib/env'
import { ALLOWED_SIZES_STRING } from '../../lib/utils'

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN)
const client = new API(rest)

type Query = z.infer<typeof QuerySchema>
const QuerySchema = z.object({
  id: z.string().min(1),
  format: z.enum(ALLOWED_EXTENSIONS).default('png'),
  size: z
    .enum(ALLOWED_SIZES_STRING)
    .default('2048')
    .transform(size => Number.parseInt(size, 10) as ImageSize),
})

const avatarURL: (query: Query) => Promise<string> = async ({
  id,
  format,
  size,
}) => {
  const user = await client.users.get(id)
  if (!user.avatar) {
    const discriminator = Number.parseInt(user.discriminator, 10) % 5
    return client.rest.cdn.defaultAvatar(discriminator)
  }

  return client.rest.cdn.avatar(user.id, user.avatar, {
    size,
    extension: format,
  })
}

const handler = nc<VercelRequest, VercelResponse>()
handler.use(cors)
handler.get(async (req, resp) => {
  const result = await QuerySchema.safeParseAsync(req.query)
  if (!result.success) {
    resp.status(StatusCodes.BAD_REQUEST).send(result.error.errors)
    return
  }

  const { data: query } = result
  const url = await avatarURL(query)

  resp.setHeader('Location', url)
  resp.status(307).end()
})

export default handler
