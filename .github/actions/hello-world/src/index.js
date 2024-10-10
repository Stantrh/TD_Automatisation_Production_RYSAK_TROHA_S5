const core = require('@actions/core');
const axios = require('axios');

async function sendDiscordNotification() {
    try {
        const webhookUrl = process.env.DISCORD_WEBHOOK;
        const repository = process.env.GITHUB_REPOSITORY;
        const branch = process.env.GITHUB_REF_NAME;
        const workflow = process.env.GITHUB_WORKFLOW;
        const job = "Test_et_Code_Coverage";

        const embed = {
            "embeds": [{
                "title": "Workflow Completion",
                "description": `**Job:** ${job}\n**Status:** :white_check_mark: Success\n\n:tada: Your workflow has completed successfully!`,
                "color": 3066993,
                "fields": [
                    {
                        "name": "Repository",
                        "value": repository,
                        "inline": true
                    },
                    {
                        "name": "Branch",
                        "value": branch,
                        "inline": true
                    },
                    {
                        "name": "Workflow",
                        "value": workflow,
                        "inline": true
                    },
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
