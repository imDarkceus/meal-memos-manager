
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subMonths, addMonths } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const {
    currentMonth,
    setCurrentMonth,
    members,
    mealEntries,
    getTotalExpenses,
    getTotalDeposits,
    getTotalMeals,
    getRemainingBalance,
    getMealRate,
    getMemberMeals
  } = useAppContext();

  // Generate last 12 months for the month selector
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      value: format(date, "yyyy-MM"),
      label: format(date, "MMMM yyyy")
    };
  });

  const handleMonthChange = (value: string) => {
    const [year, month] = value.split("-").map(Number);
    const newDate = new Date(year, month - 1);
    setCurrentMonth(newDate);
  };

  // Prepare data for the chart
  const chartData = members.map(member => ({
    name: member.name,
    meals: getMemberMeals(member.id),
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Select
          value={format(currentMonth, "yyyy-MM")}
          onValueChange={handleMonthChange}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{getTotalExpenses().toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              For {format(currentMonth, "MMMM yyyy")}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Deposits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{getTotalDeposits().toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From all members
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Remaining Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getRemainingBalance() < 0 ? 'text-destructive' : 'text-green-600'}`}>
              ₹{getRemainingBalance().toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              After calculating expenses
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Meal Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{getMealRate().toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Per meal cost
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Meal Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="meals" fill="#3498DB" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No meal data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Member Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {members.length > 0 ? (
              <div className="space-y-4">
                {members.map((member) => {
                  const memberMeals = getMemberMeals(member.id);
                  const mealCost = memberMeals * getMealRate();
                  const balance = member.balance - mealCost;
                  
                  return (
                    <div key={member.id} className="flex justify-between items-center p-3 bg-app-gray rounded-md">
                      <div>
                        <h3 className="font-medium">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {memberMeals} meals × ₹{getMealRate().toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className={`font-semibold ${balance < 0 ? 'text-destructive' : 'text-green-600'}`}>
                          Balance: ₹{balance.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No members added yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
