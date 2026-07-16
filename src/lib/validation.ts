import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().trim().toLowerCase().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export const movieImportSchema = z.object({
  tmdbId: z.coerce.number().int().positive("tmdbId inválido"),
  mediaType: z.enum(["movie", "tv"]),
  priceBuy: z.coerce.number().positive("priceBuy debe ser positivo"),
  priceRent: z.coerce.number().positive("priceRent debe ser positivo"),
});

export const movieUpdateSchema = z
  .object({
    priceBuy: z.coerce.number().positive().optional(),
    priceRent: z.coerce.number().positive().optional(),
  })
  .refine((data) => data.priceBuy !== undefined || data.priceRent !== undefined, {
    message: "Debes enviar priceBuy y/o priceRent",
  });

export const purchaseSchema = z.object({
  movieId: z.string().uuid("movieId inválido"),
  type: z.enum(["buy", "rent"]),
});

/** Either a regular image URL or a base64 data URL produced by the in-browser
 * resizer (capped well below what a 512px JPEG can weigh) — stored as-is in Neon. */
const avatarValueSchema = z.union([
  z
    .string()
    .trim()
    .regex(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/, "Imagen inválida")
    .max(500_000, "La imagen es demasiado grande"),
  z.string().trim().url("URL inválida").max(2000),
  z.null(),
]);

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
  avatarUrl: avatarValueSchema.optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "La contraseña actual es requerida"),
    newPassword: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "La nueva contraseña debe ser distinta de la actual",
    path: ["newPassword"],
  });

export const favoriteSchema = z.object({
  movieId: z.string().uuid("movieId inválido"),
});

export const movieListQuerySchema = z.object({
  search: z.string().trim().optional(),
  genre: z.string().trim().optional(),
  type: z.enum(["movie", "tv"]).optional(),
  collection: z.enum(["trending_day", "trending_week"]).optional(),
  sort: z.enum(["popular", "rating", "recent", "title"]).default("popular"),
  offset: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(60).default(8),
});
