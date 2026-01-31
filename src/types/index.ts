
import { Tables } from "@/integrations/supabase/types";

// Re-export the types from Supabase
export type Member = Tables<"members">;
export type MealEntry = Tables<"meal_entries">;
export type Expense = Tables<"expenses">;
export type Profile = Tables<"profiles">;
export type Deposit = Tables<"deposits">;

// Custom types for our application context
export interface AppContextType {
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  members: Member[];
  addMember: (name: string) => void;
  deleteMember: (id: string) => void;
  deposits: Deposit[];
  addDeposit: (memberId: string, amount: number) => void;
  getMemberDeposits: (memberId: string) => number;
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
  clearCurrentMonth: () => Promise<void>;
}

export interface MemberReport {
  id: string;
  name: string;
  totalMeals: number;
  totalDeposit: number;
  mealCost: number;
  balance: number;
  remarks: string;
}
