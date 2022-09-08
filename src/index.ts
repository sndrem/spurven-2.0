import {ExpressReceiver} from "@slack/bolt";
import {evo} from "./components/evo";
import {mittAnbud} from "./components/mittanbud";
import {ruter} from "./components/ruter";

require("dotenv").config();
const {App} = require("@slack/bolt");

const PORT = process.env.PORT || 3000;

const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET!,
});

export const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});

// Initialize mittAnbud
mittAnbud(app);
evo(app);
ruter(app);

// Start appen
(async () => {
  await app.start(PORT);
  console.log(`Spurven kjører på port: ${PORT}`);
})();

/**
 * Vi må verifisere til Slack at vi eier URL-en
 */
receiver.router.post("/slack/events", (req, res) => {
  if (req?.body?.challenge) res.send({challenge: req?.body.challenge});
});
