const sql = require('mssql');

const dbConfig = {
    user: 'your_db_username',
    password: 'your_password',
    server: 'yourserver.database.windows.net',
    database: 'sTrackerDB',
    options: {
        encrypt: true,  // Must be true for Azure SQL
        enableArithAbort: true
    }
};

async function testDbConnection() {
    try {
        await sql.connect(dbConfig);
        console.log('Connected to Azure SQL Database successfully!');
    } catch (err) {
        console.error('Error connecting to database:', err);
    }
}

testDbConnection();
