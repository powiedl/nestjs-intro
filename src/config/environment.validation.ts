import * as Joi from 'joi';

export default Joi.object({
  NODE_ENV: Joi.string()
    .default('development')
    .valid('production', 'development', 'test', 'staging'),
  DB_PORT: Joi.number().port().default(5432), // .port() prüft, ob die Zahl ein valides Port ist
  DB_HOST: Joi.string().default('localhost'),
  DB_NAME: Joi.string().default('nestjs-blog'),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  PROFILE_API_KEY: Joi.string().required(),
});
