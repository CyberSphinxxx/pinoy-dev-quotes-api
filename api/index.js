const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const quotes = require('../data/quotes.json');

// Modular Routers
const graphqlRouter = require('./graphql');
const ogRouter = require('./og');
const feedRouter = require('./feed');
const snippets = require('./snippets');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

// API Keys Configuration
const premiumKeys = (process.env.API_KEYS || '').split(',').filter(k => k.trim());

// API Key Middleware
const apiKeyMiddleware = (req, res, next) => {
  const authHeader = req.get('Authorization');
  const queryKey = req.query.api_key;
  let key = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    key = authHeader.split(' ')[1];
  } else if (queryKey) {
    key = queryKey;
  }

  req.isPremium = key && premiumKeys.includes(key);
  next();
};

app.use(apiKeyMiddleware);

// --- Security Middleware ---
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
    },
  },
}));
app.use(cors());   

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req, res) => {
    return req.isPremium ? 1000 : 100;
  },
  message: {
    error: "Too many requests. Please try again later or use an API key for higher limits.",
    retry_after: "15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// --- Performance Middleware ---
app.use(compression());
app.set('etag', true); // Enable ETags for smart caching

// --- Static Files & Routing ---
// Vercel serves static files from the 'frontend/dist' directory (via vercel.json outputDirectory).
// The API only handles /api/* routes.

// Custom middleware to log requests
app.use((req, res, next) => {
  const time = new Date().toISOString();
  console.log(`[${time}] ${req.method} ${req.originalUrl} - ${req.isPremium ? 'PREMIUM' : 'PUBLIC'}`);
  next();
});

// Helper: check if data looks like a quote object
const isQuoteData = (data) => {
  if (Array.isArray(data)) return data.length > 0 && data[0].quote;
  return data && data.quote;
};

// Helper to wrap JSON responses to standard format
const respondWithMeta = (res, data, meta = {}, statusCode = 200, cacheConfig = null) => {
  if (cacheConfig) {
    res.set('Cache-Control', cacheConfig);
  }
  
  // Format check — only apply text/markdown to quote-shaped data
  if (res.req.query.format === 'text' && isQuoteData(data)) {
    res.set('Content-Type', 'text/plain');
    if (Array.isArray(data)) {
        return res.status(statusCode).send(data.map(q => `"${q.quote}" - ${q.author} (${q.dialect} | ${q.language})`).join('\n'));
    }
    return res.status(statusCode).send(`"${data.quote}" - ${data.author} (${data.dialect} | ${data.language})`);
  } else if (res.req.query.format === 'markdown' && isQuoteData(data)) {
    res.set('Content-Type', 'text/markdown');
    if (Array.isArray(data)) {
        return res.status(statusCode).send(data.map(q => `> ${q.quote}\n> _- ${q.author} (${q.dialect} | ${q.language})_`).join('\n\n'));
    }
    return res.status(statusCode).send(`> ${data.quote}\n> _- ${data.author} (${data.dialect} | ${data.language})_`);
  }

  res.status(statusCode).json({
    success: statusCode >= 200 && statusCode < 300,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
    data
  });
};

// --- API v1 Endpoints ---
const v1 = express.Router();

// Root endpoint with snippets
v1.get('/', (req, res) => {
  respondWithMeta(res, {
    message: "Welcome to Pinoy Dev Quotes API v1",
    documentation: "https://pinoy-dev-quotes-api.vercel.app",
    endpoints: {
      stats: "/v1/stats",
      dialects: "/v1/dialects",
      random: "/v1/random",
      search: "/v1/search?q={query}",
      qotd: "/v1/qotd",
      graphql: "/v1/graphql",
      rss: "/v1/feed.xml"
    },
    examples: snippets,
    auth: {
      type: "Optional API Key",
      header: "Authorization: Bearer <your_key>",
      benefits: "Increases rate limit from 100 to 1000 requests per 15 minutes."
    }
  });
});

// Stats
v1.get('/stats', (req, res) => {
  const dialects = new Set(quotes.map(q => q.dialect));
  respondWithMeta(res, {
    total_quotes: quotes.length,
    total_dialects: dialects.size,
    dialects: Array.from(dialects)
  }, {}, 200, 'public, s-maxage=3600');
});

// Dialects list
v1.get('/dialects', (req, res) => {
  const dialects = Array.from(new Set(quotes.map(q => q.dialect)));
  respondWithMeta(res, dialects, { count: dialects.length }, 200, 'public, s-maxage=3600');
});

// Quote of the Day (seeded random based on date)
v1.get('/qotd', (req, res) => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  // Simple seed generator from string
  let seed = 0;
  for(let i=0; i<today.length; i++) seed += today.charCodeAt(i);
  const qotdIndex = seed % quotes.length;
  
  // QOTD: Fresh response every time to ensure live metadata timestamp
  respondWithMeta(res, quotes[qotdIndex], { type: 'qotd', date: today }, 200, 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0');
});

// Random Quote
v1.get('/random', (req, res) => {
  const count = parseInt(req.query.count) || 1;
  const tag = req.query.tag ? req.query.tag.toLowerCase().trim() : null;
  const maxSafeCount = Math.min(count, 50); // limit to 50
  
  let pool = quotes;
  if (tag) {
    pool = quotes.filter(q => q.tags && q.tags.some(t => t.toLowerCase() === tag));
    if (pool.length === 0) return res.status(404).json({ error: `No quotes found for tag: '${tag}'` });
  }

  if (maxSafeCount === 1) {
    const randomIndex = Math.floor(Math.random() * pool.length);
    return respondWithMeta(res, pool[randomIndex], { is_random: true, tag }, 200, 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0');
  }

  // Shuffle array and take N
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, maxSafeCount);
  
  respondWithMeta(res, selected, { count: selected.length, is_random: true, tag }, 200, 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0');
});

// Search
v1.get('/search', (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: "Missing search query parameter 'q'." });
  
  const qLower = q.toLowerCase();
  const results = quotes.filter(quoteObj => 
    quoteObj.quote.toLowerCase().includes(qLower) || 
    quoteObj.english_translation.toLowerCase().includes(qLower) ||
    quoteObj.author.toLowerCase().includes(qLower) ||
    (quoteObj.tags && quoteObj.tags.some(tag => tag.toLowerCase().includes(qLower)))
  );

  respondWithMeta(res, results, { query: q, count: results.length });
});

// Random by Dialect — MUST be registered BEFORE /dialect/:dialect to avoid being swallowed
v1.get('/dialect/:dialect/random', (req, res) => {
    const dialect = req.params.dialect.toLowerCase().trim();
    const filteredQuotes = quotes.filter(q => q.dialect.toLowerCase() === dialect);
    if (filteredQuotes.length === 0) return res.status(404).json({ error: `No quotes found for dialect: '${dialect}'` });
    
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    respondWithMeta(res, filteredQuotes[randomIndex], { dialect, is_random: true }, 200, 'no-store, no-cache, must-revalidate');
});

// Filter by Dialect
v1.get('/dialect/:dialect', (req, res) => {
  const dialect = req.params.dialect.toLowerCase().trim();
  
  if (!/^[a-z0-9]+$/i.test(dialect)) {
    return res.status(400).json({ error: "Invalid dialect format." });
  }

  const filteredQuotes = quotes.filter(q => q.dialect.toLowerCase() === dialect);

  if (filteredQuotes.length > 0) {
    respondWithMeta(res, filteredQuotes, { dialect, count: filteredQuotes.length }, 200, 'public, s-maxage=300');
  } else {
    res.status(404).json({ error: `No quotes found for dialect: '${dialect}'` });
  }
});

// Get all quotes (Pagination & Filter)
v1.get('/quotes', (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, Math.min(parseInt(req.query.limit) || 10, 100));
  const tag = req.query.tag ? req.query.tag.toLowerCase().trim() : null;
  
  let results = quotes;
  if (tag) {
    results = quotes.filter(q => q.tags && q.tags.some(t => t.toLowerCase() === tag));
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedResults = results.slice(startIndex, endIndex);

  respondWithMeta(res, paginatedResults, { 
      page, limit, total: results.length, total_pages: Math.ceil(results.length / limit), tag
  });
});

// Get Quote by ID
v1.get('/quotes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const quoteObj = quotes.find(q => q.id === id);

  if (!quoteObj) {
    return res.status(404).json({ error: "Quote not found." });
  }
  
  respondWithMeta(res, quoteObj, { id }, 200, 'public, s-maxage=3600');
});

// Embed Widget
v1.get('/embed', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const snippet = `<!-- Pinoy Dev Quotes Widget -->
<div id="pinoy-quote-widget"></div>
<script>
(function() {
  fetch('${baseUrl}/api/v1/random')
    .then(r => r.json())
    .then(d => {
      const q = d.data;
      document.getElementById('pinoy-quote-widget').innerHTML =
        '<blockquote style="font-family:sans-serif;padding:16px 24px;border-left:4px solid #0ea5e9;background:#0f172a;color:#f8fafc;border-radius:8px;max-width:480px">' +
        '<p style="font-size:18px;margin:0 0 8px">"' + q.quote + '"</p>' +
        '<p style="font-size:14px;color:#94a3b8;margin:0 0 4px">' + q.english_translation + '</p>' +
        '<footer style="font-size:13px;color:#38bdf8;margin-top:12px">— ' + q.author + ' | ' + q.dialect + '</footer>' +
        '</blockquote>';
    });
})();
</script>`;
  
  respondWithMeta(res, { snippet, usage: 'Paste this HTML into any webpage to display a random Pinoy Dev Quote.' });
});

// CORS Check
v1.get('/cors-check', (req, res) => {
  const origin = req.get('origin') || req.get('referer') || 'No origin detected';
  respondWithMeta(res, {
    cors_enabled: true,
    your_origin: origin,
    allowed_origins: '*',
    allowed_methods: ['GET', 'POST', 'OPTIONS'],
    message: 'CORS is enabled for all origins. You can call this API from any domain.'
  });
});

// Mount Image Generator
v1.use('/quotes', ogRouter);

app.use('/api/v1', v1);

// Backward Compatibility Redirects
app.get('/api/random', (req, res) => res.redirect(301, '/api/v1/random'));
app.get('/api/dialect/:dialect', (req, res) => res.redirect(301, `/api/v1/dialect/${encodeURIComponent(req.params.dialect)}`));

// Mount GraphQL
app.use('/api/v1/graphql', graphqlRouter);

// Mount RSS
app.use('/api/v1/feed.xml', feedRouter);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), version: "v1" });
});

// --- Error Handling ---
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: "API endpoint not found." });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong on our end.",
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
