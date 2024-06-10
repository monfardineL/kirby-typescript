# kirby-typescript

Kirby-like game, developed in TypeScript, using [Kaboom](https://github.com/replit/kaboom)/[Kaplay](https://github.com/marklovers/kaplay).

I do not own any rights for the game. All of the base, including code and art, is based on [JSLegendDev](https://github.com/JSLegendDev/) following tutorial:

[![TypeScript Kirby-like Platformer Tutorial](https://img.youtube.com/vi/rICeqnbzkZk/0.jpg)](https://www.youtube.com/watch?v=rICeqnbzkZk)

Original code: [Kirby-like-ts](https://github.com/JSLegendDev/Kirby-like-ts/)

## Build

Use steps bellow to build and pack the application:

### Application

```bash

# Run development mode
npm run dev

# Build the application to dist folder
npm run build

```

### Docker image

The following command packs the application to a NGINX Docker image:

```bash
docker build -t kirby-typescript:nginx-1.27.0-alpine -f Docker/Dockerfile .
```

## Run

Run the game as a docker container:

```bash
docker run -it --rm -p 8080:8080 ghcr.io/monfardinel/kirby-typescript:latest
```

Then head to your browser and open `localhost:8080`.

Use `left` and `right` arrows to move, `z` to inhale and `x` to jump.
