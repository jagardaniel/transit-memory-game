import { Line, LineType } from "./models/Line";

// Metro
const defaultCorrections = {
  "t centralen": "T-Centralen",
  centralen: "T-Centralen",
};

const greenLineCorrections = {
  ...defaultCorrections,
  "st eriksplan": "S:t Eriksplan",
  "sankt eriksplan": "S:t Eriksplan",
};

export async function initializeMetroLines(): Promise<Line[]> {
  const redLine = await Line.create("Röda linjen", "red", "#d71d24", LineType.Metro, defaultCorrections);
  const greenLine = await Line.create("Gröna linjen", "green", "#148541", LineType.Metro, greenLineCorrections);
  const blueLine = await Line.create("Blå linjen", "blue", "#007db8", LineType.Metro, defaultCorrections);

  return [redLine, greenLine, blueLine];
}
