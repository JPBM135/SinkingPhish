import fetch from 'node-fetch';
import config from '../../config.js';

export async function sendReportWebhook(Client, message) {

	const body = {
		username: Client.user.username + ' Logs',
		avatar_url: Client.user.avatarURL(),
		...message,
	};

	for (const url of config.report.webHooks) {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			console.error({
				msg: `Error sending webhook: ${response.statusText}`,
				url,
				message,
			});
		}
	}

	return true;

}

export async function sendLogWebhook(Client, message) {

	const body = {
		username: Client.user.username + ' Logs',
		avatar_url: Client.user.avatarURL(),
		...message,
	};

	for (const url of config.log.webHooks) {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			console.error({
				msg: `Error sending webhook: ${response.statusText}`,
				url,
				message,
			});
		}
	}

	return true;

}