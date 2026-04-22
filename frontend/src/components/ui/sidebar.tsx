import * as React from "react";
import { PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type SidebarState = "expanded" | "collapsed";

interface SidebarContextValue {
  state: SidebarState;
  toggleSidebar: () => void;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}

function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<SidebarState>("expanded");
  const toggleSidebar = () => setState((prev) => (prev === "expanded" ? "collapsed" : "expanded"));
  return <SidebarContext.Provider value={{ state, toggleSidebar }}>{children}</SidebarContext.Provider>;
}

function SidebarTrigger({ className }: { className?: string }) {
  const { toggleSidebar } = useSidebar();
  return (
    <Button variant="ghost" size="icon" className={className} onClick={toggleSidebar} aria-label="Toggle sidebar">
      <PanelLeft className="h-4 w-4" />
    </Button>
  );
}

function Sidebar({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement> & { collapsible?: "icon" }) {
  const { state } = useSidebar();
  return (
    <aside className={cn("bg-sidebar text-sidebar-foreground transition-all duration-200", state === "collapsed" ? "w-20" : "w-72", className)}>
      <div className="flex h-full flex-col">{children}</div>
    </aside>
  );
}

const SidebarContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("flex-1", className)} {...props} />;
const SidebarGroup = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("space-y-1", className)} {...props} />;
const SidebarGroupContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn(className)} {...props} />;
const SidebarMenu = ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => <ul className={cn("space-y-1", className)} {...props} />;
const SidebarMenuItem = ({ className, ...props }: React.LiHTMLAttributes<HTMLLIElement>) => <li className={cn(className)} {...props} />;
function SidebarMenuButton({ className, ...props }: React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }) {
  return <div className={cn("w-full", className)} {...props} />;
}

export {
  SidebarProvider,
  SidebarTrigger,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
};
