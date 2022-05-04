import { ActionRowBuilder, ButtonBuilder } from '@discordjs/builders';
import { ApplicationCommandOptionType, ApplicationCommandType, ButtonStyle } from 'discord.js';
import fetch from 'node-fetch';
import { URL } from 'node:url';
import config from '../../config.js';
import { generateEmbed } from '../Utils/embed.js';
import { sendLogWebhook } from '../Utils/webhooks.js';

export default {
	name: 'check',
	description: 'Check if a domain/url exists in the database.',
	type: ApplicationCommandType.ChatInput,
	options: [{
		name: 'domain',
		description: 'The domain/url to check.',
		required: true,
		type: ApplicationCommandOptionType.String,
	}],
	/** @param {import('discord.js').ChatInputCommandInteraction} interaction */
	async execute(interaction, client) {
		const domainValue = interaction.options.get('domain', true).value;
		let domain = '';
		try {
			const url = new URL(domainValue);
			domain = url.hostname;
		}
		catch (e) {
			domain = domainValue;
		}

		await interaction.reply(generateEmbed(`:infinity: | Checking if \`${domain}\` is a scam domain...`)).catch(console.error);

		const isScam = client.ScamDomains.has(domain);

		if (!isScam && config.fetchDatabaseApi) {
			const response = await fetch(`${config.BASE_API_URL}check/${domain}`, {
				headers: {
					'X-Identity': config['X-Identity'],
				},
			});

			if (response.status !== 404 && !response.ok) {
				await sendLogWebhook(client, generateEmbed(`[AntiScam] Error fetching scam domain: ${response.status}`, 0xff0000));
			}

			const data = await response.text();
			if (data == true) {
				client.ScamDomains.set(domain, {
					domain: domain,
					source: 'API',
					timestamp: Date.now(),
				});
			}
		}

		const scamDomain = client.ScamDomains.get(domain);

		if (!scamDomain && config.report.restrictDuplicates && client.ReportedDomains.has(domain)) {
			return await interaction.editReply(generateEmbed(`:x: | The \`${domain}\` wasn't found in the database and has already been reported.
			
			> Reported at: <t:${Math.floor(client.ReportedDomains.get(domain) / 1000)}:f> `, 0xff3e00)).catch(console.error);
		}
		else if (!scamDomain) {
			const row = new ActionRowBuilder()
				.addComponents([
					new ButtonBuilder()
						.setCustomId('REPORT')
						.setEmoji({ name: '📨' })
						.setLabel('Report')
						.setStyle(ButtonStyle.Secondary),
				]);

			await interaction.editReply({
				...generateEmbed(`:x: | The domain \`${domain}\` wasn't found in the database.
				
				> *You can report it using the button bellow*`, 0xff3e00),
				components: [row],
			}).catch(console.error);
		}
		else {
			await interaction.editReply(generateEmbed(`:octagonal_sign: | The \`${domain}\` is a scam domain.
			
			> **Source**: ${scamDomain.source}
			> **Added At**: <t:${Math.floor(scamDomain.timestamp / 1000)}:f>`)).catch(console.error);
		}

	},
};