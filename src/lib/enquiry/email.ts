import 'server-only';

type Row = { label: string; value: string };

export const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const multiline = (value: string) => escapeHtml(value).replace(/\n/g, '<br>');

function shell(body: string, company: string) {
  return `<!doctype html><html lang="nl"><body style="margin:0;padding:0;background:#f6f7f9;font-family:Helvetica,Arial,sans-serif;color:#252b32;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7f9;"><tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff;border:1px solid #dde4ea;border-radius:16px;overflow:hidden;">
<tr><td style="background:#112b46;padding:28px 32px;color:#ffffff;">
<div style="font-size:18px;font-weight:600;letter-spacing:-0.2px;">${escapeHtml(company)}</div>
<div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#a9bdcc;margin-top:6px;">Uw veiligheid, onze verantwoordelijkheid</div>
</td></tr>
<tr><td style="padding:32px;">${body}</td></tr>
</table></td></tr></table></body></html>`;
}

function rows(items: Row[]) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #dde4ea;">${items
    .filter((item) => item.value)
    .map(
      (item) => `<tr><td style="padding:12px 0;border-bottom:1px solid #eef2f5;color:#5b6876;font-size:13px;width:38%;vertical-align:top;">${escapeHtml(item.label)}</td>
<td style="padding:12px 0;border-bottom:1px solid #eef2f5;color:#112b46;font-size:14px;vertical-align:top;">${multiline(item.value)}</td></tr>`,
    )
    .join('')}</table>`;
}

export function notificationEmail(opts: { kind: 'quote' | 'contact'; rows: Row[]; replyTo: string; company: string }) {
  const title = opts.kind === 'quote' ? 'Nieuwe offerteaanvraag' : 'Nieuw contactbericht';
  return shell(
    `<p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#6e91ac;">${title}</p>
<h1 style="margin:0 0 24px;font-size:24px;line-height:1.25;color:#112b46;">${escapeHtml(opts.rows.find((row) => row.label === 'Naam')?.value ?? '')}</h1>
${rows(opts.rows)}
<p style="margin:28px 0 0;"><a href="mailto:${escapeHtml(opts.replyTo)}" style="display:inline-block;background:#112b46;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:999px;font-size:14px;">Beantwoorden</a></p>
<p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#5b6876;">Deze aanvraag is alleen per e-mail verstuurd en wordt nergens anders bewaard. Bewaar deze e-mail zolang u de gegevens nodig heeft.</p>`,
    opts.company,
  );
}

export function confirmationEmail(opts: { kind: 'quote' | 'contact'; name: string; rows: Row[]; company: string }) {
  const intro =
    opts.kind === 'quote'
      ? 'Bedankt voor uw offerteaanvraag. Wij hebben uw aanvraag ontvangen en nemen zo snel mogelijk contact met u op om de mogelijkheden te bespreken.'
      : 'Bedankt voor uw bericht. Wij hebben het ontvangen en nemen zo snel mogelijk contact met u op.';
  return shell(
    `<h1 style="margin:0 0 18px;font-size:24px;line-height:1.25;color:#112b46;">Beste ${escapeHtml(opts.name)},</h1>
<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#5b6876;">${intro}</p>
<p style="margin:0 0 10px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#6e91ac;">Uw gegevens</p>
${rows(opts.rows)}
<p style="margin:28px 0 0;font-size:14px;line-height:1.6;color:#5b6876;">Met vriendelijke groet,<br><strong style="color:#112b46;">${escapeHtml(opts.company)}</strong></p>`,
    opts.company,
  );
}
