import { LineCity, LineType } from "../lib/Line";

export const LINES_MENU = [
  {
    name: "Tunnelbanan",
    shortName: "tunnelbanan",
    stations: 100,
    color: "#000080",
    icon: "icons/metro.svg",
  },
  {
    name: "Pendeltåg",
    shortName: "pendeltag",
    stations: 54,
    color: "#f266a6",
    icon: "icons/rail.svg",
  },
  {
    name: "Roslagsbanan",
    shortName: "roslagsbanan",
    stations: 39,
    color: "#a25ea6",
    icon: "icons/rail.svg",
  },
  {
    name: "Tvärbanan",
    shortName: "tvarbanan",
    stations: 28,
    color: "#e3861e",
    icon: "icons/rail.svg",
  },
  {
    name: "Saltsjöbanan",
    shortName: "saltsjobanan",
    stations: 17,
    color: "#009aa4",
    icon: "icons/rail.svg",
  },
  {
    name: "Lidingöbanan",
    shortName: "lidingobanan",
    stations: 13,
    color: "#b65f1f",
    icon: "icons/rail.svg",
  },
  {
    name: "Spårväg City",
    shortName: "sparvagCity",
    stations: 11,
    color: "#747770",
    icon: "icons/rail.svg",
  },
  {
    name: "Nockebybanan",
    shortName: "nockebybanan",
    stations: 10,
    color: "#627892",
    icon: "icons/rail.svg",
  },
];

export const LINES = {
  tunnelbanan: [
    {
      name: "Gröna linjen",
      shortName: "green",
      city: LineCity.Stockholm,
      color: "#148541",
      type: LineType.Metro,
    },
    {
      name: "Röda linjen",
      shortName: "red",
      city: LineCity.Stockholm,
      color: "#d71d24",
      type: LineType.Metro,
    },
    {
      name: "Blå linjen",
      shortName: "blue",
      city: LineCity.Stockholm,
      color: "#007db8",
      type: LineType.Metro,
    },
  ],

  pendeltag: [
    {
      name: "Pendeltåg",
      shortName: "pendeltag",
      city: LineCity.Stockholm,
      color: "#f266a6",
      type: LineType.CommuterRail,
    },
  ],

  lidingobanan: [
    {
      name: "Lidingöbanan",
      shortName: "lidingobanan",
      city: LineCity.Stockholm,
      color: "#b65f1f",
      type: LineType.Tram,
    },
  ],

  sparvagCity: [
    {
      name: "Spårväg City",
      shortName: "sparvagcity",
      city: LineCity.Stockholm,
      color: "#747770",
      type: LineType.Tram,
    },
  ],

  nockebybanan: [
    {
      name: "Nockebybanan",
      shortName: "nockebybanan",
      city: LineCity.Stockholm,
      color: "#627892",
      type: LineType.Tram,
    },
  ],

  tvarbanan: [
    {
      name: "Tvärbanan",
      shortName: "tvarbanan",
      city: LineCity.Stockholm,
      color: "#e3861e",
      type: LineType.Tram,
    },
  ],

  roslagsbanan: [
    {
      name: "Roslagsbanan",
      shortName: "roslagsbanan",
      city: LineCity.Stockholm,
      color: "#a25ea6",
      type: LineType.LightRail,
    },
  ],

  saltsjobanan: [
    {
      name: "Saltsjöbanan",
      shortName: "saltsjobanan",
      city: LineCity.Stockholm,
      color: "#009aa4",
      type: LineType.LightRail,
    },
  ],
};
