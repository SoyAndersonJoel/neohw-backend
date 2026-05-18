export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  brand: string | null;
  model: string | null;
  sku: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  categoryId: string;
  sellerId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductWithDetails = Product & {
  category: { id: string; name: string; slug: string };
  attributes: { name: string; value: string; unit: string | null }[];
};
