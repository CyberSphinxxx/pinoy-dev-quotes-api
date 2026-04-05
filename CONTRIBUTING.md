# Contributing to Pinoy Dev Quotes API

Thank you for your interest in contributing to the **Pinoy Dev Quotes API**! This project is a community-driven collection of Filipino developer humor, "hugot", and wisdom.

## How to Add a Quote

Adding a new quote is the most impactful way to contribute. All quotes are stored in a simple JSON format at `data/quotes.json`.

### Quote Schema

Each entry in `data/quotes.json` must follow this structure:

```json
{
  "id": 21,
  "dialect": "bisaya",
  "language": "Tagalog",
  "quote": "Your quote here in dialect",
  "english_translation": "English translation here",
  "author": "Anonymous Dev",
  "tags": ["humor", "debugging"]
}
```

### Contribution Rules

1.  **Dialect**: Only `bisaya`, `tagalog`, or `english` are currently supported for the `dialect` field.
2.  **Originality**: Ensure quotes are original or properly attributed. Avoid copyrighted material.
3.  **Language**: The `language` field should describe the primary language (e.g., "Tagalog", "Bisaya", "English").
4.  **English Translation**: A translation is **required** to ensure the quote is accessible to a wider audience.
5.  **Unique ID**: The `id` must be unique and increment from the last quote in the file.
6.  **Code of Conduct**: Keep it professional and developer-focused. Avoid offensive content.

---

## Technical Setup

This project uses **Express** for the backend and **Astro** for the frontend.

### Prerequisites

- [Node.js](https://nodejs.org/) (v22 or later)
- [npm](https://www.npmjs.com/)

### Local Development

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/CyberSphinxxx/pinoy-dev-quotes-api.git
    cd pinoy-dev-quotes-api
    ```

2.  **Install Dependencies**:
    Install dependencies in both the root and the `frontend` directory:
    ```bash
    npm install
    cd frontend && npm install
    cd ..
    ```

3.  **Run Locally**:
    Use the root convenience scripts to start your development servers:
    - **Run API Only**: `npm run dev` (Starts Express at http://localhost:3000)
    - **Run Frontend Only**: `npm run dev:frontend` (Starts Astro at http://localhost:4321)
    - **Run Both Simultaneously**: `npm run dev:all` (Uses `concurrently`)

### Pull Request Guidelines

- One quote or feature per Pull Request.
- If adding a quote, only `data/quotes.json` should be modified.
- Verify your changes by running the local development server before submitting.
- Document any new features or API changes in your PR description.

Thank you for helping us grow the Pinoy Dev community! 🇵🇭🚀
