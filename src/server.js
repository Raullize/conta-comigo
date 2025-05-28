// 1. Importação com require()
const app = require('./app.js');
const database = require('./database/database.js');

const port = 3033;

// Sincroniza o banco de dados
database.sync({ alter: true });

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running at http://localhost:${port}/`);
});
