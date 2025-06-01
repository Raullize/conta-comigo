import app from "./app.js";

const DockerPort = 3005;
const port = 4005;
app.listen(DockerPort, () => {
  console.log(`vitor-api server running at http://localhost:${port}/`);
});
