import { EmbedBuilder } from '@discordjs/builders';
import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';
import fetch from 'node-fetch';
import { URL } from 'node:url';
import config from '../../config.js';
import { generateEmbed } from '../Utils/embed.js';
import { sendLogWebhook, sendReportWebhook } from '../Utils/webhooks.js';

export default {
	name: 'report',
	description: 'Report a domain/url.',
	type: ApplicationCommandType.ChatInput,
	options: [{
		name: 'domain',
		description: 'The domain/url to report.',
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

		if (config.report.restrictDuplicates && client.ReportedDomains.has(domain)) return await interaction.editReply(generateEmbed(`:x: | The domain \`${domain}\` has already been reported. (<t:${Math.floor(client.ReportedDomains.get(domain) / 1000)}:f>)`, 0xff3e00));
		let isScam = client.ScamDomains.has(domain);

		if (!isScam && config.fetchDatabaseApi) {
			const response = await fetch(`${config.BASE_API_URL}check/${domain}`, {
				headers: {
					'X-Identity': config['X-Identity'],
				},
			});

			if (response.status !== '404' && !response.ok) {
				await sendLogWebhook(client, generateEmbed(`[AntiScam] Error fetching scam domain: ${response.status}`, 0xff0000));
			}

			const data = await response.json();
			isScam = data == true;
			if (data == true) {
				client.ScamDomains.set(domain, {
					domain: domain,
					source: 'API',
					timestamp: Date.now(),
				});
			}
		}

		if (isScam) return await interaction.editReply(generateEmbed(`:x: | The domain \`${domain}\` is already a scam domain.`, 0xff3e00));

		await interaction.editReply(generateEmbed(`:infinity: | The domain \`${domain}\` is not a scam domain. Reporting...`)).catch(console.error);

		await sendReportWebhook(client, { embeds: [
			new EmbedBuilder()
				.setTitle(`Domain Reported: \`${domain}\``)
				.setDescription(`Reported By: ${interaction.user.tag} (${interaction.user.id})
				Reported At: <t:${Math.floor(Date.now() / 1000)}:F> (<t:${Math.floor(Date.now() / 1000)}:R>)`)
				.setColor(0x0099ff)
				.setFooter({
					text: `Reports since the bot was started: ${interaction.client.ReportedDomains.size}`,
				}),
		] });

		client.ReportedDomains.set(domain, Date.now());

		await interaction.editReply(generateEmbed(`:white_check_mark: | The \`${domain}\` was reported successfully.`)).catch(console.error);
	},
};