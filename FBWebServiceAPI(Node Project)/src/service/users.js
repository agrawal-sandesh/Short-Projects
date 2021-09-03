//import required modules
const flightBookingDb = require('../model/users');
const Validator = require('../utilities/validator')

let fBookingService = {}


fBookingService.bookFlight = async(flightBookingObj) => {
    Validator.validateFlightId(flightBookingObj.flightId);
    const customerDetail = await flightBookingDb.checkCustomer(flightBookingObj.customerId);
    if (customerDetail == null) {
        let err = new Error("Customer not registered. Register To proceed");
        err.status = 404;
        throw err;
    }
    const flightDetails = await flightBookingDb.checkAvailability(flightBookingObj.flightId);
    if (flightDetails == null) {
        let err = new Error("Flight Unavailable");
        err.status = 404;
        throw err;
    }
    if (flightDetails.status == "Cancelled") {
        let err = new Error("Sorry for the inconvinience " + flightBookingObj.flightId + " is cancelled");
        err.status = 400;
        throw err;
    }
    if (flightDetails.availableSeats == 0) {
        let err = new Error("Flight " + flightBookingObj.flightId + " is already full!!");
        err.status = 400;
        throw err;
    }
    if (flightDetails.availableSeats < flightBookingObj.noOfTickets) {
        let err = new Error("Flight almost full Only " + flightDetails.availableSeats + " seat left!!");
        err.status = 406;
        throw err;
    }
    let bookingCost = flightBookingObj.noOfTickets * flightDetails.fare;
    if (customerDetail.walletAmount < bookingCost) {
        let amountNeeded = bookingCost - customerDetail.walletAmount;
        let err = new Error("Insufficient Wallet Amount Add more Rs. " + amountNeeded + " to continue the booking");
        err.status = 406;
        throw err;
    } else {
        flightBookingObj.bookingCost = bookingCost
        data = await flightBookingDb.bookFlight(flightBookingObj);
        return data;
    }
}


fBookingService.getAllBookings = async() => {
    let data = await flightBookingDb.getAllBookings();
    if (data) {
        return data;
    } else {
        let err = new Error("No Booking is found in any flight");
        err.status = 404;
        throw err;
    }
}


fBookingService.customerBookingsByFlight = async(customerId, flightId) => {
    let customerDetail = await flightBookingDb.checkCustomer(customerId);
    if (customerDetail == null) {
        let err = new Error("Customer not found");
        err.status = 404;
        throw err;
    } else {
        let flightDetails = await flightBookingDb.checkAvailability(flightId);
        if (flightDetails == null) {
            let err = new Error("Flight Details not found");
            err.status = 404;
            throw err;
        } else {
            let bookingDetails = await flightBookingDb.customerBookingsByFlight(customerId, flightId);
            if (bookingDetails) {
                return bookingDetails;
            } else {
                let err = new Error("No Booking found for customerId " + customerId + " In flight " + flightId);
                err.status = 404;
                throw err;
            }
        }
    }

}


fBookingService.getbookingsByFlightId = async(flightId) => {
    Validator.validateFlightId(flightId);
    let data = await flightBookingDb.getbookingsByFlightId(flightId);
    if (data) {
        return data;
    } else {
        let err = new Error("No Booking found for flightId " + flightId);
        err.status = 404;
        throw err;
    }
}


fBookingService.updateBooking = async(bookingId, noOfTickets) => {
    let flightDetails = await flightBookingDb.checkBooking(bookingId);
    if (flightDetails == null) {
        let err = new Error("No Booking with booking Id" + bookingId);
        err.status = 404;
        throw err;
    }
    if (flightDetails.status == "Cancelled") {
        let err = new Error("Sorry for the Inconvinience.." + flightDetails.flightId + " has been cancelled!!");
        err.status = 406;
        throw err;
    }
    if (flightDetails.availableSeats == 0) {
        let err = new Error("Flight is already Full. Can't Book more tickets");
        err.status = 406;
        throw err;
    }
    if (flightDetails.availableSeats < noOfTickets) {
        let err = new Error("Flight almost Full Only " + flightDetails.availableSeats + " seat left");
        err.status = 406;
        throw err;
    } else {
        let customerId;
        for (let i in flightDetails.bookings) {
            if (flightDetails.bookings[i].bookingId == bookingId) {
                customerId = flightDetails.bookings[i].customerId;
            }
        }
        let customerDetail = await flightBookingDb.checkCustomer(customerId);
        if (customerDetail.walletAmount < flightDetails.fare * noOfTickets) {
            let amountNeeded = flightDetails.fare * noOfTickets - customerDetail.walletAmount;
            let err = new Error("Insufficient Wallet Amount. Add more " + amountNeeded + " Rs. to continue booking");
            err.status = 406;
            throw err;
        } else {
            let data = await flightBookingDb.updateBooking(bookingId, noOfTickets)
            if (data) {
                return data;
            } else {
                let err = new Error("update failed");
                err.status = 502;
                throw err;
            }
        }

    }
}

module.exports = fBookingService;