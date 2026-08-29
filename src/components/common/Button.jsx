import "../../styles/Button.css";

export default function Button({
  as: Tag = "button",
  variant = "primary", // primary | ghost | outline
  size = "m", // m | s
  className = "",
  children,
  ...rest
}) {
  return (
    <Tag className={`btn btn--${variant} btn--${size} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
