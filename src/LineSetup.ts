import { Line, LineType } from "./models/Line";

// Metro
const defaultMetroCorrections = {
  "t centralen": "T-Centralen",
  centralen: "T-Centralen",
};

const greenLineMetroCorrections = {
  ...defaultMetroCorrections,
  "st eriksplan": "S:t Eriksplan",
  "sankt eriksplan": "S:t Eriksplan",
};

export async function loadMetro(): Promise<Line[]> {
  const redLine = await Line.create("Röda linjen", "red", "#d71d24", LineType.Metro, defaultMetroCorrections);
  const greenLine = await Line.create("Gröna linjen", "green", "#148541", LineType.Metro, greenLineMetroCorrections);
  const blueLine = await Line.create("Blå linjen", "blue", "#007db8", LineType.Metro, defaultMetroCorrections);

  return [redLine, greenLine, blueLine];
}

// Lidingöbanan
export async function loadLidingoBanan(): Promise<Line> {
  const lidingo = await Line.create("Lidingöbanan", "lidingobanan", "#b65f1f", LineType.LightRail);
  return lidingo;
}
