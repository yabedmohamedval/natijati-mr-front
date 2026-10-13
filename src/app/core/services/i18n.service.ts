import {
  computed,
  effect,
  Injectable,
  signal
} from '@angular/core';

export type AppLanguage = 'fr' | 'ar';

const frTranslations = {
  "a11y.skip": "Aller au contenu",
  "a11y.navigation": "Navigation principale",
  "a11y.loading": "Chargement…",
  "a11y.loaded": "Contenu chargé.",
  "a11y.empty": "Aucune donnée disponible pour ces critères.",
  "a11y.numberRequired": "Saisissez le numéro du candidat ou du dossier.",
  "pagination.items": "Éléments par page",
  "pagination.next": "Page suivante",
  "pagination.previous": "Page précédente",
  "pagination.first": "Première page",
  "pagination.last": "Dernière page",
  "pagination.of": "sur",
  "seo.home": "Résultats des examens nationaux",
  "seo.description": "Consultez les résultats, archives et statistiques des examens nationaux en Mauritanie.",
  "seo.institution": "Détail de l’établissement",

  'pwa.ready': 'Une nouvelle version est prête.',
  'pwa.reload': 'Recharger',
  'pwa.unrecoverable': 'Cette version ne peut plus fonctionner correctement. Reconnectez-vous puis rechargez.',
  'pwa.offline': 'Hors ligne : les résultats et les recherches nécessitent une connexion Internet.',
  // Marque et navigation
  'brand.subtitle': 'Examens nationaux',

  'nav.home': 'Accueil',
  'nav.results': 'Résultats',
  'nav.exams': 'Examens',
  'nav.advancedSearch': 'Recherche avancée',
  'nav.statistics': 'Statistiques',
  'nav.institutions': 'Établissements',
  'nav.about': 'À propos',
  'nav.openMenu': 'Ouvrir le menu',

  // Langues
  'language.fr': 'Français',
  'language.ar': 'العربية',

  // Accueil
  'hero.badge': 'Résultats officiels • Mauritanie',
  'hero.title1': 'Votre résultat,',
  'hero.title2': 'simplement et rapidement.',
  'hero.description':
    'Consultez les résultats des examens nationaux dans une interface claire, rapide et adaptée à tous les appareils.',

  // Examens
  'exam.bac': 'Baccalauréat',
  'exam.bepc': 'Brevet',
  'exam.c1as': 'Entrée au collège',
  'exam.available': 'Disponible',
  'exam.soon': 'Prochainement',

  // Formulaire de recherche principal
  'search.label': 'Numéro du candidat',
  'search.placeholder': 'Exemple : 43831',
  'search.button': 'Rechercher',
  'search.hint': 'Saisissez le numéro indiqué sur votre convocation.',
  'search.year': 'Année',
  'search.session': 'Session',
  'search.required': 'Le numéro du candidat est obligatoire.',
  'search.numericOnly':
    'Le numéro doit contenir uniquement des chiffres.',
  'search.loading': 'Recherche en cours…',

  // Sessions
  'session.normal': 'Session normale',
  'session.complementary': 'Session complémentaire',

  // Indicateurs accueil
  'stats.exams': '3 examens',
  'stats.candidates': '+100 000 candidats',
  'stats.official': 'Données officielles',

  // Avantages
  'features.fast.title': 'Recherche instantanée',
  'features.fast.text':
    'Un accès direct au résultat avec le numéro du candidat.',

  'features.bilingual.title': 'Français et arabe',
  'features.bilingual.text':
    'Une expérience entièrement adaptée aux deux langues.',

  'features.secure.title': 'Fiable et respectueux',
  'features.secure.text':
    'Aucune donnée personnelle inutile n’est affichée.',

  // Pied de page
  'footer.disclaimer':
    'Plateforme indépendante. Les résultats proviennent des fichiers officiels publiés par les autorités compétentes.',

  // Résultat
  'result.back': 'Retour',
  'result.title': 'Résultat de l’examen',
  'result.candidate': 'Numéro du candidat',
  'result.score': 'Moyenne',
  'result.dossier': 'Numéro de dossier',
  'result.invalidSession': 'Session invalide. Sélectionnez une session.',
  'result.total': 'Total',
  'result.decision': 'Décision',
  'result.series': 'Série',
  'result.institution': 'Établissement',
  'result.center': 'Centre d’examen',
  'result.wilaya': 'Wilaya',
  'result.loading': 'Recherche du résultat…',
  'result.notFound': 'Aucun résultat trouvé pour ce numéro.',
  'result.error': 'Une erreur est survenue pendant la recherche.',
  'result.searchAgain': 'Faire une autre recherche',
  'result.officialSource': 'Source officielle',
  'result.ministrySource': 'Ministère de l’Éducation nationale',
  'result.publishedAt': 'Publié le',
  'result.share': 'Partager',
  'result.print': 'Imprimer',
  'result.linkCopied': 'Lien copié',

  // Commun
  'common.close': 'Fermer',
  'common.reset': 'Réinitialiser',

  // Recherche avancée
  'advanced.badge': 'Recherche multicritère',
  'advanced.title': 'Recherche avancée des résultats',
  'advanced.description':
    'Retrouvez un candidat par numéro, nom, wilaya, série ou établissement.',
  'advanced.exam': 'Examen',
  'advanced.number': 'Numéro du candidat',
  'advanced.name': 'Nom français ou arabe',
  'advanced.wilaya': 'Wilaya',
  'advanced.series': 'Série',
  'advanced.institution': 'Établissement ou centre',
  'advanced.search': 'Rechercher',
  'advanced.results': 'Résultats trouvés',
  'advanced.open': 'Ouvrir le résultat',
  'advanced.empty':
    'Aucun résultat ne correspond à ces critères.',

  // Archives
  'archives.badge': 'Archives officielles',
  'archives.title': 'Examens et sessions publiées',
  'archives.description':
    'Consultez les résultats disponibles par examen, année et session.',
  'archives.results': 'résultats',
  'archives.empty': 'Aucune session publiée pour le moment.',

  // Statistiques
  'statistics.badge': 'Vue nationale',
  'statistics.title': 'Statistiques des examens',
  'statistics.description':
    'Explorez les effectifs, moyennes et répartitions des résultats publiés.',
  'statistics.load': 'Afficher',
  'statistics.candidates': 'Candidats',
  'statistics.admitted': 'Admis',
  'statistics.successRate': 'Taux de réussite',
  'statistics.average': 'Moyenne',
  'statistics.secondSession': 'Sessionnaires',
  'statistics.byWilaya': 'Répartition par wilaya',
  'statistics.bySeries': 'Répartition par série',
  'statistics.noSeries': 'Aucune répartition disponible.',

  // Établissements
  'institutions.badge': 'Établissements',
  'institutions.title': 'Résultats par établissement',
  'institutions.description':
    'Comparez les effectifs et indicateurs publics des établissements et centres.',
  'institutions.search': 'Nom de l’établissement',
  'institutions.decisions': 'Répartition des décisions',

  // À propos
  'about.badge': 'Transparence',
  'about.title': 'À propos de Natijati MR',
  'about.description':
    'Une interface indépendante conçue pour simplifier la consultation des résultats nationaux en Mauritanie.',

  'about.missionTitle': 'Notre mission',
  'about.missionText':
    'Rendre la consultation des résultats simple, rapide, bilingue et accessible sur mobile.',

  'about.sourcesTitle': 'Origine des données',
  'about.sourcesText':
    'Les résultats proviennent des fichiers publiés officiellement puis sont importés et validés dans la plateforme.',

  'about.privacyTitle': 'Respect des données',
  'about.privacyText':
    'Le site limite les informations affichées et ne propose pas d’export public complet des candidats.',

  'about.contactTitle': 'Signaler une erreur',
  'about.contactText':
    'Une demande de correction peut être transmise avec le numéro du candidat et la source officielle concernée.',

  'about.disclaimerTitle': 'Important',
  'about.disclaimerText':
    'Natijati MR est un projet indépendant et ne remplace pas les publications officielles du ministère.'
} as const;

export type TranslationKey = keyof typeof frTranslations;

const arTranslations: Record<TranslationKey, string> = {
  "a11y.skip": "الانتقال إلى المحتوى",
  "a11y.navigation": "التنقل الرئيسي",
  "a11y.loading": "جارٍ التحميل…",
  "a11y.loaded": "تم تحميل المحتوى.",
  "a11y.empty": "لا توجد بيانات مطابقة لهذه المعايير.",
  "a11y.numberRequired": "أدخل رقم المترشح أو الملف.",
  "pagination.items": "عدد العناصر في الصفحة",
  "pagination.next": "الصفحة التالية",
  "pagination.previous": "الصفحة السابقة",
  "pagination.first": "الصفحة الأولى",
  "pagination.last": "الصفحة الأخيرة",
  "pagination.of": "من",
  "seo.home": "نتائج الامتحانات الوطنية",
  "seo.description": "اطلع على نتائج وأرشيف وإحصاءات الامتحانات الوطنية في موريتانيا.",
  "seo.institution": "تفاصيل المؤسسة",

  // Marque et navigation
  'pwa.ready': 'نسخة جديدة جاهزة.',
  'pwa.reload': 'إعادة التحميل',
  'pwa.unrecoverable': 'تعذر تشغيل هذه النسخة. اتصل بالإنترنت ثم أعد التحميل.',
  'pwa.offline': 'أنت غير متصل: تتطلب النتائج والبحث اتصالاً بالإنترنت.',
  'brand.subtitle': 'الامتحانات الوطنية',

  'nav.home': 'الرئيسية',
  'nav.results': 'النتائج',
  'nav.exams': 'الامتحانات',
  'nav.advancedSearch': 'البحث المتقدم',
  'nav.statistics': 'الإحصائيات',
  'nav.institutions': 'المؤسسات',
  'nav.about': 'حول المنصة',
  'nav.openMenu': 'فتح القائمة',

  // Langues
  'language.fr': 'Français',
  'language.ar': 'العربية',

  // Accueil
  'hero.badge': 'النتائج الرسمية • موريتانيا',
  'hero.title1': 'نتيجتك،',
  'hero.title2': 'بسهولة وسرعة.',
  'hero.description':
    'اطّلع على نتائج الامتحانات الوطنية عبر واجهة واضحة وسريعة ومناسبة لجميع الأجهزة.',

  // Examens
  'exam.bac': 'البكالوريا',
  'exam.bepc': 'شهادة ختم الدروس الإعدادية',
  'exam.c1as': 'دخول السنة الأولى إعدادية',
  'exam.available': 'متاح',
  'exam.soon': 'قريباً',

  // Formulaire
  'search.label': 'رقم المترشح',
  'search.placeholder': 'مثال: 43831',
  'search.button': 'بحث',
  'search.hint': 'أدخل الرقم الموجود في استدعاء الامتحان.',
  'search.year': 'السنة',
  'search.session': 'الدورة',
  'search.required': 'رقم المترشح مطلوب.',
  'search.numericOnly': 'يجب أن يحتوي الرقم على أرقام فقط.',
  'search.loading': 'جاري البحث…',

  // Sessions
  'session.normal': 'الدورة العادية',
  'session.complementary': 'الدورة التكميلية',

  // Indicateurs
  'stats.exams': '3 امتحانات',
  'stats.candidates': '+100 ألف مترشح',
  'stats.official': 'بيانات رسمية',

  // Avantages
  'features.fast.title': 'بحث فوري',
  'features.fast.text':
    'الوصول المباشر إلى النتيجة باستخدام رقم المترشح.',

  'features.bilingual.title': 'العربية والفرنسية',
  'features.bilingual.text':
    'تجربة متكاملة ومناسبة للغتين.',

  'features.secure.title': 'موثوق ومحترم للخصوصية',
  'features.secure.text':
    'لا نعرض أي بيانات شخصية غير ضرورية.',

  // Pied de page
  'footer.disclaimer':
    'منصة مستقلة. النتائج مأخوذة من الملفات الرسمية المنشورة من الجهات المختصة.',

  // Résultat
  'result.back': 'رجوع',
  'result.title': 'نتيجة الامتحان',
  'result.candidate': 'رقم المترشح',
  'result.score': 'المعدل',
  'result.dossier': 'رقم الملف',
  'result.invalidSession': 'الدورة غير صالحة. يرجى اختيار دورة.',
  'result.total': 'المجموع',
  'result.decision': 'القرار',
  'result.series': 'الشعبة',
  'result.institution': 'المؤسسة',
  'result.center': 'مركز الامتحان',
  'result.wilaya': 'الولاية',
  'result.loading': 'جاري البحث عن النتيجة…',
  'result.notFound': 'لم يتم العثور على نتيجة بهذا الرقم.',
  'result.error': 'حدث خطأ أثناء البحث.',
  'result.searchAgain': 'بحث جديد',
  'result.officialSource': 'المصدر الرسمي',
  'result.ministrySource': 'وزارة التهذيب الوطني',
  'result.publishedAt': 'تاريخ النشر',
  'result.share': 'مشاركة',
  'result.print': 'طباعة',
  'result.linkCopied': 'تم نسخ الرابط',

  // Commun
  'common.close': 'إغلاق',
  'common.reset': 'إعادة الضبط',

  // Recherche avancée
  'advanced.badge': 'بحث متعدد المعايير',
  'advanced.title': 'البحث المتقدم عن النتائج',
  'advanced.description':
    'ابحث عن مترشح بواسطة الرقم أو الاسم أو الولاية أو الشعبة أو المؤسسة.',
  'advanced.exam': 'الامتحان',
  'advanced.number': 'رقم المترشح',
  'advanced.name': 'الاسم بالعربية أو الفرنسية',
  'advanced.wilaya': 'الولاية',
  'advanced.series': 'الشعبة',
  'advanced.institution': 'المؤسسة أو المركز',
  'advanced.search': 'بحث',
  'advanced.results': 'النتائج الموجودة',
  'advanced.open': 'فتح النتيجة',
  'advanced.empty': 'لا توجد نتائج مطابقة لهذه المعايير.',

  // Archives
  'archives.badge': 'الأرشيف الرسمي',
  'archives.title': 'الامتحانات والدورات المنشورة',
  'archives.description':
    'تصفح النتائج المتاحة حسب الامتحان والسنة والدورة.',
  'archives.results': 'نتيجة',
  'archives.empty': 'لا توجد دورة منشورة حالياً.',

  // Statistiques
  'statistics.badge': 'نظرة وطنية',
  'statistics.title': 'إحصائيات الامتحانات',
  'statistics.description':
    'استكشف أعداد المترشحين والمعدلات وتوزيع النتائج المنشورة.',
  'statistics.load': 'عرض',
  'statistics.candidates': 'المترشحون',
  'statistics.admitted': 'الناجحون',
  'statistics.successRate': 'نسبة النجاح',
  'statistics.average': 'المعدل',
  'statistics.secondSession': 'الدورة التكميلية',
  'statistics.byWilaya': 'التوزيع حسب الولاية',
  'statistics.bySeries': 'التوزيع حسب الشعبة',
  'statistics.noSeries': 'لا توجد بيانات متاحة.',

  // Établissements
  'institutions.badge': 'المؤسسات',
  'institutions.title': 'النتائج حسب المؤسسة',
  'institutions.description':
    'قارن أعداد المترشحين والمؤشرات العامة للمؤسسات ومراكز الامتحان.',
  'institutions.search': 'اسم المؤسسة',
  'institutions.decisions': 'توزيع القرارات',

  // À propos
  'about.badge': 'الشفافية',
  'about.title': 'حول Natijati MR',
  'about.description':
    'واجهة مستقلة لتسهيل الاطلاع على نتائج الامتحانات الوطنية في موريتانيا.',

  'about.missionTitle': 'مهمتنا',
  'about.missionText':
    'توفير تجربة بسيطة وسريعة وثنائية اللغة ومتوافقة مع الهواتف.',

  'about.sourcesTitle': 'مصدر البيانات',
  'about.sourcesText':
    'تأتي النتائج من الملفات المنشورة رسمياً ثم يتم استيرادها والتحقق منها داخل المنصة.',

  'about.privacyTitle': 'حماية البيانات',
  'about.privacyText':
    'تقتصر المنصة على المعلومات الضرورية ولا توفر تصديراً عاماً لبيانات جميع المترشحين.',

  'about.contactTitle': 'الإبلاغ عن خطأ',
  'about.contactText':
    'يمكن إرسال طلب تصحيح مع رقم المترشح والإشارة إلى المصدر الرسمي.',

  'about.disclaimerTitle': 'تنبيه',
  'about.disclaimerText':
    'Natijati MR مشروع مستقل ولا يحل محل المنشورات الرسمية للوزارة.'
};

const translations: Record<
  AppLanguage,
  Record<TranslationKey, string>
> = {
  fr: frTranslations,
  ar: arTranslations
};

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  readonly language = signal<AppLanguage>(
    this.getInitialLanguage()
  );

  readonly direction = computed(
    () => this.language() === 'ar' ? 'rtl' : 'ltr'
  );

  readonly isArabic = computed(
    () => this.language() === 'ar'
  );

  constructor() {
    effect(() => {
      const language = this.language();

      document.documentElement.lang = language;
      document.documentElement.dir = this.direction();

      document.body.classList.toggle(
        'arabic-font',
        language === 'ar'
      );

      localStorage.setItem(
        'natijati-language',
        language
      );
    });
  }

  setLanguage(language: AppLanguage): void {
    this.language.set(language);
  }

  toggleLanguage(): void {
    this.language.update(
      current => current === 'fr' ? 'ar' : 'fr'
    );
  }

  t(key: TranslationKey): string {
    return translations[this.language()][key];
  }

  private getInitialLanguage(): AppLanguage {
    const storedLanguage =
      localStorage.getItem('natijati-language');

    return storedLanguage === 'ar' ? 'ar' : 'fr';
  }
}