import { useMemo, useEffect } from 'react';
import { useFormContext, type FieldValues } from 'react-hook-form';
import { MapPin, ChevronRight, Loader2 } from 'lucide-react';
import { useLocationStore } from '../../store/useLocationStore';
import styles from './LocationTreeSelect.module.css';

/**
 * LocationTreeSelect — 3-level cascading location picker.
 *
 * Cascade logic:
 *  1. User selects a Location (top level) → Sub-locations populate
 *  2. User selects a Sub-location → Areas/Floors populate
 *  3. User selects an Area/Floor → Final value committed
 *
 * Prevents out-of-order selection by disabling downstream selects
 * until their parent is chosen.
 */

interface LocationTreeSelectProps {
  locationField: string;
  subLocationField: string;
  areaField: string;
}

export function LocationTreeSelect({
  locationField,
  subLocationField,
  areaField,
}: LocationTreeSelectProps) {
  const { tree, fetchTree, isLoading } = useLocationStore();
  
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<FieldValues>();

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  const selectedLocationId = watch(locationField) as string;
  const selectedSubLocationId = watch(subLocationField) as string;

  // Derived data for cascaded selects
  const selectedLocation = useMemo(
    () => tree.find((loc) => loc.id === selectedLocationId),
    [tree, selectedLocationId]
  );

  const subLocations = selectedLocation?.children ?? [];

  const selectedSubLocation = useMemo(
    () => subLocations.find((sub) => sub.id === selectedSubLocationId),
    [subLocations, selectedSubLocationId]
  );

  const areas = selectedSubLocation?.children ?? [];

  const locationError = errors[locationField];
  const subLocationError = errors[subLocationField];
  const areaError = errors[areaField];

  // When parent changes, clear children
  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue(locationField, e.target.value, { shouldValidate: true });
    setValue(subLocationField, '', { shouldValidate: false });
    setValue(areaField, '', { shouldValidate: false });
  };

  const handleSubLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue(subLocationField, e.target.value, { shouldValidate: true });
    setValue(areaField, '', { shouldValidate: false });
  };

  const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue(areaField, e.target.value, { shouldValidate: true });
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <MapPin size={16} className={styles.headerIcon} />
          <span className={styles.headerLabel}>Location Hierarchy</span>
        </div>
        {isLoading && <Loader2 size={14} className={styles.spinner} />}
      </div>

      {/* Cascade breadcrumb indicator */}
      <div className={styles.breadcrumb}>
        <span className={`${styles.crumb} ${selectedLocationId ? styles.crumbActive : ''}`}>
          Location
        </span>
        <ChevronRight size={14} className={styles.crumbArrow} />
        <span className={`${styles.crumb} ${selectedSubLocationId ? styles.crumbActive : ''}`}>
          Sub-location
        </span>
        <ChevronRight size={14} className={styles.crumbArrow} />
        <span className={`${styles.crumb} ${watch(areaField) ? styles.crumbActive : ''}`}>
          Area / Floor
        </span>
      </div>

      <div className={styles.cascade}>
        {/* Level 1: Location */}
        <div className={styles.field}>
          <label htmlFor={locationField} className={styles.label}>
            Location <span className={styles.required}>*</span>
          </label>
          <select
            id={locationField}
            className={`${styles.select} ${locationError ? styles.selectError : ''}`}
            {...register(locationField)}
            onChange={handleLocationChange}
            disabled={isLoading}
          >
            <option value="">{isLoading ? 'Loading...' : 'Select location...'}</option>
            {tree.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
          {locationError && (
            <p className={styles.error} role="alert">
              {locationError.message as string}
            </p>
          )}
        </div>

        {/* Level 2: Sub-location */}
        <div className={styles.field}>
          <label htmlFor={subLocationField} className={styles.label}>
            Sub-location <span className={styles.required}>*</span>
          </label>
          <select
            id={subLocationField}
            className={`${styles.select} ${subLocationError ? styles.selectError : ''} ${
              !selectedLocationId || isLoading ? styles.selectDisabled : ''
            }`}
            disabled={!selectedLocationId || isLoading}
            {...register(subLocationField)}
            onChange={handleSubLocationChange}
          >
            <option value="">
              {!selectedLocationId ? 'Select a location first' : 'Select sub-location...'}
            </option>
            {subLocations.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
          {subLocationError && (
            <p className={styles.error} role="alert">
              {subLocationError.message as string}
            </p>
          )}
        </div>

        {/* Level 3: Area/Floor */}
        <div className={styles.field}>
          <label htmlFor={areaField} className={styles.label}>
            Area / Floor <span className={styles.required}>*</span>
          </label>
          <select
            id={areaField}
            className={`${styles.select} ${areaError ? styles.selectError : ''} ${
              !selectedSubLocationId || isLoading ? styles.selectDisabled : ''
            }`}
            disabled={!selectedSubLocationId || isLoading}
            {...register(areaField)}
            onChange={handleAreaChange}
          >
            <option value="">
              {!selectedSubLocationId ? 'Select a sub-location first' : 'Select area or floor...'}
            </option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
          {areaError && (
            <p className={styles.error} role="alert">
              {areaError.message as string}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
