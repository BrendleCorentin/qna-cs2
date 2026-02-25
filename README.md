# CS2 Q&A 1v1

Un jeu de questions-réponses en 1v1 sur le thème de Counter-Strike 2, avec système de classement ELO et authentification.

## Fonctionnalités

- **Matchmaking 1v1** en temps réel
- **Système ELO** et classement (Leaderboard) comme sur Faceit
- **Authentification** (Inscription/Connexion)
- **Thème graphique CS2**
- **Historique des matchs** (base de données SQLite)

## Installation (Local & VPS)

### Prérequis
- Node.js (v16+)
- NPM

### 1. Cloner le projet
```bash
git clone <votre-repo-url>
cd qna-1v1
```

### 2. Installer les dépendances
Il faut installer les dépendances pour le client (Frontend) et le serveur (Backend).

**Client :**
```bash
cd client
npm install
```

**Serveur :**
```bash
cd ../server
npm install
```

### 3. Build du Frontend (Production)
Pour la production, le frontend doit être compilé.
```bash
cd client
npm run build
```
Cela va créer un dossier `dist` dans `client/`.

### 4. Démarrer le Serveur
Le serveur servira l'API et les fichiers statiques du frontend (si configuré) ou vous pouvez servir le frontend séparément.

**Mode Développement (avec rechargement auto) :**
Ouvrir deux terminaux :
- Terminal 1 (Serveur) : `cd server && npm run dev`
- Terminal 2 (Client) : `cd client && npm run dev`

**Mode Production (VPS) :**
```bash
# Dans le dossier server
cd server
npm start
```
*Note : Assurez-vous que le serveur pointe bien vers le build du client si vous voulez tout servir sur le même port, ou configurez un reverse proxy (Nginx).*

## Déploiement VPS (Recommandé avec PM2)

1. Installer PM2 globalement : `npm install -g pm2`
2. Lancer le serveur avec PM2 :
```bash
cd server
pm2 start src/index.js --name "cs2-qna"
```
3. Sauvegarder pour le redémarrage auto :
```bash
pm2 save
pm2 startup
```

## Structure du projet

- `/client` : Frontend React + Vite
- `/server` : Backend Node.js + Express + Socket.io + SQLite
