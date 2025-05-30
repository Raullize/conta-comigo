const app = require('./app.js');
const database = require('./database/database.js');

const PORT = process.env.PORT || 3033;

database.sync({ alter: true });

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
