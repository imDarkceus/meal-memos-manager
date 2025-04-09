
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
    // Create new jsPDF instance with better orientation for table data
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    // Add title with better formatting
    const title = "AREA 51 - MEMBERS REPORT";
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(title, doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
    
    // Add date with better positioning
    const date = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${date}`, doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });
    
    // Add summary info
    const mealRate = getMealRate();
    doc.setFontSize(10);
    doc.text(`Meal Rate: ${currencySymbol}${mealRate.toFixed(2)}`, 14, 30);
    doc.text(`Total Members: ${members.length}`, 14, 35);
    
    const tableColumn = ["Member Name", "Total Meals", "Deposit Amount", "Meal Cost", "Balance", "Remarks"];
    const tableRows = reports.map(report => [
      report.name,
      report.totalMeals.toString(),
      `${currencySymbol}${report.totalDeposit.toFixed(2)}`,
      `${currencySymbol}${report.mealCost.toFixed(2)}`,
      `${currencySymbol}${report.balance.toFixed(2)}`,
      report.remarks
    ]);
    
    // Use autoTable with improved formatting
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { 
        fontSize: 9,
        cellPadding: 3,
        lineColor: [75, 75, 75],
        lineWidth: 0.1,
      },
      headStyles: { 
        fillColor: [41, 128, 185], 
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        halign: 'left'
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 30, halign: 'right' },
        5: { cellWidth: 'auto' }
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      }
    });
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text('Area 51 Meal Management System', 14, doc.internal.pageSize.getHeight() - 10);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - 30, doc.internal.pageSize.getHeight() - 10);
    }
    
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
