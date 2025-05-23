// src/constants/strings.ts

/**
 * Chaînes statiques (libellés, messages, titres) de l'application
 * Centralisées pour faciliter la maintenance et la localisation
 */
export const Strings = {
    greetings: {
      morning: 'Bonjour',
      afternoon: 'Bon après‑midi',
      evening: 'Bonsoir'
    },
  
    labels: {
      logout: 'Déconnexion',
      currentBalance: 'Solde actuel',
      monthlyBudget: 'Budget ce mois',
      recentTransactions: 'Transactions récentes',
      addExpense: 'Enregistrer dépense',
      addIncome: 'Enregistrer revenu',
      cancel: 'Annuler',
      expenseLabel: 'Ajouter dépense',
      incomeLabel: 'Ajouter revenu',
      fieldLabel: 'Libellé',
      fieldAmount: 'Montant',
      balanceSummary: 'Dépensé ce mois',
      settings: 'Paramètres',
      changePassword: 'Changer de mot de passe',
      updateProfile: 'Mettre à jour mon profil',
      helpSupport: 'Aide & Support',
      notifications: 'Notifications',
      darkMode: 'Mode Sombre',
      totalSpent: 'Total dépensé ce mois',
      percentUtilise:'% utilisé',
      expense:'Dépense',
      income:'Revenu',
      anonymeUser:'Utilisateur',
      sending: "Envoi en cours...",
      forgotPassword:"Réinitialiser le mot de passe",
      label: "Libellé",
      amount: "Montant",
      tabs:{
        accueil:"Accueil",
        depseses:"Dépenses",
        budgets:"Budgets",
        analyse:"Analyse",
        profil:"Profil",
      }
    },
    buttons: {
      send: "Envoyer",
      back: "Retour",
    },
  
    alerts: {
      errorTitle: 'Erreur',
      successTitle: 'Succès',
      fillAllFields: 'Veuillez remplir tous les champs.',
      passwordsMismatch: 'Les nouveaux mots de passe ne correspondent pas.',
      passwordUpdated: 'Mot de passe mis à jour.',
      deleteConfirmTitle: 'Supprimer ?',
      deleteConfirmMessage: 'Cette action est irréversible.',
      delete: 'Supprimer', 
      invalidEmail: 'Adresse email invalide.',
      resetEmailSent: 'Un email de réinitialisation a été envoyé.',
      resetEmailError: 'Une erreur est survenue. Veuillez réessayer.',
      userNotFound: "Utilisateur non trouvé.",
      genericError: "Une erreur est survenue. Veuillez réessayer.",
      
    },
    
    instructions:{
      resetPassword:"Saisissez votre adresse email pour recevoir les instructions de réinitialisation.",
    }
  };
  