
import React from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, X } from 'lucide-react';

interface FileUpload {
  name: string;
  url: string;
}

interface FileUploadSectionProps {
  files: FileUpload[];
  onFilesChange: (newFiles: FileUpload[]) => void;
}

const FileUploadSection = ({
  files,
  onFilesChange
}: FileUploadSectionProps) => {
  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const binaryStr = reader.result as string;
        const newFile = {
          name: file.name,
          url: binaryStr
        };
        onFilesChange([...files, newFile]);
      };
      reader.readAsDataURL(file);
    });
  }, [files, onFilesChange]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const removeFile = (fileToRemove: FileUpload) => {
    onFilesChange(files.filter(file => file.name !== fileToRemove.name));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>File Uploads</CardTitle>
        <CardDescription>
          Attach relevant files to support your application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div {...getRootProps()} className="dropzone border rounded-md p-4 flex flex-col items-center justify-center">
          <input {...getInputProps()} />
          {
            isDragActive ?
              <p>Drop the files here ...</p> :
              <>
                <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Drag 'n' drop some files here, or click to select files</p>
              </>
          }
        </div>

        {files.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium">Uploaded Files:</h4>
            <ul className="mt-2 space-y-2">
              {files.map((file) => (
                <li key={file.name} className="flex items-center justify-between rounded-md border p-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">{file.name}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeFile(file)}>
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUploadSection;
