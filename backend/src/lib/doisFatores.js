import otplib from "otplib";

const { authenticator } = otplib;
import bcrypt from "bcryptjs";

export function gerarSegredo() {
  return authenticator.generateSecret();
}

export function gerarOtpAuthUrl(email, secret) {
  return authenticator.keyuri(email, "MinhaData", secret);
}

export function codigoTotpValido(secret, codigo) {
  if (!secret || !codigo) return false;
  try {
    return authenticator.verify({ token: String(codigo).trim(), secret });
  } catch {
    return false;
  }
}

// Aceita tanto o código TOTP atual quanto um código de backup ainda não usado.
export async function validarCodigoOuBackup(usuario, codigo) {
  if (codigoTotpValido(usuario.doisFatoresSecret, codigo)) {
    return { valido: true };
  }

  const codigosBackup = Array.isArray(usuario.doisFatoresCodigosBackup)
    ? usuario.doisFatoresCodigosBackup
    : [];
  const codigoInformado = String(codigo ?? "").trim();

  for (let i = 0; i < codigosBackup.length; i++) {
    if (await bcrypt.compare(codigoInformado, codigosBackup[i])) {
      const restantes = [...codigosBackup];
      restantes.splice(i, 1);
      return { valido: true, codigosBackupAtualizados: restantes };
    }
  }

  return { valido: false };
}
