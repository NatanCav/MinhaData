import { Link } from "react-router-dom";
import Card from "./Card";
import Badge from "./Badge";

export default function EspacoCard({ espaco }) {
  const { slug, nome, tipo, preco, unidadePreco, capacidade, imagemCapa, disponivel } =
    espaco;

  return (
    <Card
      as={Link}
      to={`/espacos/${slug}`}
      padding=""
      hover
      className="flex flex-col overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
    >
      <div className="relative">
        <img
          src={imagemCapa}
          alt={nome}
          className="w-full h-48 object-cover"
        />
        <Badge
          tom={disponivel ? "emerald" : "red"}
          className="absolute top-3 right-3"
        >
          {disponivel ? "Disponível" : "Indisponível"}
        </Badge>
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <span className="text-xs uppercase tracking-wide text-gray-400 font-medium">
          {tipo}
        </span>
        <h3 className="text-lg font-bold text-gray-800">{nome}</h3>

        <div className="flex items-center gap-1 text-sm text-gray-500">
          <span>👥 Até {capacidade} pessoas</span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-3">
          <p className="text-gray-800 font-semibold">
            R$ {preco.toFixed(2)}
            <span className="text-sm font-normal text-gray-400"> /{unidadePreco}</span>
          </p>

          <span
            className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
              disponivel
                ? "bg-emerald-600 text-white"
                : "bg-gray-300 text-white"
            }`}
          >
            {disponivel ? "Reservar" : "Ver detalhes"}
          </span>
        </div>
      </div>
    </Card>
  );
}