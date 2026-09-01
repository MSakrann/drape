import Link from "next/link";

const base =
  "inline-flex items-center justify-center rounded-2xl h-10 px-6 uppercase tracking-wider font-bold";

const variants = {
  primary: "bg-[var(--drape-accent)] text-[var(--drape-bg)]",
  outline:
    "border border-[var(--drape-accent)] text-[var(--drape-accent)] hover:bg-[var(--drape-accent)] hover:text-[var(--drape-bg)]",
} as const;

type ButtonProps = {
  variant?: "primary" | "outline";
  href?: string;
  className?: string;
  children?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = "primary",
  href,
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = [base, variants[variant], className].filter(Boolean).join(" ");

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
