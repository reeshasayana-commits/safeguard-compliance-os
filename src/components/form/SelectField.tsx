import { type SelectHTMLAttributes } from 'react';
import { useFormContext, type FieldPath, type FieldValues } from 'react-hook-form';
import styles from './FormFields.module.css';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps<T extends FieldValues> extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'name'> {
  name: FieldPath<T>;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  hint?: string;
}

export function SelectField<T extends FieldValues>({
  name,
  label,
  options,
  placeholder = 'Select...',
  hint,
  ...rest
}: SelectFieldProps<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();

  const error = errors[name];
  const hasError = !!error;

  return (
    <div className={styles.field}>
      <label htmlFor={name} className={styles.label}>
        {label}
      </label>
      <select
        id={name}
        className={`${styles.select} ${hasError ? styles.inputError : ''}`}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${name}-error` : hint ? `${name}-hint` : undefined}
        {...register(name)}
        {...rest}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint && !hasError && (
        <p id={`${name}-hint`} className={styles.hint}>
          {hint}
        </p>
      )}
      {hasError && (
        <p id={`${name}-error`} className={styles.error} role="alert">
          {error.message as string}
        </p>
      )}
    </div>
  );
}
