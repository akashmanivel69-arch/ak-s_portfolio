const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://pnvkxpvqmnjpnytlcgbn.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBudmt4cHZxbW5qcG55dGxjZ2JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwODc4MDYsImV4cCI6MjA4OTY2MzgwNn0.WQ6kyOVFmDhOmLPfrHa4NWZ1ARkJHzZm57a8HA77kxs'
);

async function parseBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') { resolve(req.body); return; }
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch(e) { resolve({}); } });
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (error) { res.status(500).json({ error: error.message }); return; }
    res.status(200).json(data || []);
    return;
  }

  if (req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.slug || !body.title) { res.status(400).json({ error: 'Missing fields' }); return; }
    body.created_at = new Date().toISOString();
    const { error } = await supabase.from('posts').insert([body]);
    if (error) { res.status(500).json({ error: error.message }); return; }
    res.status(200).json({ ok: true });
    return;
  }

  if (req.method === 'DELETE') {
    const body = await parseBody(req);
    if (!body.slug) { res.status(400).json({ error: 'Missing slug' }); return; }
    const { error } = await supabase.from('posts').delete().eq('slug', body.slug);
    if (error) { res.status(500).json({ error: error.message }); return; }
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
};
