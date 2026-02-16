import { InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error, label, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-2.5 rounded-xl border bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-black transition-all duration-200 ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900"
              : "border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-zinc-200 dark:focus:ring-zinc-800"
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-500 font-medium pl-1 animate-in slide-in-from-left-1">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

