export function FormContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-center w-full px-6">
      <div className="w-full max-w-3xl">{children}</div>
    </div>
  );
}

export function FormCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-8 shadow-sm">
      {children}
    </div>
  );
}

