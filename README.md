# 📸 Fotos de Producto Pro

App para generar fotos profesionales de productos con Gemini AI, guardadas automáticamente en Google Drive.

---

## 🚀 Setup en Vercel

### Paso 1: Subir el código a GitHub

1. Creá un repo nuevo en GitHub
2. Subí todos estos archivos
3. Importá el repo en [vercel.com](https://vercel.com)

---

### Paso 2: Obtener la API Key de Gemini

1. Andá a [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Creá una API Key nueva
3. Copiá el valor → lo vas a usar como `GEMINI_API_KEY`

---

### Paso 3: Configurar Google Drive (Service Account)

Este es el paso más largo, pero se hace una sola vez:

#### 3.1 Crear el proyecto en Google Cloud
1. Andá a [console.cloud.google.com](https://console.cloud.google.com)
2. Creá un proyecto nuevo (o usá uno existente)
3. Activá la **Google Drive API**:
   - Ir a "APIs y Servicios" → "Biblioteca"
   - Buscar "Google Drive API" → Activar

#### 3.2 Crear Service Account
1. Ir a "APIs y Servicios" → "Credenciales"
2. Clic en "+ Crear Credenciales" → "Cuenta de servicio"
3. Dale un nombre (ej: `fotos-producto`)
4. Rol: **Editor** (o "Drive API Service Agent")
5. Clic en "Crear y continuar"

#### 3.3 Descargar la clave JSON
1. En la lista de Service Accounts, hacé clic en la que creaste
2. Ir a la pestaña "Claves"
3. "Agregar clave" → "Crear clave nueva" → **JSON**
4. Se descarga un archivo JSON. Abrilo y copiá:
   - `client_email` → es tu `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → es tu `GOOGLE_PRIVATE_KEY`

#### 3.4 Crear la carpeta en Drive y compartirla
1. Andá a [drive.google.com](https://drive.google.com)
2. Creá una carpeta nueva, ej: "Fotos Productos"
3. Click derecho → "Compartir"
4. Pegá el `client_email` del service account y dale rol **Editor**
5. Copiá el ID de la carpeta de la URL:
   - URL: `https://drive.google.com/drive/folders/ESTE_ES_EL_ID`
   - Ese ID largo es tu `GOOGLE_DRIVE_FOLDER_ID`

---

### Paso 4: Variables de entorno en Vercel

En el dashboard de Vercel, tu proyecto → Settings → Environment Variables:

| Variable | Valor |
|----------|-------|
| `APP_PASSWORD` | La contraseña que querés usar |
| `JWT_SECRET` | Un string largo aleatorio (ej: `mi-super-secreto-123456789-abc`) |
| `GEMINI_API_KEY` | La key de Gemini |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | El email del service account |
| `GOOGLE_PRIVATE_KEY` | La private key del JSON (incluí las comillas y `\n`) |
| `GOOGLE_DRIVE_FOLDER_ID` | El ID de la carpeta de Drive |

> ⚠️ **IMPORTANTE para GOOGLE_PRIVATE_KEY**: 
> Pegá el valor tal cual está en el JSON, incluyendo los `\n`.
> En Vercel, pegalo entre comillas en el campo de texto.

---

### Paso 5: Deploy

1. En Vercel, hacé clic en "Deploy"
2. Esperá que compile (~2 minutos)
3. ¡Listo! Tu app está online

---

## 💡 Uso

1. Entrá a tu URL de Vercel
2. Ingresá la contraseña que configuraste
3. Subí la foto del producto
4. Escribí el nombre del producto
5. Elegí los estilos y la cantidad de variaciones
6. Hacé clic en "Generar"
7. Las fotos se guardan automáticamente en tu Google Drive

---

## 💰 Costos aproximados

| Servicio | Costo |
|----------|-------|
| Vercel (Hobby) | Gratis |
| Gemini API | ~$0.001 por imagen generada |
| Google Drive | Gratis hasta 15GB |

Para uso moderado (50-100 fotos/mes), el costo total es casi **$0**.

---

## ⏱️ Timeouts

Vercel Hobby tiene un límite de 60 segundos por request. Si generás muchas fotos a la vez puede cortarse.
**Solución**: usá máximo 2 estilos × 1 variación = 2 fotos por vez, o upgradeá a Vercel Pro.
