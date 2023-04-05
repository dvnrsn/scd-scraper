import * as cheerio from "cheerio";

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

// const all = {};
// //prettier-ignore
// [
//   "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
// ].forEach(async (letter) => {
//   const object = await getText(letter);
//   all[letter] = object;
//   fs.writeFileSync("all.json", JSON.stringify(all));
// });
