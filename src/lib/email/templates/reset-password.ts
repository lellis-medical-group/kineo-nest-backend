export function resetPasswordEmailTemplate({
  name,
  url,
}: {
  name?: string | null;
  url: string;
}) {
  const displayName = name ?? "Cher utilisateur";

  return `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Réinitialisation du mot de passe</title>
  <!--[if (gte mso 9)|(IE)]>
  <style type="text/css">
    table { border-collapse: collapse; }
    .outlook-fix { width:600px; }
  </style>
  <![endif]-->
</head>
<body style="margin:0; padding:0; background-color:#f4f7fa;">
  <!--[if (gte mso 9)|(IE)]>
  <table width="600" align="center" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
  <tr><td>
  <![endif]-->
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; width:100%; background-color:#ffffff; border-collapse:collapse;" bgcolor="#ffffff">
    <tr>
      <td style="padding:40px 30px 20px 30px; background-color:#ffffff;">
        <h1 style="font-size:24px; font-weight:600; color:#1a2a3a; margin:0; padding:0;">Réinitialisation du mot de passe</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:0 30px;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <tr><td style="border-top:2px solid #e0e7ef; font-size:0; line-height:0;">&nbsp;</td></tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:30px 30px 20px 30px; color:#2d3748; font-size:16px; line-height:1.6; background-color:#ffffff;">
        <p style="padding:0 0 15px 0; margin:0;">Bonjour <strong>${displayName}</strong>,</p>
        <p style="padding:0 0 15px 0; margin:0;">Nous avons reçu une demande de réinitialisation de votre mot de passe pour votre compte.</p>
        <p style="padding:0 0 25px 0; margin:0;">Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>

        <!-- Bouton -->
        <table align="center" border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse; padding:0 0 25px 0;">
          <tr>
            <td align="center" style="background-color:#2563eb; padding:12px 28px;" bgcolor="#2563eb">
              <a href="${url}" style="color:#ffffff; font-weight:600; font-size:16px; text-decoration:none; display:inline-block;">Réinitialiser mon mot de passe</a>
            </td>
          </tr>
        </table>

        <p style="padding:0 0 15px 0; margin:0; font-size:14px; color:#64748b;">Ce lien est valable 1 heure.</p>
        <p style="padding:0 0 5px 0; margin:0; font-size:14px; color:#64748b;"><strong>Si vous n’êtes pas à l’origine de cette demande</strong>, ignorez simplement cet email.</p>
        <p style="padding:0; margin:0; font-size:14px; color:#64748b;">Pour toute question, contactez notre support.</p>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 30px 30px 30px; background-color:#ffffff;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <tr><td style="border-top:1px solid #e0e7ef; font-size:0; line-height:0;">&nbsp;</td></tr>
        </table>
        <p style="padding:15px 0 0 0; margin:0; font-size:13px; color:#94a3b8; text-align:center;">© ${new Date().getFullYear()} Kinéo. Tous droits réservés.</p>
        <p style="padding:5px 0 0 0; margin:0; font-size:13px; color:#94a3b8; text-align:center;">Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
      </td>
    </tr>
  </table>
  <!--[if (gte mso 9)|(IE)]>
  </td></tr></table>
  <![endif]-->
</body>
</html>
  `;
}