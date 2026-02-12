import Joi from 'joi';


export const requestResetEmailSchema = Joi.object({
  email: Joi.string().email().required(),
});


export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(6).required(),
});
