const { Pool } = require('pg');
const faker = require('@faker-js/faker').fakerES;
require('dotenv').config();



async function seedDatabase() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  });

  try {
    // Verificar si la tabla Miembro tiene datos
    const miembroCount = await pool.query('SELECT COUNT(*) FROM Miembro');
    if (parseInt(miembroCount.rows[0].count) > 0) {
      console.log('La base de datos ya tiene datos. No se insertarán nuevos registros.');
      return;
    }

    // Insertar Miembros (100+)
    const miembros = [];
    for (let i = 0; i < 100; i++) {
      miembros.push([
        faker.person.fullName(),
        faker.date.past({ years: 40, refDate: '2005-01-01' }).toISOString().split('T')[0],
        faker.helpers.arrayElement(['M', 'F', 'O']),
        (faker.number.int({ min: 150, max: 200 })).toFixed(2),
        faker.date.recent({ days: 365 }).toISOString().split('T')[0],
      ]);
    }
    await pool.query(
      'INSERT INTO Miembro (Nombre, FechaNacimiento, Género, Altura, FechaIngreso) VALUES ' +
      miembros.map((_, i) => `($${i * 5 + 1}, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5})`).join(','),
      miembros.flat()
    );

    // Insertar ContactoMiembro (100+)
    const contactosMiembro = [];
    for (let i = 1; i <= 100; i++) {
      contactosMiembro.push([
        i, // MiembroID
        'Email',
        faker.internet.email(),
      ]);
      contactosMiembro.push([
        i, // MiembroID
        'Phone',
        faker.phone.number(),
      ]);
    }
    await pool.query(
      'INSERT INTO ContactoMiembro (MiembroID, TipoContacto, Valor) VALUES ' +
      contactosMiembro.map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`).join(','),
      contactosMiembro.flat()
    );

    // Insertar Entrenadores (10)
    const entrenadores = [];
    for (let i = 0; i < 10; i++) {
      entrenadores.push([
        faker.person.fullName(),
        faker.helpers.arrayElement(['Fuerza', 'Cardio', 'Yoga', 'CrossFit']),
      ]);
    }
    await pool.query(
      'INSERT INTO Entrenador (Nombre, Especialización) VALUES ' +
      entrenadores.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(','),
      entrenadores.flat()
    );

    // Insertar ContactoEntrenador (20)
    const contactosEntrenador = [];
    for (let i = 1; i <= 10; i++) {
      contactosEntrenador.push([
        i, // EntrenadorID
        'Email',
        faker.internet.email(),
      ]);
      contactosEntrenador.push([
        i, // EntrenadorID
        'Phone',
        faker.phone.number(),
      ]);
    }
    await pool.query(
      'INSERT INTO ContactoEntrenador (EntrenadorID, TipoContacto, Valor) VALUES ' +
      contactosEntrenador.map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`).join(','),
      contactosEntrenador.flat()
    );

    // Insertar Planes de Membresía (5)
    const planes = [
      ['Básico', 'Acceso al gimnasio', 50.00, 1],
      ['Premium', 'Acceso completo + clases', 80.00, 12],
      ['Estándar', 'Acceso a equipos', 60.00, 6],
      ['Estudiante', 'Descuento para estudiantes', 40.00, 3],
      ['Familiar', 'Acceso para familias', 100.00, 12],
    ];
    await pool.query(
      'INSERT INTO PlanMembresía (Nombre, Descripción, Precio, Duración) VALUES ' +
      planes.map((_, i) => `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`).join(','),
      planes.flat()
    );

    // Insertar Membresías (100+)
    const membresias = [];
    for (let i = 0; i < 100; i++) {
      const fechaInicio = faker.date.recent({ days: 365 }).toISOString().split('T')[0];
      membresias.push([
        faker.number.int({ min: 1, max: 100 }), // MiembroID
        faker.number.int({ min: 1, max: 5 }),   // PlanID
        fechaInicio,
      ]);
    }
    await pool.query(
      'INSERT INTO Membresía (MiembroID, PlanID, FechaInicio) VALUES ' +
      membresias.map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`).join(','),
      membresias.flat()
    );

    // Insertar Ejercicios (20)
    const ejercicios = [];
    for (let i = 0; i < 20; i++) {
      ejercicios.push([
        faker.lorem.words(2),
        faker.helpers.arrayElement(['Fuerza', 'Cardio', 'Flexibilidad']),
      ]);
    }
    await pool.query(
      'INSERT INTO Ejercicio (Nombre, Tipo) VALUES ' +
      ejercicios.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(','),
      ejercicios.flat()
    );

    // Insertar Equipos (10)
    const equipos = [];
    for (let i = 0; i < 10; i++) {
      equipos.push([
        faker.lorem.words(2),
        faker.helpers.arrayElement(['Peso libre', 'Cardio', 'Máquina']),
        faker.lorem.word(),
      ]);
    }
    await pool.query(
      'INSERT INTO Equipo (Nombre, Tipo, Ubicación) VALUES ' +
      equipos.map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`).join(','),
      equipos.flat()
    );

    // Insertar EjercicioGrupoMuscular (20)
    const gruposMusculares = [];
    for (let i = 1; i <= 20; i++) {
      gruposMusculares.push([
        i,
        faker.helpers.arrayElement(['Piernas', 'Glúteos', 'Pecho', 'Espalda', 'Brazos']),
      ]);
    }
    await pool.query(
      'INSERT INTO EjercicioGrupoMuscular (EjercicioID, GrupoMuscular) VALUES ' +
      gruposMusculares.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(','),
      gruposMusculares.flat()
    );

    // Insertar EquipoEjercicio (20)
    const equipoEjercicio = [];
    for (let i = 1; i <= 20; i++) {
      equipoEjercicio.push([
        i,
        faker.number.int({ min: 1, max: 10 }),
      ]);
    }
    await pool.query(
      'INSERT INTO EquipoEjercicio (EjercicioID, EquipoID) VALUES ' +
      equipoEjercicio.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(','),
      equipoEjercicio.flat()
    );

    // Insertar Sesiones de Entrenamiento (200+)
    const sesiones = [];
    for (let i = 0; i < 200; i++) {
      sesiones.push([
        faker.date.recent({ days: 365 }).toISOString().split('T')[0],
        faker.date.between({ from: '2024-01-01T08:00:00', to: '2024-01-01T20:00:00' }).toTimeString().split(' ')[0],
        faker.number.int({ min: 1, max: 100 }), // MiembroID
        faker.number.int({ min: 1, max: 10 }),  // EntrenadorID
      ]);
    }
    await pool.query(
      'INSERT INTO SesiónEntrenamiento (Fecha, Hora, MiembroID, EntrenadorID) VALUES ' +
      sesiones.map((_, i) => `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`).join(','),
      sesiones.flat()
    );

    // Insertar Registros de Progreso (200+)
    const progresos = [];
    for (let i = 0; i < 200; i++) {
      const peso = faker.number.float({ min: 50, max: 100, precision: 0.1 });
      progresos.push([
        faker.number.int({ min: 1, max: 100 }), // MiembroID
        faker.date.recent({ days: 365 }).toISOString().split('T')[0],
        peso,
        faker.number.float({ min: 10, max: 30, precision: 0.1 }),
      ]);
    }
    await pool.query(
      'INSERT INTO RegistroProgreso (MiembroID, Fecha, Peso, PorcentajeGrasaCorporal) VALUES ' +
      progresos.map((_, i) => `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`).join(','),
      progresos.flat()
    );

    // Insertar Detalles de Entrenamiento (200+)
    const detalles = [];
    for (let i = 0; i < 200; i++) {
      detalles.push([
        faker.number.int({ min: 1, max: 200 }), // SesiónID
        faker.number.int({ min: 1, max: 20 }),  // EjercicioID
        faker.number.int({ min: 1, max: 5 }),   // Series
        faker.number.int({ min: 8, max: 15 }),  // Repeticiones
        faker.number.float({ min: 0, max: 100, precision: 0.1 }),
        `${faker.number.int({ min: 5, max: 30 })} minutes`,
      ]);
    }
    await pool.query(
      'INSERT INTO DetalleEntrenamiento (SesiónID, EjercicioID, Series, Repeticiones, Peso, Duración) VALUES ' +
      detalles.map((_, i) => `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6})`).join(','),
      detalles.flat()
    );

    console.log('Datos iniciales insertados correctamente.');
  } catch (err) {
    console.error('Error insertando datos:', err);
  } finally {
    await pool.end();
  }
}

module.exports = seedDatabase;