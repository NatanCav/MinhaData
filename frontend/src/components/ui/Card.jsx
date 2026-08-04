export default function Card({
  children,
  as: Tag = "div",
  padding = "p-4",
  hover = false,
  className = "",
  ...props
}) {
  return (
    <Tag
      className={`rounded-2xl bg-white shadow-md ${padding} ${
        hover ? "transition-shadow duration-300 hover:shadow-xl" : ""
      } ${className}`.trim()}
      {...props}
    >
      {children}
    </Tag>
  );
}
