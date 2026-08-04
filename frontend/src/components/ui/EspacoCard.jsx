export default function EspacoCard({ espaco }) {
  const { nome, tipo, preco, unidadePreco, capacidade, imagemCapa, disponivel } = espaco;

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300">
      <div className="relative">
        <img
          src={imagemCapa}
          alt={nome}
          className="w-full h-48 object-cover"
        />
        <span
          className={`absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full ${
            disponivel
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {disponivel ? "Disponível" : "Indisponível"}
        </span>
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

          <button
            disabled={!disponivel}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Reservar
          </button>
        </div>
      </div>
    </div>
  );
}