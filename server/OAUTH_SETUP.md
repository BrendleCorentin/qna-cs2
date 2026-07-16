# Configuration OAuth

## URL de retour Google

`https://counter-quiz.com/auth/google/callback`

Créer un client OAuth de type **Application Web**, puis renseigner les variables :

`GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET`.

## URL de retour Twitch

`https://counter-quiz.com/auth/twitch/callback`

Créer une application dans la console Twitch, puis renseigner :

`TWITCH_CLIENT_ID` et `TWITCH_CLIENT_SECRET`.

## Variables serveur

Copier les valeurs de `.env.example` dans l'environnement PM2. Les secrets ne doivent jamais être ajoutés au dépôt Git.

Nginx doit transmettre les chemins `/auth/` au serveur Node sur le port 3001 :

```nginx
location /auth/ {
    proxy_pass http://127.0.0.1:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Real-IP $remote_addr;
}
```
