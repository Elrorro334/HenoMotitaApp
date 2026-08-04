# Heno Motita App (HenoTrack) 🌳📱

![Expo](https://img.shields.io/badge/Expo-1C1E24?style=for-the-badge&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![JavaScript](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E)

Aplicación móvil fitosanitaria oficial desarrollada por **Estudiantes de Tecnologías de la Información de la Universidad Tecnológica del Valle del Mezquital (UTTT)** para el proyecto institucional de investigación científica sobre el monitoreo y control del *Heno Motita* (*Tillandsia recurvata*).

---

## 🔬 Proyecto de Investigación Institucional

- **Institución Sede**: Universidad Tecnológica del Valle del Mezquital (UTTT)
- **Docentes Investigadoras Lideres**: Dra. Marisol Reséndiz & Mtra. Odi
- **Desarrollo Tecnológico**: Estudiantes de Tecnologías de la Información (UTTT)
- **Frecuencia de Monitoreo**: Levantamiento de datos en campo cada 15 días.
- **Escala de Evaluación**: Hawksworth Fitosanitario por Tercios (Nivel 0 a 6).
- **Especies Arbóreas Evaluadas**: Huizaches, Mezquites, Nopales y especies vulnerables con presencia de plaga.
- **Alcance Geográfico (8 Municipios de Hidalgo)**:
  1. **Tula de Allende** (UTTT)
  2. **Tepeji del Río** (UTTT)
  3. **Atitalaquia** (UTTT)
  4. **Tlaxcoapan** (UTTT)
  5. **Tepetitlán** (CECYTE)
  6. **Tezontepec de Aldama** (CETAC 2)
  7. **Atotonilco de Tula** (COBAEH)
  8. **Tlahuelilpan** (UAEH)

---

## 📋 Características Principales

- 🌿 **Onboarding Interactivo & Slider Gamificado**: Guía informativa paso a paso sobre biología, impacto ecológico y técnicas de remoción del Heno Motita sin emojis.
- ⏰ **Lógica Horaria Dinámica (5 Fases)**: 100 frases motivacionales de monitoreo ambiental segmentadas por la hora local del dispositivo (Madrugada, Mañana, Mediodía, Tarde, Noche) e interpoladas con el nombre del usuario.
- 📸 **Cámara Pro HenoTrack 3.0**:
  - Visor reticular HUD con guías esquineras turquesas y badges para tercios Hawksworth.
  - Controles de Flash (On/Off/Auto), conmutador de cuadrícula y rotación de cámara.
  - Panel de telemetría GPS en tiempo real con precisión en metros y obturador metálico esmeralda.
- 📍 **Geolocalización Automática**: Coordenadas GPS en tiempo real etiquetadas en cada observación de campo.
- 🛡️ **Almacenamiento Seguro Resiliente (`safeStorage`)**: Capa de abstracción tolerante a fallos que conmuta automáticamente entre AsyncStorage, `localStorage` o `memoryStore` (SQLite en dispositivos Android/iOS).
- 🔄 **Sincronización Batch & Edición Offline**: 
  - Visualización y edición en caliente de reportes en cola antes de sincronizar (código de árbol, especie, tercios y notas).
  - Resolución transparente de duplicados 409 cuando el árbol ya existe en el servidor API.
- ⌨️ **Teclado Adaptativo (`KeyboardAvoidingView`)**: Desplazamiento inteligente para evitar que el teclado cubra los campos de entrada de observaciones.
- 🔒 **Sanitización de Errores e Interfaz Pública**: Experiencia libre de jergas técnicas o enlaces crudos. Alertas traducidas en español amigable.

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

## 📄 Licencia

Este proyecto está bajo la Licencia MIT estándar definida en el archivo [`LICENSE`](./LICENSE), preservando los derechos de autor de la **Universidad Tecnológica del Valle del Mezquital (UTTT)** y el equipo de investigación de la **Dra. Marisol Reséndiz** y la **Mtra. Odi**.
