# Manual de Usuario - Aplicación de Gestión de Clubes de Pádel

## Índice
1. [Introducción](#introducción)
2. [Acceso al Sistema](#acceso-al-sistema)
3. [Dashboard Principal](#dashboard-principal)
4. [Gestión de Jugadores](#gestión-de-jugadores)
5. [Sistema de Matchmaking](#sistema-de-matchmaking)
6. [Creador de Partidos](#creador-de-partidos)
7. [Gestión de Eventos y Torneos](#gestión-de-eventos-y-torneos)
8. [Preguntas Frecuentes](#preguntas-frecuentes)

## Introducción

Bienvenido a la aplicación de Gestión de Clubes de Pádel, una herramienta diseñada específicamente para ayudar a los administradores de clubes a gestionar jugadores, crear partidos equilibrados, organizar eventos y torneos, y mucho más.

Esta aplicación utiliza el algoritmo TrueSkill para evaluar el nivel de los jugadores y crear partidos equilibrados, mejorando así la experiencia de juego para todos los participantes.

## Acceso al Sistema

Para acceder a la aplicación, siga estos pasos:

1. Abra su navegador web y vaya a la dirección proporcionada por su administrador.
2. En la pantalla de inicio de sesión, introduzca el nombre de usuario y contraseña proporcionados para su club.
3. Haga clic en "Iniciar Sesión".

![Pantalla de inicio de sesión](./images/login.png)

**Nota**: Si ha olvidado su contraseña, contacte con el administrador del sistema.

## Dashboard Principal

Una vez que haya iniciado sesión, verá el dashboard principal que muestra un resumen de la actividad del club:

- **Estadísticas Generales**: Número total de jugadores, partidos jugados, eventos programados, etc.
- **Actividad Reciente**: Últimos partidos jugados y próximos eventos.
- **Jugadores Activos**: Lista de los jugadores más activos del club.
- **Acciones Rápidas**: Botones para crear nuevos partidos, eventos o añadir jugadores.

![Dashboard Principal](./images/dashboard.png)

## Gestión de Jugadores

La sección de Gestión de Jugadores le permite ver, buscar y filtrar todos los jugadores registrados en su club.

### Visualización de Jugadores

- Los jugadores se muestran en tarjetas con su información básica: nombre, nivel TrueSkill, género, lado preferido y estadísticas.
- Puede ordenar los jugadores por diferentes criterios como nivel, partidos jugados o ratio de victorias.

### Búsqueda y Filtros

- Utilice la barra de búsqueda para encontrar jugadores por nombre.
- Haga clic en "Mostrar Filtros" para acceder a opciones avanzadas de filtrado:
  - **Nivel Mínimo/Máximo**: Filtre jugadores por rango de nivel.
  - **Género**: Filtre por jugadores masculinos o femeninos.
  - **Lado Preferido**: Filtre por jugadores que prefieren jugar en el lado derecho, izquierdo o ambos.

![Gestión de Jugadores](./images/players.png)

## Sistema de Matchmaking

El sistema de Matchmaking es una de las características más potentes de la aplicación, permitiéndole crear partidos equilibrados automáticamente.

### Configuración de Matchmaking

Antes de generar sugerencias, puede ajustar los parámetros del matchmaking:

- **Diferencia Mínima/Máxima de Nivel**: Establece el rango aceptable de diferencia de nivel entre equipos.
- **Considerar Lado Preferido**: Actívelo para tener en cuenta el lado preferido de los jugadores.
- **Considerar Género**: Actívelo para intentar crear partidos con equipos del mismo género.

### Botón Mágico

El "Botón Mágico" analiza todos los jugadores disponibles y genera sugerencias de partidos equilibrados:

1. Haga clic en el "Botón Mágico" para generar sugerencias.
2. Revise las sugerencias de partidos que aparecen, cada una con un indicador de equilibrio.
3. Para cada sugerencia, puede:
   - **Aceptar**: Crea el partido con los jugadores sugeridos.
   - **Rechazar**: Descarta la sugerencia.
   - **Ver Detalles**: Muestra información más detallada sobre el partido sugerido.

![Sistema de Matchmaking](./images/matchmaking.png)

## Creador de Partidos

El Creador de Partidos le permite formar partidos manualmente mediante un sistema de arrastrar y soltar (drag and drop).

### Creación de Partidos

1. En la columna izquierda, verá la lista de jugadores disponibles.
2. Arrastre jugadores desde esta lista a las posiciones de los partidos en la derecha.
3. Puede crear múltiples partidos haciendo clic en "Añadir Nuevo Partido".
4. Para cada partido, debe asignar 4 jugadores (2 por equipo).
5. El sistema calculará automáticamente el equilibrio del partido basado en los niveles TrueSkill.
6. Una vez que un partido tenga 4 jugadores asignados, puede hacer clic en "Crear Partido".

### Indicadores de Equilibrio

Cada partido muestra un indicador visual de equilibrio:

- **Verde**: Partido muy equilibrado (80-100%)
- **Amarillo**: Partido moderadamente equilibrado (60-80%)
- **Naranja**: Partido poco equilibrado (40-60%)
- **Rojo**: Partido desequilibrado (0-40%)

![Creador de Partidos](./images/match_creator.png)

## Gestión de Eventos y Torneos

La sección de Eventos y Torneos le permite organizar actividades para los miembros de su club.

### Eventos

Los eventos son actividades sociales o competitivas que no siguen un formato de torneo:

1. Haga clic en "Crear Evento" para abrir el formulario.
2. Complete los campos requeridos:
   - **Nombre y Descripción**: Información básica del evento.
   - **Fechas de Inicio y Fin**: Cuándo se realizará el evento.
   - **Ubicación**: Dónde se llevará a cabo.
   - **Máximo de Participantes**: Cuántos jugadores pueden participar.
   - **Tipo**: Social o competitivo.
3. Haga clic en "Crear" para guardar el evento.

### Torneos

Los torneos son competiciones estructuradas con un formato específico:

1. Haga clic en "Crear Torneo" para abrir el formulario.
2. Complete los campos requeridos (similares a los eventos).
3. Adicionalmente, seleccione el formato del torneo:
   - **Eliminación Simple**: Formato de eliminación directa.
   - **Eliminación Doble**: Los jugadores tienen una segunda oportunidad tras perder.
   - **Round Robin**: Todos los participantes juegan contra todos.
4. Haga clic en "Crear" para guardar el torneo.

### Gestión de Participantes

Para cada evento o torneo, puede:

- Ver la lista de participantes inscritos.
- Añadir o eliminar participantes manualmente.
- Generar emparejamientos automáticos (solo para torneos).
- Registrar resultados de partidos.

![Gestión de Eventos y Torneos](./images/events.png)

## Preguntas Frecuentes

**P: ¿Cómo funciona el sistema TrueSkill?**
R: TrueSkill es un algoritmo de clasificación desarrollado por Microsoft Research que evalúa el nivel de los jugadores basándose en sus resultados. Cada jugador tiene un valor "mu" (nivel medio) y un valor "sigma" (incertidumbre). A medida que juegan más partidos, el sistema ajusta estos valores para reflejar su nivel real.

**P: ¿Puedo modificar un partido después de crearlo?**
R: Sí, puede editar los detalles de un partido siempre que no se haya jugado aún. Una vez que se registra el resultado, el partido no puede modificarse.

**P: ¿Cómo se calcula el equilibrio de un partido?**
R: El equilibrio se calcula comparando los niveles TrueSkill de ambos equipos y evaluando la probabilidad de que el partido resulte en un empate. Cuanto mayor sea esta probabilidad, más equilibrado es el partido.

**P: ¿Puedo exportar los datos de jugadores o partidos?**
R: Actualmente, la aplicación no incluye una función de exportación directa. Sin embargo, puede contactar con el administrador del sistema para solicitar esta información.

---

Para cualquier consulta adicional o soporte técnico, por favor contacte con el administrador del sistema o visite nuestra página de soporte.
