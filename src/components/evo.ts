import evoService from "../services/evoService";

export const evo = (app: any) => {
  app.command("/evo", async ({ack, say}: any) => {
    await ack();
    await say("Sjekker kapasitet hos Evo Bryn...");

    evoService.sjekkKapasitet(async (data: any) => {
      await say(data);
    });
  });
};
