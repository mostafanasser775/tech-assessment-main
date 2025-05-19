export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  joiningDate: Date;
  basicSalary: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEmployeeInput {
  employeeId: string;
  name: string;
  joiningDate: Date;
  basicSalary: number;
}

export interface UpdateEmployeeInput extends Partial<CreateEmployeeInput> {
  id: string;
}

export interface EmployeeWithSalary extends Employee {
  currentSalary?: {
    basicSalary: number;
    bonus: number;
    deduction: number;
    netSalary: number;
  };
} 