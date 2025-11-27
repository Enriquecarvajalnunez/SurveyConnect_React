import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, Plus, UserPlus, Building2, Mail, LogOut, Edit, Shield } from 'lucide-react';
import type { User, Company } from '../App';
import { getEmpresas, getUsuarios, createUsuario, updateUsuario } from '../lib/api';
import { toast } from 'sonner@2.0.3';

type UserManagementProps = {
  user: User;
  onBack: () => void;
  onLogout: () => void;
};

export function UserManagement({ user, onBack, onLogout }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [filterEmpresa, setFilterEmpresa] = useState<number | 'all'>('all');
  const [filterEstado, setFilterEstado] = useState<'all' | 'Activo' | 'Inactivo'>('all');
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [empresaID, setEmpresaID] = useState<number>(user.empresaID);
  const [rol, setRol] = useState<'Admin' | 'Creador' | 'Analista'>('Creador');
  const [estado, setEstado] = useState<'Activo' | 'Inactivo'>('Activo');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usuariosData, empresasData] = await Promise.all([
        getUsuarios(),
        getEmpresas(),
      ]);
      setUsers(usuariosData);
      setCompanies(empresasData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const getCompanyName = (empresaID: number): string => {
    const company = companies.find(c => c.empresaID === empresaID);
    return company?.nombre || 'Empresa Desconocida';
  };

  const handleOpenDialog = (userToEdit?: User) => {
    if (userToEdit) {
      setEditingUser(userToEdit);
      setNombre(userToEdit.nombre);
      setApellido(userToEdit.apellido);
      setEmail(userToEdit.email);
      setEmpresaID(userToEdit.empresaID);
      setRol(userToEdit.rol);
      setEstado(userToEdit.estado);
    } else {
      setEditingUser(null);
      setNombre('');
      setApellido('');
      setEmail('');
      setEmpresaID(user.empresaID);
      setRol('Creador');
      setEstado('Activo');
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
    setNombre('');
    setApellido('');
    setEmail('');
    setEmpresaID(user.empresaID);
    setRol('Creador');
    setEstado('Activo');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim() || !apellido.trim() || !email.trim()) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Por favor ingresa un email válido');
      return;
    }

    // Check if email already exists (except for the user being edited)
    const emailExists = users.some(u => 
      u.email === email && u.usuarioID !== editingUser?.usuarioID
    );
    if (emailExists) {
      toast.error('Este email ya está registrado');
      return;
    }

    try {
      if (editingUser) {
        // Update existing user
        await updateUsuario(editingUser.usuarioID, empresaID, email, nombre, apellido, rol, estado);
        toast.success('Usuario actualizado exitosamente');
      } else {
        // Create new user
        await createUsuario(empresaID, email, nombre, apellido, rol, estado, password);
        toast.success('Usuario creado exitosamente. Contraseña temporal: demo123');
      }

      await loadData();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving usuario:', error);
      toast.error(error instanceof Error ? error.message : 'Error al guardar usuario');
    }
  };

  // Filter users based on role and selections
  const filteredUsers = users.filter(u => {
    // Admins can see all users, others only see users from their company
    if (user.rol !== 'Admin' && u.empresaID !== user.empresaID) {
      return false;
    }

    const matchesEmpresa = filterEmpresa === 'all' || u.empresaID === filterEmpresa;
    const matchesEstado = filterEstado === 'all' || u.estado === filterEstado;

    return matchesEmpresa && matchesEstado;
  });

  // Get statistics
  const stats = {
    total: filteredUsers.length,
    activos: filteredUsers.filter(u => u.estado === 'Activo').length,
    admins: filteredUsers.filter(u => u.rol === 'Admin').length,
    creadores: filteredUsers.filter(u => u.rol === 'Creador').length,
    analistas: filteredUsers.filter(u => u.rol === 'Analista').length,
  };

  // Only Admin can manage users from other companies
  const canManageAllCompanies = user.rol === 'Admin';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-600 rounded-lg">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1>Gestión de Usuarios</h1>
                  <p className="text-sm text-gray-600">Administra los usuarios del sistema</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleOpenDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Usuario
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <form onSubmit={handleSubmit}>
                    <DialogHeader>
                      <DialogTitle>
                        {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingUser 
                          ? 'Actualiza la información del usuario' 
                          : 'Ingresa los datos del nuevo usuario'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre</Label>
                        <Input
                          id="nombre"
                          placeholder="Nombre"
                          value={nombre}
                          onChange={(e) => setNombre(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="apellido">Apellido</Label>
                        <Input
                          id="apellido"
                          placeholder="Apellido"
                          value={apellido}
                          onChange={(e) => setApellido(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="email">Correo Electrónico</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="usuario@empresa.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                        <div className="space-y-2 col-span-2">
                          <Label htmlFor="password">Contraseña</Label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="Ingresa una contraseña segura"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required={!editingUser} 
                          />
                          {!editingUser && (
                            <p className="text-xs text-gray-500">
                              La contraseña será encriptada automáticamente.
                            </p>
                          )}
                        </div>                        
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="empresa">Empresa</Label>
                        <Select
                          value={empresaID.toString()}
                          onValueChange={(value) => setEmpresaID(parseInt(value))}
                          disabled={!canManageAllCompanies}
                        >
                          <SelectTrigger id="empresa">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {companies.map((company) => (
                              <SelectItem key={company.empresaID} value={company.empresaID.toString()}>
                                {company.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {!canManageAllCompanies && (
                          <p className="text-xs text-gray-500">
                            Solo puedes crear usuarios para tu empresa
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rol">Rol</Label>
                        <Select
                          value={rol}
                          onValueChange={(value: 'Admin' | 'Creador' | 'Analista') => setRol(value)}
                        >
                          <SelectTrigger id="rol">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="Creador">Creador</SelectItem>
                            <SelectItem value="Analista">Analista</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="estado">Estado</Label>
                        <Select
                          value={estado}
                          onValueChange={(value: 'Activo' | 'Inactivo') => setEstado(value)}
                        >
                          <SelectTrigger id="estado">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Activo">Activo</SelectItem>
                            <SelectItem value="Inactivo">Inactivo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={handleCloseDialog}>
                        Cancelar
                      </Button>
                      <Button type="submit">
                        {editingUser ? 'Actualizar' : 'Crear Usuario'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              <Button variant="outline" onClick={onLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-green-600">{stats.activos}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats.admins}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Creadores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats.creadores}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Analistas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats.analistas}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          {canManageAllCompanies && (
            <Select
              value={filterEmpresa.toString()}
              onValueChange={(value) => setFilterEmpresa(value === 'all' ? 'all' : parseInt(value))}
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Todas las empresas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las empresas</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.empresaID} value={company.empresaID.toString()}>
                    {company.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select
            value={filterEstado}
            onValueChange={(value: 'all' | 'Activo' | 'Inactivo') => setFilterEstado(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="Activo">Activos</SelectItem>
              <SelectItem value="Inactivo">Inactivos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users List */}
        <div>
          <h2 className="mb-4">Usuarios Registrados</h2>
          <div className="space-y-3">
            {filteredUsers.map((u) => (
              <Card key={u.usuarioID}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-3 bg-gray-100 rounded-full">
                        <UserPlus className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{u.nombre} {u.apellido}</p>
                          <Badge variant={u.estado === 'Activo' ? 'default' : 'secondary'}>
                            {u.estado}
                          </Badge>
                          <Badge variant="outline">
                            <Shield className="w-3 h-3 mr-1" />
                            {u.rol}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            <span>{u.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            <span>{u.empresaNombre || getCompanyName(u.empresaID)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(u)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}