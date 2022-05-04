import { ApplicationCommandType } from 'discord.js';
import fetch from 'node-fetch';
import config from '../../config.js';
import { generateEmbed } from '../Utils/embed.js';
import { sendLogWebhook } from '../Utils/webhooks.js';

export default {
	name: 'dbsize',
	description: 'Get the domain database size.',
	type: ApplicationCommandType.ChatInput,
	options: [],
	/** @param {import('discord.js').ChatInputCommandInteraction} interaction */
	async execute(Interaction, client) {
		const size = Interaction.client.ScamDomains.size;
		const lastScamRefresh = Interaction.client.lastScamRefresh;

		await Interaction.reply(generateEmbed(':infinity: | Getting the database size...')).catch(console.error);

		const response = await fetch(`${config.BASE_API_URL}dbsize`, {
			headers: {
				'X-Identity': config['X-Identity'],
			},
		});

		if (!response.ok) {
			await sendLogWebhook(client, generateEmbed(`[AntiScam] Error fetching scam domain: ${response.status}`, 0xff0000));
		}

		const data = await response.text();

		Interaction.editReply(generateEmbed(`:bookmark_tabs: | The local database contains \`${size}\` scam domains. (Api: ${data})
		> Last refresh: <t:${Math.floor(lastScamRefresh / 1000)}:f> (<t:${Math.floor(lastScamRefresh / 1000)}:R>)`));
	},
};