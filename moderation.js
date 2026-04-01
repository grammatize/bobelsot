
const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const warnings = new Map();

function loadWarnings() {
    try {
        if (!fs.existsSync('./warnings.json')) {
            if (!fs.existsSync('./data')) {
                fs.mkdirSync('./data');
            }
            fs.writeFileSync('./warnings.json', '{}');
            return;
        }
        const data = JSON.parse(fs.readFileSync('./warnings.json'));
        Object.entries(data).forEach(([userId, userWarnings]) => {
            warnings.set(userId, userWarnings);
        });
    } catch (error) {
        console.error('Error loading warnings:', error);
    }
}

function saveWarnings() {
    try {
        if (!fs.existsSync('./data')) {
            fs.mkdirSync('./data');
        }
        const warningsObject = Object.fromEntries(warnings);
        fs.writeFileSync('./warnings.json', JSON.stringify(warningsObject, null, 2));
    } catch (error) {
        console.error('Error saving warnings:', error);
    }
}

async function ban(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
        return message.reply("You don't have permission to ban members.");
    }

    const user = message.mentions.users.first();
    if (!user) {
        return message.reply("Please mention a user to ban.");
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    try {
        const member = await message.guild.members.fetch(user.id);
        await member.ban({ reason });

        const embed = new EmbedBuilder()
            .setTitle('User Banned')
            .setDescription(`${user.tag} has been banned.\nReason: ${reason}`)
            .setColor('#FF0000')
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error banning user:', error);
        await message.reply('Failed to ban the user.');
    }
}

async function timeout(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
        return message.reply("You don't have permission to timeout members.");
    }

    const user = message.mentions.users.first();
    if (!user) {
        return message.reply("Please mention a user to timeout.");
    }

    const duration = args[1];
    const reason = args.slice(2).join(' ') || 'No reason provided';

    if (!duration) {
        return message.reply("Please specify a duration (e.g., 10m, 1h, 1d).");
    }

    // Parse duration
    const timeMatch = duration.match(/^(\d+)([mhd])$/);
    if (!timeMatch) {
        return message.reply("Invalid duration format. Use format like: 10m, 1h, 1d");
    }

    const timeValue = parseInt(timeMatch[1]);
    const timeUnit = timeMatch[2];
    
    let milliseconds;
    switch (timeUnit) {
        case 'm':
            milliseconds = timeValue * 60 * 1000;
            break;
        case 'h':
            milliseconds = timeValue * 60 * 60 * 1000;
            break;
        case 'd':
            milliseconds = timeValue * 24 * 60 * 60 * 1000;
            break;
    }

    // Discord timeout limit is 28 days
    if (milliseconds > 28 * 24 * 60 * 60 * 1000) {
        return message.reply("Timeout duration cannot exceed 28 days.");
    }

    try {
        const member = await message.guild.members.fetch(user.id);
        await member.timeout(milliseconds, reason);

        const embed = new EmbedBuilder()
            .setTitle('User Timed Out')
            .setDescription(`${user.tag} has been timed out.\nDuration: ${duration}\nReason: ${reason}`)
            .setColor('#FFA500')
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error timing out user:', error);
        await message.reply('Failed to timeout the user.');
    }
}

async function slowmode(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return message.reply("You don't have permission to manage channels.");
    }

    const duration = args[0];
    if (duration === undefined) {
        return message.reply("Please specify a duration in seconds (0 to disable).");
    }

    const seconds = parseInt(duration);
    if (isNaN(seconds) || seconds < 0 || seconds > 21600) {
        return message.reply("Please provide a valid number of seconds between 0 and 21600 (6 hours).");
    }

    try {
        await message.channel.setRateLimitPerUser(seconds);
        await message.reply(`✅ Slowmode set to ${seconds} seconds.`);
    } catch (error) {
        console.error('Error setting slowmode:', error);
        await message.reply('Failed to set slowmode.');
    }
}

async function nuke(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return message.reply("You don't have permission to manage channels.");
    }

    try {
        const position = message.channel.position;
        const newChannel = await message.channel.clone();
        await message.channel.delete();
        await newChannel.setPosition(position);
        await newChannel.send("☢️ **Channel Nuked Successfully.**");
    } catch (error) {
        console.error('Error nuking channel:', error);
        await message.reply('Failed to nuke the channel.');
    }
}

async function lock(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return message.reply("You don't have permission to manage channels.");
    }
    try {
        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
            SendMessages: false
        });
        await message.reply("🔒 Channel locked.");
    } catch (error) {
        console.error('Error locking channel:', error);
        await message.reply('Failed to lock the channel.');
    }
}

async function unlock(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return message.reply("You don't have permission to manage channels.");
    }
    try {
        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
            SendMessages: null
        });
        await message.reply("🔓 Channel unlocked.");
    } catch (error) {
        console.error('Error unlocking channel:', error);
        await message.reply('Failed to unlock the channel.');
    }
}

async function archive(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return message.reply("You don't have permission to manage channels.");
    }

    const guild = message.guild;
    const channel = message.channel;
    const categoryName = 'Archive';

    try {
        // 1. Find or create Archive category
        let archiveCategory = guild.channels.cache.find(c => c.name === categoryName && c.type === 4);
        if (!archiveCategory) {
            archiveCategory = await guild.channels.create({
                name: categoryName,
                type: 4, // GuildCategory
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                ],
            });
        }

        // 2. Determine archived channel name
        const archivedChannels = guild.channels.cache.filter(c => c.parentId === archiveCategory.id);
        const nextNumber = archivedChannels.size + 1;
        const newArchiveName = `${channel.name}-archived${nextNumber}`;

        // 3. Duplicate channel for replacement
        const replacementChannel = await channel.clone({
            name: channel.name,
            reason: 'Archiving previous channel',
        });

        // 4. Archive current channel
        await channel.setName(newArchiveName);
        await channel.setParent(archiveCategory.id, { lockPermissions: true });
        
        // Ensure only moderators see the archived channel
        // Usually locking to category handles this if category is private, 
        // but let's be explicit based on requirement
        await channel.permissionOverwrites.set([
            {
                id: guild.id,
                deny: [PermissionFlagsBits.ViewChannel],
            }
        ]);

        await replacementChannel.send(`✅ This channel has been replaced. Previous version archived as \`${newArchiveName}\`.`);
    } catch (error) {
        console.error('Error archiving channel:', error);
        await message.reply('Failed to archive the channel. Check my permissions.');
    }
}

// Load warnings on module load
loadWarnings();

module.exports = {
    ban,
    timeout,
    archive,
    slowmode,
    nuke,
    lock,
    unlock,
    loadWarnings,
    saveWarnings
};
