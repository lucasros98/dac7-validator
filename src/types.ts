export type Severity = 'error' | 'warning';

export interface ValidationError {
  code: string;
  severity: Severity;
  path: string;
  message: string;
  line?: number;
  column?: number;
  hint?: string;
  docs?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  schemaVersion: string;
}

export type Jurisdiction =
  | 'AT' | 'BE' | 'BG' | 'CY' | 'CZ' | 'DE' | 'DK' | 'EE' | 'ES' | 'FI'
  | 'FR' | 'GR' | 'HR' | 'HU' | 'IE' | 'IT' | 'LT' | 'LU' | 'LV' | 'MT'
  | 'NL' | 'PL' | 'PT' | 'RO' | 'SE' | 'SI' | 'SK';

export interface ValidateOptions {
  jurisdiction?: Jurisdiction;
  schemaVersion?: '1.0';
}
