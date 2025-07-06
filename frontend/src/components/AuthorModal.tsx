import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Mail, GraduationCap, Globe, Github, Linkedin, Twitter, Calendar, Building2, Award } from "lucide-react";

interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear: number;
}

interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
}

interface Author {
  _id: string;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  skills?: string[];
  education?: Education[];
  socialLinks?: SocialLinks;
  createdAt?: string;
  isVerified?: boolean;
}

interface AuthorModalProps {
  isOpen: boolean;
  onClose: () => void;
  author: Author | null;
}

const AuthorModal = ({ isOpen, onClose, author }: AuthorModalProps) => {
  if (!author) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Get the latest education (highest endYear)
  const getLatestEducation = () => {
    if (!author.education || author.education.length === 0) return null;
    
    const validEducation = author.education.filter(edu => 
      edu.institution && edu.institution !== "Add your institution" && edu.institution.trim() !== ""
    );
    
    if (validEducation.length === 0) return null;
    
    return validEducation.reduce((latest, current) => 
      current.endYear > latest.endYear ? current : latest
    );
  };

  const latestEducation = getLatestEducation();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-4">
            {author.avatar ? (
              <img
                src={author.avatar}
                alt={author.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-emerald-200"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                {getInitials(author.name)}
              </div>
            )}
            <div>
              <h3 className="text-xl font-semibold">{author.name}</h3>
              <p className="text-gray-500 text-sm">Developer</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Bio */}
          {author.bio && author.bio !== "Add your bio here" && author.bio.trim() !== "" && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">About</h4>
              <p className="text-gray-600 leading-relaxed">{author.bio}</p>
            </div>
          )}

          {/* Contact Info */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Contact Information</h4>
            <div className="space-y-2">
              {author.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{author.email}</span>
                </div>
              )}
              {author.createdAt && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatDate(author.createdAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Latest Education */}
          {latestEducation && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Education</h4>
              <div className="border-l-4 border-emerald-500 pl-4 py-2">
                <h5 className="font-medium text-gray-900">
                  {latestEducation.degree} {latestEducation.fieldOfStudy && `in ${latestEducation.fieldOfStudy}`}
                </h5>
                <p className="text-emerald-600 text-sm font-medium">{latestEducation.institution}</p>
                <p className="text-gray-500 text-sm">
                  {latestEducation.startYear} - {latestEducation.endYear}
                </p>
              </div>
            </div>
          )}

          {/* Skills */}
          {author.skills && author.skills.length > 0 && author.skills.some(skill => 
            skill && skill !== "Add your skills here" && skill.trim() !== ""
          ) && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Skills & Expertise</h4>
              <div className="flex flex-wrap gap-2">
                {author.skills
                  .filter(skill => skill && skill !== "Add your skills here" && skill.trim() !== "")
                  .map((skill, index) => (
                    <Badge key={index} variant="secondary" className="bg-emerald-100 text-emerald-800">
                      {skill}
                    </Badge>
                  ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          {author.socialLinks && Object.values(author.socialLinks).some(link => link && link.trim() !== "") && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Social & Professional Links</h4>
              <div className="flex flex-wrap gap-2">
                {author.socialLinks.github && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={author.socialLinks.github} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </a>
                  </Button>
                )}
                {author.socialLinks.linkedin && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={author.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn
                    </a>
                  </Button>
                )}
                {author.socialLinks.twitter && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={author.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                      <Twitter className="h-4 w-4 mr-2" />
                      Twitter
                    </a>
                  </Button>
                )}
                {author.socialLinks.website && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={author.socialLinks.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4 mr-2" />
                      Website
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthorModal;
