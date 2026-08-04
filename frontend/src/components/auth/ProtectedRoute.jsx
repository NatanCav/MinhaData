import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

export default function ProtectedRoute({ children }) {
  const { autenticado } = useAuth();
  const localizacao = useLocation();

  if (!autenticado) {
    return (
      <Navigate to="/login" replace state={{ from: localizacao.pathname }} />
    );
  }

  return children;
}
