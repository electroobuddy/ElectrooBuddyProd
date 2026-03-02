export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
}

export const teamMembers: TeamMember[] = [
  { id: "1", name: "Rajesh Kumar", role: "Master Electrician", bio: "15+ years of experience in residential and commercial electrical systems." },
  { id: "2", name: "Amit Sharma", role: "Lead Technician", bio: "Specializes in smart home installations and modern wiring solutions." },
  { id: "3", name: "Priya Patel", role: "Safety Inspector", bio: "Certified electrical safety auditor with expertise in code compliance." },
  { id: "4", name: "Vikram Singh", role: "Project Manager", bio: "Coordinates large-scale electrical projects with precision and efficiency." },
];
