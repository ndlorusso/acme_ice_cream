const pg = require('pg');
const express = require('express');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_ice_cream_db');
const app = express();

app.use(express.json());
app.use(require('morgan')('dev'));

//READ ALL FLAVORS
app.get('/api/flavors', async (req, res, next) => {
    try {
        const SQL = ` SELECT * FROM flavors`;
        const response = await client.query(SQL);
        res.send(response.rows);
    } catch (error) {
        next(error);
    }
});

//CREATE
app.post('/api/flavors', async(req, res, next) => {
    try {
        const SQL = /* sql */
         `
        INSERT INTO flavors(txt, is_favorite)
        VALUES($1, $2)
        RETURNING *
        `;
        const response = await client.query(SQL, [req.body.txt, req.body.is_favorite]);
        res.send(response.rows[0]);
    } catch (error) {
        next(error);
    }
});


const init = async () => {
    await client.connect();
    console.log('connected to database');
    let SQL = /* sql */
    `
    DROP TABLE IF EXISTS flavors;
    CREATE TABLE flavors (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        txt VARCHAR(255),
        is_favorite BOOLEAN DEFAULT FALSE
    )
    `;
    await client.query(SQL);
    console.log('table created');

    SQL = /* sql */ 
    `
    INSERT INTO flavors(txt, is_favorite) VALUES('mint_chip', true);
    INSERT INTO flavors(txt, is_favorite) VALUES('vanilla', false);
    INSERT INTO flavors(txt, is_favorite) VALUES('chocolate', false);
    INSERT INTO flavors(txt, is_favorite) VALUES('strawberry', false);
    `;
    await client.query(SQL);
    console.log('data seeded');



    const port = process.env.PORT || 3000
    app.listen(port, () => console.log(`listening on port ${port}`));
};
init();