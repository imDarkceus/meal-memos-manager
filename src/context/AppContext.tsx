
import React, { createContext, useContext, useState, useEffect } from "react";

// Types
interface Member {
  id: string;
  name: string;
  balance: number;
}

interface MealEntry {
  id: string;
  memberId: string;
  date: string; // ISO string
  count: number;
}

interface Expense {
  id: string;
  date: string; // ISO string
  amount: number;
  description: string;
}

interface AppContextType {
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  members: Member[];
  addMember: (name: string) => void;
  updateMemberBalance: (id: string, amount: number) => void;
  mealEntries: MealEntry[];
  addMealEntry: (memberId: string, date: string, count: number) => void;
  updateMealEntry: (id: string, count: number) => void;
  expenses: Expense[];
  addExpense: (date: string, amount: number, description: string) => void;
  getTotalExpenses: () => number;
  getTotalDeposits: () => number;
  getTotalMeals: () => number;
  getRemainingBalance: () => number;
  getMealRate: () => number;
  getMemberMeals: (memberId: string) => number;
  currencySymbol: string;
}

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

  const getMealRate = () => {
    const totalMeals = getTotalMeals();
    return totalMeals > 0 ? getTotalExpenses() / totalMeals : 0;
  };

  const getMemberMeals = (memberId: string) => {
    return mealEntries
      .filter((entry) => entry.memberId === memberId && isCurrentMonth(entry.date))
      .reduce((total, entry) => total + entry.count, 0);
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
    currencySymbol
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
