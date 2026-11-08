// src/App.jsx
import { Route, Routes } from "react-router-dom";
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import Home from "./pages/Home/Home.jsx";
import Vitrine from "./pages/Vitrine/Vitrine.jsx";
import DetalheEspaco from "./pages/DetalheEspaco/DetalheEspaco.jsx";
import ConfirmarReserva from "./pages/ConfirmarReserva/ConfirmarReserva.jsx";
import Login from "./pages/Login/Login.jsx";
import Cadastro from "./pages/Cadastro/Cadastro.jsx";
import EsqueciMinhaSenha from "./pages/EsqueciMinhaSenha/EsqueciMinhaSenha.jsx";
import Perfil from "./pages/Perfil/Perfil.jsx";
import Configuracoes from "./pages/Configuracoes/Configuracoes.jsx";
import MinhasReservas from "./pages/MinhasReservas/MinhasReservas.jsx";
import Painel from "./pages/Painel/Painel.jsx";
import PainelReservas from "./pages/PainelReservas/PainelReservas.jsx";
import PainelEspacos from "./pages/PainelEspacos/PainelEspacos.jsx";
import PainelEspacoForm from "./pages/PainelEspacoForm/PainelEspacoForm.jsx";
import { ReservaProvider } from "./context/ReservaContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import PainelLayout from "./components/layout/PainelLayout.jsx";
import { PAPEL_PROPRIETARIO } from "./services/authService";

function App() {
  return (
    <AuthProvider>
      <ReservaProvider>
        <div className="flex min-h-screen flex-col">
          <Header />

          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/espacos" element={<Vitrine />} />
              <Route path="/espacos/:slug" element={<DetalheEspaco />} />
              <Route
                path="/reserva"
                element={
                  <ProtectedRoute>
                    <ConfirmarReserva />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />
              <Route path="/esqueci-minha-senha" element={<EsqueciMinhaSenha />} />
              <Route
                path="/perfil"
                element={
                  <ProtectedRoute>
                    <Perfil />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/minhas-reservas"
                element={
                  <ProtectedRoute>
                    <MinhasReservas />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/configuracoes"
                element={
                  <ProtectedRoute>
                    <Configuracoes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gestao"
                element={
                  <ProtectedRoute requiredRole={PAPEL_PROPRIETARIO}>
                    <PainelLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Painel />} />
                <Route path="reservas" element={<PainelReservas />} />
                <Route path="espacos" element={<PainelEspacos />} />
                <Route path="espacos/novo" element={<PainelEspacoForm />} />
                <Route path="espacos/:slug/editar" element={<PainelEspacoForm />} />
              </Route>
            </Routes>
          </div>

          <Footer />
        </div>
      </ReservaProvider>
    </AuthProvider>
  );
}

export default App;
