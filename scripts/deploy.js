import { REST } from '@discordjs/rest';
// eslint-disable-next-line import/extensions
import { Routes } from 'discord-api-types/v10';
import { readdirSync } from 'fs';
import config from '../config.js';

const Commands = readdirSync('./src/Commands').filter(file => file.endsWith('.js'));
const applicationCommands = [];
// Create a collection for the commands

// Load the commands
for (const commandFile of Commands) {
	const { name, description, type, options } = await import(`../src/Commands/${commandFile}`).then(module => module.default);

	applicationCommands.push({ name, description, type, options });
}


const rest = new REST({ version: '10' }).setToken(config.token);

rest.put(Routes.applicationGuildCommands(config.clientId, config.defaultGuild), { body: applicationCommands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);