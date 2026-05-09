/**
 * @fileoverview Single-file JioSaavn API Proxy.
 * 
 * Maps directly to the JioSaavn endpoint:
 * https://www.jiosaavn.com/api.php?__call=webapi.get&token={token}&type={type}...
 * 
 * Returns 100% raw, original JSON results bypassing any Node.js/Hono parsing.
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
// 2. APP & ROUTES
// ==========================================

const app = new Hono()

// Enable standard CORS for all routes
app.use('*', cors())

// Documentation Endpoint
app.get('/docs', (c) => {
  return c.json({
    service: 'JioSaavn API Proxy',
    site: 'https://gana-rosy.vercel.app/',
    usage_example: 'https://gana-rosy.vercel.app/?token=qNORzRRGvQA_&type=label&p=&n_song=10&n_album=14&category=latest&sort_order=desc&language=unknown&includeMetaTags=0&ctx=web6dot0&api_version=4&_format=json&_marker=0',
    default_parameters: {
      token: "qNORzRRGvQA_",
      type: "label",
      p: " (empty string)",
      n_song: "10",
      n_album: "14",
      category: "latest",
      sort_order: "desc",
      language: "unknown",
      includeMetaTags: "0",
      ctx: "web6dot0",
      api_version: "4",
      _format: "json",
      _marker: "0"
    }
  })
})

/**
 * ROOT HANDLER: JioSaavn Proxy Endpoint
 * Automatically applies requested default parameters and returns RAW data.
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
    const payload: Record<string, string> = {
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

    // Build Query String
    const queryString = new URLSearchParams(payload).toString()
    const url = `${BASE_URL}?${queryString}`

    // Randomize User-Agent to prevent blocking
    const headers = {
      'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
      'Accept': 'application/json, text/plain, */*',
      'Origin': 'https://www.jiosaavn.com',
      'Referer': 'https://www.jiosaavn.com/'
    }

    // Fetch the data from JioSaavn
    const response = await fetch(url, { method: 'GET', headers })
    
    // EXTREMELY IMPORTANT: Grab the exact text, DO NOT parse it with JSON.parse()
    const rawText = await response.text()

    // Return the raw text as a standard Response, telling the browser it is JSON
    // This guarantees you get the 100% original results exactly as you pasted above
    return new Response(rawText, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      }
    })

  } catch (error: any) {
    console.error('JioSaavn Fetch Error:', error.message)
    return c.json({ 
      error: 'Internal Server Error while communicating with JioSaavn', 
      details: error.message 
    }, 500)
  }
})

export default app
