
import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, User, Calendar, CircleDollarSign } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

interface MemberReport {
  id: string;
  name: string;
  totalMeals: number;
  totalDeposit: number;
  mealCost: number;
  balance: number;
  remarks: string;
}

const Report = () => {
  const { 
    members, 
    getMemberMeals, 
    getMealRate, 
    currencySymbol 
  } = useAppContext();

  const [reports, setReports] = useState<MemberReport[]>([]);

  useEffect(() => {
    const mealRate = getMealRate();
    
    const memberReports = members.map(member => {
      const totalMeals = getMemberMeals(member.id);
      const mealCost = totalMeals * mealRate;
      const balance = member.balance - mealCost;
      let remarks = "";
      
      if (balance > 0) {
        remarks = `Will get back ${currencySymbol}${balance.toFixed(2)}`;
      } else if (balance < 0) {
        remarks = `Needs to pay ${currencySymbol}${Math.abs(balance).toFixed(2)}`;
      } else {
        remarks = "Balanced";
      }
      
      return {
        id: member.id,
        name: member.name,
        totalMeals,
        totalDeposit: member.balance,
        mealCost,
        balance,
        remarks
      };
    });
    
    setReports(memberReports);
  }, [members, getMemberMeals, getMealRate, currencySymbol]);

  const exportToPDF = () => {
    const doc = new jsPDF();
    const title = "Area 51 - Members Report";
    
    // Add title
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    
    // Add date
    const date = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.text(`Generated on: ${date}`, 14, 30);
    
    const tableColumn = ["Member Name", "Total Meals", "Deposit Amount", "Meal Cost", "Remarks"];
    const tableRows = reports.map(report => [
      report.name,
      report.totalMeals.toString(),
      `${currencySymbol}${report.totalDeposit.toFixed(2)}`,
      `${currencySymbol}${report.mealCost.toFixed(2)}`,
      report.remarks
    ]);
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [75, 75, 75] }
    });
    
    doc.save("area51-member-report.pdf");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Members Report</h1>
        <Button 
          onClick={exportToPDF}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export as PDF
        </Button>
      </div>

      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Member Reports & Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Member
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Total Meals
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <CircleDollarSign className="h-4 w-4" />
                        Deposit Amount
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <CircleDollarSign className="h-4 w-4" />
                        Meal Cost
                      </div>
                    </TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.name}</TableCell>
                      <TableCell>{report.totalMeals}</TableCell>
                      <TableCell>{currencySymbol}{report.totalDeposit.toFixed(2)}</TableCell>
                      <TableCell>{currencySymbol}{report.mealCost.toFixed(2)}</TableCell>
                      <TableCell className={
                        report.balance > 0 
                          ? "text-green-500 dark:text-green-400" 
                          : report.balance < 0 
                            ? "text-red-500 dark:text-red-400" 
                            : "text-muted-foreground"
                      }>
                        {report.remarks}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No members available to generate report.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Report;
