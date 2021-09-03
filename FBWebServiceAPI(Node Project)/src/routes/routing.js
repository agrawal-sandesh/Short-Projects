const express = require('express');
const routing = express.Router();
const service = require('../service/users');

routing.post('/bookFlight', async(req, res, next) => {
    try {
        let flightBookingObj = req.body;
        let data = await service.bookFlight(flightBookingObj);
        if (data) {
            res.status(201)
            res.json({ message: "Flight booking is successful with booking Id: " + data })
        }
    } catch (err) {
        next(err)
    }
})


routing.get('/getAllBookings', async(req, res, next) => {
    try {
        let data = await service.getAllBookings();
        if (data) {
            res.status(200)
            res.json(data);
        }
    } catch (err) {
        next(err)
    }
})

routing.get('/customerBookings/:customerId/:flightId', async(req, res, next) => {
    try {
        let customerId = req.params.customerId;
        let flightId = req.params.flightId;
        let data = await service.customerBookingsByFlight(customerId, flightId);
        if (data) {
            res.status(200)
            res.json(data);
        }
    } catch (err) {
        next(err)
    }
})

routing.get('/bookingsByFlight/:flightId', async(req, res, next) => {
    try {
        let flightId = req.params.flightId;
        let data = await service.getbookingsByFlightId(flightId);
        if (data) {
            res.status(200)
            res.json(data);
        }
    } catch (err) {
        next(err)
    }
})

routing.put('/updateBooking/:bookingId', async(req, res, next) => {
    try {
        let bookingId = req.params.bookingId;
        let noOfTickets = req.body.noOfTickets;
        let data = await service.updateBooking(bookingId, noOfTickets);
        if (data) {
            res.status(201)
            res.json({ message: "Booking Successfully Updated!! updated flight details: " + data });
        }
    } catch (err) {
        next(err)
    }
})

module.exports = routing;