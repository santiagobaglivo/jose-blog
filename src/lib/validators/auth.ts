import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Ingresá tu email").email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

export const signupSchema = z
  .object({
    display_name: z
      .string()
      .trim()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(80, "El nombre no puede superar 80 caracteres"),
    email: z.string().min(1, "Ingresá tu email").email("Email inválido"),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[0-9]/, "Debe incluir al menos un número"),
    password_confirm: z.string().min(1, "Confirmá tu contraseña"),
  })
  .refine((data) => data.password === data.password_confirm, {
    path: ["password_confirm"],
    message: "Las contraseñas no coinciden",
  });

export const resetEmailSchema = z.object({
  email: z.string().min(1, "Ingresá tu email").email("Email inválido"),
});

export const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[0-9]/, "Debe incluir al menos un número"),
    password_confirm: z.string().min(1, "Confirmá tu contraseña"),
  })
  .refine((data) => data.password === data.password_confirm, {
    path: ["password_confirm"],
    message: "Las contraseñas no coinciden",
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ResetEmailInput = z.infer<typeof resetEmailSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
