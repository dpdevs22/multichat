/**
 * Discord bot that forwards messages and simple events to your Next.js webhook endpoint.
 *
 * Usage:
 * 1) Create a Discord bot and invite to the guild with MESSAGE_INTENTS.
 * 2) Set env vars: DISCORD_BOT_TOKEN, WEBHOOK_ENDPOINT (your Next app /api/webhooks/discord URL)
 * 3) Run: node workers/discord/bot.js
 */

const { Client, GatewayIntentBits } = require('discord.js')
const fetch = global.fetch || require('node-fetch')

const token = process.env.DISCORD_BOT_TOKEN
const endpoint = process.env.WEBHOOK_ENDPOINT // e.g. https://yourapp.vercel.app/api/webhooks/discord

if (!token || !endpoint) {
  console.error('Missing DISCORD_BOT_TOKEN or WEBHOOK_ENDPOINT')
  process.exit(1)
}

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] })

client.on('ready', () => {
  console.log('Discord bot ready', client.user.tag)
})

client.on('messageCreate', async (message) => {
  try {
    // determine owner id mapping - you'll need to map channel/guild -> creator user_id
    // For demo, if message starts with "!owner:", assume next token is the owner user_id to attribute
    let ownerId = null
    const parts = message.content.split(' ')
    if (parts[0] === '!owner:' && parts[1]) ownerId = parts[1]

    // Build payload
    const payload = {
      kind: 'message',
      channelOwnerId: ownerId, // instruct the bot which creator to attribute to
      id: message.id,
      author: message.author.username,
      content: message.content,
      timestamp: message.createdAt.toISOString()
    }

    // POST to webhook
    await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
  } catch (err) {
    console.error('forward error', err)
  }
})

client.login(token)
