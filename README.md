# kide-bot

## .env

```
DISCORD_TOKEN=
```

## Build

`docker-compose up --build -d`

## Production

You can use the following docker-compose.yml file to run the bot in production:

```yaml
version: "3.7"

services:
  kide-bot:
    image: 896896/kide-bot:latest
    container_name: kide-bot
    environment:
      DISCORD_TOKEN: ${DISCORD_TOKEN} # Define in .env file
    volumes:
      - ./kide-bot.db:/usr/src/app/prisma/dev.db
    restart: unless-stopped
```

