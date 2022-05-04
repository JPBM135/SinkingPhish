import { EmbedBuilder } from '@discordjs/builders';
import config from '../../config.js';
import { getScamDomains } from '../Utils/fetchDomains.js';
import { sendLogWebhook } from '../Utils/webhooks.js';
import { AntiScamSocketConnection } from '../Utils/webSocketConnection.js';

export default {
	name: 'ready',
	once: true,
	/** @param {import('discord.js').Client} Client */
	async execute(Client) {
		console.log('[Events] Bot Ready!');

		// Fetch the scam domains
		if (config.fetchDatabase) {

			config.debug && console.log('[ScamDomains] Fetching scam domains...');

			const domains = await getScamDomains(Client);
			for (const domain of domains) {
				Client.ScamDomains.set(domain, {
					domain,
					source: 'Database',
					timestamp: Date.now(),
				});
			}

			Client.lastScamRefresh = Date.now();

			config.debug && console.log('[ScamDomains] Fetched ' + Client.ScamDomains.size + ' scam domains.');
		}

		// Set the scam refresh interval
		if (config.fetchDatabaseInterval) {

			config.debug && console.log('[ScamDomains] Fetching scam domains every ' + config.fetchDatabaseInterval + ' minutes...');

			setInterval(async () => {
				config.debug && console.log('[ScamDomains: Refresh] Refreshing scam domains...');

				const domains = await getScamDomains(Client);
				for (const domain of domains) {
					if (!Client.ScamDomains.has(domain)) {
						Client.ScamDomains.set(domain, {
							domain,
							source: 'Database',
							timestamp: Date.now(),
						});
					}
				}

				await sendLogWebhook(Client, { embeds: [
					new EmbedBuilder()
						.setAuthor({
							name: Client.user.username + ' ScamDomains',
							iconURL: Client.user.avatarURL(),
						})
						.setDescription(`**Scam domains were refreshed.**
						
						> There are now \`${Client.ScamDomains.size}\` scam domains.
						> Last refresh: <t:${Math.floor(Client.lastScamRefresh / 1000)}:f> (<t:${Math.floor(Client.lastScamRefresh / 1000)}:R>)`),
				] });

				Client.lastScamRefresh = Date.now();

				config.debug && console.log('[ScamDomains: Refresh] Fetched ' + Client.ScamDomains.size + ' scam domains.');
			}, config.fetchDatabaseInterval * 1000 * 60);
		}

		// Set the websocket connection
		config.debug && console.log('[ScamDomains] Setting up websocket connection...');
		Client.WebSocket = new AntiScamSocketConnection(Client);


		await sendLogWebhook(Client, { embeds: [
			new EmbedBuilder()
				.setAuthor({
					name: Client.user.username + ' Ready!',
					iconURL: Client.user.avatarURL(),
				})
				.setDescription(`**${Client.user.username} is ready!**

				> There are now \`${Client.ScamDomains.size}\` scam domains.

				> Last refresh: <t:${Math.floor(Client.lastScamRefresh / 1000)}:f> (<t:${Math.floor(Client.lastScamRefresh / 1000)}:R>)`)
				.setColor(0x00FF3f),
		] });
	},
};