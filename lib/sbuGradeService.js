import { getGradeNumber } from "./utils";

export function filterSbuGradePrices(prices, { searchText, sbu, grade }) {
  const query = searchText.toLowerCase();
  return prices
    .filter(
      (price) =>
        (!sbu || price.SBU === sbu) &&
        (!grade || price.Grade === grade) &&
        (!query ||
          price.SBU.toLowerCase().includes(query) ||
          price.Grade.toLowerCase().includes(query)),
    )
    .sort(
      (priceA, priceB) =>
        getGradeNumber(priceA.Grade) - getGradeNumber(priceB.Grade) ||
        priceA.Grade.localeCompare(priceB.Grade) ||
        priceA.SBU.localeCompare(priceB.SBU),
    );
}
