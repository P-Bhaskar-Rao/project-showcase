import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useToast } from '@/hooks/use-toast';
import axiosInstance from '@/api/axiosInstance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge'; 
import { Plus, X, ArrowLeft, Save, User, GraduationCap, Globe, Github, Linkedin, Twitter, Camera, Edit3, Sparkles, Award, Link2, Mail, Calendar, Building2, Upload } from 'lucide-react';
import Header from '@/components/Header';
import ImageUpload from '@/components/ImageUpload';
import { deleteImage } from '@/lib/supabase';
import { Profile as StoreProfile } from '@/store/useAuthStore';

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

interface ProfileFormData {
  name: string;
  bio: string;
  skills: string[];
  education: Education[];
  avatar: string;
  socialLinks: SocialLinks;
}

const API_URL = import.meta.env.VITE_API_URL;

function cleanProfileData(profile: StoreProfile) {
  return {
    ...profile,
    bio: profile.bio === "Add your bio here" ? "" : profile.bio,
    skills: Array.isArray(profile.skills)
      ? profile.skills.filter(skill => skill !== "Add your skills here")
      : [],
    education: Array.isArray(profile.education)
      ? profile.education.filter(
          edu =>
            edu.institution !== "Add your institution" &&
            edu.degree !== "Add your degree" &&
            edu.fieldOfStudy !== "Add your field of study"
        )
      : [],
    // Optionally clean socialLinks if you ever use placeholders there
  };
}

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const updateProfile = useAuthStore((state) => state.updateProfile);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [originalAvatar, setOriginalAvatar] = useState<string>('');
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    bio: '',
    skills: [''],
    education: [{
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startYear: new Date().getFullYear(),
      endYear: new Date().getFullYear()
    }],
    avatar: '',
    socialLinks: {
      github: '',
      linkedin: '',
      twitter: '',
      website: ''
    }
  });

  // Temporary state for new education entry
  const [newEducation, setNewEducation] = useState<Education>({
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startYear: new Date().getFullYear(),
    endYear: new Date().getFullYear()
  });

  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const loadProfile = async () => {
      setIsLoading(true);
      try {
        await fetchProfile();
      } catch (error) {
        console.error('Failed to load profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
    // Only run once when the component mounts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (profile) {
      const cleaned = cleanProfileData(profile);
      setFormData({
        name: cleaned.name || '',
        bio: cleaned.bio || '',
        skills: cleaned.skills && cleaned.skills.length > 0 ? cleaned.skills : [''],
        education: cleaned.education && cleaned.education.length > 0 ? cleaned.education : [{
          institution: '',
          degree: '',
          fieldOfStudy: '',
          startYear: new Date().getFullYear(),
          endYear: new Date().getFullYear()
        }],
        avatar: cleaned.avatar || '',
        socialLinks: {
          github: cleaned.socialLinks?.github || '',
          linkedin: cleaned.socialLinks?.linkedin || '',
          twitter: cleaned.socialLinks?.twitter || '',
          website: cleaned.socialLinks?.website || ''
        }
      });
      setOriginalAvatar(cleaned.avatar || '');
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (!formData.name.trim()) {
        toast({
          title: "Error",
          description: "Name is required.",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }
      const success = await updateProfile({
        name: formData.name,
        bio: formData.bio,
        skills: formData.skills.filter(skill => skill.trim() !== ''),
        education: formData.education.filter(edu =>
          edu.institution.trim() !== '' &&
          edu.degree.trim() !== '' &&
          edu.fieldOfStudy.trim() !== ''
        ),
        avatar: formData.avatar,
        socialLinks: formData.socialLinks
      });

      if (success) {
        // Delete old avatar if it was changed and old one exists
        if (originalAvatar && originalAvatar !== formData.avatar && originalAvatar.includes('supabase.co')) {
          try {
            await deleteImage(originalAvatar);
          } catch (error) {
            console.error('Failed to delete old avatar:', error);
          }
        }
        
        setOriginalAvatar(formData.avatar);
        toast({
          title: "Success",
          description: "Profile updated successfully!",
        });
        navigate('/');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const updateSkill = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => i === index ? value : skill)
    }));
  };

  const addEducation = () => {
    if (newEducation.institution.trim() && newEducation.degree.trim() && newEducation.fieldOfStudy.trim()) {
      setFormData(prev => ({
        ...prev,
        education: [...prev.education, { ...newEducation }]
      }));
      setNewEducation({
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startYear: new Date().getFullYear(),
        endYear: new Date().getFullYear()
      });
    }
  };

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const updateEducation = (index: number, field: keyof Education, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const updateNewEducation = (field: keyof Education, value: string | number) => {
    setNewEducation(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateSocialLink = (platform: keyof SocialLinks, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          isLoggedIn={!!user}
          onAuthModalOpen={() => {}}
          onSubmitProject={() => {}}
        />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        isLoggedIn={!!user}
        onAuthModalOpen={() => {}}
        onSubmitProject={() => {}}
      />

      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-6 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              Profile Settings
            </h1>
            <p className="text-gray-600 mt-1">Manage your professional profile information</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500 rounded-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                  <p className="text-sm text-gray-600">Your personal information and professional bio</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={user?.email || ''}
                    disabled
                    aria-label="Email address (cannot be modified)"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-500"
                  />
                  <p className="text-xs text-gray-500">Email address cannot be modified</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Professional Bio</label>
                <textarea
                  placeholder="Share your story, expertise, and what drives you professionally..."
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  maxLength={500}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors resize-none outline-none"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    {formData.bio.length}/500 characters
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Profile Picture
                </label>
                <div className="flex items-center gap-4">
                  {formData.avatar ? (
                    <img
                      src={formData.avatar}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover border-2 border-emerald-200"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-white" />
                    </div>
                  )}
                  <ImageUpload
                    value={formData.avatar}
                    onChange={(value) => setFormData(prev => ({ ...prev, avatar: value }))}
                    onError={(error) => {
                      toast({
                        title: "Upload Error",
                        description: error,
                        variant: "destructive",
                      });
                    }}
                    onImageChange={(oldUrl, newUrl) => {
                      if (oldUrl && oldUrl.includes('supabase.co')) {
                        setOriginalAvatar(oldUrl);
                      }
                    }}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500 rounded-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Skills & Expertise</h3>
                  <p className="text-sm text-gray-600">Showcase your technical skills and areas of expertise</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Skills Preview */}
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Skills:</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.filter(skill => skill.trim()).map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-sm flex items-center gap-2 group">
                      {skill}
                      <button
                        onClick={() => removeSkill(index)}
                        className="hover:bg-emerald-200 rounded-full p-0.5 transition-colors"
                        aria-label={`Remove skill ${skill}`}
                        title={`Remove ${skill}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <input
                  type="text"
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  placeholder="Add a new skill"
                  className="px-3 py-2 border border-emerald-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  onKeyDown={e => { if (e.key === 'Enter') addSkill(); }}
                />
                <button
                  onClick={addSkill}
                  className="flex items-center gap-2 px-4 py-2 border border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                  disabled={!newSkill.trim()}
                >
                  <Plus className="h-4 w-4" />
                  Add Skill
                </button>
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Education</h3>
                  <p className="text-sm text-gray-600">Your academic background and qualifications</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Education Display */}
              {formData.education.filter(edu => edu.institution.trim()).length > 0 && (
                <div className="space-y-4">
                  {formData.education.filter(edu => edu.institution.trim()).map((edu, index) => (
                    <div key={index} className="border-l-4 border-emerald-500 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                          </h4>
                          <p className="text-emerald-600 font-medium">{edu.institution}</p>
                          <p className="text-gray-500 text-sm">
                            {edu.startYear} - {edu.endYear}
                          </p>
                        </div>
                        <button
                          onClick={() => removeEducation(index)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                          aria-label={`Remove education ${edu.institution}`}
                          title={`Remove ${edu.institution}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Add Education Form */}
              <div className="border-t pt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Add Education</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Institution</label>
                    <input
                      type="text"
                      placeholder="University or College name"
                      value={newEducation.institution}
                      onChange={(e) => updateNewEducation('institution', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors outline-none"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addEducation();
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Degree</label>
                    <input
                      type="text"
                      placeholder="e.g., Bachelor's, Master's, PhD"
                      value={newEducation.degree}
                      onChange={(e) => updateNewEducation('degree', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Field of Study</label>
                    <input
                      type="text"
                      placeholder="e.g., Computer Science, Engineering"
                      value={newEducation.fieldOfStudy}
                      onChange={(e) => updateNewEducation('fieldOfStudy', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Start Year</label>
                      <input
                        type="number"
                        min="1900"
                        max={new Date().getFullYear() + 10}
                        placeholder="2018"
                        value={newEducation.startYear}
                        onChange={(e) => updateNewEducation('startYear', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">End Year</label>
                      <input
                        type="number"
                        min="1900"
                        max={new Date().getFullYear() + 10}
                        placeholder="2022"
                        value={newEducation.endYear}
                        onChange={(e) => updateNewEducation('endYear', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors outline-none"
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={addEducation}
                  className="mt-4 flex items-center gap-2 px-4 py-2 border border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Education
                </button>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500 rounded-lg">
                  <Link2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Social & Professional Links</h3>
                  <p className="text-sm text-gray-600">Connect your social media and professional profiles</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    GitHub
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/username"
                    value={formData.socialLinks.github}
                    onChange={(e) => updateSocialLink('github', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    value={formData.socialLinks.linkedin}
                    onChange={(e) => updateSocialLink('linkedin', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Twitter className="h-4 w-4" />
                    Twitter
                  </label>
                  <input
                    type="url"
                    placeholder="https://twitter.com/username"
                    value={formData.socialLinks.twitter}
                    onChange={(e) => updateSocialLink('twitter', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Personal Website
                  </label>
                  <input
                    type="url"
                    placeholder="https://yourwebsite.com"
                    value={formData.socialLinks.website}
                    onChange={(e) => updateSocialLink('website', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-center pt-6">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2 inline-block" />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 