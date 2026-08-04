import {
  IconeCalendario,
  IconeGaleria,
  IconePainel,
  IconeWhatsapp,
} from "../ui/Icones";
import SectionTitle from "../ui/SectionTitle";
import Card from "../ui/Card";

const BENEFICIOS = [
  {
    id: "catalogo",
    icone: IconeGaleria,
    titulo: "Catálogo digital",
    descricao:
      "Vitrine completa com fotos, preços e detalhes de cada espaço, sempre atualizada.",
  },
  {
    id: "agendamento",
    icone: IconeCalendario,
    titulo: "Agendamento simples",
    descricao:
      "O cliente escolhe data e horário e envia o pedido de reserva em poucos cliques.",
  },
  {
    id: "painel",
    icone: IconePainel,
    titulo: "Painel de gestão",
    descricao:
      "Aprove ou recuse reservas e cadastre novos espaços em um só lugar.",
  },
  {
    id: "whatsapp",
    icone: IconeWhatsapp,
    titulo: "Lembretes automáticos",
    descricao:
      "Confirmação e lembrete da reserva enviados direto pelo WhatsApp, sem esforço manual.",
  },
];

export default function Beneficios() {
  return (
    <section id="como-funciona" className="bg-gray-50">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <SectionTitle
          nivel="destaque"
          centralizado
          subtitulo="Menos mensagens perdidas, mais reservas confirmadas."
          className="mb-8"
        >
          Como funciona
        </SectionTitle>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFICIOS.map(({ id, icone: Icone, titulo, descricao }) => (
            <Card key={id} className="flex flex-col items-start gap-3">
              <span className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
                <Icone className="h-6 w-6" />
              </span>
              <h3 className="text-lg font-bold text-gray-800">{titulo}</h3>
              <p className="text-sm text-gray-500">{descricao}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
