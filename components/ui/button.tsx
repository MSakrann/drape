import Link from "next/link";

const base =
  "drape-chip disabled:pointer-events-none disabled:opacity-50";

const ArrowIcon = () => (
  <svg
    className="drape-chip-arrow"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);

type ButtonProps = {
  variant?: "primary" | "outline";
  href?: string;
  className?: string;
  arrow?: boolean;
  children?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant: _variant = "primary",
  href,
  className,
  arrow = true,
  children,
  ...props
}: ButtonProps) {
  const classes = [base, className].filter(Boolean).join(" ");
  const content = (
    <>
      {children}
      {arrow ? <ArrowIcon /> : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {content}
    </button>
  );
}
