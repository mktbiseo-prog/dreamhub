"use client";

import { useState, useTransition } from "react";
import { submitKyc } from "@/lib/actions/kyc";

interface KycVerificationProps {
  status: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
  submittedAt?: string | null;
  verifiedAt?: string | null;
}

export function KycVerification({ status, submittedAt, verifiedAt }: KycVerificationProps) {
  const [documentType, setDocumentType] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(status === "PENDING");

  if (status === "VERIFIED") {
    return (
      <div className="rounded-card border border-green-200 bg-green-50 p-6 dark:border-green-900/50 dark:bg-green-950/20">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-green-800 dark:text-green-300">Identity Verified</h3>
            <p className="text-sm text-green-600 dark:text-green-400">
              Your identity has been verified.
              {verifiedAt && <span> Verified on {verifiedAt}.</span>}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "PENDING" || submitted) {
    return (
      <div className="rounded-card border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-900/50 dark:bg-yellow-950/20">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
            <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">Verification Pending</h3>
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              Your verification is under review. This typically takes 1-2 business days.
              {submittedAt && <span> Submitted on {submittedAt}.</span>}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "REJECTED") {
    return (
      <div className="rounded-card border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/20">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-red-800 dark:text-red-300">Verification Rejected</h3>
            <p className="text-sm text-red-600 dark:text-red-400">
              Your verification was not approved. Please resubmit with a valid document.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // UNVERIFIED — show form
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!documentType) {
      setError("Please select a document type");
      return;
    }

    const formData = new FormData();
    formData.set("documentType", documentType);
    // In production, this would be a real document upload URL
    formData.set("documentUrl", `kyc-${Date.now()}`);

    startTransition(async () => {
      const result = await submitKyc(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSubmitted(true);
      }
    });
  }

  return (
    <div className="rounded-card border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
          <svg className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Verify Your Identity</h3>
          <p className="text-sm text-gray-500">
            Verified creators get a trust badge on their profile, increasing buyer confidence and sales.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Document Type
          </label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            <option value="">Select document type...</option>
            <option value="government_id">Government-issued ID</option>
            <option value="passport">Passport</option>
            <option value="drivers_license">Driver&apos;s License</option>
            <option value="business_license">Business License</option>
          </select>
        </div>

        <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center dark:border-gray-700">
          <svg className="mx-auto mb-2 h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <p className="text-sm text-gray-500">Upload a clear photo of your document</p>
          <p className="mt-1 text-xs text-gray-400">
            JPG, PNG up to 10MB. Your document is encrypted and stored securely.
          </p>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
        >
          {isPending ? "Submitting..." : "Submit for Verification"}
        </button>
      </form>
    </div>
  );
}
