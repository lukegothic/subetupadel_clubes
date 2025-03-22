# Guía de Instalación - Aplicación de Gestión de Clubes de Pádel

## Índice
1. [Requisitos Previos](#requisitos-previos)
2. [Instalación en Servidor VPS](#instalación-en-servidor-vps)
3. [Configuración de la Base de Datos](#configuración-de-la-base-de-datos)
4. [Configuración del Backend](#configuración-del-backend)
5. [Configuración del Frontend](#configuración-del-frontend)
6. [Configuración de Nginx](#configuración-de-nginx)
7. [Configuración de SSL](#configuración-de-ssl)
8. [Iniciar la Aplicación](#iniciar-la-aplicación)
9. [Verificación de la Instalación](#verificación-de-la-instalación)
10. [Solución de Problemas](#solución-de-problemas)

## Requisitos Previos

Antes de comenzar la instalación, asegúrese de contar con:

- Un servidor VPS con Ubuntu Server 22.04 LTS
- Acceso SSH al servidor con privilegios de root o sudo
- Un dominio configurado para apuntar a la IP del servidor
- Conocimientos básicos de administración de servidores Linux

### Especificaciones Recomendadas del Servidor

- **CPU**: 2 núcleos o más
- **RAM**: 4GB o más
- **Almacenamiento**: 20GB o más
- **Ancho de banda**: 2TB/mes o más

## Instalación en Servidor VPS

### Paso 1: Actualizar el Sistema

Conéctese a su servidor mediante SSH y actualice el sistema:

```bash
ssh usuario@ip_del_servidor
sudo apt update
sudo apt upgrade -y
```

### Paso 2: Instalar Dependencias

Instale las dependencias necesarias:

```bash
sudo apt install -y nginx certbot python3-certbot-nginx git curl
```

### Paso 3: Instalar Node.js

Instale Node.js 18.x:

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

Verifique la instalación:

```bash
node -v  # Debería mostrar v18.x.x
npm -v   # Debería mostrar 8.x.x o superior
```

### Paso 4: Instalar PostgreSQL

Instale PostgreSQL:

```bash
sudo apt install -y postgresql postgresql-contrib
```

Verifique la instalación:

```bash
sudo systemctl status postgresql  # Debería mostrar "active (running)"
```

### Paso 5: Instalar PM2

Instale PM2 globalmente:

```bash
sudo npm install -g pm2
```

## Configuración de la Base de Datos

### Paso 1: Configurar PostgreSQL

Acceda a PostgreSQL como usuario postgres:

```bash
sudo -i -u postgres
psql
```

### Paso 2: Crear Usuario y Base de Datos

En la consola de PostgreSQL, ejecute:

```sql
CREATE USER padel_admin WITH PASSWORD 'su_contraseña_segura';
CREATE DATABASE padel_app;
GRANT ALL PRIVILEGES ON DATABASE padel_app TO padel_admin;
\c padel_app
CREATE SCHEMA dev;
CREATE SCHEMA demo;
CREATE SCHEMA prod;
GRANT ALL ON SCHEMA dev, demo, prod TO padel_admin;
\q
```

Salga del usuario postgres:

```bash
exit
```

### Paso 3: Importar Esquema de Base de Datos

Si tiene un archivo SQL con el esquema de la base de datos:

```bash
sudo -u postgres psql -d padel_app -f /ruta/al/schema.sql
```

## Configuración del Backend

### Paso 1: Clonar o Descomprimir el Repositorio

Si está utilizando el paquete de despliegue:

```bash
mkdir -p /var/www/stp-clubes
unzip stp-clubes_package.zip -d /var/www/stp-clubes
```

Si está clonando desde un repositorio Git:

```bash
git clone https://url-del-repositorio.git /var/www/stp-clubes
```

### Paso 2: Configurar Variables de Entorno

Cree o edite el archivo `.env` en el directorio del backend:

```bash
cd /var/www/stp-clubes/backend
cp .env.production .env
```

Edite el archivo `.env` con sus configuraciones:

```bash
nano .env
```

Asegúrese de configurar correctamente:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET` (use una cadena aleatoria segura)
- `CORS_ORIGIN` (su dominio)

### Paso 3: Instalar Dependencias del Backend

```bash
cd /var/www/stp-clubes/backend
npm install --production
```

## Configuración del Frontend

### Paso 1: Instalar Dependencias del Frontend

```bash
cd /var/www/stp-clubes/frontend
npm install
```

### Paso 2: Construir el Frontend

```bash
npm run build
```

Esto creará una carpeta `dist` con los archivos estáticos optimizados.

## Configuración de Nginx

### Paso 1: Crear Configuración de Nginx

Cree un archivo de configuración para su sitio:

```bash
sudo nano /etc/nginx/sites-available/stp-clubes
```

Copie la configuración de Nginx proporcionada en el archivo `deployment/nginx.conf`, reemplazando `your-domain.com` con su dominio real.

### Paso 2: Habilitar el Sitio

```bash
sudo ln -s /etc/nginx/sites-available/stp-clubes /etc/nginx/sites-enabled/
sudo nginx -t  # Verificar la configuración
sudo systemctl restart nginx
```

## Configuración de SSL

### Paso 1: Obtener Certificado SSL

Utilice Certbot para obtener un certificado SSL gratuito:

```bash
sudo certbot --nginx -d su-dominio.com -d www.su-dominio.com
```

Siga las instrucciones en pantalla para completar el proceso.

### Paso 2: Verificar Renovación Automática

Certbot configura automáticamente la renovación de certificados. Puede verificarlo con:

```bash
sudo certbot renew --dry-run
```

## Iniciar la Aplicación

### Paso 1: Iniciar el Backend con PM2

```bash
cd /var/www/stp-clubes/backend
pm2 start ecosystem.config.js --env production
```

### Paso 2: Configurar PM2 para Iniciar en el Arranque

```bash
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
pm2 save
```

## Verificación de la Instalación

### Paso 1: Verificar el Estado de PM2

```bash
pm2 status
```

Debería mostrar que la aplicación está en estado "online".

### Paso 2: Verificar los Logs

```bash
pm2 logs
```

No debería mostrar errores.

### Paso 3: Verificar Nginx

```bash
sudo systemctl status nginx
```

Debería mostrar que Nginx está "active (running)".

### Paso 4: Probar la Aplicación

Abra un navegador y visite su dominio (https://su-dominio.com). Debería cargar la página de inicio de sesión de la aplicación.

## Solución de Problemas

### Problema: La Aplicación No Inicia

Verifique los logs de PM2:

```bash
pm2 logs
```

Asegúrese de que las variables de entorno estén configuradas correctamente:

```bash
cat /var/www/stp-clubes/backend/.env
```

### Problema: Error de Conexión a la Base de Datos

Verifique que PostgreSQL esté en ejecución:

```bash
sudo systemctl status postgresql
```

Verifique que puede conectarse a la base de datos:

```bash
sudo -u postgres psql -d padel_app -c "SELECT 1"
```

### Problema: Nginx Muestra Error 502 Bad Gateway

Verifique que el backend esté en ejecución:

```bash
pm2 status
```

Verifique los logs de Nginx:

```bash
sudo tail -f /var/log/nginx/error.log
```

### Problema: Certificado SSL No Funciona

Verifique el estado de los certificados:

```bash
sudo certbot certificates
```

Intente renovar manualmente:

```bash
sudo certbot renew
```

### Problema: Permisos Insuficientes

Asegúrese de que los directorios tengan los permisos correctos:

```bash
sudo chown -R $USER:$USER /var/www/stp-clubes
sudo chmod -R 755 /var/www/stp-clubes
```

---

Si encuentra problemas que no puede resolver con esta guía, por favor contacte al equipo de soporte técnico.
