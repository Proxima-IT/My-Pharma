const normalizeSearchText = value => {
  if (value === null || value === undefined) return '';

  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s.+-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const hasTokenPrefixMatch = (value, term) => {
  if (!value || !term) return false;
  return value.split(' ').some(token => token.startsWith(term));
};

const buildSearchDocument = product => ({
  name: normalizeSearchText(product?.name),
  ingredient: normalizeSearchText(product?.ingredient_name),
  brand: normalizeSearchText(product?.brand_name),
  category: normalizeSearchText(product?.category_name),
  dosage: normalizeSearchText(product?.dosage),
  unit: normalizeSearchText(product?.unit_name),
  description: normalizeSearchText(
    product?.short_description ||
      product?.description ||
      product?.indication ||
      product?.product_description,
  ),
});

const scoreTermAgainstDocument = (term, doc) => {
  let score = 0;

  if (doc.name === term) score = Math.max(score, 260);
  if (doc.name.startsWith(term)) score = Math.max(score, 220);
  if (hasTokenPrefixMatch(doc.name, term)) score = Math.max(score, 190);
  if (doc.name.includes(term)) score = Math.max(score, 150);

  if (doc.ingredient === term) score = Math.max(score, 230);
  if (doc.ingredient.startsWith(term)) score = Math.max(score, 200);
  if (hasTokenPrefixMatch(doc.ingredient, term)) score = Math.max(score, 175);
  if (doc.ingredient.includes(term)) score = Math.max(score, 140);

  if (doc.brand === term) score = Math.max(score, 140);
  if (doc.brand.startsWith(term)) score = Math.max(score, 120);
  if (hasTokenPrefixMatch(doc.brand, term)) score = Math.max(score, 100);
  if (doc.brand.includes(term)) score = Math.max(score, 85);

  if (doc.category === term) score = Math.max(score, 110);
  if (doc.category.startsWith(term)) score = Math.max(score, 95);
  if (hasTokenPrefixMatch(doc.category, term)) score = Math.max(score, 80);
  if (doc.category.includes(term)) score = Math.max(score, 65);

  if (doc.dosage.startsWith(term) || doc.unit.startsWith(term)) {
    score = Math.max(score, 55);
  }
  if (doc.dosage.includes(term) || doc.unit.includes(term)) {
    score = Math.max(score, 40);
  }

  if (doc.description.includes(term)) score = Math.max(score, 25);

  return score;
};

export const getProductSearchScore = (product, query) => {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return -1;

  const terms = normalizedQuery.split(' ').filter(Boolean);
  if (terms.length === 0) return -1;

  const doc = buildSearchDocument(product);
  let totalScore = 0;

  for (const term of terms) {
    const termScore = scoreTermAgainstDocument(term, doc);
    if (termScore <= 0) return -1;
    totalScore += termScore;
  }

  if (doc.name.startsWith(normalizedQuery)) totalScore += 160;
  else if (doc.name.includes(normalizedQuery)) totalScore += 110;

  if (doc.ingredient.startsWith(normalizedQuery)) totalScore += 130;
  else if (doc.ingredient.includes(normalizedQuery)) totalScore += 90;

  if (doc.brand.startsWith(normalizedQuery)) totalScore += 45;
  if (doc.category.startsWith(normalizedQuery)) totalScore += 35;

  return totalScore;
};

export const searchProducts = (products = [], query, options = {}) => {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [];

  const rankedProducts = products
    .map(product => ({
      product,
      score: getProductSearchScore(product, normalizedQuery),
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;

      const aName = normalizeSearchText(a.product?.name);
      const bName = normalizeSearchText(b.product?.name);

      if (aName.length !== bName.length) return aName.length - bName.length;
      return aName.localeCompare(bName);
    })
    .map(item => item.product);

  if (typeof options.limit === 'number') {
    return rankedProducts.slice(0, options.limit);
  }

  return rankedProducts;
};

export { normalizeSearchText };
