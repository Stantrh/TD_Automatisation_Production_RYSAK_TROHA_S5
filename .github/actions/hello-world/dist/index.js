// src/index.js
var core = require("@actions/core");
var axios = require("axios");
async function run() {
  try {
    const discordWebhook = core.getInput("discord_webhook");
    const testStatus = core.getInput("test_status");
    const jobName = core.getInput("job_name");
    if (!discordWebhook) {
      throw new Error("Il faut donner un webhook discord en entr\xE9e dans votre workflow !");
    }
    const statusEmoji = testStatus === "success" ? ":green_square:" : ":red_square:";
    const nomWorkflow = process.env.GITHUB_WORKFLOW;
    const embedMessage = {
      embeds: [
        {
          title: "WORKFLOW **${nomWorkflow}**",
          description: `**Job:** ${jobName}
**Status:** ${statusEmoji} ${testStatus.charAt(0).toUpperCase() + testStatus.slice(1)}

:sparkles: Le workflow s'est bien compl\xE9t\xE9 ! :sparkles:`,
          color: testStatus === "success" ? 3066993 : 15158332,
          // Vert si succès, rouge sinon
          fields: [
            { name: "Repository", value: process.env.GITHUB_REPOSITORY, inline: true },
            { name: "Branche", value: process.env.GITHUB_REF_NAME, inline: true },
            { name: "Workflow", value: process.env.GITHUB_WORKFLOW, inline: true },
            { name: "Job", value: jobName, inline: true }
          ],
          footer: {
            text: "Workflow compl\xE9t\xE9 le : ",
            icon_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmrGmeBv3SOLSKz6OlTVlVYkfH9_W3BBgdrA&s"
          },
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }
      ]
    };
    await axios.post(discordWebhook, embedMessage);
    core.info("Notification discord bien envoy\xE9e !");
  } catch (error) {
    core.setFailed(`Probl\xE8me dans l'envoi de la notification: ${error.message}`);
  }
}
run();
