import { useEffect, useState } from "react";
import { getEspacos } from "../../services/espacosService";
import EspacoCard from "../ui/EspacoCard";

const QUANTIDADE_DESTAQUE = 3;

export default function VitrineEspacos() {
  const [espacos, setEspacos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    getEspacos()
      .then((data) => setEspacos(data.slice(0, QUANTIDADE_DESTAQUE)))
      .catch(() => setErro("Não foi possível carregar os espaços."))
      .finally(() => setCarregando(false));
  }, []);

  return (
    <section id="espacos" className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Espaços em destaque
          </h2>
          <p className="text-sm text-gray-500 md:text-base">
            Uma amostra dos espaços disponíveis para reservar agora.
          </p>
        </div>

        {carregando && (
          <p className="text-center text-gray-400">Carregando espaços...</p>
        )}

        {!carregando && erro && (
          <p className="text-center text-red-500">{erro}</p>
        )}

        {!carregando && !erro && espacos.length === 0 && (
          <p className="text-center text-gray-400">
            Nenhum espaço disponível no momento.
          </p>
        )}

        {!carregando && !erro && espacos.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {espacos.map((espaco) => (
              <EspacoCard key={espaco.id} espaco={espaco} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
