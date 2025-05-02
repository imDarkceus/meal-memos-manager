
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppContextType, Member, MealEntry, Expense } from "@/types";
import { toast } from "sonner";

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
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [members, setMembers] = useState<Member[]>(() => loadData("members", []));
  const [mealEntries, setMealEntries] = useState<MealEntry[]>(() => loadData("mealEntries", []));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadData("expenses", []));
  const currencySymbol = "৳"; // Bangladeshi Taka symbol

  // Save data whenever it changes
  useEffect(() => {
    saveData("members", members);
  }, [members]);

  useEffect(() => {
    saveData("mealEntries", mealEntries);
  }, [mealEntries]);

  useEffect(() => {
    saveData("expenses", expenses);
  }, [expenses]);

  // Member functions
  const addMember = (name: string) => {
    setMembers([...members, { id: generateId(), name, balance: 0 }]);
  };

  const updateMemberBalance = (id: string, amount: number) => {
    setMembers(
      members.map((member) =>
        member.id === id
          ? { ...member, balance: member.balance + amount }
          : member
      )
    );
  };

  // Meal entry functions
  const addMealEntry = (memberId: string, date: string, count: number) => {
    // Check if entry already exists for that member and date
    const existingEntry = mealEntries.find(
      (entry) => entry.memberId === memberId && entry.date === date
    );

    if (existingEntry) {
      updateMealEntry(existingEntry.id, count);
    } else {
      setMealEntries([
        ...mealEntries,
        { id: generateId(), memberId, date, count }
      ]);
    }
  };

  const updateMealEntry = (id: string, count: number) => {
    setMealEntries(
      mealEntries.map((entry) =>
        entry.id === id ? { ...entry, count } : entry
      )
    );
  };

  // Expense functions
  const addExpense = (date: string, amount: number, description: string) => {
    setExpenses([
      ...expenses,
      { id: generateId(), date, amount, description }
    ]);
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
      .filter((entry) => entry.memberId === memberId && isCurrentMonth(entry.date))
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
        balance: 0
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
