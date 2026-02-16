import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline" | "glass";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
}

const variants = {
  primary:
    "bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 shadow-lg shadow-zinc-200/50 dark:shadow-none",
  secondary:
    "bg-zinc-100 text-zinc-900 border border-zinc-200 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800",
  danger:
    "bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white dark:bg-red-500/10 dark:text-red-500 dark:border-red-500/20 dark:hover:bg-red-500 dark:hover:text-white shadow-sm",
  ghost:
    "bg-transparent text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900/80",
  outline:
    "bg-transparent text-zinc-900 border-2 border-zinc-200 hover:border-zinc-900 dark:text-white dark:border-zinc-800 dark:hover:border-white hover:bg-zinc-50 dark:hover:bg-zinc-900",
  glass:
    "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all",
};

const sizes = {
  xs: "px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest",
  sm: "px-4 py-2 text-xs font-bold",
  md: "px-6 py-3 text-sm font-bold",
  lg: "px-8 py-4 text-base font-black",
  xl: "px-10 py-5 text-lg font-black",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      isLoading,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-2xl transition-all duration-300 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}>
        {isLoading && (
          <Loader2 className="w-4 h-4 mr-2 animate-spin text-current" />
        )}
        <span className={isLoading ? "opacity-70" : ""}>{children}</span>
      </button>
    );
  },
);

Button.displayName = "Button";

