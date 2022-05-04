import {
	Client as DjsClient,
	Collection,
	GatewayIntentBits as GatewayIntents,
} from 'discord.js';
import Config from '../config.js';
import { readdirSync } from 'fs';
import { configValidator } from './Utils/validator.js';

// Check if the config is valid
configValidator(Config);

// Create a new Discord.js client
const Client = new DjsClient({
	intents: [
		GatewayIntents.GuildWebhooks,
	],
	shards: 'auto',
});

// Read the events from the Events folder
const Events = readdirSync('./src/Events').filter(file => file.endsWith('.js'));

// Load the events
for (const eventFile of Events) {
	const event = await import(`./Events/${eventFile}`).then(module => module.default);

	Config.debug && console.log(`[Events] Loaded event ${eventFile}`);

	event.once ? Client.once(event.name, (...args) => event.execute(...args, Client))
		: Client.on(event.name, (...args) => event.execute(...args, Client));
}

Config.debug && console.log('[Events] Loaded all events');

// Read the commands from the Commands folder
const Commands = readdirSync('./src/Commands').filter(file => file.endsWith('.js'));
// Create a collection for the commands
Client.commands = new Collection();

// Load the commands
for (const commandFile of Commands) {
	const command = await import(`./Commands/${commandFile}`).then(module => module.default);

	Config.debug && console.log(`[Commands] Loaded command ${commandFile}`);

	Client.commands.set(command.name, command);
}

Config.debug && console.log('[Commands] Loaded all commands');

Client.ScamDomains = new Map();
Client.ReportedDomains = new Map();

// Login to the bot
Client.login(Config.token);