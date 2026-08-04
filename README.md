# Heno Motita App 🌳📱

![Expo](https://img.shields.io/badge/Expo-1C1E24?style=for-the-badge&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![JavaScript](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E)

Una aplicación móvil desarrollada con **React Native** y **Expo** diseñada para facilitar la evaluación, monitoreo y recolección de datos sobre la infestación de *Heno Motita* (Tillandsia recurvata) en los doseles de los árboles. 

## 📋 Características Principales

- 📸 **Captura Fotográfica**: Utiliza la cámara del dispositivo para tomar fotografías del dosel de los árboles, permitiendo un análisis visual del grado de infestación.
- 📍 **Geolocalización Automática**: Obtiene las coordenadas GPS (latitud y longitud) de cada árbol evaluado en el momento exacto del registro.
- 💾 **Almacenamiento Local**: Guarda los datos de las evaluaciones de manera local mediante `AsyncStorage`, permitiendo el uso de la aplicación en áreas con conectividad limitada (modo offline).
- 🔄 **Sincronización de Datos**: Sincroniza la información recopilada (fotos, ubicación, datos de evaluación) con una base de datos o servidor central cuando hay conexión disponible.
- 🎨 **Interfaz de Usuario Intuitiva**: Diseño moderno y accesible desarrollado con `react-native-paper` y navegación manejada a través de `expo-router`.

## 🛠️ Tecnologías Utilizadas

- **Framework Core**: React Native (0.81.5)
- **Toolchain**: Expo SDK (~54.0.0)
- **Navegación**: Expo Router (~6.0.24)
- **Componentes UI**: React Native Paper (^5.15.3)
- **Almacenamiento**: @react-native-async-storage/async-storage (^3.1.1)
- **Hardware APIs**: 
  - `expo-camera` (Captura de imágenes)
  - `expo-location` (Servicios de geolocalización)

## 🚀 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente en tu entorno de desarrollo:

- [Node.js](https://nodejs.org/) (v18 o superior recomendado)
- [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Expo Go instalado en tu dispositivo físico (iOS o Android) o un emulador configurado.

## ⚙️ Instalación y Configuración

1. **Clonar el repositorio** (si aplica)
   ```bash
   git clone <url-del-repositorio>
   cd HenoMotitaApp
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   # o
   yarn install
   ```

3. **Iniciar el servidor de desarrollo**
   ```bash
   npm run start
   ```

4. **Ejecutar la aplicación**
   - Presiona `a` en la terminal para abrir en el emulador de Android.
   - Presiona `w` para abrir en el navegador web (si está soportado).
   - Escanea el código QR con la aplicación **Expo Go** desde tu dispositivo físico.

## 📂 Estructura del Proyecto

El proyecto sigue una arquitectura modular y organizada basada en las convenciones de Expo Router:

```text
HenoMotitaApp/
├── app/                  # Rutas y pantallas de la app (Expo Router)
│   ├── (tabs)/           # Navegación inferior (ej. sync.jsx, profile.jsx)
│   └── _layout.jsx       # Layout principal de la aplicación
├── assets/               # Imágenes, fuentes e íconos estáticos
├── components/           # Componentes UI reutilizables (ej. ThirdsOverlay.jsx)
├── context/              # Contextos de React para estado global
├── data/                 # Mock data y modelos temporales (ej. mockData.js)
├── services/             # Lógica de negocio, APIs y servicios externos
├── config.js             # Configuraciones globales y variables de entorno
├── app.json              # Configuración y metadatos de Expo (permisos, plugins)
└── package.json          # Dependencias y scripts del proyecto
```

## 🔒 Permisos Requeridos

La aplicación solicita los siguientes permisos en tiempo de ejecución, configurados desde `app.json`:

- **Cámara (`CAMERA`)**: Requerida para tomar fotos de la copa/dosel del árbol.
- **Ubicación (`ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION`)**: Necesaria para etiquetar cada evaluación con su coordenada GPS.
- **Almacenamiento (`READ_EXTERNAL_STORAGE` / `WRITE_EXTERNAL_STORAGE`)**: Utilizados para guardar y leer temporalmente imágenes y datos de evaluaciones locales.

## 🤝 Contribución

Si deseas contribuir a este proyecto, por favor sigue estos pasos:
1. Haz un Fork del proyecto.
2. Crea una rama para tu nueva característica (`git checkout -b feature/NuevaCaracteristica`).
3. Haz commit de tus cambios (`git commit -m 'Añadir Nueva Caracteristica'`).
4. Haz Push a la rama (`git push origin feature/NuevaCaracteristica`).
5. Abre un Pull Request.

## 📄 Licencia

Este proyecto está bajo la Licencia estándar definida en el archivo `LICENSE`. (Revisar el archivo para más detalles).
