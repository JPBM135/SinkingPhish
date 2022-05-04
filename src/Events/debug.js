import config from '../../config.js';

export default {
	name: 'debug',
	once: false,
	execute(data) {
		config.debug && console.log(data);
	},
};