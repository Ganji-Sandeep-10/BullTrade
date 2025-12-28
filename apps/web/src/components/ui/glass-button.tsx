import React from "react";

type GlassButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "auto" | "on-dark";
};

export default function GlassButton({
  className,
  variant = "auto",
  children,
  type,
  ...props
}: GlassButtonProps) {
  const classes = [
    "glass-button",
    variant === "on-dark" ? "glass-button--on-dark" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} type={type ?? "button"} {...props}>
      <span className="glass-button__inner">
        <span className="glass-button__label">{children}</span>
      </span>
    </button>
  );
}
