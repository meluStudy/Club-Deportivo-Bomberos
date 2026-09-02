import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Introduce tu nombre completo").max(120),
    email: z.string().trim().email("Correo electrónico no válido").toLowerCase(),
    phone: z.string().trim().max(20).optional().or(z.literal("")),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(100),
    confirmPassword: z.string(),
    isFirefighter: z.boolean().optional().default(false),
    acceptTerms: z.literal(true, { message: "Debes aceptar los términos y la política de privacidad" }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().trim().email("Correo electrónico no válido").toLowerCase(),
  password: z.string().min(1, "Introduce tu contraseña"),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Introduce tu nombre").max(120),
  email: z.string().trim().email("Correo electrónico no válido"),
  subject: z.string().trim().min(3, "Indica un asunto").max(150),
  message: z.string().trim().min(10, "Cuéntanos un poco más (mínimo 10 caracteres)").max(3000),
  acceptPrivacy: z.literal(true, { message: "Debes aceptar la política de privacidad" }),
});

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  shippingMethod: z.enum(["recogida", "envio"]),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  postalCode: z.string().trim().max(10).optional().or(z.literal("")),
  items: z
    .array(z.object({ variantId: z.string(), quantity: z.number().int().min(1).max(20) }))
    .min(1, "El carrito está vacío"),
});

export type FormState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};
