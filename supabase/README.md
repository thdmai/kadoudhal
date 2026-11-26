# Supabase — Kadoudhal

## 1. Créer le projet

1. Va sur [supabase.com](https://supabase.com) → **New project**
2. Note l’**URL** du projet et la clé **anon** (Settings → API)

## 2. Activer l’auth email

1. Dashboard Supabase → ton projet
2. Menu gauche : **Authentication** (icône cadenas / utilisateurs)
3. **Sign In / Providers** (parfois juste **Providers**)
4. Clique sur **Email**
5. Active **Enable Email provider**
6. Plus bas : **Confirm email** (sous *User Signups*) — laisse **ON** en prod

En local uniquement, tu peux le couper pour tester sans attendre l’email.

## 3. Exécuter le schéma

1. Ouvre **SQL Editor**
2. Colle tout le contenu de `schema.sql`
3. Clique **Run**

Le script **supprime puis recrée** `profiles`, `home_blocks`, `sections` et `tracks`.
C’est voulu en début de projet : une ancienne table `profiles` avec `id bigint`
provoquait `operator does not exist: bigint = uuid`.

Si tu as déjà des utilisateurs dans Auth, leurs lignes `profiles` seront recréées
au prochain login seulement si tu les réinsères, ou en te réinscrivant.

Tu obtiens :

- `profiles` (rôle, soft delete)
- `home_blocks` (blocs d’accueil, slug libre)
- `sections` / `tracks` (listes + audio)
- RLS (accueil public, contenu réservé aux comptes actifs, admin pour écrire)
- buckets Storage `audio` + `home-images` (public)

Si ta base existait déjà avant les slugs libres / images, lance aussi
`home-blocks-v2.sql` une fois (sans tout recréer).

Pour les plafonds d’upload configurables (Réglages admin), lance
`site-settings.sql` une fois.

## 4. Premier admin (automatique)

Le **premier compte** (aucun admin actif) devient **admin** tout seul
à l’inscription. Ensuite, depuis `/admin` → **Utilisateurs**, cet admin
peut nommer ou retirer d’autres admins.

Si tu as déjà lancé un ancien `schema.sql` (sans cette logique), ou après
un reset qui a vidé `profiles`, lance **une fois** :

`bootstrap-first-admin.sql`

Ça recrée les profils manquants et donne admin au compte le plus ancien
s’il n’y a encore aucun admin. Puis reconnecte-toi.

Si le schéma a déjà été appliqué sans la garde anti self-promote,
lance aussi `admin-guards.sql` une fois.

## 5. Si tu vois `permission denied for table profiles`

Le rôle `authenticated` n’a pas le droit d’écrire. Lance
`fix-profiles-grants.sql` dans le SQL Editor (sans tout recréer).

## 6. Variables Next.js

Dans `web/.env.local` (copie depuis `web/env.example`) :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Puis relance `npm run dev`.

Ne mets jamais la **service_role** clé dans le navigateur ni dans l’image Docker.

## 7. Email de confirmation (URLs)

**Confirm email** n’est **pas** dans Settings généraux. Chemin actuel :

`Authentication` → `Sign In / Providers` → `Email` → toggle **Confirm email** (ON)

Puis les URLs :

`Authentication` → `URL Configuration` (ou **Redirect URLs**) :

- Site URL : `http://localhost:3000`
- Redirect URLs : `http://localhost:3000/auth/callback`

Sans ça, le lien reçu par email ne ramène pas correctement sur l’app.

Si tu ne vois toujours pas **Confirm email** : cherche aussi
`Authentication` → `Providers` → carte **Email** → ouvre le panneau.

## 7bis. Connexion Google (optionnel)

1. Authentication → Providers → **Google** → activé
2. Client ID / Secret depuis Google Cloud Console
3. Redirect URI Google : `https://<projet>.supabase.co/auth/v1/callback`
4. Redirect URLs Supabase : `http://localhost:3000/auth/callback`

## 8. SMTP personnalisé (Gmail) — obligatoire pour un vrai envoi

Par défaut Supabase envoie depuis `noreply@mail.app.supabase.io` (limité).
Pour envoyer **depuis ton adresse** avec un mail Kadoudhal :

### 8.1 Mot de passe d’application Google

1. Compte Google de `hamanankethd9188@gmail.com` (corrige `ggmail` → `gmail`)
2. Active la **validation en 2 étapes**
3. Crée un **mot de passe d’application** :
   [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
4. Nom : `Kadoudhal Supabase` → copie le mot de passe à 16 caractères

### 8.2 Brancher SMTP dans Supabase

**Pas** dans Project Settings (l’engrenage). Va dans **Authentication** :

1. Barre d’icônes tout à gauche → icône **Authentication** (pas Settings)
2. Dans le menu Auth → **Emails** (ou **SMTP**)
3. Section **SMTP Settings** → active **Enable custom SMTP**

Valeurs :

| Champ | Valeur |
|---|---|
| Enable custom SMTP | ON |
| Sender email | `hamanankethd9188@gmail.com` |
| Sender name | `Kadoudhal` |
| Host | `smtp.gmail.com` |
| Port | `587` |
| Username | `hamanankethd9188@gmail.com` |
| Password | le mot de passe d’application (pas ton mot de passe Gmail) |

Enregistre, puis teste avec une inscription ou « Mot de passe oublié ».

### 8.3 Templates d’email personnalisés

Authentication → **Email Templates** — remplace le HTML par les fichiers du dossier
`supabase/email-templates/` :

| Template Supabase | Fichier | Objet suggéré |
|---|---|---|
| Confirm signup | `confirm-signup.html` | `Confirme ton email — Kadoudhal` |
| Reset password | `reset-password.html` | `Réinitialiser ton mot de passe — Kadoudhal` |
| Change email address | `change-email.html` | `Confirmer le nouvel email — Kadoudhal` |

Garde les variables `{{ .ConfirmationURL }}` telles quelles.
Après ça, l’expéditeur est ton Gmail et le contenu est aux couleurs Kadoudhal.
