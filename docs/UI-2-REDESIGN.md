# UI-2 — Redesign des pages principales

## Périmètre et référence

La référence `docs/ui-reference/natijati-redesign-reference.png` a été ouverte et
inspectée avant modification, puis `docs/UI-1-DESIGN-SYSTEM.md` a été relu.
UI-1 est conservée comme fondation : aucun changement de tokens, de thème global,
de header, de footer ou de composant d’état. Aucune dépendance supplémentaire.

L’état Git initial contenait les changements UI-1 non commités. Une copie de référence
locale a permis de comparer UI-2 à cet état, et pas seulement à HEAD. Les fichiers des
pages Examens, établissements et À propos n’ont reçu **aucune modification UI-2**.
Les services, modèles, routes, traductions, configuration SEO, service worker et
règles de cache/confidentialité restent identiques à l’état validé UI-1.

## Changements par page

### Accueil

- Hero centrée sur le service : résultats des examens nationaux en Mauritanie.
- Formulaire directement accessible, avec les trois cartes d’examen.
- Année/session issues exclusivement du catalogue publié ; comportement de sélection
  de la dernière session et navigation historique conservés.
- Libellé candidat/dossier piloté par l’examen, validation numérique et description conservées.
- Disponibilité et nombre de résultats de la **session sélectionnée** issus du catalogue.
- Suppression de l’affichage statique « +100 000 candidats » ; aucun KPI global inventé.
- Indications de service sobres sous le formulaire ; accès à la recherche avancée sur desktop.

### Recherche avancée

- Titre/contexte, cartes BAC/BEPC/C1AS, année/session, critères puis actions distinctes.
- Même FormGroup, mêmes valeurs et mêmes requêtes. Le sélecteur visuel met à jour le
  contrôle `examType` existant ; il ne lance pas de requête supplémentaire.
- Le champ série n’est pas présenté pour C1AS lorsqu’il est vide. S’il contient déjà
  un critère, il reste visible pour permettre de le modifier/effacer : aucun filtre
  actif n’est masqué, supprimé ou transformé silencieusement.
- Compteur exclusivement basé sur `totalElements`, pagination Material inchangée.
- Lignes de résultats structurées : examen/année/session, identifiant adapté, nom,
  établissement, wilaya, score et décision uniquement si fournie.
- Aucun tri ajouté : il n’existe pas dans le contrat actuel. Aucune série ajoutée aux
  lignes : `SearchResultItem` ne fournit pas ce champ. Aucun rang ni KPI agrégé inventé.
- C1AS affiche un total sans `/20`. Les noms ne sont pas inclus dans une région live.

### Résultat candidat

- Fiche claire avec liseré institutionnel, contexte, identité, résultat principal et détails.
- Numéro de dossier C1AS conservé, total sans `/20`, décision absente omise.
- Série et centre affichés uniquement si une traduction de la donnée est disponible.
- Les valeurs manquantes de score restent `—` ; aucune substitution par zéro.
- Noms isolés avec `dir="auto"` ; chiffres isolés LTR ; grille de détails sémantique `dl`.
- Pas de badge suggérant une certification ajoutée. Le footer d’indépendance UI-1 reste présent.
- États loading/404/erreur/session invalide et annulation lors du changement de route
  utilisent les comportements existants. Aucun nom ajouté au SEO ou au cache.

### Statistiques

- Filtres en panneau commun, contexte du résultat issu de la réponse API.
- Cinq cartes KPI existantes : candidats, admis, réussite, moyenne, sessionnaires.
- Pour C1AS, la moyenne est explicitement contextualisée comme moyenne du total,
  sans inventer un maximum ni transformer la valeur reçue.
- Icônes, fonds teintés et chiffres lisibles ; zéro conservé, moyenne absente `—`.
- Répartitions wilaya/série en listes avec barres et textes accessibles. Comptages et
  pourcentages proviennent directement de l’API ; aucune évolution calculée.
- État vide pour les répartitions absentes et feedback API conservé.

## Composant partagé ajouté

`ExamSelectorComponent` est nécessaire à l’accueil et à la recherche pour partager
les mêmes cartes et éviter deux implémentations divergentes. Il utilise exclusivement
les tokens UI-1 et les traductions existantes. API : `selected` / `selectedChange`.
Boutons natifs `type="button"`, groupe nommé, `aria-pressed`, focus visible et clavier
natif. Aucun appel API, aucune session et aucune logique métier dans ce composant.

## Tests et recette

Tests ajoutés :

- 2 tests du sélecteur : état sélectionné/émission, libellés arabes et absence de soumission implicite.
- 1 test accueil : compteur de session réel et absence de l’ancien KPI statique.
- 1 test recherche : sélection C1AS, soumission, unité du score, décision absente et reset.
- 3 tests résultat BAC/BEPC/C1AS : unités, données optionnelles absentes, absence de nom dans les régions live.
- 2 tests statistiques : zéro/null/contexte/vides et restitution des distributions API.

Les tests métier existants n’ont pas été remplacés. Les tests de présentation ont été
ajoutés aux suites existantes, plus deux nouveaux fichiers de spécification.

Recette navigateur : `node tests/run-ui-checks.mjs`, après `npm run build`.
ChromeHeadless local, profil temporaire, serveur `127.0.0.1`, toutes les requêtes
externes interceptées avec des fixtures exclusivement dans le script de test.
Aucune connexion à l’API de production et aucune modification de données.

Matrice : 12 routes/variantes × 6 largeurs × 2 langues = 144 combinaisons,
dont 96 UI-2 et 48 de non-régression UI-1/UI-3. Largeurs : 320, 375, 390, 768,
1024 et 1440 px. FR/LTR et AR/RTL. Les variantes incluent recherche et fiche candidat
BAC, BEPC et C1AS. Noms et établissements longs, distributions longues bilingues.
Les contrôles complémentaires couvrent clavier, sélection d’examen, navigation dossier,
noindex, états vide/erreur/chargement/404, session invalide sans requête API, overlays,
retour du focus du menu, offline, lien d’évitement et changement de langue.

Captures et rapport générés dans `.angular/ui2-checks/` (ignorés par Git).
Les captures du menu utilisent la fenêtre visible pour éviter que le redimensionnement
interne d’une capture pleine page ne ferme le menu pendant le contrôle du focus.

## Limites pour UI-3

- Examens/archives, liste et détail établissement, À propos : compositions UI-1 conservées.
- Les années proposées par recherche/statistiques restent les options préexistantes ;
  l’accueil utilise le catalogue réel, sans nouveau contrat API.
- Pas de tri serveur, de rang, de matières ou de série dans les résultats de recherche
  tant que ces données/comportements ne figurent pas dans les contrats existants.
- Recette Chrome avec redimensionnement ; Safari/iOS, appareils réels et audit complet
  avec lecteur d’écran restent hors de cette recette.
- Le script visuel désactive le service worker pour isoler le rendu ; le comportement
  PWA/confidentialité est couvert séparément par les 10 tests dédiés.

## Fichiers créés ou modifiés par UI-2

- `docs/UI-2-REDESIGN.md`
- `src/app/features/home/home.component.html`
- `src/app/features/home/home.component.scss`
- `src/app/features/home/home.component.spec.ts`
- `src/app/features/home/home.component.ts`
- `src/app/features/result/result.component.html`
- `src/app/features/result/result.component.scss`
- `src/app/features/result/result.component.spec.ts`
- `src/app/features/search/search.component.html`
- `src/app/features/search/search.component.scss`
- `src/app/features/search/search.component.spec.ts`
- `src/app/features/search/search.component.ts`
- `src/app/features/statistics/statistics.component.html`
- `src/app/features/statistics/statistics.component.scss`
- `src/app/features/statistics/statistics.component.spec.ts`
- `src/app/features/statistics/statistics.component.ts`
- `src/app/shared/components/exam-selector/exam-selector.component.scss`
- `src/app/shared/components/exam-selector/exam-selector.component.spec.ts`
- `src/app/shared/components/exam-selector/exam-selector.component.ts`
- `tests/run-ui-checks.mjs`

## Résultats finaux — 22 octobre 2026

| Commande / vérification | Résultat |
| --- | --- |
| `npm run test:ci` | **54/54 réussis** : 45 tests UI-1 conservés + 9 tests UI-2 |
| `npm run test:business` | **16/16 réussis** |
| `npm run build` | **Réussi**, aucun avertissement de budget ; initial **726,97 kB**, transfert estimé **177,25 kB** |
| `npm run test:pwa` | **10/10 réussis** : 9 cache/confidentialité + 1 cycle de mise à jour |
| `npm audit --omit=dev --json` | **0 vulnérabilité**, dont 0 faible/modérée/élevée/critique ; 88 dépendances de production comptabilisées |
| `node tests/run-ui-checks.mjs` | **144/144 combinaisons réussies**, plus les parcours et états complémentaires |
| `node --check tests/run-ui-checks.mjs` | Réussi |
| `git diff --check` | Réussi |

Captures desktop et mobile des quatre pages inspectées en FR et AR, ainsi que la
fiche/recherche C1AS et l’état 404. Deux corrections issues de la recette : contrainte
`minmax(0, 1fr)` pour la grille d’accueil AR à 320 px ; positionnement de la coche de
sélection dans un conteneur qui hérite de RTL plutôt que sur l’icône (intrinsèquement
LTR). La recette contrôle désormais aussi l’absence de chevauchement coche/icône.

Une comparaison avec la copie UI-1 confirme l’identité exacte des corps des quatre
classes métier, de `src/app/core`, de `src/styles` et des sources des pages UI-3.
Les modifications TS de pages concernent seulement les imports visuels et le lien
vers le nouveau fichier SCSS des statistiques.

Limite d’outillage préexistante : Karma peut signaler des 404 sur les URLs de polices
propres à son serveur de tests. La recette production vérifie les familles effectives
et les captures avec les polices locales chargées. Aucun changement de dépendances,
aucun commit, aucun push et aucun déploiement.
