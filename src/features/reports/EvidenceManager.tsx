import React, { useState, useEffect, useCallback } from "react";
import {
  Upload,
  AlertTriangle,
  Trash2,
  Loader2,
  Lock,
  Info,
} from "lucide-react";
import {
  authorizeEvidence,
  completeEvidence,
  listEvidence,
  deleteEvidence,
  type EvidenceItem,
  ApiError,
} from "../../api/saferpath/client";
import { generateIdempotencyKey } from "../../lib/session";

interface EvidenceManagerProps {
  reportId: string;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

export const EvidenceManager: React.FC<EvidenceManagerProps> = ({
  reportId,
}) => {
  const [items, setItems] = useState<EvidenceItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusMsg, setUploadStatusMsg] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const loadEvidenceList = useCallback(async () => {
    if (!reportId) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await listEvidence(reportId);
      setItems(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setLoadError(`Failed to load evidence records (${err.code}).`);
      } else {
        setLoadError("Could not load evidence records.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    loadEvidenceList();
  }, [loadEvidenceList]);

  // Handle local file selection and secure upload lifecycle
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadStatusMsg(null);

    // Validation 1: Allowed content type (No arbitrary URL or file types)
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError(
        "Unsupported file type. Only JPEG, PNG, and WebP images are permitted for physical evidence.",
      );
      return;
    }

    // Validation 2: Size check
    if (file.size > MAX_FILE_BYTES) {
      setUploadError("File size exceeds the 10 MB maximum limit.");
      return;
    }

    setIsUploading(true);
    setUploadStatusMsg("Requesting upload authorization...");

    try {
      // Step 1: Request authorization from backend
      const authRes = await authorizeEvidence(
        reportId,
        generateIdempotencyKey(),
        file.type,
        file.size,
      );

      setUploadStatusMsg("Encoding and transferring physical evidence...");

      // Step 2: Read file as Base64 (secure in-memory conversion, no public URL)
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const res = reader.result as string;
          // Strip prefix "data:image/...;base64,"
          const commaIdx = res.indexOf(",");
          resolve(commaIdx >= 0 ? res.slice(commaIdx + 1) : res);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Step 3: Complete upload and trigger malware/integrity scanning
      setUploadStatusMsg("Processing and scanning evidence...");
      await completeEvidence(
        reportId,
        authRes.evidence_id,
        authRes.upload_token,
        base64Data,
      );

      setUploadStatusMsg("Evidence successfully submitted and verified.");
      await loadEvidenceList();
      setTimeout(() => setUploadStatusMsg(null), 4000);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 410) {
          setUploadError("Upload authorization expired. Please try again.");
        } else if (err.code === "EVIDENCE_REJECTED") {
          setUploadError("Evidence failed security scan and was rejected.");
        } else {
          setUploadError(`Upload failed (${err.code}): ${err.message}`);
        }
      } else {
        setUploadError("Failed to complete evidence upload.");
      }
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const handleDelete = async (evidenceId: string) => {
    try {
      await deleteEvidence(reportId, evidenceId);
      setItems((prev) => prev.filter((i) => i.evidence_id !== evidenceId));
    } catch (err) {
      alert("Could not delete evidence item.");
    }
  };

  return (
    <div className="bg-white border border-[#DCE3EE] rounded-md p-4 sm:p-5 space-y-4 text-xs">
      <div className="border-b border-[#DCE3EE] pb-2.5">
        <span className="text-[10px] font-mono uppercase text-[#2563EB] font-bold block">
          Report Evidence Lifecycle
        </span>
        <h3 className="text-sm font-bold text-[#172033]">
          Physical Observation Evidence
        </h3>
        <p className="text-[11px] text-[#64748B] mt-0.5">
          Secure, non-public physical evidence storage. Files undergo integrity
          scanning and automatic expiration.
        </p>
      </div>

      {loadError && (
        <div
          role="alert"
          className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-md flex items-start gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <span>{loadError}</span>
        </div>
      )}

      {uploadError && (
        <div
          role="alert"
          className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-md flex items-start gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-[#C62828] shrink-0 mt-0.5" />
          <span>{uploadError}</span>
        </div>
      )}

      {uploadStatusMsg && (
        <div
          role="status"
          className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-md flex items-center gap-2"
        >
          <Info className="w-4 h-4 text-[#2563EB] shrink-0" />
          <span>{uploadStatusMsg}</span>
        </div>
      )}

      {/* Upload Action Trigger */}
      <div className="p-4 border-2 border-dashed border-[#DCE3EE] hover:border-[#2563EB]/60 rounded-md bg-[#F5F7FB] text-center space-y-2">
        <div className="w-8 h-8 rounded-full bg-white border border-[#DCE3EE] flex items-center justify-center mx-auto text-[#2563EB]">
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
        </div>
        <div>
          <span className="font-semibold text-[#172033] block">
            Upload physical photo observation
          </span>
          <span className="text-[11px] text-[#64748B]">
            JPEG, PNG, WebP up to 10 MB. Never published publicly.
          </span>
        </div>
        <label className="inline-block">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={isUploading}
            onChange={handleFileChange}
            className="sr-only"
          />
          <span className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-md shadow-xs cursor-pointer inline-flex items-center gap-1.5 transition-colors">
            {isUploading ? "Uploading..." : "Select image file"}
          </span>
        </label>
      </div>

      {/* Evidence Items List */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono uppercase text-[#64748B] font-bold block">
          Attached Evidence Records ({items.length})
        </span>

        {isLoading && (
          <div className="p-4 text-center text-[#64748B]">
            Loading evidence records...
          </div>
        )}

        {!isLoading && items.length === 0 && (
          <div className="p-3 text-center text-[#64748B] bg-[#F5F7FB] rounded-md border border-[#DCE3EE]">
            No physical evidence attached to this report.
          </div>
        )}

        <div className="divide-y divide-[#DCE3EE] border border-[#DCE3EE] rounded-md overflow-hidden">
          {items.map((item) => (
            <div
              key={item.evidence_id}
              className="p-3 flex items-center justify-between gap-3 hover:bg-[#F5F7FB]"
            >
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#172033]">
                    {item.reference}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                      item.state === "ACCEPTED"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : item.state === "SCANNING"
                          ? "bg-blue-50 text-blue-800 border border-blue-200"
                          : "bg-gray-50 text-gray-700 border border-gray-200"
                    }`}
                  >
                    {item.state}
                  </span>
                </div>
                <div className="text-[11px] text-[#64748B] font-mono flex items-center gap-3">
                  <span>Type: {item.content_type}</span>
                  <span>Size: {(item.size_bytes / 1024).toFixed(1)} KB</span>
                  {item.retention_until && (
                    <span>
                      Expires:{" "}
                      {new Date(item.retention_until).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleDelete(item.evidence_id)}
                className="p-1.5 text-[#64748B] hover:text-rose-600 cursor-pointer rounded hover:bg-rose-50 transition-colors"
                aria-label={`Delete evidence ${item.reference}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy note */}
      <div className="p-2.5 bg-[#F5F7FB] border border-[#DCE3EE] rounded-md text-[11px] text-[#64748B] flex items-center gap-2">
        <Lock className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
        <span>
          Evidence files are retained for internal context verification only.
          Object references are never exposed publicly.
        </span>
      </div>
    </div>
  );
};

export default EvidenceManager;
