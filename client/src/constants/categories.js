export const ITEM_CATEGORIES = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'books', label: 'Books' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'documents', label: 'Documents' },
  { value: 'other', label: 'Other' },
];

export const CATEGORY_LABELS = Object.fromEntries(
  ITEM_CATEGORIES.map((c) => [c.value, c.label])
);
