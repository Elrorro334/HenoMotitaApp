# Heno Motita App (HenoTrack) 🌳📱

![Expo](https://img.shields.io/badge/Expo-1C1E24?style=for-the-badge&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![JavaScript](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E)

Una aplicación móvil nativa desarrollada con **React Native** y **Expo** diseñada para la evaluación, monitoreo ambiental y recolección de datos sobre la infestación de *Heno Motita* (*Tillandsia recurvata*) en los doseles de los árboles en el Valle del Mezquital (UTTT).

---

## 📋 Características Principales

- 🌿 **Onboarding Interactivo & Slider Gamificado**: Guía paso a paso sobre biología, peligro y soluciones del Heno Motita sin emojis, ofreciendo dopamina visual e intuitiva para los usuarios.
- ⏰ **Lógica Horaria Dinámica (5 Fases)**: 100 frases motivacionales de monitoreo ambiental segmentadas por la hora local del dispositivo (Madrugada, Mañana, Mediodía, Tarde, Noche) e interpoladas con el nombre del usuario.
- 📸 **Cámara Pro HenoTrack 3.0**:
  - Visor reticular HUD con guías esquineras turquesas y badges de cristal para tercios Hawksworth.
  - Controles de Flash (On/Off/Auto), conmutador de cuadrícula y rotación de cámara.
  - Panel de telemetría GPS en tiempo real con precisión en metros y obturador metálico esmeralda.
- 📍 **Geolocalización Automática**: Coordenadas GPS en tiempo real etiquetadas en cada observación de campo.
- 🛡️ **Almacenamiento Seguro Resiliente (`safeStorage`)**: Capa de abstracción tolerante a fallos que conmuta automáticamente entre AsyncStorage, `localStorage` o `memoryStore` (SQLite en dispositivos Android/iOS).
- 🔄 **Sincronización Batch & Edición Offline**: 
  - Visualización y edición en caliente de reportes en cola antes de sincronizar (código de árbol, especie, tercios y notas).
  - Resolución transparente de duplicados 409 cuando el árbol ya existe en el servidor API.
- ⌨️ **Teclado Adaptativo (`KeyboardAvoidingView`)**: Desplazamiento inteligente para evitar que el teclado cubra los campos de entrada de observaciones.
- 🔒 **Sanitización de Errores e Interfaz Pública**: Experiencia libre de jergas técnicas, nombres de bases de datos o enlaces de repositorio. Alertas de error traducidas en español amigable sin códigos HTTP crudos.

---

## 🛠️ Tecnologías Utilizadas

- **Framework Core**: React Native (0.81.5) / Bare Native Project
- **Toolchain**: Expo SDK (~54.0.0)
- **Navegación**: Expo Router (~6.0.24)
- **Componentes UI**: React Native Paper (^5.15.3) & `@expo/vector-icons`
- **Almacenamiento**: `@react-native-async-storage/async-storage` (SQLite) + `safeStorage` fallback
- **Hardware APIs**: 
  - `expo-camera` (Captura de evidencias fotográficas)
  - `expo-location` (Servicios GPS y telemetría)

---

## ⚙️ Instalación y Compilación Nativa (Sin Expo Go)

### 1. Requisitos Previos
- Node.js (v18+)
- Android SDK & Java JDK 17 (para compilaciones nativas Android)

### 2. Instalación de Dependencias
```bash
npm install
```

### 3. Compilación Nativa Directa
```bash
# Compilar e instalar directamente en un teléfono conectado por USB o emulador:
npx react-native run-android

# Ver los logs en tiempo real de la app desde PowerShell:
npx react-native log-android
```
*El ejecutable binario `.apk` quedará ubicado en `android/app/build/outputs/apk/debug/app-debug.apk`*

---

## 📂 Estructura del Proyecto

```text
HenoMotitaApp/
├── android/              # Código y configuración nativa de Android (Gradle, Kotlin, C++)
├── app/                  # Rutas y pantallas de la app (Expo Router)
│   ├── (tabs)/           # Navegación por pestañas (dashboard, history, sync, profile)
│   ├── index.jsx         # Splash, Onboarding Slider y Login/Activación Dinámico
│   ├── camera.jsx        # Visor de cámara pro HUD con telemetría GPS
│   └── results.jsx       # Formulario adaptativo de evaluación Hawksworth
├── components/           # Componentes reutilizables (EvaluationCard, ThirdsOverlay)
├── context/              # AuthContext y manejo global de sesión
├── services/             # API client, safeStorage, offlineStore y timePhrases
├── config.js             # Variables de entorno e identificadores
└── package.json          # Scripts y dependencias del proyecto
```

---

## 📄 Licencia

Este proyecto está bajo la Licencia estándar definida en el archivo `LICENSE`.
