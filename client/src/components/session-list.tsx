import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { fetchSessions } from "@/lib/api";

export function SessionList() {
  const { data: sessions, isLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: fetchSessions,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="border-border/50 shadow-sm animate-pulse">
            <CardContent className="p-4">
              <div className="h-12 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sessions?.map((session) => {
        return (
          <Card key={session.id} className="border-border/50 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex gap-4 items-center">
                <div className="flex flex-col items-center justify-center w-12 h-12 bg-secondary rounded-md border border-border/50">
                  <span className="text-xs font-bold uppercase text-muted-foreground">
                    {format(new Date(session.date), "MMM")}
                  </span>
                  <span className="text-lg font-bold font-mono text-foreground">
                    {format(new Date(session.date), "dd")}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-sm">{session.location}</h4>
                  <p className="text-xs text-muted-foreground">
                    Paid by {session.payer.name}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                 <div className="flex -space-x-2">
                   {session.participants.map(participant => (
                       <Avatar key={participant.id} className="h-6 w-6 border-2 border-background">
                         <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                           {participant.initials}
                         </AvatarFallback>
                       </Avatar>
                   ))}
                 </div>
                 <div className="text-right min-w-[80px]">
                    <div className="font-mono text-sm font-medium">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(session.totalCost))}
                    </div>
                    <Badge variant={session.status === 'settled' ? 'secondary' : 'outline'} className="text-[10px] h-5 px-1.5 font-normal">
                      {session.status}
                    </Badge>
                 </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  );
}
