export type ProductAttributeValue = {
  id: string;
  productId: string;
  attributeId: string;
  value: string;
};

export type ProductAttributeWithName = ProductAttributeValue & {
  attributeName: string;
  attributeSlug: string;
  unit: string | null;
};
