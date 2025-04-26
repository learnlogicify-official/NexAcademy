"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// This is just a redirect to the main assessment page
export default function EditAssessmentRedirect({ params }: { params: { id: string } }) {
  const router = useRouter();
  
  useEffect(() => {
    router.replace(`/admin/assessments/${params.id}`);
  }, [params.id, router]);
  
  return (
    <div className="container mx-auto py-10 flex items-center justify-center">
      <p>Redirecting to assessment editor...</p>
    </div>
  );
}
 