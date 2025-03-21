#!/bin/bash

# Script de despliegue para la aplicación de gestión de clubes de pádel
# Este script debe ejecutarse en el servidor VPS con Ubuntu Server 22.04 LTS

# Colores para mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_message() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar si se está ejecutando como root
if [ "$EUID" -ne 0 ]; then
  print_error "Este script debe ejecutarse como root o con sudo"
  exit 1
fi

# Configuración
APP_NAME="stp-clubes"
DOMAIN="subetupadel.com"
APP_DIR="/var/www/$APP_NAME"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"
NGINX_ENABLED="/etc/nginx/sites-enabled/$DOMAIN"
GIT_REPO="https://github.com/lukegothic/subetupadel_clubes.git"
BRANCH="main"

# Crear directorio de la aplicación si no existe
print_message "Creando directorios de la aplicación..."
mkdir -p $BACKEND_DIR
mkdir -p $FRONTEND_DIR
mkdir -p $BACKEND_DIR/logs

# Actualizar sistema
print_message "Actualizando sistema..."
apt update && apt upgrade -y

# Instalar dependencias
print_message "Instalando dependencias..."
apt install -y nginx certbot python3-certbot-nginx git curl

# Instalar Node.js y npm
print_message "Instalando Node.js y npm..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Instalar PM2 globalmente
print_message "Instalando PM2..."
npm install -g pm2

# Clonar o actualizar repositorio
if [ -d "$APP_DIR/.git" ]; then
  print_message "Actualizando repositorio..."
  cd $APP_DIR
  git pull origin $BRANCH
else
  print_message "Clonando repositorio..."
  git clone -b $BRANCH $GIT_REPO $APP_DIR
fi

# Instalar dependencias del backend
print_message "Instalando dependencias del backend..."
cd $BACKEND_DIR
npm install --production

# Construir frontend
print_message "Construyendo frontend..."
cd $FRONTEND_DIR
print_message "Instalando dependencias del frontend..."
npm install
print_message "Verificando estructura del frontend..."
ls -la
print_message "Iniciando construcción del frontend..."
npm run build

# Configurar variables de entorno
print_message "Configurando variables de entorno..."
if [ -f "$BACKEND_DIR/.env.production" ]; then
  cp $BACKEND_DIR/.env.production $BACKEND_DIR/.env
else
  print_warning "Archivo .env.production no encontrado. Creando .env básico..."
  cat > $BACKEND_DIR/.env << EOF
PORT=3000
NODE_ENV=production
DB_HOST=localhost
DB_PORT=5432
DB_NAME=padel_app
DB_USER=postgres
DB_PASSWORD=your-secure-password
DB_SCHEMA=prod
JWT_SECRET=your-secure-jwt-secret
JWT_EXPIRES_IN=24h
CORS_ORIGIN=https://$DOMAIN
EOF
fi

# Configurar Nginx
print_message "Configurando Nginx..."
if [ -f "$APP_DIR/deployment/nginx.conf" ]; then
  # Reemplazar el dominio en la configuración
  sed "s/your-domain.com/$DOMAIN/g" $APP_DIR/deployment/nginx.conf > $NGINX_CONF
else
  print_warning "Archivo de configuración de Nginx no encontrado. Creando configuración básica..."
  cat > $NGINX_CONF << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        root $FRONTEND_DIR/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
fi

# Habilitar sitio en Nginx
if [ ! -f "$NGINX_ENABLED" ]; then
  print_message "Habilitando sitio en Nginx..."
  ln -s $NGINX_CONF $NGINX_ENABLED
fi

# Verificar configuración de Nginx
print_message "Verificando configuración de Nginx..."
nginx -t

if [ $? -eq 0 ]; then
  print_message "Reiniciando Nginx..."
  systemctl restart nginx
else
  print_error "Error en la configuración de Nginx. Por favor, revise la configuración."
  exit 1
fi

# Configurar certificado SSL con Let's Encrypt
print_message "¿Desea configurar SSL con Let's Encrypt? (y/n)"
read -r configure_ssl

if [ "$configure_ssl" = "y" ]; then
  print_message "Configurando certificado SSL con Let's Encrypt..."
  certbot --nginx -d $DOMAIN -d www.$DOMAIN
fi

# Iniciar aplicación con PM2
print_message "Iniciando aplicación con PM2..."
cd $BACKEND_DIR
pm2 start ecosystem.config.js --env production

# Configurar PM2 para iniciar en el arranque
print_message "Configurando PM2 para iniciar en el arranque..."
pm2 startup
pm2 save

# Mostrar información final
print_message "¡Despliegue completado!"
print_message "La aplicación está disponible en: https://$DOMAIN"
print_message "Para verificar el estado de la aplicación, ejecute: pm2 status"
