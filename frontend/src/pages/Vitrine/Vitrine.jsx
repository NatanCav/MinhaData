import { useEffect, useState } from "react";
import { getEspacos } from "../../services/espacosService";
import EspacoCard from "../../components/ui/EspacoCard";

export default function Vitrine() {
  const [espacos, setEspacos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    getEspacos()
      .then((data) => setEspacos(data))
      .catch(() => setErro("Não foi possível carregar os espaços."))
      .finally(() => setCarregando(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm py-6 px-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Encontre o espaço ideal para o seu evento
        </h1>
        <p className="text-gray-500 mt-1">
          Chácaras, salões e quiosques com reserva simplificada.
        </p>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-12">
        {carregando && (
          <p className="text-center text-gray-400">Carregando espaços...</p>
        )}

        {erro && <p className="text-center text-red-500">{erro}</p>}

        {!carregando && !erro && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {espacos.map((espaco) => (
              <EspacoCard key={espaco.id} espaco={espaco} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}