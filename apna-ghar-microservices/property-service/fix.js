const mysql = require('mysql2/promise');
async function fixSchema() {
    const conn = await mysql.createConnection({host:'localhost', user:'root', password:'23126', database:'apna_ghar_db'});
    await conn.query("ALTER TABLE properties MODIFY COLUMN property_type ENUM('apartment', 'flat', 'villa', 'plot', 'independent_house', 'commercial') DEFAULT 'flat'");
    console.log("Schema updated!");
    process.exit(0);
}
fixSchema().catch(console.error);
