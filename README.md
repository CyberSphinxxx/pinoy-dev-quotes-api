# 🇵🇭 Pinoy Dev Quotes API 🇵🇭

A free, serverless API for Filipino developer quotes — featuring **7 Philippine dialects**, dev humor, programming struggles, and "hugot." Enhanced with OG image generation, GraphQL, full-text search, and an interactive docs playground.

> **Live:** [pinoy-dev-quotes-api.vercel.app](https://pinoy-dev-quotes-api.vercel.app)

## 🚀 Getting Started

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/CyberSphinxxx/pinoy-dev-quotes-api.git
   cd pinoy-dev-quotes-api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   The API and interactive docs will be available at [http://localhost:3000](http://localhost:3000).

## ⚡ Key Features

- **7 Dialects**: Bisaya, Tagalog, Ilocano, Kapampangan, Waray, Hiligaynon, Bikolano
- **REST + GraphQL**: Choose your preferred query interface
- **OG Image Cards**: Dynamically generated PNG images for social sharing
- **Full-Text Search**: Search across quotes, translations, authors, and tags
- **Interactive Playground**: Beautiful landing page with a live API tester
- **Multiple Formats**: JSON, plain text, or markdown output
- **RSS Feed**: Subscribe to quotes via any RSS reader
- **Embeddable Widget**: Drop a quote widget into any webpage
- **Security**: Helmet headers, rate limiting (100 req/15 min), CORS
- **Performance**: Gzip compression, ETag support, CDN-aware caching
- **Versioned API**: Future-proof `/api/v1` routing

## 📡 API Endpoints

### System
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Interactive API documentation page |
| `GET` | `/api/health` | Health check (`{ status: "ok" }`) |

### Quotes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/random` | Random quote. Add `?count=N` for multiple (max 50) |
| `GET` | `/api/v1/qotd` | Quote of the Day (same for everyone, changes daily) |
| `GET` | `/api/v1/quotes` | All quotes, paginated. `?page=1&limit=10` |
| `GET` | `/api/v1/quotes/:id` | Get a specific quote by ID |
| `GET` | `/api/v1/quotes/:id/image` | Generate a 1200×630 PNG OG card for the quote |
| `GET` | `/api/v1/search?q=...` | Full-text search across quotes, translations, authors, tags |

### Dialects
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/dialects` | List all available dialects |
| `GET` | `/api/v1/dialect/:dialect` | Get all quotes for a specific dialect |
| `GET` | `/api/v1/dialect/:dialect/random` | Random quote from a specific dialect |

### Tools
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/embed` | Get an HTML/JS embed widget snippet |
| `GET` | `/api/v1/cors-check` | Check CORS configuration for your origin |
| `GET` | `/api/v1/feed.xml` | RSS 2.0 feed of all quotes |
| `POST` | `/api/v1/graphql` | GraphQL endpoint for flexible queries |

### Response Formats

Append `?format=text` or `?format=markdown` to any quote endpoint for alternative output:
```bash
# Plain text
curl "https://pinoy-dev-quotes-api.vercel.app/api/v1/random?format=text"
# → "Maypa ang bug, pirmi nimo ginapangita..." - Anonymous Dev

# Markdown
curl "https://pinoy-dev-quotes-api.vercel.app/api/v1/random?format=markdown"
# → > Maypa ang bug, pirmi nimo ginapangita...
# → > _- Anonymous Dev_
```

## 🛠️ Usage Examples

### JavaScript
```javascript
const res = await fetch('https://pinoy-dev-quotes-api.vercel.app/api/v1/random');
const { data } = await res.json();
console.log(`"${data.quote}" — ${data.author}`);
```

### Python
```python
import requests

r = requests.get("https://pinoy-dev-quotes-api.vercel.app/api/v1/random")
quote = r.json()["data"]
print(f'"{quote["quote"]}" — {quote["author"]}')
```

### GraphQL
```graphql
# POST to /api/v1/graphql
{
  quotes(dialect: "bisaya", limit: 3) {
    id
    quote
    english_translation
    author
    tags
  }
}
```

### HTTPie
```bash
# Random quote
http GET pinoy-dev-quotes-api.vercel.app/api/v1/random

# Search for "hugot"
http GET "pinoy-dev-quotes-api.vercel.app/api/v1/search?q=hugot"

# Quote of the Day
http GET pinoy-dev-quotes-api.vercel.app/api/v1/qotd
```

## 📦 Sample Response

All JSON endpoints return a standardized wrapper:

```json
{
  "success": true,
  "meta": {
    "timestamp": "2024-01-01T12:00:00.000Z",
    "is_random": true
  },
  "data": {
    "id": 1,
    "dialect": "bisaya",
    "quote": "Maypa ang bug, pirmi nimo ginapangita. Ako tawon, kalimtan lang.",
    "english_translation": "It's better to be a bug, you always search for it. Me, I'm just forgotten.",
    "author": "Anonymous Dev",
    "tags": ["hugot", "debugging", "sad"],
    "date_added": "2024-01-01T12:00:00Z",
    "source": "Twitter"
  }
}
```

## 🛡️ Security & Rate Limiting

- **Rate Limit**: 100 requests per 15 minutes per IP
- **Headers**: Secured with `helmet`
- **CORS**: Enabled for all origins
- **Response**: `429 Too Many Requests` when limit exceeded

## 📝 Project Structure

```
├── api/
│   ├── index.js       # Main Express app — REST endpoints & middleware
│   ├── graphql.js     # GraphQL schema & resolvers
│   ├── og.js          # OG image generation (Satori + resvg)
│   └── feed.js        # RSS feed generator
├── public/
│   ├── index.html     # Interactive API docs landing page
│   ├── openapi.json   # OpenAPI 3.0 specification
│   └── fonts/         # Inter font for image generation
├── quotes.json        # Quote database (20 quotes, 7 dialects)
├── vercel.json        # Vercel routing config
└── package.json       # Dependencies & scripts
```

## 📦 Deployment to Vercel

1. Install the Vercel CLI: `npm install -g vercel`
2. Run `vercel` in the project root.
3. Follow the prompts to deploy.

---
Built with ❤️ for Filipino Developers. 🇵🇭💻
