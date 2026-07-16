export type CardTexture =
  | "none"
  | "diagonal"
  | "dots"
  | "waves"
  | "carbon"
  | "brushed"
  | "grid";

export interface Bank {
  id: string;
  name: string;
  gradient: string;
  /** Brand accent used for the stripe under the bank name and small details. */
  accent?: string;
  /** Dot shown in compact contexts (saved cards list). */
  swatch: string;
  /** Ink color over the card face — light cards (Vexi, Amex) need dark text. */
  text?: "light" | "dark";
  texture?: CardTexture;
}

export const BANKS: Bank[] = [
  {
    id: "generic",
    name: "Genérica",
    gradient: "linear-gradient(135deg, #0f2d3c 0%, #005546 60%, #1ebe91 100%)",
    swatch: "#1ebe91",
    texture: "waves",
  },
  {
    id: "bbva",
    name: "BBVA",
    gradient: "linear-gradient(135deg, #072146 0%, #0763BC 100%)",
    swatch: "#0763BC",
    texture: "waves",
  },
  {
    id: "santander",
    name: "Santander",
    gradient: "linear-gradient(135deg, #EC0000 0%, #7A0000 100%)",
    swatch: "#EC0000",
    texture: "diagonal",
  },
  {
    id: "banamex",
    name: "Banamex",
    gradient: "linear-gradient(135deg, #00295E 0%, #0057A6 100%)",
    accent: "#DA291C",
    swatch: "#0057A6",
    texture: "grid",
  },
  {
    id: "banorte",
    name: "Banorte",
    gradient: "linear-gradient(135deg, #C8102E 0%, #6E0A1B 100%)",
    swatch: "#EB0029",
    texture: "brushed",
  },
  {
    id: "scotiabank",
    name: "Scotiabank",
    gradient: "linear-gradient(135deg, #EC111A 0%, #8F0A0F 100%)",
    swatch: "#EC111A",
    texture: "diagonal",
  },
  {
    id: "hsbc",
    name: "HSBC",
    gradient: "linear-gradient(135deg, #DB0011 0%, #4D0008 100%)",
    accent: "#FFFFFF",
    swatch: "#DB0011",
    texture: "brushed",
  },
  {
    id: "azteca",
    name: "Banco Azteca",
    gradient: "linear-gradient(135deg, #00863D 0%, #004D23 100%)",
    swatch: "#00863D",
    texture: "dots",
  },
  {
    id: "amex",
    name: "American Express",
    gradient: "linear-gradient(135deg, #F0F1F4 0%, #C4C9D4 45%, #E4E6EB 70%, #AAB0BD 100%)",
    accent: "#016FD0",
    swatch: "#C4C9D4",
    text: "dark",
    texture: "brushed",
  },
  {
    id: "nu",
    name: "Nu",
    gradient: "linear-gradient(135deg, #820AD1 0%, #4B0082 100%)",
    swatch: "#820AD1",
    texture: "waves",
  },
  {
    id: "plata",
    name: "Plata Card",
    gradient: "linear-gradient(150deg, #4A4E57 0%, #232529 45%, #101114 100%)",
    accent: "#FF6A00",
    swatch: "#FF6A00",
    texture: "brushed",
  },
  {
    id: "vexi",
    name: "Vexi",
    gradient: "linear-gradient(135deg, #FFFFFF 0%, #EDEFF4 100%)",
    accent: "#FF3B5C",
    swatch: "#FF3B5C",
    text: "dark",
    texture: "dots",
  },
  {
    id: "stori",
    name: "Stori",
    gradient: "linear-gradient(135deg, #0B3B2E 0%, #052018 100%)",
    accent: "#00D775",
    swatch: "#00D775",
    texture: "carbon",
  },
  {
    id: "uala",
    name: "Ualá",
    gradient: "linear-gradient(135deg, #FF5C93 0%, #A44FD0 55%, #4A5CFB 100%)",
    swatch: "#FF5C93",
    texture: "waves",
  },
  {
    id: "mercadopago",
    name: "Mercado Pago",
    gradient: "linear-gradient(135deg, #262626 0%, #000000 100%)",
    accent: "#00B1EA",
    swatch: "#00B1EA",
    texture: "grid",
  },
  {
    id: "rappicard",
    name: "Rappi Card",
    gradient: "linear-gradient(135deg, #2E2E2E 0%, #050505 100%)",
    accent: "#FF441F",
    swatch: "#FF441F",
    texture: "carbon",
  },
  {
    id: "didicard",
    name: "DiDi Card",
    gradient: "linear-gradient(135deg, #FF9500 0%, #E64A00 100%)",
    swatch: "#FF7A00",
    texture: "diagonal",
  },
];

export function getBank(id: string): Bank {
  return BANKS.find((b) => b.id === id) ?? BANKS[0];
}

/**
 * Texture overlays are pure CSS (repeating gradients) layered over the base
 * gradient in their own element, so each keeps its own background-size.
 * Light-ink cards get a dark texture so it stays visible.
 */
export function textureStyle(bank: Bank): { backgroundImage: string; backgroundSize?: string } | undefined {
  const dark = bank.text === "dark";
  const ink = dark ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.08)";
  const inkSoft = dark ? "rgba(0,0,0,0.045)" : "rgba(255,255,255,0.05)";

  switch (bank.texture) {
    case "diagonal":
      return {
        backgroundImage: `repeating-linear-gradient(45deg, ${ink} 0 2px, transparent 2px 14px)`,
      };
    case "dots":
      return {
        backgroundImage: `radial-gradient(${ink} 1px, transparent 1.5px)`,
        backgroundSize: "12px 12px",
      };
    case "waves":
      return {
        backgroundImage: `repeating-radial-gradient(circle at 115% -15%, ${inkSoft} 0 16px, transparent 16px 40px)`,
      };
    case "carbon":
      return {
        backgroundImage: `linear-gradient(45deg, ${ink} 25%, transparent 25%, transparent 75%, ${ink} 75%), linear-gradient(45deg, ${ink} 25%, transparent 25%, transparent 75%, ${ink} 75%)`,
        backgroundSize: "10px 10px, 10px 10px",
      };
    case "brushed":
      return {
        backgroundImage: `repeating-linear-gradient(90deg, ${ink} 0 1px, transparent 1px 3px)`,
      };
    case "grid":
      return {
        backgroundImage: `linear-gradient(${inkSoft} 1px, transparent 1px), linear-gradient(90deg, ${inkSoft} 1px, transparent 1px)`,
        backgroundSize: "16px 16px, 16px 16px",
      };
    default:
      return undefined;
  }
}
