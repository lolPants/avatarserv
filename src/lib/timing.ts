import { NowResponse } from '@vercel/node'

type Unit = 'milli' | 'micro' | 'nano'
const now: (unit: Unit) => number = unit => {
  const hrTime = process.hrtime()

  switch (unit) {
    case 'milli':
      return hrTime[0] * 1000 + hrTime[1] / 1000000

    case 'micro':
      return hrTime[0] * 1000000 + hrTime[1] / 1000

    case 'nano':
      return hrTime[0] * 1000000000 + hrTime[1]

    default:
      return now('nano')
  }
}

export const time = (label: string) => {
  let start = now('milli')
  return {
    end: (resp: NowResponse) => {
      const end = now('milli')
      const diff = (end - start).toFixed(2)

      const header = resp.getHeader('Server-Timing')
      const headers =
        header === undefined
          ? []
          : Array.isArray(header)
          ? header
          : typeof header === 'number'
          ? [header.toString()]
          : [header]

      resp.setHeader('Server-Timing', [...headers, `${label};dur=${diff}`])
    },
    reset: () => {
      start = now('milli')
    },
  }
}
