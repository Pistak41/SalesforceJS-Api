import 'dotenv/config'
import express, { json } from 'express';
import jsforce from 'jsforce';
import cors from 'cors'

const app = express();
app.use([cors(), json()]);

const { SF_USERNAME, SF_PASSWORD, SF_ACCESS_TOKEN } = process.env;

console.log({
    SF_USERNAME, SF_PASSWORD, SF_ACCESS_TOKEN
});

const con = new jsforce.Connection({
    loginUrl: 'https://login.salesforce.com',
    accessToken: SF_ACCESS_TOKEN,
})

con.login(SF_USERNAME, SF_PASSWORD + SF_ACCESS_TOKEN, (error, userInfo) => {
    if (!error) {
        console.log(userInfo);
    } else {
        console.error('ERROR', error);
    }
})

app.get('/products', async (_, res) => {

    const productResponse = await con.query('SELECT Id, Name, ProductCode FROM Product2 LIMIT 200');

    if (productResponse.done) {

        res.json(productResponse.records);

    } else {
        console.error(productResponse);
    }

})

app.get('/product/:id', async ({ params: { id } }, res) => {

    try {
        const productResponse = await con.sobject('Product2').retrieve(id);

        res.json(productResponse);
    } catch (error) {
        res.status(400).json({
            Error: error.message
        })
    }

    // if (productResponse.done) {
    //     res.json(productResponse.records[0]);
    // } else {
    //     console.error(productResponse);
    // }
})

app.delete('/product/:id', async ({ params: { id } }, res) => {
    const deleteResponse = await con.sobject('Product2').destroy(id);

    if (deleteResponse.success) {
        res.status(202).end();
    }
})

app.post('/product', async ({ body }, res) => {
    try {
        const insertResponse = await con.sobject('Product2').create(body)

        res.json(insertResponse);

    } catch (error) {
        res.status(400).json({
            Error: error.message
        })
    }
})

app.listen(3001, () => {
    console.log('Inició!');
});