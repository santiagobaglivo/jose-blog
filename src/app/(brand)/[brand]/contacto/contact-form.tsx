"use client";

import { useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, AlertCircle, CheckCircle2, Paperclip, X } from "lucide-react";

import { submitContactMessage } from "./actions";

const formSchema = z.object({
  fullName: z.string().trim().min(2, "Ingresá tu nombre completo").max(120),
  taxId: z
    .string()
    .trim()
    .min(8, "El RUC / CUIT debe tener al menos 8 dígitos")
    .max(20, "Máximo 20 caracteres")
    .regex(/^[0-9-]+$/, "Solo números y guiones"),
  email: z.string().trim().email("Email inválido").max(200),
  phone: z
    .string()
    .trim()
    .min(6, "Ingresá un teléfono válido")
    .max(40, "Máximo 40 caracteres"),
  subject: z.string().trim().min(1, "Elegí un asunto"),
  message: z
    .string()
    .trim()
    .min(10, "Contanos un poco más sobre tu consulta")
    .max(4000, "Máximo 4000 caracteres"),
  documentReference: z.string().trim().max(200).optional(),
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
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
    defaultValues: {
      fullName: "",
      taxId: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      documentReference: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    setServerError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("brandId", brandId);
      fd.set("fullName", values.fullName);
      fd.set("taxId", values.taxId);
      fd.set("email", values.email);
      fd.set("phone", values.phone);
      fd.set("subject", values.subject);
      fd.set("message", values.message);
      if (values.documentReference) fd.set("documentReference", values.documentReference);
      if (file) fd.set("document", file);

      const result = await submitContactMessage(fd);
      if (!result.ok) {
        setServerError(result.error);
        toast.error(result.error);
        return;
      }
      setSent(true);
      reset();
      setFile(null);
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
          podés escribirnos por WhatsApp.
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
      <h2 className="text-lg font-semibold text-foreground font-sans mb-1">
        Envíenos su consulta
      </h2>
      <p className="text-[0.8125rem] text-muted-foreground mb-6">
        Identificate y describí tu consulta. Si corresponde, adjuntá el documento que la sustenta.
      </p>

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
        <Field label="Nombre completo *" error={errors.fullName?.message}>
          <input
            type="text"
            placeholder="Ej: Juan Pérez"
            disabled={isPending}
            {...register("fullName")}
            className={inputClass}
          />
        </Field>
        <Field label="RUC / CUIT *" error={errors.taxId?.message}>
          <input
            type="text"
            inputMode="numeric"
            placeholder="20123456789"
            disabled={isPending}
            {...register("taxId")}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Field label="Email *" error={errors.email?.message}>
          <input
            type="email"
            placeholder="juan@empresa.com"
            disabled={isPending}
            {...register("email")}
            className={inputClass}
          />
        </Field>
        <Field label="Teléfono *" error={errors.phone?.message}>
          <input
            type="tel"
            placeholder="+51 999 000 000"
            disabled={isPending}
            {...register("phone")}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Asunto *" error={errors.subject?.message} className="mb-4">
        <select
          disabled={isPending}
          defaultValue=""
          {...register("subject")}
          className={`${inputClass} appearance-none`}
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
      </Field>

      <Field label="Consulta *" error={errors.message?.message} className="mb-4">
        <textarea
          rows={5}
          placeholder="Describí tu consulta. Sé concreto en qué pedís resolver."
          disabled={isPending}
          {...register("message")}
          className={`${inputClass} resize-none py-3`}
        />
      </Field>

      <div className="mb-4 rounded-lg border border-dashed border-border/60 bg-secondary/20 p-4">
        <p className="text-[0.8125rem] font-medium text-foreground mb-2">
          Documento que sustenta la consulta (opcional)
        </p>
        <Field
          label={null}
          error={errors.documentReference?.message}
          className="mb-3"
        >
          <input
            type="text"
            placeholder="Ej: Resolución SUNAT 1234/2026, Oficio 567/2025"
            disabled={isPending}
            {...register("documentReference")}
            className={inputClass}
          />
        </Field>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            setFile(f);
            e.target.value = "";
          }}
          disabled={isPending}
        />
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 h-9 px-3 text-[0.8125rem] font-medium border border-border rounded-md hover:bg-secondary/40 transition-colors disabled:opacity-60"
          >
            <Paperclip className="h-3.5 w-3.5" />
            {file ? "Cambiar archivo" : "Adjuntar archivo"}
          </button>
          {file && (
            <span className="inline-flex items-center gap-2 px-3 h-8 rounded-md bg-secondary/50 text-[0.75rem] text-foreground">
              {file.name}
              <button
                type="button"
                onClick={() => setFile(null)}
                className="text-muted-foreground hover:text-destructive"
                aria-label="Quitar archivo"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
        <p className="mt-2 text-[0.6875rem] text-muted-foreground/70">
          Formatos: PDF, Word, Excel, PNG / JPG. Máximo 10 MB.
        </p>
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

const inputClass =
  "w-full h-10 px-4 bg-secondary/30 border border-border/50 rounded-lg text-[0.8125rem] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all disabled:opacity-60";

function Field({
  label,
  error,
  children,
  className,
}: {
  label: React.ReactNode;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-[0.8125rem] font-medium text-foreground mb-1.5">
          {label}
        </label>
      )}
      {children}
      {error && <p className="mt-1 text-[0.75rem] text-destructive">{error}</p>}
    </div>
  );
}
