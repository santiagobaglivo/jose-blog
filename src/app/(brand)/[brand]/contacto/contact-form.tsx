"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

import { submitContactMessage } from "./actions";

const formSchema = z.object({
  fullName: z.string().trim().min(2, "Ingresá tu nombre").max(120),
  email: z.string().trim().email("Email inválido").max(200),
  phone: z.string().trim().max(40).optional(),
  subject: z.string().trim().min(1, "Elegí un asunto"),
  message: z.string().trim().min(10, "Contanos al menos un poco sobre tu consulta").max(4000),
});
type FormValues = z.infer<typeof formSchema>;

const SUBJECTS = [
  "Asesoría impositiva",
  "Contabilidad",
  "Consultoría empresarial",
  "Laboral & RRHH",
  "Otro",
];

export function ContactForm({ brandId }: { brandId: string }) {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { fullName: "", email: "", phone: "", subject: "", message: "" },
  });

  const onSubmit = (values: FormValues) => {
    setServerError(null);
    startTransition(async () => {
      const result = await submitContactMessage({ brandId, ...values });
      if (!result.ok) {
        setServerError(result.error);
        toast.error(result.error);
        return;
      }
      setSent(true);
      reset();
      toast.success("¡Consulta enviada! Te respondemos a la brevedad.");
    });
  };

  if (sent) {
    return (
      <div className="bg-card border border-border/50 rounded-xl p-8 flex flex-col items-center text-center">
        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Consulta recibida</h2>
        <p className="mt-2 text-[0.875rem] text-muted-foreground max-w-md">
          Te respondemos a tu email en las próximas 24 horas hábiles. Si la consulta es urgente,
          podés escribirnos por WhatsApp desde el botón flotante.
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-6 h-9 px-4 text-[0.8125rem] font-medium border border-border rounded-md hover:bg-secondary/40 transition-colors"
        >
          Enviar otra consulta
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="bg-card border border-border/50 rounded-xl p-8"
    >
      <h2 className="text-lg font-semibold text-foreground font-sans mb-6">Envíenos su consulta</h2>

      {serverError && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-[0.8125rem] text-destructive"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label
            htmlFor="fullName"
            className="block text-[0.8125rem] font-medium text-foreground mb-1.5"
          >
            Nombre completo
          </label>
          <input
            id="fullName"
            type="text"
            placeholder="Ej: Juan Pérez"
            disabled={isPending}
            {...register("fullName")}
            className="w-full h-10 px-4 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all disabled:opacity-60"
          />
          {errors.fullName && (
            <p className="mt-1 text-[0.75rem] text-destructive">{errors.fullName.message}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-[0.8125rem] font-medium text-foreground mb-1.5"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="juan@empresa.com"
            disabled={isPending}
            {...register("email")}
            className="w-full h-10 px-4 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all disabled:opacity-60"
          />
          {errors.email && (
            <p className="mt-1 text-[0.75rem] text-destructive">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="mb-4">
        <label
          htmlFor="phone"
          className="block text-[0.8125rem] font-medium text-foreground mb-1.5"
        >
          Teléfono (opcional)
        </label>
        <input
          id="phone"
          type="tel"
          placeholder="+54 11 1234-5678"
          disabled={isPending}
          {...register("phone")}
          className="w-full h-10 px-4 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all disabled:opacity-60"
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="subject"
          className="block text-[0.8125rem] font-medium text-foreground mb-1.5"
        >
          Asunto
        </label>
        <select
          id="subject"
          disabled={isPending}
          defaultValue=""
          {...register("subject")}
          className="w-full h-10 px-4 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all appearance-none disabled:opacity-60"
        >
          <option value="" disabled>
            Seleccione un área
          </option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {errors.subject && (
          <p className="mt-1 text-[0.75rem] text-destructive">{errors.subject.message}</p>
        )}
      </div>

      <div className="mb-6">
        <label
          htmlFor="message"
          className="block text-[0.8125rem] font-medium text-foreground mb-1.5"
        >
          Mensaje
        </label>
        <textarea
          id="message"
          rows={5}
          placeholder="Describa brevemente su consulta..."
          disabled={isPending}
          {...register("message")}
          className="w-full px-4 py-3 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all resize-none disabled:opacity-60"
        />
        {errors.message && (
          <p className="mt-1 text-[0.75rem] text-destructive">{errors.message.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="h-11 px-6 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground text-[0.875rem] font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Enviando…
          </>
        ) : (
          "Enviar consulta"
        )}
      </button>
    </form>
  );
}
