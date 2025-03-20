#!/bin/bash

# Script para preparar el paquete de despliegue de la aplicación de gestión de clubes de pádel

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

# Configuración
APP_NAME="padel-app"
DEPLOY_DIR="./deploy"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
PACKAGE_NAME="${APP_NAME}_${TIMESTAMP}.zip"

# Crear directorio de despliegue si no existe
print_message "Creando directorio de despliegue..."
mkdir -p $DEPLOY_DIR

# Limpiar compilaciones anteriores del frontend
print_message "Limpiando compilaciones anteriores..."
rm -rf ./frontend/dist

# Instalar dependencias del frontend
print_message "Instalando dependencias del frontend..."
cd ./frontend
npm install
if [ $? -ne 0 ]; then
  print_error "Error al instalar dependencias del frontend"
  exit 1
fi

# Construir frontend
print_message "Construyendo frontend..."
npm run build
if [ $? -ne 0 ]; then
  print_error "Error al construir el frontend"
  exit 1
fi
cd ..

# Instalar dependencias del backend
print_message "Instalando dependencias del backend..."
cd ./backend
npm install
if [ $? -ne 0 ]; then
  print_error "Error al instalar dependencias del backend"
  exit 1
fi
cd ..

# Crear estructura de directorios para el paquete
print_message "Creando estructura de directorios para el paquete..."
mkdir -p $DEPLOY_DIR/frontend
mkdir -p $DEPLOY_DIR/backend
mkdir -p $DEPLOY_DIR/deployment

# Copiar archivos del frontend
print_message "Copiando archivos del frontend..."
cp -r ./frontend/dist $DEPLOY_DIR/frontend/
cp ./frontend/package.json $DEPLOY_DIR/frontend/

# Copiar archivos del backend
print_message "Copiando archivos del backend..."
cp -r ./backend/src $DEPLOY_DIR/backend/
cp ./backend/package.json $DEPLOY_DIR/backend/
cp ./backend/ecosystem.config.js $DEPLOY_DIR/backend/
cp ./backend/.env.production $DEPLOY_DIR/backend/
cp ./backend/.env.demo $DEPLOY_DIR/backend/

# Copiar archivos de despliegue
print_message "Copiando archivos de despliegue..."
cp ./deployment/deploy.sh $DEPLOY_DIR/deployment/
cp ./deployment/nginx.conf $DEPLOY_DIR/deployment/

# Crear archivo README con instrucciones
print_message "Creando archivo README con instrucciones..."
cat > $DEPLOY_DIR/README.md << EOF
# Aplicación de Gestión de Clubes de Pádel

## Instrucciones de Despliegue

### Requisitos previos
- Servidor VPS con Ubuntu Server 22.04 LTS
- Dominio configurado para apuntar a la IP del servidor

### Pasos para el despliegue

1. Descomprima este paquete en su servidor:
   \`\`\`
   unzip $PACKAGE_NAME
   \`\`\`

2. Navegue al directorio de despliegue:
   \`\`\`
   cd $APP_NAME
   \`\`\`

3. Ejecute el script de despliegue como root o con sudo:
   \`\`\`
   sudo bash deployment/deploy.sh
   \`\`\`

4. Siga las instrucciones en pantalla para completar el despliegue.

### Verificación del despliegue

Una vez completado el despliegue, puede verificar el estado de la aplicación con:
\`\`\`
sudo pm2 status
\`\`\`

La aplicación estará disponible en su dominio configurado.

### Solución de problemas

Si encuentra algún problema durante el despliegue, revise los siguientes logs:

- Logs de Nginx: \`/var/log/nginx/error.log\`
- Logs de la aplicación: \`/var/www/padel-app/backend/logs/\`
- Logs de PM2: \`pm2 logs\`

### Contacto

Si necesita asistencia adicional, contacte al equipo de soporte.
EOF

# Crear archivo zip con todo el contenido
print_message "Creando archivo zip con todo el contenido..."
cd $DEPLOY_DIR
zip -r ../$PACKAGE_NAME ./*
cd ..

# Limpiar directorio temporal
print_message "Limpiando directorio temporal..."
rm -rf $DEPLOY_DIR

print_message "¡Paquete de despliegue creado exitosamente!"
print_message "Archivo: $PACKAGE_NAME"
print_message "Este paquete contiene todo lo necesario para desplegar la aplicación en un servidor VPS."
