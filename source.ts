import sqlite3 from "sqlite3";

export const createSource = (
  db: sqlite3.Database,
  name: string,
  url: string
) => {
  db.run(
    "INSERT INTO source (name, url) VALUES (?, ?)",
    [name, url],
    function (err) {
      if (err) {
        return console.log(err.message);
      }
      console.log(`A row has been inserted with rowid ${this.lastID}`);
    }
  );
};
