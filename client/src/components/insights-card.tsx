import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Timer, Zap, Award } from "lucide-react";

export function InsightsCard() {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-display font-medium">Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className="mt-0.5 p-1.5 bg-secondary rounded-md">
            <Timer className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">Avg. Settlement Time</p>
            <p className="text-2xl font-mono font-bold mt-1">3.2 days</p>
            <p className="text-xs text-muted-foreground">Faster than last month</p>
          </div>
        </div>
        
        <div className="h-px bg-border/40" />

        <div className="flex items-start space-x-3">
           <div className="mt-0.5 p-1.5 bg-secondary rounded-md">
            <Award className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">Top Payer</p>
            <p className="text-sm font-medium mt-1">Sarah Chen</p>
            <p className="text-xs text-muted-foreground">Paid for 12 sessions</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
