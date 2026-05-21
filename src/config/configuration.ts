export default () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined in environment variables');
  }

  const jwtAccessSecret = process.env.JWT_ACCESS_SECRET;
  if (!jwtAccessSecret) {
    throw new Error(
      'JWT_ACCESS_SECRET is not defined in environment variables',
    );
  }

  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
  if (!jwtRefreshSecret) {
    throw new Error(
      'JWT_REFRESH_SECRET is not defined in environment variables',
    );
  }

  const groqApiKey = process.env.GROQ_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!groqApiKey && !geminiApiKey) {
    throw new Error('No AI API keys are defined in environment variables');
  }

  return {
    port: parseInt(process.env.PORT || '3000', 10),
    database: {
      url: databaseUrl,
    },
    ai: {
      groqApiKey,
      geminiApiKey,
    },
    auth: {
      jwt: {
        accessSecret: jwtAccessSecret,
        refreshSecret: jwtRefreshSecret,
        accessTtlSeconds: parseInt(process.env.JWT_ACCESS_TTL || '900', 10),
        refreshTtlSeconds: parseInt(
          process.env.JWT_REFRESH_TTL || '1209600',
          10,
        ),
      },
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    },
  };
};
