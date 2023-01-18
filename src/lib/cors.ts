import type { VercelRequest, VercelResponse } from '@vercel/node'
import type { Middleware } from 'next-connect'

export const cors: Middleware<VercelRequest, VercelResponse> = (
  req,
  resp,
  next,
) => {
  if (req.headers.origin) {
    resp.setHeader('Access-Control-Allow-Origin', req.headers.origin)
    resp.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
    resp.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept',
    )

    if (req.method === 'OPTIONS') {
      return resp.status(200).end()
    }
  }

  next()
}
