// src/index.js
var core = require("@actions/core");
var axios = require("axios");
async function run() {
  try {
    const message = core.getInput("message");
    console.log(`Message: ${message}`);
    const discordWebhook = process.env.DISCORD_WEBHOOK_URL;
    if (discordWebhook) {
      await axios.post(discordWebhook, { content: message });
      console.log("Notification envoy\xE9e \xE0 Discord.");
    }
  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
  }
}
run();
