# Edifice React Boilerplate with Vite

This is a [ReactJS](https://reactjs.org) + [Vite](https://vitejs.dev) boilerplate.

## Getting Started

Create the project inside the project of your app

```bash
npx degit edificeio/edifice-react-boilerplate . --force
```

Go to the project directory.

```bash
cd frontend
```

## Install

### With Docker

Install all dependencies.

```bash
./build.sh initDev
```

### Without Docker

Install all dependencies.

```bash
./build-noDocker.sh initDev
```

or

```bash
node scripts/package.cjs && pnpm install
```

## Dev

### Start project

Open your project with Vite Server + HMR at <http://localhost:3000>.

```bash
nx serve
```

### [Server Options](https://vitejs.dev/config/server-options.html)

You can change Vite Server by editing `vite.config.ts`

```bash
server: {
  host: "0.0.0.0",
  port: 4200,
  open: true // open the page on <http://localhost:4200> when dev server starts.
}
```

### Lint

```bash
nx lint
```

### Prettier

```bash
nx format
```

### Pre-commit

When committing your work, `pre-commit` will start `pnpm lint-staged`:

> lint-staged starts lint + prettier

```bash
pnpm pre-commit
```

## Build

TypeScript check + Vite Build

```bash
nx build
```

## License

This project is licensed under the AGPL-3.0 license.
