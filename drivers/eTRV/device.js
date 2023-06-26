'use strict';

const { preUpdateOutOfRangeHeatingDegreesDelta, getHeatParam } = require('./utils/TargetTemperatureUtils')
const { CLUSTER } = require('zigbee-clusters');
const { ZigBeeDevice } = require('homey-zigbeedriver');


class Device extends ZigBeeDevice {
    async onNodeInit({ zclNode }) {
        this.registerMeasureBatteryCapability();
        this.registerTargetTemperatureCapability(zclNode);
        this.registerMeasureTemperatureCapability();
    }

    /**
     * @returns
     * @private
     */
    registerMeasureBatteryCapability() {
        const capability = 'measure_battery';
        const attribute = 'batteryPercentageRemaining';

        if (!this.hasCapability(capability)){
            return;
        }

        this.registerCapability(
            capability,
            CLUSTER.POWER_CONFIGURATION,
            {
                get: attribute,
                getOpts: {
                    getOnStart: true,
                    getOnOnline: true,
                    pollInterval: 60000 * 5, // 5 minutes
                },
                report: attribute,
                reportParser(report) {
                    return (report / 255) * 100;
                },
                reportOpts: {
                    configureAttributeReporting: {
                        minInterval: 0,
                        maxInterval: 60
                    },
                }
            }
        );
    }

    /**
     * @param zclNode {ZCLNode}
     * @returns
     * @private
     */
    registerTargetTemperatureCapability(zclNode) {
        const capability = 'target_temperature';
        const setter = 'setSetpoint';
        const attribute = 'occupiedHeatingSetpoint';

        this.registerCapability(
            capability,
            CLUSTER.THERMOSTAT,
            {
                set: setter,
                async setParser(targetDegrees) {
                    let amount = await preUpdateOutOfRangeHeatingDegreesDelta(this, zclNode, targetDegrees);
                    return getHeatParam(amount);
                },
                setOpts: {
                    timeout: 3000
                },
                get: attribute,
                getOpts: {
                    getOnStart: true,
                    getOnOnline: true,
                    pollInterval: 30000, // 30sec
                },
                report: attribute,
                reportParser(report) {
                    return Math.round(report / 10) / 10
                },
                reportOpts: {
                    configureAttributeReporting: {
                        minInterval: 0,
                        maxInterval: 60
                    },
                }
            }
        );
    }

    /**
     * @returns
     * @private
     */
    registerMeasureTemperatureCapability() {
        const capability = 'measure_temperature';
        const attribute = 'localTemperature';

        this.registerCapability(
            capability,
            CLUSTER.THERMOSTAT,
            {
                get: attribute,
                getOpts: {
                    getOnStart: true,
                    getOnOnline: true,
                    pollInterval: 30000, // 30 sec
                },
                report: attribute,
                reportParser(report) {
                    return Math.round(report / 10) / 10
                },
                reportOpts: {
                    configureAttributeReporting: {
                        minInterval: 0,
                        maxInterval: 60
                    },
                }
            }
        );
    }
}

module.exports = Device;
