import fetch from 'node-fetch';
import config from '../../config.js';

export async function getScamDomains(client, url = config.BASE_API_URL + 'all') {
	const response = await fetch(url, {
		headers: {
			'X-Identity': config['X-Identity'],
		},
	});

	if (!response.ok) {
		console.error(`[AntiScam] Error fetching scam domains: ${response.status}`);
	}

	const data = await response.json();
	return data;
}