import { DriverFooter } from "./driver-footer";
import { DriverTopNavigation } from "./driver-top-bar";

export function DriverShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--odong-page-bg)] text-[var(--odong-text)] transition-colors duration-300">
      <DriverTopNavigation />
      <div className="mx-auto flex w-full max-w-[1480px] flex-col px-4 pb-8 pt-28 sm:px-6 sm:pt-32 lg:px-8">
        <main className="flex-1">{children}</main>
      </div>
      <DriverFooter />
    </div>
  );
}
