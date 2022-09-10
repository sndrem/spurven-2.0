import evoService from "../services/evoService";

const Commands = {
  Evo_sjekk_status: "evo_sjekk_status",
};

export const evo = (app: any) => {
  console.log("Initializing Evo-component...");
  app.command("/evo", async ({ack, body, say}: any) => {
    await ack();
    const blocks = {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "Evo :muscle:",
            emoji: true,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Hei ${body.user_name} - Hva ønsker du å gjøre?`,
          },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "Sjekke antall på Evo Bryn",
                emoji: true,
              },
              action_id: Commands.Evo_sjekk_status,
            },
          ],
        },
      ],
      text: "Hva ønsker du å gjøre?",
    };
    await say(blocks);
  });

  app.action(Commands.Evo_sjekk_status, async ({ack, say, body}) => {
    console.log(body);
    await ack();
    await say("Sjekker kapasitet hos Evo Bryn...");
    evoService.sjekkKapasitet(async (data: any) => {
      await say({
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `${data}\n\nGod trening :muscle: :star:`,
            },
          },
        ],
        text: data,
      });
    });
  });
};
