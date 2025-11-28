import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { TREND_DATA } from "@/lib/mock-data";

export function TrendChart() {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-display font-medium">Financial Trend</CardTitle>
      </CardHeader>
      <CardContent className="pl-0">
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={TREND_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(value) => `${value / 1000}k`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--popover))", 
                  borderColor: "hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  fontSize: "12px",
                  fontFamily: "var(--font-mono)"
                }}
                itemStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value: number) => [new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value), "Balance"]}
              />
              <Area 
                type="monotone" 
                dataKey="balance" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorBalance)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
