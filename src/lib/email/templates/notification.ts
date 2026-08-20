export function notificationEmailTemplate({
  name,
  title,
  message,
  url,
  ctaLabel,
}: {
  name?: string | null;
  title: string;
  message: string;
  url?: string;
  ctaLabel?: string;
}) {
  const displayName = name ?? "Cher utilisateur";

  return `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="fr">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>${title}</title>
  <!--[if (gte mso 9)|(IE)]>
  <style type="text/css">
    table { border-collapse: collapse; }
    .outlook-fix { width:600px; }
  </style>
  <![endif]-->
  <style>
    body, table, td, a { font-family: Arial, Helvetica, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    p { mso-line-height-rule: exactly; }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .email-padding { padding-left: 20px !important; padding-right: 20px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f4f7fa;">
  <div style="display:none; max-height:0; overflow:hidden; mso-hide:all;">
    ${title}
  </div>
  <!--[if (gte mso 9)|(IE)]>
  <table width="600" align="center" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
  <tr><td>
  <![endif]-->
  <table role="presentation" class="email-container" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; width:100%; background-color:#ffffff; border-collapse:collapse; font-family:Arial, Helvetica, sans-serif;" bgcolor="#ffffff">
    <tr>
      <td class="email-padding" style="padding:40px 30px 20px 30px; background-color:#ffffff;">
        <h1 style="font-size:24px; font-weight:600; color:#1a2a3a; margin:0; padding:0; font-family:Arial, Helvetica, sans-serif;">${title}</h1>
      </td>
    </tr>
    <tr>
      <td class="email-padding" style="padding:0 30px;">
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <tr><td style="border-top:2px solid #e0e7ef; font-size:0; line-height:0;">&nbsp;</td></tr>
        </table>
      </td>
    </tr>
    <tr>
      <td class="email-padding" style="padding:30px 30px 20px 30px; color:#2d3748; font-size:16px; line-height:1.6; font-family:Arial, Helvetica, sans-serif; background-color:#ffffff;">
        <p style="padding:0 0 15px 0; margin:0;">Bonjour <strong>${displayName}</strong>,</p>
        <p style="padding:0 0 25px 0; margin:0;">${message}</p>

        ${url && ctaLabel ? `
        <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse; margin:0 0 25px 0;">
          <tr>
            <td align="center" style="background-color:#2563eb; padding:12px 28px; border-radius:6px;" bgcolor="#2563eb">
              <a href="${url}" style="color:#ffffff; font-weight:600; font-size:16px; text-decoration:none; display:inline-block; font-family:Arial, Helvetica, sans-serif;">${ctaLabel}</a>
            </td>
          </tr>
        </table>
        ` : ''}
      </td>
    </tr>
    <tr>
      <td class="email-padding" style="padding:20px 30px 30px 30px; background-color:#ffffff;">
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <tr><td style="border-top:1px solid #e0e7ef; font-size:0; line-height:0;">&nbsp;</td></tr>
        </table>
        <p style="padding:15px 0 0 0; margin:0; font-size:13px; color:#94a3b8; text-align:center; font-family:Arial, Helvetica, sans-serif;">© ${new Date().getFullYear()} Kinéo. Tous droits réservés.</p>
        <p style="padding:5px 0 0 0; margin:0; font-size:13px; color:#94a3b8; text-align:center; font-family:Arial, Helvetica, sans-serif;">Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
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