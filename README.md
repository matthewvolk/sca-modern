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

### Optimizing Builds

Inside of `next.config.js`, you'll notice that errors from both Typescript and ESLint are ignored during builds. While this may seem controversial, a `.github/workflows/ci.yaml` file ships with this application; instead of blocking our builds inside of our deployment pipeline if we run into Typescript/ESLint errors, we can run both `lint` and `typecheck` inside of GitHub Actions so that we can fix these errors inside of a GitHub pull request before those errors are merged into your main branch.

The other big benefit to this configuration is that builds will take less time to complete. Vercel, for example, caps the number of build minutes you are allotted per month; so every second saved could end up saving you money.

If you would rather run everything in one place, feel free to delete the `typescript` and `eslint` fields in `next.config.js`.
