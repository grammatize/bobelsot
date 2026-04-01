const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

const giveawaysFile = path.join(__dirname, 'data', 'giveaways.json');
let activeGiveaways = new Map();
let client;

function loadGiveaways(discordClient) {
    client = discordClient;
    try {
        if (fs.existsSync(giveawaysFile)) {
            const data = JSON.parse(fs.readFileSync(giveawaysFile, 'utf8'));
            activeGiveaways = new Map(Object.entries(data));
        }
    } catch (error) {
        console.error('Error loading giveaways:', error);
    }
}

function saveGiveaways() {
    try {
        const dir = path.dirname(giveawaysFile);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(giveawaysFile, JSON.stringify(Object.fromEntries(activeGiveaways)));
    } catch (error) {
        console.error('Error saving giveaways:', error);
    }
}

function parseDuration(duration) {
    const match = duration.match(/^(\d+)([dhm])$/);
    if (!match) return null;

    const [, amount, unit] = match;
    const multiplier = {
        'm': 60000,
        'h': 3600000,
        'd': 86400000
    }[unit];

    return parseInt(amount) * multiplier;
}

async function createGiveaway(message, args) {
    if (!message.member.permissions.has('ManageMessages')) {
        return message.reply('You need Manage Messages permission to create giveaways.');
    }

    const duration = args[0];
    const winners = parseInt(args[1]);
    const prize = args.slice(2).join(' ');

    if (!duration || !winners || !prize) {
        return message.reply('Usage: !giveaway <duration> <winners> <prize>\nDuration format: 1m, 1h, 1d');
    }

    const durationMs = parseDuration(duration);
    if (!durationMs) {
        return message.reply('Invalid duration format. Use 1m, 1h, or 1d');
    }

    const endTime = Date.now() + durationMs;

    const embed = new EmbedBuilder()
        .setTitle('🎉 GIVEAWAY 🎉')
        .setDescription(`Prize: **${prize}**\nWinners: ${winners}\nEnds: <t:${Math.floor(endTime/1000)}:R>`)
        .setColor('#FF1493')
        .setFooter({ text: `Hosted by ${message.author.tag}` });

    const button = new ButtonBuilder()
        .setCustomId('giveaway_enter')
        .setLabel('Enter Giveaway! 🎉')
        .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    message.channel.send({ embeds: [embed], components: [row] })
        .then(msg => {
            activeGiveaways.set(msg.id, {
                prize,
                winners,
                endTime,
                hostId: message.author.id,
                channelId: message.channel.id,
                participants: [],
                ended: false
            });
            saveGiveaways();

            setTimeout(() => endGiveaway(msg.id), durationMs);
        });
}

async function endGiveaway(messageId) {
    const giveaway = activeGiveaways.get(messageId);
    if (!giveaway || giveaway.ended || Date.now() < giveaway.endTime) return;

    giveaway.ended = true;
    activeGiveaways.set(messageId, giveaway);
    saveGiveaways();

    const channel = await client.channels.fetch(giveaway.channelId);
    if (!channel) return;

    const message = await channel.messages.fetch(messageId);
    if (!message) return;

    const winners = [];
    const participants = [...giveaway.participants];

    for (let i = 0; i < Math.min(giveaway.winners, participants.length); i++) {
        const randomIndex = Math.floor(Math.random() * participants.length);
        const winner = participants[randomIndex];
        winners.push(`<@${winner}>`);
        participants.splice(randomIndex, 1);
    }

    const embed = new EmbedBuilder()
        .setTitle('🎉 GIVEAWAY ENDED 🎉')
        .setDescription(`Prize: **${giveaway.prize}**\n` +
            `Winners: ${winners.length > 0 ? winners.join(', ') : 'No winners'}`)
        .setColor('#FF1493')
        .setFooter({ text: `Hosted by ${(await client.users.fetch(giveaway.hostId)).tag}` });

    await message.edit({ embeds: [embed], components: [] });

    if (winners.length > 0) {
        channel.send(`Congratulations ${winners.join(', ')}! You won **${giveaway.prize}**!`);
    } else {
        channel.send('No one entered the giveaway 😔');
    }
}

module.exports = { createGiveaway, loadGiveaways, activeGiveaways, saveGiveaways };