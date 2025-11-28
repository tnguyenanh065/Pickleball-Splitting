import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSession, fetchMembers } from "@/lib/api";
import type { InsertSession } from "@shared/schema";

export function AddSessionDialog() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  
  const [location, setLocation] = useState("");
  const [cost, setCost] = useState("");
  const [payer, setPayer] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);

  const { data: members } = useQuery({
    queryKey: ["members"],
    queryFn: fetchMembers,
  });

  const createSessionMutation = useMutation({
    mutationFn: createSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ queryKey: ["financial-summary"] });
      
      toast({
        title: "Session Created",
        description: `Logged ${location} session for ${cost} VND.`,
      });
      
      setOpen(false);
      setLocation("");
      setCost("");
      setPayer("");
      setParticipants([]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create session",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const sessionData: InsertSession = {
      date: new Date(),
      location,
      totalCost: cost,
      payerId: payer,
      participantIds: participants,
    };
    
    createSessionMutation.mutate(sessionData);
  };

  const toggleParticipant = (userId: string) => {
    if (participants.includes(userId)) {
      setParticipants(participants.filter(id => id !== userId));
    } else {
      setParticipants([...participants, userId]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-new-session" className="bg-primary text-primary-foreground shadow-none hover:bg-primary/90 h-9 px-4 font-medium">
          <Plus className="mr-2 h-4 w-4" /> New Session
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-display">Log Session</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="location">Location</Label>
            <Input 
              id="location"
              data-testid="input-location"
              placeholder="e.g. Riverside Courts" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>
          
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="cost">Total Cost (VND)</Label>
            <Input 
              id="cost"
              data-testid="input-cost"
              type="number" 
              placeholder="0" 
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              required
            />
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="payer">Paid By</Label>
            <Select value={payer} onValueChange={setPayer} required>
              <SelectTrigger data-testid="select-payer">
                <SelectValue placeholder="Select payer" />
              </SelectTrigger>
              <SelectContent>
                {members?.map(member => (
                  <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Participants (Split equally)</Label>
            <div className="grid grid-cols-2 gap-2">
              {members?.map(member => (
                <div key={member.id} className="flex items-center space-x-2 border border-border/50 rounded-md p-2">
                  <Checkbox 
                    id={`p-${member.id}`}
                    data-testid={`checkbox-participant-${member.id}`}
                    checked={participants.includes(member.id)}
                    onCheckedChange={() => toggleParticipant(member.id)}
                  />
                  <Label 
                    htmlFor={`p-${member.id}`} 
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    {member.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button 
              type="submit" 
              data-testid="button-create-session"
              disabled={createSessionMutation.isPending}
            >
              {createSessionMutation.isPending ? "Creating..." : "Create Session"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
