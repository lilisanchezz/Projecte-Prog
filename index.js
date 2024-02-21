const getCollection = require("./db");
const getApp = require('./app');

(async () => {

    const db = await getCollection();
    const app = await getApp(db);

    const PORT = 3000;
    app.listen(PORT, () => console.log('Servidor http corriendo en el puerto', PORT));
    
})();