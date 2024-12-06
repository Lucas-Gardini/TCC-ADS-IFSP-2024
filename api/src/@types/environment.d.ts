
export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string,
      APP_NAME: string,
      APP_DESCRIPTION: string,
      APP_SECRET: string,
      DEFAULT_ENTERPRISE: string,
      DEFAULT_USER: string,
      APP_HOST: string,
      APP_PORT: string,
      FRONTEND_URL: string,
      CORS_WHITELIST: string,
      CACHE_RESET_ID: string,
      MONGO_USER: string,
      MONGO_PASS: string,
      MONGO_HOST: string,
      MONGO_PORT: string,
      MONGO_DATA: string,
      REDIS_HOST: string,
      REDIS_PORT: string,
      REDIS_PASSWORD: string,
      REDIS_PREFIX: string,
      MAIL_HOST: string,
      MAIL_PORT: string,
      MAIL_SECURE: string,
      MAIL_USER: string,
      MAIL_PASS: string,
      GOOGLE_PASS: string,
      OPENAI_API_KEY: string
	}
  }
}

