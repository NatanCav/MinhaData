import { Link } from "react-router-dom";

export default function EmptyState({
  mensagem,
  tom = "neutro",
  linkTo,
  linkLabel,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center gap-3 py-16 text-center ${className}`}
    >
      <p className={tom === "erro" ? "text-red-500" : "text-gray-400"}>
        {mensagem}
      </p>
      {linkTo && linkLabel && (
        <Link
          to={linkTo}
          className="text-sm font-medium text-emerald-700 transition-colors hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 rounded"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
