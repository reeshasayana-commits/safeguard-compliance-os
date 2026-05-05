// ============================================================================
// @IsFutureDate — Custom class-validator decorator
// ============================================================================
//
// Mirrors the Zod `.refine(val => new Date(val) > new Date())` constraint
// from the frontend schema for the dueDate field.
// ============================================================================

import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsFutureDateConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (value === undefined || value === null || value === '') {
      return true; // Optional field — let @IsOptional handle presence
    }
    const date = new Date(value as string);
    if (isNaN(date.getTime())) {
      return false; // Not a valid date
    }
    return date > new Date();
  }

  defaultMessage(): string {
    return 'Due date must be in the future';
  }
}

export function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsFutureDateConstraint,
    });
  };
}
