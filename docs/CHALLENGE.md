# Reto Técnico — Senior Frontend Developer (Angular)

## 1. Contexto

`workout-coach` es una aplicación Angular 20 que hoy funciona como un **proyecto legacy real**: toda la
funcionalidad vive en un único componente (`WorkoutTimer`), el servicio devuelve `any`, hay estado mutable
disperso, `setInterval` sin limpieza, `*ngIf` / `ngClass`, inyección por constructor y lógica de presentación
dentro del template.

Funcionalidad actual:

- Un servicio mock devuelve **un solo ejercicio**: `exercise_name`, `repetitions_number`, `repetition_time`, `rest_time`.
- Temporizador con cuenta regresiva y botones Iniciar / Pausar / Reiniciar.
- Alternancia entre fase de repetición y fase de descanso, con notificación flotante en cada cambio de fase.
- Contador de repeticiones completadas.

**El reto no es "hacer que funcione": ya funciona.** El reto es demostrar cómo un senior interviene un
código legacy sin romperlo, aplicando un proceso explícito y una arquitectura sostenible.

---

## 2. Qué se espera que entregues

### 2.1. Desarrollo guiado por especificación (SDD)

Se evaluará que el desarrollo sea **Spec-Driven Development**, no improvisado:

- Antes de escribir código, se espera una **especificación escrita y versionada en el repo** (por ejemplo
  `.spec/<ticket>/spec.md` o `docs/spec/...`) que contenga como mínimo:
  - Contexto y problema a resolver.
  - Alcance explícito (qué entra y qué **no** entra).
  - Diseño propuesto: capas, contratos, modelo de dominio y flujo de datos.
  - Plan de tareas (workstreams) con orden de ejecución.
  - Criterios de aceptación verificables.
  - Evidencia: build, tests y resultados.
- Los commits deben ser trazables a la especificación (Conventional Commits recomendado).
- Si durante la implementación cambias de enfoque, **se espera que actualices la spec**, no que la abandones.

> Una implementación correcta sin spec puntúa por debajo de una implementación equivalente con spec clara.

### 2.2. Refactoring a Clean Architecture

Se espera reorganizar el código en cuatro capas con dependencias apuntando **siempre hacia el dominio**:

```
src/app/features/workout/
├─ domain/          # Entidades, value objects, reglas de negocio puras, puertos (interfaces)
├─ application/     # Casos de uso / orquestación, estado de la sesión de entrenamiento
├─ infrastructure/  # Adaptadores: servicio HTTP/mock, mappers DTO→dominio, notificaciones, timer
└─ presentation/    # Componentes Angular, templates, estilos
```

Reglas que se verificarán:

| Capa | Puede depender de | Nunca depende de |
| --- | --- | --- |
| `domain` | nada (TypeScript puro, sin Angular) | Angular, RxJS de infraestructura, DOM |
| `application` | `domain` | `presentation`, detalles de `infrastructure` |
| `infrastructure` | `domain` (implementa sus puertos) | `presentation` |
| `presentation` | `application`, `domain` (solo tipos) | `infrastructure` directamente |

- El dominio no debe contener `any`, ni tipos del DTO externo (`exercise_name`, `repetitions_number`, …):
  esos nombres son del contrato externo y deben mapearse en `infrastructure`.
- La lógica del temporizador y de transición de fases pertenece al **dominio / aplicación**, no al componente.
- La inversión de dependencias debe ser real: el caso de uso depende de una interfaz (`WorkoutRepository`),
  no de la clase concreta del mock.

### 2.3. Componetización: patrón Presentational / Container

Se evaluará la separación explícita:

- **Container (smart)**: conoce los casos de uso, inyecta dependencias, mantiene el estado y decide.
- **Presentational (dumb)**: sin dependencias inyectadas, recibe datos por `input()` y emite eventos por
  `output()`, sin lógica de negocio, con `ChangeDetectionStrategy.OnPush`.

Componetización mínima esperada (los nombres son orientativos):

- `WorkoutPageComponent` (container)
- `WorkoutTimerComponent` (presentational: reloj, fase y controles)
- `ExerciseListComponent` / `ExerciseItemComponent` (presentational: lista y estado de cada ejercicio)
- `WorkoutToastComponent` o equivalente para la notificación

Se valorará que los componentes presentacionales sean reutilizables y testeables **sin montar la app completa**.

### 2.4. Feature a implementar: entrenamiento completo (lista de ejercicios)

Además del refactor, debe entregarse funcionalidad nueva:

1. El servicio deja de devolver un único ejercicio y devuelve **una lista de ejercicios** que conforma un
   entrenamiento completo (sigue siendo mock; el contrato externo mantiene el `snake_case`).
2. La pantalla principal muestra la **lista completa del entrenamiento**, no solo el ejercicio en curso.
3. La sesión avanza automáticamente: al terminar todas las repeticiones de un ejercicio, se continúa con el
   siguiente hasta completar el entrenamiento.
4. Cada ejercicio de la lista muestra su estado:
   - **Completado** → check (✓)
   - **En curso** → indicador de ejercicio activo
   - **Pendiente** → guion (–)
5. Se conserva el comportamiento actual: cuenta regresiva de repetición, descanso, notificación al cambiar de
   fase, contador de repeticiones y los controles Iniciar / Pausar / Reiniciar.

Criterios de aceptación funcionales:

- [ ] Al cargar, todos los ejercicios aparecen como pendientes y el entrenamiento no ha iniciado.
- [ ] Al iniciar, el primer ejercicio pasa a "en curso" y el temporizador cuenta desde su `repetition_time`.
- [ ] Al llegar a 00:00 se notifica el descanso y el contador se recarga con `rest_time`.
- [ ] Al terminar el descanso se incrementa la repetición completada del ejercicio actual.
- [ ] Al completar todas las repeticiones, el ejercicio se marca como completado y arranca el siguiente.
- [ ] Al completar el último ejercicio, el entrenamiento se marca como finalizado.
- [ ] Pausar detiene el conteo sin perder el progreso; Reiniciar vuelve al estado inicial.

---

## 3. Criterios de evaluación

| # | Criterio | Peso | Qué se observa |
| --- | --- | --- | --- |
| 1 | **SDD** | 25% | Existencia y calidad de la spec, trazabilidad spec↔commits↔código, alcance controlado, evidencia registrada |
| 2 | **Clean Architecture** | 25% | Capas correctas, dirección de dependencias, dominio puro, puertos/adaptadores, mapeo DTO↔dominio |
| 3 | **Componetización (Container/Presentational)** | 20% | Separación real de responsabilidades, `input()`/`output()`, `OnPush`, reutilización, templates simples |
| 4 | **Feature completa** | 15% | Cumplimiento de los criterios de aceptación funcionales |
| 5 | **Calidad Angular moderna** | 10% | Signals y `computed()`, `inject()`, control flow nativo (`@if`, `@for`), standalone, tipado estricto sin `any`, limpieza de timers/suscripciones |
| 6 | **Testing** | 5% | Tests unitarios del dominio y de los casos de uso, al menos un test de componente presentacional |

## 4. Entrega

1. Repositorio (fork o rama) con el historial de commits completo.
2. Spec(s) versionadas dentro del repo.

Se recomienda no exceder un alcance razonable: **es preferible menos alcance bien especificado, bien
arquitecturado y bien probado, que la feature completa sin proceso.**
