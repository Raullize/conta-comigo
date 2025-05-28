const app = require('./app.js');
const database = require('./database/database.js');

const port = 3033;

database.sync({ alter: true });

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running at http://localhost:${port}/`);
});
