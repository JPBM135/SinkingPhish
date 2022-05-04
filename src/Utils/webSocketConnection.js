import fetch from 'node-fetch';
import WebSocket from 'ws';
import config from '../../config.js';
import { interpolate } from './interpolateFormat.js';

const headers = {
	'X-Identity': config['X-Identity'],
	'accept': 'application/json',
};

export class AntiScamSocketConnection {
	constructor(client, url = config.WEBSOCKET_URL) {
		/** @type {import('discord.js').Client} */
		this.client = client;
		this.url = url;
		this.headers = headers;
		this.connection = new WebSocket(url, {
			headers,
		});
		this.connect();
	}

	connect() {
		this.connection.on('open', this.onOpen.bind(this));
		this.connection.on('message', this.onMessage.bind(this));
		this.connection.on('close', this.onClose.bind(this));
	}

	onOpen() {
		config.debug && console.log({
			msg: `[AntiScam WebSocket]: Websoket connected to ${this.url}`,
			url: this.url,
		});
		this.tries = 0;
	}

	_add(domains) {
		for (const d of domains) {
			this.client.ScamDomains.set(d, {
				domain: d,
				source: 'WebSocket',
				timestamp: Date.now(),
			});
		}
	}

	_remove(domains) {
		for (const d of domains) {
			this.client.ScamDomains.delete(d);
		}
	}

	onMessage(data) {
		const objData = JSON.parse(data.toString());
		this.sendWebHook(objData);

		config.debug && console.log({
			msg: `[AntiScam WebSocket]: Websocket message received: ${data.toString()}`,
			url: this.url,
		});

		if (objData.type === 'add') {
			this._add(objData.domains);
		}

		if (objData.type === 'delete') {
			this._remove(objData.domains);
		}
	}

	onClose(code, reason) {
		const backOff = this.backOff();
		this.tries += 1;

		config.debug && console.log({
			msg: `[AntiScam WebSocket]: WebSocket closed with code ${code} and reason ${reason}. Attempting reconnect after ${String(backOff)} seconds`,
			url: this.url,
			code,
			reason: typeof reason !== 'string' ? reason.toString() : reason,
			attemptReconnectAfterSeconds: backOff,
		});

		setTimeout(() => {
			this.connection = new WebSocket(this.url, {
				headers: this.headers,
			});
			this.connect();
		}, this.backOff());
	}

	backOff() {
		return Math.min(Math.floor(Math.exp(this.tries)), 10 * 60) * 1000;
	}

	async sendWebHook(data) {

		const body = {
			username: this.client.user.username + ' WebSocket Updates',
			avatar_url: this.client.user.avatarURL(),
			embeds: [
				{
					title: data.type === 'add' ? 'Domains added!' : 'Domains removed!',
					description: interpolate(this.client, data, data.type === 'add'),
					color: data.type === 'add' ? 0x00ffff : 0xff0000,
				},
			],
		};

		for (const url of config.WSUpdate.webHooks) {
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
					body,
				});
			}
		}

		return true;
	}
}
