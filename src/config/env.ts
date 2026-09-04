import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';

/**
 * Carga las variables de entorno desde `.env` una sola vez, al arrancar.
 * Es el único archivo del proyecto que lee `process.env` directamente.
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
}

export const env: Env = {
  apiUrl: optional('API_URL', 'https://dummyjson.com'),
};
