const { Pool } = require('pg');
require('dotenv').config();

const initPool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: 'postgres', // Conectar a la DB por defecto para crear 'gimnasio'
});

async function initializeDatabase() {
  try {
    // Crear la base de datos si no existe
    const dbExists = await initPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [process.env.DB_NAME]
    );
    if (dbExists.rowCount === 0) {
      await initPool.query(`CREATE DATABASE ${process.env.DB_NAME}`);
      console.log(`Base de datos '${process.env.DB_NAME}' creada.`);
    }

    // Conectar a la base de datos 'gimnasio'
    const pool = new Pool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
    });

    // Crear tablas y disparadores
    await pool.query(`
      -- Crear tabla Miembro
      CREATE TABLE IF NOT EXISTS Miembro (
        MiembroID SERIAL PRIMARY KEY,
        Nombre VARCHAR(100) NOT NULL,
        FechaNacimiento DATE NOT NULL,
        Género CHAR(1) CHECK (Género IN ('M', 'F', 'O')),
        Altura DECIMAL(5,2) CHECK (Altura > 0),
        FechaIngreso DATE NOT NULL,
        total_sesiones INTEGER DEFAULT 0
      );

      -- Crear tabla ContactoMiembro
      CREATE TABLE IF NOT EXISTS ContactoMiembro (
        ContactoID SERIAL PRIMARY KEY,
        MiembroID INTEGER NOT NULL REFERENCES Miembro(MiembroID),
        TipoContacto VARCHAR(20) NOT NULL CHECK (TipoContacto IN ('Email', 'Phone', 'Other')),
        Valor VARCHAR(100) NOT NULL,
        UNIQUE (MiembroID, TipoContacto)
      );

      -- Crear tabla Entrenador
      CREATE TABLE IF NOT EXISTS Entrenador (
        EntrenadorID SERIAL PRIMARY KEY,
        Nombre VARCHAR(100) NOT NULL,
        Especialización VARCHAR(100)
      );

      -- Crear tabla ContactoEntrenador
      CREATE TABLE IF NOT EXISTS ContactoEntrenador (
        ContactoID SERIAL PRIMARY KEY,
        EntrenadorID INTEGER NOT NULL REFERENCES Entrenador(EntrenadorID),
        TipoContacto VARCHAR(20) NOT NULL CHECK (TipoContacto IN ('Email', 'Phone', 'Other')),
        Valor VARCHAR(100) NOT NULL,
        UNIQUE (EntrenadorID, TipoContacto)
      );

      -- Crear tabla SesiónEntrenamiento
      CREATE TABLE IF NOT EXISTS SesiónEntrenamiento (
        SesiónID SERIAL PRIMARY KEY,
        Fecha DATE NOT NULL,
        Hora TIME NOT NULL,
        MiembroID INTEGER NOT NULL REFERENCES Miembro(MiembroID),
        EntrenadorID INTEGER NOT NULL REFERENCES Entrenador(EntrenadorID)
      );

      -- Crear tabla Ejercicio
      CREATE TABLE IF NOT EXISTS Ejercicio (
        EjercicioID SERIAL PRIMARY KEY,
        Nombre VARCHAR(100) NOT NULL,
        Tipo VARCHAR(50)
      );

      -- Crear tabla EjercicioGrupoMuscular
      CREATE TABLE IF NOT EXISTS EjercicioGrupoMuscular (
        EjercicioID INTEGER NOT NULL REFERENCES Ejercicio(EjercicioID),
        GrupoMuscular VARCHAR(50) NOT NULL,
        PRIMARY KEY (EjercicioID, GrupoMuscular)
      );

      -- Crear tabla DetalleEntrenamiento
      CREATE TABLE IF NOT EXISTS DetalleEntrenamiento (
        DetalleID SERIAL PRIMARY KEY,
        SesiónID INTEGER NOT NULL REFERENCES SesiónEntrenamiento(SesiónID),
        EjercicioID INTEGER NOT NULL REFERENCES Ejercicio(EjercicioID),
        Series INTEGER CHECK (Series > 0),
        Repeticiones INTEGER CHECK (Repeticiones > 0),
        Peso DECIMAL(5,2) CHECK (Peso >= 0),
        Duración INTERVAL
      );

      -- Crear tabla RegistroProgreso
      CREATE TABLE IF NOT EXISTS RegistroProgreso (
        RegistroID SERIAL PRIMARY KEY,
        MiembroID INTEGER NOT NULL REFERENCES Miembro(MiembroID),
        Fecha DATE NOT NULL,
        Peso DECIMAL(5,2) CHECK (Peso > 0),
        PorcentajeGrasaCorporal DECIMAL(5,2) DEFAULT 0,
        IMC DECIMAL(5,2)
      );

      -- Crear tabla Equipo
      CREATE TABLE IF NOT EXISTS Equipo (
        EquipoID SERIAL PRIMARY KEY,
        Nombre VARCHAR(100) NOT NULL,
        Tipo VARCHAR(50),
        Ubicación VARCHAR(100)
      );

      -- Crear tabla EquipoEjercicio
      CREATE TABLE IF NOT EXISTS EquipoEjercicio (
        EjercicioID INTEGER NOT NULL REFERENCES Ejercicio(EjercicioID),
        EquipoID INTEGER NOT NULL REFERENCES Equipo(EquipoID),
        PRIMARY KEY (EjercicioID, EquipoID)
      );

      -- Crear tabla PlanMembresía
      CREATE TABLE IF NOT EXISTS PlanMembresía (
        PlanID SERIAL PRIMARY KEY,
        Nombre VARCHAR(100) NOT NULL UNIQUE,
        Descripción TEXT,
        Precio DECIMAL(10,2) NOT NULL,
        Duración INTEGER NOT NULL DEFAULT 12
      );

      -- Crear tabla Membresía
      CREATE TABLE IF NOT EXISTS Membresía (
        MembresíaID SERIAL PRIMARY KEY,
        MiembroID INTEGER NOT NULL REFERENCES Miembro(MiembroID),
        PlanID INTEGER NOT NULL REFERENCES PlanMembresía(PlanID),
        FechaInicio DATE NOT NULL,
        FechaFin DATE
      );

      -- Disparadores
      -- 1. Calcular IMC
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_proc WHERE proname = 'calcular_imc'
        ) THEN
          CREATE FUNCTION calcular_imc()
          RETURNS TRIGGER AS $BODY$
          BEGIN
            IF NEW.Peso IS NOT NULL AND (SELECT Altura FROM Miembro WHERE MiembroID = NEW.MiembroID) IS NOT NULL THEN
              NEW.IMC := (NEW.Peso / POWER((SELECT Altura FROM Miembro WHERE MiembroID = NEW.MiembroID) / 100, 2));
            END IF;
            RETURN NEW;
          END;
          $BODY$ LANGUAGE plpgsql;
        END IF;
      END $$;

      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_calcular_imc'
        ) THEN
          CREATE TRIGGER trigger_calcular_imc
          BEFORE INSERT OR UPDATE ON RegistroProgreso
          FOR EACH ROW
          EXECUTE FUNCTION calcular_imc();
        END IF;
      END $$;

      -- 2. Establecer FechaFin
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_proc WHERE proname = 'establecer_fecha_fin'
        ) THEN
          CREATE FUNCTION establecer_fecha_fin()
          RETURNS TRIGGER AS $BODY$
          BEGIN
            IF NEW.FechaFin IS NULL THEN
              NEW.FechaFin := NEW.FechaInicio + INTERVAL '1 month' * (SELECT Duración FROM PlanMembresía WHERE PlanID = NEW.PlanID);
            END IF;
            RETURN NEW;
          END;
          $BODY$ LANGUAGE plpgsql;
        END IF;
      END $$;

      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_establecer_fecha_fin'
        ) THEN
          CREATE TRIGGER trigger_establecer_fecha_fin
          BEFORE INSERT ON Membresía
          FOR EACH ROW
          EXECUTE FUNCTION establecer_fecha_fin();
        END IF;
      END $$;

      -- 3. Actualizar total de sesiones
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_proc WHERE proname = 'actualizar_total_sesiones'
        ) THEN
          CREATE FUNCTION actualizar_total_sesiones()
          RETURNS TRIGGER AS $BODY$
          BEGIN
            UPDATE Miembro SET total_sesiones = total_sesiones + 1 WHERE MiembroID = NEW.MiembroID;
            RETURN NEW;
          END;
          $BODY$ LANGUAGE plpgsql;
        END IF;
      END $$;

      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_actualizar_total_sesiones'
        ) THEN
          CREATE TRIGGER trigger_actualizar_total_sesiones
          AFTER INSERT ON SesiónEntrenamiento
          FOR EACH ROW
          EXECUTE FUNCTION actualizar_total_sesiones();
        END IF;
      END $$;
    `);
    console.log('Tablas y disparadores creados o verificados.');

    await pool.end();
  } catch (err) {
    console.error('Error inicializando la base de datos:', err);
  } finally {
    await initPool.end();
  }
}

module.exports = initializeDatabase;