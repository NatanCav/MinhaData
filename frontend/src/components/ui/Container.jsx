export default function Container({ children, as: Tag = "div", className = "" }) {
  return <Tag className={`mx-auto max-w-6xl px-6 ${className}`}>{children}</Tag>;
}
