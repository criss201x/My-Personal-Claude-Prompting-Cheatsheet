// ─────────────────────────────────────────────────────────────────────────────
// Claude Prompting Cheatsheet — Datos de prompts
// Para agregar un prompt nuevo: copia el bloque { title, tag, prompt, tip, model }
// dentro de la categoría correcta y ajusta el contenido.
// Modelos disponibles: "Opus 4.6" | "Sonnet 4.6" | "Haiku 4.5"
// ─────────────────────────────────────────────────────────────────────────────

const categories = [
  {
    id: "learning",
    label: "Aprendizaje",
    icon: "◈",
    color: "#00E5FF",
    accent: "#003D45",
    patterns: [
      {
        title: "Explicación desde primeros principios",
        tag: "Conceptual",
        prompt: `Explícame [CONCEPTO] como si nunca hubiera escuchado de él.

<instrucciones>
- Empieza desde los fundamentos más básicos (matemáticos o teóricos)
- Construye paso a paso hacia aplicaciones prácticas y contemporáneas
- Usa al menos 3 analogías de dominios diferentes
- Señala qué intuiciones profundas debo desarrollar y dónde la intuición común falla
- Cuando no estés seguro de algo, dilo explícitamente
</instrucciones>

<formato_respuesta>
1. Fundamentos (lo mínimo que necesito entender)
2. Construcción progresiva (añadiendo complejidad)
3. Analogías de múltiples dominios
4. Trampas intuitivas (dónde la mayoría se equivoca)
5. 2-3 preguntas para validar que realmente entiendo
</formato_respuesta>`,
        tip: "Opus: activa extended thinking para temas con múltiples capas de abstracción. Sonnet: suficiente para conceptos bien documentados. Las XML tags ayudan a Claude a separar instrucciones de formato.",
        model: "Opus 4.6",
      },
      {
        title: "Mapa mental de un campo",
        tag: "Exploración",
        prompt: `Dame un mapa estructurado de [CAMPO/ÁREA].

<estructura>
1. Conceptos núcleo (sin los que nada funciona)
2. Herramientas y técnicas principales
3. Conexiones no obvias entre sub-áreas
4. Las 3 preguntas abiertas más importantes del área
5. Ruta de aprendizaje: qué aprenderías en este orden si empezaras hoy
</estructura>

<restricciones>
- Prioriza profundidad sobre amplitud
- Distingue entre lo que SABES con certeza y lo que es tu mejor estimación
- Si hay debates abiertos en el campo, menciónalos sin tomar partido
</restricciones>`,
        tip: "Sonnet: excelente para estructuración clara a buen costo. Sube a Opus solo si el campo es muy interdisciplinario. Las restricciones en XML evitan respuestas genéricas.",
        model: "Sonnet 4.6",
      },
      {
        title: "Sócrates adversarial",
        tag: "Comprensión profunda",
        prompt: `Voy a explicarte [CONCEPTO] con mis propias palabras. Tu rol es ser un tutor socrático riguroso.

<reglas>
- Identifica gaps, imprecisiones o suposiciones incorrectas en mi explicación
- Hazme preguntas que revelen si realmente entiendo o solo memoricé
- No me des la respuesta directamente — guíame con preguntas
- Si mi explicación es correcta, desafíame con un caso edge
- Etiqueta tu confianza en cada observación: [seguro] / [probable] / [especulativo]
</reglas>

<mi_explicacion>
[TU EXPLICACIÓN AQUÍ]
</mi_explicacion>`,
        tip: "Opus: su extended thinking le permite detectar inconsistencias sutiles que Sonnet pasa por alto. Ideal para temas donde crees que entiendes pero quieres verificar a fondo.",
        model: "Opus 4.6",
      },
      {
        title: "Paper académico → comprensión",
        tag: "Research",
        prompt: `Analiza este paper/abstract y responde con honestidad epistémica.

<paper>
[PEGA AQUÍ EL PAPER O ABSTRACT]
</paper>

<preguntas>
1. ¿Qué problema resuelve y por qué importa?
2. ¿Cuál es la idea central? (máximo 2 oraciones)
3. ¿Qué asumen que es verdad y podría no serlo?
4. ¿Cómo se relaciona con [ÁREA QUE CONOZCO]?
5. ¿Qué pregunta haría el revisor más exigente?
</preguntas>

Si el paper toca áreas donde tu conocimiento es limitado, dilo claramente en vez de especular.`,
        tip: "Sonnet: suficiente para papers estándar. Usa Opus si el paper es muy denso o interdisciplinario. Delimitar el paper con XML tags mejora la precisión de las referencias.",
        model: "Sonnet 4.6",
      },
      {
        title: "Construcción de modelos mentales",
        tag: "Mental Models",
        prompt: `Quiero construir un modelo mental sólido de [TEMA COMPLEJO].

<proceso>
1. ¿Cuál es el sistema/mecanismo fundamental? (la explicación mínima viable)
2. Agrega complejidad paso a paso (una variable a la vez)
3. Dónde falla el modelo: casos edge, excepciones, cuándo NO aplica
4. Analogías externas: ¿qué sistemas que ya conozco funcionan de forma similar?
5. Predicción: usando este modelo, ¿qué pasaría si [ESCENARIO HIPOTÉTICO]?
6. Falsificación: ¿cómo SABRÍA si mi modelo está equivocado?
</proceso>

<objetivo>
Que entienda el PATRÓN subyacente, no que memorice detalles.
Prefiero un modelo simple y correcto a uno completo pero confuso.
</objetivo>`,
        tip: "Opus con extended thinking: construye marcos conceptuales más coherentes al razonar internamente antes de responder. El tag <objetivo> guía el nivel de abstracción.",
        model: "Opus 4.6",
      },
      {
        title: "Flashcards y resúmenes rápidos",
        tag: "Memorización",
        prompt: `Genera material de estudio conciso para [TEMA].

<contenido_fuente>
[PEGA AQUÍ: apuntes, capítulo, artículo o lista de conceptos]
</contenido_fuente>

<formato_salida>
Genera exactamente:
1. 10-15 flashcards en formato: Pregunta → Respuesta (máximo 2 oraciones por respuesta)
2. Resumen ejecutivo del tema en máximo 5 bullet points
3. Los 3 conceptos más difíciles explicados en 1 oración cada uno
4. Mnemotécnicos si aplican
</formato_salida>

<restricciones>
- Prioriza lo que es más probable que aparezca en un examen o se necesite en la práctica
- No incluyas información trivial o de relleno
- Cada flashcard debe testear comprensión, no memorización literal
</restricciones>`,
        tip: "Haiku: ideal por su velocidad y bajo costo — perfecto para generar material de estudio en lote. La calidad es suficiente para flashcards y resúmenes directos.",
        model: "Haiku 4.5",
      },  {
    title: "Aprendizaje desde el error",
    tag: "Diagnóstico",
    prompt: `Cometí un error en [TAREA: examen, ejercicio, implementación]. Quiero aprender de él, no solo corregirlo.

<mi_error>
Lo que hice: [DESCRIBE TU SOLUCIÓN O RAZONAMIENTO]
Lo correcto / lo que debí hacer: [SI LO SABES, DESCRÍBELO]
</mi_error>

<analisis_requerido>
1. ¿Cuál fue el error de pensamiento subyacente? (no el error superficial — la causa raíz)
2. ¿Qué concepto o principio no tenía bien interiorizado?
3. ¿Este error revela un patrón más general que debo corregir?
4. ¿Cómo debería haber razonado desde el inicio? (muestra el proceso correcto, no solo la respuesta)
5. ¿Qué pregunta debería hacerme en el futuro para detectar este tipo de error antes de cometerlo?
</analisis_requerido>

<restriccion>
No quiero solo la solución correcta. Quiero entender POR QUÉ mi razonamiento falló.
</restriccion>`,
    tip: "Opus: su extended thinking le permite rastrear la causa raíz epistémica del error, no solo señalar qué estuvo mal. El prompt distingue explícitamente error superficial de error de pensamiento.",
    model: "Opus 4.6",
  },
  {
    title: "Lectura activa de un capítulo",
    tag: "Lectura Profunda",
    prompt: `Voy a leer [CAPÍTULO / SECCIÓN DE LIBRO] de [AUTOR/LIBRO]. Prepárame para una lectura activa.

<material>
Título/tema del capítulo: [TÍTULO]
Resumen breve si lo tienes: [OPCIONAL — PEGA EL ABSTRACT O INTRO]
</material>

<preparacion>
ANTES de leer — genera:
1. 5 preguntas que debería poder responder después de leer bien este capítulo
2. Conceptos que probablemente aparecerán y que debo entender previamente
3. Una hipótesis: ¿qué argumento principal CREO que defenderá el autor?

DURANTE la lectura — señales de alarma:
4. Qué frases o términos indican que estoy perdiendo el hilo
5. En qué momento debo parar, releer y procesar antes de continuar

DESPUÉS de leer — preguntas de verificación:
6. ¿Cómo sabré si realmente entendí el capítulo vs. solo lo leí?
</preparacion>`,
    tip: "Sonnet: excelente para estructurar el proceso de lectura activa. Úsalo antes de leer papers densos o capítulos de libro de texto. La preparación previa mejora la comprensión en un 30-40% según investigación de metacognición.",
    model: "Sonnet 4.6",
  },
  {
    title: "Teoría → implementación mínima",
    tag: "Práctica Dirigida",
    prompt: `Acabo de estudiar [CONCEPTO TEÓRICO] y necesito aterrizarlo en código mínimo.

<concepto>
[DESCRIBE EL CONCEPTO QUE ACABAS DE APRENDER]
</concepto>

<objetivo>
No quiero un ejemplo genérico de internet. Quiero el ejemplo MÁS PEQUEÑO posible que:
1. Demuestre el concepto central sin distracciones
2. Falle de la manera correcta si lo implemento mal
3. Permita experimentar cambiando UNA variable a la vez

<entregable>
1. Ejemplo mínimo en [LENGUAJE] (menos de 30 líneas)
2. Qué parte del código corresponde exactamente a qué parte de la teoría
3. 3 experimentos: modifica X → espera ver Y → así validas que entiendes
4. Una extensión: el siguiente paso natural si quiero ver algo más complejo
</entregable>`,
    tip: "Haiku: rápido para generar ejemplos mínimos funcionales — ideal para iterar rápido entre 'estudiar concepto → ver código → experimentar'. Sube a Sonnet si el concepto involucra lógica de concurrencia o estructuras complejas.",
    model: "Haiku 4.5",
  },
  {
    title: "Comparación de definiciones entre fuentes",
    tag: "Reconciliación",
    prompt: `Encontré definiciones diferentes de [CONCEPTO] en distintas fuentes y necesito reconciliarlas.

<fuentes>
Fuente 1 ([LIBRO/AUTOR]): [CITA O PARÁFRASIS DE LA DEFINICIÓN]
Fuente 2 ([LIBRO/AUTOR]): [CITA O PARÁFRASIS DE LA DEFINICIÓN]
Fuente 3 ([OPCIONAL]): [DEFINICIÓN]
</fuentes>

<analisis>
1. ¿Coinciden en el núcleo o son genuinamente distintas?
2. ¿Están hablando del mismo fenómeno o de aspectos diferentes?
3. ¿Hay una definición que sea estrictamente más general que las otras?
4. ¿En qué contexto o tradición académica usa cada una su definición?
5. ¿Cuál adoptarías tú y por qué? (o cómo las integrarías)
6. Definición canónica sugerida que reconcilie lo mejor de cada fuente
</analisis>`,
    tip: "Sonnet: muy capaz para análisis semántico comparativo. Este patrón es especialmente útil en CS teórica donde términos como 'complejidad', 'abstracción' o 'tipo' tienen definiciones distintas según la escuela.",
    model: "Sonnet 4.6",
  },

    ],
  },
  {
    id: "code",
    label: "Código",
    icon: "⟨/⟩",
    color: "#B9FF66",
    accent: "#263000",
    patterns: [
      {
        title: "Code review profundo",
        tag: "Calidad",
        prompt: `Revisa este código con máxima criticidad.

<codigo lenguaje="[LENGUAJE]">
[TU CÓDIGO AQUÍ]
</codigo>

<criterios>
- Corrección: ¿hace EXACTAMENTE lo que dice? Edge cases y off-by-one errors
- Seguridad: invariantes rotos, inyecciones, validación insuficiente (OWASP top 10)
- Rendimiento: Big O (tiempo y espacio), constantes ocultas, cuellos de botella
- Mantenibilidad: deuda técnica, acoplamiento, testing gaps
- Escalabilidad: ¿qué se rompe con 10x carga en 6 meses?
</criterios>

<formato>
Para cada hallazgo: [SEVERIDAD: alta/media/baja] + línea(s) afectada(s) + por qué es problema + fix sugerido.
</formato>`,
        tip: "Opus: superior detectando vulnerabilidades sutiles y razonando sobre implicaciones a largo plazo. Sonnet: suficiente para reviews de código estándar. El tag <formato> evita respuestas vagas.",
        model: "Opus 4.6",
      },
      {
        title: "Debug por razonamiento",
        tag: "Debugging",
        prompt: `Tengo un bug. Antes de darme soluciones, ayúdame a razonar sobre las causas.

<contexto>
Lenguaje/framework: [LENGUAJE]
Qué debería hacer: [RESULTADO ESPERADO]
Qué hace realmente: [COMPORTAMIENTO ACTUAL]
</contexto>

<codigo>
[TU CÓDIGO AQUÍ]
</codigo>

<instrucciones>
1. Lista tus hipótesis ordenadas por probabilidad
2. Para cada hipótesis, sugiere qué agregaría (log, assert, test) para validarla
3. NO saltes directo a "la solución" — primero confirmemos la causa raíz
4. Si necesitas más contexto para decidir, pregúntame
</instrucciones>`,
        tip: "Opus: razonamiento causal superior en bugs complejos con múltiples posibles causas. Sonnet: adecuado para bugs con stack trace claro. Separar contexto de código con XML mejora la comprensión.",
        model: "Opus 4.6",
      },
      {
        title: "Diseño antes de implementar",
        tag: "Arquitectura",
        prompt: `Necesito implementar [FUNCIONALIDAD]. ANTES de escribir código, ayúdame a diseñar.

<contexto_tecnico>
Stack: [TECNOLOGÍAS]
Restricciones: [LÍMITES: equipo, infra, tiempo, presupuesto]
Escala esperada: [USUARIOS/REQUESTS/DATOS]
</contexto_tecnico>

<analisis_requerido>
1. Requisitos no obvios: preguntas que haría un senior o PM experimentado
2. 3-4 enfoques distintos (no variaciones del mismo)
3. Trade-offs de cada uno: escalabilidad, latencia, complejidad operacional
4. Cuál es más robusto ante cambios de requisitos, y POR QUÉ
5. Modos de fallo: ¿dónde se rompe cada enfoque?
6. Impacto en testing, monitoring, deployment y rollback
</analisis_requerido>`,
        tip: "Opus: razona mejor sobre trade-offs complejos y efectos cascada. El tag <contexto_tecnico> es clave — sin él, las recomendaciones serán genéricas.",
        model: "Opus 4.6",
      },
      {
        title: "Refactoring con explicación",
        tag: "Refactor",
        prompt: `Refactoriza este código. Para CADA cambio necesito entender el porqué.

<codigo lenguaje="[LENGUAJE]">
[TU CÓDIGO AQUÍ]
</codigo>

<por_cada_cambio>
- Patrón o principio aplicado (con nombre exacto)
- Root cause: por qué el código original tenía ese problema
- Trade-off: qué ganas, qué pierdes, cuándo tu refactorización sería PEOR
- Validación: cómo verificar que el refactor es mejor (métricas concretas)
</por_cada_cambio>

<advertencia>
Refactorizar sin explicar el WHY profundo no me enseña nada.
Prefiero menos cambios bien justificados que muchos cambios cosméticos.
</advertencia>`,
        tip: "Sonnet: suficiente para refactorings estándar con explicaciones claras. Opus: solo si el refactor involucra cambios arquitectónicos complejos.",
        model: "Sonnet 4.6",
      },
      {
        title: "Generación de tests",
        tag: "Testing",
        prompt: `Genera tests para este código. No quiero tests triviales — quiero los que realmente atraparían bugs.

<codigo lenguaje="[LENGUAJE]" framework_test="[JEST/PYTEST/ETC]">
[TU CÓDIGO AQUÍ]
</codigo>

<estrategia>
1. Happy path: el caso más común (1-2 tests)
2. Edge cases: valores límite, null/undefined, strings vacíos, overflow
3. Casos de error: qué debería fallar y cómo
4. Regresión: si yo rompiera este código accidentalmente, ¿qué test lo detectaría?
</estrategia>

<restricciones>
- Tests legibles: el nombre del test debe explicar qué valida
- Sin mocks innecesarios: solo mock lo que realmente es externo
- Cada test debe poder fallar por UNA sola razón
</restricciones>`,
        tip: "Haiku: excelente relación calidad/costo para tests unitarios de funciones simples. Sonnet: para tests de integración o lógica compleja. El atributo framework_test en el tag evita que asuma el framework.",
        model: "Sonnet 4.6",
      },
      {
        title: "Traducción entre lenguajes",
        tag: "Conversión",
        prompt: `Convierte este código de [LENGUAJE ORIGEN] a [LENGUAJE DESTINO].

<codigo_original lenguaje="[LENGUAJE ORIGEN]">
[TU CÓDIGO AQUÍ]
</codigo_original>

<requisitos>
- Usa convenciones idiomáticas del lenguaje destino (no traducción literal)
- Mantén la misma lógica y comportamiento
- Si hay una librería estándar equivalente en el destino, úsala
- Comenta las diferencias importantes entre ambas implementaciones
- Si algo no tiene equivalente directo, señálalo y da la mejor alternativa
</requisitos>

<formato>
Código convertido + tabla breve de diferencias clave entre ambas versiones.
</formato>`,
        tip: "Haiku: sorprendentemente capaz para conversiones directas entre lenguajes comunes (Python↔JS, Java↔C#). Sonnet: si la lógica es compleja o necesitas refactorizar en el proceso.",
        model: "Haiku 4.5",
      },
      {
        title: "Implementar feature nueva",
        tag: "Feature",
        prompt: `Necesito implementar esta nueva feature en un codebase existente.

<feature_spec>
Descripción: [QUÉ DEBE HACER LA FEATURE]
Casos de uso principales: [1-3 FLUJOS DEL USUARIO]
Criterios de aceptación: [CÓMO SABER QUE ESTÁ COMPLETA]
</feature_spec>

<contexto_codebase>
Stack: [TECNOLOGÍAS]
Código relevante existente:
[PEGA AQUÍ: componentes, funciones o módulos relacionados]
</contexto_codebase>

<instrucciones>
1. Identifica lo que necesitas saber antes de empezar (preguntas que harías en un kickoff)
2. Plan: archivos a crear/modificar y en qué orden
3. Implementa cada parte con comentarios explicando las decisiones no obvias
4. Tests mínimos: los que verificarían que la feature funciona end-to-end
5. ¿Qué monitorear en producción?
</instrucciones>

<restricciones>
- Mantén consistencia con el estilo del código existente
- Si necesitas agregar dependencias nuevas, justifícalo
- Señala cualquier requisito ambiguo antes de asumir
</restricciones>`,
        tip: "Sonnet: equilibrio óptimo para implementación de features — suficiente capacidad técnica a buen costo. Opus: si la feature requiere diseño arquitectónico complejo antes de implementar.",
        model: "Sonnet 4.6",
      },
      {
        title: "Actualizar código existente",
        tag: "Actualización",
        prompt: `Necesito actualizar este código con nuevos requisitos sin romper lo que ya funciona.

<codigo_actual lenguaje="[LENGUAJE]">
[TU CÓDIGO ACTUAL AQUÍ]
</codigo_actual>

<cambio_requerido>
Situación actual: [QUÉ HACE HOY]
Nuevo requisito: [QUÉ DEBE HACER DESPUÉS]
Restricciones: [QUÉ NO PUEDE ROMPERSE / CAMBIAR]
</cambio_requerido>

<instrucciones>
1. Analiza el impacto: ¿qué partes del código actual se ven afectadas?
2. Identifica riesgos: ¿qué podría romperse? ¿efectos secundarios posibles?
3. Implementa el cambio de la forma menos invasiva posible
4. Muestra diff claro: qué se agrega, modifica y elimina
5. Tests de regresión: qué validarías para confirmar que lo anterior sigue funcionando
</instrucciones>

<principio>
Cambio mínimo efectivo: no refactorices lo que no está en el scope del cambio.
</principio>`,
        tip: "Sonnet: excelente para cambios quirúrgicos con análisis de impacto. El tag <principio> previene que Claude aproveche el cambio para hacer un refactor completo no solicitado.",
        model: "Sonnet 4.6",
      },
      {
        title: "Sistema completo desde cero",
        tag: "Sistema",
        prompt: `Necesito diseñar e implementar un sistema completo.

<especificacion>
Qué hace el sistema: [DESCRIPCIÓN EN 2-3 ORACIONES]
Usuarios: [QUIÉN LO USA Y PARA QUÉ]
Escala inicial: [USUARIOS, REQUESTS, VOLUMEN DE DATOS]
Crecimiento esperado: [EN 1 AÑO / EN 3 AÑOS]
</especificacion>

<stack_y_constraints>
Lenguajes/frameworks: [PREFERENCIAS O "Sin preferencia"]
Infra disponible: [CLOUD / ON-PREM / SERVERLESS]
Equipo: [TAMAÑO Y NIVEL]
Plazo: [TIEMPO DISPONIBLE]
Presupuesto infra: [RANGO APROXIMADO]
</stack_y_constraints>

<entregables>
Fase 1 — Diseño (antes de código):
1. Componentes del sistema y sus responsabilidades
2. Flujo de datos (diagrama en texto/ASCII)
3. Esquema de datos: entidades, relaciones, índices clave
4. APIs internas y externas: contratos de interfaz
5. Decisiones de diseño con trade-offs explícitos

Fase 2 — Implementación:
6. Orden de construcción: qué primero y por qué
7. Código de los componentes core (los más críticos)
8. Estrategia de testing: unitarios, integración, E2E

Fase 3 — Producción:
9. Observabilidad: métricas, logs y alertas desde el día 1
10. Checklist de lanzamiento y riesgos principales
</entregables>`,
        tip: "Opus: indispensable para sistemas completos — requiere razonar sobre múltiples capas simultáneamente. Su extended thinking produce decisiones de diseño más coherentes y consistentes.",
        model: "Opus 4.6",
      },
  {
    title: "Análisis de performance y profiling",
    tag: "Performance",
    prompt: `Este código es lento y necesito entender por qué antes de optimizar.

<codigo lenguaje="[LENGUAJE]">
[TU CÓDIGO AQUÍ]
</codigo>

<contexto_performance>
Comportamiento observado: [CUÁNTO TARDA / CUÁNTA MEMORIA / CUÁNTOS REQUESTS]
Input que lo reproduce: [DESCRIBE EL INPUT QUE MUESTRA EL PROBLEMA]
Objetivo de performance: [QUÉ DEBERÍA LOGRAR]
</contexto_performance>

<analisis>
1. Complejidad teórica: Big O de tiempo y espacio — explica cada sección
2. Hotspots probables: ¿dónde sospechas que se gasta el 80% del tiempo?
3. Qué instrumentar: código de profiling (timeit, cProfile, perf, etc.) para confirmar
4. Optimizaciones por prioridad: impacto alto primero, con trade-offs explícitos
5. Cuándo PARAR de optimizar: ¿existe un límite físico o teórico?
</analisis>

<advertencia>
No optimices lo que no has medido. Muéstrame primero cómo medir.
</advertencia>`,
    tip: "Sonnet: excelente para análisis de complejidad y sugerencias de profiling. Opus: si la optimización requiere cambios algorítmicos profundos (ej: cambiar de O(n²) a O(n log n)).",
    model: "Sonnet 4.6",
  },
  {
    title: "Razonamiento sobre concurrencia",
    tag: "Concurrencia",
    prompt: `Tengo código concurrente y necesito razonar sobre su correctitud.

<codigo lenguaje="[LENGUAJE]" modelo="[THREADS/ASYNC/ACTORS/GO-ROUTINES]">
[TU CÓDIGO AQUÍ]
</codigo>

<escenario>
Qué debe garantizar: [INVARIANTES: ej. "nunca dos threads modifican X simultáneamente"]
Carga esperada: [NÚMERO DE THREADS/COROUTINES/PROCESOS CONCURRENTES]
</escenario>

<analisis_correctitud>
1. ¿Hay race conditions posibles? Describe el interleaving exacto que las causaría
2. ¿Hay deadlocks posibles? Dibuja el grafo de espera
3. ¿Hay starvation posibles? ¿Algún proceso puede esperar indefinidamente?
4. ¿Las primitivas de sincronización son suficientes o hay huecos?
5. Modelo de memoria: ¿hay lecturas/escrituras que el compilador/CPU podría reordenar?
6. Test de concurrencia: ¿cómo reproduciría estos bugs en un test?
</analisis_correctitud>`,
    tip: "Opus: razonamiento más riguroso sobre estados entrelazados y escenarios de fallo concurrente. Su extended thinking permite explorar más interleavings posibles antes de concluir.",
    model: "Opus 4.6",
  },
  {
    title: "Generación de boilerplate y scaffolding",
    tag: "Scaffolding",
    prompt: `Genera el scaffolding base para [TIPO DE PROYECTO/COMPONENTE].

<especificacion>
Tipo: [API REST / CLI / LIBRERÍA / MICROSERVICIO / MÓDULO]
Lenguaje/Framework: [LENGUAJE Y VERSIÓN]
Patrón de arquitectura: [MVC / CLEAN / HEXAGONAL / SIMPLE]
</especificacion>

<estructura_requerida>
- Estructura de carpetas con propósito de cada directorio
- Archivos base con contenido mínimo funcional
- Configuración de linting, formatting y testing
- README con instrucciones de setup en menos de 5 pasos
- .gitignore apropiado para el stack
</estructura_requerida>

<restricciones>
- Convenciones idiomáticas del lenguaje (no copiar patrones de otro)
- Sin dependencias innecesarias — mínimo viable primero
- Todo lo generado debe ejecutarse sin errores
</restricciones>`,
    tip: "Haiku: sorprendentemente bueno para scaffolding estándar a altísima velocidad. Perfecto para arrancar proyectos rápido. Sube a Sonnet solo si el patrón arquitectónico es inusual o complejo.",
    model: "Haiku 4.5",
  },
  {
    title: "Pair programming iterativo",
    tag: "Pair Programming",
    prompt: `Quiero hacer pair programming contigo. Tú serás el observer/reviewer mientras yo implemento.

<tarea>
[DESCRIBE QUÉ VAMOS A IMPLEMENTAR]
</tarea>

<mi_primer_intento>
[TU CÓDIGO O PSEUDOCÓDIGO INICIAL]
</mi_primer_intento>

<modo_pair>
Tu rol en cada iteración:
1. Identifica el siguiente problema más importante (solo uno a la vez)
2. Hazme UNA pregunta socrática que me guíe hacia la solución
3. Si estoy completamente bloqueado, da una pista mínima (no la solución)
4. Cuando el código sea correcto, sugiere la siguiente mejora de calidad

No escribas el código por mí. Guíame para escribirlo yo.
Si quieres que avance solo, dí: "Implementa esto y muéstrame el resultado"
</modo_pair>`,
    tip: "Opus: mejor para pair programming porque mantiene más contexto del proceso de desarrollo y genera preguntas socráticas más precisas. Este modo produce más aprendizaje que pedir la solución directamente.",
    model: "Opus 4.6",
  },      
    ],
  },
  {
    id: "reasoning",
    label: "Razonamiento",
    icon: "⊕",
    color: "#FF6B6B",
    accent: "#3D0000",
    patterns: [
      {
        title: "Chain of Thought explícito",
        tag: "Lógica",
        prompt: `Resuelve esto paso a paso con razonamiento explícito.

<problema>
[TU PROBLEMA AQUÍ]
</problema>

<proceso>
Después de cada paso:
- ¿Qué asumí? ¿Es válido?
- ¿Hay una vía alternativa que no exploré?
- ¿Qué podría estar pasando por alto?

Antes de tu conclusión final:
- Invierte la conclusión: argumenta por qué podrías estar equivocado
- Etiqueta cada afirmación: [certeza alta] / [certeza media] / [especulativo]
- ¿Qué pregunta crítica NO hice?
</proceso>`,
        tip: "Opus con extended thinking: el razonamiento interno previo produce cadenas lógicas más rigurosas. Sonnet tiende a ser más superficial en cadenas largas de razonamiento.",
        model: "Opus 4.6",
      },
      {
        title: "Devil's advocate estructurado",
        tag: "Análisis crítico",
        prompt: `Tengo esta tesis/argumento y quiero stress-testarla.

<mi_argumento>
[TU ARGUMENTO AQUÍ]
</mi_argumento>

<instrucciones>
Construye el contraargumento MÁS SÓLIDO posible (no el más fácil de refutar):
1. El supuesto más débil en mi argumento
2. Evidencia que contradice mi posición (real, no inventada)
3. Un escenario plausible donde mi conclusión es falsa
4. Lo que tendría que ser verdad para que mi tesis sea correcta

Al final: ¿debería actualizar mis creencias? ¿En qué dirección y cuánto?
</instrucciones>

Sé genuinamente adversarial, no complaciente.`,
        tip: "Opus: construye contraargumentos más fuertes y genuinos porque su razonamiento es más profundo. Claude tiende a ser amable — la instrucción 'sé adversarial' es necesaria para contrarrestarlo.",
        model: "Opus 4.6",
      },
      {
        title: "Estimación Fermi",
        tag: "Cuantitativo",
        prompt: `Estima [CANTIDAD] usando razonamiento de Fermi.

<proceso>
1. Descompón el problema en sub-cantidades estimables
2. Estima cada una con justificación explícita
3. Combínalas y da el orden de magnitud
4. Indica cuál estimación tiene mayor incertidumbre
5. Rango: (optimista, probable, pesimista)
6. Sanity check: ¿el resultado final tiene sentido comparado con algo conocido?
</proceso>

No necesito exactitud — necesito que el razonamiento sea sólido y transparente.
Si algún paso es pura especulación, márcalo como tal.`,
        tip: "Sonnet: suficiente para estimaciones bien estructuradas. Haiku: viable si la estimación es simple y directa. El proceso paso a paso fuerza transparencia en las suposiciones.",
        model: "Sonnet 4.6",
      },
      {
        title: "Steelman de una posición",
        tag: "Epistemología",
        prompt: `Haz un steelman de la siguiente posición (preséntala en su mejor versión posible).

<posicion>
[POSICIÓN QUE PARECE INCORRECTA O POLÉMICA]
</posicion>

<reglas>
- Asume que personas inteligentes y bien informadas la sostienen
- Encuentra el núcleo de verdad o insight genuino
- Presenta el mejor argumento posible A FAVOR
- No metas refutaciones dentro del steelman
- Distingue entre la versión sofisticada y la versión popular del argumento
</reglas>

Al final: ¿qué actualizarías en tu modelo del mundo si este steelman fuera correcto?`,
        tip: "Opus: mejor para construcción generosa de argumentos ajenos — requiere empatía intelectual profunda. Sonnet tiende a hacer steelmans más superficiales.",
        model: "Opus 4.6",
      },
      {
        title: "Análisis de trayectorias causales",
        tag: "Sistemas",
        prompt: `Necesito entender las causas de un resultado observado.

<situacion>
Contexto inicial: [SITUACIÓN INICIAL]
Resultado observado: [LO QUE PASÓ O TEMO QUE PASE]
</situacion>

<analisis>
Mapea 3-4 cadenas causales distintas que podrían explicar este resultado:
- Para cada causa: ¿hay evidencia directa? ¿Solo indirecta?
- Confounders: ¿qué terceras variables complican el análisis?
- Test lógico: si la causa fuera X, ¿qué más esperaría observar?
- Ranking: cuál es más probable y por qué
</analisis>

Advertencia: muchas causas parecen plausibles post-hoc. Sé riguroso separando correlación de causalidad.`,
        tip: "Opus: superior conectando variables en sistemas complejos. Su extended thinking le permite explorar más cadenas causales antes de responder.",
        model: "Opus 4.6",
      },
      {
        title: "Clasificación y etiquetado rápido",
        tag: "Clasificación",
        prompt: `Clasifica los siguientes items según los criterios dados.

<items>
[LISTA DE ITEMS A CLASIFICAR — uno por línea]
</items>

<categorias>
[LISTA DE CATEGORÍAS POSIBLES CON DESCRIPCIÓN BREVE DE CADA UNA]
</categorias>

<formato_salida>
Para cada item responde SOLO en este formato (sin explicaciones adicionales):
Item: [texto] → Categoría: [categoría] | Confianza: [alta/media/baja]

Si un item podría pertenecer a más de una categoría, elige la principal y menciona la secundaria.
</formato_salida>

<reglas>
- Si un item no encaja en ninguna categoría, clasifícalo como "Sin categoría" y explica brevemente por qué
- No inventes categorías nuevas a menos que se te pida
- Mantén el formato estricto para facilitar el parseo automático
</reglas>`,
        tip: "Haiku: diseñado para este tipo de tareas — clasificación rápida a escala con formato consistente. Procesará cientos de items a fracción del costo de Sonnet, con calidad comparable.",
        model: "Haiku 4.5",
      },
 {
    title: "Decisión multicriterio con incertidumbre",
    tag: "Decisiones",
    prompt: `Necesito tomar una decisión difícil y quiero estructurar el razonamiento.

<decision>
Opciones disponibles: [LISTA 2-5 OPCIONES]
Lo que está en juego: [QUÉ IMPORTA MÁS EN ESTA DECISIÓN]
Plazo para decidir: [CUÁNDO NECESITAS DECIDIR]
</decision>

<proceso>
1. Criterios: ¿cuáles son los 4-5 criterios más importantes? ¿Cuál pesa más?
2. Análisis: evalúa cada opción en cada criterio (no solo cualitativamente)
3. Incertidumbre: ¿qué información cambiaría significativamente la decisión?
4. Sesgos posibles: ¿qué sesgos cognitivos podría estar aplicando aquí?
   (status quo bias, sunk cost, anchoring, availability heuristic...)
5. Pre-mortem: imagina que en 1 año la decisión fue mala — ¿qué falló?
6. Reversibilidad: ¿cuán difícil sería deshacer esta decisión? (afecta el umbral)
</proceso>

<formato>
Recomendación final con confianza estimada (0-100%) y las 2 condiciones que harían cambiar esa recomendación.
</formato>`,
    tip: "Opus: mejor para mantener múltiples criterios en equilibrio y detectar sesgos sutiles. El pre-mortem es una de las técnicas más efectivas para mejorar decisiones según investigación de Gary Klein.",
    model: "Opus 4.6",
  },
  {
    title: "Detección de sesgos en mi razonamiento",
    tag: "Metacognición",
    prompt: `Analiza este razonamiento mío en busca de sesgos cognitivos.

<mi_razonamiento>
[DESCRIBE TU ARGUMENTO, ANÁLISIS O CONCLUSIÓN TAL COMO LO PENSASTE]
</mi_razonamiento>

<auditoria>
1. ¿Qué sesgos cognitivos reconoces en este razonamiento?
   (confirmation bias, availability, anchoring, base rate neglect, etc.)
2. ¿Qué evidencia contraría busqué activamente? ¿Por qué podría haberla ignorado?
3. ¿Mis conclusiones van más lejos que los datos que tengo?
4. ¿Hay una explicación alternativa igualmente válida que no consideré?
5. Si alguien con el punto de vista opuesto leyera esto, ¿qué señalaría?
</auditoria>

Sé implacable. El objetivo es detectar problemas reales, no tranquilizarme.`,
    tip: "Opus: más efectivo para detectar sesgos no obvios y razonar sobre el razonamiento. Claude tiende a ser amable — la instrucción final calibra el nivel de criticidad necesario.",
    model: "Opus 4.6",
  },
  {
    title: "Actualización bayesiana informal",
    tag: "Probabilístico",
    prompt: `Tengo una creencia y recibí nueva evidencia. Ayúdame a actualizar correctamente.

<creencia_previa>
Qué creía: [TU HIPÓTESIS ANTES DE LA EVIDENCIA]
Con qué confianza (0-100%): [ESTIMACIÓN SUBJETIVA]
Por qué creía eso: [BASE DE TU CREENCIA ORIGINAL]
</creencia_previa>

<nueva_evidencia>
[DESCRIBE LA NUEVA INFORMACIÓN O EVENTO QUE OBSERVASTE]
</nueva_evidencia>

<actualizacion>
1. ¿Esta evidencia es más probable si mi hipótesis es verdadera que si es falsa?
   (likelihood ratio intuitivo — no necesita ser formal)
2. ¿Cuánto debería actualizar mi confianza? ¿En qué dirección?
3. ¿La evidencia es independiente de mis creencias o podría estar sesgada?
4. ¿Hay hipótesis alternativas que esta evidencia apoye igualmente?
5. Confianza posterior estimada y qué evidencia adicional movería más mi creencia
</actualizacion>`,
    tip: "Sonnet: excelente para razonamiento probabilístico informal. No requiere matemáticas — el valor está en estructurar el pensamiento sobre evidencia y creencias. Haiku: útil si solo necesitas el framework rápido.",
    model: "Sonnet 4.6",
  },
  {
    title: "Descomposición de problemas complejos",
    tag: "Decomposición",
    prompt: `Tengo un problema que parece demasiado grande para atacar directamente.

<problema>
[DESCRIBE EL PROBLEMA COMPLETO TAL COMO LO ENTIENDES HOY]
</problema>

<descomposicion>
1. ¿Cuál es la pregunta central que, si la respondes, resuelve el problema?
2. Subproblemas: descompón en partes que puedan atacarse independientemente
3. Dependencias: ¿cuál debes resolver antes para poder resolver los otros?
4. ¿Qué puedes resolver YA con lo que sabes, y qué requiere investigación?
5. El subproblema más pequeño y concreto donde podrías comenzar HOY
</descomposicion>

<restriccion>
Si el problema puede descomponerse de varias formas, muéstrame 2 descomposiciones distintas y sus trade-offs.
</restriccion>`,
    tip: "Haiku: útil para descomposiciones rápidas cuando ya tienes claridad del dominio. Opus: cuando el problema es genuinamente ambiguo y la descomposición misma requiere razonamiento profundo.",
    model: "Haiku 4.5",
  },

    ],
  },
  {
    id: "research",
    label: "Research",
    icon: "⟳",
    color: "#C77DFF",
    accent: "#1A0030",
    patterns: [
      {
        title: "Literature review acelerado",
        tag: "Síntesis",
        prompt: `Sintetiza el estado del arte en [TEMA ESPECÍFICO].

<estructura>
1. Ideas consolidadas vs. debatidas activamente
2. Métodos dominantes: ¿POR QUÉ dominan? ¿Dónde fallan?
3. Gaps reconocidos + gaps ocultos (que pocos mencionan)
4. Grupos de investigación influyentes y sus posibles sesgos
5. Trayectoria: tendencias de los últimos 5-10 años
6. Red flags: áreas sobrevaloradas vs. infravaloradas
</estructura>

<honestidad>
Sé BRUTALMENTE honesto sobre dónde tu conocimiento es débil o desactualizado.
Mi fecha de referencia es [AÑO]. Indica si hay desarrollos recientes que podrías no cubrir.
</honestidad>`,
        tip: "Sonnet: excelente relación calidad/costo para síntesis de literatura. El tag <honestidad> aprovecha la calibración epistémica de Claude — es más transparente cuando se lo pides explícitamente.",
        model: "Sonnet 4.6",
      },
      {
        title: "Hipótesis de investigación",
        tag: "Metodología",
        prompt: `Tengo esta observación y quiero formular hipótesis testables.

<observacion>
[TU OBSERVACIÓN O PREGUNTA DE INVESTIGACIÓN]
</observacion>

<proceso>
1. Formula 3 hipótesis que la explicarían (genuinamente distintas, no variaciones)
2. Para cada una: ¿qué evidencia la confirmaría? ¿Qué la refutaría?
3. ¿Cuál es más parsimoniosa? (navaja de Occam)
4. ¿Qué experimento mínimo distinguiría entre ellas?
5. Confounders a controlar
6. ¿Qué resultado me haría abandonar TODAS las hipótesis?
</proceso>`,
        tip: "Sonnet: ideal para estructuración de hipótesis. Opus: si la observación es ambigua y requiere pensamiento creativo para generar hipótesis no obvias.",
        model: "Sonnet 4.6",
      },
      {
        title: "Conexiones interdisciplinarias",
        tag: "Creatividad",
        prompt: `Busco conexiones entre campos distintos.

<campos>
Campo A: [CAMPO A] — concepto: [CONCEPTO ESPECÍFICO]
Campo B: [CAMPO B]
</campos>

<explorar>
1. ¿Qué estructuras análogas existen en el Campo B?
2. ¿Qué insights del Campo B podrían transferirse al Campo A?
3. ¿Hay autores o papers que hayan hecho esta conexión?
4. ¿Dónde FALLA la analogía? (qué NO se transfiere)
5. ¿Qué tercer campo podría iluminar ambos?
</explorar>

Prefiero conexiones genuinas (aunque sean especulativas y lo marques) a analogías forzadas.`,
        tip: "Opus: pensamiento lateral más rico y conexiones más profundas. Su extended thinking explora más combinaciones antes de responder.",
        model: "Opus 4.6",
      },
      {
        title: "Revisión de metodología",
        tag: "Crítica",
        prompt: `Revisa la metodología de este estudio/experimento como un reviewer exigente.

<estudio>
[DESCRIPCIÓN, ABSTRACT O METODOLOGÍA]
</estudio>

<criterios_revision>
- Validez interna: ¿controla los confounders relevantes?
- Validez externa: ¿generalizan las conclusiones?
- Poder estadístico: tamaño de muestra y diseño
- Sesgos: del investigador, de selección, de publicación
- Lo que NO se puede concluir de estos resultados
- Cómo mejorarías el estudio (cambios concretos)
</criterios_revision>

Distingue entre problemas fatales (invalidan las conclusiones) y problemas menores (limitan pero no invalidan).`,
        tip: "Sonnet: suficiente para revisión metodológica estándar. El tag <estudio> delimita claramente el texto a analizar del prompt de instrucciones.",
        model: "Sonnet 4.6",
      },
      {
        title: "Mapeo de ecosistema de investigación",
        tag: "Panorama",
        prompt: `Mapea el ecosistema completo de [ÁREA DE INVESTIGACIÓN].

<dimensiones>
1. Actores principales: universidades, laboratorios, empresas con impacto real
2. Financiamiento: ¿quién financia qué? ¿Dónde hay conflictos de interés?
3. Las 5 preguntas que REALMENTE importan (no las que generan papers fáciles)
4. Subespecialidades emergentes: qué está creciendo rápido
5. Vulnerabilidades: ¿qué asume todo el campo sin validar suficientemente?
6. Oportunidades: brechas donde un investigador nuevo podría contribuir
</dimensiones>

<formato>
Organiza como un mapa mental jerárquico. Usa niveles de confianza:
[bien documentado] / [mi interpretación] / [especulativo]
</formato>`,
        tip: "Opus: detecta mejor patrones y brechas en ecosistemas complejos. Los niveles de confianza en el formato aprovechan la honestidad epistémica de Claude.",
        model: "Opus 4.6",
      },
      {
        title: "Extracción de datos de textos",
        tag: "Extracción",
        prompt: `Extrae información estructurada del siguiente texto.

<texto_fuente>
[PEGA AQUÍ: email, artículo, reporte, página web, etc.]
</texto_fuente>

<campos_a_extraer>
[LISTA DE CAMPOS QUE NECESITAS. Ejemplos:]
- Nombres de personas mencionadas
- Fechas y eventos
- Cifras y métricas
- Conclusiones o decisiones
- [TUS CAMPOS ESPECÍFICOS]
</campos_a_extraer>

<formato_salida>
Responde SOLO en JSON válido con esta estructura:
{
  "campo_1": "valor o null si no se encuentra",
  "campo_2": ["valor1", "valor2"],
  "confianza_general": "alta/media/baja"
}
</formato_salida>

<reglas>
- Si un campo no está presente en el texto, usa null (no inventes)
- Si el valor es ambiguo, incluye las interpretaciones posibles como array
- No agregues campos que no se pidieron
</reglas>`,
        tip: "Haiku: el modelo ideal para extracción — rápido, barato y con formato JSON consistente. Procesa cientos de documentos a fracción del costo. Sube a Sonnet solo si los textos son muy ambiguos.",
        model: "Haiku 4.5",
      },
 {
    title: "Propuesta de investigación",
    tag: "Propuesta",
    prompt: `Necesito escribir una propuesta de investigación sólida.

<investigacion>
Tema: [TEMA O PREGUNTA DE INVESTIGACIÓN]
Contexto institucional: [MAESTRÍA / DOCTORADO / FONDOS / CONFERENCIA]
Extensión esperada: [PÁGINAS O PALABRAS]
Deadline: [CUÁNDO]
</investigacion>

<estructura_propuesta>
1. Problem statement: ¿por qué este problema importa AHORA? (urgencia y relevancia)
2. Gap identificado: ¿qué exactamente no se sabe todavía? (específico, no vago)
3. Pregunta de investigación: formulación precisa y testeable
4. Contribución esperada: ¿qué sabremos después que no sabemos hoy?
5. Metodología preliminar: enfoque y por qué es el más apropiado
6. Factibilidad: ¿es realizable en el tiempo y con los recursos disponibles?
7. Riesgos: ¿qué podría salir mal? ¿Cómo mitigarías?
</estructura_propuesta>

<critica>
Después de estructurar, actúa como un revisor escéptico:
¿Cuáles son las 3 objeciones más probables al aprobar esta propuesta?
</critica>`,
    tip: "Opus: indispensable para propuestas — requiere mantener coherencia entre gap, pregunta, metodología y contribución. La sección <critica> al final previene rechazos por objeciones obvias.",
    model: "Opus 4.6",
  },
  {
    title: "Revisión de mi propia contribución",
    tag: "Autocrítica",
    prompt: `Quiero evaluar la solidez de mi contribución antes de presentarla.

<mi_contribucion>
Qué propongo: [ALGORITMO / MODELO / FRAMEWORK / ANÁLISIS / TEOREMA]
En qué contexto: [ÁREA, PROBLEMA QUE RESUELVE]
Evidencia de soporte: [EXPERIMENTOS, PRUEBAS, COMPARACIONES]
</mi_contribucion>

<evaluacion_critica>
1. Novedad: ¿esto ya existe de alguna forma? ¿Cómo lo sé con certeza?
2. Generalidad: ¿funciona solo en mi caso específico o en un rango amplio?
3. Comparación justa: ¿comparé contra los baselines más fuertes disponibles?
4. Limitaciones que no mencioné: ¿qué debería incluir en la sección de limitaciones?
5. El reviewer más difícil: ¿qué diría alguien que trabaja en el problema contrario?
6. ¿Cuál es el claim más fuerte que mis datos realmente soportan?
   (sin over-claiming)
</evaluacion_critica>`,
    tip: "Opus: crítica más profunda y honesta sobre contribuciones propias. Ideal antes de someter un paper — detecta problemas que tus coautores probablemente también pasaron por alto.",
    model: "Opus 4.6",
  },
  {
    title: "Preparación para defensa o presentación",
    tag: "Defensa",
    prompt: `Voy a defender/presentar [TRABAJO] y necesito prepararme para preguntas difíciles.

<trabajo>
Qué presento: [RESUMEN DE 3-5 ORACIONES]
Audiencia: [COMITÉ / CONFERENCIA / CLASE / REVISORES]
Duración: [MINUTOS DE PRESENTACIÓN + MINUTOS DE Q&A]
</trabajo>

<preparacion_qa>
1. Las 10 preguntas más probables (de básica a difícil)
2. Las 3 preguntas que MÁS te costarían responder — y cómo abordarlas
3. Objeciones técnicas: ¿qué aspectos metodológicos pueden atacar?
4. Preguntas trampa: preguntas con premisa incorrecta que debes detectar
5. Cómo manejar: "¿y esto no es simplemente X que ya existe?"
6. Qué decir cuando genuinamente no sabes la respuesta
</preparacion_qa>

<simulacion>
Después de listar las preguntas, hazme una sesión de Q&A simulada:
empieza con la pregunta que crees que me costará más.
</simulacion>`,
    tip: "Opus: el mejor para simular revisores exigentes y generar preguntas difíciles genuinamente. La sesión de Q&A simulada al final es la parte más valiosa del prompt.",
    model: "Opus 4.6",
  },
  {
    title: "Seguimiento de literatura relacionada",
    tag: "Tracking",
    prompt: `Necesito un sistema para rastrear y organizar literatura relacionada con mi investigación.

<tema>
Área de investigación: [TU TEMA]
Papers clave que ya conozco: [LISTA 2-5 PAPERS FUNDAMENTALES]
Conferencias/journals relevantes: [DONDE BUSCO NORMALMENTE]
</tema>

<organizacion>
Dado este contexto, ayúdame a:
1. Identificar los términos de búsqueda más efectivos (keywords y combinaciones)
2. Diseñar una taxonomía simple para clasificar papers encontrados
3. Una plantilla de resumen estándar para cada paper que lea
4. Criterios para decidir si un paper es realmente relevante vs. solo relacionado
5. Señales de alerta: ¿qué indicaría que me estoy saliendo del scope?
</organizacion>`,
    tip: "Sonnet: excelente para diseñar sistemas de organización de literatura. La plantilla de resumen que genera puede usarse directamente como template en Zotero, Obsidian o Notion.",
    model: "Sonnet 4.6",
  },      
    ],
  },
  {
    id: "writing",
    label: "Escritura",
    icon: "✍",
    color: "#FFB347",
    accent: "#2D1500",
    patterns: [
      {
        title: "Estructura de paper/reporte",
        tag: "Estructura",
        prompt: `Voy a escribir un documento y necesito diseñar la estructura óptima.

<contexto>
Tema: [TEMA]
Audiencia: [QUIÉN LO LEERÁ]
Argumento central: [TESIS EN UNA ORACIÓN]
Extensión aproximada: [PÁGINAS/PALABRAS]
</contexto>

<diseñar>
1. Secciones necesarias y su función retórica (no solo "introducción, desarrollo, conclusión")
2. Qué tipo de argumento va en cada sección
3. El orden lógico y por qué ese orden y no otro
4. Dónde anticipar objeciones del lector
5. Cómo abrir y cerrar para máximo impacto
</diseñar>`,
        tip: "Sonnet: excelente para estructuración clara y bien razonada. El tag <contexto> es esencial — sin audiencia definida, la estructura será genérica.",
        model: "Sonnet 4.6",
      },
      {
        title: "Edición técnica brutal",
        tag: "Edición",
        prompt: `Edita este texto con máxima exigencia. NO reescribas por mí — señala y explica.

<texto>
[TU TEXTO AQUÍ]
</texto>

<criterios>
Para cada párrafo evalúa:
- Claridad: ¿la idea es precisa o hay ambigüedad?
- Evidencia: ¿hay afirmaciones sin respaldo?
- Flujo: ¿la transición lógica entre párrafos funciona?
- Economía: palabras o frases eliminables sin perder nada
- Tono: ¿sueno defensivo, vago o condescendiente?
</criterios>

<formato_feedback>
[Párrafo N] → [Problema] → [Por qué es problema] → [Sugerencia concreta]
</formato_feedback>`,
        tip: "Sonnet: ideal para edición técnica consistente y detallada. El formato estructurado de feedback evita comentarios vagos como 'mejorar la claridad'.",
        model: "Sonnet 4.6",
      },
      {
        title: "Simplificar sin perder rigor",
        tag: "Divulgación",
        prompt: `Necesito simplificar una explicación técnica para una audiencia no experta.

<explicacion_tecnica>
[TU EXPLICACIÓN TÉCNICA ORIGINAL]
</explicacion_tecnica>

<audiencia_objetivo>
[DESCRIBE A TU AUDIENCIA: nivel educativo, contexto, qué ya saben]
</audiencia_objetivo>

<reglas>
- No pierdas la idea central — simplifícala, no la cambies
- Cero mentiras piadosas (simplificaciones que son técnicamente falsas)
- Sin condescendencia — respetar la inteligencia del lector
- Señala explícitamente qué se sacrificó en la simplificación
- Mantén precisión donde es crucial, simplifica donde no lo es
</reglas>`,
        tip: "Sonnet: muy capaz para simplificación balanceada. Haiku: viable para simplificaciones breves y directas (ej: tooltips, glosarios). Claude naturalmente evita condescendencia si se lo pides.",
        model: "Sonnet 4.6",
      },
      {
        title: "Síntesis de fuentes conflictivas",
        tag: "Meta-análisis",
        prompt: `Tengo fuentes con conclusiones conflictivas y necesito una síntesis integradora.

<fuentes>
[FUENTE 1: resumen + conclusión]
[FUENTE 2: resumen + conclusión]
[FUENTE N: resumen + conclusión]
</fuentes>

<sintesis>
1. ¿Dónde difieren exactamente? (¿metodología? ¿interpretación? ¿datos?)
2. Núcleo de verdad en cada posición
3. Conclusión más afinada que reconcilie las diferencias
4. ¿Cuándo tiene razón cada fuente? (condiciones de validez)
5. ¿Qué falta para resolver el conflicto definitivamente?
</sintesis>

Objetivo: ir más allá de "algunos dicen X, otros Y". Quiero integración genuina.`,
        tip: "Opus: superior tejiendo ideas conflictivas en narrativas coherentes — requiere mantener múltiples perspectivas simultáneamente.",
        model: "Opus 4.6",
      },
      {
        title: "Redacción de documentación técnica",
        tag: "Docs",
        prompt: `Escribe documentación técnica para [COMPONENTE/API/SISTEMA].

<contexto>
Qué es: [DESCRIPCIÓN BREVE]
Usuarios de la doc: [DESARROLLADORES JUNIOR / SENIOR / USUARIOS FINALES]
Formato: [README / API DOCS / GUÍA / TUTORIAL]
</contexto>

<estructura_doc>
1. Qué hace y para qué sirve (1 párrafo, sin jerga innecesaria)
2. Quick start: el camino más corto a un resultado funcional
3. Conceptos clave que el lector DEBE entender
4. Referencia: parámetros, opciones, configuración
5. Ejemplos: casos de uso reales (no triviales)
6. Troubleshooting: errores comunes y soluciones
</estructura_doc>

<codigo_fuente>
[CÓDIGO A DOCUMENTAR — OPCIONAL]
</codigo_fuente>`,
        tip: "Sonnet: óptimo para documentación técnica clara y bien estructurada. Haiku: útil para generar docstrings o comentarios inline en lote a bajo costo.",
        model: "Sonnet 4.6",
      },
      {
        title: "Corrección y revisión gramatical",
        tag: "Gramática",
        prompt: `Revisa y corrige este texto. Solo correcciones, no reescritura creativa.

<texto>
[TU TEXTO AQUÍ]
</texto>

<tipo_revision>
- Ortografía y gramática
- Puntuación
- Concordancia (género, número, tiempo verbal)
- Repeticiones innecesarias
- Claridad de oraciones confusas
</tipo_revision>

<formato_salida>
1. Texto corregido (con los cambios aplicados)
2. Lista de cambios realizados en formato:
   - "[original]" → "[corregido]" — razón breve

NO cambies el estilo, tono ni estructura. Solo corrige errores.
</formato_salida>`,
        tip: "Haiku: perfecto para corrección gramatical — tarea mecánica donde la velocidad y el costo importan más que el razonamiento profundo. Ideal para revisar múltiples documentos en lote.",
        model: "Haiku 4.5",
      },  {
    title: "Respuesta a revisores de paper",
    tag: "Revisión",
    prompt: `Necesito responder a los comentarios de revisores de manera efectiva.

<contexto>
Venue: [CONFERENCIA / JOURNAL]
Decisión recibida: [MAJOR REVISION / MINOR REVISION / CONDITIONAL ACCEPT]
</contexto>

<comentarios_revisores>
[PEGA AQUÍ LOS COMENTARIOS DE LOS REVISORES]
</comentarios_revisores>

<estrategia>
Para CADA comentario de revisor:
1. Clasifícalo: ¿es una crítica válida, un malentendido o una diferencia de opinión?
2. Prioridad: ¿cuánto afecta la decisión de aceptación si no lo abordo?
3. Respuesta sugerida: qué cambiar en el paper (si aplica) y cómo redactar la respuesta
4. Tono: firme pero respetuoso — ni capitulación innecesaria ni confrontación

Al final: resumen de cambios para la carta de resubmisión.
</estrategia>

<principio>
"We thank the reviewer for..." es siempre el inicio, pero el contenido debe ser sustantivo.
</principio>`,
    tip: "Opus: mejor para evaluar qué críticas son sustanciales vs. preferencias del revisor, y cómo responder sin sobre-prometer cambios. Uno de los usos más valiosos de Claude en el contexto académico.",
    model: "Opus 4.6",
  },
  {
    title: "Reescritura bajo restricciones de espacio",
    tag: "Compresión",
    prompt: `Necesito reducir este texto a [NÚMERO DE PALABRAS/CARACTERES] sin perder el argumento central.

<texto_original>
[TU TEXTO AQUÍ]
</texto_original>

<restriccion>
Límite: [X PALABRAS / X CARACTERES]
Partes que NO puedo eliminar: [SECCIONES O IDEAS OBLIGATORIAS]
Audiencia: [QUIÉN LO LEERÁ]
</restriccion>

<proceso>
1. Identifica qué puede eliminarse sin dañar el argumento (relleno, repeticiones, ejemplos redundantes)
2. Qué puede comprimirse (oraciones largas → cortas, sin perder precisión)
3. Qué debe permanecer intacto (definiciones, datos, claims centrales)
4. Versión comprimida
5. Lista de qué se sacrificó y si eso debería preocuparme
</proceso>`,
    tip: "Haiku: rápido y efectivo para compresión de texto — genera versiones condensadas a alta velocidad. Ideal para abstracts, resúmenes ejecutivos o tweets. Revisa el resultado con Sonnet si el texto es muy técnico.",
    model: "Haiku 4.5",
  },
  {
    title: "Escritura con voz consistente",
    tag: "Estilo",
    prompt: `Tengo varios fragmentos escritos en momentos distintos y necesito que suenen como una sola voz.

<fragmentos>
<fragmento_1>
[TEXTO ESCRITO EN UN MOMENTO]
</fragmento_1>

<fragmento_2>
[TEXTO ESCRITO EN OTRO MOMENTO]
</fragmento_2>

<fragmento_n>
[...]
</fragmento_n>
</fragmentos>

<objetivo>
1. Analiza las inconsistencias de voz, tono y estilo entre los fragmentos
2. Identifica cuál fragmento representa mejor mi voz natural
3. Reescribe los demás para que sean consistentes con ese fragmento de referencia
4. Lista los cambios de estilo que hiciste (para que pueda aplicarlos yo solo en el futuro)
</objetivo>`,
    tip: "Sonnet: muy capaz para análisis y homogeneización de estilo. Especialmente útil para tesis escritas en múltiples sesiones o documentos con múltiples coautores.",
    model: "Sonnet 4.6",
  },

    ],
  },
  {
    id: "data",
    label: "Datos",
    icon: "⊞",
    color: "#FF69B4",
    accent: "#3D0022",
    patterns: [
      {
        title: "Análisis exploratorio de datos",
        tag: "EDA",
        prompt: `Tengo un dataset y necesito un análisis exploratorio inteligente.

<dataset>
Descripción: [QUÉ CONTIENE, ORIGEN, TAMAÑO APROXIMADO]
Columnas principales: [LISTA DE COLUMNAS CON TIPOS]
Muestra (primeras filas o resumen): [PEGA AQUÍ]
</dataset>

<analisis>
1. ¿Qué preguntas interesantes puedo responder con estos datos?
2. Distribuciones: ¿qué columnas tienen distribuciones inusuales?
3. Relaciones: ¿qué correlaciones o patrones buscarías?
4. Calidad: datos faltantes, outliers, inconsistencias evidentes
5. Código: genera el script de EDA en [PYTHON/R/SQL]
6. Visualizaciones: ¿qué gráficos revelarían más sobre estos datos?
</analisis>

<advertencia>
No asumas que los datos están limpios. Señala problemas antes de analizar.
</advertencia>`,
        tip: "Sonnet: excelente generando código de análisis y detectando patrones. Haiku: viable para tareas repetitivas como limpieza y transformación de datos.",
        model: "Sonnet 4.6",
      },
      {
        title: "SQL desde lenguaje natural",
        tag: "SQL",
        prompt: `Genera la query SQL para esta consulta en lenguaje natural.

<esquema>
[DESCRIBE TUS TABLAS: nombre, columnas, tipos, relaciones/foreign keys]
</esquema>

<consulta>
[LO QUE QUIERES OBTENER EN LENGUAJE NATURAL]
</consulta>

<requisitos>
- Dialecto SQL: [POSTGRESQL / MYSQL / SQLITE / BIGQUERY]
- Optimización: incluye índices sugeridos si la query puede ser lenta
- Explica tu razonamiento si hay JOINs complejos o subconsultas
- Si la consulta es ambigua, muestra las interpretaciones posibles
- Agrega comentarios en la query explicando cada sección
</requisitos>`,
        tip: "Sonnet: genera SQL preciso para la mayoría de consultas. Haiku: excelente para queries simples (SELECT, filtros básicos) a fracción del costo. El esquema en XML es crítico para queries correctas.",
        model: "Sonnet 4.6",
      },
      {
        title: "Interpretación de resultados estadísticos",
        tag: "Estadística",
        prompt: `Ayúdame a interpretar estos resultados estadísticos correctamente.

<resultados>
[PEGA TUS RESULTADOS: p-values, intervalos de confianza, coeficientes, etc.]
</resultados>

<contexto>
Pregunta de investigación: [QUÉ INTENTAS RESPONDER]
Método usado: [REGRESIÓN / TEST / ANOVA / ETC.]
Tamaño de muestra: [N]
</contexto>

<interpretacion>
1. ¿Qué dicen realmente estos números? (sin sobre-interpretar)
2. ¿Qué NO dicen? (limitaciones de esta prueba)
3. ¿El tamaño del efecto es prácticamente relevante? (no solo estadísticamente significativo)
4. ¿Qué análisis adicionales fortalecerían la conclusión?
5. ¿Cómo lo explicarías a alguien sin formación estadística?
</interpretacion>`,
        tip: "Sonnet: excelente para interpretación estadística rigurosa. Opus: solo si los resultados son contradictorios o el diseño es inusual.",
        model: "Sonnet 4.6",
      },
      {
        title: "Pipeline de transformación de datos",
        tag: "ETL",
        prompt: `Diseña un pipeline de transformación para estos datos.

<datos_entrada>
Formato actual: [CSV / JSON / API / DB]
Estructura: [DESCRIBE CAMPOS Y TIPOS]
Volumen: [FILAS APROXIMADAS / FRECUENCIA DE ACTUALIZACIÓN]
Problemas conocidos: [DATOS SUCIOS, DUPLICADOS, FORMATOS MIXTOS]
</datos_entrada>

<datos_salida>
Formato deseado: [CÓMO NECESITAS LOS DATOS AL FINAL]
Destino: [BASE DE DATOS / ARCHIVO / API / DASHBOARD]
</datos_salida>

<pipeline>
1. Pasos de limpieza necesarios (en orden)
2. Transformaciones y cálculos
3. Validaciones en cada etapa
4. Manejo de errores: ¿qué pasa si un paso falla?
5. Código en [PYTHON/SQL/SPARK] para cada paso
</pipeline>`,
        tip: "Sonnet: equilibrio ideal para diseño de pipelines con código funcional. Haiku: úsalo para generar las transformaciones repetitivas individuales.",
        model: "Sonnet 4.6",
      },
      {
        title: "Visualización efectiva de datos",
        tag: "Dataviz",
        prompt: `Necesito visualizar estos datos de forma efectiva.

<datos>
Qué represento: [DESCRIPCIÓN DEL DATASET]
Variables clave: [LISTA CON TIPOS: categórica, numérica, temporal]
Mensaje principal: [QUÉ HISTORIA QUIERO CONTAR CON LOS DATOS]
</datos>

<requisitos>
- Librería: [MATPLOTLIB / PLOTLY / D3 / GGPLOT2 / OTRO]
- Audiencia: [TÉCNICA / EJECUTIVA / GENERAL]
- Medio: [PRESENTACIÓN / PAPER / DASHBOARD / WEB]
</requisitos>

<entregable>
1. Tipo de gráfico recomendado y POR QUÉ (no solo "usa un bar chart")
2. Código funcional completo
3. Decisiones de diseño: colores, escalas, anotaciones
4. Qué gráfico NO usar y por qué sería engañoso
5. Alternativa: un segundo tipo de gráfico para comparar
</entregable>`,
        tip: "Sonnet: genera código de visualización limpio y funcional. El tag <mensaje> es clave — sin él, la visualización será genérica en vez de comunicar algo específico.",
        model: "Sonnet 4.6",
      },
      {
        title: "Limpieza y normalización de datos",
        tag: "Limpieza",
        prompt: `Genera código para limpiar y normalizar este dataset.

<datos_ejemplo>
[PEGA AQUÍ UNA MUESTRA DE TUS DATOS — 5-10 filas representativas incluyendo filas sucias]
</datos_ejemplo>

<problemas_detectados>
[LISTA LOS PROBLEMAS QUE VES O SOSPECHAS. Ejemplos:]
- Formatos de fecha inconsistentes
- Nombres con variaciones (mayúsculas, tildes, abreviaturas)
- Valores nulos o placeholder ("N/A", "-", "null")
- Duplicados
- Outliers sospechosos
- [TUS PROBLEMAS ESPECÍFICOS]
</problemas_detectados>

<requisitos>
- Lenguaje: [PYTHON PANDAS / SQL / R / OTRO]
- Para cada paso de limpieza: comentario explicando qué corrige y por qué
- Genera validaciones: asserts o checks para verificar que la limpieza funcionó
- Reporta cuántas filas/valores se modificaron en cada paso
</requisitos>`,
        tip: "Haiku: excelente para generar scripts de limpieza repetitivos — código mecánico pero correcto a muy bajo costo. Ideal cuando necesitas limpiar múltiples archivos con patrones similares.",
        model: "Haiku 4.5",
      },
  {
    title: "Diseño de experimento A/B",
    tag: "Experimentos",
    prompt: `Necesito diseñar un experimento controlado riguroso.

<hipotesis>
[LO QUE QUIERES PROBAR: ej. "el cambio X mejora la métrica Y en usuarios Z"]
</hipotesis>

<contexto>
Dominio: [WEB / MOBILE / ML / SISTEMA / LABORATORIO]
Recursos disponibles: [TRÁFICO, TIEMPO, PRESUPUESTO, EQUIPO]
Métrica principal: [QUÉ MEDIRÁS COMO ÉXITO]
</contexto>

<diseño>
1. Unidad de aleatorización: ¿qué se asigna a control vs. tratamiento?
2. Tamaño de muestra: cálculo de poder estadístico (α=0.05, β=0.80)
3. Duración mínima y por qué (efectos de novedad, ciclos semanales, etc.)
4. Métricas secundarias y guardrails (qué no debería empeorar)
5. Estratificación: ¿necesito subgrupos de análisis?
6. Criterios de parada anticipada: ¿cuándo detener si hay daño?
7. Análisis post-experimento: ¿qué prueba estadística usarás y por qué?
</diseño>`,
    tip: "Sonnet: excelente para diseño de experimentos con rigor estadístico. El cálculo de poder estadístico es frecuentemente ignorado — este prompt lo incluye explícitamente.",
    model: "Sonnet 4.6",
  },
  {
    title: "Análisis de series de tiempo",
    tag: "Series Temporales",
    prompt: `Tengo datos temporales y necesito analizarlos correctamente.

<datos>
Descripción: [QUÉ MIDE LA SERIE, FRECUENCIA, RANGO TEMPORAL]
Muestra o resumen estadístico: [PEGA AQUÍ O DESCRIBE]
Pregunta que quiero responder: [TENDENCIA / ANOMALÍAS / FORECASTING / CAUSALIDAD]
</datos>

<analisis>
1. Estacionariedad: ¿es estacionaria? ¿Necesita transformación?
2. Patrones: tendencia, estacionalidad, ciclos, ruido — ¿cuál domina?
3. Anomalías: ¿hay outliers o cambios de régimen visibles?
4. Dependencias: ¿hay autocorrelación significativa? ¿En qué lags?
5. Modelo apropiado: ARIMA, exponential smoothing, Prophet, ML — justifica
6. Código en [PYTHON/R] para el análisis completo
7. Trampas comunes a evitar con este tipo de datos
</analisis>`,
    tip: "Sonnet: genera código de análisis de series temporales limpio y funcional. Opus: si los datos tienen múltiples series interrelacionadas o el análisis de causalidad es central.",
    model: "Sonnet 4.6",
  },
  {
    title: "Comunicación de incertidumbre en resultados",
    tag: "Comunicación",
    prompt: `Tengo resultados con incertidumbre significativa y necesito comunicarlos honestamente.

<resultados>
[DESCRIBE TUS HALLAZGOS, INCLUYENDO MÉTRICAS E INTERVALOS DE CONFIANZA]
</resultados>

<audiencia>
[TÉCNICA / NO TÉCNICA / MIXTA — describe el nivel]
</audiencia>

<comunicacion>
1. ¿Qué conclusiones son robustas y cuáles son tentativas?
2. Cómo presentar intervalos de confianza sin confundir a una audiencia no técnica
3. Visualización recomendada para mostrar la incertidumbre (no solo barras de error)
4. Qué frases usar y qué frases evitar para no sobre-vender los resultados
5. Borrador de párrafo de conclusiones que sea honesto pero aún informativo
</comunicacion>`,
    tip: "Sonnet: muy capaz para calibrar el lenguaje de incertidumbre. Especialmente importante en ciencia de datos donde over-claiming es un problema frecuente.",
    model: "Sonnet 4.6",
  },      
    ],
  },
  {
    id: "creative",
    label: "Creatividad",
    icon: "✦",
    color: "#FFD700",
    accent: "#2D2500",
    patterns: [
      {
        title: "Brainstorming estructurado",
        tag: "Ideación",
        prompt: `Necesito generar ideas para [PROBLEMA/PROYECTO].

<contexto>
Objetivo: [QUÉ INTENTO LOGRAR]
Restricciones: [LÍMITES DE TIEMPO, PRESUPUESTO, TECNOLOGÍA, ETC.]
Lo que ya consideré: [IDEAS PREVIAS QUE YA TENGO]
</contexto>

<proceso>
Fase 1 — Divergencia (cantidad sobre calidad):
- 10 ideas sin filtrar, incluyendo algunas absurdas o provocadoras
- Al menos 3 que combinen dominios inesperados

Fase 2 — Convergencia (evalúa):
- Para las 3 mejores: viabilidad, impacto, originalidad
- ¿Cuál es la idea "aburrida pero funciona"?
- ¿Cuál es la idea "arriesgada pero transformadora"?

Fase 3 — Síntesis:
- ¿Puedes combinar elementos de varias ideas en una mejor?
</proceso>`,
        tip: "Opus: genera ideas más diversas y conexiones más inesperadas en la fase divergente. Sonnet: suficiente si el dominio es bien conocido y las restricciones son claras.",
        model: "Opus 4.6",
      },
      {
        title: "Naming y copywriting",
        tag: "Naming",
        prompt: `Necesito nombre/copy para [PRODUCTO/PROYECTO/FEATURE].

<brief>
Qué es: [DESCRIPCIÓN EN 1-2 ORACIONES]
Audiencia: [QUIÉN LO USARÁ]
Tono deseado: [PROFESIONAL / CASUAL / TÉCNICO / DIVERTIDO]
Valores a transmitir: [QUÉ DEBERÍA EVOCAR]
Nombres a evitar: [COMPETIDORES, NOMBRES YA USADOS]
Idioma: [ESPAÑOL / INGLÉS / BILINGÜE]
</brief>

<entregable>
1. 8-10 opciones de nombre con justificación breve
2. Para los 3 mejores: variaciones (corto, largo, con tagline)
3. Check de conflictos: ¿alguno suena como algo existente?
4. Cómo sonaría en una oración real de uso
5. Cuál NO recomendarías y por qué
</entregable>`,
        tip: "Sonnet: excelente para naming creativo con buen volumen de opciones. Haiku: útil para generar variaciones rápidas de nombres ya elegidos.",
        model: "Sonnet 4.6",
      },
      {
        title: "Analogías para explicar",
        tag: "Comunicación",
        prompt: `Necesito explicar [CONCEPTO COMPLEJO] a [AUDIENCIA] usando analogías.

<concepto>
[DESCRIBE EL CONCEPTO TÉCNICO/ABSTRACTO]
</concepto>

<audiencia>
[QUIÉNES SON, QUÉ SABEN, QUÉ LES IMPORTA]
</audiencia>

<requisitos>
1. 3-4 analogías de dominios muy diferentes (cotidiano, naturaleza, tecnología familiar, etc.)
2. Para cada analogía: dónde funciona y dónde se rompe
3. ¿Cuál es más precisa? ¿Cuál es más memorable?
4. Combinación: ¿puedes tejer 2 analogías en una narrativa?
5. Anti-analogía: ¿con qué NO debería compararse? (misconceptions comunes)
</requisitos>`,
        tip: "Opus: genera analogías más ricas y creativas. Sonnet: suficiente para analogías de conceptos bien conocidos. Claude es naturalmente bueno con analogías — este prompt lo fuerza a ser más riguroso.",
        model: "Opus 4.6",
      },
      {
        title: "Rediseño de experiencia/proceso",
        tag: "Design Thinking",
        prompt: `Necesito repensar [PROCESO/EXPERIENCIA/PRODUCTO] desde la perspectiva del usuario.

<situacion_actual>
Qué existe hoy: [DESCRIBE EL PROCESO O PRODUCTO ACTUAL]
Pain points conocidos: [QUÉ FRUSTRA A LOS USUARIOS]
Métricas actuales: [DATOS QUE TENGAS: conversión, tiempo, satisfacción]
</situacion_actual>

<analisis>
1. Empatía: ¿qué SIENTE el usuario en cada paso? (no solo qué hace)
2. Fricciones ocultas: problemas que los usuarios no reportan pero que existen
3. Momentos de verdad: ¿dónde se gana o pierde al usuario?
4. 3 rediseños: conservador, moderado, radical
5. Para cada rediseño: qué mejora, qué arriesgas, cómo medirías el éxito
</analisis>`,
        tip: "Opus: mejor para empatía profunda con el usuario y rediseños radicales. Sonnet: suficiente para mejoras incrementales y bien acotadas.",
        model: "Opus 4.6",
      },
      {
        title: "Generación de contenido estructurado",
        tag: "Contenido",
        prompt: `Genera contenido sobre [TEMA] para [CANAL/FORMATO].

<brief>
Tema: [TEMA ESPECÍFICO]
Formato: [BLOG POST / NEWSLETTER / HILO / PRESENTACIÓN / VIDEO SCRIPT]
Audiencia: [PERFIL DEL LECTOR/ESPECTADOR]
Objetivo: [INFORMAR / PERSUADIR / ENTRETENER / EDUCAR]
Tono: [FORMAL / CONVERSACIONAL / TÉCNICO / INSPIRADOR]
Extensión: [PALABRAS APROXIMADAS O DURACIÓN]
</brief>

<estructura>
1. Hook: las primeras 2 líneas que deciden si siguen leyendo
2. Esqueleto: secciones con su propósito retórico
3. Datos/ejemplos que darían credibilidad
4. Call to action (si aplica)
5. 3 títulos alternativos con enfoque diferente
</estructura>

Dame primero la estructura. Escribiremos el contenido después de validarla.`,
        tip: "Sonnet: óptimo para generación de contenido con estructura clara. Haiku: útil para variaciones rápidas (ej: adaptar el mismo contenido a múltiples formatos).",
        model: "Sonnet 4.6",
      },
      {
        title: "Reformulación y variaciones de texto",
        tag: "Variaciones",
        prompt: `Genera variaciones del siguiente texto manteniendo el mismo mensaje.

<texto_original>
[TU TEXTO AQUÍ]
</texto_original>

<variaciones_requeridas>
1. Más formal (para email corporativo o documento oficial)
2. Más casual (para redes sociales o conversación)
3. Más conciso (la mitad de extensión, sin perder lo esencial)
4. Más persuasivo (enfocado en convencer)
5. Diferente estructura (mismas ideas, distinto orden/enfoque)
</variaciones_requeridas>

<restricciones>
- Mantén la información factual exacta — solo cambia el estilo
- No agregues información nueva que no esté en el original
- Señala si alguna variación requiere cambiar el mensaje para funcionar
</restricciones>`,
        tip: "Haiku: ideal para generar variaciones de texto en volumen — rápido y económico. Perfecto para A/B testing de copy, adaptar mensajes a múltiples canales o generar opciones para elegir.",
        model: "Haiku 4.5",
      },
  {
    title: "Pensamiento lateral forzado (SCAMPER)",
    tag: "Lateral Thinking",
    prompt: `Aplica el framework SCAMPER para generar ideas radicalmente distintas sobre [PROBLEMA/PRODUCTO].

<objeto_analisis>
[DESCRIBE EL PROCESO, PRODUCTO O SISTEMA QUE QUIERES TRANSFORMAR]
</objeto_analisis>

<scamper>
Para cada letra, genera al menos 2 ideas concretas (no abstractas):
S — Sustituir: ¿qué componentes puedes reemplazar por algo diferente?
C — Combinar: ¿qué puedes fusionar con algo aparentemente no relacionado?
A — Adaptar: ¿qué de otro dominio puedes tomar prestado?
M — Modificar/Magnificar/Minimizar: ¿qué pasa si exageras o reduces un elemento?
P — Poner en otro uso: ¿para qué más podría servir esto?
E — Eliminar: ¿qué pasa si eliminas el componente que crees más esencial?
R — Reorganizar/Revertir: ¿qué pasa si inviertes el proceso o el orden?
</scamper>

Al final: ¿cuál de estas ideas tiene más potencial real, aunque sea difícil de implementar?`,
    tip: "Sonnet: buen balance entre creatividad y practicidad para SCAMPER. Opus: si el dominio es muy técnico y necesitas que las ideas sean viables además de creativas.",
    model: "Sonnet 4.6",
  },
  {
    title: "Exploración de futuros alternativos",
    tag: "Escenarios",
    prompt: `Quiero explorar cómo podría evolucionar [TECNOLOGÍA/TENDENCIA/SITUACIÓN] en los próximos años.

<situacion_actual>
[DESCRIBE EL ESTADO ACTUAL DE LO QUE ANALIZAS]
</situacion_actual>

<escenarios>
Construye 3 futuros plausibles pero distintos (no optimista/neutro/pesimista — eso es demasiado simple):

Para cada escenario:
1. La fuerza o evento que lo desencadenaría
2. Cómo se vería el mundo en ese futuro (concreto, no vago)
3. Quiénes ganarían y quiénes perderían
4. Señales tempranas: ¿qué observarías HOY que indicaría que este escenario se desarrolla?
5. Qué decisiones serían óptimas en ese escenario
</escenarios>

<meta>
El objetivo no es predecir — es expandir el espacio de posibilidades para tomar mejores decisiones hoy.
</meta>`,
    tip: "Opus: genera escenarios más creativos y menos convencionales. El enfoque en 'señales tempranas' transforma el ejercicio de especulativo a accionable.",
    model: "Opus 4.6",
  },
  {
    title: "Crítica constructiva de mi propia idea",
    tag: "Autocrítica",
    prompt: `Tengo una idea que me entusiasma y necesito evaluarla con rigor antes de invertir más tiempo.

<mi_idea>
[DESCRIBE TU IDEA: qué es, cómo funciona, por qué crees que es buena]
</mi_idea>

<evaluacion>
Actúa en 3 roles distintos y evalúa la idea desde cada perspectiva:

Rol 1 — Escéptico técnico: ¿por qué esto no funcionaría técnicamente?
Rol 2 — Usuario real: ¿lo usaría? ¿Qué me molestaría de ello?
Rol 3 — Competidor: si yo fuera un competidor, ¿cómo neutralizaría esta idea?

Después:
- ¿Cuál es la crítica más difícil de refutar?
- Si la idea sobrevive esas críticas, ¿qué validación mínima la haría más convincente?
- ¿Hay una versión más pequeña de la idea que sea más fácil de probar?
</evaluacion>`,
    tip: "Opus: más efectivo para empatizar con perspectivas genuinamente distintas. El triple role-play previene el sesgo de confirmación que surge cuando evalúas tus propias ideas.",
    model: "Opus 4.6",
  },      
    ],
  },
  {
    id: "meta",
    label: "Meta-prompting",
    icon: "⊛",
    color: "#00FFA3",
    accent: "#003322",
    patterns: [
      {
        title: "Diseño de system prompt",
        tag: "System Prompt",
        prompt: `Diseña un system prompt efectivo para un asistente de Claude.

<objetivo_del_asistente>
Qué debe hacer: [FUNCIÓN PRINCIPAL]
Para quién: [USUARIOS OBJETIVO]
En qué contexto: [APP / CHATBOT / HERRAMIENTA INTERNA / API]
</objetivo_del_asistente>

<requisitos_system_prompt>
1. Identidad y rol: quién es el asistente (sin inventar que es humano)
2. Alcance: qué PUEDE y qué NO PUEDE hacer (límites claros)
3. Tono y estilo: cómo debe comunicarse
4. Formato de respuestas: estructura esperada
5. Manejo de incertidumbre: qué hacer cuando no sabe
6. Casos edge: cómo manejar preguntas fuera de alcance
7. Seguridad: qué nunca debe hacer (prevenir prompt injection)
</requisitos_system_prompt>

<mejores_practicas_claude>
- Usa XML tags para separar secciones del system prompt
- Sé específico sobre el formato de salida esperado
- Incluye ejemplos de interacción (few-shot) si el comportamiento es sutil
- Prioriza instrucciones positivas ("haz X") sobre negativas ("no hagas Y")
</mejores_practicas_claude>`,
        tip: "Sonnet: óptimo para diseño de system prompts — entiende bien la estructura. Opus: si el asistente tiene lógica de negocio compleja o muchos casos edge.",
        model: "Sonnet 4.6",
      },
      {
        title: "Optimización de prompts existentes",
        tag: "Refinamiento",
        prompt: `Tengo un prompt que funciona pero quiero mejorarlo.

<prompt_actual>
[PEGA TU PROMPT ACTUAL AQUÍ]
</prompt_actual>

<problema>
[QUÉ NO FUNCIONA BIEN: respuestas vagas, formato incorrecto, inconsistencia, etc.]
</problema>

<analisis>
1. ¿Qué hace bien este prompt? (no arregles lo que funciona)
2. ¿Dónde es ambiguo? (interpretaciones posibles que no quieres)
3. ¿Qué información le falta a Claude para responder mejor?
4. ¿El formato de salida está especificado claramente?
5. Versión mejorada con cambios marcados y justificados
6. Test: 2-3 inputs donde la diferencia entre el prompt viejo y nuevo sería visible
</analisis>

No reescribas desde cero — itera sobre lo existente.`,
        tip: "Sonnet: excelente para análisis y refinamiento de prompts. La instrucción 'no reescribas desde cero' previene que Claude descarte el trabajo previo.",
        model: "Sonnet 4.6",
      },
      {
        title: "Cadena de prompts (chaining)",
        tag: "Workflow",
        prompt: `Necesito diseñar una cadena de prompts para una tarea compleja.

<tarea>
[DESCRIBE LA TAREA COMPLETA DE PRINCIPIO A FIN]
</tarea>

<restricciones>
- Modelos disponibles: [OPUS / SONNET / HAIKU]
- Presupuesto: [IMPORTA EL COSTO? SÍ/NO]
- Latencia: [NECESITO VELOCIDAD? SÍ/NO]
</restricciones>

<diseño_cadena>
1. Descompón la tarea en pasos secuenciales
2. Para cada paso:
   - Input: qué recibe (del usuario o del paso anterior)
   - Modelo recomendado: y por qué ese modelo para ese paso
   - Prompt específico para ese paso
   - Output: qué produce (y cómo alimenta al siguiente paso)
   - Validación: cómo saber si el paso funcionó correctamente
3. ¿Dónde puede fallar la cadena? ¿Cómo recuperarse?
4. ¿Qué pasos pueden ejecutarse en paralelo?
</diseño_cadena>`,
        tip: "Opus: mejor para diseñar cadenas complejas donde los pasos tienen dependencias sutiles. En la cadena misma, usa Haiku para clasificación/extracción y Sonnet/Opus para razonamiento.",
        model: "Opus 4.6",
      },
      {
        title: "Few-shot examples efectivos",
        tag: "Few-shot",
        prompt: `Necesito crear ejemplos few-shot para enseñarle a Claude un patrón específico.

<patron>
Tarea: [QUÉ DEBE HACER CLAUDE]
Input tipo: [FORMATO DE ENTRADA]
Output esperado: [FORMATO DE SALIDA EXACTO]
</patron>

<generar_ejemplos>
1. Crea 3-5 ejemplos que cubran:
   - El caso más común (baseline)
   - Un caso edge importante
   - Un caso donde la respuesta correcta NO es obvia
2. Para cada ejemplo, muéstralo en formato input→output
3. Ordénalos de simple a complejo
4. Incluye un anti-ejemplo: input con output INCORRECTO y por qué está mal
</generar_ejemplos>

<formato>
Usa XML tags consistentes para delimitar input/output en los ejemplos:
<ejemplo>
  <input>[...]</input>
  <output>[...]</output>
</ejemplo>
</formato>`,
        tip: "Sonnet: ideal para generar few-shot examples balanceados. Los anti-ejemplos son especialmente útiles para Claude — aprende tanto de lo correcto como de lo incorrecto.",
        model: "Sonnet 4.6",
      },
      {
        title: "Evaluación de calidad de respuestas",
        tag: "Evaluación",
        prompt: `Necesito evaluar sistemáticamente la calidad de las respuestas de Claude para una tarea.

<tarea>
[DESCRIBE LA TAREA QUE CLAUDE ESTÁ HACIENDO]
</tarea>

<respuesta_a_evaluar>
[PEGA LA RESPUESTA DE CLAUDE]
</respuesta_a_evaluar>

<rubrica>
Evalúa en estas dimensiones (1-5 cada una):
1. Corrección factual: ¿todo lo que dice es verdad?
2. Completitud: ¿respondió todo lo pedido?
3. Relevancia: ¿incluyó información innecesaria?
4. Formato: ¿siguió las instrucciones de formato?
5. Calibración: ¿expresó incertidumbre donde debía?
6. Utilidad: ¿el usuario puede actuar con esta respuesta?

Puntuación total + feedback específico para mejorar el prompt.
</rubrica>

<meta>
Si la puntuación es < 4 en alguna dimensión, sugiere un cambio concreto al prompt que lo mejoraría.
</meta>`,
        tip: "Sonnet: suficiente para evaluación sistemática con rúbrica clara. Opus: si necesitas evaluar respuestas sobre razonamiento complejo donde los errores son sutiles.",
        model: "Sonnet 4.6",
      },
      {
        title: "Formateo y transformación de texto",
        tag: "Formato",
        prompt: `Transforma este texto al formato especificado.

<texto_entrada>
[TU TEXTO, DATOS O CONTENIDO AQUÍ]
</texto_entrada>

<formato_entrada>
[DESCRIBE EL FORMATO ACTUAL: texto libre, CSV, lista, markdown, etc.]
</formato_entrada>

<formato_salida>
[DESCRIBE EL FORMATO DESEADO. Ejemplos:]
- JSON estructurado
- Tabla markdown
- Lista con bullet points
- YAML
- HTML
- Formato específico: [DESCRIBE CON EJEMPLO]
</formato_salida>

<reglas>
- Mantén TODA la información — no omitas ni resumas nada
- Si un dato no encaja en el formato destino, señálalo
- Valida que el formato de salida sea válido (JSON parseable, HTML válido, etc.)
- Si hay ambigüedad en cómo mapear campos, pregunta antes de asumir
</reglas>`,
        tip: "Haiku: la opción más eficiente para transformaciones de formato — tarea mecánica donde la velocidad y consistencia importan más que el razonamiento. Ideal para procesar cientos de transformaciones en pipeline.",
        model: "Haiku 4.5",
      },
  {
    title: "Testing adversarial de prompts",
    tag: "Robustez",
    prompt: `Tengo un prompt en producción y necesito encontrar sus puntos débiles antes de que lo hagan los usuarios.

<prompt_a_testear>
[PEGA TU PROMPT O SYSTEM PROMPT AQUÍ]
</prompt_a_testear>

<testing_adversarial>
Genera 10 inputs de test diseñados para hacer fallar el prompt:
1. El input más ambiguo posible (múltiples interpretaciones válidas)
2. Input vacío o mínimo
3. Input en un idioma distinto al esperado
4. Input que pide explícitamente ignorar las instrucciones
5. Input que es técnicamente válido pero semánticamente extraño
6. Input que mezcla el caso de uso correcto con uno fuera de scope
7. Input extremadamente largo (cerca del límite del contexto)
8. Input con formato inesperado (JSON cuando esperas texto, etc.)
9. Input con intención adversarial obvia
10. Input que un usuario legítimo pero no técnico podría mandar

Para los 3 casos donde el prompt probablemente fallará más, sugiere la corrección.
</testing_adversarial>`,
    tip: "Sonnet: muy bueno generando casos edge de forma creativa. Opus: si el prompt maneja lógica de negocio sensible donde los fallos tienen consecuencias importantes.",
    model: "Sonnet 4.6",
  },
  {
    title: "Prompt para agente autónomo",
    tag: "Agentes",
    prompt: `Necesito diseñar el prompt para un agente Claude que actúa de forma autónoma.

<agente>
Objetivo del agente: [QUÉ DEBE LOGRAR AUTÓNOMAMENTE]
Herramientas disponibles: [LISTA: búsqueda web, ejecución de código, email, etc.]
Límites de autonomía: [QUÉ PUEDE DECIDIR SOLO VS. QUÉ REQUIERE APROBACIÓN HUMANA]
</agente>

<diseño_agente>
El system prompt del agente debe incluir:
1. Identidad y objetivo claro (qué es y para qué existe)
2. Loop de razonamiento: cómo debe pensar antes de actuar (ReAct o similar)
3. Jerarquía de herramientas: cuándo usar cada una
4. Criterios de parada: cuándo el agente debe detenerse y pedir ayuda
5. Manejo de errores: qué hacer si una herramienta falla
6. Logging: qué debe registrar de cada acción y por qué
7. Prevención de loops: cómo evitar que repita acciones que no funcionan

Genera el system prompt completo listo para usar.
</diseño_agente>`,
    tip: "Opus: mejor para diseñar agentes con comportamiento complejo y decisiones en contextos ambiguos. Sonnet: si el agente tiene un scope muy acotado y herramientas bien definidas.",
    model: "Opus 4.6",
  },      
    ],
  },
];

export default categories;
