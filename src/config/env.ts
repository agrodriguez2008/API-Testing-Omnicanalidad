import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';

/**
 * Carga las variables de entorno desde `.env` una sola vez, al arrancar.
 * Es el unico archivo del proyecto que lee `process.env` directamente.
 */
function loadEnv(): void {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}
loadEnv();

function optional(key: string, fallback: string): string {
  return process.env[key]?.trim() || fallback;
}

export interface Env {
  /** URL base de la API bajo prueba. */
  readonly apiUrl: string;
  /** Nombre del ambiente contra el que corren las pruebas (ej. "Pre produccion", "QA"). Solo para mostrar en el reporte. */
  readonly ambiente: string;
  /** Usuario de prueba de ESTE ambiente. No vive en el .feature ni en el codigo a proposito. */
  readonly usuarioPrueba: string;
  /** Clave del usuario de prueba de ESTE ambiente. */
  readonly clavePrueba: string;
}

export const env: Env = {
  apiUrl: optional('API_URL', 'https://dummyjson.com'),
  ambiente: optional('AMBIENTE', 'Pre produccion'),
  usuarioPrueba: optional('USUARIO_PRUEBA', 'emilys'),
  clavePrueba: optional('CLAVE_PRUEBA', 'emilyspass'),
};
