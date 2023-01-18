import type { NowRequest, NowResponse } from '@vercel/node'
import type { NextHandler } from 'next-connect'

export const cors = (
  request: NowRequest,
  resp: NowResponse,
  next: NextHandler,
) => {
  if (request.headers.origin) {
    resp.setHeader('Access-Control-Allow-Origin', request.headers.origin)
    resp.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
    resp.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept',
    )

    if (request.method === 'OPTIONS') {
      return resp.status(200).end()
    }
  }

  next()
}
