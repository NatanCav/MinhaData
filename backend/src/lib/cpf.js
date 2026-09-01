export function normalizarCpf(cpf) {
  return String(cpf ?? "").replace(/\D/g, "");
}

function calcularDigitoVerificador(base) {
  let soma = 0;
  for (let i = 0; i < base.length; i++) {
    soma += Number(base[i]) * (base.length + 1 - i);
  }
  const resto = (soma * 10) % 11;
  return resto === 10 ? 0 : resto;
}

export function cpfValido(cpf) {
  const digitos = normalizarCpf(cpf);

  if (digitos.length !== 11 || /^(\d)\1{10}$/.test(digitos)) {
    return false;
  }

  const digito1 = calcularDigitoVerificador(digitos.slice(0, 9));
  const digito2 = calcularDigitoVerificador(digitos.slice(0, 10));

  return digito1 === Number(digitos[9]) && digito2 === Number(digitos[10]);
}
