import { z } from 'zod';
import { isValidDay } from '@/lib/availability';

export const OTHER_SERVICE = 'Combinatie of anders';

const text = (min: number, max: number, message: string) =>
  z
    .string({ error: message })
    .trim()
    .min(min, message)
    .max(max, `Gebruik maximaal ${max} tekens.`);

const phonePattern = /^[+()\d\s-]{8,20}$/;

const meta = {
  website: z.string().max(200).optional().default(''), // honeypot: must stay empty
  startedAt: z.number().int().nonnegative(),
  token: z.uuid({ error: 'Ongeldige aanvraag. Vernieuw de pagina en probeer het opnieuw.' }),
  consent: z.literal(true, { error: 'Geef toestemming om uw gegevens te verwerken.' }),
};

export const quoteFields = {
  service: text(2, 120, 'Kies de gewenste beveiligingsdienst.'),
  location: text(2, 200, 'Vul de locatie van de opdracht in.'),
  preferredDate: z
    .string()
    .trim()
    .refine((value) => value === '' || isValidDay(value), 'Kies een geldige datum.')
    .optional()
    .default(''),
  message: text(10, 5000, 'Omschrijf uw aanvraag in minimaal 10 tekens.'),
  company: text(2, 160, 'Vul de bedrijfsnaam in.'),
  name: text(2, 120, 'Vul de naam van de contactpersoon in.'),
  email: z.email({ error: 'Vul een geldig e-mailadres in.' }).max(254),
  phone: z
    .string()
    .trim()
    .regex(phonePattern, 'Vul een geldig telefoonnummer in.'),
};

export const quoteSchema = z.object({ ...quoteFields, ...meta });

export const contactSchema = z.object({
  name: text(2, 120, 'Vul uw naam in.'),
  company: z.string().trim().max(160, 'Gebruik maximaal 160 tekens.').optional().default(''),
  email: z.email({ error: 'Vul een geldig e-mailadres in.' }).max(254),
  phone: z
    .string()
    .trim()
    .refine((value) => value === '' || phonePattern.test(value), 'Vul een geldig telefoonnummer in.')
    .optional()
    .default(''),
  message: text(10, 5000, 'Schrijf een bericht van minimaal 10 tekens.'),
  ...meta,
});

export type QuoteInput = z.infer<typeof quoteSchema>;
export type ContactInput = z.infer<typeof contactSchema>;

export type FieldErrors = Partial<Record<string, string>>;

export function fieldErrors(error: z.ZodError): FieldErrors {
  const result: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form');
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}

/** Minimum time a person realistically needs to fill in a form; faster submissions are bots. */
export const MIN_FILL_MS = 3000;
