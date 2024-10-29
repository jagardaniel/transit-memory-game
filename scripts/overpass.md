We need a way to display the actual lines for each metro line on the map. I have no idea if this is the best way to do it but it seems to work good enough for this project.

I used a web page called [overpass-turbo.eu](https://overpass-turbo.eu/) to run an Overpass API query that ChatGPT helped me create (I'm not smart enough...). You can then choose to export the data as GeoJSON file, a format that Leaflet can load and display on our map.

This is the query that gives us lines for the red metro line in Stockholm:

```
[out:json];
relation["network"="Stockholms tunnelbana"]["name"~"^(14: Fruängen - Mörby centrum|13: Norsborg - Ropsten)$"];
way(r)["railway"!="platform"];
out geom;
```

The reason why I use a name "14: Fruängen - Mörby Centrum" instead of ref=14 (which gives us Mörby Centrum - Fruängen as well) is that it would paint two lines side by side. It looks worse in my opinion and it also is more GeoJSON data that we don't need. You can also include the stations in the GeoJSON data but I found it harder to work with and it also had double stations on some places.

Names used in the queries:

```
// Blå linjen
10: Hjulsta - Kungsträdgården
11: Akalla - Kungsträdgården

// Röda linjen
13: Ropsten - Norsborg
14: Mörby centrum - Fruängen

// Gröna linjen
17: Hässelby strand - Skarpnäck
18: Hässelby strand - Farsta strand
19: Hässelby strand - Hagsätra
```
