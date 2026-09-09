import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import React from 'react'

const Aside = ({settings, navQuery, query, activeTab, setActiveTab}) => {
  return (
    <aside className="w-full shrink-0 lg:w-60">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-foreground" />
          <span className="text-sm font-semibold text-foreground">
            Svastha UI
          </span>
        </div>

        <p className="mt-5 text-sm font-medium text-foreground">Settings</p>

        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => navQuery(event.target.value)}
            placeholder="Search"
            className="h-9 pl-8"
          />
        </div>

        <nav className="mt-4 space-y-1" aria-label="Settings sections">
          {settings.map((item) => {
            const NavIcon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                <NavIcon className="size-4" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge ? (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
          {settings.length === 0 ? (
            <p className="px-2.5 py-2 text-xs text-muted-foreground">
              No sections match “{query}”.
            </p>
          ) : null}
        </nav>
      </aside>
  )
}

export default Aside