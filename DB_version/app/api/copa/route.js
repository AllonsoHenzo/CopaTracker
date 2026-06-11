const API_BASE = 'https://api.football-data.org/v4';

export async function GET() {
  const token = process.env.FD_TOKEN;
  if (!token) return Response.json({ error: 'FD_TOKEN não configurado' }, { status: 500 });

  const headers = { 'X-Auth-Token': token };

  const [mRes, sRes, scRes] = await Promise.all([
    fetch(`${API_BASE}/competitions/WC/matches`,          { headers, next: { revalidate: 1800 } }),
    fetch(`${API_BASE}/competitions/WC/standings`,        { headers, next: { revalidate: 1800 } }).catch(() => null),
    fetch(`${API_BASE}/competitions/WC/scorers?limit=20`, { headers, next: { revalidate: 1800 } }).catch(() => null),
  ]);

  if (!mRes.ok) return Response.json({ error: `API retornou ${mRes.status}` }, { status: mRes.status });

  const mData  = await mRes.json();
  const sData  = sRes?.ok  ? await sRes.json()  : null;
  const scData = scRes?.ok ? await scRes.json() : null;

  return Response.json({
    matches:   mData.matches    || [],
    standings: sData?.standings || null,
    scorers:   scData?.scorers  || [],
  });
}
