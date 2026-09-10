import { sendEmail } from "./mailer";
import { notificationEmailTemplate } from "./templates/notification";
import { resetPasswordEmailTemplate } from "./templates/reset-password";
import { verificationEmailTemplate } from "./templates/verification";

export async function sendVerificationEmail({
  email,
  name,
  url,
}: {
  email: string;
  name?: string | null;
  url: string;
}) {
  return sendEmail({
    to: email,
    subject: "Vérifiez votre adresse email",
    html: verificationEmailTemplate({
      name,
      url,
    }),
  });
}

export async function sendResetPasswordEmail({
  email,
  name,
  url,
}: {
  email: string;
  name?: string | null;
  url: string;
}) {
  return sendEmail({
    to: email,
    subject: "Réinitialisation de votre mot de passe",
    html: resetPasswordEmailTemplate({
      name,
      url,
    }),
  });
}

export async function sendChangeEmailEmail({
  email,
  name,
  url,
}: {
  email: string;
  name?: string | null;
  url: string;
}) {
  return sendNotificationEmail({
    email,
    name,
    subject: "Confirmez votre nouvelle adresse email",
    title: "Changement d'adresse email",
    message:
      "Une demande de changement d'adresse email a été effectuée sur votre compte. Confirmez cette adresse via le bouton ci-dessous pour l'appliquer. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email et votre adresse actuelle restera inchangée.",
    url,
    ctaLabel: "Confirmer ma nouvelle adresse",
  });
}

export async function sendDeleteAccountEmail({
  email,
  name,
  url,
}: {
  email: string;
  name?: string | null;
  url: string;
}) {
  return sendNotificationEmail({
    email,
    name,
    subject: "Suppression de votre compte",
    title: "Suppression de votre compte",
    message:
      "Vous avez demandé la suppression définitive de votre compte et de vos données. Ce lien est valable 24 heures. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.",
    url,
    ctaLabel: "Supprimer mon compte",
  });
}

export async function sendNotificationEmail({
  email,
  name,
  subject,
  title,
  message,
  url,
  ctaLabel,
}: {
  email: string;
  name?: string | null;
  subject: string;
  title: string;
  message: string;
  url?: string;
  ctaLabel?: string;
}) {
  return sendEmail({
    to: email,
    subject,
    html: notificationEmailTemplate({ name, title, message, url, ctaLabel }),
  });
}
