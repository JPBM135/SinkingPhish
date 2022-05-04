import { EmbedBuilder } from '@discordjs/builders';
import { sendReportWebhook } from '../Utils/webhooks.js';

export default {
	name: 'interactionCreate',
	once: false,
	/** @param {import('discord.js').Interaction} interaction */
	async execute(interaction, Client) {
		try {
			if (interaction.isChatInputCommand()) {
				const { commandName } = interaction;
				const command = interaction.client.commands.get(commandName);
				if (!command) return await interaction.reply('Command not found').catch(console.error);

				await command.execute(interaction, interaction.client).catch(console.error);
			}

			if (interaction.isButton()) {
				const { customId } = interaction;
				if (customId === 'REPORT') {
					const { message } = interaction;
					const eDesc = message.embeds[0].description;

					const { groups } = eDesc.match(/`(?<domain>.+)`/);
					const domain = groups.domain;

					await interaction.update({ components: [], embeds: [ { description: eDesc.split('\n')[0] + '\n\n> :hourglass: | Reporting the domain...' } ] }).catch(console.error);

					interaction.client.ReportedDomains.set(domain, Date.now());

					await sendReportWebhook(Client, { embeds: [
						new EmbedBuilder()
							.setTitle(`Domain Reported: \`${domain}\``)
							.setDescription(`Reported By: ${interaction.user.tag} (${interaction.user.id})
							Reported At: <t:${Math.floor(Date.now() / 1000)}:F> (<t:${Math.floor(Date.now() / 1000)}:R>)`)
							.setColor(0x0099ff)
							.setFooter({
								text: `Reports since the bot was started: ${interaction.client.ReportedDomains.size}`,
							}),
					] });


					await interaction.editReply({ embeds: [ { color: 0x0099ff, description: eDesc.split('\n')[0] + `\n\n> :white_check_mark: | Reported successfully. <t:${Math.floor(Date.now() / 1000)}:f>` } ] }).catch(console.error);
				}
			}
		}
		catch (error) {
			console.error(error);
		}
	},
};