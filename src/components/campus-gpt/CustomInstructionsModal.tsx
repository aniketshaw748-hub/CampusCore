import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Settings2 } from 'lucide-react';

interface CustomInstructions {
  response_style: string | null;
  about_me: string | null;
}

interface CustomInstructionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instructions: CustomInstructions | null;
  onSave: (instructions: { response_style: string; about_me: string }) => Promise<void>;
  isSaving?: boolean;
}

export function CustomInstructionsModal({
  open,
  onOpenChange,
  instructions,
  onSave,
  isSaving,
}: CustomInstructionsModalProps) {
  const [responseStyle, setResponseStyle] = useState('');
  const [aboutMe, setAboutMe] = useState('');

  useEffect(() => {
    if (instructions) {
      setResponseStyle(instructions.response_style || '');
      setAboutMe(instructions.about_me || '');
    }
  }, [instructions]);

  const handleSave = async () => {
    await onSave({
      response_style: responseStyle,
      about_me: aboutMe,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5" />
            Custom Instructions
          </DialogTitle>
          <DialogDescription>
            These instructions will be used in every conversation with CampusGPT
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label htmlFor="about-me" className="text-base font-medium">
              What would you like CampusGPT to know about you?
            </Label>
            <p className="text-sm text-muted-foreground">
              Share your background, goals, weaknesses, or anything that helps CampusGPT assist you better.
            </p>
            <Textarea
              id="about-me"
              placeholder="Examples:&#10;• I'm a 3rd year CS student preparing for placements&#10;• I struggle with dynamic programming and OS concepts&#10;• I learn better with visual examples and code snippets&#10;• I'm preparing for GATE alongside semester exams"
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={1500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {aboutMe.length}/1500
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="response-style" className="text-base font-medium">
              How would you like CampusGPT to respond?
            </Label>
            <p className="text-sm text-muted-foreground">
              Specify your preferred tone, depth, format, or focus areas.
            </p>
            <Textarea
              id="response-style"
              placeholder="Examples:&#10;• Keep explanations concise and to the point&#10;• Always include code examples when explaining programming concepts&#10;• Focus on exam-relevant content and previous year questions&#10;• Use simple language, avoid jargon&#10;• Relate concepts to real-world applications"
              value={responseStyle}
              onChange={(e) => setResponseStyle(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={1500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {responseStyle.length}/1500
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Instructions'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
