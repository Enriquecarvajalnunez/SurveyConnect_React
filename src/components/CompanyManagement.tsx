import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ArrowLeft, Plus, Building2, Users, Calendar, LogOut, Edit, Trash2 } from 'lucide-react';
import type { User, Company } from '../App';
import { getEmpresas, createEmpresa, updateEmpresa, deleteEmpresa, getUsuarios } from '../lib/api';
import { toast } from 'sonner@2.0.3';

type CompanyManagementProps = {
  user: User;
  onBack: () => void;
  onLogout: () => void;
};

export function CompanyManagement({ user, onBack, onLogout }: CompanyManagementProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [nombre, setNombre] = useState('');
  const [nit, setNit] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [empresasData, usuariosData] = await Promise.all([
        getEmpresas(),
        getUsuarios(),
      ]);
      setCompanies(empresasData);
      setUsuarios(usuariosData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const getUsersByCompany = (empresaID: number) => {
    return usuarios.filter(u => u.empresaID === empresaID);
  };

  const handleOpenDialog = (company?: Company) => {
    if (company) {
      setEditingCompany(company);
      setNombre(company.nombre);
      setNit(company.nit);
    } else {
      setEditingCompany(null);
      setNombre('');
      setNit('');
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCompany(null);
    setNombre('');
    setNit('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim() || !nit.trim()) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      if (editingCompany) {
        // Update existing company
        await updateEmpresa(editingCompany.empresaID, nombre, nit);
        toast.success('Empresa actualizada exitosamente');
      } else {
        // Create new company
        await createEmpresa(nombre, nit);
        toast.success('Empresa creada exitosamente');
      }

      await loadData();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving empresa:', error);
      toast.error(error instanceof Error ? error.message : 'Error al guardar empresa');
    }
  };

  const handleDelete = async (empresaID: number) => {
    const usersCount = getUsersByCompany(empresaID).length;
    
    if (usersCount > 0) {
      toast.error(`No se puede eliminar. La empresa tiene ${usersCount} usuario(s) asociado(s)`);
      return;
    }

    try {
      await deleteEmpresa(empresaID);
      toast.success('Empresa eliminada exitosamente');
      await loadData();
    } catch (error) {
      console.error('Error deleting empresa:', error);
      toast.error(error instanceof Error ? error.message : 'Error al eliminar empresa');
    }
  };

  // Only Admin can manage companies
  if (user.rol !== 'Admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle>Acceso Denegado</CardTitle>
            <CardDescription>
              Solo los administradores pueden gestionar empresas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack}>Volver al Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

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
                <div className="p-2 bg-indigo-600 rounded-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1>Gestión de Empresas</h1>
                  <p className="text-sm text-gray-600">Administra las empresas del sistema</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleOpenDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Empresa
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleSubmit}>
                    <DialogHeader>
                      <DialogTitle>
                        {editingCompany ? 'Editar Empresa' : 'Nueva Empresa'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingCompany 
                          ? 'Actualiza la información de la empresa' 
                          : 'Ingresa los datos de la nueva empresa'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre de la Empresa</Label>
                        <Input
                          id="nombre"
                          placeholder="Ej: TechCorp Solutions"
                          value={nombre}
                          onChange={(e) => setNombre(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nit">NIT</Label>
                        <Input
                          id="nit"
                          placeholder="Ej: 900123456-7"
                          value={nit}
                          onChange={(e) => setNit(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={handleCloseDialog}>
                        Cancelar
                      </Button>
                      <Button type="submit">
                        {editingCompany ? 'Actualizar' : 'Crear Empresa'}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Empresas</CardTitle>
              <Building2 className="w-4 h-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{companies.length}</div>
              <p className="text-xs text-gray-600 mt-1">Empresas registradas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Usuarios</CardTitle>
              <Users className="w-4 h-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">
                {companies.reduce((acc, c) => acc + getUsersByCompany(c.empresaID).length, 0)}
              </div>
              <p className="text-xs text-gray-600 mt-1">Usuarios en todas las empresas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Promedio Usuarios</CardTitle>
              <Users className="w-4 h-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">
                {companies.length > 0 
                  ? (companies.reduce((acc, c) => acc + getUsersByCompany(c.empresaID).length, 0) / companies.length).toFixed(1)
                  : 0}
              </div>
              <p className="text-xs text-gray-600 mt-1">Por empresa</p>
            </CardContent>
          </Card>
        </div>

        {/* Companies List */}
        <div>
          <h2 className="mb-4">Empresas Registradas</h2>
          <div className="space-y-4">
            {companies.map((company) => {
              const usersCount = getUsersByCompany(company.empresaID).length;
              
              return (
                <Card key={company.empresaID}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Building2 className="w-5 h-5 text-indigo-600" />
                          <CardTitle>{company.nombre}</CardTitle>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">NIT:</span> {company.nit}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>Registrado: {new Date(company.fechaRegistro).toLocaleDateString('es-ES')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{usersCount} usuario{usersCount !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(company)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(company.empresaID)}
                          disabled={usersCount > 0}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}