
import React from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";

interface ArtistStatementSectionProps {
  artistStatement: string;
  onArtistStatementChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const ArtistStatementSection = ({
  artistStatement,
  onArtistStatementChange
}: ArtistStatementSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Artist Statement</CardTitle>
        <CardDescription>
          Share your perspective and artistic vision
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="artist_statement">Statement</Label>
          <Textarea
            id="artist_statement"
            placeholder="Share your thoughts and artistic vision"
            rows={5}
            value={artistStatement}
            onChange={onArtistStatementChange}
            required
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ArtistStatementSection;
