This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Next-app [Frontend]

#### Required environment variables
```bash
# Secret key for encrypt and decrypt cookie for 'swr'
NEXT_PUBLIC_SECRET_COOKIE_PASSWORD = ...
# Base url of frontend (for fetch api route of Next.js)
NEXT_PUBLIC_BASE_URL_FRONTEND = http://x.x.x.x:xxxx
# URL address of backend server
NEXT_PUBLIC_BASE_URL_BACKEND = http://127.0.0.1:8000
```

#### Start working

```bash
# development
yarn dev
# build static files
yarn build
# deploy on local
yarn start
```