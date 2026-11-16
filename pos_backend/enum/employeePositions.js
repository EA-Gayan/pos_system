// employeePositions.js — keep in sync with pos_frontend/src/enum/employeePositions.js
const EmployeePositions = Object.freeze({
  MANAGER: 1,
  CASHIER: 2,
  HEAD_CHEF: 3,
  COOK: 4,
  KITCHEN_HELPER: 5,
  WAITER: 6,
  STEWARD: 7,
  CLEANER: 8,
  DELIVERY_RIDER: 9,
  OTHER: 99, // role name is stored in employee.customPosition
});

module.exports = EmployeePositions;
