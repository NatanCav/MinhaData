export default function Skeleton({ as: Tag = "div", className = "" }) {
  return (
    <Tag
      aria-hidden="true"
      className={`animate-pulse rounded bg-gray-200 ${className}`}
    />
  );
}
