import Layout from "@/components/layout";
import { FinancialSummary } from "@/components/financial-summary";
import { DebtBreakdown } from "@/components/debt-breakdown";
import { SessionList } from "@/components/session-list";
import { AddSessionDialog } from "@/components/add-session-dialog";
import { AddMemberDialog } from "@/components/add-member-dialog";

export default function Dashboard() {
  return (
    <Layout>
      <div className="flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight text-primary">Dashboard</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Your financial standing across all sessions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AddMemberDialog />
            <AddSessionDialog />
          </div>
        </div>

        <FinancialSummary />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DebtBreakdown />
          
          <div>
            <h3 className="text-lg font-display font-medium mb-4">Recent Sessions</h3>
            <SessionList />
          </div>
        </div>
      </div>
    </Layout>
  );
}
