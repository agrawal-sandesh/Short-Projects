const dbModel = require('../utilities/connection');
const Validator = require('../utilities/validator');


const flightBookingDb = {}
    //Do not modify or remove this method
flightBookingDb.generateId = async() => {
    let model = await dbModel.getFlightCollection();
    let ids = await model.distinct("bookings.bookingId");
    let bId = Math.max(...ids);
    return bId + 1;
}

flightBookingDb.checkCustomer = async(customerId) => {
    //fetch the customer object for the given customer Id
    let customer = await dbModel.getCustomerCollection();
    let response = await customer.findOne({ customerId: customerId });
    if (response) {
        return response;
    } else {
        return null;
    }
}

flightBookingDb.checkBooking = async(bookingId) => {
    // fetch flight object which has the booking with the given bookingId
    Validator.validateBookingId(bookingId);
    let flightBooking = await dbModel.getFlightCollection();
    let response = await flightBooking.findOne({ "bookings.bookingId": bookingId });
    if (response) {
        return response;
    } else {
        return null;
    }
}

flightBookingDb.checkAvailability = async(flightId) => {
    // fetch the flight object for the given flight Id
    Validator.validateFlightId(flightId);
    let flightBooking = await dbModel.getFlightCollection();
    let response = await flightBooking.findOne({ flightId: flightId });
    if (response) {
        return response;
    } else {
        return null;
    }
}

flightBookingDb.updateCustomerWallet = async(customerId, bookingCost) => {
    // update customer wallet by reducing the bookingCost with the wallet amount for the given customerId
    let customer = await dbModel.getCustomerCollection();
    let response = await customer.updateOne({ customerId: customerId }, { "$inc": { walletAmount: -bookingCost } });
    if (response) {
        return response;
    } else {
        return null;
    }
}

flightBookingDb.bookFlight = async(flightBookingObj) => {
    //book a flight ticket
    let flightBooking = await dbModel.getFlightCollection();
    let bookingIds = await flightBookingDb.generateId();
    let newDocument = await flightBooking.updateOne({ flightId: flightBookingObj.flightId }, { $push: { bookings: { customerId: flightBookingObj.customerId, bookingId: bookingIds, noOfTickets: flightBookingObj.noOfTickets, bookingCost: flightBookingObj.bookingCost } } });
    if (newDocument && newDocument.nModified > 0) {
        let seatsLeft = await flightBooking.updateOne({ flightId: flightBookingObj.flightId }, { $inc: { availableSeats: -flightBookingObj.noOfTickets } })
        if (seatsLeft && seatsLeft.nModified > 0) {
            let updateWallet = await flightBookingDb.updateCustomerWallet(flightBookingObj.customerId, flightBookingObj.bookingCost);
            if (updateWallet && updateWallet.nModified > 0) {
                return bookingIds
            } else {
                let err = new Error("Wallet not updated");
                err.status = 502
                throw err;
            }
        } else {
            let err = new Error("Seats not updated");
            err.status = 502
            throw err;
        }
    } else {
        let err = new Error("Booking Failed");
        err.status = 500
        throw err;
    }
}


flightBookingDb.getAllBookings = async() => {
    //get all the bookings done in all flights
    let flightBooking = await dbModel.getFlightCollection();
    let response = await flightBooking.find({}, { _id: 0, bookings: 1 });
    if (response && response.length > 0) {
        return (response);
    } else {
        return null;
    }
}

flightBookingDb.customerBookingsByFlight = async(customerId, flightId) => {
    // get all customer bookings done for a flight
    let flightBooking = await dbModel.getFlightCollection();
    let bookingDetails = await flightBooking.find({ flightId: flightId }, { _id: 0, bookings: 1 });
    let bookingsArray = bookingDetails[0].bookings;
    let temp = [];
    for (let i in bookingsArray) {
        if (bookingsArray[i].customerId == customerId) {
            temp.push(bookingsArray[i]);
        }
    }
    if (temp && temp.length > 0) {
        return temp;
    } else {
        return null;
    }
}

flightBookingDb.getbookingsByFlightId = async(flightId) => {
    // get all the bookings done for the given flightId
    let flightBooking = await dbModel.getFlightCollection();
    let response = await flightBooking.find({ flightId: flightId }, { _id: 0, bookings: 1 });
    if (response && response.length > 0) {
        return response;
    } else {
        return null;
    }
}

flightBookingDb.updateBooking = async(bookingId, noOfTickets) => {
    // update no of tickets for the given bookingId
    let flightBooking = await dbModel.getFlightCollection();
    let flightDetails = await flightBooking.findOne({ "bookings.bookingId": bookingId });
    let bookingCost = flightDetails.fare * noOfTickets;
    let updatenoOfTicket = await flightBooking.updateOne({ "bookings.bookingId": bookingId }, { $inc: { "bookings.$.noOfTickets": +noOfTickets } });
    if (updatenoOfTicket && updatenoOfTicket.nModified > 0) {
        let updateavailableSeats = await flightBooking.updateOne({ "bookings.bookingId": bookingId }, { $inc: { availableSeats: -noOfTickets } });
        if (updateavailableSeats && updateavailableSeats.nModified > 0); {
            let updateBookingCost = await flightBooking.updateOne({ "bookings.bookingId": bookingId }, { $inc: { "bookings.$.bookingCost": +bookingCost } });
            if (updateBookingCost && updateBookingCost.nModified > 0) {
                let customerId;
                for (let i in flightDetails.bookings) {
                    if (flightDetails.bookings[i].bookingId == bookingId) {
                        customerId = flightDetails.bookings[i].customerId;
                    }
                }
                console.log(customerId, bookingCost)
                let updateCustomerWallet = await flightBookingDb.updateCustomerWallet(customerId, bookingCost)
                if (updateCustomerWallet && updateCustomerWallet.nModified > 0) {
                    let response = await flightBookingDb.checkAvailability(flightDetails.flightId);
                    return (response);
                } else {
                    return null;
                }
            }
        }
    }

}

module.exports = flightBookingDb;