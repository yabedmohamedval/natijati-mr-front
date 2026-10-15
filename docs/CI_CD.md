# CI/CD — frontend

## CI et déploiement contrôlé

PR vers main et push main lancent uniquement la validation : checkout, Node 22,
cache npm officiel, `npm ci`, ChromeHeadless (`test:ci`), tests métier, build
production, tests PWA, vérification du bundle et `npm audit --omit=dev`.
Le runner GitHub `ubuntu-24.04` fournit Google Chrome ; son exécutable est vérifié
avant Karma. Aucun ajout de `--no-sandbox`. Limite : 15 minutes.

Actions → **Frontend production** → Run workflow → **main** déclenche une nouvelle
validation du SHA sélectionné, puis un job soumis à l’Environment `production`.
Les autres branches ne déploient pas. Aucun déploiement sur push/PR/tag.
La concurrence `production-frontend` n’interrompt pas un déploiement en cours ; elle
n’est pas une file FIFO (GitHub peut remplacer une exécution en attente).

Le job production reconstruit au même SHA avec npm ci, vérifie PWA et l’URL API,
puis installe Firebase CLI **15.34.0** dans RUNNER_TEMP, hors package.json/lockfile.
Cette version CLI est fixe ; ses transitives ne sont pas verrouillées dans le projet.
Mettre à jour cette version explicitement après revue, sans utiliser `latest`.

L’authentification arrive après les installations/builds : GitHub OIDC → WIF →
compte frontend → ADC éphémères. Le fichier `gha-creds-*.json` généré n’est **pas une
clé de service account** : il décrit l’échange fédéré temporaire, est ignoré par Git,
n’est jamais publié dans dist et est nettoyé par l’action. Aucun FIREBASE_TOKEN.
Le déploiement a un timeout de 5 minutes ; ne pas supposer que l’assertion OIDC initiale
reste renouvelable indéfiniment. Réauthentifier après tout travail long ajouté entre
auth et déploiement. Le CLI utilise ADC via google-auth-library, pas Firebase Admin SDK.

La commande du workflow cible explicitement `--only hosting` et
`--project="$FIREBASE_PROJECT_ID"`, dont la valeur est obligatoirement
`natijati-mr-3232f`. Aucun `firebase use` ou projet implicite.
Après publication : HTTP 200 sur `https://natijati-mr.online`, présence du shell Angular,
puis comparaison du ngsw.json distant avec le manifest généré. Un échec fait échouer
le workflow, sans rollback automatique. Aucun candidat ni API métier n’est interrogé.

## Build production

`npm run build` utilise `environment.ts` ; seule la configuration development le
remplace. `.github/scripts/check-production.mjs` vérifie `production: true`, l’URL
HTTPS Cloud Run `/api`, sa présence dans les JS générés et `dataGroups: []`.
L’URL métier existante n’est pas modifiée. Aucun résultat personnel n’entre dans le
cache PWA. L’installation Firebase n’ajoute aucune dépendance runtime Angular.

## Préparation manuelle (non exécutée)

1. Créer un Environment GitHub **production**, limité à main ; configurer les reviewers
   si le plan le permet. Les approbations ne sont pas activées par le fichier YAML.
2. Protéger main avec PR, revue et check **Frontend validation** obligatoire.
3. Créer un compte de déploiement et un pool/provider WIF propres au projet
   **natijati-mr-3232f**, distincts de ceux du backend **natijati-mr**.
4. Restreindre le provider à l’owner ID/repository ID, au dépôt
   `yabedmohamedval/natijati-mr-front`, à main, workflow_dispatch,
   `.github/workflows/deploy.yml` et au subject Environment production.
5. Accorder `roles/iam.workloadIdentityUser` sur ce compte au principalSet de ce dépôt.
   Lui attribuer `roles/firebasehosting.admin` et `roles/serviceusage.apiKeysViewer`
   sur le seul projet Firebase, conformément aux prérequis du CLI. Aucun rôle Owner,
   Editor, Firebase Admin global, Cloud Run ou accès aux secrets backend.
6. Ajouter les variables ci-dessous, vérifier que le site/domaine existe déjà.
7. Après un futur commit/push autorisé : laisser la CI passer puis lancer et approuver
   manuellement un premier déploiement. Pas d’activation distante pendant P4-B.

Les commandes détaillées, les mappings et conditions IAM se trouvent dans le
[guide WIF commun du dépôt backend](https://github.com/yabedmohamedval/natijati-mr-api/blob/main/docs/CI_CD.md#préparation-manuelle--commandes-non-exécutées-par-les-workflows).
Le lien GitHub sera disponible après publication des changements documentaires du
backend ; dans le workspace, ouvrir `natijati-mr-api/docs/CI_CD.md`.

### Variables GitHub

De préférence Environment variables dans `production` ; Repository variables également
supportées, sans dupliquer les valeurs. Aucun Repository Secret requis.

| Nom | Nature | Valeur |
|---|---|---|
| FIREBASE_PROJECT_ID | Variable | natijati-mr-3232f |
| FIREBASE_WORKLOAD_IDENTITY_PROVIDER | Variable | projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/POOL_ID/providers/PROVIDER_ID |
| FIREBASE_SERVICE_ACCOUNT | Variable | DEPLOY_SA_ID@natijati-mr-3232f.iam.gserviceaccount.com |

## Supply chain et maintenance

CI : contents read seulement ; deploy : contents read et id-token write. Pas de
pull_request_target, de secret transmis à la CI réutilisable ou de clé JSON longue durée.
Actions officielles épinglées par SHA, versions commentées ; Dependabot hebdomadaire
pour npm et Actions, PR groupées et limitées, sans mise à jour majeure automatique.
Les majores sont revues manuellement. Pas d’auto-merge et aucun déploiement Dependabot.
Seul le cache npm est conservé, pas node_modules/dist. Pas d’artifacts frontend lourds.

En cas d’incident, examiner la release dans Firebase Console → Hosting et revenir
manuellement à la release précédente. Un smoke test en échec ne signifie pas que
la publication a été annulée. Les versions PWA peuvent nécessiter une actualisation
contrôlée côté navigateur, conformément à la stratégie existante.

## Vérifications locales et limites

```bash
npm ci
npm run test:ci
npm run test:business
npm run build
npm run test:pwa
node .github/scripts/check-production.mjs
npm audit --omit=dev
git diff --check
```

Ne pas lancer les étapes deploy localement. La recette locale ne prouve pas les
permissions WIF/IAM ni le comportement du domaine après une vraie publication.
Pas d’E2E ajouté ; aucune modification Firebase distante dans cette phase.

Sources : [ADC Firebase CLI](https://firebase.google.com/docs/cli#cli-ci-systems),
[rôles Hosting](https://firebase.google.com/docs/projects/iam/roles-predefined-product#hosting),
[auth WIF Google](https://github.com/google-github-actions/auth),
[runner Ubuntu / Chrome](https://github.com/actions/runner-images/blob/main/images/ubuntu/Ubuntu2404-Readme.md).
