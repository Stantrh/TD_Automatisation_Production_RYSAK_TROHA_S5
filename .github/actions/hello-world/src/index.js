const core = require('@actions/core');
const axios = require('axios');

async function run() {
  try {
    const message = core.getInput('message');
    
    console.log(`Message: ${message}`);
    
    // Notification Discord (si nécessaire)
    const discordWebhook = process.env.DISCORD_WEBHOOK_URL;  // Assure-toi de configurer ce secret dans GitHub
    if (discordWebhook) {
      await axios.post(discordWebhook, { content: message });
      console.log('Notification envoyée à Discord.');
    }
    
  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
  }
}

run();
