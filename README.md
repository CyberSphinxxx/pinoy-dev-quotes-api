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

- **7 Dialects & Specific Languages**: Bisaya (Cebuano), Tagalog (Filipino), Ilocano, Kapampangan, Waray, Hiligaynon, Bikolano
- **REST + GraphQL**: Choose your preferred query interface
- **OG Image Cards**: Dynamically generated PNG images with dialect/language metadata
- **API Key Authentication**: Support for tiered rate limits (up to 1,000 req/15 min)
- **Interactive Playground**: Beautiful landing page with a live API tester and code snippets
- **Multiple Formats**: JSON, plain text, or markdown output
- **RSS Feed**: Subscribe to quotes via any RSS reader
- **Embeddable Widget**: Drop a quote widget into any webpage
- **Performance**: Gzip compression, ETag support, CDN-aware caching
- **Versioned API**: Future-proof `/api/v1` routing

## 📡 API Endpoints

### System
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Interactive API documentation page |
| `GET` | `/api/v1` | Root API index with ready-to-use SDK snippets |
| `GET` | `/api/health` | Health check (`{ status: "ok" }`) |

### Quotes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/random` | Random quote. Add `?count=N` for multiple (max 50) |
| `GET` | `/api/v1/qotd` | Quote of the Day (same for everyone, changes daily) |
| `GET` | `/api/v1/quotes` | All quotes, paginated. `?page=1&limit=10` |
| `GET` | `/api/v1/quotes/:id` | Get a specific quote by ID |
| `GET` | `/api/v1/quotes/:id/image` | Generate a 1200×630 PNG OG card with language labels |
| `GET` | `/api/v1/search?q=...` | Full-text search across quotes, translations, authors, tags |

### tools
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/dialects` | List all available dialects |
| `GET` | `/api/v1/dialect/:dialect/random` | Random quote from a specific dialect |
| `GET` | `/api/v1/feed.xml` | RSS 2.0 feed with rich descriptions |
| `POST` | `/api/v1/graphql` | GraphQL endpoint for flexible queries |

## 🛡️ Authentication & Rate Limits

The API offers two tiers of access:

- **Public Access**: No key required. Limited to **100 requests per 15 minutes**.
- **Premium Access**: Requires an API key. Increased to **1,000 requests per 15 minutes**.

### How to use your API Key:
Include your key via the `Authorization` header or as a query parameter:
```bash
# via Header
curl -H "Authorization: Bearer <your_key>" https://api.url...

# via Query Param
curl "https://api.url...?api_key=<your_key>"
```

## 🛠️ Usage Examples

### GraphQL
```graphql
# POST to /api/v1/graphql
{
  quotes(language: "Cebuano", limit: 3) {
    id
    quote
    dialect
    language
    author
  }
}
```

### JSON Response Structure
```json
{
  "success": true,
  "meta": {
    "timestamp": "2024-01-01T12:00:00.000Z"
  },
  "data": {
    "id": 1,
    "dialect": "bisaya",
    "language": "Cebuano",
    "quote": "Maypa ang bug, pirmi nimo ginapangita. Ako tawon, kalimtan lang.",
    "english_translation": "It's better to be a bug, you always search for it. Me, I'm just forgotten.",
    "author": "Anonymous Dev",
    "tags": ["hugot", "debugging", "sad"],
    "date_added": "2024-01-01T12:00:00Z",
    "source": "Twitter"
  }
}
```

## 📝 Project Structure

```
├── api/
│   ├── index.js       # Main Express app & middleware
│   ├── graphql.js     # GraphQL schema & resolvers
│   ├── snippets.js    # SDK/Code snippets module
│   ├── og.js          # OG image generation
│   └── feed.js        # RSS feed generator
├── public/
│   ├── index.html     # Interactive documentation
│   ├── openapi.json   # OpenAPI 3.0 spec
│   └── fonts/         # Inter font for cards
├── quotes.json        # Quote database (20 quotes)
├── vercel.json        # Vercel deployment config
└── package.json       # Node.js dependencies
```

---
Built with ❤️ for Filipino Developers. 🇵🇭💻
