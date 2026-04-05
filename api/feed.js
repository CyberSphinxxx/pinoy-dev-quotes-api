const express = require('express');
const quotes = require('../data/quotes.json');

const router = express.Router();

router.get('/', (req, res) => {
  const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>Pinoy Dev Quotes API Feed</title>
  <link>https://pinoy-dev-quotes-api.vercel.app</link>
  <description>Latest dev quotes and hugot from the Philippines.</description>
  ${quotes.map(q => `
  <item>
    <title>Quote #${q.id} by ${q.author}</title>
    <link>https://pinoy-dev-quotes-api.vercel.app/api/v1/quotes/${q.id}</link>
    <description><![CDATA[ [${q.dialect.toUpperCase()} | ${q.language}] "${q.quote}" - ${q.english_translation} ]]></description>
    <pubDate>${new Date(q.date_added).toUTCString()}</pubDate>
    <guid>https://pinoy-dev-quotes-api.vercel.app/api/v1/quotes/${q.id}</guid>
  </item>`).join('')}
</channel>
</rss>`;

  res.set('Content-Type', 'application/xml');
  res.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=1800');
  res.send(rssXml);
});

module.exports = router;
