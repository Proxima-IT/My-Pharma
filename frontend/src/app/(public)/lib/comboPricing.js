const hasValue = value => value !== null && value !== undefined && value !== '';

const toAmount = value => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const getComboProductsPriceSum = combo =>
  (combo?.products || []).reduce(
    (sum, product) => sum + toAmount(product?.price),
    0,
  );

export const getComboProductsOriginalPriceSum = combo =>
  (combo?.products || []).reduce(
    (sum, product) =>
      sum +
      toAmount(
        hasValue(product?.original_price)
          ? product.original_price
          : product?.price,
      ),
    0,
  );

export const getComboEffectivePrice = combo => {
  if (hasValue(combo?.discount_price)) return toAmount(combo.discount_price);
  if (hasValue(combo?.custom_price)) return toAmount(combo.custom_price);

  const productsTotal = getComboProductsPriceSum(combo);
  if (productsTotal > 0) return productsTotal;

  return toAmount(combo?.price);
};

export const getComboDisplayPrice = combo => {
  if (hasValue(combo?.price)) return toAmount(combo.price);
  return getComboEffectivePrice(combo);
};

export const getComboDisplayOriginalPrice = combo => {
  if (hasValue(combo?.original_price)) return toAmount(combo.original_price);

  const originalProductsTotal = getComboProductsOriginalPriceSum(combo);
  return originalProductsTotal > 0 ? originalProductsTotal : null;
};

export const getComboHasDiscount = combo => {
  const originalPrice = getComboDisplayOriginalPrice(combo);
  return originalPrice !== null && originalPrice > getComboDisplayPrice(combo);
};

export const getComboDiscountPercentage = combo => {
  const originalPrice = getComboDisplayOriginalPrice(combo);
  const displayPrice = getComboDisplayPrice(combo);

  if (!originalPrice || originalPrice <= displayPrice) return 0;

  return Math.round(((originalPrice - displayPrice) / originalPrice) * 100);
};
