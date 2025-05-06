BEGIN;

-- 1) Miembros (100)
INSERT INTO Miembro (Nombre, FechaNacimiento, Género, Altura, FechaIngreso)
SELECT
  initcap(left(md5(random()::text), 6) || ' ' || left(md5(random()::text), 6)),
  date '2005-01-01' - (random() * 365 * 40)::int,
  (ARRAY['M','F','O'])[floor(random() * 3 + 1)],
  round(150 + random() * 50, 2),
  current_date - (random() * 365)::int
FROM generate_series(1,100);

-- 2) ContactoMiembro (2 por miembro)
INSERT INTO ContactoMiembro (MiembroID, TipoContacto, Valor)
SELECT id, 'Email',
       lower(regexp_replace(nombre, ' ', '.', 'g')) || '@example.com'
FROM Miembro;

INSERT INTO ContactoMiembro (MiembroID, TipoContacto, Valor)
SELECT id, 'Phone',
       lpad((floor(1e9 + random() * 9e9))::text, 10, '0')
FROM Miembro;

-- 3) Entrenadores (10)
INSERT INTO Entrenador (Nombre, Especialización)
SELECT
  initcap(left(md5(random()::text), 6) || ' ' || left(md5(random()::text), 6)),
  (ARRAY['Fuerza','Cardio','Yoga','CrossFit'])[floor(random() * 4 + 1)]
FROM generate_series(1,10);

-- 4) ContactoEntrenador (2 por entrenador)
INSERT INTO ContactoEntrenador (EntrenadorID, TipoContacto, Valor)
SELECT id, 'Email',
       lower(regexp_replace(nombre, ' ', '.', 'g')) || '@trainer.com'
FROM Entrenador;

INSERT INTO ContactoEntrenador (EntrenadorID, TipoContacto, Valor)
SELECT id, 'Phone',
       lpad((floor(1e9 + random() * 9e9))::text, 10, '0')
FROM Entrenador;

-- 5) Planes de Membresía (5 estáticos)
INSERT INTO PlanMembresía (Nombre, Descripción, Precio, Duración)
VALUES
  ('Básico',    'Acceso al gimnasio',           50.00,  1),
  ('Premium',   'Acceso completo + clases',      80.00, 12),
  ('Estándar',  'Acceso a equipos',              60.00,  6),
  ('Estudiante','Descuento para estudiantes',    40.00,  3),
  ('Familiar',  'Acceso para familias',         100.00, 12);

-- 6) Membresías (100)
INSERT INTO Membresía (MiembroID, PlanID, FechaInicio)
SELECT
  (floor(random() * 100) + 1)::int,
  (floor(random() * 5)   + 1)::int,
  current_date - (random() * 365)::int
FROM generate_series(1,100);

-- 7) Ejercicios (20)
INSERT INTO Ejercicio (Nombre, Tipo)
SELECT
  left(md5(random()::text), 8),
  (ARRAY['Fuerza','Cardio','Flexibilidad'])[floor(random() * 3 + 1)]
FROM generate_series(1,20);

-- 8) Equipos (10)
INSERT INTO Equipo (Nombre, Tipo, Ubicación)
SELECT
  left(md5(random()::text), 6),
  (ARRAY['Peso libre','Cardio','Máquina'])[floor(random() * 3 + 1)],
  left(md5(random()::text), 4)
FROM generate_series(1,10);

-- 9) EjercicioGrupoMuscular (20)
INSERT INTO EjercicioGrupoMuscular (EjercicioID, GrupoMuscular)
SELECT
  gs,
  (ARRAY['Piernas','Glúteos','Pecho','Espalda','Brazos'])[floor(random() * 5 + 1)]
FROM generate_series(1,20) AS s(gs);

-- 10) EquipoEjercicio (20)
INSERT INTO EquipoEjercicio (EjercicioID, EquipoID)
SELECT
  (floor(random() * 20) + 1)::int,
  (floor(random() * 10) + 1)::int
FROM generate_series(1,20);

-- 11) Sesiones de Entrenamiento (200)
INSERT INTO SesiónEntrenamiento (Fecha, Hora, MiembroID, EntrenadorID)
SELECT
  current_date - (random() * 365)::int,
  to_char(time '08:00' + random() * (time '20:00' - time '08:00'), 'HH24:MI:SS'),
  (floor(random() * 100) + 1)::int,
  (floor(random() * 10)  + 1)::int
FROM generate_series(1,200);

-- 12) Registros de Progreso (200)
INSERT INTO RegistroProgreso (MiembroID, Fecha, Peso, PorcentajeGrasaCorporal)
SELECT
  (floor(random() * 100) + 1)::int,
  current_date - (random() * 365)::int,
  round(50 + random() * 50, 1),
  round(10 + random() * 20, 1)
FROM generate_series(1,200);

-- 13) Detalles de Entrenamiento (200)
INSERT INTO DetalleEntrenamiento
  (SesiónID, EjercicioID, Series, Repeticiones, Peso, Duración)
SELECT
  (floor(random() * 200) + 1)::int,
  (floor(random() * 20)  + 1)::int,
  floor(random() * 5) + 1,
  floor(random() * 8) + 8,
  round(random() * 100, 1),
  (floor(random() * 26) + 5)::text || ' minutes'
FROM generate_series(1,200);

COMMIT;
