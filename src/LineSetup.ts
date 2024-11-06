import { Line, LineType } from "./models/Line";

const defaultCorrections = {
  "t centralen": "T-Centralen",
  centralen: "T-Centralen",
};

// Metro
const greenLineMetroCorrections = {
  ...defaultCorrections,
  "st eriksplan": "S:t Eriksplan",
  "sankt eriksplan": "S:t Eriksplan",
};

export async function loadMetro(): Promise<Line[]> {
  const redLine = await Line.create("Röda linjen", "red", "#d71d24", LineType.Metro, defaultCorrections);
  const greenLine = await Line.create("Gröna linjen", "green", "#148541", LineType.Metro, greenLineMetroCorrections);
  const blueLine = await Line.create("Blå linjen", "blue", "#007db8", LineType.Metro, defaultCorrections);

  return [redLine, greenLine, blueLine];
}

// Pendeltåg
const pendeltagCorrections = {
  "uppsala centrum": "Uppsala C",
  "arlanda central": "Arlanda C",
};

export async function loadPendeltag(): Promise<Line> {
  const pendeltag = await Line.create("Pendeltåg", "pendeltag", "#f266a6", LineType.CommuterRail, pendeltagCorrections);
  return pendeltag;
}

// Lidingöbanan
export async function loadLidingobanan(): Promise<Line> {
  const lidingobanan = await Line.create("Lidingöbanan", "lidingobanan", "#b65f1f", LineType.Tram);
  return lidingobanan;
}

const sparvagCityCorrections = {
  ...defaultCorrections,
  "nordiska museet": "Nordiska museet/Vasamuseet",
  vasamuseet: "Nordiska museet/Vasamuseet",
  liljevalchs: "Liljevalchs/Gröna Lund",
  "gröna lund": "Liljevalchs/Gröna Lund",
};

// Spårväg City
export async function loadSparvagCity(): Promise<Line> {
  const sparvagCity = await Line.create("Spårväg City", "sparvagcity", "#747770", LineType.Tram, sparvagCityCorrections);
  return sparvagCity;
}

// Nockebybanan
const nockebybananCorrections = {
  alleparken: "Alléparken",
};

export async function loadNockebybanan(): Promise<Line> {
  const nockeby = await Line.create("Nockebybanan", "nockebybanan", "#627892", LineType.Tram, nockebybananCorrections);
  return nockeby;
}

// Tvärbanan
export async function loadTvarbanan(): Promise<Line> {
  const tvarbanan = await Line.create("Tvärbanan", "tvarbanan", "#e3861e", LineType.Tram);
  return tvarbanan;
}

// Roslagsbanan
export async function loadRoslagsbanan(): Promise<Line> {
  const roslagsbanan = await Line.create("Roslagsbanan", "roslagsbanan", "#a25ea6", LineType.LightRail);
  return roslagsbanan;
}
