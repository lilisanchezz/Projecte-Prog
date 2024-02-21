const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'dbprog';

/**
 * @returns {Promise<import('mongodb').Collection>}
 */
function getCollection() {
  return new Promise(async (resolve, reject) => {
    try{
      const client = await MongoClient.connect(url)

      console.log('Conexión exitosa a la base de datos');
      const db = client.db(dbName);
      const collection = db.collection('components');
        
      
      resolve(collection);
    } catch(e) {
      console.log('kboom');
      reject(e)
    }
      
  })
}

module.exports = getCollection
