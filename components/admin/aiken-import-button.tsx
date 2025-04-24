import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import AikenImportModal from './aiken-import-modal';

interface AikenImportButtonProps {
  folders: any[];
  onSuccess: () => void;
}

const AikenImportButton: React.FC<AikenImportButtonProps> = ({ 
  folders,
  onSuccess
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button 
        variant="outline"
        onClick={() => setIsModalOpen(true)}
        className="gap-2"
      >
        <FileText className="h-4 w-4" />
        Import Aiken Format
      </Button>

      <AikenImportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          onSuccess();
        }}
        folders={folders}
      />
    </>
  );
};

export default AikenImportButton; 