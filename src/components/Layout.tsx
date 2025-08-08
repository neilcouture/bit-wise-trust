import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function Layout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Top header */}
          <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
            <div className="h-full px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="h-8 w-8" />
                <div className="h-4 w-px bg-border" />
                <nav className="flex items-center space-x-4 text-sm">
                  <span className="text-muted-foreground">NeXTMatrix</span>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-foreground font-medium">Oil Bit Survival</span>
                </nav>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                >
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 p-6">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}