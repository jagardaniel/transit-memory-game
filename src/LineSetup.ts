import { Line, LineType } from "./models/Line";

// For the future: Can be used if we want to dynamically show available lines
// for the user. Static right now.
/*
export const lineNames: { [key in keyof LineNameOptions]: string } = {
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
  tunnelbanan: async () => {
    const red = await Line.create("Röda linjen", "red", "#d71d24", LineType.Metro);
    const green = await Line.create("Gröna linjen", "green", "#148541", LineType.Metro);
    const blue = await Line.create("Blå linjen", "blue", "#007db8", LineType.Metro);
    return [red, green, blue];
  },
  pendeltag: async () => {
    return await Line.create("Pendeltåg", "pendeltag", "#f266a6", LineType.CommuterRail);
  },
  lidingobanan: async () => {
    return await Line.create("Lidingöbanan", "lidingobanan", "#b65f1f", LineType.Tram);
  },
  sparvagCity: async () => {
    return await Line.create("Spårväg City", "sparvagcity", "#747770", LineType.Tram);
  },
  nockebybanan: async () => {
    return await Line.create("Nockebybanan", "nockebybanan", "#627892", LineType.Tram);
  },
  tvarbanan: async () => {
    return await Line.create("Tvärbanan", "tvarbanan", "#e3861e", LineType.Tram);
  },
  roslagsbanan: async () => {
    return await Line.create("Roslagsbanan", "roslagsbanan", "#a25ea6", LineType.LightRail);
  },
};
