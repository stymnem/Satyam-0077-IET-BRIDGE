// Auth Types
export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'Alumni' | 'Admin';
  phone?: string;
  profilePic?: string;
  bio?: string;
  batchYear?: number;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  fullName: string;
  email: string;
  password: string;
  role: 'Alumni' | 'Admin';
}

export interface UpdateProfileDto {
  fullName: string;
  phone?: string;
  profilePic?: string;
  bio?: string;
  batchYear?: number;
}

// Education Types
export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  grade?: string;
  description?: string;
}

export interface EducationDto {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  grade?: string;
  description?: string;
}

// Professional Experience Types
export interface ProfessionalExperience {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description?: string;
  isCurrentJob: boolean;
}

export interface ProfessionalExperienceDto {
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description?: string;
  isCurrentJob: boolean;
}

// Event Types
export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  maxAttendees?: number;
  currentAttendees: number;
  imageUrl?: string;
}

export interface RsvpDto {
  eventId: string;
}

export interface Rsvp {
  id: string;
  eventId: string;
  userId: string;
  createdAt: string;
  event: Event;
}

// Message Types
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  sentAt: string;
  isRead: boolean;
  senderName: string;
  receiverName: string;
}

export interface MessageDto {
  receiverId: string;
  content: string;
}

// Job Posting Types
export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string;
  salaryRange?: string;
  jobType: string;
  postedDate: string;
  applicationDeadline?: string;
  contactEmail: string;
}

// Announcement Types
export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  authorName: string;
  isImportant: boolean;
}