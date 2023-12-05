# Next.js Sample App

A [Next.js](https://nextjs.org/) starter app for building [BigCommerce Single-Click Applications](https://developer.bigcommerce.com/docs/integrations/apps).

## Getting Started

Copy `.env.example` and fill out environment variables

```bash
cp .env.example .env.local
```

Scaffold a local `sqlite` database

```bash
pnpm db:push
```

Run the development server

```bash
pnpm dev
```

Point a localhost tunnel to port 3000

```bash
ngrok http 3000 --domain=sca-modern.ngrok.dev
```

Update your `auth`, `load`, and `uninstall` callback URL's in the [Developer Portal](https://devtools.bigcommerce.com)

## Deploy
