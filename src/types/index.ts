
import { Tables } from "@/integrations/supabase/types";

// Re-export the types from Supabase
export type Member = Tables<"members">;
export type MealEntry = Tables<"meal_entries">;
export type Expense = Tables<"expenses">;
export type Profile = Tables<"profiles">;

// Custom types for our application context
export interface AppContextType {
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
