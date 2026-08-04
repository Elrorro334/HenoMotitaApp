export function getDayPhase(hour) {
  if (hour >= 0 && hour <= 5) return 'madrugada';
  if (hour >= 6 && hour <= 11) return 'manana';
  if (hour >= 12 && hour <= 14) return 'mediodia';
  if (hour >= 15 && hour <= 19) return 'tarde';
  return 'noche';
}

export const PRE_LOGIN_PHRASES = {
  madrugada: [
    'El monitoreo forestal no descansa. Inicia sesion para reportar incidencias nocturnas de heno motita.',
    'Madrugar ayuda a identificar la plaga a primera hora. Accede a tu cuenta de inspector.',
    'Tus reportes preventivos evitan la propagacion del heno motita. Inicia sesion ahora.',
    'Prepárate antes de que salga el sol. Accede para planificar la ruta de limpieza de hoy.',
    'Protege el ecosistema desde temprano. Inicia sesion y registra tus observaciones pendientes.',
    'El heno motita debilita los arboles en silencio. Entra para mantener la vigilancia activa.',
    'La deteccion temprana salva especies forestales. Inicia sesion en tu cuenta de cuadrilla.',
    'Deja listos tus reportes de campo antes de iniciar la jornada. Accede a la plataforma.',
    'Inspecciones listas a primera hora. Inicia sesion para coordinar tu cuadrilla de alumnos.',
    'La naturaleza cuenta contigo las veinticuatro horas. Accede a HenoTrack.'
  ],
  manana: [
    'Comienza tu dia con energia. Inicia sesion para registrar las evaluaciones de heno motita.',
    'La luz de la manana es perfecta para fotografiar la plaga. Accede a tu cuenta de inspector.',
    'Inicia la jornada de campo con tu cuadrilla. Inicia sesion para ver tus arboles asignados.',
    'Mantén los arboles sanos desde temprano. Accede y reporta tus nuevas observaciones.',
    'Registra el estado de Tillandsia recurvata hoy. Inicia sesion para comenzar la inspeccion.',
    'Cada arbol limpio cuenta para el Valle del Mezquital. Accede para continuar tu labor.',
    'Activa tu jornada de monitoreo ambiental. Inicia sesion ahora.',
    'Organiza tu equipo de trabajo para las inspecciones de hoy. Accede a HenoTrack.',
    'Revisa que arboles necesitan limpieza manual esta manana. Inicia sesion.',
    'Tus observaciones de hoy son clave para frenar la plaga. Accede a tu cuenta institucional.'
  ],
  mediodia: [
    'Aprovecha el descanso del mediodia para subir tus reportes de heno motita. Inicia sesion.',
    'Sube tus fotos de inspeccion a la sombra. Accede a tu cuenta de HenoTrack.',
    'Registra tus observaciones antes de la proxima clase. Inicia sesion de estudiante.',
    'Las cuadrillas siguen activas a mitad del dia. Accede para actualizar tu progreso.',
    'Evita retrasos reportando tus hallazgos ahora mismo. Inicia sesion de inspector.',
    'Protege el arbolado de la universidad a mediodia. Accede y actualiza tu cuadrilla.',
    'Sincroniza tus registros pendientes mientras descansas. Inicia sesion ahora.',
    'Tus datos de campo ayudan a planificar tratamientos efectivos. Accede a HenoTrack.',
    'Asegura tus evidencias de Tillandsia recurvata a mitad de jornada. Inicia sesion.',
    'Revisa el avance de monitoreo de tu equipo antes de comer. Accede aqui.'
  ],
  tarde: [
    'Registra las ultimas evaluaciones del dia. Inicia sesion para no perder tus datos.',
    'Antes de terminar tu jornada de campo, sube tus observaciones de heno motita. Accede.',
    'La tarde es clave para el mantenimiento manual de los arboles. Inicia sesion.',
    'Manten al dia el estatus de tus arboles asignados. Accede a tu cuenta de alumno.',
    'Evita que la plaga se extienda antes del anochecer. Inicia sesion ahora.',
    'Deja tu cola de sincronizacion vacia esta tarde. Accede a HenoTrack.',
    'Sube las evidencias fotograficas tomadas durante el dia. Inicia sesion de inspector.',
    'Protege las ramas debiles reportando a tiempo esta tarde. Accede ahora.',
    'Tu cuadrilla avanza en el rescate forestal. Inicia sesion para ver el tablero.',
    'Finaliza tus tareas de monitoreo ambiental del dia. Accede a tu cuenta institucional.'
  ],
  noche: [
    'Deja tus reportes listos para manana. Inicia sesion y asegura tus registros.',
    'Planifica las inspecciones del dia siguiente desde casa. Accede a tu cuenta.',
    'Revisa los datos acumulados de tu cuadrilla esta noche. Inicia sesion en HenoTrack.',
    'La prevencion ambiental se planea de noche. Accede para organizar tus rutas de campo.',
    'Sube tus observaciones pendientes antes de dormir. Inicia sesion en la app.',
    'Asegura tus inspecciones guardadas en tu dispositivo. Accede para sincronizar.',
    'Deja todo listo para combatir el heno motita manana temprano. Inicia sesion.',
    'Descansa con la tranquilidad de haber reportado tus arboles. Accede a tu cuenta.',
    'El registro nocturno previene retrasos de entrega. Inicia sesion ahora.',
    'Protege la salud del arbolado universitario manana. Accede para preparar tu agenda.'
  ]
};

export const POST_LOGIN_PHRASES = {
  madrugada: [
    'Hola [Nombre], gracias por tu compromiso nocturno con el monitoreo ambiental.',
    '[Nombre], las inspecciones a primera hora evitan la propagacion del heno motita.',
    'Listos para el registro temprano, [Nombre]. Sube tus reportes de heno motita.',
    '[Nombre], prepara la ruta de tu cuadrilla para cuando salga el sol.',
    'El control biologico no descansa, [Nombre]. Aqui tienes tus arboles asignados.',
    '[Nombre], gracias por proteger los arboles del Valle del Mezquital a esta hora.',
    'Bienvenido de vuelta [Nombre]. Registra tus observaciones pendientes del heno motita.',
    '[Nombre], recuerda que la deteccion oportuna es la mejor defensa del arbol.',
    'Mantén la vigilancia activa, [Nombre]. Revisa el estatus de tu cuadrilla.',
    '[Nombre], tu esfuerzo temprano marca la diferencia para salvar el bosque universitario.'
  ],
  manana: [
    'Excelente manana [Nombre]. Comencemos la inspeccion del heno motita.',
    '[Nombre], aprovecha la luz matutina para capturar fotos de las ramas afectadas.',
    'Bienvenido [Nombre]. Tu cuadrilla tiene arboles asignados esperando evaluacion.',
    '[Nombre], iniciemos el dia registrando los niveles de Tillandsia recurvata.',
    'Que tengas un gran dia de campo, [Nombre]. Sube tus reportes de hoy.',
    '[Nombre], mantengamos sanos los arboles de la UTTT esta manana.',
    'Comienza la jornada con energia [Nombre]. Accede a tus herramientas de control.',
    '[Nombre], revisa tu cola de sincronizacion fuera de linea antes de salir al campo.',
    '[Nombre], recuerda usar varas largas si detectas heno motita alto en las copas.',
    'Tu reporte matutino es vital, [Nombre]. Revisa tus tareas de monitoreo de hoy.'
  ],
  mediodia: [
    'Buen provecho [Nombre]. Revisa tus registros de heno motita de esta jornada.',
    '[Nombre], aprovecha este descanso para sincronizar tus reportes completados.',
    'Saludos a mitad de jornada, [Nombre]. Revisa las observaciones de tu cuadrilla.',
    '[Nombre], excelente trabajo hasta ahora. Continua reportando arboles afectados.',
    'Registra tus evidencias antes de que el sol este en lo alto, [Nombre].',
    '[Nombre], no dejes para despues las evaluaciones del mediodia.',
    'Mitad del dia superada, [Nombre]. Sigue vigilando la Tillandsia recurvata.',
    '[Nombre], recuerda depositar el heno motita retirado en bolsas de plastico cerradas.',
    'Protege la fotosintesis de los arboles hoy, [Nombre]. Continua tu monitoreo.',
    '[Nombre], tu esfuerzo de hoy ayudara a planificar las podas de la cuadrilla.'
  ],
  tarde: [
    'Buena tarde [Nombre]. Completemos los registros de heno motita de hoy.',
    '[Nombre], deja listos tus reportes de campo antes de terminar las clases.',
    'La tarde es perfecta para la limpieza manual, [Nombre]. Sube tu progreso.',
    '[Nombre], sincroniza tus observaciones pendientes para cerrar el dia.',
    'Buen trabajo hoy, [Nombre]. Tus reportes de heno motita ya estan a salvo.',
    '[Nombre], revisa el estatus final de tus arboles asignados esta tarde.',
    'Evita la propagacion por el viento hoy, [Nombre]. Registra tus hallazgos.',
    '[Nombre], ayuda a tu cuadrilla a finalizar las metas de monitoreo ambiental.',
    'Excelente avance esta tarde, [Nombre]. Manten el control de la plaga al dia.',
    '[Nombre], tus evidencias fotograficas estan listas para ser validadas.'
  ],
  noche: [
    'Buenas noches [Nombre]. Revisa tus estadisticas de control de heno motita de hoy.',
    '[Nombre], deja planificada la jornada de campo de mañana para descansar tranquilo.',
    'Gracias por tu labor de hoy, [Nombre]. Todo tu progreso quedo registrado.',
    '[Nombre], recuerda que tus observaciones fuera de linea se sincronizaran al conectar.',
    'Descansa [Nombre]. Mañana continuaremos combatiendo el heno motita.',
    '[Nombre], verifica que tus reportes quincenales esten completos esta noche.',
    'Todo listo para mañana, [Nombre]. Buen descanso de monitoreo forestal.',
    '[Nombre], tu aporte a la ecologia del Valle del Mezquital fue valioso hoy.',
    'Deja tus tareas de cuadrilla cerradas, [Nombre]. Tu historial esta actualizado.',
    '[Nombre], que pases una buena noche. El sistema HenoTrack guardo tus datos.'
  ]
};

export function getRandomPhrase(type, name = '') {
  const now = new Date();
  const phase = getDayPhase(now.getHours());
  const phrasesList = type === 'pre-login' ? PRE_LOGIN_PHRASES[phase] : POST_LOGIN_PHRASES[phase];
  const randomIndex = Math.floor(Math.random() * phrasesList.length);
  const phrase = phrasesList[randomIndex];
  
  if (type === 'post-login') {
    return phrase.replace(/\[Nombre\]/g, name);
  }
  return phrase;
}
