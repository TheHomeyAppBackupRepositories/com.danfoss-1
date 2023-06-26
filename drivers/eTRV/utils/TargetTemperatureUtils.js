'use strict';

const { CLUSTER } = require('zigbee-clusters');

const capability = 'target_temperature';
const setter = 'setSetpoint';
const MIN = -128;
const MAX = 127;

/**
 * @param heatAmount
 * @returns {{mode: string, amount}}
 */
function getHeatParam(heatAmount) {
    return {
        mode: 'heat',
        amount: heatAmount
    };
}

/**
 * The delta of degrees to heat / cool relative to the current temperature.
 *
 * @param zclNode {ZCLNode}
 * @param deltaDegrees {int} The amount of degrees to heat / cool.
 * Note: 150 = 15.0 degrees; -142 = -14.2 degrees.
 * @returns {Promise<void>}
 */
function changeTempDelta(zclNode, deltaDegrees) {
    return zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME][setter](getHeatParam(deltaDegrees));
}

/**
 * The 'setSetpoint' function only accepts signed uint8 values -128 to 127 where 127 would be 12.7 degrees.
 * This means that we have to call the method more than once when wanting to heat from 5 to 35 degrees for example.
 *
 * @param device {ZigBeeDevice}
 * @param zclNode {ZCLNode}
 * @param target {float} Target degrees to heat to.
 * @returns {Promise<number>} The rest of the degrees to heat within the min & max.
 */
async function preUpdateOutOfRangeHeatingDegreesDelta(device, zclNode, target) {
    let restAmount = Math.round((target - device.getCapabilityValue(capability)) * 10);
    while (restAmount > MAX) {
        await changeTempDelta(zclNode, MAX);
        restAmount -= MAX;
    }
    while (restAmount < MIN) {
        await changeTempDelta(zclNode, MIN);
        restAmount -= MIN;
    }
    return restAmount;
}

module.exports = {
    capability,
    setter,
    getHeatParam,
    changeTempDelta,
    preUpdateOutOfRangeHeatingDegreesDelta
};
