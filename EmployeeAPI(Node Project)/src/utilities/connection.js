const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
mongoose.set('useCreateIndex', true);
const url = "mongodb://localhost:27017/EmployeeDB"


let schema = {
    empName: { type: String, required: [true, 'Employee name is required'] },
    empNo: { type: Number, required: [true, 'Employee number is required'], unique: [true, "Id should be unique"] },
    location: { type: String, required: [true, 'Location is required'] },
    joinedDate: { type: Date, required: [true, 'Joining Date is required'], default: new Date() },
    stream: { type: String, required: [true, 'Stream field is required'] },
    technology: { type: Array, required: [true, 'Technology field is required'], default: [] }
}


let employeeSchema = new Schema(schema, { collection: "Employee", timestamps: true });


let connection = {}

connection.getCollection = async() => {
    try {
        return (await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })).model("Employee", employeeSchema)
    } catch (err) {
        let error = new Error("Could not connect to database")
        error.status = 500
        throw error
    }
}

module.exports = connection