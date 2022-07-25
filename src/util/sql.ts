import * as MySQL from "mysql";

const host = process.env.DATABASE_URL;
const user = process.env.DATABASE_USERNAME;
const password = process.env.DATABASE_PASSWORD;
const database = process.env.DATABASE_NAME;

if (!host || !user || !password || !database) {
  throw new Error("Missing database credentials");
}

export const connection = MySQL.createConnection({
  host,
  user,
  password,
  database,
});

connection.connect((err) => {
  if (err) throw err;

  console.log("Connected!");
});
