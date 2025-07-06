import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Mail, School, MapPin, Calendar, Github, Linkedin } from "lucide-react";

interface Author {
  name: string;
  email: string;
  college: string;
  location: string;
  joinDate: string;
  bio: string;
  skills: string[];
  github?: string;
  linkedin?: string;
  avatar?: string;
}

interface AuthorModalProps {
  isOpen: boolean;
  onClose: () => void;
  author: Author | null;
}

const AuthorModal = ({ isOpen, onClose, author }: AuthorModalProps) => {
  if (!author) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              {author.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="text-xl font-semibold">{author.name}</h3>
              <p className="text-gray-500 text-sm">Intern Developer</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Bio */}
          {author.bio && author.bio !== "Add your bio here" && (
            <div>
              <p className="text-gray-600 leading-relaxed">{author.bio}</p>
            </div>
          )}

          {/* Contact Info */}
          {(author.email || (author.college && author.college !== "") || (author.location && author.location !== "") || (author.joinDate && author.joinDate !== "")) && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Contact Information</h4>
              <div className="space-y-2">
                {author.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{author.email}</span>
                  </div>
                )}
                {author.college && author.college !== "" && author.college !== "Add your college here" && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <School className="h-4 w-4" />
                    <span>{author.college}</span>
                  </div>
                )}
                {author.location && author.location !== "" && author.location !== "Add your location here" && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{author.location}</span>
                  </div>
                )}
                {author.joinDate && author.joinDate !== "" && author.joinDate !== "Add your join date here" && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {author.joinDate}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Skills */}
          {author.skills && author.skills.length > 0 && !author.skills.includes("Add your skills here") && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {author.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="bg-emerald-100 text-emerald-800">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          <div className="flex gap-2">
            {author.github && (
              <Button variant="outline" size="sm" asChild>
                <a href={author.github} target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </a>
              </Button>
            )}
            {author.linkedin && (
              <Button variant="outline" size="sm" asChild>
                <a href={author.linkedin} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn
                </a>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthorModal;
