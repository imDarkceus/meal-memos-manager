
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { DollarSign, Calendar, Trash2 } from "lucide-react";

const Expenses = () => {
  const { expenses, addExpense, currentMonth } = useAppContext();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

  // Filter expenses for current month
  const currentMonthExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    return (
      expenseDate.getMonth() === currentMonth.getMonth() &&
      expenseDate.getFullYear() === currentMonth.getFullYear()
    );
  });

  const handleAddExpense = () => {
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive amount",
        variant: "destructive",
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: "Missing Description",
        description: "Please enter a description",
        variant: "destructive",
      });
      return;
    }

    addExpense(date, parsedAmount, description.trim());
    setAmount("");
    setDescription("");
    setDate(format(new Date(), "yyyy-MM-dd"));

    toast({
      title: "Expense Added",
      description: `Added ₹${parsedAmount.toFixed(2)} for ${description.trim()}`,
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Expenses</h1>

      <Card>
        <CardHeader>
          <CardTitle>Add New Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="max-w-[220px]"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (₹)</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="max-w-[220px]"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Rice, Vegetables, etc."
              />
            </div>
          </div>
          
          <Button className="mt-4" onClick={handleAddExpense}>
            <DollarSign className="h-4 w-4 mr-2" /> Add Expense
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Expense History</span>
            <span className="text-sm font-normal text-muted-foreground">
              {format(currentMonth, "MMMM yyyy")}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentMonthExpenses.length > 0 ? (
            <div className="space-y-4">
              {currentMonthExpenses.map((expense) => (
                <div key={expense.id} className="flex justify-between items-center p-3 bg-app-gray rounded-md">
                  <div className="flex gap-3 items-center">
                    <Calendar className="h-5 w-5 text-app-gray-dark" />
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(parseISO(expense.date), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="font-semibold">
                    ₹{expense.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No expenses recorded for this month
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Expenses;
