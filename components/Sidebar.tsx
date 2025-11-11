"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  BarChart3,
  FileText,
  Baby,
  Sparkles,
  History,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

const navigation = [
  { name: "Início", href: "/", icon: Home },
  { name: "Registros", href: "/records", icon: History },
  { name: "Gráficos", href: "/charts", icon: BarChart3 },
  { name: "Relatórios", href: "/report", icon: FileText },
  { name: "Crianças", href: "/children", icon: Baby },
  { name: "Perfil", href: "/profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-50 lg:border-r lg:border-gray-200 dark:lg:border-gray-800 lg:bg-white dark:lg:bg-gray-900">
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Logo/Brand */}
        <div className="flex items-center gap-2 px-6 py-6 border-b border-gray-200 dark:border-gray-800">
          <Logo size="lg" className="bg-transparent rounded-xl" />
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Cubbi
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Cuidado inteligente
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.name}</span>
                {isActive && (
                  <div className="ml-auto">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
            <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-purple-900 dark:text-purple-100">
                IA Ativada
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400 truncate">
                Análise automática
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
