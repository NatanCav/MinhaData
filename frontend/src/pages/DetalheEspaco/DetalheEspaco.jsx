import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getEspacoPorSlug } from "../../services/espacosService";

export default function DetalheEspaco() {
  const { slug } = useParams();
  const [espaco, setEspaco] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    getEspacoPorSlug(slug)
      .then((data) => setEspaco(data))
      .catch(() => setErro("Não foi possível encontrar esse espaço."))
      .finally(() => setCarregando(false));
  }, [slug]);

  return (
    <div className="bg-gray-50">
      <main className="mx-auto max-w-6xl px-6 py-8">
        {carregando && (
          <p className="text-center text-gray-400">Carregando espaço...</p>
        )}

        {!carregando && erro && (
          <p className="text-center text-red-500">{erro}</p>
        )}

        {!carregando && !erro && espaco && (
          <article className="flex flex-col gap-4">
            <img
              src={espaco.imagemCapa}
              alt={espaco.nome}
              className="h-64 w-full rounded-2xl object-cover shadow-md md:h-96"
            />
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              {espaco.tipo}
            </span>
            <h1 className="text-2xl font-bold text-gray-900">{espaco.nome}</h1>
            <p className="text-sm text-gray-500 md:text-base">
              {espaco.descricao}
            </p>
            <p className="text-lg font-semibold text-gray-800">
              R$ {espaco.preco.toFixed(2)}
              <span className="text-sm font-normal text-gray-400">
                {" "}
                /{espaco.unidadePreco}
              </span>
            </p>

            {/* TODO: galeria de fotos, lista de comodidades/informações e
                calendário de agendamento (ver seção 11 do FRONTEND_GUIDE.md)
                ficam para a próxima sprint — aqui só a estrutura de rota e
                os dados essenciais do espaço. */}
          </article>
        )}
      </main>
    </div>
  );
}
