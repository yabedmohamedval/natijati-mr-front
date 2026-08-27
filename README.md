# Natijati MR — Frontend

Première version Angular 20 du portail des résultats des examens nationaux mauritaniens.

## Stack
- Angular standalone + Signals
- Angular Material
- Tailwind CSS 4 via PostCSS
- Français/arabe et RTL dynamique
- PWA avec Angular Service Worker
- API Spring Boot via proxy local

## Démarrage
```bash
npm install
npm start
```
Frontend : http://localhost:4200  
Backend attendu : http://localhost:8080

## Build PWA
```bash
npm run build
npx http-server dist/national-exams-frontend/browser -p 4200
```
Le service worker n'est actif qu'en build production.

## Fonctionnalités actuelles
- page d'accueil responsive ;
- sélection BAC / BEPC / C1AS ;
- recherche BAC 2026 par numéro ;
- page résultat connectée à `/api/public/results/bac/{year}/{number}` ;
- changement instantané français/arabe ;
- passage automatique LTR/RTL ;
- cache PWA des résultats publics.

BEPC et C1AS sont affichés « Prochainement » jusqu'à l'ajout de leurs endpoints frontend.
