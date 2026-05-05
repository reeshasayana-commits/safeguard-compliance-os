import { type TextareaHTMLAttributes } from 'react';
import { useFormContext, type FieldPath, type FieldValues } from 'react-hook-form';
import styles from './FormFields.module.css';

interface TextAreaFieldProps<T extends FieldValues> extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'name'> {
  name: FieldPath<T>;
  label: string;
  hint?: string;
  maxLength?: number;
}

export function TextAreaField<T extends FieldValues>({
  name,
  label,
  hint,
  maxLength,
  rows = 4,
  ...rest
}: TextAreaFieldProps<T>) {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<T>();

  const error = errors[name];
  const hasError = !!error;
  const value = watch(name) as string | undefined;
  const charCount = value?.length ?? 0;

  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label htmlFor={name} className={styles.label}>
          {label}
        </label>
        {maxLength && (
          <span className={`${styles.charCount} ${charCount > maxLength ? styles.charCountOver : ''}`}>
            {charCount}/{maxLength}
          </span>
        )}
      </div>
      <textarea
        id={name}
        rows={rows}
        className={`${styles.textarea} ${hasError ? styles.inputError : ''}`}
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
