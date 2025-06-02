import app from './app.js';

const DockerPort = 3006;
const port= 4006;
app.listen(DockerPort, () => {
  console.log(`raul-api server running at http://localhost:${port}/`);
});
