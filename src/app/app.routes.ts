import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component')
        .then(m => m.HomeComponent)
  },
  {
    path: 'result/:examType/:year/:candidateNumber',
    loadComponent: () =>
      import('./features/result/result.component')
        .then(m => m.ResultComponent)
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./features/search/search.component')
        .then(m => m.SearchComponent)
  },
  {
    path: 'exams',
    loadComponent: () =>
      import('./features/exams/exams.component')
        .then(m => m.ExamsComponent)
  },
  {
    path: 'statistics',
    loadComponent: () =>
      import('./features/statistics/statistics.component')
        .then(m => m.StatisticsComponent)
  },
  {
    path: 'institutions',
    loadComponent: () =>
      import(
        './features/institutions/institution-list/institution-list.component'
      ).then(m => m.InstitutionListComponent)
  },
  {
    path: 'institutions/:id',
    loadComponent: () =>
      import(
        './features/institutions/institution-detail/institution-detail.component'
      ).then(m => m.InstitutionDetailComponent)
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./features/about/about.component')
        .then(m => m.AboutComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
