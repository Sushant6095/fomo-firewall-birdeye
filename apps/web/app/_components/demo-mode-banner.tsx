export function DemoModeBanner({ source }: { source: "db" | "fixture" }) {
  if (source === "db") return null;
  return (
    <div className="font-mono-label text-mono-label flex items-center justify-center gap-2 border-b border-tertiary/20 bg-tertiary/5 px-container-margin py-1 text-tertiary">
      <span className="material-symbols-outlined text-[14px]">science</span>
      <span>
        Demo data. Switch to live Birdeye via{" "}
        <code className="rounded bg-tertiary/10 px-1">NEXT_PUBLIC_FOMO_LIVE=1</code>
      </span>
    </div>
  );
}
