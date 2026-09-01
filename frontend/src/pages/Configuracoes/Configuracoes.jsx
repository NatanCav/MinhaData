import { useState } from "react";
import { useAuth } from "../../context/useAuth";
import Container from "../../components/ui/Container";
import SectionTitle from "../../components/ui/SectionTitle";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";
import * as contaService from "../../services/contaService";

const TAMANHO_MINIMO_SENHA = 8;
const REGEX_SENHA_FORTE = /^(?=.*[A-Za-z])(?=.*\d).+$/;

function SecaoAlterarSenha() {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("");
  const [erros, setErros] = useState({});
  const [erroEnvio, setErroEnvio] = useState(null);
  const [mensagem, setMensagem] = useState(null);
  const [enviando, setEnviando] = useState(false);

  function validar() {
    const novosErros = {};
    if (!senhaAtual) novosErros.senhaAtual = "Informe sua senha atual.";
    if (!novaSenha || novaSenha.length < TAMANHO_MINIMO_SENHA || !REGEX_SENHA_FORTE.test(novaSenha)) {
      novosErros.novaSenha = `A nova senha deve ter pelo menos ${TAMANHO_MINIMO_SENHA} caracteres, incluindo letras e números.`;
    }
    if (confirmarNovaSenha !== novaSenha) {
      novosErros.confirmarNovaSenha = "As senhas não coincidem.";
    }
    return novosErros;
  }

  async function handleSubmit(evento) {
    evento.preventDefault();
    setErroEnvio(null);
    setMensagem(null);

    const novosErros = validar();
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    setEnviando(true);
    try {
      const resultado = await contaService.alterarSenha({ senhaAtual, novaSenha });
      setMensagem(resultado.mensagem);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarNovaSenha("");
    } catch (erro) {
      setErroEnvio(erro.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Card className="flex flex-col gap-4">
      <SectionTitle subtitulo="Recomendamos usar uma senha exclusiva para o MinhaData.">
        Alterar senha
      </SectionTitle>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <PasswordInput
          id="senhaAtual"
          label="Senha atual"
          value={senhaAtual}
          onChange={(evento) => {
            setSenhaAtual(evento.target.value);
            setErros((atual) => ({ ...atual, senhaAtual: null }));
          }}
          erro={erros.senhaAtual}
        />

        <PasswordInput
          id="novaSenha"
          label="Nova senha"
          value={novaSenha}
          onChange={(evento) => {
            setNovaSenha(evento.target.value);
            setErros((atual) => ({ ...atual, novaSenha: null }));
          }}
          erro={erros.novaSenha}
        />

        <PasswordInput
          id="confirmarNovaSenha"
          label="Confirmar nova senha"
          value={confirmarNovaSenha}
          onChange={(evento) => {
            setConfirmarNovaSenha(evento.target.value);
            setErros((atual) => ({ ...atual, confirmarNovaSenha: null }));
          }}
          erro={erros.confirmarNovaSenha}
        />

        {erroEnvio && <p className="text-sm text-red-500">{erroEnvio}</p>}
        {mensagem && <p className="text-sm text-emerald-700">{mensagem}</p>}

        <Button type="submit" carregando={enviando} className="w-full sm:w-auto">
          Salvar nova senha
        </Button>
      </form>
    </Card>
  );
}

function SecaoDoisFatores() {
  const { usuario, atualizarUsuario } = useAuth();
  const [etapa, setEtapa] = useState("inicial");
  const [configuracao, setConfiguracao] = useState(null);
  const [codigo, setCodigo] = useState("");
  const [codigosBackup, setCodigosBackup] = useState(null);
  const [senhaDesativar, setSenhaDesativar] = useState("");
  const [codigoDesativar, setCodigoDesativar] = useState("");
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const obrigatorioPj = usuario.tipoConta === "PJ";

  async function handleIniciar() {
    setErro(null);
    setEnviando(true);
    try {
      const resultado = await contaService.iniciarDoisFatores();
      setConfiguracao(resultado);
      setEtapa("configurando");
    } catch (erroRequisicao) {
      setErro(erroRequisicao.message);
    } finally {
      setEnviando(false);
    }
  }

  async function handleConfirmar(evento) {
    evento.preventDefault();
    setErro(null);

    if (!codigo.trim()) {
      setErro("Informe o código gerado no aplicativo autenticador.");
      return;
    }

    setEnviando(true);
    try {
      const resultado = await contaService.confirmarDoisFatores(codigo.trim());
      setCodigosBackup(resultado.codigosBackup);
      setEtapa("concluido");
      atualizarUsuario({ doisFatoresAtivo: true });
    } catch (erroRequisicao) {
      setErro(erroRequisicao.message);
    } finally {
      setEnviando(false);
    }
  }

  async function handleDesativar(evento) {
    evento.preventDefault();
    setErro(null);

    if (!senhaDesativar || !codigoDesativar.trim()) {
      setErro("Informe sua senha e o código de verificação.");
      return;
    }

    setEnviando(true);
    try {
      await contaService.desativarDoisFatores({
        senha: senhaDesativar,
        codigo: codigoDesativar.trim(),
      });
      atualizarUsuario({ doisFatoresAtivo: false });
      setEtapa("inicial");
      setSenhaDesativar("");
      setCodigoDesativar("");
    } catch (erroRequisicao) {
      setErro(erroRequisicao.message);
    } finally {
      setEnviando(false);
    }
  }

  function handleConcluir() {
    setEtapa("inicial");
    setConfiguracao(null);
    setCodigo("");
    setCodigosBackup(null);
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SectionTitle
          subtitulo="Adicione uma camada extra de segurança usando um aplicativo autenticador (Google Authenticator, Authy, etc.)."
        >
          Autenticação de dois fatores
        </SectionTitle>

        {usuario.doisFatoresAtivo ? (
          <Badge tom="emerald">{obrigatorioPj ? "Ativa (obrigatória para PJ)" : "Ativa"}</Badge>
        ) : (
          <Badge tom={obrigatorioPj ? "amber" : "gray"}>
            {obrigatorioPj ? "Obrigatória — não ativada" : "Inativa"}
          </Badge>
        )}
      </div>

      {!usuario.doisFatoresAtivo && etapa === "inicial" && (
        <div className="flex flex-col gap-3">
          {obrigatorioPj && (
            <p className="text-sm text-amber-700">
              Contas de pessoa jurídica precisam ativar a autenticação de dois fatores para
              conseguir reservar espaços.
            </p>
          )}
          {erro && <p className="text-sm text-red-500">{erro}</p>}
          <Button onClick={handleIniciar} carregando={enviando} className="w-full sm:w-auto">
            Ativar autenticação de dois fatores
          </Button>
        </div>
      )}

      {etapa === "configurando" && configuracao && (
        <form onSubmit={handleConfirmar} className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">
            Escaneie o QR code abaixo no seu aplicativo autenticador ou informe a chave manualmente.
          </p>

          <img
            src={configuracao.qrCodeDataUrl}
            alt="QR code para configurar a autenticação de dois fatores"
            className="h-40 w-40 self-center rounded-lg border border-gray-200"
          />

          <p className="break-all rounded-lg bg-gray-50 px-3 py-2 text-center text-xs font-mono text-gray-600">
            {configuracao.secret}
          </p>

          <Input
            id="codigoConfirmacao2fa"
            label="Código do aplicativo autenticador"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={codigo}
            onChange={(evento) => setCodigo(evento.target.value)}
          />

          {erro && <p className="text-sm text-red-500">{erro}</p>}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" carregando={enviando} className="w-full sm:w-auto">
              Confirmar e ativar
            </Button>
            <Button type="button" variante="secundario" onClick={handleConcluir}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {etapa === "concluido" && codigosBackup && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-emerald-700">
            Autenticação de dois fatores ativada com sucesso.
          </p>
          <p className="text-sm text-gray-600">
            Guarde estes códigos de backup em um local seguro. Cada um pode ser usado uma vez caso
            você perca acesso ao aplicativo autenticador.
          </p>
          <ul className="grid grid-cols-2 gap-2 rounded-lg bg-gray-50 p-3 font-mono text-sm text-gray-700">
            {codigosBackup.map((codigoBackup) => (
              <li key={codigoBackup}>{codigoBackup}</li>
            ))}
          </ul>
          <Button onClick={handleConcluir} className="w-full sm:w-auto">
            Concluir
          </Button>
        </div>
      )}

      {usuario.doisFatoresAtivo && !obrigatorioPj && etapa === "inicial" && (
        <details className="flex flex-col gap-3">
          <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-emerald-600">
            Desativar autenticação de dois fatores
          </summary>
          <form onSubmit={handleDesativar} className="mt-3 flex flex-col gap-4">
            <PasswordInput
              id="senhaDesativar2fa"
              label="Senha"
              value={senhaDesativar}
              onChange={(evento) => setSenhaDesativar(evento.target.value)}
            />
            <Input
              id="codigoDesativar2fa"
              label="Código de verificação"
              type="text"
              inputMode="numeric"
              maxLength={10}
              value={codigoDesativar}
              onChange={(evento) => setCodigoDesativar(evento.target.value)}
            />
            {erro && <p className="text-sm text-red-500">{erro}</p>}
            <Button type="submit" variante="secundario" carregando={enviando}>
              Desativar
            </Button>
          </form>
        </details>
      )}
    </Card>
  );
}

function SecaoTelefone() {
  const { usuario, atualizarUsuario } = useAuth();
  const [etapa, setEtapa] = useState("inicial");
  const [telefone, setTelefone] = useState("");
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState(null);
  const [mensagem, setMensagem] = useState(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSolicitar(evento) {
    evento.preventDefault();
    setErro(null);
    setMensagem(null);

    if (!telefone.trim()) {
      setErro("Informe seu número de celular, com DDD.");
      return;
    }

    setEnviando(true);
    try {
      const resultado = await contaService.solicitarVerificacaoTelefone(telefone.trim());
      setMensagem(resultado.mensagem);
      setEtapa("codigo");
    } catch (erroRequisicao) {
      setErro(erroRequisicao.message);
    } finally {
      setEnviando(false);
    }
  }

  async function handleConfirmar(evento) {
    evento.preventDefault();
    setErro(null);

    if (!codigo.trim()) {
      setErro("Informe o código recebido por SMS.");
      return;
    }

    setEnviando(true);
    try {
      await contaService.confirmarVerificacaoTelefone(codigo.trim());
      atualizarUsuario({ telefone: telefone.replace(/\D/g, ""), telefoneVerificado: true });
      setEtapa("inicial");
      setCodigo("");
      setMensagem(null);
    } catch (erroRequisicao) {
      setErro(erroRequisicao.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SectionTitle subtitulo="Usado para enviar lembretes e confirmações de reserva por SMS.">
          Número de celular
        </SectionTitle>

        {usuario.telefoneVerificado && <Badge tom="emerald">Verificado</Badge>}
      </div>

      {usuario.telefoneVerificado && etapa === "inicial" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-gray-600">Número confirmado: {usuario.telefone}</p>
          <Button
            variante="secundario"
            onClick={() => setEtapa("solicitar")}
            className="w-full sm:w-auto"
          >
            Trocar número
          </Button>
        </div>
      )}

      {(!usuario.telefoneVerificado || etapa === "solicitar") && etapa !== "codigo" && (
        <form onSubmit={handleSolicitar} className="flex flex-col gap-4">
          <Input
            id="telefone"
            label="Celular (com DDD)"
            type="tel"
            placeholder="11999999999"
            value={telefone}
            onChange={(evento) => setTelefone(evento.target.value)}
          />
          {erro && <p className="text-sm text-red-500">{erro}</p>}
          <Button type="submit" carregando={enviando} className="w-full sm:w-auto">
            Enviar código por SMS
          </Button>
        </form>
      )}

      {etapa === "codigo" && (
        <form onSubmit={handleConfirmar} className="flex flex-col gap-4">
          {mensagem && <p className="text-sm text-gray-600">{mensagem}</p>}
          <Input
            id="codigoTelefone"
            label="Código recebido por SMS"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={codigo}
            onChange={(evento) => setCodigo(evento.target.value)}
          />
          {erro && <p className="text-sm text-red-500">{erro}</p>}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" carregando={enviando} className="w-full sm:w-auto">
              Confirmar número
            </Button>
            <Button type="button" variante="secundario" onClick={() => setEtapa("inicial")}>
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}

export default function Configuracoes() {
  return (
    <div className="bg-gray-50">
      <Container as="main" className="flex flex-col gap-8 py-8">
        <SectionTitle nivel="pagina" subtitulo="Gerencie a segurança e os dados da sua conta.">
          Configurações da conta
        </SectionTitle>

        <div className="flex max-w-xl flex-col gap-6">
          <SecaoAlterarSenha />
          <SecaoDoisFatores />
          <SecaoTelefone />
        </div>
      </Container>
    </div>
  );
}
