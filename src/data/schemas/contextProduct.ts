export type ContextProductVariant =
  | 'short'
  | 'long'
  | 'visual'
  | 'voice'
  | 'editorial'
  | 'page-safe'
  | 'production-safe'
  | 'continuity-safe';

export type ContextProductTargetRef = {
  type:
    | 'Character'
    | 'Scene'
    | 'Beat'
    | 'Relationship'
    | 'Location'
    | 'Rule'
    | 'PagePlan'
    | (string & {});
  id: string;
  revision?: string;
};

export type ContextProductSourceRef = {
  sourceType: string;
  sourceId: string;
  sourceRevision?: string;
  span?: {
    start?: number;
    end?: number;
    path?: string;
  };
  checksum?: string;
};

export type ContextProductLineage = {
  generator: string;
  generatorVersion: string;
  schemaVersion: string;
  upstreamProductIds: string[];
  sourceSnapshotHash: string;
};

export type ContextProductInvalidationRule = {
  rule: 'SOURCE_REVISION_CHANGED' | 'TARGET_REVISION_CHANGED' | 'UPSTREAM_PRODUCT_CHANGED' | 'SCHEMA_INCOMPATIBLE' | 'PACKAGE_INCOMPATIBLE' | (string & {});
  description: string;
};

export type ContextProductPackageCompatibility = {
  packageName: string;
  acceptedSchemaRange: string;
  notes?: string;
};

export type ContextProduct = {
  id: string;
  projectId: string;
  sourceRefs: ContextProductSourceRef[];
  targetRef: ContextProductTargetRef;
  variant: ContextProductVariant;
  content: string;
  generatedAt: string;
  generatedFrom: ContextProductLineage;
  stale: boolean;
  version: number;
  invalidationRules: ContextProductInvalidationRule[];
  packageCompatibility?: ContextProductPackageCompatibility[];
};
