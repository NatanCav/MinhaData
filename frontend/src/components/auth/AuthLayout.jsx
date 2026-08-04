import { Link } from "react-router-dom";
import { IconeCalendario } from "../ui/Icones";
import Card from "../ui/Card";

export default function AuthLayout({ children, titulo, subtitulo }) {
  return (
    <div className="flex min-h-[calc(100vh-73px)] flex-col items-center justify-center bg-gray-50 px-6 py-12">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          to="/"
          className="flex items-center justify-center gap-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          <IconeCalendario className="h-6 w-6 text-emerald-600" />
          <span className="text-xl font-bold text-gray-900">MinhaData</span>
        </Link>

        <Card className="flex flex-col gap-6">
          <div className="flex flex-col gap-1 text-center">
            <h1 className="text-xl font-bold text-gray-900">{titulo}</h1>
            {subtitulo && <p className="text-sm text-gray-500">{subtitulo}</p>}
          </div>

          {children}
        </Card>
      </div>
    </div>
  );
}
