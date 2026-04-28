import { authors, type Author } from "@/lib/mock-data";

export interface AdminUser {
  name: string;
  email: string;
  avatar: string;
  role: "admin" | "usuario";
  joined: string;
  lastActive: string;
  comments: number;
  threads: number;
}

const adminUsers: AdminUser[] = [
  {
    name: "Martín Velázquez",
    email: "martin@velazquezyasociados.com",
    avatar: "MV",
    role: "admin",
    joined: "Enero 2024",
    lastActive: "Hace 5 minutos",
    comments: 12,
    threads: 0,
  },
  {
    name: "Carolina Méndez",
    email: "carolina@velazquezyasociados.com",
    avatar: "CM",
    role: "admin",
    joined: "Febrero 2024",
    lastActive: "Hace 1 hora",
    comments: 8,
    threads: 0,
  },
  {
    name: "Laura Giménez",
    email: "laura.g@email.com",
    avatar: "LG",
    role: "usuario",
    joined: "Marzo 2026",
    lastActive: "Hoy",
    comments: 3,
    threads: 2,
  },
  {
    name: "Federico Ruiz",
    email: "fruiz@empresa.com",
    avatar: "FR",
    role: "usuario",
    joined: "Marzo 2026",
    lastActive: "Ayer",
    comments: 1,
    threads: 1,
  },
  {
    name: "Ana Rosales",
    email: "ana.r@email.com",
    avatar: "AR",
    role: "usuario",
    joined: "Abril 2026",
    lastActive: "Hace 3 días",
    comments: 1,
    threads: 1,
  },
  {
    name: "Gonzalo Ortega",
    email: "gortega@mail.com",
    avatar: "GO",
    role: "usuario",
    joined: "Abril 2026",
    lastActive: "Hace 5 días",
    comments: 1,
    threads: 1,
  },
  {
    name: "Silvia Pacheco",
    email: "silvia.p@correo.com",
    avatar: "SP",
    role: "usuario",
    joined: "Abril 2026",
    lastActive: "Hoy",
    comments: 1,
    threads: 1,
  },
  {
    name: "Diego Martínez",
    email: "diego.m@email.com",
    avatar: "DM",
    role: "usuario",
    joined: "Abril 2026",
    lastActive: "Hace 2 días",
    comments: 1,
    threads: 1,
  },
];

export async function getAllUsersAdmin(): Promise<AdminUser[]> {
  return adminUsers;
}

export async function getTeamMembers(): Promise<Author[]> {
  return authors;
}
