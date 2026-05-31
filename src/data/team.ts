export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
}

// Fallback team members matching the actual team (Dilip, Viraj, Karan Parihar)
export const teamMembers: TeamMember[] = [
  { id: "1", name: "Dilip Parihar", role: "Founder & Lead Electrician", bio: "Founded ElectrooBuddy in 1992. Over 30 years of experience in electrical services." },
  { id: "2", name: "Viraj Parihar", role: "Director & Senior Technician", bio: "Specializes in advanced electrical systems and team management." },
  { id: "3", name: "Karan Parihar", role: "Operations Manager", bio: "Coordinates service operations and ensures quality customer experiences." },
];
