export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  suggestions: string[];
}

/** Lightweight heuristic (no external dep): rewards length and character variety, flags common weak patterns. */
export function scorePassword(password: string): PasswordStrength {
  if (!password) return { score: 0, label: "", suggestions: [] };

  const suggestions: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  else suggestions.push("Usa al menos 8 caracteres");

  if (password.length >= 12) score++;

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);
  const variety = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;

  if (variety >= 3) score++;
  if (variety === 4) score++;

  if (!hasUpper) suggestions.push("Agrega una mayúscula");
  if (!hasDigit) suggestions.push("Agrega un número");
  if (!hasSymbol) suggestions.push("Agrega un símbolo (!, _, #...)");

  if (/^(.)\1+$/.test(password) || /^(?:012|123|234|345|456|567|678|789|password|qwerty|contraseña)/i.test(password)) {
    score = Math.min(score, 1);
    suggestions.unshift("Evita secuencias o palabras comunes");
  }

  const clamped = Math.max(0, Math.min(4, score)) as PasswordStrength["score"];
  const labels = ["Muy débil", "Débil", "Aceptable", "Fuerte", "Muy fuerte"];

  return { score: clamped, label: labels[clamped], suggestions: suggestions.slice(0, 2) };
}
