const core = require('@actions/core');
const axios = require('axios');

async function sendDiscordNotification() {
    try {
        const webhookUrl = core.getInput('discord_webhook'); // Récupère le webhook depuis l'input
        const message = core.getInput('message'); // Récupère le message passé en input
        // const repository = process.env.GITHUB_REPOSITORY;
        // const branch = process.env.GITHUB_REF_NAME;
        // const workflow = process.env.GITHUB_WORKFLOW;
        const job = "Test_et_Code_Coverage";

        const embed = {
            "embeds": [{
                "title": "Workflow Completion",
                "description": `**Job:** ${job}\n**Status:** :white_check_mark: Success\n\n${message}`,
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
                "timestamp": new Date().toISOString()
            }]
        };

        // Envoi de la requête à Discord
        await axios.post(webhookUrl, embed);
        console.log("Discord notification sent successfully!");
    } catch (error) {
        core.setFailed(`Failed to send Discord notification: ${error.message}`);
    }
}

sendDiscordNotification();
