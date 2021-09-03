class Employee {
    constructor(obj) {
        this.empName = obj.empName;
        this.empNo = obj.empNo;
        this.location = obj.location;
        this.joinedDate = obj.joinedDate;
        this.stream = obj.stream;
        this.technology = obj.technology;
    }
}

module.exports = Employee;