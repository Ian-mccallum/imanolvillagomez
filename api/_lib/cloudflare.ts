// Video loads per file on videos.imanolvillagomez.com, and the bucket's size, from Cloudflare's
// GraphQL analytics. A load is a GET answered 200/206: range requests make one viewing several
// loads, so the page calls it approximate.
const VIDEO_HOST = 'videos.imanolvillagomez.com';

export const cloudflareConfigured = () => !!process.env.CF_ANALYTICS_TOKEN && !!process.env.CF_ZONE_ID;

async function graphql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST',
    headers: { authorization: `Bearer ${process.env.CF_ANALYTICS_TOKEN}`, 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Cloudflare ${res.status}`);
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length || !json.data) throw new Error(`Cloudflare: ${json.errors?.[0]?.message?.slice(0, 120) ?? 'no data'}`);
  return json.data;
}

export async function videoLoads(day: string) {
  type Data = {
    viewer: {
      zones: {
        httpRequestsAdaptiveGroups: {
          count: number;
          sum: { edgeResponseBytes: number };
          dimensions: { clientRequestPath: string };
        }[];
      }[];
    };
  };
  const data = await graphql<Data>(
    `query ($zone: String!, $start: Time!, $end: Time!) {
      viewer { zones(filter: { zoneTag: $zone }) {
        httpRequestsAdaptiveGroups(limit: 200, filter: {
          datetime_geq: $start, datetime_lt: $end,
          clientRequestHTTPHost: "${VIDEO_HOST}",
          clientRequestHTTPMethodName: "GET",
          edgeResponseStatus_in: [200, 206]
        }) { count sum { edgeResponseBytes } dimensions { clientRequestPath } }
      } }
    }`,
    { zone: process.env.CF_ZONE_ID, start: `${day}T00:00:00Z`, end: `${nextDay(day)}T00:00:00Z` }
  );
  const byFile = new Map<string, { file: string; loads: number; bytes: number }>();
  for (const g of data.viewer.zones[0]?.httpRequestsAdaptiveGroups ?? []) {
    const m = g.dimensions.clientRequestPath.match(/^\/videos\/([\w.-]+\.mp4)$/);
    if (!m) continue;
    const v = byFile.get(m[1]) ?? { file: m[1], loads: 0, bytes: 0 };
    v.loads += g.count;
    v.bytes += g.sum.edgeResponseBytes;
    byFile.set(m[1], v);
  }
  return [...byFile.values()].sort((a, b) => b.loads - a.loads);
}

export async function storage() {
  type Data = {
    viewer: { accounts: { r2StorageAdaptiveGroups: { max: { payloadSize: number; objectCount: number } }[] }[] };
  };
  const since = new Date(Date.now() - 2 * 86400e3).toISOString();
  const data = await graphql<Data>(
    `query ($account: String!, $bucket: String!, $since: Time!) {
      viewer { accounts(filter: { accountTag: $account }) {
        r2StorageAdaptiveGroups(limit: 1, filter: { datetime_geq: $since, bucketName: $bucket }, orderBy: [datetime_DESC]) {
          max { payloadSize objectCount }
        }
      } }
    }`,
    { account: process.env.R2_ACCOUNT_ID, bucket: process.env.R2_BUCKET_NAME, since }
  );
  const row = data.viewer.accounts[0]?.r2StorageAdaptiveGroups[0]?.max;
  return row ? { bytes: row.payloadSize, objects: row.objectCount } : null;
}

const nextDay = (day: string) => new Date(Date.parse(`${day}T00:00:00Z`) + 86400e3).toISOString().slice(0, 10);
