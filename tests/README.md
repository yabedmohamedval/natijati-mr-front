# Tests frontend Natijati MR

## Prérequis et commandes

Utiliser la version Node compatible Angular 20 (actuellement Node 22.23.2),
`npm ci` et une installation Chrome/Chromium. Si le navigateur n'est pas détecté,
définir `CHROME_BIN` vers son exécutable. Le sandbox Chrome reste activé.
Karma ouvre un serveur local sur le port 9876.

| Commande | Rôle |
| --- | --- |
| `npm test` | Tests Angular dans ChromeHeadless, surveillance des changements |
| `npm run test:ci` | Même suite, une exécution avec code de sortie |
| `npm run test:business` | Régressions métier P1 avec Node |
| `npm run test:pwa` | Confidentialité, cache et mises à jour PWA avec Node |
| `npm run test:coverage` | Suite Angular avec rapport HTML et résumé dans `coverage/` |

La suite PWA inspecte le build généré : exécuter `npm run build` avant
`npm run test:pwa`, notamment sur un checkout neuf.

Validation complète reproductible :

```sh
npm ci
npm run test:ci
npm run test:business
npm run build
npm run test:pwa
npm audit --omit=dev
git diff --check
```

## Répartition des responsabilités

- `src/**/*.spec.ts` : contrats HttpClient avec `HttpTestingController`,
  templates compilés avec TestBed, formulaires, DOM, routeur, effets i18n,
  pagination localisée et métadonnées sans données nominatives.
  Les appels HTTP sont interceptés ; aucun accès Cloud Run/Supabase.
- `public-journeys.test.ts` : matrice métier rapide BAC/BEPC/C1AS et sessions,
  annulation, archives, statistiques et établissements. Conservée telle quelle.
- `pwa-cache.test.mjs` et `pwa-status.test.ts` : protections P2-A, y compris
  le worker personnalisé et l'absence de cache API dans le manifeste généré ;
  dimensions des icônes, polices locales, règles HTTP noindex et sitemap.

Ne pas recopier la matrice Node dans Jasmine. Ajouter des tests Angular lorsque
le contrat HTTP, la liaison au template, une interaction DOM ou le routeur apporte
une vérification supplémentaire. Utiliser les harnesses Material pour manipuler
les contrôles ; ne pas tester les classes CSS ni les détails internes Material.
Les fixtures utilisent uniquement des données fictives.

## Choix et limites

Jasmine/Karma conserve la voie stable déjà configurée pour Angular 20.
Le builder de tests utilise explicitement le mode `application`, cohérent avec
le build de l'application. Vitest est encore expérimental dans Angular 20 :
reconsidérer ce choix lors d'une future migration Angular, sans urgence ici.

Karma est un outil historique dont certaines transitives sont dépréciées.
Les alertes résiduelles `braces` concernent l'outillage local, pas la SPA publiée.
Ne pas exposer le serveur de tests publiquement ; ne pas forcer des overrides
majeurs uniquement pour faire disparaître les alertes.

Le rapport de couverture Angular mesure les modules instrumentés par cette
suite, pas l'ensemble de l'application et pas les tests Node. Aucun seuil
arbitraire ni objectif de 100 % n'est imposé. Les erreurs des pages statistiques, établissements et archives sont couvertes côté DOM.
Leurs parcours complets et la navigation globale restent à compléter.

Les tests de composants s'exécutent dans un vrai ChromeHeadless mais ne constituent
pas une recette E2E de l'application déployée. Aucun outil E2E n'est installé.
Playwright est recommandé ultérieurement pour les parcours accueil → résultat,
archives → recherche → résultat et établissements → détail, avec API simulée
pour la reproductibilité. Les tests contre un environnement réel devront rester
séparés et utiliser des données de recette autorisées.
