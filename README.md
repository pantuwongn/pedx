## Welcome to PE DX project

This application bundle is develop by PE section (BPK) as full-stack application.

This project was use
- [Next.js](https://nextjs.org/) framework as Frontend
- [FastAPI](https://fastapi.tiangolo.com/) framework as Backend
- [NGINX](https://www.nginx.com/) as Web service
- [Docker](https://www.docker.com/) for virtualize application environment

## Available application list
- Quality Auto Record (QAR) [only export to formal form function]
- 5M1E report system (under development)
- Production Visualize System (under development)

## Getting Started

First, define environment variable value for service

#### Next.js environment (.env.production/development)
```bash
# Secret key for encrypt and decrypt cookie for 'swr'
SECRET_COOKIE_PASSWORD = ...
# Base url of frontend (for fetch api route of Next.js)
BASE_URL_FRONTEND = http://x.x.x.x:xxxx
# URL address of backend server
BASE_URL_BACKEND = http://127.0.0.1:8000
```

#### FastAPI environment (.env)
```bash
# email for use as sender notification
EMAIL_ADDRESS = "...@gmail.com"
EMAIL_PASS = "..."
# database parameter for MSSQL
MSSQL_USER = ""
MSSQL_PASS = ""
MSSQL_SERVER = ""
MSSQL_PORT = ""
MSSQL_DB = ""
# database parameter for PostgreSQL
PG_USER = ""
PG_PASS = ""
PG_SERVER = ""
PG_PORT = ""
PG_DB = ""
# JWK secret key for encrypt and decrypt JWE token
# generate by python
# >>> from jwcrypto import jwk
# >>> key = jwk.JWK(generate='oct',size=256)
# >>> key.export()
JWK_KEY = '{"k":"...","kty":"oct"}'
JWK_REFRESH_KEY = '{"k":"...","kty":"oct"}'
# Age of generated JWE token
# units of access value = minute, refresh = days
LIFETIME_ACCESS = ...
LIFETIME_REFRESH = ...
```

After install Docker (or Docker desktop on Windows):

```bash
# build docker image
docker-compose build
# create and start docker container
docker-compose up -d
```

Then, open (https://localhost)[https://localhost] (or https://your-run-server-ip) with your browser.

## Version
1.0.0