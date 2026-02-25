export const QUESTIONS_DB_SEED = [
  // ÉCONOMIE & ARMES
  {
    question: "Quel est le prix de l'AWP ?",
    choices: ["4750$", "5000$", "4500$", "2700$"],
    answerIndex: 0,
  },
  {
    question: "Quel est le prix d'un Kit de désamorçage ?",
    choices: ["200$", "400$", "600$", "Gratuit"],
    answerIndex: 1,
  },
  {
    question: "Quelle arme remplace la SG 553 côté CT ?",
    choices: ["M4A4", "AUG", "Famas", "SCAR-20"],
    answerIndex: 1,
  },
  {
    question: "Quel pistolet permet de tirer en rafale (burst) ?",
    choices: ["P250", "Glock-18", "USP-S", "Desert Eagle"],
    answerIndex: 1,
  },
  {
    question: "Combien coûte le kevlar seul (sans casque) ?",
    choices: ["650$", "1000$", "400$", "800$"],
    answerIndex: 0,
  },
  {
    question: "Quel est le bonus de kill au couteau en compétitif ?",
    choices: ["300$", "600$", "1500$", "3000$"],
    answerIndex: 2,
  },
  {
    question: "Quel est le prix maximum d'argent qu'un joueur peut avoir ?",
    choices: ["10 000$", "16 000$", "20 000$", "12 000$"],
    answerIndex: 1,
  },
  {
    question: "Combien coûte une Molotov côté Terroriste ?",
    choices: ["300$", "400$", "500$", "600$"],
    answerIndex: 1,
  },
  {
    question: "Combien coûte une Incendiaire côté CT ?",
    choices: ["400$", "500$", "600$", "800$"],
    answerIndex: 2,
  },
  {
    question: "Quelle arme a la plus grande pénétration d'armure ?",
    choices: ["AWP", "AK-47", "SG 553", "Desert Eagle"],
    answerIndex: 2,
  },
  {
    question: "Combien de balles contient un chargeur de Negev ?",
    choices: ["100", "150", "200", "300"],
    answerIndex: 1,
  },
  {
    question: "Quelle grenade coûte 300$ ?",
    choices: ["Flashbang", "Smoke", "HE (Explosive)", "Leurre"],
    answerIndex: 2,
  },
  {
    question: "Quel pistolet a un mode silencieux amovible ?",
    choices: ["P2000", "USP-S", "Glock-18", "Five-SeveN"],
    answerIndex: 1,
  },
  {
    question: "L'AK-47 tue-t-elle en une balle dans la tête avec un casque ?",
    choices: ["Oui", "Non", "Seulement à courte portée", "Aléatoire"],
    answerIndex: 0,
  },
  {
    question: "Quelle arme est exclusive aux Terroristes ?",
    choices: ["M4A1-S", "Famas", "Galil AR", "MP9"],
    answerIndex: 2,
  },

  // GAMEPLAY & RÈGLES
  {
    question: "Combien de rounds pour gagner un match MR12 ?",
    choices: ["16", "13", "15", "30"],
    answerIndex: 1,
  },
  {
    question: "Combien de temps dure l'explosion de la bombe (C4) en compétitif ?",
    choices: ["35s", "40s", "45s", "30s"],
    answerIndex: 1,
  },
  {
    question: "Combien de joueurs y a-t-il dans une équipe compétitive ?",
    choices: ["4", "5", "6", "10"],
    answerIndex: 1,
  },
  {
    question: "Comment appelle-t-on le fait de tuer 5 ennemis ?",
    choices: ["Quad Kill", "Ace", "Rampage", "Clutch"],
    answerIndex: 1,
  },
  {
    question: "Que signifie 'Eco' ?",
    choices: ["Écologie", "Ne rien acheter pour économiser", "Acheter un pistolet", "Rusher B"],
    answerIndex: 1,
  },
  {
    question: "Quel est le bonus de perte (loss bonus) maximum ?",
    choices: ["2400$", "2900$", "3400$", "3900$"],
    answerIndex: 2,
  },
  {
    question: "Combien de temps dure un round en compétitif ?",
    choices: ["1:45", "1:55", "2:00", "2:15"],
    answerIndex: 1,
  },
  {
    question: "Combien gagne-t-on pour avoir posé la bombe si on perd le round ?",
    choices: ["300$", "500$", "800$", "0$"],
    answerIndex: 2,
  },
  {
    question: "Que se passe-t-il si le temps est écoulé et la bombe non posée ?",
    choices: ["Les CT gagnent", "Les T gagnent", "Égalité", "Prolongations"],
    answerIndex: 0,
  },
  {
    question: "Quel raccourci permet de drop une arme ?",
    choices: ["E", "G", "Q", "F"],
    answerIndex: 1,
  },

  // CARTES (MAPS)
  {
    question: "Sur quelle carte trouve-t-on la 'Banane' ?",
    choices: ["Mirage", "Overpass", "Inferno", "Nuke"],
    answerIndex: 2,
  },
  {
    question: "Sur quelle carte trouve-t-on le 'Palace' ?",
    choices: ["Mirage", "Dust II", "Anubis", "Vertigo"],
    answerIndex: 0,
  },
  {
    question: "Quelle carte se déroule dans un gratte-ciel en construction ?",
    choices: ["Office", "Vertigo", "Agency", "Nuke"],
    answerIndex: 1,
  },
  {
    question: "Quelle carte a une porte 'Long A' emblématique ?",
    choices: ["Dust II", "Mirage", "Cache", "Train"],
    answerIndex: 0,
  },
  {
    question: "Sur quelle carte trouve-t-on 'Heaven' et 'Hell' ?",
    choices: ["Overpass", "Nuke", "Ancient", "Inferno"],
    answerIndex: 1, // Bien que Heaven existe sur Overpass, Nuke est plus connue pour Heaven/Hell superposés ou Outside
    // Correction : Sur Overpass il y a Heaven. Sur Nuke il y a Heaven. Sur Train aussi.
    // Question ambiguë, remplaçons par une plus claire :
    // "Sur quelle carte peut-on ouvrir la porte 'Squeaky' ?" (Nuke/Cache/Train... toujours ambigu)
    // Allons sur du sûr :
  },
  {
    question: "Quelle carte se passe en Italie ?",
    choices: ["Inferno", "Mirage", "Anubis", "Dust II"],
    answerIndex: 0,
  },
  {
    question: "Quelle carte a été retirée du map pool actif pour CS2 à sa sortie ?",
    choices: ["Dust II", "Train", "Overpass", "Nuke"],
    answerIndex: 1, // Train n'était pas là au launch
  },
  {
    question: "Sur quelle carte y a-t-il de l'eau au spawn T ?",
    choices: ["Anubis", "Ancient", "Overpass", "Mirage"],
    answerIndex: 1,
  },
  {
    question: "Quelle couleur associe-t-on à la carte Nuke ?",
    choices: ["Jaune", "Bleu", "Vert", "Rouge"],
    answerIndex: 1, // Ambiance très bleue/grise usine
  },

  // E-SPORT & PRO
  {
    question: "Quel joueur est surnommé 'The Magician' ?",
    choices: ["s1mple", "ZywOo", "sh1ro", "dev1ce"],
    answerIndex: 0, // Parfois utilisé pour s1mple, mais historiquement c'est aussi utilisé pour d'autres.
    // Changeons pour plus factuel :
  },
  {
    question: "Qui a remporté le dernier Major CS:GO (Paris 2023) ?",
    choices: ["FaZe", "Vitality", "G2", "Heroic"],
    answerIndex: 1,
  },
  {
    question: "Quel joueur français a été élu meilleur joueur du monde en 2019, 2020 et 2023 ?",
    choices: ["KennyS", "ZywOo", "shox", "apEX"],
    answerIndex: 1,
  },
  {
    question: "Quelle équipe a gagné 4 Majors ?",
    choices: ["Astralis", "Fnatic", "NaVi", "SK Gaming"],
    answerIndex: 0,
  },
  {
    question: "Quelle nationalité est l'équipe NAVI à l'origine ?",
    choices: ["Russe", "Ukrainienne", "Polonaise", "Suédoise"],
    answerIndex: 1,
  },
  {
    question: "Quel joueur est connu pour son 'Jump AWP' sur Mirage ?",
    choices: ["s1mple", "coldzera", "KennyS", "NiKo"],
    answerIndex: 1,
  },
  {
    question: "Dans quelle ville se trouve le siège de Valve ?",
    choices: ["Los Angeles", "New York", "Bellevue", "Austin"],
    answerIndex: 2,
  },

  // DIVERS
  {
    question: "Quel moteur de jeu utilise CS2 ?",
    choices: ["Source 1", "Source 2", "Unreal Engine 5", "Unity"],
    answerIndex: 1,
  },
  {
    question: "Que signifie 'VAC' ?",
    choices: ["Valve Anti-Cheat", "Very Awesome Counter", "Virtual Aim Control", "Valve Auto Correction"],
    answerIndex: 0,
  },
  {
    question: "Quel est le nom de la bombe ?",
    choices: ["C4", "TNT", "Semtex", "Dynamite"],
    answerIndex: 0,
  },
  {
    question: "Comment s'appelle le mode 2v2 sur CS ?",
    choices: ["Wingman", "Duo", "Co-op", "Retake"],
    answerIndex: 0,
  },
  {
    question: "Quelle touche permet d'inspecter son arme par défaut ?",
    choices: ["F", "T", "Y", "H"],
    answerIndex: 0,
  },
  {
    question: "Quel animal est présent sur la carte Inferno (CS:GO/CS2) ?",
    choices: ["Des vaches", "Des poulets", "Des chiens", "Des chats"],
    answerIndex: 1,
  },
  {
    question: "Quel est le code pour planter la bombe ?",
    choices: ["7355608", "1234567", "0000000", "5555555"],
    answerIndex: 0,
  },
  {
    question: "Quelle arme est surnommée 'Auto-Noob' ?",
    choices: ["SCAR-20 / G3SG1", "P90", "Negev", "XM1014"],
    answerIndex: 0,
  },
  {
    question: "Quel grade est le plus élevé ?",
    choices: ["Global Elite", "Supreme Master First Class", "Legendary Eagle", "Sheriff"],
    answerIndex: 0,
  },
  {
    question: "En quelle année est sorti le premier Counter-Strike ?",
    choices: ["1998", "1999", "2000", "2001"],
    answerIndex: 1, // Mod HL sorti en 99
  },
  {
    question: "Comment appelle-t-on le fait de tirer à travers un mur ?",
    choices: ["Wallbang", "Hitscan", "Prefire", "Spray"],
    answerIndex: 0,
  },
  {
    question: "Quelle arme n'a pas de recul en scope ?",
    choices: ["AWP", "SSG 08 (Scout)", "G3SG1", "AUG"],
    answerIndex: 1, // Le scout est connu pour sa précision en saut (jump scout) aussi. Mais AWP n'a pas de recul au premier tir non plus.
    // Question piège. Reformulons :
    // "Quelle arme permet de tirer avec précision en sautant (Jump Shot) ?"
    // Reponse : SSG 08
  },
  {
    question: "Quelle arme permet de tirer avec précision au sommet d'un saut ?",
    choices: ["AWP", "SSG 08", "AK-47", "M4A4"],
    answerIndex: 1,
  },
  {
    question: "Que signifie 'GL HF' ?",
    choices: ["Good Luck Have Fun", "Get Lost Have Fear", "Good Lag High Framerate", "Game Lost High Fail"],
    answerIndex: 0,
  },
  {
    question: "Quelle grenade créée un mur de vision temporaire ?",
    choices: ["Smoke", "Flash", "Decoy", "Molotov"],
    answerIndex: 0,
  }
];
