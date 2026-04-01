
const { EmbedBuilder } = require('discord.js');

async function poll(message, args) {
    if (args.length < 1) {
        return message.reply("Please provide a question for the poll.");
    }

    const question = args.join(' ');
    const embed = new EmbedBuilder()
        .setTitle('📊 Poll')
        .setDescription(question)
        .setColor('#00FF00')
        .setTimestamp();

    const pollMessage = await message.channel.send({ embeds: [embed] });
    await pollMessage.react('👍');
    await pollMessage.react('👎');
}

async function remindme(message, args) {
    if (args.length < 2) {
        return message.reply("Usage: !remindme <minutes> <reminder>");
    }

    const minutes = parseInt(args[0]);
    const reminder = args.slice(1).join(' ');

    if (isNaN(minutes) || minutes <= 0) {
        return message.reply("Please provide a valid number of minutes.");
    }

    message.reply(`I'll remind you about "${reminder}" in ${minutes} minutes.`);

    setTimeout(async () => {
        const embed = new EmbedBuilder()
            .setTitle('⏰ Reminder')
            .setDescription(reminder)
            .setColor('#0099ff')
            .setTimestamp();
        await message.author.send({ embeds: [embed] })
            .catch(() => message.channel.send(`${message.author} Reminder: ${reminder}`));
    }, minutes * 60 * 1000);
}

async function eightball(message, args) {
    if (args.length === 0) return message.reply("Ask a question first, dipshit.");
    const responses = [
        "It is certain.", "It is decidedly so.", "Without a doubt.", "Yes definitely.",
        "You may rely on it.", "As I see it, yes.", "Most likely.", "Outlook good.",
        "Yes.", "Signs point to yes.", "Reply hazy, try again.", "Ask again later.",
        "Better not tell you now.", "Cannot predict now.", "Concentrate and ask again.",
        "Don't count on it.", "My reply is no.", "My sources say no.",
        "Outlook not so good.", "Very doubtful."
    ];
    const response = responses[Math.floor(Math.random() * responses.length)];
    await message.reply(`🎱 ${response}`);
}

module.exports = {
    poll,
    remindme,
    eightball
};
