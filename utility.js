
const { EmbedBuilder } = require('discord.js');

async function serverinfo(message) {
    const guild = message.guild;
    
    const embed = new EmbedBuilder()
        .setTitle(`Server Information - ${guild.name}`)
        .setColor('#0099ff')
        .addFields(
            { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
            { name: 'Members', value: guild.memberCount.toString(), inline: true },
            { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
            { name: 'Channels', value: guild.channels.cache.size.toString(), inline: true },
            { name: 'Roles', value: guild.roles.cache.size.toString(), inline: true },
            { name: 'Boost Level', value: guild.premiumTier.toString(), inline: true }
        )
        .setThumbnail(guild.iconURL())
        .setTimestamp();

    await message.reply({ embeds: [embed] });
}

async function userinfo(message) {
    const user = message.mentions.users.first() || message.author;
    const member = await message.guild.members.fetch(user.id);
    
    const embed = new EmbedBuilder()
        .setTitle(`User Information - ${user.tag}`)
        .setColor('#0099ff')
        .addFields(
            { name: 'ID', value: user.id, inline: true },
            { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
            { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
            { name: 'Roles', value: member.roles.cache.map(role => role.name).slice(0, 10).join(', ') || 'None', inline: false }
        )
        .setThumbnail(user.displayAvatarURL())
        .setTimestamp();

    await message.reply({ embeds: [embed] });
}

async function avatar(message) {
    const user = message.mentions.users.first() || message.author;
    const avatarUrl = user.displayAvatarURL({ dynamic: true, size: 1024 });

    const embed = new EmbedBuilder()
        .setTitle(`${user.username}'s Avatar`)
        .setImage(avatarUrl)
        .setColor('#7289DA');

    await message.reply({ embeds: [embed] });
}

async function math(message, args) {
    if (args.length === 0) return message.reply("Give me something to calculate, moron.");
    try {
        const expression = args.join(' ');
        // Basic math evaluation (safe-ish for simple expressions)
        const result = eval(expression.replace(/[^-()\d/*+.]/g, ''));
        await message.reply(`🧮 Result: \`${result}\``);
    } catch (e) {
        await message.reply("I can't calculate that garbage. Use real numbers.");
    }
}

module.exports = {
    serverinfo,
    userinfo,
    avatar,
    math
};
