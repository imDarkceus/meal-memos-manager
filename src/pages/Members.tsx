
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, User } from "lucide-react";

const Members = () => {
  const { members, addMember, updateMemberBalance, currencySymbol } = useAppContext();
  const { toast } = useToast();
  const [newMemberName, setNewMemberName] = useState("");
  const [depositAmounts, setDepositAmounts] = useState<{ [key: string]: string }>({});

  const handleAddMember = () => {
    if (newMemberName.trim()) {
      addMember(newMemberName.trim());
      setNewMemberName("");
      toast({
        title: "Member Added",
        description: `${newMemberName.trim()} has been added to the mess`,
      });
    }
  };

  const handleDepositChange = (memberId: string, value: string) => {
    setDepositAmounts({
      ...depositAmounts,
      [memberId]: value.replace(/[^\d.-]/g, ""), // Only allow numbers, dots, and negative sign
    });
  };

  const handleDeposit = (memberId: string) => {
    const amount = parseFloat(depositAmounts[memberId] || "0");
    if (!isNaN(amount) && amount !== 0) {
      updateMemberBalance(memberId, amount);
      setDepositAmounts({
        ...depositAmounts,
        [memberId]: "",
      });
      
      const member = members.find(m => m.id === memberId);
      toast({
        title: amount > 0 ? "Deposit Added" : "Balance Adjusted",
        description: `${member?.name}'s balance has been updated by ${currencySymbol}${amount.toFixed(2)}`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Members</h1>

      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader>
          <CardTitle>Add New Member</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Member Name"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              className="max-w-md"
            />
            <Button onClick={handleAddMember}>
              <Plus className="h-4 w-4 mr-2" /> Add Member
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader>
          <CardTitle>Member List & Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          {members.length > 0 ? (
            <div className="space-y-4">
              {members.map((member) => (
                <div 
                  key={member.id} 
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-app-gray rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center mb-2 sm:mb-0">
                    <User className="h-5 w-5 mr-2 text-app-blue" />
                    <div>
                      <h3 className="font-medium">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Current Balance: {currencySymbol}{member.balance.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Input
                      placeholder="Amount"
                      value={depositAmounts[member.id] || ""}
                      onChange={(e) => handleDepositChange(member.id, e.target.value)}
                      className="w-full sm:w-32"
                    />
                    <Button 
                      onClick={() => handleDeposit(member.id)}
                      variant="outline"
                    >
                      Update Balance
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No members added yet. Add your first member above.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Members;
