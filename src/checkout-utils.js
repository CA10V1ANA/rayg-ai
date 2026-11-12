export const money = (value) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const formatCPF = (value) =>
  value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
export const formatPhone = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(
      digits.length > 10 ? /(\d{5})(\d{4})$/ : /(\d{4})(\d{4})$/,
      "$1-$2",
    );
};
export function validCPF(value) {
  const digits = value.replace(/\D/g, "");
  if (!/^\d{11}$/.test(digits) || /^(\d)\1{10}$/.test(digits)) return false;
  for (let size = 9; size <= 10; size++) {
    const sum = [...digits.slice(0, size)].reduce(
      (total, digit, i) => total + Number(digit) * (size + 1 - i),
      0,
    );
    const remainder = (sum * 10) % 11;
    if ((remainder === 10 ? 0 : remainder) !== Number(digits[size]))
      return false;
  }
  return true;
}
