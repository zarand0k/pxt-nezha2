
//% color=#ff0011  icon="\uf06d" block="nezhaV2" blockId="nezhaV2"
namespace nezhaV2 {

    export enum MovementDirection {
        //%block="clockwise"
        CW = 1,
        //%block="counterclockwise"
        CCW = 2
    }
    export enum ServoMotionMode {
        //%block="clockwise"
        CW = 2,
        //%block="counterclockwise"
        CCW = 3,
        //%block="shortest path"
        ShortPath = 1
    }

    export enum DelayMode {
        //%block="automatic delay"
        AutoDelayStatus = 1,
        //%block="no delay"
        NoDelay = 0
    }
    export enum SportsMode {
        //%block="degrees"
        Degree = 2,
        //%block="turns"
        Circle = 1,
        //%block="seconds"
        Second = 3
    }


    export enum VerticalDirection {
        //%block="forward"
        Up = 1,
        //%block="backward"
        Down = 2
    }

    export enum DistanceUnit {
        //%block="cm"
        cm = 1,
        //%block="inch"
        inch = 2
    }

    export enum DistanceAndAngleUnit {
        //%block="degrees"
        Degree = 2,
        //%block="turns"
        Circle = 1,
        //%block="seconds"
        Second = 3,
        //%block="cm"
        cm = 4,
        //%block="inch"
        inch = 5
    }

    export enum MotorPosition {
        //%block="M1"
        M1 = 1,
        //%block="M2"
        M2 = 2,
        //%block="M3"
        M3 = 3,
        //%block="M4"
        M4 = 4
    }

    let i2cAddr: number = 0x10;
    let servoSpeedGlobal = 900
    // Relative angle value (used for relative angle zeroing function)
    let relativeAngularArr = [0, 0, 0, 0];
    // Combo block variables
    let motorLeftGlobal = 0
    let motorRightGlobal = 0
    let degreeToDistance = 0
    let trackWidth = 0

    export function delayMs(ms: number): void {
        let time = input.runningTime() + ms
        while (time >= input.runningTime()) {

        }
    }

    export function motorDelay(value: number, motorFunction: SportsMode) {
        let delayTime = 0;
        if (value == 0 || servoSpeedGlobal == 0) {
            return;
        } else if (motorFunction == SportsMode.Circle) {
            delayTime = value * 360000.0 / servoSpeedGlobal + 500;
        } else if (motorFunction == SportsMode.Second) {
            delayTime = (value * 1000);
        } else if (motorFunction == SportsMode.Degree) {
            delayTime = value * 1000.0 / servoSpeedGlobal + 500;
        }
        basic.pause(delayTime);

    }

    //% group="Basic functions"
    //% block="set %motor at %speed\\%to run %direction %value %mode || %isDelay"
    //% inlineInputMode=inline
    //% speed.min=0  speed.max=100
    //% weight=407 
    export function move(motor: MotorPosition, speed: number, direction: MovementDirection, value: number, mode: SportsMode, isDelay: DelayMode = DelayMode.AutoDelayStatus): void {
        if (speed <= 0 || value <= 0) {
            // Speed and run value cannot be less than or equal to 0
            return;
        }
        setServoSpeed(speed);
        __move(motor, direction, value, mode);
        if (isDelay) {
            motorDelay(value, mode);
        }
    }

    export function __move(motor: MotorPosition, direction: MovementDirection, value: number, mode: SportsMode): void {

        let buf = pins.createBuffer(8);
        buf[0] = 0xFF;
        buf[1] = 0xF9;
        buf[2] = motor;
        buf[3] = direction;
        buf[4] = 0x70;
        buf[5] = (value >> 8) & 0XFF;
        buf[6] = mode;
        buf[7] = (value >> 0) & 0XFF;
        pins.i2cWriteBuffer(i2cAddr, buf);

    }

    //% group="Basic functions"
    //% weight=406
    //% block="set %motor to rotate %turnMode at angle %angle || %isDelay  "
    //% angle.min=0  angle.max=359
    //% inlineInputMode=inline
    export function moveToAbsAngle(motor: MotorPosition, turnMode: ServoMotionMode, angle: number, isDelay: DelayMode = DelayMode.AutoDelayStatus): void {
        while (angle < 0) {
            angle += 360
        }
        angle %= 360
        let buf = pins.createBuffer(8)
        buf[0] = 0xFF;
        buf[1] = 0xF9;
        buf[2] = motor;
        buf[3] = 0x00;
        buf[4] = 0x5D;
        buf[5] = (angle >> 8) & 0XFF;
        buf[6] = turnMode;
        buf[7] = (angle >> 0) & 0XFF;
        pins.i2cWriteBuffer(i2cAddr, buf);
        delayMs(4);// Wait cannot be deleted, and no other tasks can be inserted, otherwise there is a BUG
        if (isDelay) {
            motorDelay(0.5, SportsMode.Second)
        }
    }

    //% group="Basic functions"
    //% weight=404
    //% block="set %motor shutting down the motor"
    export function stop(motor: MotorPosition): void {
        let buf = pins.createBuffer(8)
        buf[0] = 0xFF;
        buf[1] = 0xF9;
        buf[2] = motor;
        buf[3] = 0x00;
        buf[4] = 0x5F;
        buf[5] = 0x00;
        buf[6] = 0xF5;
        buf[7] = 0x00;
        pins.i2cWriteBuffer(i2cAddr, buf);
    }

    export function __start(motor: MotorPosition, direction: MovementDirection, speed: number): void {
        let buf = pins.createBuffer(8)
        buf[0] = 0xFF;
        buf[1] = 0xF9;
        buf[2] = motor;
        buf[3] = direction;
        buf[4] = 0x60;
        buf[5] = Math.floor(speed);
        buf[6] = 0xF5;
        buf[7] = 0x00;
        pins.i2cWriteBuffer(i2cAddr, buf);
    }

    //% group="Basic functions"
    //% weight=403
    //% block="set the speed of %motor to %speed \\% and start the motor"
    //% speed.min=-100  speed.max=100
    export function start(motor: MotorPosition, speed: number): void {
        if (speed < -100) {
            speed = -100
        } else if (speed > 100) {
            speed = 100
        }
        let direction = speed > 0 ? MovementDirection.CW : MovementDirection.CCW
        __start(motor, direction, Math.abs(speed))
    }

    export function readAngle(motor: MotorPosition): number {
        delayMs(4)
        let buf = pins.createBuffer(8);
        buf[0] = 0xFF;
        buf[1] = 0xF9;
        buf[2] = motor;
        buf[3] = 0x00;
        buf[4] = 0x46;
        buf[5] = 0x00;
        buf[6] = 0xF5;
        buf[7] = 0x00;
        pins.i2cWriteBuffer(i2cAddr, buf);
        delayMs(4)
        let arr = pins.i2cReadBuffer(i2cAddr, 4);
        return (arr[3] << 24) | (arr[2] << 16) | (arr[1] << 8) | (arr[0]);
    }

    //% group="Basic functions"
    //% weight=402
    //%block="%motor absolute angular value"
    export function readAbsAngle(motor: MotorPosition): number {
        let position = readAngle(motor)
        while (position < 0) {
            position += 3600;
        }
        return (position % 3600) * 0.1;
    }

    //% group="Basic functions"
    //% weight=402
    //%block="%motor relative angular value"
    export function readRelAngle(motor: MotorPosition): number {
        return (readAngle(motor) - relativeAngularArr[motor - 1]) * 0.1;
    }

    //% group="Basic functions"
    //% weight=400
    //%block="%motor speed (laps/sec)"
    export function readSpeed(motor: MotorPosition): number {
        delayMs(4)
        let buf = pins.createBuffer(8)
        buf[0] = 0xFF;
        buf[1] = 0xF9;
        buf[2] = motor;
        buf[3] = 0x00;
        buf[4] = 0x47;
        buf[5] = 0x00;
        buf[6] = 0xF5;
        buf[7] = 0x00;
        pins.i2cWriteBuffer(i2cAddr, buf);
        delayMs(4)
        let arr = pins.i2cReadBuffer(i2cAddr, 2);
        let retData = (arr[1] << 8) | (arr[0]);
        return Math.floor(retData / 3.6) * 0.01;
    }

    //% group="Basic functions"
    //% weight=399
    //%block="set servo %motor to zero"
    export function reset(motor: MotorPosition): void {
        let buf = pins.createBuffer(8)
        buf[0] = 0xFF;
        buf[1] = 0xF9;
        buf[2] = motor;
        buf[3] = 0x00;
        buf[4] = 0x1D;
        buf[5] = 0x00;
        buf[6] = 0xF5;
        buf[7] = 0x00;
        pins.i2cWriteBuffer(i2cAddr, buf);
        relativeAngularArr[motor - 1] = 0;
        motorDelay(1, SportsMode.Second)
    }

    //% group="Basic functions"
    //% weight=399
    //%block="set servo %motor relative angular to zero"
    export function resetRelAngleValue(motor: MotorPosition) {
        relativeAngularArr[motor - 1] = readAngle(motor);
    }

    export function setServoSpeed(speed: number): void {
        if (speed < 0) speed = 0;
        speed *= 9;
        servoSpeedGlobal = speed;
        let buf = pins.createBuffer(8)
        buf[0] = 0xFF;
        buf[1] = 0xF9;
        buf[2] = 0x00;
        buf[3] = 0x00;
        buf[4] = 0x77;
        buf[5] = (speed >> 8) & 0XFF;
        buf[6] = 0x00;
        buf[7] = (speed >> 0) & 0XFF;
        pins.i2cWriteBuffer(i2cAddr, buf);

    }

    //% group="Application functions"
    //% weight=410
    //%block="set the running motor to left wheel %motor_l right wheel %motor_r"
    export function setComboMotor(motor_l: MotorPosition, motor_r: MotorPosition): void {
        motorLeftGlobal = motor_l;
        motorRightGlobal = motor_r;
    }

    //% group="Application functions"
    //% weight=409
    //%block="set %speed\\% speed and move %direction"
    //% speed.min=0  speed.max=100
    export function comboRun(speed: number, direction: VerticalDirection): void {
        if (speed < 0) {
            speed = 0;
        } else if (speed > 100) {
            speed = 100;
        }
        __start(motorLeftGlobal, direction % 2 + 1, speed);
        __start(motorRightGlobal, (direction + 1) % 2 + 1, speed);
    }


    //% group="Application functions"
    //% weight=406
    //%block="stop movement"
    export function comboStop(): void {
        stop(motorLeftGlobal)
        stop(motorRightGlobal)
    }

    /**
    * The distance length of the motor movement per circle
    */
    //% group="Application functions"
    //% weight=404
    //%block="set the wheel circumference to %value %unit"
    export function setWheelPerimeter(value: number, unit: DistanceUnit): void {
        if (value < 0) {
            value = 0;
        }
        if (unit == DistanceUnit.inch) {
            degreeToDistance = value * 2.54
        } else {
            degreeToDistance = value
        }
    }

    //% group="Application functions"
    //% weight=403
    //%block="combination Motor Move at %speed to %direction %value %unit "
    //% speed.min=0  speed.max=100
    //% inlineInputMode=inline
    export function comboMove(speed: number, direction: VerticalDirection, value: number, unit: DistanceAndAngleUnit): void {
        if (speed <= 0) {
            return;
        }
        setServoSpeed(speed)
        let mode;
        switch (unit) {
            case DistanceAndAngleUnit.Circle:
                mode = SportsMode.Circle;
                break;
            case DistanceAndAngleUnit.Degree:
                mode = SportsMode.Degree;
                break;
            case DistanceAndAngleUnit.Second:
                mode = SportsMode.Second;
                break;
            case DistanceAndAngleUnit.cm:
                value = 360 * value / degreeToDistance
                mode = SportsMode.Degree;
                break;
            case DistanceAndAngleUnit.inch:
                value = 360 * value * 2.54 / degreeToDistance
                mode = SportsMode.Degree;
                break;
        }
        if (direction == VerticalDirection.Up) {
            __move(motorLeftGlobal, MovementDirection.CCW, value, mode)
            __move(motorRightGlobal, MovementDirection.CW, value, mode)
        }
        else {
            __move(motorLeftGlobal, MovementDirection.CW, value, mode)
            __move(motorRightGlobal, MovementDirection.CCW, value, mode)
        }
        motorDelay(value, mode);
    }

    //% group="Application functions"
    //% weight=402
    //%block="set the left wheel speed at %speed_l \\%, right wheel speed at %speed_r \\% and start the motor"
    //% speed_l.min=-100  speed_l.max=100 speed_r.min=-100  speed_r.max=100
    export function comboStart(speed_l: number, speed_r: number): void {
        start(motorLeftGlobal, -speed_l);
        start(motorRightGlobal, speed_r);
    }

    //% group="Application functions"
    //% weight=401
    //% block="set track width to %width %unit"
    export function setTrackWidth(width: number, unit: DistanceUnit): void {
        if (width < 0) {
            width = 0;
        }
        if (unit == DistanceUnit.inch) {
            trackWidth = width * 2.54;
        } else {
            trackWidth = width;
        }
    }


    //% group="Application functions"
    //% weight=400
    //% block="turn %direction by %angle %unit at speed %speed\\%"
    //% speed.min=0 speed.max=100
    //% inlineInputMode=inline
    export function comboTurn(direction: MovementDirection, angle: number, unit: DistanceAndAngleUnit, speed: number): void {
        if (speed <= 0) {
            return;
        }
        setServoSpeed(speed);

        let value = 0;
        let mode = SportsMode.Degree;

        // Calculate the required wheel travel distance for the turn
        // Arc length = (Angle / 360) * (PI * TrackWidth)
        // We need to convert this distance to degrees of wheel rotation

        // First convert input angle to degrees if needed
        let angleInDegrees = 0;
        switch (unit) {
            case DistanceAndAngleUnit.Circle:
                angleInDegrees = angle * 360;
                break;
            case DistanceAndAngleUnit.Degree:
                angleInDegrees = angle;
                break;
            case DistanceAndAngleUnit.Second:
                // For seconds, we just run for that time
                mode = SportsMode.Second;
                value = angle;
                break;
            default:
                // For distance units (cm, inch), we treat it as an angle? 
                // The requirement says "turn on spot by a given angle". 
                // If the user passes cm/inch, it's ambiguous. 
                // Let's assume the user might pass arc length? 
                // Or maybe we should just restrict the unit to Angle units?
                // The enum DistanceAndAngleUnit includes cm/inch.
                // If cm/inch is passed, let's assume it's the arc length to turn.
                let arcLength = 0;
                if (unit == DistanceAndAngleUnit.cm) {
                    arcLength = angle;
                } else if (unit == DistanceAndAngleUnit.inch) {
                    arcLength = angle * 2.54;
                }

                if (arcLength > 0) {
                    // Convert arc length to wheel degrees
                    // Wheel circumference = degreeToDistance * 360 / value_set_in_setWheelPerimeter?
                    // Actually degreeToDistance is "distance per degree" if I understand correctly?
                    // Let's check setWheelPerimeter:
                    // degreeToDistance = value (if cm)
                    // Wait, setWheelPerimeter says "Set the wheel circumference".
                    // If degreeToDistance is circumference, then:
                    // Distance per degree = circumference / 360.
                    // But in comboMove: value = 360 * value / degreeToDistance
                    // If value is distance (cm), and we want degrees.
                    // degrees = distance / (circumference / 360) = distance * 360 / circumference.
                    // So degreeToDistance IS the circumference.

                    if (degreeToDistance > 0) {
                        value = 360 * arcLength / degreeToDistance;
                    } else {
                        value = 0;
                    }
                    mode = SportsMode.Degree;
                }
                break;
        }

        if (mode == SportsMode.Degree && angleInDegrees > 0) {
            // Calculate arc length for the turn
            let arcLength = (angleInDegrees / 360) * Math.PI * trackWidth;
            // Convert arc length to wheel degrees
            if (degreeToDistance > 0) {
                value = 360 * arcLength / degreeToDistance;
            } else {
                value = 0;
            }
        }

        if (mode == SportsMode.Second) {
            // Already set value and mode
        } else if (value <= 0) {
            return;
        }

        if (direction == MovementDirection.CW) {
            // Turn Clockwise: Left wheel forward (CCW), Right wheel backward (CCW)
            __move(motorLeftGlobal, MovementDirection.CCW, value, mode);
            __move(motorRightGlobal, MovementDirection.CCW, value, mode);
        } else {
            // Turn Counter-Clockwise: Left wheel backward (CW), Right wheel forward (CW)
            __move(motorLeftGlobal, MovementDirection.CW, value, mode);
            __move(motorRightGlobal, MovementDirection.CW, value, mode);
        }
        motorDelay(value, mode);
    }

    //% group="export functions"
    //% weight=320
    //%block="version number"
    export function readVersion(): string {
        let buf = pins.createBuffer(8);
        buf[0] = 0xFF;
        buf[1] = 0xF9;
        buf[2] = 0x00;
        buf[3] = 0x00;
        buf[4] = 0x88;
        buf[5] = 0x00;
        buf[6] = 0x00;
        buf[7] = 0x00;
        pins.i2cWriteBuffer(i2cAddr, buf);
        let version = pins.i2cReadBuffer(i2cAddr, 3);
        return `V ${version[0]}.${version[1]}.${version[2]}`;
    }
}
