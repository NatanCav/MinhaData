// src/App.jsx
import { Route, Routes } from "react-router-dom";
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import Home from "./pages/Home/Home.jsx";
import Vitrine from "./pages/Vitrine/Vitrine.jsx";
import DetalheEspaco from "./pages/DetalheEspaco/DetalheEspaco.jsx";
import ConfirmarReserva from "./pages/ConfirmarReserva/ConfirmarReserva.jsx";
import { ReservaProvider } from "./context/ReservaContext.jsx";

function App() {
  return (
    <ReservaProvider>
      <div className="flex min-h-screen flex-col">
        <Header />

        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/espacos" element={<Vitrine />} />
            <Route path="/espacos/:slug" element={<DetalheEspaco />} />
            <Route path="/reserva" element={<ConfirmarReserva />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </ReservaProvider>
  );
}

export default App;
