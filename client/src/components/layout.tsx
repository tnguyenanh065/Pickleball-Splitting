import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutDashboard, History, Activity } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/sessions", label: "Sessions", icon: History },
    { href: "/activity", label: "Activity", icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-muted">
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2 font-display font-bold text-lg tracking-tight">
            <div className="size-6 rounded-sm bg-primary flex items-center justify-center">
              <div className="size-2 rounded-full bg-background" />
            </div>
            <span>Rally</span>
          </div>
          
          <nav className="flex items-center gap-1 md:gap-2">
             {navItems.map((item) => {
               const isActive = location === item.href;
               const Icon = item.icon;
               return (
                 <Link key={item.href} href={item.href}>
                   <button className={cn(
                     "flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors rounded-md",
                     isActive 
                       ? "bg-secondary text-foreground" 
                       : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                   )}>
                     <Icon className="size-4" />
                     <span className="hidden sm:inline">{item.label}</span>
                   </button>
                 </Link>
               )
             })}
          </nav>

          <div className="flex items-center gap-2">
             <button className="size-8 rounded-full bg-secondary flex items-center justify-center text-sm font-medium">
               ME
             </button>
          </div>
        </div>
      </header>

      <main className="container max-w-screen-xl mx-auto px-4 py-8 md:px-8">
        {children}
      </main>
    </div>
  );
}
