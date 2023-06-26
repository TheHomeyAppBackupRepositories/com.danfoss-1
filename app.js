'use strict';

const Homey = require('homey');

class DanfossZwave extends Homey.App {
	onInit() {
		this.log('Danfoss Z-wave app is running...');
	}
}

module.exports = DanfossZwave;
