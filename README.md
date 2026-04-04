# 🇵🇭 Pinoy Dev Quotes API 🇵🇭

A free, serverless API for Filipino developer quotes, featuring Bisaya and Tagalog humor, programming struggles, and "hugot." Enhanced for **Security**, **Performance**, and **Production** use on **Vercel**.

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
   The API will be available at [http://localhost:3000](http://localhost:3000).

## ⚡ Key Features

- **Security**: Reinforced with `helmet` headers and rate limiting.
- **Performance**: Gzip compression and intelligent Caching (CDN-compatible).
- **Versioning**: Future-proof architecture with `/api/v1` routes.
- **Robustness**: JSON-based 404 and Error handling.

## 📡 API v1 Endpoints

### 1. Root Information
- **URL:** `/`
- **Method:** `GET`
- **Output:** Returns API metadata, version information, and basic documentation.

### 2. Health Check
- **URL:** `/api/health`
- **Method:** `GET`
- **Output:** `{ "status": "ok", "timestamp": "...", "version": "v1" }`

### 3. Get Random Quote
- **URL:** `/api/v1/random`
- **Method:** `GET`
- **Output:** A single random quote object.
- **Caching**: 1 minute.

### 4. Filter by Dialect
- **URL:** `/api/v1/dialect/:dialect`
- **Method:** `GET`
- **Dialects:** `bisaya`, `tagalog`
- **Output:** An array of quotes matching the specified dialect.
- **Caching**: 5 minutes.

## 🛡️ Security & Rate Limiting

To prevent abuse, the API includes rate limiting:
- **Limit**: 100 requests per 15 minutes per IP.
- **Response**: `429 Too Many Requests` when exceeded.

## 🛠️ Usage Example

Fetch a random quote using JavaScript:

```javascript
fetch('https://your-vercel-deployment.vercel.app/api/v1/random')
  .then(response => response.json())
  .then(data => {
    console.log(`${data.quote} - ${data.author}`);
  });
```

Filter for Bisaya quotes:

```javascript
fetch('https://your-vercel-deployment.vercel.app/api/v1/dialect/bisaya')
  .then(response => response.json())
  .then(data => console.log(data));
```

## 📦 Deployment to Vercel

1. Install the Vercel CLI: `npm install -g vercel`
2. Run `vercel` in the project root.
3. Follow the prompts to deploy.

## 📝 Project Structure

- `api/index.js`: Main Express application (Serverless Function).
- `quotes.json`: The database of quotes.
- `vercel.json`: Vercel routing configuration.
- `package.json`: Project dependencies and scripts.

---
Built with ❤️ for Filipino Developers. 🇵🇭💻
