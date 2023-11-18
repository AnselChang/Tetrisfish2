import { Client, EmbedBuilder, GatewayIntentBits, Message, TextChannel } from 'discord.js';

export default class DiscordBot {

    readonly client: Client;

    constructor() {
        this.client = new Client({ intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent]
        });

        this.client.once('ready', () => {
            console.log('Ready!');
            this.sendMessage("Tetrisfish bot is now online!");
        });

        const token = process.env['DISCORD_BOT_TOKEN'];
        this.client.login(token);

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