'use client'; // Added for Next.js App Router compatibility with react-pdf worker

import { useState, useEffect } from "react"
import { useUser } from '../hooks/useUser'
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { AlertCircle, Download, ChevronLeft, ChevronRight } from "lucide-react"
import { Document, Page, pdfjs } from 'react-pdf'

// Explicitly set workerSrc to the path in the public folder
// Ensure 'pdf.worker.min.mjs' (or .js depending on your version) is in your /public directory.
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`; 

interface ResumeScoreProps {
  onRescan: () => void;
}

export function ResumeScore({ onRescan }: ResumeScoreProps) {
  const { user, loading: userLoading } = useUser();
  
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null); // Store blob for download
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.uid) {
      const fetchPdf = async () => {
        setIsLoadingPdf(true);
        setPdfError(null);
        setPdfUrl(null);
        setPdfBlob(null);
        setNumPages(null);
        setPageNumber(1);

        try {
          const response = await fetch('http://localhost:3001/api/v1/user/retrieve_resume', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ firebase_id: user.uid }),
          });

          if (!response.ok) {
            let errorMsg = `Failed to fetch PDF: ${response.status} ${response.statusText}`;
            try {
                const errData = await response.json();
                errorMsg = errData.message || errorMsg;
            } catch (e) { /* Ignore if error response is not JSON */ }
            throw new Error(errorMsg);
          }

          const blob = await response.blob();
          if (blob.type !== 'application/pdf') {
            throw new Error("Retrieved file is not a PDF. Please check the backend.");
          }
          setPdfBlob(blob);
          setPdfUrl(URL.createObjectURL(blob));
        } catch (error: any) {
          console.error("Error fetching or processing PDF:", error);
          setPdfError(error.message || "An unexpected error occurred while loading the PDF.");
        } finally {
          setIsLoadingPdf(false);
        }
      };
      fetchPdf();
    }

    // Cleanup object URL when component unmounts or user changes
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [user?.uid]); // Re-fetch if user changes

  function onDocumentLoadSuccess({ numPages: nextNumPages }: { numPages: number }): void {
    setNumPages(nextNumPages);
    setPageNumber(1); // Reset to first page on new PDF load
  }

  function changePage(offset: number) {
    setPageNumber(prevPageNumber => Math.min(Math.max(prevPageNumber + offset, 1), numPages || 1));
  }

  const handleDownload = () => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      // Filename can be dynamic if known, or generic.
      // Your backend sets Content-Disposition, but this gives client-side control too.
      a.download = `${user?.uid || 'user'}_optimized_resume.pdf`; 
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // Optionally, re-fetch if blob isn't available
      setPdfError("PDF data is not available for download. Please try again.");
    }
  };

  if (userLoading) {
    return (
      <Card className="w-full">
        <CardHeader><CardTitle className="text-center">Optimized Resume Suggestions</CardTitle></CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Optimized Resume Suggestions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {pdfBlob && !isLoadingPdf && !pdfError && (
          <div className="mb-4 flex justify-center">
            <Button onClick={handleDownload} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        )}

        {isLoadingPdf && (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-900"></div>
            <p className="ml-3 text-gray-700">Loading PDF...</p>
          </div>
        )}
        {pdfError && (
          <div className="text-center text-red-600 bg-red-50 p-4 rounded-md flex items-center justify-center">
            <AlertCircle className="mr-2 h-5 w-5" />
            <span>{pdfError}</span>
          </div>
        )}
        {!isLoadingPdf && !pdfError && pdfUrl && (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-full max-w-4xl border rounded-md overflow-hidden shadow-lg bg-gray-50">
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={(err) => {
                    console.error("React-PDF Document Load Error:", err);
                    setPdfError(`Failed to load PDF document: ${err.message}. Ensure the PDF worker is set up correctly and the file is not corrupted.`);
                }}
                loading={<div className="p-4 text-center">Loading document...</div>}
                error={<div className="p-4 text-center text-red-500">Error loading PDF document.</div>}
              >
                <Page 
                  pageNumber={pageNumber} 
                  renderTextLayer={false} // Improves performance if text selection isn't critical
                  renderAnnotationLayer={false} // Improves performance
                  // Adjust width or scale as needed for responsiveness
                  // Using width is often easier for responsive design
                  width={Math.min(800, window.innerWidth - 80)} // Example width, adjust as needed
                />
              </Document>
            </div>
            {numPages && numPages > 1 && (
              <div className="flex items-center justify-center space-x-4 p-2 bg-gray-100 rounded-md">
                <Button onClick={() => changePage(-1)} disabled={pageNumber <= 1} variant="ghost" size="sm">
                  <ChevronLeft className="h-5 w-5" />
                  Previous
                </Button>
                <span className="text-sm text-gray-700">
                  Page {pageNumber} of {numPages}
                </span>
                <Button onClick={() => changePage(1)} disabled={pageNumber >= numPages} variant="ghost" size="sm">
                  Next
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        )}
        {!isLoadingPdf && !pdfError && !pdfUrl && user?.uid && (
            <p className="text-center text-gray-500 py-10">No optimized PDF found for your account or it could not be loaded.</p>
        )}
         {!user?.uid && !userLoading && (
            <p className="text-center text-gray-500 py-10">Please sign in to view your optimized resume.</p>
        )}

        <div className="mt-6 flex justify-center border-t pt-6">
          <Button className="bg-black hover:bg-black/90 text-white" onClick={onRescan}>
            Make Changes & Rescan
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}