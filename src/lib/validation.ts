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
  imdbId: z.string().trim().regex(/^tt\d+$/, "imdbId inválido (formato tt1234567)"),
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

export const movieListQuerySchema = z.object({
  search: z.string().trim().optional(),
  genre: z.string().trim().optional(),
  offset: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(50).default(8),
});
