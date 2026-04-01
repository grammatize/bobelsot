
const { PermissionFlagsBits, EmbedBuilder, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

const ticketsPath = path.join(__dirname, 'tickets.json');
const ticketConfigPath = path.join(__dirname, 'ticketConfig.json');

// Load ticket data
let tickets = {};
let ticketConfig = {};

function loadTickets() {
    try {
        if (fs.existsSync(ticketsPath)) {
            tickets = JSON.parse(fs.readFileSync(ticketsPath, 'utf8'));
        }
    } catch (error) {
        console.error('Error loading tickets:', error);
        tickets = {};
    }
}

function saveTickets() {
    try {
        fs.writeFileSync(ticketsPath, JSON.stringify(tickets, null, 2));
    } catch (error) {
        console.error('Error saving tickets:', error);
    }
}

function loadTicketConfig() {
    try {
        if (fs.existsSync(ticketConfigPath)) {
            ticketConfig = JSON.parse(fs.readFileSync(ticketConfigPath, 'utf8'));
        }
    } catch (error) {
        console.error('Error loading ticket config:', error);
        ticketConfig = {};
    }
}

function saveTicketConfig() {
    try {
        fs.writeFileSync(ticketConfigPath, JSON.stringify(ticketConfig, null, 2));
    } catch (error) {
        console.error('Error saving ticket config:', error);
    }
}

async function ticketSetup(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return message.reply("You need Manage Channels permission to set up tickets.");
    }

    const guildId = message.guild.id;

    // Create ticket category if it doesn't exist
    let category = message.guild.channels.cache.find(c => c.name === 'Tickets' && c.type === ChannelType.GuildCategory);
    
    if (!category) {
        category = await message.guild.channels.create({
            name: 'Tickets',
            type: ChannelType.GuildCategory,
            position: 0
        });
    }

    // Find or create mod role
    let modRole = message.guild.roles.cache.find(r => r.name.toLowerCase().includes('mod') || r.name.toLowerCase().includes('staff'));
    
    if (!modRole) {
        // Ask for mod role mention
        const mentionedRole = message.mentions.roles.first();
        if (mentionedRole) {
            modRole = mentionedRole;
        } else {
            return message.reply("Please mention the moderator role: `!ticketsetup @ModRole`");
        }
    }

    // Save config
    ticketConfig[guildId] = {
        categoryId: category.id,
        modRoleId: modRole.id,
        ticketCounter: 0
    };
    saveTicketConfig();

    const embed = new EmbedBuilder()
        .setTitle('🎫 Ticket System Setup Complete')
        .setDescription('React with 🎫 below to create a ticket!')
        .addFields(
            { name: 'Category', value: category.name, inline: true },
            { name: 'Mod Role', value: `<@&${modRole.id}>`, inline: true }
        )
        .setColor('#00FF00')
        .setTimestamp();

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('create_ticket')
                .setLabel('Create Ticket')
                .setEmoji('🎫')
                .setStyle(ButtonStyle.Primary)
        );

    await message.channel.send({ embeds: [embed], components: [row] });
    await message.reply('Ticket system has been set up successfully!');
}

async function createTicket(interaction) {
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;

    if (!ticketConfig[guildId]) {
        return interaction.reply({ content: 'Ticket system is not set up. Ask an admin to run `!ticketsetup`', ephemeral: true });
    }

    // Check if user already has an open ticket
    const existingTicket = Object.values(tickets).find(t => 
        t.guildId === guildId && t.userId === userId && t.status === 'open'
    );

    if (existingTicket) {
        return interaction.reply({ content: `You already have an open ticket: <#${existingTicket.channelId}>`, ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const config = ticketConfig[guildId];
    config.ticketCounter = (config.ticketCounter || 0) + 1;
    saveTicketConfig();

    const ticketNumber = config.ticketCounter;
    const channelName = `ticket-${ticketNumber}`;

    try {
        // Create ticket channel
        const ticketChannel = await interaction.guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            parent: config.categoryId,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: userId,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                },
                {
                    id: config.modRoleId,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageMessages]
                }
            ]
        });

        // Save ticket data
        tickets[ticketChannel.id] = {
            guildId,
            userId,
            channelId: ticketChannel.id,
            ticketNumber,
            status: 'open',
            createdAt: Date.now()
        };
        saveTickets();

        // Send welcome message in ticket
        const welcomeEmbed = new EmbedBuilder()
            .setTitle(`Ticket #${ticketNumber}`)
            .setDescription(`Welcome ${interaction.user}! Please describe your issue and a moderator will assist you shortly.`)
            .setColor('#0099ff')
            .setTimestamp();

        const closeRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('Close Ticket')
                    .setEmoji('🔒')
                    .setStyle(ButtonStyle.Danger)
            );

        await ticketChannel.send({ content: `${interaction.user} <@&${config.modRoleId}>`, embeds: [welcomeEmbed], components: [closeRow] });

        await interaction.editReply({ content: `Ticket created: ${ticketChannel}` });

    } catch (error) {
        console.error('Error creating ticket:', error);
        await interaction.editReply({ content: 'Failed to create ticket. Please contact an administrator.' });
    }
}

async function closeTicket(interaction) {
    const channelId = interaction.channel.id;
    const ticket = tickets[channelId];

    if (!ticket) {
        return interaction.reply({ content: 'This is not a ticket channel.', ephemeral: true });
    }

    // Check if user has permission to close (ticket owner or mod)
    const config = ticketConfig[interaction.guild.id];
    const isMod = interaction.member.roles.cache.has(config.modRoleId) || interaction.member.permissions.has(PermissionFlagsBits.ManageChannels);
    const isOwner = interaction.user.id === ticket.userId;

    if (!isMod && !isOwner) {
        return interaction.reply({ content: 'You do not have permission to close this ticket.', ephemeral: true });
    }

    await interaction.reply('Closing ticket in 5 seconds...');

    ticket.status = 'closed';
    ticket.closedAt = Date.now();
    ticket.closedBy = interaction.user.id;
    saveTickets();

    setTimeout(async () => {
        try {
            await interaction.channel.delete();
            delete tickets[channelId];
            saveTickets();
        } catch (error) {
            console.error('Error deleting ticket channel:', error);
        }
    }, 5000);
}

async function ticketList(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return message.reply("You need Manage Channels permission to view tickets.");
    }

    const guildId = message.guild.id;
    const guildTickets = Object.values(tickets).filter(t => t.guildId === guildId && t.status === 'open');

    if (guildTickets.length === 0) {
        return message.reply('There are no open tickets.');
    }

    const ticketList = await Promise.all(guildTickets.map(async (t) => {
        try {
            const user = await message.client.users.fetch(t.userId);
            return `#${t.ticketNumber} - <#${t.channelId}> - ${user.tag}`;
        } catch {
            return `#${t.ticketNumber} - <#${t.channelId}> - Unknown User`;
        }
    }));

    const embed = new EmbedBuilder()
        .setTitle('🎫 Open Tickets')
        .setDescription(ticketList.join('\n'))
        .setColor('#0099ff')
        .setTimestamp();

    await message.reply({ embeds: [embed] });
}

// Load data on startup
loadTickets();
loadTicketConfig();

module.exports = {
    ticketSetup,
    createTicket,
    closeTicket,
    ticketList,
    loadTickets,
    saveTickets
};
