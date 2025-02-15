# transit-memory-game

https://jagardaniel.github.io/transit-memory-game/

A station name guessing game for the Swedish public transport system. Very inspired by [London Tube Memory Game](https://london.metro-memory.com/) and [light-rail-game](https://github.com/simonprickett/light-rail-game).

Current lines (Stockholm):

- Tunnelbanan (gröna, blå, röda)
- Pendeltåg
- Roslagsbanan
- Tvärbanan
- Lidingöbanan
- Spårväg City
- Nockebybanan
- Saltsjöbanan (without Slussen - under construction)

## Description

Svelte application created with [vite](https://vite.dev/) (svelte-ts). [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/) displays the interactive map with data from [OpenStreetMap](https://www.openstreetmap.or). Tiles without labels from [Carto](https://carto.com/). [Overpass-turbo](https://overpass-turbo.eu/) used to query OpenStreetMap data and export it to GeoJSON.

[ChatGPT](https://chatgpt.com/) and old [Stack Overflow](https://stackoverflow.com/) posts has made this project possible.

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
