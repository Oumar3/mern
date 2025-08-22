export interface DecoupageEntity {
  _id: string;
  code: string;
  name: string;
  description?: string;
  chefLieu?: string;
  province?: string;
}

export interface Programme {
  _id: string;
  code: string;
  name: string;
  objectif: string;
}

export interface Source {
  _id: string;
  name: string;
  description: string;
  url?: string;
}

export interface UniteDeMesure {
  _id: string;
  code: string;
  name: string;
}

export interface FocalPoint {
  name?: string;
  email?: string;
  phone?: string;
}

export interface MetaData {
  _id?: string;
  code: string;
  name: string;
  internationalDefinition?: string;
  nationalDefinition?: string;
  thematicArea?: Programme | string;
  goal?: string;
  mainDataSource?: string | Source;
  primaryDataSource?: string | Source;
  dataCollectionMethod?: string;
  calculationMethod?: string;
  measurementUnit?: string | UniteDeMesure;
  coveredPopulation?: string;
  geographicCoverage?: string;
  disaggregationLevel?: string[];
  publicationPeriodicity?: string;
  responsibleProductionStructure?: string;
  implementationStructure?: string;
  focalPoints?: FocalPoint[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IndicatorGeoLocation {
  type?: 'Global' | 'Province' | 'Departement' | 'Sous-prefecture' | 'Canton' | 'Commune' | 'Village';
  referenceId?: string;
}

export type AgeRange = '0-4' | '5-9' | '10-14' | '15-19' | '20-24' | '25-29' | '30-34' | 
                      '35-39' | '40-44' | '45-49' | '50-54' | '55-59' | '60-64' | '65+' |
                      '0-14' | '15-49' | '15-64' | '18+' | '25-64' | 'Tous les âges';

export type Gender = 'Masculin' | 'Féminin' | 'Les deux' | 'Autre';

export type SocialCategory = 'Urbain' | 'Rural' | 'Pauvre' | 'Non pauvre' | 'Vulnérable' | 
                            'Handicapé' | 'Indigène' | 'Réfugié' | 'Déplacé' | 'Jeune' | 
                            'Âgé' | 'Toutes les catégories';

export interface IndicatorData {
  _id?: string;
  geoLocation?: IndicatorGeoLocation;
  ageRange?: AgeRange;
  gender?: Gender;
  socialCategory?: SocialCategory;
  ref_year?: number;
  ref_value?: number;
  target_year?: number;
  target_value?: number;
}

export interface Indicator {
  _id: string;
  code: string;
  name: string;
  type?: "Indicateur d'impact socio-economique" | "Indicateur de resultat de programme";
  polarityDirection?: 'positive' | 'negative';
  uniteDeMesure?: UniteDeMesure | string;
  programme: Programme | string;
  source: (Source | string)[];
  metaData?: MetaData | string;
  data: IndicatorData[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IndicatorFollowup {
  _id: string;
  indicator: string | Indicator;
  dataIndex: number;
  year: number;
  value: number;
}

export const AGE_RANGES: { value: AgeRange; label: string }[] = [
  { value: '0-4', label: '0-4 ans' },
  { value: '5-9', label: '5-9 ans' },
  { value: '10-14', label: '10-14 ans' },
  { value: '15-19', label: '15-19 ans' },
  { value: '20-24', label: '20-24 ans' },
  { value: '25-29', label: '25-29 ans' },
  { value: '30-34', label: '30-34 ans' },
  { value: '35-39', label: '35-39 ans' },
  { value: '40-44', label: '40-44 ans' },
  { value: '45-49', label: '45-49 ans' },
  { value: '50-54', label: '50-54 ans' },
  { value: '55-59', label: '55-59 ans' },
  { value: '60-64', label: '60-64 ans' },
  { value: '65+', label: '65+ ans' },
  { value: '0-14', label: '0-14 ans (Enfants)' },
  { value: '15-49', label: '15-49 ans (Âge reproductif)' },
  { value: '15-64', label: '15-64 ans (Âge actif)' },
  { value: '18+', label: '18+ ans (Adultes)' },
  { value: '25-64', label: '25-64 ans (Âge actif principal)' },
  { value: 'Tous les âges', label: 'Tous les âges' }
];

export const GENDERS: { value: Gender; label: string }[] = [
  { value: 'Masculin', label: 'Masculin' },
  { value: 'Féminin', label: 'Féminin' },
  { value: 'Les deux', label: 'Les deux' },
  { value: 'Autre', label: 'Autre' }
];

export const SOCIAL_CATEGORIES: { value: SocialCategory; label: string }[] = [
  { value: 'Urbain', label: 'Urbain' },
  { value: 'Rural', label: 'Rural' },
  { value: 'Pauvre', label: 'Pauvre' },
  { value: 'Non pauvre', label: 'Non pauvre' },
  { value: 'Vulnérable', label: 'Vulnérable' },
  { value: 'Handicapé', label: 'Handicapé' },
  { value: 'Indigène', label: 'Indigène' },
  { value: 'Réfugié', label: 'Réfugié' },
  { value: 'Déplacé', label: 'Déplacé' },
  { value: 'Jeune', label: 'Jeune' },
  { value: 'Âgé', label: 'Âgé' },
  { value: 'Toutes les catégories', label: 'Toutes les catégories' }
];

export const FILE_TYPES: { value: string; label: string }[] = [
  { value: 'PDF', label: 'PDF Document' },
  { value: 'Excel', label: 'Excel Spreadsheet' },
  { value: 'CSV', label: 'CSV File' },
  { value: 'Doc', label: 'Word Document' },
  { value: 'Image', label: 'Image File' },
  { value: 'Other', label: 'Other' }
];

export const GEO_LOCATION_TYPES: { value: string; label: string }[] = [
  { value: 'Global', label: 'Global (National)' },
  { value: 'Province', label: 'Province' },
  { value: 'Departement', label: 'Département' },
  { value: 'Sous-prefecture', label: 'Sous-préfecture' },
  { value: 'Canton', label: 'Canton' },
  { value: 'Commune', label: 'Commune' },
  { value: 'Village', label: 'Village' }
];
