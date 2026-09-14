"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  publicContactSchema,
  type PublicContactInput,
} from "@/lib/validation/public-forms";

export function ContactForm() {
  const [notice, setNotice] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PublicContactInput>({
    resolver: zodResolver(publicContactSchema),
    defaultValues: {
      fullName: "",
      email: "",
      subject: "",
      message: "",
      privacyConsent: false,
      website: "",
    },
  });

  return (
    <form
      className="public-form contact-form"
      noValidate
      onSubmit={handleSubmit(() =>
        setNotice(
          "El bufete aún no ha recibido este mensaje. Revise la información ingresada antes de continuar por un canal oficial.",
        ),
      )}
    >
      <div className="form-grid">
        <label className="form-field">
          <span>Nombre completo</span>
          <input
            autoComplete="name"
            aria-invalid={Boolean(errors.fullName)}
            {...register("fullName")}
          />
          {errors.fullName ? (
            <small className="field-error" role="alert">
              {errors.fullName.message}
            </small>
          ) : null}
        </label>
        <label className="form-field">
          <span>Correo electrónico</span>
          <input
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
          {errors.email ? (
            <small className="field-error" role="alert">
              {errors.email.message}
            </small>
          ) : null}
        </label>
        <label className="form-field form-field--full">
          <span>Asunto</span>
          <input
            aria-invalid={Boolean(errors.subject)}
            {...register("subject")}
          />
          {errors.subject ? (
            <small className="field-error" role="alert">
              {errors.subject.message}
            </small>
          ) : null}
        </label>
        <label className="form-field form-field--full">
          <span>Mensaje</span>
          <textarea
            rows={7}
            aria-invalid={Boolean(errors.message)}
            {...register("message")}
          />
          {errors.message ? (
            <small className="field-error" role="alert">
              {errors.message.message}
            </small>
          ) : null}
        </label>
      </div>
      <label className="checkbox-field">
        <input type="checkbox" {...register("privacyConsent")} />
        <span>He leído el aviso de privacidad.</span>
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
      <button className="button button--navy" type="submit">
        Revisar mensaje
      </button>
      {notice ? (
        <div className="form-stage-notice" role="status">
          <ShieldCheck aria-hidden="true" />
          {notice}
        </div>
      ) : null}
    </form>
  );
}
