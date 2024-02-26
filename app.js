const { ObjectId } = require('mongodb');

const components = require('./components');

/**
 * 
 * @param {import('mongodb').Collection} db 
 * @returns 
 */
module.exports = async db => {
    const express = require('express');
    const path = require('node:path');
    const app = express();
    
    const collection = db;

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    
    app.use(express.static(path.resolve(__dirname, 'public')));
    
    app.route('/api/placas')
        .get(async (req, res) => {//ruta
            const components = (await collection.find({}).toArray())
                .map(p => {
                    return {
                        id: p._id,
                        name: p.name,
                        components: p.components.map(c => JSON.parse(c))
                    }
                });
        
            res.json(components);
        })
        .post(async (req, res) => {
            const name = req.body.name?.toLowerCase() ?? 'unnamed';
            const file = req.body.file;

            try {
                await components.createPlaca(db, name, file);
                res.status(204).end();
            } catch(e) {
                res.status(400).end();
            }
        })

    app.route('/api/placas/:id')
        .get(async (req, res) => {
            const data = await components.getComponentById(db, req.params.id);
            if(!data)
                return res.status(404).end();
            
            res.json(data)
        })
        .delete(async (req, res) => {
            const data = await db.deleteOne({_id: new ObjectId(req.params.id)});
            if(data.deletedCount === 0)
                return res.status(404).end();

            res.status(204).end();
        })
    
    app.get('/api/placas/:id/:format', async (req, res) => {
        const data = await components.getComponentById(db, req.params.id);
        if(!data)
            return res.status(404).end();

        switch(req.params.format) {
            case 'txt':
                res.send(components.toTxt(data.components));
                break;
            case 'asq':
                res.send(components.toASQ(data.components));
                break;
            case  'csv':
                res.send(components.toCSV(data.components));
                break;
        }
    })

    return app;
}
