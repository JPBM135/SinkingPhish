export default {
	// The token of the bot
	token: '',
	// The owners of the bot in form of an UserId array, curently only owner is just a fancy name
	botOwners: [''],

	// Default guild id for command deployment
	defaultGuild: '',
	// Client ID for the bot
	clientId: '',

	// Enable logging to the console
	debug: true,

	// Config about the WebSocket updates
	WSUpdate: {
		// The webhook to send the updates
		webHooks: [''],
	},

	// Config about the general logs
	log: {
		// The webhook to send the logs
		webHooks: [''],
	},

	// Config about reports
	report: {
		// The webhook to send the reports
		webHooks: [''],
		// If true the bot will not send the report with the domain was already reported
		restrictDuplicates: true,
	},

	// The format to send the updates
	/*
	Cheatsheet:

		%domain% = will be replaced with the domain added/removed
		%dbSize% = will be replaced with the size of the database
		%timestampT% = will be replaced with the time of the update (16:20:30)
		%timestampF% = will be replaced with the full timestamp of the update (Tuesday, 20 April 2021 16:20)
		%timestampR% = will be replaced with the relative timestamp of the update (2 months ago)
		You can add your own custom placeholders at: /src/Utils/interpolateFormat.js
	*/
	format: {
		add: 'Added `%domain%`\n%timestampF%',
		remove: 'Removed `%domain%`\n%timestampF%',
	},

	// If the bot should fetch the database on startup
	fetchDatabase: true,
	// Fetch the database every X minutes, set to null or 0 to disable
	fetchDatabaseInterval: 60,
	// If the bot should also hit for checks the api instead of relying on internal cache
	fetchDatabaseApi: true,

	// Base urls for the API
	WEBSOCKET_URL: 'wss://phish.sinking.yachts/feed',
	BASE_API_URL: 'https://phish.sinking.yachts/v2/',
	'X-Identity': 'SinkingYachts/Bot',
};