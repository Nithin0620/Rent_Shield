import { DragEvent, useRef, useState } from "react";
import { EvidenceType } from "../types/evidenceEnums";
import { uploadEvidence } from "../services/evidenceService";

interface EvidenceUploadProps {
  agreementId: string;
  disabled: boolean;
  onUploaded: () => void;
}

const EvidenceUpload = ({ agreementId, disabled, onUploaded }: EvidenceUploadProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<EvidenceType>(EvidenceType.MoveIn);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleFile = (nextFile: File | null) => {
    setFile(nextFile);
    if (!nextFile) {
      setPreviewUrl(null);
      return;
    }
    setPreviewUrl(URL.createObjectURL(nextFile));
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (disabled) return;
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setMessage(null);
    setProgress(0);

    try {
      await uploadEvidence({ agreementId, type, file }, setProgress);
      setMessage("Evidence uploaded.");
      handleFile(null);
      onUploaded();
    } catch {
      setMessage("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>Upload evidence</h3>
      <div
        onDrop={handleDrop}
        onDragOver={(event) => event.preventDefault()}
        style={{
          border: "2px dashed #cbd5f5",
          borderRadius: 12,
          padding: 20,
          background: disabled ? "#f3f4f6" : "#f8fafc",
          cursor: disabled ? "not-allowed" : "pointer"
        }}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <p className="muted">Drag & drop or click to select image/video</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          style={{ display: "none" }}
          onChange={(event) => handleFile(event.target.files?.[0] || null)}
          disabled={disabled}
        />
      </div>

      <div className="form-grid" style={{ marginTop: 12 }}>
        <select value={type} onChange={(event) => setType(event.target.value as EvidenceType)}>
          <option value={EvidenceType.MoveIn}>Move-in</option>
          <option value={EvidenceType.MoveOut}>Move-out</option>
          <option value={EvidenceType.DamageProof}>Damage proof</option>
        </select>

        {previewUrl && (
          <div>
            {file?.type.startsWith("video") ? (
              <video src={previewUrl} controls style={{ width: "100%", borderRadius: 12 }} />
            ) : (
              <img src={previewUrl} alt="preview" style={{ width: "100%", borderRadius: 12 }} />
            )}
          </div>
        )}

        {progress > 0 && <span className="muted">Upload progress: {progress}%</span>}
        {message && <span className="muted">{message}</span>}
        <button onClick={handleUpload} disabled={disabled || !file || loading}>
          {loading ? "Uploading..." : "Upload evidence"}
        </button>
      </div>
    </div>
  );
};

export default EvidenceUpload;
