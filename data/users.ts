/**
 * Usuarios públicos de SauceDemo.
 * La contraseña se lee de .env (buena práctica, aunque sea pública).
 */
const password = process.env.SAUCE_PASSWORD ?? 'secret_sauce';

export interface User {
  username: string;
  password: string;
}

export const users = {
  standard: { username: 'standard_user', password },
  problem: { username: 'problem_user', password },
  performanceGlitch: { username: 'performance_glitch_user', password },
  lockedOut: { username: 'locked_out_user', password },
} satisfies Record<string, User>;
