"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { DocumentIcon, ChatIcon, SettingsIcon, BookIcon } from "@/components/icons";

const navigation = [
  {
    name: "Documents",
    href: "/",
    icon: DocumentIcon,
  },
  {
    name: "Chatbot",
    href: "/chatbot",
    icon: ChatIcon,
  },
  {
    name: "Integration",
    href: "/integration",
    icon: SettingsIcon,
  },
  {
    name: "Documentation",
    href: "/documentation",
    icon: BookIcon,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border px-6">
        <h1 className="text-xl font-semibold">lasta</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

