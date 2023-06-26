'use strict';

const { ZwaveDevice } = require('homey-zwavedriver');

class DanfossRS extends ZwaveDevice {
  onNodeInit() {

		//enable debugging
		//this.enableDebug();

		//print the node's info to the console
		//this.printNode();

		this.registerCapability('target_temperature', 'THERMOSTAT_SETPOINT', {
			getOpts: {
				getOnOnline: true,
			},
		});
		this.registerCapability('measure_temperature', 'SENSOR_MULTILEVEL', {
			report: 'SENSOR_MULTILEVEL_REPORT',
			reportParser: report => {
				return ((Math.round(report['Sensor Value (Parsed)'] * 10) / 10));
			},
			getOpts: {
				getOnOnline: true,
			},
		});

		this.registerCapability('measure_battery', 'BATTERY', {
			getOpts: {
				getOnOnline: true,
			},
		});

    // Legacy
    if(this.hasCapability('alarm_battery')) {
      this.registerCapability('alarm_battery', 'BATTERY', {
        getOpts: {
          getOnOnline: true,
        },
      });
    }
	}
}

module.exports = DanfossRS;
