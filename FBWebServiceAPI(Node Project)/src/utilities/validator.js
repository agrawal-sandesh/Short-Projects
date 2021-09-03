let Validator = {};

Validator.validateFlightId = function(flightId) {
    let pattern = /^IND-[1-9][0-9]{2}$/
    if (!pattern.test(flightId)) {
        let err = new Error("Error in flightId")
        err.status = 406
        throw err
    }
}

Validator.validateBookingId = function(bookingId) {
    let pattern = /^[0-9]{4}$/
    if (!pattern.test(bookingId)) {
        let err = new Error("Error in bookingId")
        err.status = 406
        throw err
    }
}

module.exports = Validator;