import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is missing');
    return res.status(503).json({ error: 'Posts are temporarily unavailable' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const posts = await sql`
      SELECT id, title, excerpt, body, to_jsonb(dumps.post_date) AS post_date
      FROM public.dumps
      ORDER BY dumps.post_date DESC
    `;
    return res.status(200).json(posts);
  } catch (error) {
    console.error('Could not load posts from Neon', error.code ?? error.name);
    return res.status(503).json({ error: 'Posts are temporarily unavailable' });
  }
}
