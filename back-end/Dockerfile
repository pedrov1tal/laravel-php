# syntax=docker/dockerfile:1
FROM php:8.3-apache-bookworm AS php-base

RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev \
    && docker-php-ext-install pdo_pgsql \
    && rm -rf /var/lib/apt/lists/* \
    && a2enmod rewrite

WORKDIR /app
COPY docker/apache-vhost.conf /etc/apache2/sites-available/000-default.conf

FROM php-base AS composer-base
RUN apt-get update \
    && apt-get install -y --no-install-recommends unzip \
    && rm -rf /var/lib/apt/lists/*
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

FROM composer-base AS vendor-dev
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-interaction --prefer-dist --no-progress --no-scripts

FROM composer-base AS vendor-prod
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --no-progress --no-scripts

FROM php-base AS dev
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /app
COPY composer.json composer.lock ./
COPY --from=vendor-dev /app/vendor ./vendor
COPY . .
RUN composer dump-autoload --no-interaction --optimize --no-scripts \
    && php artisan package:discover --ansi \
    && mkdir -p /app/data \
    && chown -R www-data:www-data /app/storage /app/bootstrap/cache /app/data

ENV APP_ENV=local
EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000", "--no-reload"]

FROM php-base AS prod
RUN printf '\nprecedence ::ffff:0:0/96  100\n' >> /etc/gai.conf
# Prefer IPv4 because the production VPS has no IPv6 route to Neon.
RUN printf '\nprecedence ::ffff:0:0/96  100\n' >> /etc/gai.conf
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /app
COPY composer.json composer.lock ./
COPY --from=vendor-prod /app/vendor ./vendor
COPY . .
RUN composer dump-autoload --no-dev --no-interaction --optimize --no-scripts \
    && php artisan package:discover --ansi \
    && mkdir -p /app/data \
    && chown -R www-data:www-data /app/storage /app/bootstrap/cache /app/data \
    && rm -f /usr/bin/composer

ENV APP_ENV=production \
    APP_DEBUG=false
VOLUME ["/app/data"]
EXPOSE 80
CMD ["apache2-foreground"]
