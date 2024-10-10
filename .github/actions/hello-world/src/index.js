const core = require('@actions/core');
const axios = require('axios');

async function run() {
  try {
    // Récupérer les inputs du workflow
    const message = core.getInput('message');
    const discordWebhook = core.getInput('discord_webhook');
    const testStatus = core.getInput('test_status');

    // Vérifier si l'URL du webhook est valide
    if (!discordWebhook) {
      throw new Error('Discord webhook URL is missing!');
    }

    // Préparer le message à envoyer sur Discord
    const statusEmoji = testStatus === 'success' ? ':white_check_mark:' : ':x:';
    const embedMessage = {
      embeds: [
        {
          title: 'Workflow Completion',
          description: `**Job:** Test_et_Code_Coverage\n**Status:** ${statusEmoji} ${testStatus.charAt(0).toUpperCase() + testStatus.slice(1)}\n\n:tada: Your workflow has completed!`,
          color: testStatus === 'success' ? 3066993 : 15158332,  // Vert si succès, rouge sinon
          fields: [
            { name: 'Message', value: message, inline: true },
            { name: 'Repository', value: process.env.GITHUB_REPOSITORY, inline: true },
            { name: 'Branch', value: process.env.GITHUB_REF_NAME, inline: true },
            { name: 'Workflow', value: process.env.GITHUB_WORKFLOW, inline: true },
            { name: 'Job', value: 'Test_et_Code_Coverage', inline: true }
          ],
          footer: {
            text: 'Workflow completed on',
            icon_url: 'https://cdn.discordapp.com/emojis/741060461505072260.png'
          },
          timestamp: new Date().toISOString()
        }
      ]
    };

    // Envoyer le message sur Discord
    await axios.post(discordWebhook, embedMessage);

    core.info('Discord notification sent successfully!');
  } catch (error) {
    core.setFailed(`Failed to send Discord notification: ${error.message}`);
  }
}

run();
