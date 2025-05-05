import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { AlertCircle, Check, ChevronDown, ChevronUp, Zap, ArrowRight } from "lucide-react"

// Define the structure of the parsed optimization data
type OptimizationData = {
  [section: string]: Array<[string, string]>; // Array of [oldText, newText] pairs
};

interface ResumeScoreProps {
  optimize: string; // This is the JSON string
  onRescan: () => void;
}

export function ResumeScore({ optimize, onRescan }: ResumeScoreProps) {
  const [parsedData, setParsedData] = useState<OptimizationData | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const data = JSON.parse(optimize || '{}'); // Provide default empty object if optimize is null/undefined
      if (typeof data === 'object' && data !== null) {
        setParsedData(data);
        setParseError(null);
      } else {
        throw new Error("Parsed data is not a valid object.");
      }
    } catch (error) {
      console.error("Failed to parse optimization data:", error);
      setParseError("Failed to load optimization suggestions. The data format might be incorrect.");
      setParsedData(null);
    }
  }, [optimize]); // Re-parse when the optimize prop changes

  return (
    <>
      <Card className="w-full"> {/* Use full width or adjust as needed */}
        <CardHeader>
          <CardTitle className="text-center">Optimized Resume Suggestions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 max-h-[70vh] overflow-y-auto p-4 md:p-6">
          {parseError && (
            <div className="text-center text-red-600 bg-red-50 p-4 rounded-md">
              <AlertCircle className="inline-block mr-2 h-5 w-5" />
              {parseError}
            </div>
          )}
          {parsedData && Object.keys(parsedData).length > 0 ? (
            Object.entries(parsedData).map(([section, changes]) => (
              <div key={section} className="mb-6 p-4 border rounded-lg shadow-sm bg-white">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">{section}</h3>
                <div className="space-y-4">
                  {changes.map(([oldText, newText], index) => (
                    <div key={index} className="p-3 border rounded-md bg-gray-50">
                      <p className="text-sm text-red-600 mb-1">
                        <span className="font-medium">Old:</span> {oldText}
                      </p>
                      <p className="text-sm text-green-700">
                        <span className="font-medium">New:</span> <span className="font-semibold">{newText}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            !parseError && <p className="text-center text-gray-500">No optimization suggestions available.</p>
          )}
          {/* Keep the Rescan Button */}
          <div className="mt-6 flex justify-center">
            <Button className="bg-black hover:bg-black/90 text-white" onClick={onRescan}>
              Make Changes & Rescan
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}