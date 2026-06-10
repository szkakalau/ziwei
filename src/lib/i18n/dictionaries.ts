export type Locale = "en" | "es" | "fr";

export const LOCALES: { key: Locale; label: string; flag: string }[] = [
  { key: "en", label: "English", flag: "🇺🇸" },
  { key: "es", label: "Español", flag: "🇪🇸" },
  { key: "fr", label: "Français", flag: "🇫🇷" },
];

const en = {
  "nav.today": "Today",
  "nav.yearly": "Yearly",
  "nav.match": "Match",
  "nav.account": "Account",

  "daily.title": "Daily Horoscope",
  "daily.loading": "Reading the stars...",
  "daily.empty": "Your first horoscope is being written...",
  "daily.emptyHint": "While you wait, explore your birth chart.",
  "daily.error": "Today's stars are taking longer than usual.",
  "daily.retry": "Try again",
  "daily.refresh": "Refresh",
  "daily.todaysStars": "Today's Stars",
  "daily.share": "Share",
  "daily.shareImage": "Share as image",
  "daily.viewChart": "View Your Chart",
  "daily.hideChart": "Hide Chart",
  "daily.source": "Generated via",
  "daily.signup": "Start Free Trial",
  "daily.login": "Log In",
  "daily.email": "Email",
  "daily.password": "Password (min 8 characters)",
  "daily.trialCta": "7 days free, then $4.99/month. Cancel anytime.",

  "compat.title": "Compatibility",
  "compat.desc": "Compare your Zi Wei Dou Shu chart with anyone — romantic partner, friend, business partner, or family member.",
  "compat.check": "Check Compatibility",
  "compat.checkOther": "Check with someone else",
  "compat.analyzing": "Analyzing...",

  "yearly.title": "Your {year} Zi Wei Dou Shu Forecast",
  "yearly.subtitle": "A comprehensive reading based on your birth chart",
  "yearly.loading": "Writing your annual reading...",
  "yearly.loadingHint": "This takes about 20 seconds. Worth the wait.",
  "yearly.downloadPdf": "Download PDF",

  "account.title": "Account",
  "account.email": "Email",
  "account.subscription": "Subscription",
  "account.birthDate": "Birth Date",
  "account.logout": "Log out",
  "account.manageBilling": "Manage billing",
  "account.reactivate": "Reactivate subscription",
  "account.back": "Back to horoscope",

  "auth.register": "Start your free trial",
  "auth.welcomeBack": "Welcome back",
  "auth.alreadyHave": "Already have an account? Log in",
  "auth.newHere": "New here? Create an account",
};

type Dict = typeof en;

const es: Dict = {
  "nav.today": "Hoy",
  "nav.yearly": "Anual",
  "nav.match": "Afinidad",
  "nav.account": "Cuenta",

  "daily.title": "Horóscopo Diario",
  "daily.loading": "Leyendo las estrellas...",
  "daily.empty": "Tu primer horóscopo se está escribiendo...",
  "daily.emptyHint": "Mientras esperas, explora tu carta astral.",
  "daily.error": "Las estrellas están tardando más de lo habitual.",
  "daily.retry": "Reintentar",
  "daily.refresh": "Actualizar",
  "daily.todaysStars": "Estrellas de Hoy",
  "daily.share": "Compartir",
  "daily.shareImage": "Compartir imagen",
  "daily.viewChart": "Ver Carta",
  "daily.hideChart": "Ocultar Carta",
  "daily.source": "Generado por",
  "daily.signup": "Prueba Gratis",
  "daily.login": "Iniciar Sesión",
  "daily.email": "Correo",
  "daily.password": "Contraseña (mín 8 caracteres)",
  "daily.trialCta": "7 días gratis, luego $4.99/mes. Cancela cuando quieras.",

  "compat.title": "Compatibilidad",
  "compat.desc": "Compara tu carta Zi Wei Dou Shu con cualquier persona.",
  "compat.check": "Ver Compatibilidad",
  "compat.checkOther": "Ver con otra persona",
  "compat.analyzing": "Analizando...",

  "yearly.title": "Tu Pronóstico Zi Wei Dou Shu {year}",
  "yearly.subtitle": "Una lectura completa basada en tu carta astral",
  "yearly.loading": "Escribiendo tu lectura anual...",
  "yearly.loadingHint": "Toma unos 20 segundos. Vale la pena.",
  "yearly.downloadPdf": "Descargar PDF",

  "account.title": "Cuenta",
  "account.email": "Correo",
  "account.subscription": "Suscripción",
  "account.birthDate": "Fecha de Nacimiento",
  "account.logout": "Cerrar sesión",
  "account.manageBilling": "Gestionar facturación",
  "account.reactivate": "Reactivar suscripción",
  "account.back": "Volver al horóscopo",

  "auth.register": "Comienza tu prueba gratis",
  "auth.welcomeBack": "Bienvenido de nuevo",
  "auth.alreadyHave": "¿Ya tienes cuenta? Inicia sesión",
  "auth.newHere": "¿Nuevo aquí? Crea una cuenta",
};

const fr: Dict = {
  "nav.today": "Aujourd'hui",
  "nav.yearly": "Annuel",
  "nav.match": "Affinité",
  "nav.account": "Compte",

  "daily.title": "Horoscope Quotidien",
  "daily.loading": "Lecture des étoiles...",
  "daily.empty": "Votre premier horoscope est en cours d'écriture...",
  "daily.emptyHint": "En attendant, explorez votre thème astral.",
  "daily.error": "Les étoiles prennent plus de temps que d'habitude.",
  "daily.retry": "Réessayer",
  "daily.refresh": "Actualiser",
  "daily.todaysStars": "Étoiles du Jour",
  "daily.share": "Partager",
  "daily.shareImage": "Partager l'image",
  "daily.viewChart": "Voir le Thème",
  "daily.hideChart": "Cacher le Thème",
  "daily.source": "Généré par",
  "daily.signup": "Essai Gratuit",
  "daily.login": "Connexion",
  "daily.email": "Email",
  "daily.password": "Mot de passe (min 8 caractères)",
  "daily.trialCta": "7 jours gratuits, puis 4,99 $/mois. Annulez à tout moment.",

  "compat.title": "Compatibilité",
  "compat.desc": "Comparez votre thème Zi Wei Dou Shu avec n'importe qui.",
  "compat.check": "Vérifier la Compatibilité",
  "compat.checkOther": "Vérifier avec quelqu'un d'autre",
  "compat.analyzing": "Analyse en cours...",

  "yearly.title": "Votre Prévision Zi Wei Dou Shu {year}",
  "yearly.subtitle": "Une lecture complète basée sur votre thème astral",
  "yearly.loading": "Rédaction de votre lecture annuelle...",
  "yearly.loadingHint": "Cela prend environ 20 secondes. Ça vaut le coup.",
  "yearly.downloadPdf": "Télécharger PDF",

  "account.title": "Compte",
  "account.email": "Email",
  "account.subscription": "Abonnement",
  "account.birthDate": "Date de Naissance",
  "account.logout": "Déconnexion",
  "account.manageBilling": "Gérer la facturation",
  "account.reactivate": "Réactiver l'abonnement",
  "account.back": "Retour à l'horoscope",

  "auth.register": "Commencez votre essai gratuit",
  "auth.welcomeBack": "Bon retour",
  "auth.alreadyHave": "Déjà un compte ? Connectez-vous",
  "auth.newHere": "Nouveau ici ? Créez un compte",
};

const dictionaries: Record<Locale, Dict> = { en, es, fr };

export function getDictionary(locale: Locale): Record<string, string> {
  return dictionaries[locale] ?? dictionaries.en;
}
