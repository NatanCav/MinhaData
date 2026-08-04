const TONS = {
  emerald: "bg-emerald-100 text-emerald-700",
  red: "bg-red-100 text-red-700",
  amber: "bg-amber-100 text-amber-700",
  gray: "bg-gray-100 text-gray-600",
};

export default function Badge({ tom = "gray", children, className = "" }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${TONS[tom]} ${className}`}
    >
      {children}
    </span>
  );
}
