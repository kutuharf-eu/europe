// IP-basiertes In-Memory-Rate-Limit (Sliding Window), je Serverless-Instanz.
// Reicht gegen Formular-Spam; kein externer Store nötig.
const buckets = new Map();

export function rateLimit(request, key, limit, windowMs = 60 * 60 * 1000) {
  const ip =
    (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const now = Date.now();
  const id = `${key}:${ip}`;
  const hits = (buckets.get(id) || []).filter((t) => now - t < windowMs);

  if (hits.length >= limit) {
    buckets.set(id, hits);
    return false;
  }

  hits.push(now);
  buckets.set(id, hits);

  // Speicher begrenzen: abgelaufene Einträge gelegentlich entfernen
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (v.every((t) => now - t >= windowMs)) buckets.delete(k);
    }
  }
  return true;
}
