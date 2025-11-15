import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ClipboardList, PlusCircle, List, BarChart3, Users, LogOut, FileText } from 'lucide-react';
import type { User } from '../App';
import { Badge } from './ui/badge';
import { Building2, UserCog } from 'lucide-react';


type DashboardProps = {
  user: User;
  onLogout: () => void;
  onCreateSurvey: () => void;
  onViewSurveys: () => void;
  onViewCompanies: () => void;
  onViewUsers: () => void;
};

export function Dashboard({ user, onLogout, onCreateSurvey, onViewSurveys, onViewCompanies, onViewUsers }: DashboardProps) {
  // Mock statistics
  const stats = {
    totalEncuestas: 12,
    encuestasActivas: 5,
    respuestasRecibidas: 347,
    tasaRespuesta: 68,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1>Sistema de Encuestas</h1>
                <p className="text-sm text-gray-600">Gestión y análisis de encuestas</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm">{user.nombre} {user.apellido}</p>
                <Badge variant="secondary">{user.rol}</Badge>
              </div>
              <Button variant="outline" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2>Bienvenido, {user.nombre}</h2>
          <p className="text-gray-600 mt-1">Aquí puedes gestionar tus encuestas y analizar resultados</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Encuestas</CardTitle>
              <FileText className="w-4 h-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats.totalEncuestas}</div>
              <p className="text-xs text-gray-600 mt-1">Todas las encuestas creadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Encuestas Activas</CardTitle>
              <ClipboardList className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats.encuestasActivas}</div>
              <p className="text-xs text-gray-600 mt-1">Actualmente publicadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Respuestas Recibidas</CardTitle>
              <Users className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats.respuestasRecibidas}</div>
              <p className="text-xs text-gray-600 mt-1">Total de respuestas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Tasa de Respuesta</CardTitle>
              <BarChart3 className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats.tasaRespuesta}%</div>
              <p className="text-xs text-gray-600 mt-1">Promedio de participación</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onCreateSurvey}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <PlusCircle className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle>Crear Nueva Encuesta</CardTitle>
                    <CardDescription>Diseña y publica una nueva encuesta</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onViewSurveys}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <List className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle>Ver Todas las Encuestas</CardTitle>
                    <CardDescription>Administra y analiza tus encuestas</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {user.rol === 'Admin' && (
              <>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onViewCompanies}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <Building2 className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle>Gestión de Empresas</CardTitle>
                        <CardDescription>Administra las empresas del sistema</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onViewUsers}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-orange-100 rounded-lg">
                        <UserCog className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <CardTitle>Gestión de Usuarios</CardTitle>
                        <CardDescription>Administra usuarios y permisos</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Recent Surveys Preview */}
        <div className="mt-8">
          <h3 className="mb-4">Encuestas Recientes</h3>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[
                  { titulo: 'Encuesta de Satisfacción Laboral 2025', estado: 'Publicada', respuestas: 45 },
                  { titulo: 'Evaluación de Capacitación', estado: 'Publicada', respuestas: 32 },
                  { titulo: 'Clima Organizacional Q1', estado: 'Borrador', respuestas: 0 },
                ].map((encuesta, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p>{encuesta.titulo}</p>
                      <p className="text-sm text-gray-600 mt-1">{encuesta.respuestas} respuestas</p>
                    </div>
                    <Badge variant={encuesta.estado === 'Publicada' ? 'default' : 'secondary'}>
                      {encuesta.estado}
                    </Badge>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={onViewSurveys}>
                Ver Todas
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}