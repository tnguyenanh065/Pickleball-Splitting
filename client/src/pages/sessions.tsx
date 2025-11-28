import Layout from "@/components/layout";
import { SessionList } from "@/components/session-list";
import { AddSessionDialog } from "@/components/add-session-dialog";

export default function SessionsPage() {
  return (
    <Layout>
      <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight text-primary">Sessions</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              History of all pickleball sessions.
            </p>
          </div>
          <AddSessionDialog />
        </div>
        
        <SessionList />
      </div>
    </Layout>
  );
}
