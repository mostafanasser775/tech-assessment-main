export interface Salary {
  id: string;
  month: number;
  year: number;
  employeeId: string;
  basicSalary: number;
  bonus: number;
  deduction: number;
  netSalary: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSalaryInput {
  month: number;
  year: number;
  employeeId: string;
  basicSalary: number;
  bonus?: number;
  deduction?: number;
}

export interface UpdateSalaryInput extends Partial<CreateSalaryInput> {
  id: string;
}

export interface SalaryWithEmployee extends Salary {
  employee: {
    id: string;
    name: string;
    employeeId: string;
  };
} 