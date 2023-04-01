import * as cheerio from "cheerio";

// const $ = cheerio.load('<ul id="fruits">...</ul>');

// console.log($.html());

// const favoriteFruits: string[] = ["apple", "strawberry", "orange"];

// function addFruit(fruit: string) {
//   favoriteFruits.push(fruit);
// }

const a = await fetch(
  "https://www.scdrecipe.com/legal-illegal-list/view-all-alpha/all/A"
);
const b = await a.text();

let $ = cheerio.load(b);

$("");

const getText = () => {
  const $ = cheerio.load(text);

  type FoodItems = {
    name: string;
    legal: boolean | "*";
    description: string;
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
    foodItems.push({ name, legal, description });
  });
  return foodItems;
};
