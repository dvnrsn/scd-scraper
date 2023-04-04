import * as cheerio from "cheerio";

import sqlite3 from "sqlite3";

const db = new sqlite3.Database("food.sqlite");

db.run("PRAGMA foreign_keys = ON");

db.serialize(() => {
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
    ingredient_id INTEGER NOT NULL,
    source_id INTEGER NOT NULL,
    FOREIGN KEY (ingredient_id) REFERENCES ingredient(ingredient_id) ON DELETE CASCADE,
    FOREIGN KEY (source_id) REFERENCES source(source_id) ON DELETE CASCADE
  );`);
});

const fetchWithLetter = async (letter) => {
  const source = `https://www.scdrecipe.com/legal-illegal-list/view-all-alpha/all/${letter}`;
  const a = await fetch(source);
  const b = await a.text();
  return b;
};

const getText = async () => {
  const text = await fetchWithLetter("A");
  const $ = cheerio.load(text);

  type FoodItems = {
    name: string;
    legal: boolean | "*";
    description: string;
    source: string;
  };
  const foodItems: FoodItems[] = [];

  $("table tr").each((_, el) => {
    const display = $(el).css("display");
    if (display == "none") return;

    const name = $(el)
      .children()
      .eq(0)
      .text()
      .replace(/\(\d*\)/, "")
      .trim();
    const legalString = $(el).children().eq(1).text().trim();
    const description = $(el).children().eq(2).text().trim();

    const legal =
      legalString == "LEGAL" ? true : legalString == "ILLEGAL" ? false : "*";
    foodItems.push({
      name,
      legal,
      description,
      source: `https://www.scdrecipe.com/legal-illegal-list/view-all-alpha/all/A`,
    });
  });
  return foodItems;
};

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

db.close();
