export function Footer() {
  return (
    <footer className="z-30 mt-auto flex w-full flex-col items-center justify-between border-t border-outline-variant/20 bg-surface-container-lowest/50 px-container-margin py-lg backdrop-blur-sm md:flex-row">
      <div className="font-headline-sm text-headline-sm mb-4 flex items-center gap-2 text-on-surface md:mb-0">
        <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
        FOMO Firewall
      </div>
      <div className="flex gap-lg">
        <a
          href="#"
          className="font-body-sm text-body-sm text-on-surface-variant underline-offset-4 transition-all duration-500 ease-in-out hover:text-primary hover:underline"
        >
          Documentation
        </a>
        <a
          href="#"
          className="font-body-sm text-body-sm text-on-surface-variant underline-offset-4 transition-all duration-500 ease-in-out hover:text-primary hover:underline"
        >
          Terms of Engagement
        </a>
        <a
          href="#"
          className="font-body-sm text-body-sm text-on-surface-variant underline-offset-4 transition-all duration-500 ease-in-out hover:text-primary hover:underline"
        >
          Privacy
        </a>
      </div>
      <div className="font-mono-label text-mono-label mt-4 text-on-surface-variant opacity-50 md:mt-0">
        Built on Birdeye Data
      </div>
    </footer>
  );
}
