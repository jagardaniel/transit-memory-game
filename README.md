# transit-memory-game

A station name guessing game for the Swedish public transport system. Currently supports Stockholm's metro system. The game has a dynamic map that makes guessing more interactive. Very inspired by [London Tube Memory Game](https://london.metro-memory.com/) and [light-rail-game](https://github.com/simonprickett/light-rail-game).

## Description

Typescript application created with [vite](https://vite.dev/). It uses the JavaScript library [Leaflet](https://leafletjs.com/) for displaying the interactive map from [OpenStreetMap](https://www.openstreetmap.or). Tiles without names from [Carto](https://carto.com/). [Overpass-turbo](https://overpass-turbo.eu/) used to query OpenStreetMap data and export it to GeoJSON.

[ChatGPT](https://chatgpt.com/) and old [Stack Overflow](https://stackoverflow.com/) posts has made this possible.

## Development

Clone repository

```bash
$ git clone https://github.com/jagardaniel/transit-memory-game.git
```

Install dependencies

```bash
$ cd transit-memory-game/
$ npm install
```

Run development server

```bash
$ npm run dev
```
