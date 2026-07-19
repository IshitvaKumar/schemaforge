# SchemaForge

A visual PostgreSQL schema designer built with Next.js, TypeScript, Tailwind CSS, and React Flow. Design an ER diagram, connect foreign keys, and export ready-to-run `CREATE TABLE` statements—entirely in the browser.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3011`. This project uses port 3011 by default so it can run alongside another local app using the usual port 3000.

## Included in Version 1

- Drag-and-drop ER diagram canvas
- Editable tables, fields, PostgreSQL types, and primary keys
- Foreign-key relationships drawn from a field to a primary key
- Live PostgreSQL DDL preview, copy, and `.sql` download
- Local browser persistence with `localStorage`
- Preloaded e-commerce database example

## Deploy

Import this repository into Vercel. It is a static Next.js application and needs no environment variables, backend, or API keys.
