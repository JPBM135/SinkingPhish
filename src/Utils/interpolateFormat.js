import Config from '../../config.example.js';

export function interpolate(client, data, add = true) {
	const domains = data.domains.join(', ');
	let string = `${Config.format[add ? 'add' : 'remove']}`;

	const interpolations = {
		'%domain%': domains,
		'%dbsize%': client.ScamDomains.size,
		'%timestampT%': `<t:${Math.floor(Date.now() / 1000)}:T>`,
		'%timestampF%': `<t:${Math.floor(Date.now() / 1000)}:F>`,
		'%timestampR%': `<t:${Math.floor(Date.now() / 1000)}:R>`,
	};

	for (const [key, value] of Object.entries(interpolations)) {
		string = string.replace(key, value);
	}

	return string;

}