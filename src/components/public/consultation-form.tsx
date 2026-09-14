"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Check, ShieldCheck } from "lucide-react";
import {
  cloneElement,
  useState,
  type MouseEvent,
  type ReactElement,
} from "react";
import { useForm, type FieldPath } from "react-hook-form";

import { practiceAreas } from "@/content/practice-areas";
import {
  consultationContactStepSchema,
  consultationMatterStepSchema,
  publicConsultationSchema,
  type PublicConsultationInput,
} from "@/lib/validation/public-forms";

export function ConsultationForm() {
  const [step, setStep] = useState(1);
  const [notice, setNotice] = useState("");
  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PublicConsultationInput>({
    resolver: zodResolver(publicConsultationSchema),
    mode: "onTouched",
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      practiceArea: "",
      service: "",
      description: "",
      preferredContactMethod: "email",
      preferredDate: "",
      preferredTime: "",
      privacyConsent: false,
      website: "",
    },
  });

  function nextStep(event: MouseEvent<HTMLButtonElement>) {
    clearErrors();
    const formData = new FormData(event.currentTarget.form!);
    const result =
      step === 1
        ? consultationContactStepSchema.safeParse({
            fullName: formData.get("fullName"),
            email: formData.get("email"),
            phone: formData.get("phone"),
          })
        : consultationMatterStepSchema.safeParse({
            practiceArea: formData.get("practiceArea"),
            service: formData.get("service"),
            description: formData.get("description"),
          });

    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0] as FieldPath<PublicConsultationInput>;
        setError(field, { type: "manual", message: issue.message });
      }
      return;
    }
    setStep((value) => Math.min(3, value + 1));
  }

  function onSubmit() {
    setNotice(
      "La información fue validada en este dispositivo, pero no se envió. El envío seguro se habilitará en la siguiente fase.",
    );
  }

  return (
    <form
      className="public-form consultation-form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <div className="stepper" aria-label={`Paso ${step} de 3`}>
        {[1, 2, 3].map((number) => (
          <span key={number} className={number <= step ? "is-active" : ""}>
            <b>
              {number < step ? <Check size={15} aria-hidden="true" /> : number}
            </b>
            {number === 1
              ? "Contacto"
              : number === 2
                ? "Situación"
                : "Preferencias"}
          </span>
        ))}
      </div>

      <div className="sr-only" aria-live="polite">
        Paso {step} de 3
      </div>

      {step === 1 ? (
        <fieldset>
          <legend>Información de contacto</legend>
          <div className="form-grid">
            <Field
              label="Nombre completo"
              error={errors.fullName?.message}
              required
            >
              <input autoComplete="name" {...register("fullName")} />
            </Field>
            <Field label="Correo electrónico" error={errors.email?.message}>
              <input type="email" autoComplete="email" {...register("email")} />
            </Field>
            <Field label="Teléfono" error={errors.phone?.message}>
              <input type="tel" autoComplete="tel" {...register("phone")} />
            </Field>
          </div>
          <p className="form-hint">
            Ingrese al menos un correo electrónico o teléfono.
          </p>
        </fieldset>
      ) : null}

      {step === 2 ? (
        <fieldset>
          <legend>Área, servicio y descripción</legend>
          <div className="form-grid">
            <Field
              label="Área de práctica"
              error={errors.practiceArea?.message}
              required
            >
              <select {...register("practiceArea")} defaultValue="">
                <option value="" disabled>
                  Seleccione una opción
                </option>
                {practiceAreas.map((area) => (
                  <option key={area.slug} value={area.slug}>
                    {area.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Servicio de interés" error={errors.service?.message}>
              <input {...register("service")} placeholder="Si ya lo conoce" />
            </Field>
            <Field
              label="Descripción general"
              error={errors.description?.message}
              required
              full
            >
              <textarea rows={7} {...register("description")} />
            </Field>
          </div>
        </fieldset>
      ) : null}

      {step === 3 ? (
        <fieldset>
          <legend>Preferencias de contacto</legend>
          <div className="form-grid">
            <Field
              label="Método preferido"
              error={errors.preferredContactMethod?.message}
              required
            >
              <select {...register("preferredContactMethod")}>
                <option value="email">Correo electrónico</option>
                <option value="phone">Llamada telefónica</option>
              </select>
            </Field>
            <Field
              label="Fecha preferida"
              error={errors.preferredDate?.message}
            >
              <input type="date" {...register("preferredDate")} />
            </Field>
            <Field
              label="Horario preferido"
              error={errors.preferredTime?.message}
            >
              <select {...register("preferredTime")}>
                <option value="">Sin preferencia</option>
                <option value="morning">Por la mañana</option>
                <option value="afternoon">Por la tarde</option>
              </select>
            </Field>
          </div>
          <label className="checkbox-field">
            <input type="checkbox" {...register("privacyConsent")} />
            <span>
              He leído el aviso de privacidad y autorizo la validación local de
              estos datos.
            </span>
          </label>
          {errors.privacyConsent ? (
            <p className="field-error" role="alert">
              {errors.privacyConsent.message}
            </p>
          ) : null}
          <input
            className="honeypot"
            tabIndex={-1}
            autoComplete="off"
            {...register("website")}
          />
        </fieldset>
      ) : null}

      {notice ? (
        <div className="form-stage-notice" role="status">
          <ShieldCheck aria-hidden="true" />
          {notice}
        </div>
      ) : null}

      <div className="form-actions">
        {step > 1 ? (
          <button
            className="button button--outline"
            type="button"
            onClick={() => setStep((value) => value - 1)}
          >
            <ArrowLeft size={18} aria-hidden="true" />
            Atrás
          </button>
        ) : (
          <span />
        )}
        {step < 3 ? (
          <button
            className="button button--navy"
            type="button"
            onClick={nextStep}
          >
            Continuar
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        ) : (
          <button
            className="button button--navy"
            type="submit"
            disabled={isSubmitting}
          >
            Validar solicitud
            <Check size={18} aria-hidden="true" />
          </button>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  required,
  full,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  full?: boolean;
  children: ReactElement<{
    id?: string;
    "aria-invalid"?: boolean;
    "aria-describedby"?: string;
  }>;
}) {
  const id =
    children.props.id ?? `field-${label.toLowerCase().replaceAll(" ", "-")}`;
  return (
    <label
      className={`form-field${full ? " form-field--full" : ""}`}
      htmlFor={id}
    >
      <span>
        {label}
        {required ? <i aria-hidden="true"> *</i> : null}
      </span>
      {cloneElement(children, {
        id,
        "aria-invalid": Boolean(error),
        "aria-describedby": error ? `${id}-error` : undefined,
      })}
      <small
        className={`field-error${error ? "" : " field-error--empty"}`}
        id={`${id}-error`}
        role={error ? "alert" : undefined}
        aria-hidden={error ? undefined : true}
      >
        {error ?? "Sin error"}
      </small>
    </label>
  );
}
