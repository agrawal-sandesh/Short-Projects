const initialData = require("./employee.json")
const connection = require("../utilities/connection")

let createConnection = async() => {
    collection = await connection.getCollection();
}

let model = {}

model.setupDB = async() => {
    await collection.deleteMany();
    let response = await collection.insertMany(initialData);
    if (response && response.length > 0) {
        return response.length
    } else {
        let err = new Error("Script insertion failed")
        err.status = 500
        throw err
    }
}

model.insertEmp = async(employeeObj) => {
    /*
        - Create model instance by invoking getCollection method of connection.js
        - Insert the employee object into the employee collection using model
        - On successfull insertion return true
        - Else return false
    */
    let response = await collection.insertMany(employeeObj);
    if (response && response.length > 0) {
        return response;
    } else {
        let err = new Error("Object insertion failed")
        err.status = 500
        throw err
    }
}


model.updateSkills = async(empId, skill) => {
    /*
        - Create model instance by invoking getCollection method method of connection.js
        - Add skills to the employee collection for given employee id using the model instance
        - On successfull update return the updated skill
        - Else return null
    */
    let response = await collection.updateOne({ empNo: empId }, { $push: { technology: { $each: [skill] } } });
    if (response) {
        return response;
    } else {
        let err = new Error("Object insertion failed")
        err.status = 500
        throw err
    }
}



model.removeEmp = async(empId) => {
    /*
        - Create model instance by invoking getCollection method of connection.js
        - Delete the employee details of the given employee Id from employee collection
        - On successfull deletion return empId
        - Else return false
    */
    let response = await collection.deleteMany({ empNo: empId });
    if (response) {
        return response;
    } else {
        let err = new Error("Object deletion failed")
        err.status = 500
        throw err
    }
}

createConnection();
module.exports = model;