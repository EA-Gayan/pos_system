// Keep in sync with pos_backend/enum/employeePositions.js
export const EmployeePositions = {
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
};

export const EmployeePositionLabels = {
  [EmployeePositions.MANAGER]: "Manager",
  [EmployeePositions.CASHIER]: "Cashier",
  [EmployeePositions.HEAD_CHEF]: "Head Chef",
  [EmployeePositions.COOK]: "Cook",
  [EmployeePositions.KITCHEN_HELPER]: "Kitchen Helper",
  [EmployeePositions.WAITER]: "Waiter",
  [EmployeePositions.STEWARD]: "Steward",
  [EmployeePositions.CLEANER]: "Cleaner",
  [EmployeePositions.DELIVERY_RIDER]: "Delivery Rider",
  [EmployeePositions.OTHER]: "Other",
};

// Display name for an employee's role, resolving "Other" to the custom text
export const getPositionLabel = (employee) => {
  if (!employee) return "";
  if (employee.position === EmployeePositions.OTHER) {
    return employee.customPosition || "Other";
  }
  return EmployeePositionLabels[employee.position] || "Staff";
};
