import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import Spinner from "../ui/Spinner";

<<<<<<< HEAD
export default function ProtectedRoute({ children }) {
  const { autenticado, carregandoSessao } = useAuth();
=======
export default function ProtectedRoute({ children, requiredRole }) {
  const { autenticado, usuario } = useAuth();
>>>>>>> eadef58 (Painel Proprietário criado)
  const localizacao = useLocation();

  if (carregandoSessao) {
    return (
      <div className="flex min-h-[calc(100vh-73px)] items-center justify-center">
        <Spinner tamanho="lg" className="text-emerald-600" />
      </div>
    );
  }

  if (!autenticado) {
    return (
      <Navigate to="/login" replace state={{ from: localizacao.pathname }} />
    );
  }

  if (requiredRole && usuario.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
