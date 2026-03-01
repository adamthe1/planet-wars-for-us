import { list } from '@vercel/blob'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query

  const { blobs } = await list({
    prefix: `bots/${id}.json`,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  })

  if (!blobs.length) {
    return res.status(404).json({ error: 'Bot not found' })
  }

  const r = await fetch(blobs[0].url)
  const botData = await r.json()

  return res.status(200).json({ bot: botData })
}
