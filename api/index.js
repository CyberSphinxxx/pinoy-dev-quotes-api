const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const quotes = require('../quotes.json');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Security Middleware ---
app.use(helmet()); // Basic security headers
app.use(cors());   // Enable CORS for all origins

// Rate Limiting: 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Too many requests, please try again later.",
    retry_after: "15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// --- Performance Middleware ---
app.use(compression()); // Gzip compression

// Helper to set caching headers
const setCache = (res, seconds = 60) => {
  res.set('Cache-Control', `public, s-maxage=${seconds}, stale-while-revalidate=${seconds / 2}`);
};

// --- Routes ---

// 1. Root Information
app.get('/', (req, res) => {
  res.json({
    message: "Welcome to the Pinoy Dev Quotes API! 🇵🇭💻",
    description: "A free serverless API for Filipino programmer humor and hugot.",
    version: "v1",
    endpoints: {
      health: "/api/health",
      random: "/api/v1/random",
      filter_by_dialect: "/api/v1/dialect/:dialect"
    },
    repository: "https://github.com/CyberSphinxxx/pinoy-dev-quotes-api"
  });
});

// 2. Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "v1"
  });
});

// --- API v1 Endpoints ---

const v1 = express.Router();

// Random Quote
v1.get('/random', (req, res) => {
  res.set('Cache-Control', 'no-store'); // Ensure randomness
  const randomIndex = Math.floor(Math.random() * quotes.length);
  res.json(quotes[randomIndex]);
});

// Filter by Dialect
v1.get('/dialect/:dialect', (req, res) => {
  const dialect = req.params.dialect.toLowerCase().trim();
  
  // Basic sanitization: only allow alphanumeric characters
  if (!/^[a-z0-9]+$/i.test(dialect)) {
    return res.status(400).json({ error: "Invalid dialect format." });
  }

  const filteredQuotes = quotes.filter(q => q.dialect.toLowerCase() === dialect);

  if (filteredQuotes.length > 0) {
    setCache(res, 300); // Cache success for 5 minutes
    res.json(filteredQuotes);
  } else {
    res.status(404).json({
      error: `No quotes found for dialect: '${dialect}'`,
      available_dialects: ["bisaya", "tagalog"]
    });
  }
});

app.use('/api/v1', v1);

// Backward Compatibility /api/random -> /api/v1/random
app.get('/api/random', (req, res) => res.redirect(301, '/api/v1/random'));
app.get('/api/dialect/:dialect', (req, res) => res.redirect(301, `/api/v1/dialect/${req.params.dialect}`));

// --- Error Handling ---

// 404 Handler for API
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: "API endpoint not found." });
});

// Generic Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong on our end.",
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server for local testing
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
