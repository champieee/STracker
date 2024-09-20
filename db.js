const sql = require('mssql');


const config = {
    user: 'str',      
    password: 'Hone9!!!',         
    server: 'stracker-server.database.windows.net', 
    database: 'sTrackerDB',            
    options: {
        encrypt: true,                
        enableArithAbort: true        
    }
};


sql.connect(config, (err) => {
    if (err) {
        console.error('Error connecting to Azure SQL Database:', err);
    } else {
        console.log('Connected to Azure SQL Database');
    }
});

module.exports = sql;
