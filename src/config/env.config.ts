function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const envConfig = {
  baseUrl: requireEnv('BASE_URL', 'https://www.saucedemo.com'),

  users: {
    standard: {
      username: requireEnv('STANDARD_USER', 'standard_user'),
      password: requireEnv('VALID_PASSWORD', 'secret_sauce'),
    },
    lockedOut: {
      username: requireEnv('LOCKED_OUT_USER', 'locked_out_user'),
      password: requireEnv('VALID_PASSWORD', 'secret_sauce'),
    },
    problem: {
      username: requireEnv('PROBLEM_USER', 'problem_user'),
      password: requireEnv('VALID_PASSWORD', 'secret_sauce'),
    },
    performanceGlitch: {
      username: requireEnv('PERFORMANCE_GLITCH_USER', 'performance_glitch_user'),
      password: requireEnv('VALID_PASSWORD', 'secret_sauce'),
    },
    error: {
      username: requireEnv('ERROR_USER', 'error_user'),
      password: requireEnv('VALID_PASSWORD', 'secret_sauce'),
    },
    visual: {
      username: requireEnv('VISUAL_USER', 'visual_user'),
      password: requireEnv('VALID_PASSWORD', 'secret_sauce'),
    },
  },

  timeouts: {
    action: Number(process.env.ACTION_TIMEOUT) || 10_000,
    test: Number(process.env.TEST_TIMEOUT) || 60_000,
    navigation: Number(process.env.NAVIGATION_TIMEOUT) || 30_000,
    glitchUser: Number(process.env.GLITCH_USER_TIMEOUT) || 15_000,
  },

  isCI: process.env.CI === 'true' || process.env.NODE_ENV === 'ci',
  headless: process.env.HEADLESS !== 'false',
} as const;
