
import React from 'react';
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  onSaveDraft: () => void;
  isSaving: boolean;
  isSubmitting: boolean;
  lastSaved: Date | null;
}

const FormActions = ({
  onSaveDraft,
  isSaving,
  isSubmitting,
  lastSaved
}: FormActionsProps) => {
  return (
    <div className="flex justify-between">
      <Button variant="outline" type="button" onClick={onSaveDraft} disabled={isSaving || isSubmitting}>
        {isSaving ? 'Saving...' : 'Save Draft'}
      </Button>
      <div>
        {lastSaved && (
          <p className="text-sm text-muted-foreground italic mr-4 inline-block">
            Last saved: {lastSaved.toLocaleTimeString()}
          </p>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </Button>
      </div>
    </div>
  );
};

export default FormActions;
