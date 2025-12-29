import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Settings2 } from 'lucide-react';
import { MemoryViewer } from './MemoryViewer';
import { CustomInstructionsModal } from './CustomInstructionsModal';

interface Memory {
  id: string;
  memory_type: 'preference' | 'weakness' | 'goal' | 'behavior' | 'context';
  content: string;
  created_at: string;
}

interface CustomInstructions {
  response_style: string | null;
  about_me: string | null;
}

interface CampusGPTSettingsProps {
  memories: Memory[];
  customInstructions: CustomInstructions | null;
  onDeleteMemory: (id: string) => void;
  onSaveInstructions: (instructions: { response_style: string; about_me: string }) => Promise<void>;
  isLoading?: boolean;
}

export function CampusGPTSettings({
  memories,
  customInstructions,
  onDeleteMemory,
  onSaveInstructions,
  isLoading,
}: CampusGPTSettingsProps) {
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveInstructions = async (instructions: { response_style: string; about_me: string }) => {
    setIsSaving(true);
    try {
      await onSaveInstructions(instructions);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings2 className="w-4 h-4" />
            Settings
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>CampusGPT Settings</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            <div>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => setInstructionsOpen(true)}
              >
                <Settings2 className="w-4 h-4" />
                Custom Instructions
                {customInstructions?.response_style || customInstructions?.about_me ? (
                  <span className="ml-auto text-xs text-muted-foreground">Configured</span>
                ) : (
                  <span className="ml-auto text-xs text-muted-foreground">Not set</span>
                )}
              </Button>
            </div>

            <MemoryViewer
              memories={memories}
              onDelete={onDeleteMemory}
              isLoading={isLoading}
            />
          </div>
        </SheetContent>
      </Sheet>

      <CustomInstructionsModal
        open={instructionsOpen}
        onOpenChange={setInstructionsOpen}
        instructions={customInstructions}
        onSave={handleSaveInstructions}
        isSaving={isSaving}
      />
    </>
  );
}
