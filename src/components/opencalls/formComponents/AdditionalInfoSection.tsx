
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";

interface AdditionalInfoSectionProps {
  additionalNotes: string;
  email: string;
  portfolioUrl: string;
  onAdditionalNotesChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPortfolioUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AdditionalInfoSection = ({
  additionalNotes,
  email,
  portfolioUrl,
  onAdditionalNotesChange,
  onEmailChange,
  onPortfolioUrlChange
}: AdditionalInfoSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Additional Information</CardTitle>
        <CardDescription>
          Provide any extra details or links
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="additional_notes">Additional Notes</Label>
          <Textarea
            id="additional_notes"
            placeholder="Anything else you'd like to share?"
            rows={3}
            value={additionalNotes}
            onChange={onAdditionalNotesChange}
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            placeholder="Your email address"
            value={email}
            onChange={onEmailChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="portfolio_url">Portfolio URL</Label>
          <Input
            type="url"
            id="portfolio_url"
            placeholder="Link to your online portfolio"
            value={portfolioUrl}
            onChange={onPortfolioUrlChange}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AdditionalInfoSection;
