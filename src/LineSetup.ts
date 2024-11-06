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

// Lidingöbanan
export async function loadLidingobanan(): Promise<Line> {
  const lidingo = await Line.create("Lidingöbanan", "lidingobanan", "#b65f1f", LineType.Tram);
  return lidingo;
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
  const lidingo = await Line.create("Spårväg City", "sparvagcity", "#747770", LineType.Tram, sparvagCityCorrections);
  return lidingo;
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
// TODO: Tvärbanan still has platforms for some reason.
export async function loadTvarbanan(): Promise<Line> {
  const nockeby = await Line.create("Tvärbanan", "tvarbanan", "#e3861e", LineType.Tram);
  return nockeby;
}
