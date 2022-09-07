import rp from "request-promise";
import {differenceInMinutes} from "date-fns";

const ruterOptions = {
  helsfyr: {
    stopId: "NSR:StopPlace:59516",
    navn: "Helsfyr",
    darligTidLimit: 8,
  },
  toyen: {
    stopId: "NSR:StopPlace:59604",
    navn: "Tøyen",
    darligTidLimit: 6,
  },
};

const createQuery = (id) => `{
    stopPlace(id: "${id}") {
      name
      id
      estimatedCalls(numberOfDepartures: 20, whiteListedModes: [metro]) {
        expectedDepartureTime
        aimedDepartureTime
        destinationDisplay {
          frontText
        }
        serviceJourney {
          line {
            publicCode
            transportMode
          }
        }
      }
    }
  }`;

function hentAvgangstiderForStoppested(options, cb) {
  rp.post("https://api.entur.io/journey-planner/v2/graphql", {
    method: "POST",
    headers: {
      "ET-Client-Name": "spurven-slack-bot",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({query: createQuery(options.stopId)}),
  })
    .then((json) => {
      const data = JSON.parse(json);
      const now = new Date();
      const {estimatedCalls} = data.data.stopPlace;
      const motMortensrud = estimatedCalls.filter(
        (call) =>
          call.destinationDisplay.frontText === "Mortensrud" &&
          new Date(call.expectedDepartureTime) > now
      );
      const nesteAvgangerFraBrynseng = motMortensrud
        .map(
          (avgang, index) =>
            `${index + 1}. Kl. ${new Date(
              avgang.expectedDepartureTime
            ).toLocaleTimeString("no-NO")} - ${kalkulerMinutterTilNesteAvgang(
              avgang,
              now,
              options
            )}`
        )
        .join("\n\n");
      cb(
        `⏰Klokken er nå ${now.toLocaleTimeString(
          "no-NO"
        )}\n🚉 Neste avgang for linje 3 fra ${
          options.navn
        } mot Mortensrud er:\n\n${nesteAvgangerFraBrynseng}\n\n`
      );
    })
    .catch((err) => console.log("Error", err));
}

function kalkulerMinutterTilNesteAvgang(avgang, now, options) {
  const nesteAvgang = new Date(avgang.expectedDepartureTime);
  const difference = differenceInMinutes(nesteAvgang, now);
  if (difference <= 0) {
    return "Banen går nå! 💯";
  }

  if (difference < options.darligTidLimit) {
    return `Banen går om ${difference} ${flertallEllerIkke(
      difference,
      "minutt",
      "minutter"
    )}. Det er på tide å løpe 🏃‍♀️`;
  }

  if (difference >= options.darligTidLimit) {
    return `Banen går om ${difference} ${flertallEllerIkke(
      difference,
      "minutt",
      "minutter"
    )}. Du har greit med tid 🐢`;
  }

  return `Banen går om ${difference} ${flertallEllerIkke(
    difference,
    "minutt",
    "minutter"
  )}`;
}

function flertallEllerIkke(antall, entall, flertall) {
  if (antall <= 1) {
    return entall;
  }

  return flertall;
}

export {ruterOptions, hentAvgangstiderForStoppested};
