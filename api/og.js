const express = require('express');
const { default: satori } = require('satori');
const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');
const quotes = require('../data/quotes.json');

const router = express.Router();

let fontData = null;
try {
  // Primary: woff file (satori supports .ttf, .otf, .woff but NOT .woff2)
  const fontPath = path.resolve(__dirname, '../data/fonts/Inter-Bold.woff');
  fontData = fs.readFileSync(fontPath);
} catch (error) {
  try {
    // Fallback: @fontsource/inter from node_modules
    const fallbackPath = path.resolve(__dirname, '../node_modules/@fontsource/inter/files/inter-latin-700-normal.woff');
    fontData = fs.readFileSync(fallbackPath);
  } catch (e2) {
    console.error("Warning: No font file found. Image generation will be unavailable.");
  }
}

router.get('/:id/image', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const quoteObj = quotes.find(q => q.id === id);

    if (!quoteObj) {
      return res.status(404).json({ error: "Quote not found." });
    }

    if (!fontData) {
      return res.status(503).json({ error: "Image generation unavailable — font not loaded." });
    }

    const jsx = {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: '#0f172a', // Slate 900
          padding: '60px',
          fontFamily: 'Inter',
          color: '#f8fafc', // Slate 50
          justifyContent: 'center',
          boxSizing: 'border-box'
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                fontSize: 64,
                fontStyle: 'italic',
                marginBottom: '20px',
                lineHeight: 1.2
              },
              children: `"${quoteObj.quote}"`
            }
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                fontSize: 32,
                color: '#94a3b8', // Slate 400
                marginBottom: '20px',
              },
              children: quoteObj.english_translation
            }
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                fontSize: 24,
                color: '#38bdf8', // Sky 400
                marginBottom: '40px',
                fontWeight: 600,
                letterSpacing: '0.05em'
              },
              children: `🇵🇭 ${quoteObj.dialect.toUpperCase()} | ${quoteObj.language}`
            }
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '2px solid #334155',
                paddingTop: '20px',
                marginTop: 'auto',
                fontSize: 28,
              },
              children: [
                {
                  type: 'span',
                  props: {
                    style: { display: 'flex' },
                    children: `- ${quoteObj.author}`
                  }
                },
                {
                  type: 'span',
                  props: {
                    style: { display: 'flex', color: '#38bdf8' },
                    children: `🇵🇭 pinoy-dev-quotes-api.vercel.app`
                  }
                }
              ]
            }
          }
        ]
      }
    };

    const svg = await satori(jsx, {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: fontData,
          weight: 700,
          style: 'normal',
        },
      ],
    });

    const resvg = new Resvg(svg, {
      font: { loadSystemFonts: false },
      fitTo: { mode: 'width', value: 1200 }
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, s-maxage=31536000, stale-while-revalidate=86400');
    res.send(pngBuffer);

  } catch (error) {
    console.error("Image generation error:", error);
    res.status(500).json({ error: "Failed to generate format. Check server logs." });
  }
});

module.exports = router;
