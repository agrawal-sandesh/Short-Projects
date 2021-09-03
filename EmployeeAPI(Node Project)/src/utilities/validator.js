let validator = {}

validator.validateEmpId = (empId) => {
    /*This method should validate employee Id 
        Employee Id should start with 123 and it should be of min length 6
        If the validation fails, throw an error with message 
        "Invalid Employee Id" with status 406
    */
    let pattern = /^[1-3]{3}[0-9]{3}$/
    if (!pattern.test(empId)) {
        let err = new Error("Invalid Employee Id")
        err.status = 406
        throw err
    }
}

module.exports = validator;