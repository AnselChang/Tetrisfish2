import { Client, EmbedBuilder, GatewayIntentBits, GuildMember, Message, PartialGuildMember, PartialUser, Partials, TextChannel, User } from 'discord.js';
import { setProUserStatus } from '../database/user/user-service';

const TETRISFISH_SERVER_ID = '911159458699304980';
const PATREON_ROLE_ID = '1179779612633485333';

export default class DiscordBot {

    readonly client: Client;

    constructor() {
        this.client = new Client({ intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMembers],
            partials: [Partials.GuildMember, Partials.User],
        });

        this.client.once('ready', () => {
            console.log('Ready!');
            // this.sendMessage("Tetrisfish bot is now online!");
        });

        this.client.on('guildMemberUpdate', (oldMember, newMember) => {
            this.handleUserUpdate(oldMember, newMember);
        });

        const token = process.env['DISCORD_BOT_TOKEN'];
        this.client.login(token);

    }

    // external Patreon bot handles adding/removing Patreon role
    // this method is called whenever discord user properties change
    // check if user has changed whether user in tetrisfish server has Patreon role
    // if there's a change, update the database
    async handleUserUpdate(oldMember: GuildMember | PartialGuildMember, newMember: GuildMember) {

        // Check and fetch complete member if partial
        if (oldMember.partial) oldMember = await oldMember.fetch();
        if (newMember.partial) newMember = await newMember.fetch();

        console.log(`User ${newMember.user.username} has been updated.`);
        const oldHasRole = oldMember.roles.cache.has(PATREON_ROLE_ID);
        const newHasRole = newMember.roles.cache.has(PATREON_ROLE_ID);
        console.log(`Old role: ${oldHasRole}, new role: ${newHasRole}`);

        // for the very first time the user is updated, the old value isn't accurate.
        // So, we'll just ignore old and always send patreon role updates to database
        await setProUserStatus(newMember.id, newHasRole);
        
    }



    sendBugReport(username: string, description: string, url: string): void {

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Frame-by-frame bug report')
            .setURL(url)
            .setAuthor({ name: username })
            .setDescription(description)
            .setTimestamp();

        this.sendMessage(undefined, embed, true);
            
    }

    async sendMessage(messageText?: string, embed?: EmbedBuilder, createThread: boolean = false): Promise<void> {

        if (!messageText && !embed) {
            console.error('Must provide either message text or embed!');
            return;
        }

        const channelID = process.env['DISCORD_BUG_REPORT_CHANNEL_ID']!;
        const channel = await this.client.channels.fetch(channelID) as TextChannel;
        if (!channel) {
            console.error('Channel not found!');
            return;
        }

        try {
            let message;
            if (messageText && embed) {
                // Send both message and embed
                message = await channel.send({ content: messageText, embeds: [embed] });
            } else if (messageText) {
                // Send only message
                message = await channel.send(messageText);
            } else {
                // Send only embed
                message = await channel.send({ embeds: [embed!] });
            }
            if (createThread) this.createThreadForMessage(message);

        } catch (error) {
            console.error('Error sending message', error);
        }
    }

    async createThreadForMessage(message: Message) {
        try {
            const thread = await message.startThread({
                name: `${message.content.substring(0, 10)}...`,
                autoArchiveDuration: 60,
            });
            console.log(`Thread created: ${thread.url}`);
        } catch (error) {
            console.error('Error creating thread', error);
        }
    }

}