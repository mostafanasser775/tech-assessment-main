import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { EmployeesTableClient } from "@/components/dashboard/employees/employees-table-client";

export default async function EmployeesPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }
  
  const employees = await prisma.employee.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="p-6 container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-bold text-3xl">Employees</h1>
        <Link href="/dashboard/employees/new">
          <Button>
            <Plus className="mr-2 w-4 h-4" />
            Add Employee
          </Button>
        </Link>
      </div>
      
      <EmployeesTableClient employees={employees} />
      
      <div className="mt-6">
        <Link href="/dashboard/employees/salary">
          <Button variant="outline">
            Salary Table
          </Button>
        </Link>
      </div>
    </div>
  );
}