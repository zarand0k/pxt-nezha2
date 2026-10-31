/**
 * Ports of the Nezha expansion board shared by the sensor and LED blocks.
 *
 * Every RJ11 port carries two signal wires.
 * First wire (green wire of the Makeblock RGB LED adapter):
 * J1 = P1, J2 = P2, J3 = P13, J4 = P15.
 * Second wire (PlanetX modules, Octopus line sensor and Sonar:bit):
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
     * Pin of the first signal wire of a port (green wire of the Makeblock RGB LED adapter).
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
     * Pin of the second signal wire of a port (PlanetX modules, Octopus line sensor, Sonar:bit).
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
