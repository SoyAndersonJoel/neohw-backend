export enum AttributeDataType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  SELECT = 'SELECT',
  MULTI_SELECT = 'MULTI_SELECT',
}

export type Attribute = {
  id: string;
  name: string;
  slug: string;
  dataType: AttributeDataType;
  unit: string | null;
  isFilterable: boolean;
  isRequired: boolean;
  options: string[] | null;
  createdAt: Date;
  updatedAt: Date;
};
