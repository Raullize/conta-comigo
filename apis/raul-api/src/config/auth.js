export default {
  secret:
    process.env.JWT_SECRET ||
    (() => {
      throw new Error(
        'JWT_SECRET não definido no arquivo .env. Esta variável é necessária para segurança da aplicação.'
      );
    })(),
  expiresIn: process.env.JWT_EXPIRATION || '7d',
};
