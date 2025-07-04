
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";

interface SkillsSectionProps {
  skills: string[];
  editedSkills: string[];
  setEditedSkills: (skills: string[]) => void;
  isEditing: boolean;
  newSkill: string;
  setNewSkill: (skill: string) => void;
  onAddSkill: () => void;
  onRemoveSkill: (skill: string) => void;
}

const SkillsSection = ({ 
  skills, 
  editedSkills, 
  isEditing, 
  newSkill, 
  setNewSkill, 
  onAddSkill, 
  onRemoveSkill 
}: SkillsSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {(isEditing ? editedSkills : skills).map((skill) => (
            <div key={skill} className="flex items-center gap-1">
              <Badge variant="secondary" className="text-xs sm:text-sm">{skill}</Badge>
              {isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveSkill(skill)}
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
        
        {isEditing && (
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Add a skill"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onAddSkill()}
              className="flex-1"
            />
            <Button onClick={onAddSkill} size="sm" className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SkillsSection;
