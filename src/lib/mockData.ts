import type { Company, User } from '../App';

// Mock Companies Database
export const MOCK_COMPANIES: Company[] = [
  {
    empresaID: 1,
    nombre: 'TechCorp Solutions',
    nit: '900123456-7',
    fechaRegistro: '2024-01-15T10:00:00',
  },
  {
    empresaID: 2,
    nombre: 'Innovatech Group',
    nit: '900234567-8',
    fechaRegistro: '2024-03-20T14:30:00',
  },
  {
    empresaID: 3,
    nombre: 'Global Services S.A.',
    nit: '900345678-9',
    fechaRegistro: '2024-06-10T09:15:00',
  },
];

// Mock Users Database
export const MOCK_USERS: User[] = [
  {
    usuarioID: 1,
    empresaID: 1,
    empresaNombre: 'TechCorp Solutions',
    email: 'admin@empresa.com',
    nombre: 'Carlos',
    apellido: 'Rodríguez',
    rol: 'Admin',
    estado: 'Activo',
  },
  {
    usuarioID: 2,
    empresaID: 1,
    empresaNombre: 'TechCorp Solutions',
    email: 'creador@empresa.com',
    nombre: 'María',
    apellido: 'González',
    rol: 'Creador',
    estado: 'Activo',
  },
  {
    usuarioID: 3,
    empresaID: 1,
    empresaNombre: 'TechCorp Solutions',
    email: 'analista@empresa.com',
    nombre: 'Juan',
    apellido: 'Martínez',
    rol: 'Analista',
    estado: 'Activo',
  },
  {
    usuarioID: 4,
    empresaID: 2,
    empresaNombre: 'Innovatech Group',
    email: 'admin@innovatech.com',
    nombre: 'Laura',
    apellido: 'Pérez',
    rol: 'Admin',
    estado: 'Activo',
  },
  {
    usuarioID: 5,
    empresaID: 2,
    empresaNombre: 'Innovatech Group',
    email: 'creador@innovatech.com',
    nombre: 'David',
    apellido: 'Sánchez',
    rol: 'Creador',
    estado: 'Activo',
  },
  {
    usuarioID: 6,
    empresaID: 3,
    empresaNombre: 'Global Services S.A.',
    email: 'admin@globalservices.com',
    nombre: 'Ana',
    apellido: 'Torres',
    rol: 'Admin',
    estado: 'Inactivo',
  },
];

// Helper functions
export function getCompanyById(empresaID: number): Company | undefined {
  return MOCK_COMPANIES.find(c => c.empresaID === empresaID);
}

export function getUsersByCompany(empresaID: number): User[] {
  return MOCK_USERS.filter(u => u.empresaID === empresaID);
}

export function getCompanyName(empresaID: number): string {
  const company = getCompanyById(empresaID);
  return company?.nombre || 'Empresa Desconocida';
}
