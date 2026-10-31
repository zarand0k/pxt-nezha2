/**
 * PlanetX wireless PS2 controller (receiver connected to an I2C port).
 *
 * Based on the joystick driver from pxt-PlanetX by ELECFREAKS (MIT license).
 * The receiver answers 0x10 when it is ready, then returns the value of the
 * requested button (1 = pressed) or stick axis (0..255, centre 128).
 */
//% color=#6A5ACD icon="" block="PS2 controller" weight=60
namespace nezhaPS2 {

    const PS2_ADDR = 0x08
    const PS2_READY = 0x10

    export enum PS2Button {
        //% block="⬆"
        Up = 5,
        //% block="⬇"
        Down = 7,
        //% block="⬅"
        Left = 8,
        //% block="➡"
        Right = 6,
        //% block="△"
        Triangle = 13,
        //% block="□"
        Square = 16,
        //% block="○"
        Circle = 14,
        //% block="✕"
        Cross = 15,
        //% block="L1"
        L1 = 11,
        //% block="R1"
        R1 = 12,
        //% block="L2"
        L2 = 9,
        //% block="R2"
        R2 = 10,
        //% block="L3"
        L3 = 2,
        //% block="R3"
        R3 = 3,
        //% block="SELECT"
        Select = 1,
        //% block="START"
        Start = 4
    }

    export enum PS2Axis {
        //% block="left stick X"
        LeftX = 27,
        //% block="left stick Y"
        LeftY = 28,
        //% block="right stick X"
        RightX = 25,
        //% block="right stick Y"
        RightY = 26
    }

    /**
     * Wait until the receiver is ready. Returns false when it does not answer.
     */
    function waitReady(): boolean {
        const start = input.runningTime()
        while (pins.i2cReadNumber(PS2_ADDR, NumberFormat.UInt8LE, false) != PS2_READY) {
            if (input.runningTime() - start > 50) {
                return false
            }
        }
        return true
    }

    function request(code: number): number {
        if (!waitReady()) {
            return -1
        }
        pins.i2cWriteNumber(PS2_ADDR, code, NumberFormat.UInt8LE, false)
        return pins.i2cReadNumber(PS2_ADDR, NumberFormat.UInt8LE, false)
    }

    /**
     * Check whether a button of the controller is pressed.
     * @param button button of the controller
     */
    //% blockId=nezhaps2_pressed block="PS2 button %button is pressed"
    //% button.fieldEditor="gridpicker" button.fieldOptions.columns=4
    //% weight=100
    export function buttonPressed(button: PS2Button): boolean {
        return request(button) == 1
    }

    /**
     * Position of a stick from -100 to 100 (0 = centre, right and up are positive).
     * @param axis stick and its direction
     */
    //% blockId=nezhaps2_axis block="PS2 %axis"
    //% weight=90
    export function stick(axis: PS2Axis): number {
        const raw = request(axis)
        if (raw < 0) {
            return 0
        }
        let value = Math.round((raw - 128) * 100 / 127)
        if (axis == PS2Axis.LeftY || axis == PS2Axis.RightY) {
            value = -value   // the receiver reports 0 for "up"
        }
        if (Math.abs(value) < 3) {
            value = 0        // ignore noise around the centre
        }
        return Math.clamp(-100, 100, value)
    }

    // ------------------------------------------------------------------
    // Button events: buttons with a handler are polled in the background
    // ------------------------------------------------------------------

    let watchedButtons: number[] = []
    let handlers: (() => void)[] = []
    let lastStates: boolean[] = []
    let polling = false

    /**
     * Run code when a button of the controller is pressed.
     * @param button button of the controller
     * @param handler code to run
     */
    //% blockId=nezhaps2_on_pressed block="on PS2 button %button pressed"
    //% button.fieldEditor="gridpicker" button.fieldOptions.columns=4
    //% weight=80
    export function onButtonPressed(button: PS2Button, handler: () => void): void {
        watchedButtons.push(button)
        handlers.push(handler)
        lastStates.push(false)
        if (polling) {
            return
        }
        polling = true
        control.inBackground(function () {
            while (true) {
                for (let i = 0; i < watchedButtons.length; i++) {
                    const pressed = buttonPressed(watchedButtons[i])
                    if (pressed && !lastStates[i]) {
                        const h = handlers[i]
                        control.runInParallel(h)
                    }
                    lastStates[i] = pressed
                }
                basic.pause(20)
            }
        })
    }
}
