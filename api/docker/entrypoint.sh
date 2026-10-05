#!/bin/sh
set -eu

cd /var/www/html

if [ ! -f .env ]; then
    cp .env.example .env
fi

if [ -z "${APP_KEY:-}" ] && ! grep -Eq '^APP_KEY=base64:.+' .env; then
    echo "[AssetIQ] Generating Laravel application key..."
    php artisan key:generate --force --no-interaction
fi

php artisan config:clear --no-interaction >/dev/null 2>&1 || true

echo "[AssetIQ] Waiting for database ${DB_HOST:-mysql}:${DB_PORT:-3306}..."
until php -r '
    try {
        new PDO(
            "mysql:host=" . (getenv("DB_HOST") ?: "mysql") .
            ";port=" . (getenv("DB_PORT") ?: "3306") .
            ";dbname=" . (getenv("DB_DATABASE") ?: "belarc_assets"),
            getenv("DB_USERNAME") ?: "assetiq",
            getenv("DB_PASSWORD") ?: ""
        );
        exit(0);
    } catch (Throwable $e) {
        exit(1);
    }
'; do
    sleep 2
done

echo "[AssetIQ] Database is reachable. Running migrations..."
php artisan migrate --force --no-interaction

if [ -n "${ASSETIQ_ADMIN_PASSWORD:-}" ]; then
    echo "[AssetIQ] Ensuring the local AssetIQ administrator exists..."
    php artisan db:seed --force --no-interaction
else
    echo "[AssetIQ] ASSETIQ_ADMIN_PASSWORD is empty; skipping administrator seed."
fi

php artisan cache:clear --no-interaction >/dev/null 2>&1 || true

echo "[AssetIQ] Starting Laravel API on port 8000..."
exec php -S 0.0.0.0:8000 -t public public/index.php
