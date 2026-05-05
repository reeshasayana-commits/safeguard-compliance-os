import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileImage, CheckCircle } from 'lucide-react';
import styles from './EvidenceDropzone.module.css';

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: 'uploading' | 'done';
}

export function EvidenceDropzone() {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const simulateUpload = useCallback((newFile: UploadedFile) => {
    // Simulate upload progress in 3 increments
    const steps = [30, 70, 100];
    let step = 0;

    const interval = setInterval(() => {
      if (step < steps.length) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === newFile.id
              ? { ...f, progress: steps[step], status: steps[step] === 100 ? 'done' : 'uploading' }
              : f
          )
        );
        step++;
      } else {
        clearInterval(interval);
      }
    }, 400);
  }, []);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        preview: URL.createObjectURL(file),
        progress: 0,
        status: 'uploading' as const,
      }));

      setFiles((prev) => [...prev, ...newFiles]);
      newFiles.forEach(simulateUpload);
    },
    [simulateUpload]
  );

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <div className={styles.wrapper}>
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`${styles.dropzone} ${isDragActive ? styles.dropzoneActive : ''}`}
      >
        <input {...getInputProps()} />
        <Upload size={24} className={styles.dropIcon} />
        <p className={styles.dropText}>
          {isDragActive ? 'Drop images here...' : 'Drag & drop evidence images, or click to browse'}
        </p>
        <span className={styles.dropHint}>PNG, JPG, WebP up to 10MB · Max 5 files</span>
      </div>

      {/* Uploaded files list */}
      {files.length > 0 && (
        <div className={styles.fileList}>
          {files.map((f) => (
            <div key={f.id} className={styles.fileItem}>
              {/* Thumbnail */}
              <div className={styles.thumbnail}>
                <img src={f.preview} alt={f.file.name} className={styles.thumbImg} />
              </div>

              {/* Info */}
              <div className={styles.fileInfo}>
                <div className={styles.fileName}>
                  <FileImage size={14} className={styles.fileIcon} />
                  <span className={styles.fileNameText}>{f.file.name}</span>
                </div>

                {/* Progress bar */}
                {f.status === 'uploading' ? (
                  <div className={styles.progressTrack}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${f.progress}%` }}
                    />
                  </div>
                ) : (
                  <span className={styles.doneLabel}>
                    <CheckCircle size={12} />
                    Uploaded
                  </span>
                )}
              </div>

              {/* Remove */}
              <button
                className={styles.removeBtn}
                onClick={() => removeFile(f.id)}
                aria-label={`Remove ${f.file.name}`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
