"use client";

import * as React from "react";
import { List } from "lucide-react";

export type TocItem = { id: string; label: string; level?: 2 | 3 };

export function DocsToc({ items }: { items: TocItem[] }) {
  const [active, setActive] = React.useState<string | null>(items[0]?.id ?? null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );
    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  return (
    <aside className="hidden xl:block w-56 shrink-0 sticky top-20 self-start max-h-[calc(100vh-5rem)] overflow-y-auto pb-12 pl-4">
      <div className="font-mono mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-on-surface-variant/80">
        <List className="h-3 w-3" />
        On this page
      </div>
      <ul className="flex flex-col gap-px text-sm">
        {items.map((item) => {
          const isActive = active === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={
                  isActive
                    ? `block border-l-2 border-tertiary pl-3 py-1 text-tertiary ${item.level === 3 ? "pl-5 text-xs" : ""}`
                    : `block border-l-2 border-outline-variant/30 pl-3 py-1 text-on-surface-variant transition-colors hover:border-on-surface-variant hover:text-on-surface ${item.level === 3 ? "pl-5 text-xs" : ""}`
                }
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
