import { Attribute, AttributeDataType } from '../entities/attribute.entity';

export interface CreateAttributeParams {
  name: string;
  slug: string;
  dataType: AttributeDataType;
  unit?: string | null;
  isFilterable?: boolean;
  isRequired?: boolean;
  options?: string[] | null;
}

export interface UpdateAttributeParams {
  name?: string;
  slug?: string;
  dataType?: AttributeDataType;
  unit?: string | null;
  isFilterable?: boolean;
  isRequired?: boolean;
  options?: string[] | null;
}

export interface AttributeRepository {
  findAll(): Promise<Attribute[]>;
  findById(id: string): Promise<Attribute | null>;
  findBySlug(slug: string): Promise<Attribute | null>;
  findByCategoryId(categoryId: string): Promise<Attribute[]>;
  create(data: CreateAttributeParams): Promise<Attribute>;
  update(id: string, data: UpdateAttributeParams): Promise<Attribute>;
  delete(id: string): Promise<void>;
  assignToCategory(categoryId: string, attributeId: string): Promise<void>;
  removeFromCategory(categoryId: string, attributeId: string): Promise<void>;
}
