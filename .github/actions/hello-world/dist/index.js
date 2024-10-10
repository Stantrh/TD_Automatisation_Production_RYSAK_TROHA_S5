// src/index.js
var core = require("@actions/core");
var axios = require("axios");
async function sendDiscordNotification() {
  try {
    const webhookUrl = core.getInput("discord_webhook");
    const message = core.getInput("message");
    const job = "Test_et_Code_Coverage";
    const embed = {
      "embeds": [{
        "title": "Workflow Completion",
        "description": `**Job:** ${job}
**Status:** :white_check_mark: Success

${message}`,
        "color": 3066993,
        "fields": [
          {
            "name": "Job",
            "value": job,
            "inline": true
          }
        ],
        "footer": {
          "text": "Workflow completed on",
          "icon_url": "https://cdn.discordapp.com/emojis/741060461505072260.png"
        },
        "timestamp": (/* @__PURE__ */ new Date()).toISOString()
      }]
    };
    await axios.post(webhookUrl, embed);
    console.log("Discord notification sent successfully!");
  } catch (error) {
    core.setFailed(`Failed to send Discord notification: ${error.message}`);
  }
}
sendDiscordNotification();
