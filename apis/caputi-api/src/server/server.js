import app from '../app.js';
import database from '../database/db.js';

const Dockerport = 3001;
const port = 4001;

database.sync({alter:true});

app.listen(Dockerport, () => {
    // eslint-disable-next-line
    console.log(`Server running at http://localhost:${port}/`);
});
