/**
 * wa.me necesita el número en formato internacional sin signos.
 * Si quedan 10 dígitos (formato local RD/NANP: 809/829/849...),
 * se asume +1 porque es el código de país de República Dominicana.
 */
export function toWhatsAppLink(phone: string, message?: string): string {
  const digits = phone.replace(/\D/g, "");
  const withCountryCode = digits.length === 10 ? `1${digits}` : digits;
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${withCountryCode}${query}`;
}
