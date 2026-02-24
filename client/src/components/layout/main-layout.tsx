import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden bg-muted/20">
          <header className="h-16 flex items-center px-4 md:px-6 border-b border-border/50 bg-background/60 backdrop-blur-md sticky top-0 z-20">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors mr-4" />
            <div className="flex-1" />
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full max-w-[1600px] mx-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
