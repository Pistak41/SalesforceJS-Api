import e, { Router } from 'express'
import jsforce from '../services/jsforce.js'

const router = Router();

router.route('/:sobject')
    .get(async ({ params: { sobject } }, res) => {
        try {
            const records = await jsforce.query(`SELECT Id, Name, CreatedDate FROM ${sobject} LIMIT 200`);

            if (records.done) {

                res.json(records.records);

            } else {
                console.error(records);
            }
        } catch (error) {
            console.error(error);

            res.status(400).json({
                code: error.name,
                message: error.name === 'INVALID_TYPE' ? `El objeto '${sobject}' es invalido` : error.message
            })
        }
    })
    .post(async ({ body, params: { sobject } }, res) => {
        try {
            const insertResponse = await jsforce.sobject(sobject).create(body)

            res.json(insertResponse);

        } catch (error) {
            res.status(400).json({
                Error: error.message
            })
        }
    })


router.route('/:sobject/:id')
    .get(async ({ params: { sobject, id } }, res) => {
        try {
            const record = await jsforce.sobject(sobject).retrieve(id);

            res.json(record);
        } catch (error) {
            res.status(400).json({
                Error: error.message
            })
        }
    })
    .delete(async ({ params: { sobject, id } }, res) => {
        const deletedRecord = await jsforce.sobject(sobject).destroy(id);

        if (deletedRecord.success) {
            res.status(202).end();
        }
    })

export default router;