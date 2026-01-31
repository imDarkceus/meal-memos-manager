
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppContextType, Member, MealEntry, Expense, Deposit } from "@/types";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [members, setMembers] = useState<Member[]>([]);
  const [mealEntries, setMealEntries] = useState<MealEntry[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const currencySymbol = "৳"; // Bangladeshi Taka symbol

  // Helper function to check if a date is in the current month
  const isCurrentMonth = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.getMonth() === currentMonth.getMonth() &&
      date.getFullYear() === currentMonth.getFullYear()
    );
  };

  // Fetch data from Supabase when user logs in
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setMembers([]);
        setMealEntries([]);
        setExpenses([]);
        setDeposits([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch members
        const { data: membersData, error: membersError } = await supabase
          .from('members')
          .select('*')
          .order('created_at', { ascending: true });
        
        if (membersError) throw membersError;
        
        // Fetch meal entries
        const { data: mealEntriesData, error: mealEntriesError } = await supabase
          .from('meal_entries')
          .select('*')
          .order('date', { ascending: true });
        
        if (mealEntriesError) throw mealEntriesError;
        
        // Fetch expenses
        const { data: expensesData, error: expensesError } = await supabase
          .from('expenses')
          .select('*')
          .order('date', { ascending: true });
        
        if (expensesError) throw expensesError;

        // Fetch deposits
        const { data: depositsData, error: depositsError } = await supabase
          .from('deposits')
          .select('*')
          .order('date', { ascending: true });
        
        if (depositsError) throw depositsError;
        
        setMembers(membersData || []);
        setMealEntries(mealEntriesData || []);
        setExpenses(expensesData || []);
        setDeposits(depositsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Member functions
  const addMember = async (name: string) => {
    if (!user) return;
    
    const newMember = {
      name,
      balance: 0,
      user_id: user.id
    };
    
    const { data, error } = await supabase
      .from('members')
      .insert([newMember])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding member:', error);
      toast.error('Failed to add member');
      return;
    }
    
    setMembers([...members, data]);
  };

  const deleteMember = async (id: string) => {
    // First delete related meal entries
    const { error: mealError } = await supabase
      .from('meal_entries')
      .delete()
      .eq('member_id', id);
    
    if (mealError) {
      console.error('Error deleting meal entries:', mealError);
      toast.error('Failed to delete member meal entries');
      return;
    }

    // Delete related deposits (cascade should handle this, but let's be explicit)
    const { error: depositError } = await supabase
      .from('deposits')
      .delete()
      .eq('member_id', id);
    
    if (depositError) {
      console.error('Error deleting deposits:', depositError);
      toast.error('Failed to delete member deposits');
      return;
    }
    
    // Then delete the member
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting member:', error);
      toast.error('Failed to delete member');
      return;
    }
    
    setMembers(members.filter(m => m.id !== id));
    setMealEntries(mealEntries.filter(e => e.member_id !== id));
    setDeposits(deposits.filter(d => d.member_id !== id));
  };

  // Deposit functions - deposits are tracked per month
  const addDeposit = async (memberId: string, amount: number) => {
    if (!user) return;
    
    const today = new Date();
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const newDeposit = {
      member_id: memberId,
      amount,
      date: dateStr,
      user_id: user.id
    };
    
    const { data, error } = await supabase
      .from('deposits')
      .insert([newDeposit])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding deposit:', error);
      toast.error('Failed to add deposit');
      return;
    }
    
    setDeposits([...deposits, data]);
  };

  // Get total deposits for a member in current month
  const getMemberDeposits = (memberId: string) => {
    return deposits
      .filter((d) => d.member_id === memberId && isCurrentMonth(d.date))
      .reduce((total, d) => total + Number(d.amount), 0);
  };

  // Meal entry functions
  const addMealEntry = async (memberId: string, date: string, count: number) => {
    if (!user) return;
    
    // Check if entry already exists for that member and date
    const existingEntry = mealEntries.find(
      (entry) => entry.member_id === memberId && entry.date === date
    );

    if (existingEntry) {
      await updateMealEntry(existingEntry.id, count);
    } else {
      const newEntry = {
        member_id: memberId,
        date,
        count,
        user_id: user.id
      };
      
      const { data, error } = await supabase
        .from('meal_entries')
        .insert([newEntry])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding meal entry:', error);
        toast.error('Failed to add meal entry');
        return;
      }
      
      setMealEntries([...mealEntries, data]);
    }
  };

  const updateMealEntry = async (id: string, count: number) => {
    const { error } = await supabase
      .from('meal_entries')
      .update({ count })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating meal entry:', error);
      toast.error('Failed to update meal entry');
      return;
    }
    
    setMealEntries(
      mealEntries.map((entry) =>
        entry.id === id ? { ...entry, count } : entry
      )
    );
  };

  // Expense functions
  const addExpense = async (date: string, amount: number, description: string) => {
    if (!user) return;
    
    const newExpense = {
      date,
      amount,
      description,
      user_id: user.id
    };
    
    const { data, error } = await supabase
      .from('expenses')
      .insert([newExpense])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense');
      return;
    }
    
    setExpenses([...expenses, data]);
  };

  // Calculation functions - all filtered by current month
  const getTotalExpenses = () => {
    return expenses
      .filter((expense) => isCurrentMonth(expense.date))
      .reduce((total, expense) => total + Number(expense.amount), 0);
  };

  const getTotalDeposits = () => {
    return deposits
      .filter((deposit) => isCurrentMonth(deposit.date))
      .reduce((total, deposit) => total + Number(deposit.amount), 0);
  };

  const getTotalMeals = () => {
    return mealEntries
      .filter((entry) => isCurrentMonth(entry.date))
      .reduce((total, entry) => total + entry.count, 0);
  };

  const getRemainingBalance = () => {
    return getTotalDeposits() - getTotalExpenses();
  };

  const getMealRate = () => {
    const totalMeals = getTotalMeals();
    const totalExpenses = getTotalExpenses();
    
    if (totalMeals <= 0) return 0;
    return totalExpenses / totalMeals;
  };

  const getMemberMeals = (memberId: string) => {
    return mealEntries
      .filter((entry) => entry.member_id === memberId && isCurrentMonth(entry.date))
      .reduce((total, entry) => total + entry.count, 0);
  };

  // Function to clear data for the current month
  const clearCurrentMonth = async () => {
    try {
      const month = currentMonth.getMonth() + 1;
      const year = currentMonth.getFullYear();
      
      // Delete meal entries for current month
      const { error: mealError } = await supabase
        .from('meal_entries')
        .delete()
        .gte('date', `${year}-${String(month).padStart(2, '0')}-01`)
        .lt('date', month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, '0')}-01`);
      
      if (mealError) throw mealError;

      // Delete expenses for current month
      const { error: expenseError } = await supabase
        .from('expenses')
        .delete()
        .gte('date', `${year}-${String(month).padStart(2, '0')}-01`)
        .lt('date', month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, '0')}-01`);
      
      if (expenseError) throw expenseError;

      // Delete deposits for current month
      const { error: depositError } = await supabase
        .from('deposits')
        .delete()
        .gte('date', `${year}-${String(month).padStart(2, '0')}-01`)
        .lt('date', month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, '0')}-01`);
      
      if (depositError) throw depositError;
      
      // Update local state
      setMealEntries(mealEntries.filter(entry => !isCurrentMonth(entry.date)));
      setExpenses(expenses.filter(expense => !isCurrentMonth(expense.date)));
      setDeposits(deposits.filter(deposit => !isCurrentMonth(deposit.date)));
      
      toast.success(`Data for ${currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })} has been cleared`);
      return Promise.resolve();
    } catch (error) {
      console.error('Error clearing month data:', error);
      toast.error('Failed to clear data for the current month');
      return Promise.reject(error);
    }
  };

  const contextValue: AppContextType = {
    currentMonth,
    setCurrentMonth,
    members,
    addMember,
    deleteMember,
    deposits,
    addDeposit,
    getMemberDeposits,
    mealEntries,
    addMealEntry,
    updateMealEntry,
    expenses,
    addExpense,
    getTotalExpenses,
    getTotalDeposits,
    getTotalMeals,
    getRemainingBalance,
    getMealRate,
    getMemberMeals,
    currencySymbol,
    clearCurrentMonth
  };

  if (loading) {
    return (
      <AppContext.Provider value={contextValue}>
        <div className="flex items-center justify-center min-h-screen">Loading...</div>
      </AppContext.Provider>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
