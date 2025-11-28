import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMember } from "@/lib/api";

export function AddMemberDialog() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  
  const [name, setName] = useState("");

  const createMemberMutation = useMutation({
    mutationFn: createMember,
    onSuccess: (member) => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      
      toast({
        title: "Member Added",
        description: `${member.name} has been added to the group.`,
      });
      
      setOpen(false);
      setName("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add member",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const initials = name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    
    createMemberMutation.mutate({ name, initials });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          data-testid="button-add-member"
          className="h-9 px-4 font-medium"
        >
          <UserPlus className="mr-2 h-4 w-4" /> Add Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle className="font-display">Add New Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name"
              data-testid="input-member-name"
              placeholder="e.g. John Smith" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Initials will be generated automatically.
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              data-testid="button-create-member"
              disabled={createMemberMutation.isPending || !name.trim()}
            >
              {createMemberMutation.isPending ? "Adding..." : "Add Member"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
