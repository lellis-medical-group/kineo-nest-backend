import { sendEmail } from "./mailer";
import { verificationEmailTemplate } from "./templates/verification";
import { resetPasswordEmailTemplate } from "./templates/reset-password";

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