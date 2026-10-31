/**
 * Ports of the Nezha expansion board shared by the sensor and LED blocks.
 *
 * Every RJ11 port carries two signal wires. Modules connected through the
 * Makeblock/Octopus adapter cable use the first signal wire (the green wire
 * of the adapter): J1 = P1, J2 = P2, J3 = P13, J4 = P15.
 * Native PlanetX modules with one signal use the second wire:
 * J1 = P8, J2 = P12, J3 = P14, J4 = P16.
 */
namespace nezhaV2 {

    export enum Port {
        //% block="J1"
        J1 = 1,
        //% block="J2"
        J2 = 2,
        //% block="J3"
        J3 = 3,
        //% block="J4"
        J4 = 4
    }

    /**
     * Pin of the first signal wire of a port (green wire of the adapter cable).
     */
    export function adapterPin(port: Port): DigitalPin {
        switch (port) {
            case Port.J1: return DigitalPin.P1
            case Port.J2: return DigitalPin.P2
            case Port.J3: return DigitalPin.P13
            default: return DigitalPin.P15
        }
    }

    /**
     * Pin of the second signal wire of a port (used by native PlanetX modules).
     */
    export function planetXPin(port: Port): DigitalPin {
        switch (port) {
            case Port.J1: return DigitalPin.P8
            case Port.J2: return DigitalPin.P12
            case Port.J3: return DigitalPin.P14
            default: return DigitalPin.P16
        }
    }
}
