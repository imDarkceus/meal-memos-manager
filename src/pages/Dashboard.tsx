import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subMonths, addMonths } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from "lucide-react";

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
    getMemberMeals,
    currencySymbol
  } = useAppContext();

  const [animatedStats, setAnimatedStats] = useState({
    expenses: 0,
    deposits: 0,
    balance: 0,
    mealRate: 0
  });

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

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentMonth(subMonths(currentMonth, 1));
    } else {
      setCurrentMonth(addMonths(currentMonth, 1));
    }
  };

  useEffect(() => {
    const targetStats = {
      expenses: getTotalExpenses(),
      deposits: getTotalDeposits(),
      balance: getRemainingBalance(),
      mealRate: getMealRate()
    };

    console.log("Total Expenses:", getTotalExpenses());
    console.log("Total Meals:", getTotalMeals());
    console.log("Calculated Meal Rate:", getMealRate());

    const animationDuration = 800; // in ms
    const steps = 20;
    const interval = animationDuration / steps;
    
    let currentStep = 0;
    
    const animation = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setAnimatedStats({
        expenses: targetStats.expenses * progress,
        deposits: targetStats.deposits * progress,
        balance: targetStats.balance * progress,
        mealRate: targetStats.mealRate * progress
      });
      
      if (currentStep >= steps) {
        clearInterval(animation);
        setAnimatedStats(targetStats);
      }
    }, interval);
    
    return () => clearInterval(animation);
  }, [currentMonth, getTotalExpenses, getTotalDeposits, getRemainingBalance, getMealRate, getTotalMeals]);

  const mealChartData = members.map(member => ({
    name: member.name,
    meals: getMemberMeals(member.id),
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#9B87F5', '#D6BCFA'];
  
  const pieChartData = members.map(member => ({
    name: member.name,
    value: getMemberMeals(member.id)
  })).filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <span className="text-muted-foreground">
            ({format(currentMonth, "MMMM yyyy")})
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigateMonth('prev')}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Select
            value={format(currentMonth, "yyyy-MM")}
            onValueChange={handleMonthChange}
          >
            <SelectTrigger className="w-[180px]">
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
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigateMonth('next')}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currencySymbol}{animatedStats.expenses.toFixed(2)}</div>
            <div className="flex items-center mt-1 text-xs">
              <p className="text-muted-foreground mr-1">
                For {format(currentMonth, "MMMM yyyy")}
              </p>
              <ArrowUp className="h-3 w-3 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Deposits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currencySymbol}{animatedStats.deposits.toFixed(2)}</div>
            <div className="flex items-center mt-1 text-xs">
              <p className="text-muted-foreground mr-1">
                From all members
              </p>
              <ArrowUp className="h-3 w-3 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Remaining Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${animatedStats.balance < 0 ? 'text-destructive' : 'text-green-600'}`}>
              {currencySymbol}{animatedStats.balance.toFixed(2)}
            </div>
            <div className="flex items-center mt-1 text-xs">
              <p className="text-muted-foreground mr-1">
                After calculating expenses
              </p>
              {animatedStats.balance >= 0 ? 
                <ArrowUp className="h-3 w-3 text-green-500" /> : 
                <ArrowDown className="h-3 w-3 text-red-500" />}
            </div>
          </CardContent>
        </Card>
        
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Meal Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currencySymbol}{animatedStats.mealRate.toFixed(2)}</div>
            <div className="flex items-center mt-1 text-xs">
              <p className="text-muted-foreground">
                Per meal cost
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1 transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle>Meal Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {mealChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mealChartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value} meals`, 'Meal Count']}
                      contentStyle={{ 
                        borderRadius: '8px', 
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)'
                      }} 
                    />
                    <Bar 
                      dataKey="meals" 
                      fill="#9b87f5" 
                      radius={[4, 4, 0, 0]}
                      className="hover:opacity-80 transition-opacity"
                    />
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

        <Card className="col-span-1 transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle>Meal Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {pieChartData.length > 0 ? (
              <div className="h-[300px] flex justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      paddingAngle={5}
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value} meals`, 'Meal Count']}
                      contentStyle={{ 
                        borderRadius: '8px', 
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No meal data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-2 transition-all duration-200 hover:shadow-md">
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
                    <div 
                      key={member.id} 
                      className="flex justify-between items-center p-3 bg-app-gray rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <h3 className="font-medium">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {memberMeals} meals × {currencySymbol}{getMealRate().toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className={`font-semibold ${balance < 0 ? 'text-destructive' : 'text-green-600'}`}>
                          Balance: {currencySymbol}{balance.toFixed(2)}
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
