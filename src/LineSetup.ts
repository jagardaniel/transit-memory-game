import { Line, LineType } from "./models/Line";

// For the future: Can be used if we want to dynamically show available lines
// for the user. Static right now.

/*
type LineNameOptions = Omit<typeof lineLoaders, "metroFull">;

export const lineNames: { [key in keyof LineNameOptions]: string } = {
  // metroFull is not included here, should not be an option for the user
  metroSplit: "Tunnelbanan",
  pendeltag: "Pendeltåg",
  lidingobanan: "Lidingöbanan",
  sparvagCity: "Spårväg City",
  nockebybanan: "Nockebybanan",
  tvarbanan: "Tvärbanan",
  roslagsbanan: "Roslagsbanan",
};
*/

export const lineLoaders = {
  metroSplit: async () => {
    const redLine = await Line.create("Röda linjen", "red", LineType.Metro);
    const greenLine = await Line.create("Gröna linjen", "green", LineType.Metro);
    const blueLine = await Line.create("Blå linjen", "blue", LineType.Metro);
    return [redLine, greenLine, blueLine];
  },
  metroFull: async () => {
    return await Line.create("Tunnelbanan", "full", LineType.Metro);
  },
  pendeltag: async () => {
    return await Line.create("Pendeltåg", "pendeltag", LineType.CommuterRail);
  },
  lidingobanan: async () => {
    return await Line.create("Lidingöbanan", "lidingobanan", LineType.Tram);
  },
  sparvagCity: async () => {
    return await Line.create("Spårväg City", "sparvagcity", LineType.Tram);
  },
  nockebybanan: async () => {
    return await Line.create("Nockebybanan", "nockebybanan", LineType.Tram);
  },
  tvarbanan: async () => {
    return await Line.create("Tvärbanan", "tvarbanan", LineType.Tram);
  },
  roslagsbanan: async () => {
    return await Line.create("Roslagsbanan", "roslagsbanan", LineType.LightRail);
  },
};
