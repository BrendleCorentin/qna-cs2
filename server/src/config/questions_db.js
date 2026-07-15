export const QUESTIONS_DB_SEED = [
  // --- CATÉGORIE : QUI SUIS-JE ? (Open Text) ---
  {
    type: "text",
    question: "QUI SUIS-JE ?\nJe suis Français. J'ai été élu Top 1 HLTV en 2019, 2020 et 2023. Je joue pour Vitality.",
    answer: "ZywOo"
  },
  {
    type: "text",
    question: "QUI SUIS-JE ?\nJe suis Ukrainien. J'ai gagné le Major Stockholm 2021. Je suis considéré comme le GOAT de CS:GO.",
    answer: "s1mple"
  },
  {
    type: "text",
    question: "QUI SUIS-JE ?\nJe suis un jeune AWPer russe prodige. J'ai rejoint G2 Esports en 2022 après avoir brillé chez NAVI Junior.",
    answer: "m0NESY"
  },
  {
    type: "text",
    question: "QUI SUIS-JE ?\nJe suis Canadien. J'ai joué pour Liquid et remporté l'Intel Grand Slam. Je suis connu pour mes headshots.",
    answer: "Twistzz"
  },
  {
    type: "text",
    question: "QUI SUIS-JE ?\nJe suis Bosnien. Je suis une star du Deagle. Je suis le cousin de huNter-.",
    answer: "NiKo"
  },
  {
    type: "text",
    question: "QUI SUIS-JE ?\nJe suis le capitaine (IGL) d'Astralis durant leur ère dominante (4 Majors). Je suis Danois.",
    answer: "gla1ve"
  },
  {
    type: "text",
    question: "QUI SUIS-JE ?\nJe suis un joueur Estonien. J'ai joué pour MOUZ et FaZe. J'ai été le premier joueur à gagner un Major avec une équipe internationale (FaZe).",
    answer: "ropz"
  },

  // --- CATÉGORIE : ESPOST & RECORDS (MCQ) ---
  {
    type: "mcq",
    question: "Quel joueur détient le record du nombre de Majors remportés (5) ?",
    choices: ["s1mple", "dupreeh", "karrigan", "olofmeister"],
    answerIndex: 1,
  },
  {
    type: "mcq",
    question: "Quelle organisation a remporté le dernier Major de l'ère CS:GO à Paris ?",
    choices: ["G2 Esports", "Team Vitality", "Heroic", "FaZe Clan"],
    answerIndex: 1, // Vitality
  },
  {
    type: "mcq",
    question: "Quelle équipe a réalisé le l'Intel Grand Slam saison 2 en seulement 63 jours ?",
    choices: ["Astralis", "Team Liquid", "Natus Vincere", "FaZe Clan"],
    answerIndex: 1,
  },
  {
    type: "mcq",
    question: "Dans quelle ville polonaise se déroule l'un des tournois les plus emblématiques (IEM) ?",
    choices: ["Varsovie", "Cracovie", "Katowice", "Gdańsk"],
    answerIndex: 2,
  },
  {
    type: "mcq",
    question: "Quel joueur suédois a été nommé meilleur joueur du monde (Top 1) en 2013 et 2014 ?",
    choices: ["GeT_RiGhT", "f0rest", "olofmeister", "JW"],
    answerIndex: 0,
  },
  {
    type: "mcq",
    question: "Quelle équipe française a remporté le Major DreamHack Winter 2014 ?",
    choices: ["Titan", "VeryGames", "Team LDLC", "EnVyUs"],
    answerIndex: 2,
  },

  // --- CATÉGORIE : HLTV 2024 & MAJORS CS2 ---
  // Sources vérifiées le 15 juillet 2026 :
  // https://www.hltv.org/players/top20/2024
  // https://www.hltv.org/news/38667/jl-claims-pgl-major-copenhagen-mvp-award
  // https://www.hltv.org/news/40566/donk-becomes-youngest-and-highest-rated-major-mvp-in-shanghai
  // https://www.hltv.org/news/36341/zywoo-claims-blasttv-paris-major-mvp-medal
  {
    type: "mcq",
    question: "Quel joueur a été classé numéro 1 mondial par HLTV en 2024 ?",
    choices: ["ZywOo", "m0NESY", "donk", "NiKo"],
    answerIndex: 2,
  },
  {
    type: "mcq",
    question: "Quel joueur a terminé deuxième du classement HLTV Top 20 en 2024 ?",
    choices: ["m0NESY", "ZywOo", "sh1ro", "jL"],
    answerIndex: 0,
  },
  {
    type: "mcq",
    question: "À quelle place ZywOo a-t-il terminé dans le classement HLTV Top 20 de 2024 ?",
    choices: ["1re", "2e", "3e", "4e"],
    answerIndex: 2,
  },
  {
    type: "mcq",
    question: "Quel joueur a terminé quatrième du classement HLTV Top 20 en 2024 ?",
    choices: ["NiKo", "jL", "sh1ro", "flameZ"],
    answerIndex: 0,
  },
  {
    type: "mcq",
    question: "Quel joueur lituanien a terminé cinquième du classement HLTV Top 20 en 2024 ?",
    choices: ["broky", "jL", "b1t", "frozen"],
    answerIndex: 1,
  },
  {
    type: "mcq",
    question: "Quel joueur a été élu MVP HLTV du PGL Major Copenhagen 2024 ?",
    choices: ["Aleksib", "m0NESY", "jL", "b1t"],
    answerIndex: 2,
  },
  {
    type: "mcq",
    question: "Quelle équipe a remporté le PGL Major Copenhagen 2024 ?",
    choices: ["FaZe", "Natus Vincere", "Team Spirit", "G2"],
    answerIndex: 1,
  },
  {
    type: "mcq",
    question: "Quel joueur a été élu MVP HLTV du Perfect World Shanghai Major 2024 ?",
    choices: ["sh1ro", "ropz", "donk", "ZywOo"],
    answerIndex: 2,
  },
  {
    type: "mcq",
    question: "Quelle équipe a remporté le Perfect World Shanghai Major 2024 ?",
    choices: ["FaZe", "Vitality", "Natus Vincere", "Team Spirit"],
    answerIndex: 3,
  },
  {
    type: "mcq",
    question: "Quelle équipe Team Spirit a-t-elle battue en finale du Major de Shanghai 2024 ?",
    choices: ["FaZe", "G2", "Vitality", "The MongolZ"],
    answerIndex: 0,
  },
  {
    type: "mcq",
    question: "À quel âge donk est-il devenu le plus jeune champion et MVP d'un Major selon HLTV ?",
    choices: ["16 ans", "17 ans", "18 ans", "19 ans"],
    answerIndex: 1,
  },
  {
    type: "mcq",
    question: "Quel rating HLTV donk a-t-il obtenu lors de sa campagne MVP au Major de Shanghai 2024 ?",
    choices: ["1.29", "1.39", "1.49", "1.59"],
    answerIndex: 2,
  },
  {
    type: "mcq",
    question: "Quel joueur détenait avant donk le record du plus jeune MVP de Major ?",
    choices: ["device", "Kjaerbye", "s1mple", "olofmeister"],
    answerIndex: 1,
  },
  {
    type: "mcq",
    question: "Quel joueur a été élu MVP HLTV du BLAST.tv Paris Major 2023 ?",
    choices: ["Spinx", "apEX", "ZywOo", "iM"],
    answerIndex: 2,
  },
  {
    type: "mcq",
    question: "Quel rating HLTV ZywOo a-t-il affiché au BLAST.tv Paris Major 2023 ?",
    choices: ["1.19", "1.29", "1.39", "1.49"],
    answerIndex: 2,
  },

  // --- CATÉGORIE : MECANIQUES & MAPS (MCQ) ---
  {
    type: "mcq",
    question: "Sur quelle carte trouve-t-on le 'Graveyard' (Cimetière) ?",
    choices: ["Inferno", "Dust II", "Mirage", "Overpass"],
    answerIndex: 0,
  },
  {
    type: "mcq",
    question: "Quel est le prix du gilet-casque (Kevlar + Helmet) si vous n'avez rien ?",
    choices: ["650$", "1000$", "350$", "800$"],
    answerIndex: 1,
  },
  {
    type: "mcq",
    question: "Combien de rounds sont nécessaires pour gagner un match en format MR12 (CS2) sans prolongation ?",
    choices: ["16", "13", "15", "12"],
    answerIndex: 1,
  },
  {
    type: "mcq",
    question: "Quelle arme coûte 4750 $ ?",
    choices: ["M249", "AWP", "G3SG1", "Negev"],
    answerIndex: 1,
  },
  {
    type: "mcq",
    question: "Quel terme désigne le fait de tuer un ennemi à travers une fumigène sans le voir ?",
    choices: ["Wallbang", "Spam", "Kobe", "Ninja"],
    answerIndex: 1, // Spamming the smoke effectively
  },

  // Sources HLTV vérifiées le 15 juillet 2026 :
  // https://www.hltv.org/news/45058/official-saw-unveil-new-roster
  // https://www.hltv.org/news/45055/9ine-finalize-roster-with-b1elany
  // https://www.hltv.org/news/45097/official-bcg-complete-roster-with-mzinho
  // https://www.hltv.org/news/44709/fluxo-confirm-dav1deus-and-ltz-signings
  // https://www.hltv.org/news/44998/rostermania-tracker-summer-2026
  // https://www.hltv.org/results

  // --- COMPLÈTE LA LINE-UP (rosters annoncés en juillet 2026) ---
  {
    type: "mcq", category: "lineup_completion",
    question: "Complète la line-up SAW annoncée le 3 juillet 2026 : MUTiRiS, story, ewjerkz, krazy et ____.",
    choices: ["NOPEEj", "arrozdoce", "stadodo", "roman"], answerIndex: 0,
  },
  {
    type: "mcq", category: "lineup_completion",
    question: "Complète la line-up 9INE finalisée le 3 juillet 2026 : raalz, kraghen, flayy, rim3 et ____.",
    choices: ["cej0t", "b1elany", "bnox", "St0m4k"], answerIndex: 1,
  },
  {
    type: "mcq", category: "lineup_completion",
    question: "Complète la line-up BC.Game annoncée le 9 juillet 2026 : s1mple, electroNic, Senzu, Magisk et ____.",
    choices: ["910", "mzinho", "Techno", "cobrazera"], answerIndex: 1,
  },
  {
    type: "mcq", category: "lineup_completion",
    question: "Complète la line-up Fluxo annoncée le 25 mai 2026 : zevy, Lucaozy, exit, dav1deuS et ____.",
    choices: ["Ltz", "kye", "mlhzin", "remix"], answerIndex: 0,
  },
  {
    type: "mcq", category: "lineup_completion",
    question: "Quel duo a rejoint Fluxo pour compléter son cinq en mai 2026 ?",
    choices: ["dav1deuS et Ltz", "kye et mlhzin", "Lucaozy et decenty", "remix et ALLE"], answerIndex: 0,
  },
  {
    type: "mcq", category: "lineup_completion",
    question: "Dans la line-up SAW de juillet 2026, quel joueur arrivait de Rebels ?",
    choices: ["story", "krazy", "NOPEEj", "MUTiRiS"], answerIndex: 2,
  },

  // --- TRANSFERTS & ANCIENNES ÉQUIPES ---
  {
    type: "mcq", category: "transfer_history",
    question: "De quelle équipe mzinho venait-il avant de compléter BC.Game en juillet 2026 ?",
    choices: ["The Huns", "The MongolZ", "ATOX", "IHC"], answerIndex: 1,
  },
  {
    type: "mcq", category: "transfer_history",
    question: "De quelle organisation provenait le prêt de Senzu, rendu permanent par BC.Game en juin 2026 ?",
    choices: ["The MongolZ", "Falcons", "NAVI", "Aurora"], answerIndex: 0,
  },
  {
    type: "mcq", category: "transfer_history",
    question: "Dans quelle équipe b1elany jouait-il avant de signer chez 9INE en juillet 2026 ?",
    choices: ["KOLESIE", "Inner Circle", "Betclic", "Monte"], answerIndex: 0,
  },
  {
    type: "mcq", category: "transfer_history",
    question: "Quel joueur a rejoint CYBERSHOKE en prêt depuis HEROIC le 9 juillet 2026 ?",
    choices: ["Alkaren", "yxngstxr", "xfl0ud", "Brollan"], answerIndex: 0,
  },

  // --- RETROUVE LE MATCH / LE SCORE ---
  {
    type: "mcq", category: "match_history",
    question: "Quel score a conclu la finale BO5 entre 9z et PARIVISION au XSE Pro League Guangzhou 2026 ?",
    choices: ["3-0 pour 9z", "3-1 pour 9z", "3-2 pour PARIVISION", "3-0 pour PARIVISION"], answerIndex: 0,
  },
  {
    type: "mcq", category: "match_history",
    question: "Quelle équipe a battu FaZe 2-1 au XSE Pro League Guangzhou le 11 juillet 2026 ?",
    choices: ["Alliance", "PARIVISION", "9z", "BIG"], answerIndex: 1,
  },
  {
    type: "mcq", category: "match_history",
    question: "Quelle équipe a éliminé Virtus.pro 2-0 au RES Showdown 4 Europe le 11 juillet 2026 ?",
    choices: ["Inner Circle", "magic", "Monte", "Tricksters"], answerIndex: 0,
  },
  {
    type: "mcq", category: "match_history",
    question: "Au RES Showdown 4 South America du 12 juillet 2026, qui a battu paiN 2-0 ?",
    choices: ["BESTIA", "Imperial", "Sharks", "Keyd Stars"], answerIndex: 2,
  },
  {
    type: "mcq", category: "match_history",
    question: "Quel score Lynn Vision a-t-elle infligé à TYLOO le 12 juillet 2026 ?",
    choices: ["2-0", "2-1", "3-1", "1-0"], answerIndex: 1,
  },

  // --- DATES & PARCOURS DE TOURNOI ---
  {
    type: "mcq", category: "date_challenge",
    question: "À quelle date BC.Game a-t-elle officiellement annoncé mzinho comme dernier joueur de sa line-up 2026 ?",
    choices: ["23 juin 2026", "3 juillet 2026", "9 juillet 2026", "12 juillet 2026"], answerIndex: 2,
  },
  {
    type: "mcq", category: "tournament_path",
    question: "Lors du Super DraculaN précédant sa signature chez 9INE, quelle équipe b1elany a-t-il battue comme stand-in ?",
    choices: ["Sashi", "GamerLegion", "Inner Circle", "Acend"], answerIndex: 1,
  },
  {
    type: "mcq", category: "tournament_path",
    question: "Contre quelle équipe la nouvelle line-up Fluxo devait-elle débuter au Circuit X Base Recife 2026 ?",
    choices: ["BlackBelt", "UNO MILLE", "RED Canids", "BESTIA"], answerIndex: 0,
  }
];
