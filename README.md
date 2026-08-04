# Heno Motita App (HenoTrack) 🌳📱

![DevSecOps Pipeline](https://img.shields.io/badge/DevSecOps-GitHub_Actions-176B52?style=for-the-badge&logo=githubactions&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-1C1E24?style=for-the-badge&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![JavaScript](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E)

Aplicación móvil fitosanitaria oficial desarrollada para el proyecto de investigación científica sobre el monitoreo y control del *Heno Motita* (*Tillandsia recurvata*) en la **Universidad Tecnológica de Tula-Tepeji (UTTT)**.

---

## 🔒 Pipelines de DevSecOps & Automatización (CI/CD)

El proyecto incluye pipelines automatizados de **Seguridad y CI/CD** basados en GitHub Actions (`.github/workflows/`):

1. **🛡️ Secret Leak Detection (Gitleaks)**: Escaneo continuo en cada commit para garantizar que no existan llaves privadas, tokens JWT o credenciales expuestas en código fuente.
2. **📦 Software Composition Analysis (SCA - npm audit & Trivy)**: Auditoría automatizada de vulnerabilidades CVE en paquetes de terceros y dependencias de Node.js.
3. **🔬 Static Application Security Testing (SAST - CodeQL & Semgrep)**: Análisis estático de código JavaScript/React Native para detectar patrones inseguros e inyecciones.
4. **⚡ Quality Gate & Bundle Verification**: Verificación automática de compilación de bundle y calidad de código en cada Push y Pull Request.

---

## 🔬 Créditos y Equipo de Investigación UTTT

### 👩‍🏫 Docentes Investigadoras Líderes
- **Dra. Marisol Reséndiz Vega**
- **Mtra. Odisey Yasmin Porras**

### 👨‍💻 Alumnos Desarrolladores del Proyecto Completo (Equipo de TI UTTT)
- **Dorian Alejandro Trejo Vega**
- **Rodrigo Sánchez Cruz**
- **Jessui Flores Pacheco**
- **Omar Picazo Aranzolo**

---

## 📍 Alcance Fitosanitario del Proyecto

- **Frecuencia de Monitoreo**: Levantamiento de datos en campo cada 15 días.
- **Escala de Evaluación**: Hawksworth Fitosanitario por Tercios (Nivel 0 a 6).
- **Especies Arbóreas Evaluadas**: Huizaches, Mezquites, Nopales y especies vulnerables con presencia de plaga.
- **Red Interinstitucional y Municipios Monitoreados (8)**:
  1. **Tula de Allende** 🤝 Universidad Tecnológica de Tula-Tepeji (UTTT)
  2. **Tepeji del Río** 🤝 Universidad Tecnológica de Tula-Tepeji (UTTT)
  3. **Atitalaquia** 🤝 Universidad Tecnológica de Tula-Tepeji (UTTT)
  4. **Tlaxcoapan** 🤝 Universidad Tecnológica de Tula-Tepeji (UTTT)
  5. **Tepetitlán** 🤝 CECYTE
  6. **Tezontepec de Aldama** 🤝 CETAC 2
  7. **Atotonilco de Tula** 🤝 COBAEH
  8. **Tlahuelilpan** 🤝 UAEH

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

Este proyecto está bajo la Licencia MIT estándar definida en el archivo [`LICENSE`](./LICENSE), reconociendo la autoría de la **Universidad Tecnológica de Tula-Tepeji (UTTT)**, las docentes **Dra. Marisol Reséndiz Vega** y **Mtra. Odisey Yasmin Porras**, y el equipo de alumnos desarrolladores de TI (**Dorian Alejandro Trejo Vega**, **Rodrigo Sánchez Cruz**, **Jessui Flores Pacheco** y **Omar Picazo Aranzolo**).
