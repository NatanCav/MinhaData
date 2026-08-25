import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

export default function ProtectedRoute({ children, requiredRole }) {
  const { autenticado, usuario } = useAuth();
  const localizacao = useLocation();

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
