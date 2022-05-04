import { EmbedBuilder } from '@discordjs/builders';

export function generateEmbed(string, color = 0x0099ff) {
	const embed = new EmbedBuilder()
		.setDescription(string)
		.setColor(color);

	return { embeds: [embed] };
}