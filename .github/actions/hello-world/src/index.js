const core = require('@actions/core');
const axios = require('axios');

async function run() {
  try {
    // On récupère les inputs du worfklow ci.yml
    const discordWebhook = core.getInput('discord_webhook');
    const testStatus = core.getInput('test_status');
    const jobName = core.getInput('job_name');

    // Au cas où quelqu'un utilise l'action et ne spécifie pas l'url du webhook dans les inputs
    if (!discordWebhook) {
      throw new Error('Il faut donner un webhook discord en entrée dans votre workflow !');
    }

    // On construit le message que le webhook va afficher
    const statusEmoji = testStatus === 'success' ? ':green_square:' : ':red_square:'; //si le job du worflow a fonctionné ou pas
    const nomWorkflow = process.env.GITHUB_WORKFLOW;
    const embedMessage = { 
      username: 'Github Actions AUTOMATISATION DE LA PRODUCTION',
      avatar_url: 'https://ih1.redbubble.net/image.5030029175.8203/bg,f8f8f8-flat,750x,075,f-pad,750x1000,f8f8f8.jpg',
      embeds: [
        {
          title: `WORKFLOW **${nomWorkflow}**`,
          description: `**Job:** ${jobName}\n**Status:** ${statusEmoji} ${testStatus.charAt(0).toUpperCase() + testStatus.slice(1)}\n\n:sparkles: Le workflow s'est bien complété ! :sparkles:`,
          color: testStatus === 'success' ? 3066993 : 15158332,  // Vert si succès, rouge sinon
          fields: [
            { name: 'Repository', value: process.env.GITHUB_REPOSITORY, inline: true },
            { name: 'Branche', value: process.env.GITHUB_REF_NAME, inline: true },
            { name: 'Workflow', value: process.env.GITHUB_WORKFLOW, inline: true },
            { name: 'Job', value: jobName, inline: true }
          ],
          footer: {
            text: 'Workflow complété ',
            icon_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmrGmeBv3SOLSKz6OlTVlVYkfH9_W3BBgdrA&s'
          },
          timestamp: new Date().toISOString()
        }
      ]
    };

    // Et avec axios on poste le message via l'url du webhook et ce qu'on a construit
    await axios.post(discordWebhook, embedMessage);

    core.info('Notification discord bien envoyée !');
  } catch (error) {
    core.setFailed(`Problème dans l'envoi de la notification: ${error.message}`);
  }
}

run();
