'use strict';

const { ZwaveDevice } = require('homey-zwavedriver');

class DanfossLC extends ZwaveDevice {
  onNodeInit() {
    this.registerCapability('target_temperature', 'THERMOSTAT_SETPOINT');
    this.registerCapability('measure_battery', 'BATTERY');

    // Legacy
    if (this.hasCapability('alarm_battery')) {
      this.registerCapability('alarm_battery', 'BATTERY');
    }
  }
}

module.exports = DanfossLC;
