import { Line, LineType } from "./models/Line";

export async function loadMetroSplit(): Promise<Line[]> {
  const redLine = await Line.create("Röda linjen", "red", LineType.Metro);
  const greenLine = await Line.create("Gröna linjen", "green", LineType.Metro);
  const blueLine = await Line.create("Blå linjen", "blue", LineType.Metro);
  return [redLine, greenLine, blueLine];
}

// Can be used if we want to count all metro lines a the same Line
// This is red+green+blue merged into the same file and removed duplicate stations
export async function loadMetroFull(): Promise<Line> {
  const blueLine = await Line.create("Tunnelbanan", "full", LineType.Metro);
  return blueLine;
}

export async function loadPendeltag(): Promise<Line> {
  const pendeltag = await Line.create("Pendeltåg", "pendeltag", LineType.CommuterRail);
  return pendeltag;
}

// Lidingöbanan
export async function loadLidingobanan(): Promise<Line> {
  const lidingobanan = await Line.create("Lidingöbanan", "lidingobanan", LineType.Tram);
  return lidingobanan;
}

// Spårväg City
export async function loadSparvagCity(): Promise<Line> {
  const sparvagCity = await Line.create("Spårväg City", "sparvagcity", LineType.Tram);
  return sparvagCity;
}

export async function loadNockebybanan(): Promise<Line> {
  const nockeby = await Line.create("Nockebybanan", "nockebybanan", LineType.Tram);
  return nockeby;
}

// Tvärbanan
export async function loadTvarbanan(): Promise<Line> {
  const tvarbanan = await Line.create("Tvärbanan", "tvarbanan", LineType.Tram);
  return tvarbanan;
}

// Roslagsbanan
export async function loadRoslagsbanan(): Promise<Line> {
  const roslagsbanan = await Line.create("Roslagsbanan", "roslagsbanan", LineType.LightRail);
  return roslagsbanan;
}
