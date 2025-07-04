
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap, Plus, X } from "lucide-react";

interface Education {
  degree: string;
  institution: string;
  year: string;
}

interface EducationSectionProps {
  education: Education[];
  editedEducation: Education[];
  isEditing: boolean;
  newEducation: Education;
  setNewEducation: (education: Education) => void;
  onAddEducation: () => void;
  onRemoveEducation: (index: number) => void;
}

const EducationSection = ({ 
  education, 
  editedEducation, 
  isEditing, 
  newEducation, 
  setNewEducation, 
  onAddEducation, 
  onRemoveEducation 
}: EducationSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Education
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {(isEditing ? editedEducation : education).map((edu, index) => (
            <div key={index} className="flex items-start justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm sm:text-base">{edu.degree}</h4>
                <p className="text-gray-600 text-sm">{edu.institution}</p>
                <p className="text-xs sm:text-sm text-gray-500">{edu.year}</p>
              </div>
              {isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveEducation(index)}
                  className="text-red-600 hover:text-red-800 flex-shrink-0 ml-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          
          {isEditing && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <Input
                  placeholder="Degree"
                  value={newEducation.degree}
                  onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                />
                <Input
                  placeholder="Institution"
                  value={newEducation.institution}
                  onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                />
                <Input
                  placeholder="Year"
                  value={newEducation.year}
                  onChange={(e) => setNewEducation({ ...newEducation, year: e.target.value })}
                />
              </div>
              <Button onClick={onAddEducation} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Education
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EducationSection;
