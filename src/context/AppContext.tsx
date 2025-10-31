
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppContextType, Member, MealEntry, Expense } from "@/types";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

const AppContext = createContext<AppContextType | undefined>(undefined);

// Generate a unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Load data from localStorage
const loadData = <T,>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (error) {
    console.error(`Error loading data for key "${key}":`, error);
    return defaultValue;
  }
};

// Save data to localStorage
const saveData = <T,>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving data for key "${key}":`, error);
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [members, setMembers] = useState<Member[]>([]);
  const [mealEntries, setMealEntries] = useState<MealEntry[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const currencySymbol = "৳"; // Bangladeshi Taka symbol

  // Fetch data from Supabase when user logs in
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setMembers([]);
        setMealEntries([]);
        setExpenses([]);
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
        
        setMembers(membersData || []);
        setMealEntries(mealEntriesData || []);
        setExpenses(expensesData || []);
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

  const updateMemberBalance = async (id: string, amount: number) => {
    const member = members.find(m => m.id === id);
    if (!member) return;
    
    const newBalance = member.balance + amount;
    
    const { error } = await supabase
      .from('members')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating balance:', error);
      toast.error('Failed to update balance');
      return;
    }
    
    setMembers(
      members.map((m) =>
        m.id === id ? { ...m, balance: newBalance, updated_at: new Date().toISOString() } : m
      )
    );
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

  // Helper functions for calculations
  const isCurrentMonth = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.getMonth() === currentMonth.getMonth() &&
      date.getFullYear() === currentMonth.getFullYear()
    );
  };

  const getTotalExpenses = () => {
    return expenses
      .filter((expense) => isCurrentMonth(expense.date))
      .reduce((total, expense) => total + expense.amount, 0);
  };

  const getTotalDeposits = () => {
    return members.reduce((total, member) => total + member.balance, 0);
  };

  const getTotalMeals = () => {
    return mealEntries
      .filter((entry) => isCurrentMonth(entry.date))
      .reduce((total, entry) => total + entry.count, 0);
  };

  const getRemainingBalance = () => {
    return getTotalDeposits() - getTotalExpenses();
  };

  // Fixed meal rate calculation - ensure we're only calculating for current month
  // and handling division by zero properly
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
      const month = currentMonth.getMonth() + 1; // JavaScript months are 0-11
      const year = currentMonth.getFullYear();
      
      const { error } = await supabase.rpc('clear_current_month_data', { month, year });
      
      if (error) throw error;
      
      // Clear local data as well
      const filteredMealEntries = mealEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return !(entryDate.getMonth() === currentMonth.getMonth() && 
                entryDate.getFullYear() === currentMonth.getFullYear());
      });
      
      const filteredExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return !(expenseDate.getMonth() === currentMonth.getMonth() && 
                expenseDate.getFullYear() === currentMonth.getFullYear());
      });
      
      // Reset member balances
      const updatedMembers = members.map(member => ({
        ...member,
        balance: 0,
        updated_at: new Date().toISOString()
      }));
      
      setMealEntries(filteredMealEntries);
      setExpenses(filteredExpenses);
      setMembers(updatedMembers);
      
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
    updateMemberBalance,
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
