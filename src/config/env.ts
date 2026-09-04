import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';

/**
 * Carga las variables de entorno desde `.env` una sola vez, al arrancar.
 * Es el único archivo del proyecto que lee `process.env` directamente —
 * el resto del código pide sus valores aquí, ya tipados.
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
  /** URL base de la app web bajo prueba. */
  readonly baseUrl: string;
  /** URL base de la API bajo prueba. */
  readonly apiUrl: string;
  /** Credenciales del usuario de demo. */
  readonly user: { readonly username: string; readonly password: string };
}

export const env: Env = {
  baseUrl: optional('BASE_URL', 'https://www.saucedemo.com'),
  apiUrl: optional('API_URL', 'https://jsonplaceholder.typicode.com'),
  user: {
    username: optional('USER_NAME', 'standard_user'),
    password: optional('USER_PASSWORD', 'secret_sauce'),
  },
};
