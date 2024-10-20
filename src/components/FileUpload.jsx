import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

export const FileUpload = ({ onFileProcessed }) => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5000/api/process-file", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }
      onFileProcessed(result.summary);
    } catch (error) {
      console.error("Error processing file:", error);
      setError(error.message || "An error occurred while processing the file.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Input
          type="file"
          onChange={handleFileChange}
          accept=".txt,.pdf,.doc,.docx"
          className="flex-grow"
        />
        <Button onClick={handleUpload} disabled={!file || isLoading}>
          {isLoading ? "Processing..." : "Upload & Analyze"}
        </Button>
      </div>
      {file && <p className="text-sm text-gray-500">{file.name}</p>}
      {isLoading && <Progress value={uploadProgress} className="w-full" />}
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};
