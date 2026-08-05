# 🤖 Reglas y Directrices para Agentes de IA (AGENTS.md)

Este documento define el contexto, las reglas de arquitectura y las directrices de código que **cualquier agente de Inteligencia Artificial (IA)** debe seguir al interactuar con, escribir código para, o refactorizar el proyecto `HenoMotitaApp`.

> **⚠️ ADVERTENCIA SOBRE VERSIONES DE EXPO**
> El ecosistema de Expo evoluciona rápidamente. Aunque el proyecto está inicializado con SDK ~54.0.0, **siempre lee y basa tus soluciones en la documentación oficial versionada más reciente (o en v57.0.0 si hay un skill forzado)**: [https://docs.expo.dev/](https://docs.expo.dev/). No asumas que las APIs antiguas de React Native funcionan igual en las nuevas versiones de Expo.

---

## 🏗️ 1. Contexto del Proyecto y Arquitectura

### 1.1 Naturaleza del Proyecto
- **Nombre:** HenoMotitaApp
- **Propósito:** Aplicación móvil para evaluar, geolocalizar y fotografiar árboles afectados por "Heno Motita" (Tillandsia recurvata).
- **Stack Principal:** React Native + Expo + Expo Router + React Native Paper.

### 1.2 Patrones de Navegación (`expo-router`)
- El proyecto utiliza **Expo Router** para la navegación basada en el sistema de archivos (`app/`).
- **NO** utilices `@react-navigation/native` directamente a menos que sea estrictamente necesario para interactuar con librerías de terceros que lo exijan. 
- Utiliza `<Link href="...">` o `router.push('/ruta')` de `expo-router` para la navegación imperativa.
- Mantén la estructura de pestañas dentro de `app/(tabs)/`.

### 1.3 Almacenamiento y Estado
- **Offline-First:** La app debe poder funcionar sin internet. Utiliza `@react-native-async-storage/async-storage` para persistir datos localmente antes de sincronizarlos (pantalla `sync.jsx`).
- **Estado Global:** Utiliza React Context (en `context/`) para estados globales ligeros (ej. preferencias de usuario, estado de autenticación, estado de red).
- **Manejo de Datos Temporales:** Utiliza el directorio `data/` para mocks, pero el objetivo final es consumir APIs en la carpeta `services/`.

---

## 🎨 2. Interfaz de Usuario y Estilos

### 2.1 Librería de Componentes (React Native Paper)
- La aplicación utiliza `react-native-paper` para el diseño UI base.
- **Regla estricta:** Antes de crear un componente desde cero (como un botón, tarjeta, modal o input), verifica si `react-native-paper` tiene uno que cubra la necesidad.
- Si usas `react-native-paper`, utiliza sus temas y variables en lugar de hardcodear colores HEX a menos que sea un requisito específico de diseño.

### 2.2 Estilos Custom (StyleSheet)
- Si un componente de Paper no es suficiente, utiliza `StyleSheet.create` de `react-native`.
- Evita estilos en línea (`style={{...}}`) siempre que sea posible para prevenir re-renders innecesarios y mejorar la legibilidad.
- Utiliza `react-native-safe-area-context` (`SafeAreaView` o hooks) para asegurar que la UI no se superponga con el notch o bordes del dispositivo.

---

## 🔌 3. Manejo de APIs y Hardware

### 3.1 Cámara (`expo-camera`)
- Al trabajar con la cámara, asegúrate SIEMPRE de verificar y solicitar permisos primero (`useCameraPermissions`).
- Provee un fallback UI (pantalla de carga o mensaje) mientras los permisos se conceden.
- Considera el componente `ThirdsOverlay.jsx` existente cuando se requieran guías visuales sobre la cámara.

### 3.2 Localización (`expo-location`)
- Siempre solicita permiso con `Location.requestForegroundPermissionsAsync()`.
- Captura errores en caso de que el GPS del dispositivo esté apagado o no disponible.

---

## 📝 4. Estándares de Código y Limpieza

### 4.1 Componentes React
- Utiliza **Functional Components** y **Hooks**. No utilices Class Components.
- Nombra los archivos de componentes en PascalCase (ej. `MyComponent.jsx`).
- Nombra las rutas en `app/` utilizando kebab-case o convenciones de Expo Router (ej. `[id].jsx`, `_layout.jsx`).

### 4.2 Idioma y Documentación
- **Idioma del Negocio:** Los nombres de variables que refieren a lógica de negocio muy específica pueden mantenerse descriptivos (ej. `arbolId`, `nivelInfestacion`) si el contexto lo amerita, pero prefiere inglés para variables genéricas (`isLoading`, `handlePress`).
- **Comentarios:** Agrega JSDoc a las funciones y servicios principales dentro de `services/` y `context/`.
- **Mensajes para el Usuario:** Todos los textos visibles por el usuario, alertas y prompts deben estar en **Español**, ya que la app está dirigida a usuarios hispanohablantes (evaluadores de campo).

### 4.3 Manejo de Errores
- Utiliza bloques `try/catch` para todas las llamadas asíncronas (async/await).
- Proporciona retroalimentación al usuario en caso de error (Alertas o Toasts) cuando falla una operación de cámara, ubicación o almacenamiento.

---

## 🤖 5. Instrucciones Finales para el Agente

Al generar código:
1. **No inventes dependencias.** Usa las ya instaladas en el `package.json` o solicita permiso explícitamente para añadir una nueva.
2. **Piensa paso a paso.** Si te piden una funcionalidad compleja (ej. "Sincronización de fotos"), primero diseña cómo se guardarán en AsyncStorage y luego cómo se enviarán en batch.
3. **Optimiza los imports.** Asegúrate de importar correctamente desde `react`, `react-native`, y `expo-router`.
8. Siempre que se pueda, desglosa componentes grandes en piezas más pequeñas dentro de la carpeta `components/`.

---

## 🧠 6. Reglas de UX/UI y Psicología de Producto

### 6.1 Patrones Adictivos y Modernos
- Prioriza diseños orientados a la acción. El CTA (Call to Action) principal debe ser lo más destacable en pantalla (estilo "Start" de Duolingo).
- Minimiza el estrés cognitivo: oculta los datos técnicos (ej. IDs, descripciones legales) en menús secundarios, Tooltips o modales. Muestra solo información esencial ("Glanceable") en los Dashboards.
- Emplea gamificación: trata las métricas como rachas (streaks), niveles de salud o progreso visual.
- Personalización: la app debe hablarle al usuario ("Hola [Nombre]", "Tu Árbol"), generando sentido de pertenencia y conexión con el elemento monitoreado.

### 6.2 Iconografía Profesional vs Emojis
- **PROHIBIDO EL USO DE EMOJIS** en la interfaz de usuario (ej. 🌳, 📝, ⭐, 👋, 🌿). Los emojis restan seriedad, son inconsistentes entre sistemas operativos y se ven poco profesionales.
- Utiliza **ÚNICAMENTE** iconos del paquete vector-icons ya instalado en Expo (`@expo/vector-icons`), como `Ionicons` o `MaterialCommunityIcons`.
- Los iconos deben seguir el sistema de color del tema, usualmente pintados con `colors.primary`, `colors.primaryHover`, o los colores de acento correspondientes.
