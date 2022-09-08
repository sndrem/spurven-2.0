import {CronJob} from "cron";
import rp from "request-promise";

const metrikkUrl = "https://hjelvik.net/mittanbud/counts_v2.php";
const SYNNOVE = "UE59F8RUZ";
//const SINDRE = "UE563BDMX";

let sistSendteMelding: any = undefined;
const cooldownIMS = 10 * 60 * 1000; // 10 minutter

let pauseStatuser = false;

// Kommandoer
const statusMaKommando = /status ma/i;
const startJobbKommando = /start jobbhenting/i;
const pauseJobbHentingKommando = /pause jobbhenting/i;
const statusJobbhentingKommando = /status jobbhenting/i;

const JOBB_LIMIT = 50;

export const mittAnbud = (app: any) => {
  console.log("Initializing Mittanbud-component...");
  app.message(statusMaKommando, async ({say}) => {
    await say(
      `Henter metrikker for Mittanbud... Vennligst ha litt tålmodighet 🫶`
    );
    await oppdateringAvAlleMetrikker();
  });

  app.message(pauseJobbHentingKommando, async ({say}) => {
    pauseStatuser = true;
    await say(`Automatisk melding om antall jobber er pauset.`);
  });

  app.message(startJobbKommando, async ({say}) => {
    pauseStatuser = false;
    await say(
      `Systemet har nå skrudd av pause for automatisk jobbhenting og vil igjen melde når det er mer enn ${JOBB_LIMIT} antall jobber.`
    );
  });

  app.message(statusJobbhentingKommando, async ({say}) => {
    await say(
      `Jobbhenting er ${
        pauseStatuser ? "pauset" : "ikke pauset"
      } - pauset = ${!!pauseStatuser}`
    );
  });

  const tz = "Europe/Oslo";
  new CronJob(
    "0 */1 8-16 * * MON,TUE,WED,THU,FRI",
    hentMetrikker,
    null,
    true,
    tz
  ); // Hver ukedag hvert minutt mellom 08-16
  new CronJob(
    "0 22 * * MON,TUE,WED,THU,FRI",
    oppdateringAvAlleMetrikker,
    null,
    true,
    tz
  ); // Hver ukedag kl. 22.00

  function getMetrikker(cb) {
    rp.get(metrikkUrl, {
      headers: {
        accept: "application/json",
      },
    })
      .then((data) => cb(JSON.parse(data)))
      .catch((error) =>
        console.error("Klarte ikke hente Mittanbud-metrikker", error)
      );
  }

  function hentMetrikker() {
    if (pauseStatuser) return;

    getMetrikker(async (data) => {
      const antallJobber = data.anbud;
      const tekst = `Hei :wave: Det er ${antallJobber} antall jobber som ikke er tatt.`;

      const omTiMin =
        sistSendteMelding && sistSendteMelding.getTime() + cooldownIMS;
      const naa = new Date().getTime();
      if (omTiMin > naa) {
        return; // Cooldown-periode
      }

      if (antallJobber >= JOBB_LIMIT) {
        sistSendteMelding = new Date();
        await app.client.chat.postMessage({
          channel: SYNNOVE,
          text: tekst,
        });
      }
    });
  }

  function oppdateringAvAlleMetrikker() {
    getMetrikker(async (data) => {
      const tekst = `Hei :wave:\nDet er den ${new Date().toLocaleString(
        "no-NO"
      )} og dette er status:\nJobber: ${data.anbud}\nTilbakemeldinger: ${
        data.responses
      }\nIntercom: ${data.intercom.company}/${
        data.intercom.consumer
      }\nZendesk Mittanbud: ${data.zendesk.mittanbud_nye}/${
        data.zendesk.mittanbud
      }`;
      await app.client.chat.postMessage({
        channel: SYNNOVE,
        text: tekst,
      });
    });
  }
};
