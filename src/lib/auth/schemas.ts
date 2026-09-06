import { z } from "zod";

/**
 * Schémas de validation des champs d'entrée gérés par better-auth.
 *
 * better-auth ne valide nativement que le format de l'email et les longueurs
 * min/max du mot de passe. Ces schémas sont appliqués en amont par le hook
 * `before` de `src/lib/auth.ts` sur les endpoints acceptant une entrée
 * utilisateur (`/sign-up/email`, `/update-user`).
 */

/**
 * Nom affiché de l'utilisateur.
 *
 * Lettres Unicode (accents inclus), espaces, apostrophes et tirets
 * uniquement : pas de chiffres, d'emoji ni de caractères de contrôle.
 * La valeur est normalisée (trim) avant d'être persistée.
 */
export const nameSchema = z
  .string()
  .trim()
  .min(1)
  .max(50)
  .regex(/^[\p{L}\s'-]+$/u);

/**
 * URL d'image de profil.
 *
 * HTTPS strict : aucun `http:`, `data:`, `javascript:` ni URL relative, afin
 * d'éviter les contenus mixtes et les injections via l'attribut `src`.
 *
 * `z.url({ protocol: /^https$/ })` (Zod v4) est strictement équivalent à
 * `z.string().url().refine((url) => url.startsWith("https://"))`.
 */
export const httpsImageUrlSchema = z.url({ protocol: /^https$/ });

/**
 * Mot de passe en clair.
 *
 * Les bornes doivent rester synchronisées avec
 * `emailAndPassword.minPasswordLength` / `maxPasswordLength`
 * de `src/lib/auth.ts`.
 */
export const passwordSchema = z.string().min(8).max(128);
