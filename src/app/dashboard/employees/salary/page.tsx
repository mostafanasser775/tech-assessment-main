"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";

import { formatCurrency } from "@/lib/utils";

interface Employee {
  id: string;
  employeeId: string;
  name: string;
  joiningDate: string;
  basicSalary: number;
}

interface SalaryRecord {
  id?: string;
  employeeId: string;
  month: number;
  year: number;
  basicSalary: number;
  bonus: number;
  deduction: number;
  netSalary: number;
}

const months = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

export default function SalaryTablePage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  
  // Generate years (current year and 2 years back)
  const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("/api/employees");
        
        if (!response.ok) {
          throw new Error("Failed to fetch employees");
        }
        
        const data = await response.json();
        setEmployees(data.employees);
        
        // Initialize salary records for all employees
        initializeSalaryRecords(data.employees);
      } catch (err) {
        console.error("Error fetching employees:", err);
        toast.error("Failed to load employees");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEmployees();
  }, []);

  // Fetch salary records when month/year changes
  useEffect(() => {
    if (employees.length > 0) {
      fetchSalaryRecords();
    }
  }, [selectedMonth, selectedYear, employees]);

  const fetchSalaryRecords = async () => {
    try {
      const response = await fetch(`/api/salary?month=${selectedMonth}&year=${selectedYear}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch salary records");
      }
      
      const data = await response.json();
      
      // Merge existing records with employee data
      initializeSalaryRecords(employees, data.salaries);
    } catch (err) {
      console.error("Error fetching salary records:", err);
      toast.error("Failed to load salary data");
    }
  };

  const initializeSalaryRecords = (employees: Employee[], existingRecords: SalaryRecord[] = []) => {
    const records = employees.map(employee => {
      // Find existing record for this employee
      const existingRecord = existingRecords.find(
        record => record.employeeId === employee.id
      );
      
      if (existingRecord) {
        return {
          ...existingRecord,
          employeeId: employee.id,
        };
      }
      
      // Create new record
      return {
        employeeId: employee.id,
        month: selectedMonth,
        year: selectedYear,
        basicSalary: employee.basicSalary,
        bonus: 0,
        deduction: 0,
        netSalary: employee.basicSalary,
      };
    });
    
    setSalaryRecords(records);
  };

  const handleBonusChange = (employeeId: string, value: string) => {
    const bonus = parseFloat(value) || 0;
    
    setSalaryRecords(prevRecords => 
      prevRecords.map(record => {
        if (record.employeeId === employeeId) {
          const netSalary = record.basicSalary + bonus - record.deduction;
          return { ...record, bonus, netSalary };
        }
        return record;
      })
    );
  };

  const handleDeductionChange = (employeeId: string, value: string) => {
    const deduction = parseFloat(value) || 0;
    
    setSalaryRecords(prevRecords => 
      prevRecords.map(record => {
        if (record.employeeId === employeeId) {
          const netSalary = record.basicSalary + record.bonus - deduction;
          return { ...record, deduction, netSalary };
        }
        return record;
      })
    );
  };

  const saveSalaryRecords = async () => {
    setIsSaving(true);
    
    try {
      const response = await fetch("/api/salary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          month: selectedMonth,
          year: selectedYear,
          salaries: salaryRecords,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to save salary records");
      }
      
      toast.success("Salary records saved successfully");
      fetchSalaryRecords(); // Refresh data
    } catch (err) {
      console.error("Error saving salary records:", err);
      toast.error("Failed to save salary records");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container p-6 flex justify-center items-center">
        <p>Loading salary data...</p>
      </div>
    );
  }

  return (
    <div className="container p-6">
      <div className="flex items-center mb-6">
        <Link href="/dashboard/employees">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Employees
          </Button>
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Salary Table</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Month:</span>
            <Select
              value={selectedMonth.toString()}
              onValueChange={(value) => setSelectedMonth(parseInt(value))}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Year:</span>
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={saveSalaryRecords} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>
            Salary Table - {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
          </CardTitle>
          <CardDescription>
            Manage employee salaries, bonuses, and deductions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="mb-4 text-muted-foreground">No employees found</p>
              <Link href="/dashboard/employees/new">
                <Button>Add your first employee</Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Basic Salary</TableHead>
                    <TableHead>Bonus</TableHead>
                    <TableHead>Deduction</TableHead>
                    <TableHead>Net Salary</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salaryRecords.map((record, index) => {
                    const employee = employees.find(e => e.id === record.employeeId);
                    if (!employee) return null;
                    
                    return (
                      <TableRow key={employee.id}>
                        <TableCell>{employee.employeeId}</TableCell>
                        <TableCell>{employee.name}</TableCell>
                        <TableCell>{formatCurrency(record.basicSalary)}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={record.bonus}
                            onChange={(e) => handleBonusChange(employee.id, e.target.value)}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={record.deduction}
                            onChange={(e) => handleDeductionChange(employee.id, e.target.value)}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(record.netSalary)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}