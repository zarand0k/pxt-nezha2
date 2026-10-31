# NeZha V2 Expansion Pack

![NeZha V2 Expansion Board](nezha_v2.png)

The NeZha V2 Expansion Pack is tailored for the micro:bit, aimed at stimulating students' innovative thinking and practical skills. This guide facilitates programming and control of the NeZha V2 Expansion Board, enabling functions such as motor control and sensor integration. To purchase the NeZha V2, visit the [Elecfreaks Official Store](https://shop.elecfreaks.com/products/nezha-breakout-board-v2).

## Key Features

- **Independent Motor Control:** Directly manipulate motor direction using onboard buttons, even without connecting to the micro:bit.
- **LEGO & Fischertechnik Compatibility:** Interfaces on the casing align with LEGO and Fischertechnik bricks, fostering personalized electronic project constructions.
- **Color Recognition System:** An intuitive labelling system using colors simplifies sensor and port connections.

## Getting Started

### Installing the Extension

1. Launch MakeCode editor and click the "Extensions" icon.
2. Search for "NeZha V2" or paste the link "https://github.com/elecfreaks/pxt-nezha2" to download and install the extension.

### Basic Examples

#### Motor Rotation Control

**Block Editor Example**

1. Drag the "on button A pressed" block into the script area.
2. Below it, insert the "NeZha V2 - Start Motor" block, set to Motor M1 rotating clockwise.
3. Repeat for Button B, controlling other motors as desired.

**JavaScript Example**

```javascript
input.onButtonPressed(Button.A, function () {
    NEZHA_V2.nezha2MotorStart(MotorPosition.M1, MovementDirection.CW);
});
// Example code omitted; add logic here for Button B controlling different motors
```

#### Moving Motor to a Specified Position

**Block Editor Example**

1. Utilize the "on button B pressed" block.
2. Append the "NeZha V2 - Go To Absolute Position" block, specifying Motor M1 to rotate clockwise to position 0.

**JavaScript Example**

```javascript
input.onButtonPressed(Button.B, function () {
    NEZHA_V2.goToAbsolutePosition(MotorPosition.M1, ServoMotionMode.CW, 0);
});
```

## Advanced Applications

Delve into advanced functionalities like motor speed regulation and sensor data retrieval. For detailed examples and instructions, visit our [online tutorials](https://wiki.elecfreaks.com/en/microbit/expansion-board/nezha-v2/).

## Additional modules used at school

Besides the motors, this fork contains blocks for the modules we use with the Nezha board.
They are listed in their own toolbox categories and translated to Czech.

| Category | Module | Connection |
|---|---|---|
| RGB LED | WS2812 RGB LED module (e.g. Makeblock Me RGB LED) | port J1–J4 through the adapter cable |
| Sensors | PlanetX colour sensor | any I2C port |
| Sensors | Octopus line-tracking sensor | each side to its own port J1–J4 |
| Sensors | Sonar:bit ultrasonic sensor | port J1–J4 |
| PS2 controller | PlanetX wireless PS2 controller | any I2C port |

The RGB LED uses the first signal wire of the port (the green wire of the Makeblock adapter):
J1 = P1, J2 = P2, J3 = P13, J4 = P15. The line sensor and Sonar:bit use the second signal wire,
like PlanetX modules: J1 = P8, J2 = P12, J3 = P14, J4 = P16.

```javascript
let strip = nezhaLed.create(nezhaV2.Port.J4, 4)
strip.showColor(nezhaLed.colors(nezhaLed.LedColor.Red))
basic.forever(function () {
    if (nezhaSensors.distance(nezhaV2.Port.J2, nezhaSensors.DistanceUnit.Cm) < 10) {
        strip.showColor(nezhaLed.colors(nezhaLed.LedColor.Blue))
    }
    nezhaV2.comboStart(nezhaPS2.stick(nezhaPS2.PS2Axis.LeftY), nezhaPS2.stick(nezhaPS2.PS2Axis.RightY))
})
```

The drivers are based on [pxt-PlanetX](https://github.com/elecfreaks/pxt-PlanetX)
and [pxt-sonarbit](https://github.com/elecfreaks/pxt-sonarbit) by ELECFREAKS (MIT license).

## Supported Targets

- PXT/micro:bit

## License

This extension is licensed under the MIT License.