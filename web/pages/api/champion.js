import { list, put } from '@vercel/blob'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { blobs } = await list({
      prefix: 'champion/',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })
    if (!blobs.length) return res.status(200).json({ name: null })
    try {
      const r = await fetch(blobs[0].url)
      const data = await r.json()
      return res.status(200).json({ name: data.name || null, wins: data.wins || 0 })
    } catch {
      return res.status(200).json({ name: null, wins: 0 })
    }
  }

  if (req.method === 'POST') {
    const { name, wins } = req.body
    if (!name || !name.trim()) return res.status(400).json({ error: 'name required' })
    const data = { name: name.trim(), wins: typeof wins === 'number' ? wins : 1 }
    await put(
      'champion/current.json',
      JSON.stringify(data),
      {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
        addRandomSuffix: false,
        contentType: 'application/json',
      }
    )
    return res.status(200).json(data)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
