export default async function handler(req, res) {
  const { folderId } = req.query;

  if (!folderId) {
    return res.status(400).json({ error: 'O parâmetro folderId é obrigatório.' });
  }

  const API_KEY = process.env.GOOGLE_DRIVE_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: 'A chave da API do Google Drive não está configurada na Vercel.' });
  }

  const query = `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)&pageSize=50&key=${API_KEY}`;

  try {
    const googleRes = await fetch(url);
    const data = await googleRes.json();

    if (data.error) {
      return res.status(data.error.code || 500).json({ error: data.error.message });
    }

    // Configura cabeçalho de cache para melhorar o desempenho (1 hora de cache)
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Erro de conexão com o Google Drive.' });
  }
}