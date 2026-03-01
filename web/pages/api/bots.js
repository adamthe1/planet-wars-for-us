import { list, put } from '@vercel/blob'

export default async function handler(req, res) {
  // GET — list all bots (metadata only, no code)
  if (req.method === 'GET') {
    const { blobs } = await list({
      prefix: 'bots/',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    const bots = await Promise.all(
      blobs.map(async (blob) => {
        try {
          const r = await fetch(blob.url)
          const data = await r.json()
          return {
            id: data.id,
            name: data.name,
            author: data.author,
            uploadedAt: data.uploadedAt,
            blobUrl: blob.url,
          }
        } catch {
          return null
        }
      })
    )

    return res.status(200).json({ bots: bots.filter(Boolean) })
  }

  // POST — upload a new bot
  if (req.method === 'POST') {
    const { name, author, code } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Bot name is required' })
    }
    if (!code || !code.trim()) {
      return res.status(400).json({ error: 'Bot code is required' })
    }
    if (code.length > 100_000) {
      return res.status(400).json({ error: 'Bot code too large (max 100 KB)' })
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const botData = {
      id,
      name: name.trim().slice(0, 50),
      author: (author || 'Anonymous').trim().slice(0, 50),
      code,
      uploadedAt: new Date().toISOString(),
    }

    const blob = await put(
      `bots/${id}.json`,
      JSON.stringify(botData),
      {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
        contentType: 'application/json',
        addRandomSuffix: false,
      }
    )

    return res.status(201).json({
      bot: {
        id,
        name: botData.name,
        author: botData.author,
        uploadedAt: botData.uploadedAt,
        blobUrl: blob.url,
      },
    })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
