// Small functions used by several pages

// Formats a price or a value with 2 decimals: 1599.25 => "1,599.25"
export function formatMoney(value) {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Writes "1 product" or "2 products". Give the plural when it is not the word + s ("categories")
export function plural(count, word, pluralWord = word + 's') {
  return `${count} ${count === 1 ? word : pluralWord}`
}

// Returns the status of the stock of a product, with the tone of its badge
export function stockStatus(product) {
  if (product.quantity === 0) return { tone: 'danger', label: 'Out of stock' }
  if (product.quantity <= product.lowStockThreshold) return { tone: 'warning', label: 'Low stock' }
  return { tone: 'success', label: 'In stock' }
}
