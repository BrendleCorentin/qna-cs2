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

### Mise à jour sur le VPS
Si vous avez fait des modifications (comme changer l'IP), faites ceci sur le VPS :

1.  **Récupérer le code:**
    ```bash
    cd ~/qna-cs2
    git pull
    ```

2.  **Reconstruire le Client (Frontend):**
    ```bash
    cd client
    npm install
    npm run build
    ```
    *C'est cette étape qui intègre la nouvelle IP dans le site.*

3.  **Redémarrez le serveur (Backend):**
    ```bash
    pm2 restart qna-server
    ```

### Nginx Reverse Proxy (RECOMMANDE)
1. Créer la config Nginx: `nano /etc/nginx/sites-available/qna.conf`
2. Copiez la config de `nginx.conf`
3. Activez le site: `ln -s /etc/nginx/sites-available/qna.conf /etc/nginx/sites-enabled/`
4. Recharger Nginx: `nginx -t && systemctl reload nginx`


