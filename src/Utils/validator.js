export function configValidator(config) {
	if (!config.token) throw new Error('[Config] No token provided');
	if (!config.botOwners || !config.botOwners.length) throw new Error('[Config] No bot owners provided');
	if (!config.WSUpdate || !config.WSUpdate.webHooks || !config.WSUpdate.webHooks.length) throw new Error('[Config] No WSUpdate channel/webhook provided');
	if (!config.log || !config.log.webHooks || !config.log.webHooks.length) throw new Error('[Config] No log channel/webhook provided');
	if (!config.report || !config.report.webHooks || !config.report.webHooks.length) throw new Error('[Config] No report channel/webhook provided');
	if (!config.format || !config.format.add || !config.format.remove) throw new Error('[Config] No format provided');
	if (!config.format.add.includes('%domain%') || !config.format.remove.includes('%domain%')) throw new Error('[Config] No domain placeholder in format');
	if (!config.WEBSOCKET_URL) throw new Error('[Config] No WEBSOCKET_URL provided');
	if (!config.BASE_API_URL) throw new Error('[Config] No BASE_API_URL provided');
	if (!config['X-Identity']) throw new Error('[Config] No X_Identity provided');

	return config;

}