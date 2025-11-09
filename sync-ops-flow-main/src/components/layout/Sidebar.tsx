import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  UtensilsCrossed, 
  Package, 
  Fuel, 
  FileText,
  BarChart3,
  Building2,
  Settings,
  Webhook
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  open: boolean;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Users, label: "Funcionários", path: "/funcionarios" },
  { icon: Clock, label: "Frequência", path: "/frequencia" },
  { icon: UtensilsCrossed, label: "Alimentação", path: "/alimentacao" },
  { icon: Package, label: "Materiais", path: "/materiais" },
  { icon: Fuel, label: "Combustível", path: "/combustivel" },
  { icon: FileText, label: "Documentação", path: "/documentacao" },
  { icon: BarChart3, label: "Relatórios", path: "/relatorios" },
  { icon: Webhook, label: "Eventos & Webhooks", path: "/eventos" },
  { icon: Settings, label: "Configurações", path: "/configuracoes" },
];

export const Sidebar = ({ open }: SidebarProps) => {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar-background border-r border-sidebar-border transition-all duration-300 z-40",
        open ? "w-64" : "w-0 -translate-x-full"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-sidebar-border bg-sidebar-background/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-lg">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">WorkFlow Pro</h1>
              <p className="text-xs text-sidebar-foreground/70">Gestão Empresarial</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-sidebar-border bg-sidebar-background/50">
          <div className="text-xs text-sidebar-foreground/70 text-center">
            © 2025 WorkFlow Pro
          </div>
        </div>
      </div>
    </aside>
  );
};
