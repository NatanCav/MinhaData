const BENEFICIOS = [
  {
    titulo: "Reserva sem trocar mensagens",
    descricao:
      "O cliente escolhe data e horário disponíveis e envia o pedido de reserva direto pelo site, sem precisar negociar por WhatsApp.",
  },
  {
    titulo: "Confirmação automática",
    descricao:
      "Assim que a reserva é aprovada, o cliente recebe confirmação e lembrete automático via WhatsApp, sem esforço manual.",
  },
  {
    titulo: "Gestão centralizada",
    descricao:
      "Todas as solicitações, aprovações e recusas ficam organizadas em um único painel, substituindo a agenda de papel.",
  },
];

function IconeReserva({ className }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <path d="m9 16 2 2 4-4" />
    </svg>
  );
}

function IconeMensagem({ className }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconePainel({ className }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

const ICONES = [IconeReserva, IconeMensagem, IconePainel];

export default function Beneficios() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Por que usar o MinhaData
          </h2>
          <p className="text-sm text-gray-500 md:text-base">
            Menos mensagens perdidas, mais organização para o seu espaço.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFICIOS.map((beneficio, indice) => {
            const Icone = ICONES[indice];

            return (
              <div
                key={beneficio.titulo}
                className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-md"
              >
                <Icone className="h-6 w-6 text-emerald-600" />
                <h3 className="text-lg font-bold text-gray-800">
                  {beneficio.titulo}
                </h3>
                <p className="text-sm text-gray-500">{beneficio.descricao}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
