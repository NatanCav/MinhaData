import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import Container from "../../components/ui/Container";
import SectionTitle from "../../components/ui/SectionTitle";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Avatar from "../../components/ui/Avatar";
import { IconeCalendario, IconeSair } from "../../components/ui/Icones";

export default function Perfil() {
  const { usuario, sair } = useAuth();
  const navigate = useNavigate();

  async function handleSair() {
    await sair();
    navigate("/", { replace: true });
  }

  return (
    <div className="bg-gray-50">
      <Container as="main" className="py-8">
        <SectionTitle nivel="pagina" subtitulo="Suas informações de conta." className="mb-8">
          Meu perfil
        </SectionTitle>

        <Card className="flex max-w-md flex-col items-center gap-4 text-center">
          <Avatar nome={usuario.nome} tamanho="lg" />

          <div className="flex flex-col gap-1">
            <p className="text-lg font-semibold text-gray-800">{usuario.nome}</p>
            <p className="text-sm text-gray-500">{usuario.email}</p>
          </div>

          <Link
            to="/configuracoes"
            className="w-full rounded-lg border border-gray-200 px-4 py-2 text-center text-sm font-medium text-gray-600 transition-colors hover:border-emerald-600 hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            Configurações da conta
          </Link>

          <Button
            onClick={() => navigate("/minhas-reservas")}
            className="w-full"
          >
            <IconeCalendario className="h-4 w-4" />
            Minhas reservas
          </Button>

          <Button
            variante="secundario"
            onClick={handleSair}
            className="w-full"
          >
            <IconeSair className="h-4 w-4" />
            Sair
          </Button>
        </Card>
      </Container>
    </div>
  );
}
