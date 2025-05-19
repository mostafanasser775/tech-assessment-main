import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { formatCurrency } from "@/lib/utils";



export default async function EmployeeDetailPage({ params }:
  { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const employee = await prisma.employee.findUnique({
    where: {
      id: id,
      userId: session.user.id,
    },
  });

  if (!employee) {
    notFound();
  }

  return (
    <div className="mx-auto p-6 max-w-2xl container">
      <div className="flex items-center mb-6">
        <Link href="/dashboard/employees">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="w-4 h-4" />
            Back to Employees
          </Button>
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="font-bold text-3xl">Employee Details</h1>
        <Link href={`/dashboard/employees/${employee.id}/edit`}>
          <Button>
            <Pencil className="mr-2 w-4 h-4" />
            Edit Employee
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{employee.name}</CardTitle>
          <CardDescription>Employee ID: {employee.employeeId}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
            <div>
              <h3 className="font-medium text-muted-foreground text-sm">Joining Date</h3>
              <p>{format(employee.joiningDate, "PPP")}</p>
            </div>
            <div>
              <h3 className="font-medium text-muted-foreground text-sm">Basic Salary</h3>
              <p>{formatCurrency(employee.basicSalary)}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href={`/dashboard/employees/${employee.id}/salary`}>
            <Button variant="outline">View Salary History</Button>
          </Link>
          <Link href={`/dashboard/employees/${employee.id}/edit`}>
            <Button>Edit Details</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}