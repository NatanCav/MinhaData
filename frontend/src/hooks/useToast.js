import { useCallback, useState } from "react";

const ESTADO_INICIAL = { visivel: false, mensagem: "", tom: "sucesso" };

// Centraliza o estado de exibição do Toast.jsx (mensagem, tom, visibilidade)
// para telas com múltiplas ações assíncronas que precisam de feedback,
// como as do painel de gestão.
export function useToast() {
  const [toast, setToast] = useState(ESTADO_INICIAL);

  const mostrarToast = useCallback((mensagem, tom = "sucesso") => {
    setToast({ visivel: true, mensagem, tom });
  }, []);

  const fecharToast = useCallback(() => {
    setToast((atual) => ({ ...atual, visivel: false }));
  }, []);

  return { toast, mostrarToast, fecharToast };
}
