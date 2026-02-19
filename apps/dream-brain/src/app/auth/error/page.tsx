import Link from "next/link";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

const errorMessages: Record<string, string> = {
  Configuration: "The authentication service is not configured. Please use email sign-in for demo.",
  AccessDenied: "Access denied. You do not have permission to sign in.",
  Verification: "The verification link has expired or has already been used.",
  Default: "An authentication error occurred. Please try again.",
};

export default async function AuthErrorPage({ searchParams }: PageProps) {
  const { error } = await searchParams;
  const message = errorMessages[error ?? ""] ?? errorMessages.Default;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A1628] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#1E3355] bg-[#132039] p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
          <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="mb-2 text-xl font-bold text-white">Authentication Error</h1>
        <p className="mb-6 text-sm text-gray-400">{message}</p>
        <Link
          href="/auth/sign-in"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
