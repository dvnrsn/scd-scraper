import * as cheerio from "cheerio";
import * as fs from "fs";

import sqlite3 from "sqlite3";
import { createSource } from "./source";

const db = new sqlite3.Database("food.sqlite");

const data = fs.readFileSync("./all.json", "utf8");

const { ingredients } = JSON.parse(data);

db.serialize(() => {
  db.run("PRAGMA foreign_keys = ON");
  db.run(
    `CREATE TABLE IF NOT EXISTS ingredient (ingredient_id INTEGER PRIMARY KEY, name TEXT NOT NULL);`
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS source (source_id INTEGER PRIMARY KEY, name TEXT NOT NULL, url TEXT);`
  );
  db.run(`
  CREATE TABLE IF NOT EXISTS source_on_ingredient
  (
    id INTEGER PRIMARY KEY,
    legal BOOLEAN CHECK (legal IN (0, 1)), 
    description TEXT,
    url TEXT,
    ingredient_id INTEGER NOT NULL,
    source_id INTEGER NOT NULL,
    FOREIGN KEY (ingredient_id) REFERENCES ingredient(ingredient_id) ON DELETE CASCADE,
    FOREIGN KEY (source_id) REFERENCES source(source_id) ON DELETE CASCADE
  );`);

  const insertIngredient = "INSERT INTO ingredient (name) VALUES (?)";
  const insertSourceOnIngredient =
    'INSERT INTO source_on_ingredient (legal, description, ingredient_id, source_id) VALUES (?, ?, ?, (SELECT source_id FROM source WHERE name = "SCD Recipe"))';

  db.run("DELETE FROM source");
  db.run("DELETE FROM ingredient;");
  db.run("DELETE FROM source_on_ingredient;");

  createSource(
    db,
    "SCD Recipe",
    "https://www.scdrecipe.com/legal-illegal-list/listing/all"
  );

  ingredients.forEach((ingredient) => {
    db.run(
      "INSERT INTO ingredient (name) VALUES (?)",
      [ingredient.name],
      function (err) {
        if (err) {
          console.log(err.message);
        } else {
          const ingredientId = this.lastID;
          // Insert the source information and ingredient_id into the "source_on_ingredient" table
          db.run(
            "INSERT INTO source_on_ingredient (legal, description, url, ingredient_id, source_id) VALUES (?, ?, ?, ?, ?)",
            [
              typeof ingredient.legal != "boolean"
                ? null
                : ingredient.legal
                ? 1
                : 0,
              ingredient.description,
              ingredient.source,
              ingredientId,
              1,
            ],
            function (err) {
              if (err) {
                console.log(err.message);
              } else {
                console.log(`Inserted ingredient "${ingredient.name}"`);
              }
            }
          );
        }
      }
    );
  });
});

// const foodItems = await getText();

// let foodItemsForDb = foodItems.map(() => "(?, ?, ?, ?)").join(", ");
// const query =
//   "INSERT INTO food (name, legal, description, source) VALUES " +
//   foodItemsForDb;

// console.log(
//   foodItemsForDb,
//   foodItems.map((item) => Object.values(item))
// );

// db.serialize(() => {
//   db.run("BEGIN TRANSACTION");
//   db.run(query, foodItems.map((item) => Object.values(item)).flat(), (err) => {
//     console.log(err);
//   });
//   db.run("END TRANSACTION");
// });
