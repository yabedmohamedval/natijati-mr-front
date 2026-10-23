# UI-1 — Fondations visuelles Natijati MR

Référence inspectée avant modification : `docs/ui-reference/natijati-redesign-reference.png`.
Le langage retenu est institutionnel : header blanc arrondi, vert profond, fond très
clair bleuté/turquoise, cartes aérées, bordures fines et ombres discrètes. Les images,
le classement et les nouvelles compositions métier de la référence sont hors UI-1.

## Audit et périmètre

- Angular 20 standalone, Angular Material 20, Tailwind 4 déjà installés.
- Inter et Tajawal déjà auto-hébergées ; aucune dépendance ni police externe ajoutée.
- Header partagé existant, avec deux listes de liens répétées ; footer présent seulement sur l’accueil.
- Couleurs, rayons, boutons et états dupliqués entre utilitaires et SCSS de pages.
- Direction gérée par `I18nService` et CDK Bidi ; métadonnées et accès au contenu déjà présents.
- Conservation des routes, modèles, API, traductions, conditions métier, validations,
  pagination, service worker et paramètres de confidentialité. Les changements des
  fichiers TypeScript métier concernent uniquement les imports des composants visuels.

## Tokens

Source : `src/styles/_tokens.scss`. Les anciens alias `--page-bg` et `--text-main`
restent compatibles. Les couleurs secondaires servent aux badges et KPI.

| Usage | Valeur |
| --- | --- |
| Vert / vert fort / fond vert | `#007f65` / `#00634f` / `#e9faf3` |
| Texte / texte secondaire | `#101936` / `#52617c` |
| Canvas / surface | `#f6f9fd` / `#ffffff` |
| Bordures de surface / de contrôle | `#dfe6f0` / `#8291a7` |
| Bleu / turquoise / violet | `#245bd7` / `#087f8c` / `#6941c6` |
| Avertissement / erreur | `#875009` / `#b42318` |
| Famille FR / AR | Inter / Tajawal, y compris Material et ses overlays |
| Échelle typographique | 12, 14, 16, 18, 24 px ; titre fluide 32–48 px |
| Espacements | 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 px |
| Rayons | 12 px petit ; 16 px contrôle ; 24 px carte ; 32 px panneau ; pilule |
| Conteneurs | 1280 px général ; 1024 px lecture ; 896 px résultat |
| Gouttière | `clamp(16px, 3vw, 32px)` |
| Ombres | `0 2px 8px / 3%`, `0 8px 28px / 5%`, `0 12px 36px / 10%` |
| Cibles tactiles | boutons Material et natifs 48 px ; liens desktop ≥ 44 px |

Contrastes calculés sur blanc : vert principal 4,97:1 ; texte secondaire 6,25:1 ;
bordure de contrôle 3,20:1. Ceci ne constitue pas un audit WCAG complet des pages.

## Primitives et composants

- `src/styles/_primitives.scss` : `.app-shell`, `.ui-page`, `.ui-container` et
  variantes, `.ui-page-title`, `.ui-page-description`, `.ui-card`,
  `.ui-card--padded`, `.ui-card--interactive`, `.ui-badge`, `.exam-badge`,
  `.stat-card` et variantes bleu/violet/turquoise, `.ui-alert` et variantes,
  `.ui-button` / `.ui-button--secondary`, `.ui-input`.
- `src/styles/_material.scss` : thème et overrides publics Material pour boutons,
  champs, selects, menus, paginator. L’ouverture du contour des labels est corrigée
  contre le reset Tailwind. Les champs ne s’étirent plus verticalement dans les grilles.
- `HeaderComponent` : liste typée unique, marque existante, actif souligné,
  langue toujours visible, menu Material avec clavier/Escape/focus restauré.
  Navigation desktop à partir de 1200 px pour laisser les six intitulés respirer ;
  menu compact à 1024 px et en dessous. Les sous-routes établissements gardent leur actif.
- `FooterComponent` : texte de transparence existant, bilingue, partagé à toutes les routes.
- `UiStateComponent` : `kind="loading|empty|error"`, message obligatoire déjà traduit,
  `announce` désactivable si la page possède une région live de chargement ; projection
  possible d’une action. Aucun chargement ni traitement d’erreur métier dans ce composant.
- `PwaStatusComponent` : habillage avec alertes et bouton natif communs ; mécanisme
  offline/mise à jour/rechargement manuel inchangé.

Exemples d’usage :

```html
<main id="main-content" tabindex="-1" class="ui-page">
  <section class="ui-container">
    <h1 class="ui-page-title">Titre traduit</h1>
    <p class="ui-page-description">Description traduite</p>
    <form class="ui-card ui-card--padded">…</form>
    <app-ui-state kind="empty" [message]="i18n.t('a11y.empty')" />
  </section>
</main>
```

Préférer les contrôles Material existants et leur thème commun. Les classes natives
sont disponibles pour les contextes légers comme la bannière PWA. Ne pas ajouter de
wrapper de formulaire qui remplacerait les bindings ou validations actuels.

## RTL et responsive

Les nouvelles règles de positionnement/espacement utilisent les propriétés logiques.
La marque latine reste isolée LTR ; les flèches de navigation conservent le miroir CDK.
Les familles Material dépendent de `--font-body` pour suivre le changement de langue.
Le focus visible, le lien d’évitement, les régions live et le mouvement réduit sont conservés.
Le header/footer et les bannières sont masqués à l’impression.

Recette reproductible sans dépendance supplémentaire :

```sh
npm run test:ci
npm run test:business
npm run build
npm run test:pwa
node tests/run-ui-checks.mjs
git diff --check
```

Le script UI utilise Node 22, Chrome (`CHROME_BIN` optionnel) et CDP. Il sert le build
sur `127.0.0.1`, utilise un profil navigateur temporaire supprimé à la fin, intercepte
les requêtes externes et fournit uniquement des données fictives. Le service worker
est exclu de cette recette visuelle et vérifié par la suite PWA dédiée.
Il génère `.angular/ui-checks/results.json` et des captures locales ignorées par Git.

Matrice : huit routes × six largeurs (320, 375, 390, 768, 1024, 1440 px) × deux langues
(FR/LTR, AR/RTL), soit 96 combinaisons. Contrôles : débordements, titre unique,
footer unique, typographie effective, menu clavier et retour du focus, direction des
overlays, états vide/erreur/chargement, bannière offline, lien d’évitement et changement
de langue sur une page déjà affichée.

## Limites de phase

La composition des pages métier est conservée. Les classes communes ont été adoptées
pour leurs cadres, titres, cartes et états ; certains détails propres aux pages gardent
leurs styles locaux pour une phase ultérieure. Pas de hero illustré, de nouveaux KPI
sur la recherche, de nouvelle donnée ou de nouvelle route. La recette navigateur utilise
Chrome desktop avec redimensionnement ; elle ne remplace pas une recette Safari/iOS,
un test sur appareil réel ou un audit complet avec lecteur d’écran.

## Fichiers créés ou modifiés

- `docs/UI-1-DESIGN-SYSTEM.md`
- `src/app/app.component.ts`
- `src/app/features/about/about.component.html`
- `src/app/features/exams/exams.component.html`
- `src/app/features/exams/exams.component.ts`
- `src/app/features/home/home.component.html`
- `src/app/features/home/home.component.scss`
- `src/app/features/institutions/institution-detail/institution-detail.component.html`
- `src/app/features/institutions/institution-detail/institution-detail.component.ts`
- `src/app/features/institutions/institution-list/institution-list.component.html`
- `src/app/features/institutions/institution-list/institution-list.component.ts`
- `src/app/features/result/result.component.html`
- `src/app/features/result/result.component.scss`
- `src/app/features/result/result.component.ts`
- `src/app/features/search/search.component.html`
- `src/app/features/search/search.component.scss`
- `src/app/features/search/search.component.ts`
- `src/app/features/statistics/statistics.component.html`
- `src/app/features/statistics/statistics.component.ts`
- `src/app/shared/components/footer/footer.component.ts`
- `src/app/shared/components/header/header.component.html`
- `src/app/shared/components/header/header.component.scss`
- `src/app/shared/components/header/header.component.spec.ts`
- `src/app/shared/components/header/header.component.ts`
- `src/app/shared/components/pwa-status/pwa-status.component.ts`
- `src/app/shared/components/ui-state/ui-state.component.spec.ts`
- `src/app/shared/components/ui-state/ui-state.component.ts`
- `src/styles.scss`
- `src/styles/_material.scss`
- `src/styles/_primitives.scss`
- `src/styles/_tokens.scss`
- `tests/run-ui-checks.mjs`

La référence PNG préexistante, non suivie dans Git au début de la phase, a été lue sans modification.

## Résultats de validation — 22 octobre 2026

| Vérification exécutée | Résultat |
| --- | --- |
| `npm run test:ci` | 45/45 tests Angular réussis, dont 3 nouveaux tests de navigation/états |
| `npm run test:business` | 16/16 régressions métier réussies |
| `npm run build` | Production réussie, aucun dépassement de budget ; bundle initial ≈ 734 kB brut |
| `npm run test:pwa` | 10/10 tests réussis (9 cache/confidentialité + 1 cycle de mise à jour) |
| `node tests/run-ui-checks.mjs` | 96/96 combinaisons réussies, plus contrôles clavier, overlays RTL, états, offline et langue |
| `git diff --check` | Réussi |

Captures FR/AR desktop et mobile inspectées visuellement dans `.angular/ui-checks/`.
La recette a notamment détecté puis permis de corriger la famille des contrôles AR
et la jointure du contour des champs affectée par le reset Tailwind.
Karma émet des avertissements 404 sur certaines URLs de polices de son serveur de tests ;
les captures et contrôles typographiques du build production utilisent les fichiers
locaux servis correctement. Aucune dépendance ajoutée. Aucun commit, push ou déploiement.
