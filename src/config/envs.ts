import { config as dotenvConfig } from "dotenv";
import * as Joi from "joi";

dotenvConfig({ path: ".env" });

interface EnvVars {
  PORT: number;
  DB_URL: string;
  MONGO_DB: string;
  MONGO_USER: string;
  MONGO_PASSWORD: string;
  JWT_SECRET: string;
  RABBITMQ_DEFAULT_USER: string;
  RABBITMQ_DEFAULT_PASS: string;
  RABBITMQ_HOST: string;
  RABBITMQ_PORT: string;
}

const envVarsSchema = Joi.object({
  PORT: Joi.number().required(),
  DB_URL: Joi.string().required(),
  MONGO_DB: Joi.string().required(),
  MONGO_USER: Joi.string().required(),
  MONGO_PASSWORD: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  RABBITMQ_DEFAULT_USER: Joi.string().required(),
  RABBITMQ_DEFAULT_PASS: Joi.string().required(),
  RABBITMQ_HOST: Joi.string().required(),
  RABBITMQ_PORT: Joi.string().required(),
}).unknown(true);

const { error, value: envVars } = envVarsSchema.validate(process.env, {
  stripUnknown: true,
});

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const envs: EnvVars = {
  PORT: envVars.PORT,
  DB_URL: envVars.DB_URL,
  MONGO_DB: envVars.MONGO_DB,
  MONGO_USER: envVars.MONGO_USER,
  MONGO_PASSWORD: envVars.MONGO_PASSWORD,
  JWT_SECRET: envVars.JWT_SECRET,
  RABBITMQ_DEFAULT_USER: process.env.RABBITMQ_DEFAULT_USER,
  RABBITMQ_DEFAULT_PASS: process.env.RABBITMQ_DEFAULT_PASS,
  RABBITMQ_HOST: process.env.RABBITMQ_HOST,
  RABBITMQ_PORT: process.env.RABBITMQ_PORT,
};
