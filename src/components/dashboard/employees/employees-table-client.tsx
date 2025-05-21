"use client";

import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, ListTodo } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface Employee {
  id: string;
  name: string;
  employeeId: string;
  joiningDate: Date;
  basicSalary: number;
}

interface EmployeesTableClientProps {
  employees: Employee[];
}

export function EmployeesTableClient({ employees }: EmployeesTableClientProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee List</CardTitle>
        <CardDescription>
          Manage your employees and their details
        </CardDescription>
      </CardHeader>
      <CardContent>
        {employees.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-8 text-center">
            <p className="mb-4 text-muted-foreground">No employees found</p>
            <Link href="/dashboard/employees/new">
              <Button>
                <Plus className="mr-2 w-4 h-4" />
                Add your first employee
              </Button>
            </Link>
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Joining Date</TableHead>
                  <TableHead>Basic Salary</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.employeeId}</TableCell>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{format(employee.joiningDate, "PPP")}</TableCell>
                    <TableCell>{formatCurrency(employee.basicSalary)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/employees/${employee.id}/tasks`}>
                          <Button variant="outline" size="sm">
                            <ListTodo className="mr-2 w-4 h-4" />
                            Tasks
                          </Button>
                        </Link>
                        <Link href={`/dashboard/employees/${employee.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                        <Link href={`/dashboard/employees/${employee.id}/edit`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                        <Link href={`/dashboard/employees/${employee.id}/salary`}>
                          <Button variant="outline" size="sm">
                            Salary
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 