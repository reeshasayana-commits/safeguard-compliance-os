import { type InputHTMLAttributes } from 'react';
import { useFormContext, type FieldPath, type FieldValues } from 'react-hook-form';
import styles from './FormFields.module.css';

interface InputFieldProps<T extends FieldValues> extends Omit<InputHTMLAttributes<HTMLInputElement>, 'name'> {
  name: FieldPath<T>;
  label: string;
  hint?: string;
}

export function InputField<T extends FieldValues>({
  name,
  label,
  hint,
  type = 'text',
  ...rest
}: InputFieldProps<T>) {
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
      <input
        id={name}
        type={type}
        className={`${styles.input} ${hasError ? styles.inputError : ''}`}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${name}-error` : hint ? `${name}-hint` : undefined}
        {...register(name)}
        {...rest}
      />
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
