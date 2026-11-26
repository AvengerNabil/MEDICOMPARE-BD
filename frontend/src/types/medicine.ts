export type DosageForm = 
  | 'Tablet'
  | 'Capsule'
  | 'Suspension'
  | 'Syrup'
  | 'Injection'
  | 'Eye Drops'
  | 'Oral Solution'
  | 'Inhaler';

export type ReleaseMechanism = 
  | 'Immediate Release'
  | 'Extended Release (XR)'
  | 'Delayed Release'
  | 'Sustained Release (SR)'
  | 'Enteric Coated';

export type VerificationStatus = 
  | 'OFFICIAL_VERIFIED'
  | 'SECONDARY_VERIFIED'
  | 'PENDING_REVIEW'
  | 'REJECTED';

export type PriceType = 
  | 'OFFICIAL_MRP'
  | 'MANUFACTURER_LISTED'
  | 'VERIFIED_PHARMACY';

export interface ActiveIngredient {
  name: string;
  banglaName?: string;
  strength: string;
}

export interface Medicine {
  id: string;
  brandName: string;
  brandNameBn: string;
  genericName: string;
  genericNameBn: string;
  genericId: string;
  strength: string;
  dosageForm: DosageForm;
  dosageFormBn: string;
  route: string;
  releaseMechanism: ReleaseMechanism;
  manufacturer: string;
  manufacturerBn: string;
  manufacturerId: string;
  mrp: number; // In BDT (৳)
  unitPrice: number; // Per tablet / capsule / ml
  packSize: number;
  packUnit: string;
  priceType: PriceType;
  isPrescriptionRequired: boolean;
  registrationNumber: string; // DGDA DAR Number
  verificationStatus: VerificationStatus;
  dataSource: string;
  lastVerifiedDate: string;
  therapeuticClass: string;
  therapeuticClassBn: string;
  activeIngredients: ActiveIngredient[];
  indicationsSummary: string;
  indicationsSummaryBn: string;
  safetyAdvice: string;
  safetyAdviceBn: string;
}

export interface Manufacturer {
  id: string;
  name: string;
  nameBn: string;
  shortName: string;
  established: number;
  dgdaLicense: string;
  headquarters: string;
  headquartersBn: string;
  gmpCertified: boolean;
  website: string;
  totalRegisteredBrands: number;
  description: string;
  descriptionBn: string;
}

export interface TherapeuticCategory {
  id: string;
  name: string;
  nameBn: string;
  description: string;
  descriptionBn: string;
  iconName: string;
  brandCount: number;
  commonGenerics: string[];
}

export interface SavingsComparison {
  targetMedicine: Medicine;
  alternativeMedicine: Medicine;
  dailyDose: number; // units per day
  durationDays: number;
  targetTotalCost: number;
  alternativeTotalCost: number;
  potentialSavings: number;
  savingsPercentage: number;
}
