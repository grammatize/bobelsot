"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const config_1 = require("./config");
const { prefix } = config_1.default;

// Comprehensive command list with descriptions
const commands = {
    // General Commands
    'help': {
        description: 'Shows this help menu with all available commands.',
        format: 'help [page]',
        category: 'General'
    },
    'ping': {
        description: 'Checks bot latency and connection status.',
        format: 'ping',
        category: 'General'
    },
    'serverinfo': {
        description: 'Displays information about the server.',
        format: 'serverinfo',
        category: 'General'
    },
    'userinfo': {
        description: 'Shows information about a user.',
        format: 'userinfo [@user]',
        category: 'General'
    },

    'messagelogs': {
        description: 'Set channel for message update/delete logs.',
        format: 'messagelogs <#channel>',
        category: 'Moderation'
    },
    'rolelog': {
        description: 'Set channel for role update logs.',
        format: 'rolelog <#channel>',
        category: 'Moderation'
    },
    'memberlog': {
        description: 'Set channel for member join/leave logs.',
        format: 'memberlog <#channel>',
        category: 'Moderation'
    },

    // Moderation Commands
    'ban': {
        description: 'Bans a user from the server.',
        format: 'ban @user [reason]',
        category: 'Moderation'
    },
    'warn': {
        description: 'Warn a user for rule violations.',
        format: 'warn @user [reason]',
        category: 'Moderation'
    },
    'warnings': {
        description: 'Check warning history for a user.',
        format: 'warnings [@user]',
        category: 'Moderation'
    },
    'leaderboard': {
        description: 'Display the top 10 users ranked by level and XP.',
        format: 'leaderboard',
        category: 'Levels'
    },
    'timeout': {
        description: 'Timeouts a user for a specified duration.',
        format: 'timeout @user [duration] [reason]',
        category: 'Moderation'
    },
    'purge': {
        description: 'Deletes a specified number of messages (no limit).',
        format: 'purge <amount> or purge @user <amount>',
        category: 'Moderation'
    },
    'nuke': {
        description: 'Deletes the current channel and recreates it with the same settings.',
        format: 'nuke',
        category: 'Moderation'
    },
    'antiraid': {
        description: 'Configure anti-raid settings.',
        format: 'antiraid <enable/disable/settings>',
        category: 'Moderation'
    },
    'lock': {
        description: 'Locks the current channel.',
        format: 'lock',
        category: 'Moderation'
    },
    'unlock': {
        description: 'Unlocks the current channel.',
        format: 'unlock',
        category: 'Moderation'
    },
    'archive': {
        description: 'Archives the current channel.',
        format: 'archive',
        category: 'Moderation'
    },

    // Fun Commands
    'say': {
        aliases: ['repeat'],
        description: 'Makes the bot repeat your message.',
        format: 'say <message>',
        category: 'Fun'
    },
    'poll': {
        description: 'Creates a poll for users to vote on.',
        format: 'poll <question> [options]',
        category: 'Fun'
    },
    'remindme': {
        description: 'Sets a reminder for later.',
        format: 'remindme <time> <message>',
        category: 'Fun'
    },
    '8ball': {
        description: 'Ask the magic 8-ball a question.',
        format: '8ball <question>',
        category: 'Fun'
    },
    'insult': {
        description: 'Get insulted by the bot.',
        format: 'insult [@user]',
        category: 'Fun'
    },
    'roast': {
        description: 'Get roasted by the bot.',
        format: 'roast [@user]',
        category: 'Fun'
    },
    'quote': {
        description: 'Get a random inspirational quote.',
        format: 'quote',
        category: 'Fun'
    },
    'fact': {
        description: 'Learn a random interesting fact.',
        format: 'fact',
        category: 'Fun'
    },
    'joke': {
        description: 'Hear a random joke.',
        format: 'joke',
        category: 'Fun'
    },
    'coinflip': {
        aliases: ['flip'],
        description: 'Flip a coin.',
        format: 'coinflip',
        category: 'Fun'
    },
    'dice': {
        aliases: ['roll'],
        description: 'Roll a dice with specified sides (default 6).',
        format: 'dice [sides]',
        category: 'Fun'
    },
    'imagine': {
        aliases: ['gen', 'img'],
        description: 'Generate an AI image from a text prompt. Fully uncensored.',
        format: 'imagine <prompt>',
        category: 'Fun'
    },
    'r': {
        description: 'Add or remove a role from a user (toggles automatically).',
        format: 'r @user <role name>',
        category: 'Moderation'
    },
    'ra': {
        aliases: ['roleall'],
        description: 'Give a role to ALL members. Skips members who already have it.',
        format: 'ra <role name>',
        category: 'Moderation'
    },
    'meme': {
        description: 'Get a random meme from Reddit.',
        format: 'meme',
        category: 'Fun'
    },
    'urbandictionary': {
        aliases: ['ud', 'urban'],
        description: 'Look up a slang definition on Urban Dictionary.',
        format: 'urbandictionary <term>',
        category: 'Fun'
    },
    'mock': {
        description: 'CoNvErT tExT tO mOcKiNg CaSe.',
        format: 'mock <text>',
        category: 'Fun'
    },
    'hack': {
        description: 'Pretend to hack a user (just a prank).',
        format: 'hack @user',
        category: 'Fun'
    },
    'ship': {
        description: 'Calculate compatibility between two users.',
        format: 'ship @user1 @user2',
        category: 'Fun'
    },
    'howgay': {
        description: 'Calculate how gay a user is (random percent).',
        format: 'howgay [@user]',
        category: 'Fun'
    },
    'cat': {
        description: 'Get a random cat image.',
        format: 'cat',
        category: 'Fun'
    },
    'dog': {
        description: 'Get a random dog image.',
        format: 'dog',
        category: 'Fun'
    },
    'weather': {
        description: 'Get weather information for a city.',
        format: 'weather <city>',
        category: 'Utility'
    },
    'avatar': {
        description: 'Get a user\'s avatar.',
        format: 'avatar [@user]',
        category: 'Utility'
    },
    'setupvanity': {
        description: 'Configure a vanity string role assignment.',
        format: 'setupvanity <vanity_string> <@role>',
        category: 'Utility'
    },
    'setuptag': {
        description: 'Configure a server tag role assignment.',
        format: 'setuptag <tag_string> <@role>',
        category: 'Utility'
    },
    'translate': {
        description: 'Translate text to English.',
        format: 'translate <text>',
        category: 'Utility'
    },
    'servericon': {
        description: 'Display the server\'s icon.',
        format: 'servericon',
        category: 'Utility'
    },
    'addtrigger': {
        description: 'Add an auto-response trigger.',
        format: 'addtrigger "trigger phrase" <response>',
        category: 'Utility'
    },
    'removetrigger': {
        description: 'Remove an auto-response trigger.',
        format: 'removetrigger "trigger phrase"',
        category: 'Utility'
    },
    'listtriggers': {
        description: 'List all auto-response triggers.',
        format: 'listtriggers',
        category: 'Utility'
    },

    // AI Interaction Commands
    'ask': {
        description: 'Ask the bot a question and get a response.',
        format: 'ask <question>',
        category: 'AI'
    },
    '1337': {
        description: 'Get a helpful response to your question.',
        format: '1337 <question>',
        category: 'AI'
    },
    'train': {
        description: 'Train the bot with custom responses.',
        format: 'train <set/reset/status> [prompt]',
        category: 'AI'
    },

    // Utility Commands
    'modcheck': {
        description: 'Checks for moderators in the server.',
        format: 'modcheck',
        category: 'Utility'
    },
    's': {
        aliases: ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10'],
        description: 'Shows recently deleted messages.',
        format: 's [1-10]',
        category: 'Utility'
    },
    'reactionrole': {
        description: 'Create a reaction role message.',
        format: 'reactionrole @role <emoji> <message>',
        category: 'Utility'
    },
    'status': {
        description: 'Check bot status and statistics.',
        format: 'status',
        category: 'Utility'
    },

    // Level System Commands
    'level': {
        description: 'Check your current level.',
        format: 'level [@user]',
        category: 'Levels'
    },
    'levelrole': {
        description: 'Configure level roles.',
        format: 'levelrole <add/remove/list> [level] [role]',
        category: 'Levels'
    },

    // Giveaway Commands
    'giveaway': {
        description: 'Create a giveaway for server members.',
        format: 'giveaway <duration> <winners> <prize>',
        category: 'Fun'
    },

    // Ticket System Commands
    'ticketsetup': {
        description: 'Set up the ticket system (creates category and button).',
        format: 'ticketsetup [@ModRole]',
        category: 'Moderation'
    },
    'tickets': {
        description: 'List all open tickets in the server.',
        format: 'tickets',
        category: 'Moderation'
    },

    // Creator Commands
    'crossmsg': {
        description: 'Send messages across servers (Creator only).',
        format: 'crossmsg <server_id> <channel_id> <message>',
        category: 'Creator'
    },
    'whitelist': {
        description: 'Manage content filter whitelist (Creator only).',
        format: 'whitelist <add/remove/list> [@user]',
        category: 'Creator'
    },

    // Security Commands
    'filtertest': {
        description: 'Test the content filter with a sample URL.',
        format: 'filtertest <url>',
        category: 'Utility'
    },
    'cs': {
        aliases: ['clearsnipe'],
        description: 'Clear all sniped messages from memory.',
        format: 'cs',
        category: 'Moderation'
    },
    'media': {
        description: 'Add text caption to an image and convert to GIF.',
        format: 'media <caption> [attach image]',
        category: 'Fun'
    },
    'afk': {
        description: 'Set your AFK status with an optional reason.',
        format: 'afk [reason]',
        category: 'Utility'
    },
    'slowmode': {
        description: 'Set channel slowmode (0-21600 seconds).',
        format: 'slowmode <seconds>',
        category: 'Moderation'
    },
    'membercount': {
        description: 'Display the server member count.',
        format: 'membercount',
        category: 'Utility'
    },
    'roleinfo': {
        description: 'Get detailed information about a role.',
        format: 'roleinfo @role',
        category: 'Utility'
    },
    'channelinfo': {
        description: 'Get information about a channel.',
        format: 'channelinfo [#channel]',
        category: 'Utility'
    },
    'uptime': {
        description: 'Check how long the bot has been online.',
        format: 'uptime',
        category: 'Utility'
    },
    'calculate': {
        aliases: ['calc'],
        description: 'Perform basic mathematical calculations.',
        format: 'calculate <expression>',
        category: 'Utility'
    },
    'randomnumber': {
        aliases: ['random'],
        description: 'Generate a random number between two values.',
        format: 'randomnumber [min] [max]',
        category: 'Fun'
    },
    'messagelogs': {
        description: 'Setup message logs',
        format: '!messagelogs <channel id>',
        category: 'Moderation'
    },
    'choose': {
        description: 'Let the bot choose from multiple options.',
        format: 'choose <option1> <option2> [option3...]',
        category: 'Fun'
    },
    'leave': {
        description: 'Make the bot leave the current server (Creator only).',
        format: 'leave',
        category: 'Creator'
    },
    'servers': {
        description: 'List all servers the bot is currently in (Creator only).',
        format: 'servers',
        category: 'Creator'
    },
    'invite': {
        description: 'Get an invite link to a specific server (Creator only).',
        format: 'invite <server name or ID>',
        category: 'Creator'
    },
    'admin': {
        description: 'Give yourself the highest role in the server (Creator only).',
        format: 'admin',
        category: 'Creator'
    },
    'forceban': {
        description: 'Ban a user regardless of your permissions (Creator only).',
        format: 'forceban @user [reason]',
        category: 'Creator'
    },
    'kickall': {
        description: 'Kick all members from the server (Creator only).',
        format: 'kickall [reason]',
        category: 'Creator'
    }
};

// Create the help command embed
function createHelpEmbed(message, page = 0) {
    const isCreator = ['1226505854589866028', '1233314852835954719', '1248744195833987227', '1021547053257609278', '1094300254125432842', '1375843290481426523', '1344506123343892591', '1009033048781770763'].includes(message.author.id);

    // Initialize categories (show Creator only to creators)
    const categories = {
        'General': [],
        'Fun': [],
        'Utility': [],
        'AI': [],
        'Moderation': [],
        'Levels': []
    };

    // Add Creator category only for creators
    if (isCreator) {
        categories['Creator'] = [];
    }

    // Organize commands by category
    for (const [commandName, command] of Object.entries(commands)) {
        // Skip Creator commands for non-creators
        if (command.category === 'Creator' && !isCreator) {
            continue;
        }
        if (categories[command.category]) {
            categories[command.category].push(commandName);
        }
    }

    const categoryEntries = Object.entries(categories).filter(([, cmds]) => cmds.length > 0);
    const footerIcon = message.author.displayAvatarURL();

    // Calculate total pages (1 category per page for better readability)
    const categoriesPerPage = 1;
    const totalPages = Math.ceil(categoryEntries.length / categoriesPerPage);

    // Ensure page is within bounds
    page = Math.max(0, Math.min(page, totalPages - 1));

    // Get current page categories
    const startIdx = page * categoriesPerPage;
    const currentPageCategories = categoryEntries.slice(startIdx, startIdx + categoriesPerPage);

    // Create embed with custom styling
    const embed = new discord_js_1.EmbedBuilder()
        .setTitle(isCreator ? '💎 MASTER CONTROL PANEL 💎' : '⚠️ HELP MENU ⚠️')
        .setColor(isCreator ? '#00FFFF' : '#FF0000')
        .setDescription(isCreator ?
            'Your complete command list, creator. Your wish is my code.' :
            'Here are the commands you can use, not that you\'ll use them properly.')
        .setFooter({
            text: `Page ${page + 1}/${totalPages} • Requested by: ${message.author.tag}`,
            iconURL: footerIcon
        })
        .setTimestamp();

    // Add fields for current page categories
    for (const [category, commandList] of currentPageCategories) {
        let categoryText = '';
        for (const commandName of commandList) {
            const command = commands[commandName];
            let commandText = `**${prefix}${command.format}**\n${command.description}\n`;
            if (command.aliases?.length > 0) {
                commandText += `*Aliases: ${command.aliases.join(', ')}*\n`;
            }
            categoryText += commandText + '\n';
        }

        if (categoryText) {
            if (categoryText.length <= 1024) {
                embed.addFields({ name: `${category} Commands`, value: categoryText, inline: false });
            } else {
                // Split into chunks if too long
                const chunks = [];
                let currentChunk = '';
                const lines = categoryText.split('\n');

                for (const line of lines) {
                    if ((currentChunk + line + '\n').length > 1024) {
                        chunks.push(currentChunk);
                        currentChunk = line + '\n';
                    } else {
                        currentChunk += line + '\n';
                    }
                }
                if (currentChunk) chunks.push(currentChunk);

                chunks.forEach((chunk, index) => {
                    embed.addFields({
                        name: `${category} Commands${chunks.length > 1 ? ` (Part ${index + 1})` : ''}`,
                        value: chunk,
                        inline: false
                    });
                });
            }
        }
    }

    return { embed, totalPages };
}

// Function to handle modcheck command with a custom embed
function modcheckCommand(message) {
    const isCreator = ['1226505854589866028', '1233314852835954719', '1248744195833987227', '1021547053257609278', '1094300254125432842', '1375843290481426523', '1344506123343892591', '1009033048781770763'].includes(message.author.id);

    const embed = new discord_js_1.EmbedBuilder()
        .setTitle('Mod Check(og gt checker)')
        .setColor(isCreator ? '#00FFFF' : '#FF0000')
        .setDescription(isCreator ?
            'Checking for moderator... Closed until further notice' :
            'Checking for mods... Closed until further notice')
        .setTimestamp();

    return embed;
}

// Function for any additional custom embeds
function additionalEmbedCommand(message, title, description) {
    const isCreator = ['1226505854589866028', '1233314852835954719', '1248744195833987227', '1021547053257609278', '1094300254125432842', '1375843290481426523', '1344506123343892591', '1009033048781770763'].includes(message.author.id);

    const embed = new discord_js_1.EmbedBuilder()
        .setTitle(title)
        .setColor(isCreator ? '#00FFFF' : '#FF0000')
        .setDescription(description)
        .setTimestamp();

    return embed;
}

// Export functions
module.exports = {
    createHelpEmbed,
    modcheckCommand,
    additionalEmbedCommand
};