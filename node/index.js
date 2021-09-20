const express = require('express');
const app = express();
app.use(express.json())

const port = 3000;

const config = {
    host: 'db',
    user: 'root',
    password: 'root',
    database: 'nodedb',
};

const mysql = require('mysql');

const createUserTable = `
    CREATE TABLE IF NOT EXISTS people (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL
    )
`;

const connection = mysql.createConnection(config);
connection.query(createUserTable);
const insert = (name) =>`INSERT INTO people(name) values('${name}')`;
connection.end();

app.get('/', async (request, response) => {
    const connection = await mysql.createConnection(config);
    connection.query(`SELECT name FROM people`, (error, results) => {
        const names = results.map(result => `<li>${result.name}</li>`).join('');
        response.send(`
            <h1>Full Cycle Rocks!</h1>
            <form>
                <input name="name" />
                <input type="submit" value="adicionar" />
            </form>
            <ul>${names}</ul>
            <script>
                document.addEventListener("submit", (e) => {
                    e.preventDefault();

                    fetch('/name', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ name: e.target[0].value })
                    })
                    .then((response) => {
                        response.ok 
                            ? document.location.reload(true) 
                            : alert('Adicione um nome antes de enviar.');
                    })
                });
            </script>
        `);
    });
    connection.end();
});

app.post('/name', (request, response) => {
    if(request.body && request.body.name) {
        const connection = mysql.createConnection(config);
        connection.query(insert(request.body.name));
        connection.end();
        return response.sendStatus(200);
    }
    return response.sendStatus(400);
});

app.listen(port, () => {
    console.log(`Running on port ${port}`);
})