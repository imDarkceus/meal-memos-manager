
import React, { useState, useMemo } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const MealTracking = () => {
  const { members, mealEntries, addMealEntry, currentMonth, setCurrentMonth } = useAppContext();
  const [selectedMember, setSelectedMember] = useState<string | null>(
    members.length > 0 ? members[0].id : null
  );

  // Generate days for the current month
  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Previous and next month handlers
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Get meal count for a specific day and member
  const getMealCount = (date: Date, memberId: string) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    const entry = mealEntries.find(
      (e) => e.member_id === memberId && e.date === formattedDate
    );
    return entry ? entry.count : 0;
  };

  // Handle meal count update
  const handleMealCountUpdate = (date: Date, count: number) => {
    if (!selectedMember) return;
    
    const formattedDate = format(date, "yyyy-MM-dd");
    addMealEntry(selectedMember, formattedDate, count);
    
    toast.success("Meal count updated");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Meal Tracking</h1>

      <div className="sticky top-0 z-50 bg-background pb-4 pt-2 border-b shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            disabled={members.length === 0}
            onClick={() => {
              const currentIndex = members.findIndex(m => m.id === selectedMember);
              const prevIndex = currentIndex > 0 ? currentIndex - 1 : members.length - 1;
              setSelectedMember(members[prevIndex]?.id || null);
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Select
            value={selectedMember || ""}
            onValueChange={setSelectedMember}
            disabled={members.length === 0}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select member" />
            </SelectTrigger>
            <SelectContent>
              {members.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="icon"
            disabled={members.length === 0}
            onClick={() => {
              const currentIndex = members.findIndex(m => m.id === selectedMember);
              const nextIndex = currentIndex < members.length - 1 ? currentIndex + 1 : 0;
              setSelectedMember(members[nextIndex]?.id || null);
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium w-40 text-center">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!selectedMember && members.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              No members found. Please add members before tracking meals.
            </div>
          </CardContent>
        </Card>
      ) : !selectedMember ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Please select a member to track meals.
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {daysInMonth.map((day) => {
            const currentCount = getMealCount(day, selectedMember);
            const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
            
            return (
              <Card key={day.toISOString()} className={isToday ? "border-app-blue border-2" : ""}>
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="text-base">
                    {format(day, "EEE, MMM d")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2">{currentCount}</div>
                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMealCountUpdate(day, Math.max(0, currentCount - 1))}
                      >
                        -
                      </Button>
                      <div className="flex justify-center space-x-1">
                        {[0, 1, 2, 3].map((count) => (
                          <Button
                            key={count}
                            variant={currentCount === count ? "default" : "outline"}
                            size="sm"
                            className="px-3"
                            onClick={() => handleMealCountUpdate(day, count)}
                          >
                            {count}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMealCountUpdate(day, Math.min(10, currentCount + 1))}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MealTracking;
