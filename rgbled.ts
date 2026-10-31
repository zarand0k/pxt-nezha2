/**
 * RGB LED modules with WS2812 (NeoPixel) LEDs, e.g. Makeblock Me RGB LED,
 * connected to a Nezha port through the adapter cable.
 *
 * Based on the NeoPixel driver from pxt-PlanetX by ELECFREAKS (MIT license).
 * All blocks update the LEDs immediately, so no extra "show" block is needed.
 */
//% color=#EA5532 icon="" block="RGB LED" weight=80
namespace nezhaLed {

    export enum LedColor {
        //% block="red"
        Red = 0xFF0000,
        //% block="orange"
        Orange = 0xFFA500,
        //% block="yellow"
        Yellow = 0xFFFF00,
        //% block="green"
        Green = 0x00FF00,
        //% block="cyan"
        Cyan = 0x00FFFF,
        //% block="blue"
        Blue = 0x0000FF,
        //% block="purple"
        Purple = 0xFF00FF,
        //% block="white"
        White = 0xFFFFFF,
        //% block="black"
        Black = 0x000000
    }

    export enum ColorOrder {
        //% block="GRB"
        GRB = 0,
        //% block="RGB"
        RGB = 1
    }

    export class Strip {
        pin: DigitalPin
        order: ColorOrder
        brightness: number      // 0..255
        pixels: number[]        // colour of each LED as 0xRRGGBB
        buf: Buffer

        /**
         * Light up all LEDs with one colour.
         * @param rgb colour of the LEDs
         */
        //% blockId=nezhaled_show_color block="%strip|show color %rgb=nezhaled_colors"
        //% weight=90
        showColor(rgb: number): void {
            for (let i = 0; i < this.pixels.length; i++) {
                this.pixels[i] = rgb
            }
            this.show()
        }

        /**
         * Light up one LED. LEDs are numbered from 0.
         * @param index number of the LED, eg: 0
         * @param rgb colour of the LED
         */
        //% blockId=nezhaled_set_pixel block="%strip|set LED %index|to %rgb=nezhaled_colors"
        //% index.min=0
        //% weight=85
        setPixelColor(index: number, rgb: number): void {
            index = Math.floor(index)
            if (index < 0 || index >= this.pixels.length) {
                return
            }
            this.pixels[index] = rgb
            this.show()
        }

        /**
         * Show all colours of the rainbow, spread across the LEDs.
         */
        //% blockId=nezhaled_rainbow block="%strip|show rainbow"
        //% weight=80
        showRainbow(): void {
            const count = this.pixels.length
            for (let i = 0; i < count; i++) {
                this.pixels[i] = hue(Math.idiv(i * 360, count))
            }
            this.show()
        }

        /**
         * Shift colours by the given number of LEDs. The last LED moves to the beginning.
         * @param offset number of LEDs to shift, eg: 1
         */
        //% blockId=nezhaled_rotate block="%strip|rotate colors by %offset"
        //% weight=75
        rotate(offset: number = 1): void {
            const count = this.pixels.length
            if (count == 0) {
                return
            }
            offset = ((Math.floor(offset) % count) + count) % count
            const rotated: number[] = []
            for (let i = 0; i < count; i++) {
                rotated.push(this.pixels[(i - offset + count) % count])
            }
            this.pixels = rotated
            this.show()
        }

        /**
         * Turn all LEDs off.
         */
        //% blockId=nezhaled_off block="%strip|turn off"
        //% weight=70
        turnOff(): void {
            this.showColor(LedColor.Black)
        }

        /**
         * Set brightness of the LEDs.
         * @param brightness brightness in percent, eg: 50
         */
        //% blockId=nezhaled_brightness block="%strip|set brightness %brightness \\%"
        //% brightness.min=0 brightness.max=100
        //% weight=65
        setBrightness(brightness: number): void {
            this.brightness = Math.clamp(0, 255, Math.round(brightness * 255 / 100))
            this.show()
        }

        /**
         * Use another pin for the data wire, e.g. P16 for native PlanetX LED modules on port J4.
         * @param pin pin connected to the data input of the LEDs
         */
        //% blockId=nezhaled_set_pin block="%strip|use pin %pin"
        //% advanced=true
        setPin(pin: DigitalPin): void {
            this.pin = pin
            pins.digitalWritePin(pin, 0)
            this.show()
        }

        /**
         * Send the colours to the LEDs (all other blocks call it automatically).
         */
        show(): void {
            const br = this.brightness
            for (let i = 0; i < this.pixels.length; i++) {
                const rgb = this.pixels[i]
                const red = (((rgb >> 16) & 0xFF) * br) >> 8
                const green = (((rgb >> 8) & 0xFF) * br) >> 8
                const blue = ((rgb & 0xFF) * br) >> 8
                const offset = i * 3
                if (this.order == ColorOrder.RGB) {
                    this.buf[offset] = red
                    this.buf[offset + 1] = green
                } else {
                    this.buf[offset] = green
                    this.buf[offset + 1] = red
                }
                this.buf[offset + 2] = blue
            }
            light.sendWS2812Buffer(this.buf, this.pin)
        }
    }

    /**
     * Create an RGB LED strip connected to a Nezha port through the adapter cable.
     * Store it in a variable and use it in the other RGB LED blocks.
     * @param port port of the Nezha board
     * @param count number of LEDs, eg: 4
     * @param order order of colours expected by the LEDs, most LEDs use GRB
     */
    //% blockId=nezhaled_create block="RGB LED on port %port with %count LEDs || color order %order"
    //% port.defl=nezhaV2.Port.J4
    //% count.min=1 count.defl=4
    //% blockSetVariable=strip
    //% weight=100
    export function create(port: nezhaV2.Port, count: number, order: ColorOrder = ColorOrder.GRB): Strip {
        count = Math.max(1, Math.floor(count))
        const strip = new Strip()
        strip.pin = nezhaV2.adapterPin(port)
        strip.order = order
        strip.brightness = 128
        strip.pixels = []
        for (let i = 0; i < count; i++) {
            strip.pixels.push(0)
        }
        strip.buf = pins.createBuffer(count * 3)
        pins.digitalWritePin(strip.pin, 0)
        return strip
    }

    /**
     * One of the basic colours.
     */
    //% blockId=nezhaled_colors block="%color"
    //% weight=60
    export function colors(color: LedColor): number {
        return color
    }

    /**
     * Mix a colour from red, green and blue.
     * @param red amount of red from 0 to 255, eg: 255
     * @param green amount of green from 0 to 255, eg: 255
     * @param blue amount of blue from 0 to 255, eg: 255
     */
    //% blockId=nezhaled_rgb block="red %red|green %green|blue %blue"
    //% red.min=0 red.max=255 green.min=0 green.max=255 blue.min=0 blue.max=255
    //% weight=55
    export function rgb(red: number, green: number, blue: number): number {
        return ((Math.clamp(0, 255, red) & 0xFF) << 16)
            | ((Math.clamp(0, 255, green) & 0xFF) << 8)
            | (Math.clamp(0, 255, blue) & 0xFF)
    }

    /**
     * Colour of the rainbow given by its hue (0 = red, 120 = green, 240 = blue).
     * @param h hue from 0 to 360, eg: 120
     */
    //% blockId=nezhaled_hue block="rainbow color %h"
    //% h.min=0 h.max=360
    //% weight=50
    export function hue(h: number): number {
        h = ((Math.round(h) % 360) + 360) % 360
        const sector = Math.idiv(h, 60)
        const rising = Math.idiv((h - sector * 60) * 255, 60)
        const falling = 255 - rising
        switch (sector) {
            case 0: return rgb(255, rising, 0)
            case 1: return rgb(falling, 255, 0)
            case 2: return rgb(0, 255, rising)
            case 3: return rgb(0, falling, 255)
            case 4: return rgb(rising, 0, 255)
            default: return rgb(255, 0, falling)
        }
    }
}
