// When the logo button is pressed, perform the following actions
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    // Stop NezhaV2 motor M1
    nezhaV2.stop(nezhaV2.MotorPosition.M1)
    // Reset the position of NezhaV2 motor M1
    nezhaV2.reset(nezhaV2.MotorPosition.M1)
})

// When button A is pressed, perform the following actions
input.onButtonPressed(Button.A, function () {
    // Set the speed of NezhaV2 motor M1 to 0 degrees/second, in clockwise direction, using degrees as the unit
    nezhaV2.move(nezhaV2.MotorPosition.M1, 60, nezhaV2.MovementDirection.CW, 0, nezhaV2.SportsMode.Degree)
    // Move NezhaV2 motor M1 to the absolute position 0, in clockwise direction
    nezhaV2.moveToAbsAngle(nezhaV2.MotorPosition.M1, nezhaV2.ServoMotionMode.CW, 0)
    // Set the speed control output of NezhaV2 motor M1 to 66 (assuming this is a valid value for speed control)
    nezhaV2.start(nezhaV2.MotorPosition.M1, 66)
    // Display the current absolute position of NezhaV2 motor M1
    basic.showNumber(nezhaV2.readAbsAngle(nezhaV2.MotorPosition.M1))
    // Display the current absolute speed of NezhaV2 motor M1
    // Note: The closing parenthesis for the previous line was missing, added it here
    basic.showNumber(nezhaV2.readSpeed(nezhaV2.MotorPosition.M1))
})

// ---- Combo (two-wheel robot) tests ----

// Default directions: left motor forward = CCW, right motor forward = CW; wheel diameter 5.6 cm, axle track 11 cm
input.onButtonPressed(Button.B, function () {
    nezhaV2.setComboMotor(nezhaV2.MotorPosition.M1, nezhaV2.MotorPosition.M2, nezhaV2.MovementDirection.CCW, nezhaV2.MovementDirection.CW, 5.6, 11)
    nezhaV2.comboRun(50, nezhaV2.VerticalDirection.Up)
    basic.pause(500)
    nezhaV2.comboStop()
})

// Both motors mounted the same way (PyBricks: Motor(Port.A), Motor(Port.B, Direction.COUNTERCLOCKWISE) style),
// wheel diameter 5.6 cm and axle track 11.2 cm given directly in setComboMotor
input.onButtonPressed(Button.AB, function () {
    nezhaV2.setComboMotor(
        nezhaV2.MotorPosition.M1, nezhaV2.MotorPosition.M2,
        nezhaV2.MovementDirection.CW, nezhaV2.MovementDirection.CW,
        5.6, 11.2)
    // Drive forward 20 cm: both wheels turn CW
    nezhaV2.comboMove(50, nezhaV2.VerticalDirection.Up, 20, nezhaV2.DistanceAndAngleUnit.cm)
    // Turn clockwise by 90 degrees on the spot: left forward (CW), right backward (CCW)
    nezhaV2.comboTurn(nezhaV2.MovementDirection.CW, 90, nezhaV2.DistanceAndAngleUnit.Degree, 50)
    // Left wheel forward, right wheel backward (signed speeds respect the configured directions)
    nezhaV2.comboStart(30, -30)
    basic.pause(500)
    nezhaV2.comboStop()
})
