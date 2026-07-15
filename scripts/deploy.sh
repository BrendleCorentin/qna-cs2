#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="/var/www/counterquiz"
PUBLIC_DIR="/var/www/counterquiz-site"
APP_USER="ubuntu"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Ce script doit être lancé en root pour publier le frontend et recharger Nginx." >&2
  exit 1
fi

echo "[deploy] Mise à jour du dépôt"
sudo -u "${APP_USER}" git -C "${APP_DIR}" pull --ff-only origin main

echo "[deploy] Installation et redémarrage du serveur"
sudo -iu "${APP_USER}" bash -lc "cd '${APP_DIR}/server' && npm ci --omit=dev && pm2 restart counterquiz --update-env"

echo "[deploy] Construction du frontend"
sudo -iu "${APP_USER}" bash -lc "cd '${APP_DIR}/client' && npm ci && npm run build"

echo "[deploy] Publication du frontend"
install -d -o root -g root "${PUBLIC_DIR}"
cp -a "${APP_DIR}/client/dist/." "${PUBLIC_DIR}/"

nginx -t
systemctl reload nginx

echo "[deploy] Vérification du serveur"
curl --fail --silent --show-error --retry 5 --retry-delay 2 http://127.0.0.1:3001/ >/dev/null

echo "[deploy] Déploiement terminé"
