import heroImage from "../../assets/hero.png";

export default function Hero() {
  return (
    <section className="bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 py-12 md:flex-row md:py-20">
        <div className="flex flex-1 flex-col gap-4">
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Encontre e reserve o espaço perfeito para o seu evento
          </h1>
          <p className="text-sm text-gray-500 md:text-base">
            Chácaras, salões e quiosques com disponibilidade em tempo real e
            reserva simplificada, sem trocar mensagens.
          </p>
          <div>
            <a
              href="#espacos"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              Ver espaços disponíveis
            </a>
          </div>
        </div>

        <div className="w-full flex-1">
          <img
            src={heroImage}
            alt="Espaço de lazer disponível para reserva"
            className="h-64 w-full rounded-2xl object-cover shadow-md md:h-96"
          />
        </div>
      </div>
    </section>
  );
}
