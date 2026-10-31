/**
 * Sensors used with the Nezha board:
 *  - PlanetX colour sensor (I2C)
 *  - Octopus line-tracking sensor (two digital outputs, second wire of the port)
 *  - Sonar:bit ultrasonic distance sensor (one data wire, second wire of the port)
 *
 * Drivers are based on pxt-PlanetX and pxt-sonarbit by ELECFREAKS (MIT license).
 */
//% color=#00B1ED icon="" block="Sensors" weight=70
//% groups='["Color sensor", "Line sensor", "Ultrasonic sensor"]'
namespace nezhaSensors {

    // ------------------------------------------------------------------
    // Colour sensor (PlanetX, APDS9960 or the newer chip at address 0x43)
    // ------------------------------------------------------------------

    export enum SensorColor {
        //% block="red"
        Red,
        //% block="green"
        Green,
        //% block="blue"
        Blue,
        //% block="cyan"
        Cyan,
        //% block="purple"
        Magenta,
        //% block="yellow"
        Yellow,
        //% block="white"
        White
    }

    const APDS9960_ADDR = 0x39
    const APDS9960_ENABLE = 0x80
    const APDS9960_ATIME = 0x81
    const APDS9960_CONTROL = 0x8F
    const APDS9960_STATUS = 0x93
    const APDS9960_CDATAL = 0x94
    const APDS9960_RDATAL = 0x96
    const APDS9960_GDATAL = 0x98
    const APDS9960_BDATAL = 0x9A
    const APDS9960_GCONF4 = 0xAB
    const APDS9960_AICLEAR = 0xE7
    const NEW_SENSOR_ADDR = 0x43

    let apdsReady = false
    let newSensorReady = false

    function writeReg(addr: number, reg: number, value: number): void {
        const buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(addr, buf)
    }

    function readReg(addr: number, reg: number): number {
        pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE)
        return pins.i2cReadNumber(addr, NumberFormat.UInt8BE)
    }

    function readReg16(addr: number, reg: number): number {
        return readReg(addr, reg) + readReg(addr, reg + 1) * 256
    }

    function initApds(): void {
        writeReg(APDS9960_ADDR, APDS9960_ATIME, 252)
        writeReg(APDS9960_ADDR, APDS9960_CONTROL, 0x03)
        writeReg(APDS9960_ADDR, APDS9960_ENABLE, 0x00)
        writeReg(APDS9960_ADDR, APDS9960_GCONF4, 0x00)
        writeReg(APDS9960_ADDR, APDS9960_AICLEAR, 0x00)
        writeReg(APDS9960_ADDR, APDS9960_ENABLE, 0x01)
        // switch on the colour (ALS) engine
        writeReg(APDS9960_ADDR, APDS9960_ENABLE, readReg(APDS9960_ADDR, APDS9960_ENABLE) | 0x2)
        apdsReady = true
    }

    function tryInitNewSensor(): void {
        const buf = pins.createBuffer(2)
        for (let i = 0; i < 20; i++) {
            buf[0] = 0x81
            buf[1] = 0xCA
            pins.i2cWriteBuffer(NEW_SENSOR_ADDR, buf)
            buf[0] = 0x80
            buf[1] = 0x17
            pins.i2cWriteBuffer(NEW_SENSOR_ADDR, buf)
            basic.pause(50)
            if (readReg16(NEW_SENSOR_ADDR, 0xA4) != 0) {
                newSensorReady = true
                return
            }
        }
    }

    function rgbToHue(r: number, g: number, b: number): number {
        const maxVal = Math.max(r, Math.max(g, b))
        const minVal = Math.min(r, Math.min(g, b))
        const delta = maxVal - minVal
        if (delta <= 0) {
            return 0
        }
        if (maxVal == r) {
            let h = 60 * (g - b) / delta
            return h < 0 ? h + 360 : h
        }
        if (maxVal == g) {
            return 60 * (b - r) / delta + 120
        }
        return 60 * (r - g) / delta + 240
    }

    /**
     * Hue of the colour seen by the PlanetX colour sensor
     * (0 = red, 60 = yellow, 120 = green, 180 = cyan, 240 = blue, 300 = purple).
     * The sensor is connected to any I2C port.
     */
    //% blockId=nezhasensors_color_hue block="color sensor hue (0-360)"
    //% group="Color sensor" weight=100
    export function colorHue(): number {
        let c = 0
        let r = 0
        let g = 0
        let b = 0
        let rawC = 0
        let rawR = 0
        let rawG = 0
        let rawB = 0

        if (!newSensorReady && !apdsReady) {
            tryInitNewSensor()
        }

        if (newSensorReady) {
            basic.pause(100)
            c = readReg16(NEW_SENSOR_ADDR, 0xA6)
            r = readReg16(NEW_SENSOR_ADDR, 0xA0)
            g = readReg16(NEW_SENSOR_ADDR, 0xA2)
            b = readReg16(NEW_SENSOR_ADDR, 0xA4)

            // calibration taken over from pxt-PlanetX
            r *= 1.3 * 0.47 * 0.83
            g *= 0.69 * 0.56 * 0.83
            b *= 0.80 * 0.415 * 0.83
            c *= 0.3
            if (r > b && r > g) {
                b *= 1.18
                g *= 0.95
            }
            rawC = c
            rawR = r
            rawG = g
            rawB = b
            if (rawB < rawG) {
                const swap = rawB
                rawB = rawG
                rawG = swap
            }
            r = Math.min(r, 4095.9356)
            g = Math.min(g, 4095.9356)
            b = Math.min(b, 4095.9356)
            c = Math.min(c, 4095.9356)
        } else {
            if (!apdsReady) {
                initApds()
            }
            const start = input.runningTime()
            while ((readReg(APDS9960_ADDR, APDS9960_STATUS) & 0x1) == 0) {
                if (input.runningTime() - start > 500) {
                    break
                }
                basic.pause(5)
            }
            c = readReg16(APDS9960_ADDR, APDS9960_CDATAL)
            r = readReg16(APDS9960_ADDR, APDS9960_RDATAL)
            g = readReg16(APDS9960_ADDR, APDS9960_GDATAL)
            b = readReg16(APDS9960_ADDR, APDS9960_BDATAL)
        }

        if (c <= 0) {
            return 0
        }
        let h = rgbToHue(r, g, b)
        // white surfaces are reported in the narrow band 180-193 (as in pxt-PlanetX)
        if (newSensorReady && h >= 180 && h <= 201 && rawC >= 6000 && (rawB - rawG) < 1000
            || (rawR > 4096 && rawG > 4096 && rawB > 4096)) {
            rawC = Math.map(rawC, 0, 15000, 0, 13000)
            h = 180 + (13000 - rawC) / 1000.0
        }
        return Math.round(h)
    }

    /**
     * Check whether the colour sensor sees the given colour.
     * @param color colour to look for
     */
    //% blockId=nezhasensors_color_is block="color sensor sees %color"
    //% color.fieldEditor="gridpicker" color.fieldOptions.columns=3
    //% group="Color sensor" weight=90
    export function colorIs(color: SensorColor): boolean {
        const h = colorHue()
        switch (color) {
            case SensorColor.Red: return h > 330 || h < 20
            case SensorColor.Yellow: return h > 30 && h < 120
            case SensorColor.Green: return h > 120 && h < 180
            case SensorColor.White: return h >= 180 && h < 190
            case SensorColor.Cyan: return h > 190 && h < 210
            case SensorColor.Blue: return h > 210 && h < 270
            case SensorColor.Magenta: return h > 260 && h < 330
            default: return false
        }
    }

    // ------------------------------------------------------------------
    // Octopus line-tracking sensor: output 0 = black line, 1 = white surface
    // ------------------------------------------------------------------

    export enum LineState {
        //% block="● ●"
        BothOnLine = 0,
        //% block="● ◌"
        LeftOnLine = 1,
        //% block="◌ ●"
        RightOnLine = 2,
        //% block="◌ ◌"
        NoneOnLine = 3
    }

    function seesLine(port: nezhaV2.Port): boolean {
        const pin = nezhaV2.planetXPin(port)
        pins.setPull(pin, PinPullMode.PullUp)
        return pins.digitalReadPin(pin) == 0
    }

    /**
     * Check whether one side of the line sensor is above the black line.
     * @param port port the sensor side is connected to
     */
    //% blockId=nezhasensors_line_one block="line sensor on port %port sees black line"
    //% port.defl=nezhaV2.Port.J1
    //% group="Line sensor" weight=80
    export function lineDetected(port: nezhaV2.Port): boolean {
        return seesLine(port)
    }

    /**
     * Check the state of both sides of the line sensor (● = black line, ◌ = white).
     * @param left port of the left side of the sensor
     * @param right port of the right side of the sensor
     * @param state expected state of both sides
     */
    //% blockId=nezhasensors_line_both block="line sensor left %left right %right is %state"
    //% left.defl=nezhaV2.Port.J1 right.defl=nezhaV2.Port.J2
    //% state.fieldEditor="gridpicker" state.fieldOptions.columns=2
    //% inlineInputMode=inline
    //% group="Line sensor" weight=75
    export function lineState(left: nezhaV2.Port, right: nezhaV2.Port, state: LineState): boolean {
        const l = seesLine(left)
        const r = seesLine(right)
        switch (state) {
            case LineState.BothOnLine: return l && r
            case LineState.LeftOnLine: return l && !r
            case LineState.RightOnLine: return !l && r
            default: return !l && !r
        }
    }

    // ------------------------------------------------------------------
    // Sonar:bit ultrasonic sensor (trigger and echo share one data wire)
    // ------------------------------------------------------------------

    export enum DistanceUnit {
        //% block="cm"
        Cm = 0,
        //% block="mm"
        Mm = 1
    }

    let lastDistanceCm = 0

    /**
     * Distance to an obstacle measured by the Sonar:bit (2 to 400 cm).
     * Returns 0 if nothing is in range.
     * @param port port the sensor is connected to
     * @param unit unit of the result
     */
    //% blockId=nezhasensors_sonar block="ultrasonic distance on port %port in %unit"
    //% group="Ultrasonic sensor" weight=70
    export function distance(port: nezhaV2.Port, unit: DistanceUnit = DistanceUnit.Cm): number {
        const pin = nezhaV2.planetXPin(port)
        pins.setPull(pin, PinPullMode.PullNone)
        pins.digitalWritePin(pin, 0)
        control.waitMicros(2)
        pins.digitalWritePin(pin, 1)
        control.waitMicros(10)
        pins.digitalWritePin(pin, 0)

        const echo = pins.pulseIn(pin, PulseValue.High, 25000)
        let cm = echo / 58
        if (cm > 400) {
            cm = 0
        }
        // a single missed echo returns the previous value instead of 0
        if (cm == 0) {
            cm = lastDistanceCm
            lastDistanceCm = 0
        } else {
            lastDistanceCm = cm
        }

        if (unit == DistanceUnit.Mm) {
            return Math.floor(cm * 10)
        }
        return Math.floor(cm)
    }
}
