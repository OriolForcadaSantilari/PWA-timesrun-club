export type ClubMeetup = {
  name: string;
  handle: string;
  time: string;
  place: string;
  placeEs?: string;
};

export type ClubDay = {
  day: string;
  meetups: ClubMeetup[];
};

const JS_WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export function localWeekdayName(now = new Date()): string {
  return JS_WEEKDAYS[now.getDay()];
}

export const BARCELONA_CLUB_DAYS: ClubDay[] = [
  {
    day: "Monday",
    meetups: [
      {
        name: "Running Club BCN",
        handle: "runningclub_bcn",
        time: "19:00",
        place: "Sea You, Passeig del Mare Nostrum",
      },
      {
        name: "Amunt",
        handle: "amunt.bcn",
        time: "19:00",
        place: "Eixample",
      },
    ],
  },
  {
    day: "Tuesday",
    meetups: [
      {
        name: "B3tter Run Club",
        handle: "b3tterrunclub",
        time: "7:00",
        place: "La Cala Barceloneta",
      },
      {
        name: "Club Rodeo",
        handle: "club__rodeo",
        time: "19:00",
        place: "Eat Nudes, Carrer del Rec 10, Ciutadella",
      },
      {
        name: "Runners Barcelona",
        handle: "runners.barcelona",
        time: "19:30",
        place: "Parc de la Ciutadella",
      },
      {
        name: "Ordinary Run Club",
        handle: "ordinaryrunclub",
        time: "19:30",
        place: "Arc de Triomf",
      },
    ],
  },
  {
    day: "Wednesday",
    meetups: [
      {
        name: "Oysho Community",
        handle: "oysho_community",
        time: "19:30",
        place: "Diagonal",
      },
      {
        name: "Midnight Runners Barcelona",
        handle: "midnightrunnersbarcelona",
        time: "20:00",
        place: "Location on Heylo",
        placeEs: "Ubicación en Heylo",
      },
    ],
  },
  {
    day: "Thursday",
    meetups: [
      {
        name: "Amunt",
        handle: "amunt.bcn",
        time: "7:00",
        place: "Barceloneta",
      },
      {
        name: "Gravity Run",
        handle: "gravity_run",
        time: "19:30",
        place: "Arc de Triomf, Ciutadella",
      },
      {
        name: "Runners Barcelona",
        handle: "runners.barcelona",
        time: "19:30",
        place: "Parc de la Ciutadella",
      },
    ],
  },
  {
    day: "Friday",
    meetups: [
      {
        name: "Stamina Running Barcelona",
        handle: "staminarunningbarcelona",
        time: "7:30",
        place: "Stamina store, Poblenou",
        placeEs: "Tienda Stamina, Poblenou",
      },
    ],
  },
  {
    day: "Saturday",
    meetups: [
      {
        name: "Stamina Running Barcelona",
        handle: "staminarunningbarcelona",
        time: "9:00",
        place: "Stamina store, Poblenou",
        placeEs: "Tienda Stamina, Poblenou",
      },
    ],
  },
  {
    day: "Sunday",
    meetups: [
      {
        name: "Gravity Run",
        handle: "gravity_run",
        time: "9:00",
        place: "Eixample",
      },
    ],
  },
];

export function instagramUrl(handle: string): string {
  return `https://www.instagram.com/${handle}/`;
}
