const app = require('./app.js');
const database = require('./database/database.js');

const DockerPort = process.env.PORT;
const port = 4000;

database.sync();

app.listen(DockerPort, () => {
  console.log(`ContaComigo-api Server running at http://localhost:${port}/`);
});
