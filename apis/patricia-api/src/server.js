import app from './app.js';

const DockerPort = 3004;
const port = 4004;

app.listen(DockerPort, () => {
    console.log(`patricia-api server running at http://localhost:${port}/`);
});