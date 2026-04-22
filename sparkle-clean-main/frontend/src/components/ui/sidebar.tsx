import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/* ── Context ─────────────────────────────────────── */
type SidebarContextValue = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}

/* ── Provider ────────────────────────────────────── */
interface SidebarProviderProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultOpen?: boolean;
}

export const SidebarProvider = React.forwardRef<HTMLDivElement, SidebarProviderProps>(
  ({ defaultOpen = true, className, children, ...props }, ref) => {
    const [open, setOpen] = React.useState(defaultOpen);
    const toggleSidebar = React.useCallback(() => setOpen(v => !v), []);
    const value = React.useMemo(
      () => ({ state: (open ? "expanded" : "collapsed") as "expanded" | "collapsed", open, setOpen, toggleSidebar }),
      [open, toggleSidebar]
    );
    return (
      <SidebarContext.Provider value={value}>
        <div ref={ref} className={cn("flex min-h-screen w-full", className)} {...props}>
          {children}
        </div>
      </SidebarContext.Provider>
    );
  }
);
SidebarProvider.displayName = "SidebarProvider";

/* ── Trigger ─────────────────────────────────────── */
export const SidebarTrigger = React.forwardRef
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();
  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8", className)}
      onClick={e => { onClick?.(e); toggleSidebar(); }}
      {...props}
    >
      <PanelLeft className="h-4 w-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
});
SidebarTrigger.displayName = "SidebarTrigger";

/* ── Sidebar ─────────────────────────────────────── */
interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  collapsible?: "icon" | "none" | "offcanvas";
}

export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  ({ collapsible = "icon", className, children, ...props }, ref) => {
    const { state } = useSidebar();
    const collapsed = state === "collapsed";
    return (
      <aside
        ref={ref as React.Ref<HTMLElement>}
        data-state={state}
        data-collapsible={collapsible}
        className={cn(
          "flex flex-col shrink-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-[width] duration-200 ease-linear overflow-hidden",
          collapsed && collapsible === "icon" ? "w-[60px]" : "w-[240px]",
          collapsed && collapsible === "offcanvas" ? "w-0" : "",
          className
        )}
        {...props}
      >
        {children}
      </aside>
    );
  }
);
Sidebar.displayName = "Sidebar";

/* ── Sub-components ──────────────────────────────── */
export const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex-1 overflow-y-auto overflow-x-hidden py-2", className)} {...props} />
  )
);
SidebarContent.displayName = "SidebarContent";

export const SidebarGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col px-2", className)} {...props} />
  )
);
SidebarGroup.displayName = "SidebarGroup";

export const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("w-full", className)} {...props} />
  )
);
SidebarGroupContent.displayName = "SidebarGroupContent";

export const SidebarMenu = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn("flex flex-col gap-0.5 list-none p-0 m-0", className)} {...props} />
  )
);
SidebarMenu.displayName = "SidebarMenu";

export const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.HTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn("w-full", className)} {...props} />
  )
);
SidebarMenuItem.displayName = "SidebarMenuItem";

interface SidebarMenuButtonProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean;
  isActive?: boolean;
}

export const SidebarMenuButton = React.forwardRef<HTMLElement, SidebarMenuButtonProps>(
  ({ asChild = false, isActive, className, children, ...props }, ref) => {
    const Comp = (asChild ? Slot : "button") as React.ElementType;
    return (
      <Comp
        ref={ref}
        data-active={isActive}
        className={cn(
          "w-full flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
          className
        )}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);
SidebarMenuButton.displayName = "SidebarMenuButton";