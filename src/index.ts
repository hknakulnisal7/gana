/**
 * @fileoverview Single-file JioSaavn API.
 * 
 * Maps directly to the JioSaavn endpoint:
 * https://www.jiosaavn.com/api.php?__call=webapi.get&token={token}&type={type}...
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'

// ==========================================
// 1. CONFIGURATION
// ==========================================

const BASE_URL = 'https://www.jiosaavn.com/api.php'

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
]

// ==========================================
// 2. HELPER FUNCTIONS
// ==========================================

/**
 * Fetches data from the JioSaavn API using constructed parameters.
 */
async function fetchJioSaavn(queryParams: Record<string, string>) {
  // Filter out empty parameters (like an empty 'p' parameter)
  const cleanParams = Object.fromEntries(
    Object.entries(queryParams).filter(([_, v]) => v !== '')
  );

  const queryString = new URLSearchParams(cleanParams).toString()
  const url = `${BASE_URL}?${queryString}`
  
  const headers = {
    'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
    'Accept': 'application/json, text/plain, */*',
    'Origin': 'https://www.jiosaavn.com',
    'Referer': 'https://www.jiosaavn.com/'
  }
  
  const response = await fetch(url, { method: 'GET', headers })
  
  // JioSaavn sometimes returns invalid trailing characters or BOM, so we text-parse safely
  const textResponse = await response.text()
  
  try {
    return JSON.parse(textResponse)
  } catch (err) {
    // Attempt to clean the response if standard parsing fails 
    // (JioSaavn API sometimes has leading/trailing non-JSON data in raw outputs)
    const jsonMatch = textResponse.match(/{.*}/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid JSON response from JioSaavn');
  }
}

// ==========================================
// 3. APP & ROUTES
// ==========================================

const app = new Hono()

// Enable standard CORS for all routes
app.use('*', cors())

/**
 * ROOT HANDLER: JioSaavn Proxy Endpoint
 * Automatically applies requested default parameters if not provided in the query string.
 */
app.get('/', async (c) => {
  const q = c.req.query()

  // Extract parameters with the exact requested default fallbacks
  const token           = q.token           ?? 'qNORzRRGvQA_';
  const type            = q.type            ?? 'label';
  const p               = q.p               ?? '';
  const n_song          = q.n_song          ?? '10';
  const n_album         = q.n_album         ?? '14';
  const category        = q.category        ?? 'latest';
  const sort_order      = q.sort_order      ?? 'desc';
  const language        = q.language        ?? 'unknown';
  const includeMetaTags = q.includeMetaTags ?? '0';
  const ctx             = q.ctx             ?? 'web6dot0';
  const api_version     = q.api_version     ?? '4';
  const format          = q._format         ?? 'json';
  const marker          = q._marker         ?? '0';

  try {
    // Construct the payload matching the required JioSaavn API structure
    const payload = {
      __call: 'webapi.get',
      token,
      type,
      p,
      n_song,
      n_album,
      category,
      sort_order,
      language,
      includeMetaTags,
      ctx,
      api_version,
      _format: format,
      _marker: marker
    }

    // Fetch and return the data
    const data = await fetchJioSaavn(payload)
    return c.json(data)

  } catch (error: any) {
    console.error('JioSaavn Fetch Error:', error.message)
    return c.json({ 
      error: 'Internal Server Error while communicating with JioSaavn', 
      details: error.message 
    }, 500)
  }
})

export default app
