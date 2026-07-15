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

  // Sources HLTV historiques vérifiées le 15 juillet 2026 :
  // https://www.hltv.org/news/22637/cloud9-beat-faze-to-win-eleague-major-boston
  // https://www.hltv.org/news/24936/faceit-major-the-evps
  // https://www.hltv.org/news/36340/vitality-romp-to-victory-on-home-soil-in-last-ever-csgo-major

  // --- COMPLÈTE LA LINE-UP (rosters annoncés en juillet 2026) ---
  {
    type: "mcq", category: "lineup_completion",
    question: "Complète la line-up Astralis championne du FACEIT Major London 2018 : device, dupreeh, gla1ve, Magisk et ____.",
    choices: ["Xyp9x", "k0nfig", "cadiaN", "valde"], answerIndex: 0,
  },
  {
    type: "mcq", category: "lineup_completion",
    question: "Complète la line-up Cloud9 championne du Major Boston 2018 : Stewie2K, tarik, autimatic, RUSH et ____.",
    choices: ["Skadoodle", "n0thing", "shroud", "flusha"], answerIndex: 0,
  },
  {
    type: "mcq", category: "lineup_completion",
    question: "Complète la line-up NAVI championne du Major Stockholm 2021 : s1mple, electronic, Boombl4, b1t et ____.",
    choices: ["Perfecto", "flamie", "jL", "npl"], answerIndex: 0,
  },
  {
    type: "mcq", category: "lineup_completion",
    question: "Complète la line-up Luminosity championne du Major MLG Columbus 2016 : FalleN, fer, coldzera, TACO et ____.",
    choices: ["fnx", "felps", "boltz", "steel"], answerIndex: 0,
  },
  {
    type: "mcq", category: "lineup_completion",
    question: "Complète la line-up Vitality championne du Major de Paris 2023 : apEX, ZywOo, Magisk, dupreeh et ____.",
    choices: ["Spinx", "flameZ", "RpK", "misutaaa"], answerIndex: 0,
  },
  {
    type: "mcq", category: "lineup_completion",
    question: "Complète la line-up française LDLC championne à DreamHack Winter 2014 : Happy, shox, NBK-, kioShiMa et ____.",
    choices: ["SmithZz", "kennyS", "apEX", "ScreaM"], answerIndex: 0,
  },

  // --- TRANSFERTS & ANCIENNES ÉQUIPES ---
  {
    type: "mcq", category: "transfer_history",
    question: "Dans quelle académie m0NESY jouait-il avant de rejoindre G2 ?",
    choices: ["NAVI Junior", "Gambit Youngsters", "MOUZ NXT", "Spirit Academy"], answerIndex: 0,
  },
  {
    type: "mcq", category: "transfer_history",
    question: "Dans quelle équipe NiKo jouait-il juste avant de rejoindre G2 en 2020 ?",
    choices: ["FaZe", "MOUZ", "HEROIC", "Complexity"], answerIndex: 0,
  },
  {
    type: "mcq", category: "transfer_history",
    question: "Quelle organisation device a-t-il quittée avant de revenir chez Astralis en 2022 ?",
    choices: ["Ninjas in Pyjamas", "North", "Complexity", "HEROIC"], answerIndex: 0,
  },
  {
    type: "mcq", category: "transfer_history",
    question: "Quel joueur a quitté NAVI Junior pour devenir l'AWPer de G2 en 2022 ?",
    choices: ["m0NESY", "w0nderful", "headtr1ck", "deko"], answerIndex: 0,
  },

  // --- RETROUVE LE MATCH / LE SCORE ---
  {
    type: "mcq", category: "match_history",
    question: "Quelle équipe Cloud9 a-t-elle battue en finale du Major Boston 2018 ?",
    choices: ["FaZe", "SK", "G2", "NAVI"], answerIndex: 0,
  },
  {
    type: "mcq", category: "match_history",
    question: "Quelle équipe NAVI a-t-elle battue en finale du Major Stockholm 2021 ?",
    choices: ["G2", "Vitality", "Gambit", "HEROIC"], answerIndex: 0,
  },
  {
    type: "mcq", category: "match_history",
    question: "Quelle équipe Vitality a-t-elle battue en finale du dernier Major CS:GO à Paris ?",
    choices: ["GamerLegion", "HEROIC", "Apeks", "Monte"], answerIndex: 0,
  },
  {
    type: "mcq", category: "match_history",
    question: "Quelle équipe ENCE a-t-elle affrontée en finale de l'IEM Katowice Major 2019 ?",
    choices: ["Astralis", "NAVI", "Liquid", "MIBR"], answerIndex: 0,
  },
  {
    type: "mcq", category: "match_history",
    question: "Quelle équipe Astralis a-t-elle battue en finale du StarLadder Berlin Major 2019 ?",
    choices: ["AVANGAR", "ENCE", "Liquid", "NRG"], answerIndex: 0,
  },

  // --- DATES & PARCOURS DE TOURNOI ---
  {
    type: "mcq", category: "tournament_path",
    question: "Quelle équipe a remporté le tout premier Major de Counter-Strike 2 ?",
    choices: ["NAVI", "FaZe", "Vitality", "Spirit"], answerIndex: 0,
  },
  {
    type: "mcq", category: "tournament_path",
    question: "Quelle équipe a réalisé un parcours parfait sans perdre une seule carte au Major Stockholm 2021 ?",
    choices: ["NAVI", "G2", "Gambit", "Vitality"], answerIndex: 0,
  },
  {
    type: "mcq", category: "tournament_path",
    question: "Quelle équipe française a remporté DreamHack Winter 2014 après l'affaire du boost d'Overpass ?",
    choices: ["LDLC", "Titan", "VeryGames", "EnVyUs"], answerIndex: 0,
  }
];
