# SuperConductor telemetry

This is the source code that handles receiving telemetry from SuperConductor.

It is deployed to SuperFly.tv's DigitalOcean account, here: https://faas-ams3-2a2df116.doserverless.co/api/v1/web/fn-7ba9c1fc-f987-4993-b324-a86c98928fcb/PACKAGE/FUNCTION

## Getting started

1. Install doctl: https://docs.digitalocean.com/reference/doctl/how-to/install/
2. Create an `.env`-file in the superconductor-telemetry-directory and add appropriate environment variables

## Commands

```bash

# Deploy serverless functions:
npm run deploy
# Watch for changes and deploy:
npm run watch

# Invoke various functions
npm run invoke:insert
npm run invoke:report -- accessToken:SECRET

https://faas-ams3-2a2df116.doserverless.co/api/v1/web/fn-7ba9c1fc-f987-4993-b324-a86c98928fcb/telemetry/report?accessToken=SECRET

```
