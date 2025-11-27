import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { ArrowLeft, Search, Edit, Eye, BarChart3, LogOut, Link2, Calendar, Building2 } from 'lucide-react';
import type { User, Survey } from '../App';
import { toast } from 'sonner';
import { getCompanyName } from "../lib/api";
import { useEffect} from "react";
import { getEncuestas } from "../lib/api";

type SurveyListProps = {
  user: User;
  onBack: () => void;
  onLogout: () => void;
  onEditSurvey: (survey: Survey) => void;
  onViewSurvey: (survey: Survey) => void;
  onViewResults: (survey: Survey) => void;
};


export function SurveyList({ user, onBack, onLogout, onEditSurvey, onViewSurvey, onViewResults }: SurveyListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] =
    useState<'Todas' | 'Borrador' | 'Publicada' | 'Cerrada'>('Todas');

  const [encuestas, setEncuestas] = useState<Survey[]>([]);
  const [companyNames, setCompanyNames] = useState<Record<number, string>>({});

  const cargarEncuestas = async () => {
  try {
    const data = await getEncuestas();

    const empresaCache: Record<number, string> = {};

    // Cargar nombres de empresa solo una vez
    for (const e of data) {
      if (!empresaCache[e.empresaID]) {
        empresaCache[e.empresaID] = await getCompanyName(e.empresaID);
      }
    }

    setEncuestas(data);
    setCompanyNames(empresaCache);

  } catch (err) {
    console.error("Error al cargar encuestas", err);
  }
};

  useEffect(() => {
    cargarEncuestas();
  }, []);

  const filteredSurveys = encuestas.filter((survey) => {
    const matchesSearch =
      survey.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      survey.descripcion.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterEstado === 'Todas' || survey.estado === filterEstado;

    const matchesCompany =
      user.rol === 'Admin' || survey.empresaID === user.empresaID;

    return matchesSearch && matchesFilter && matchesCompany;
  });

const copyLink = (link: string) => {
  navigator.clipboard.writeText(link);
  toast.success("Enlace copiado");
};

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
              <h1>Mis Encuestas</h1>
            </div>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar encuestas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {(['Todas', 'Borrador', 'Publicada', 'Cerrada'] as const).map((estado) => (
              <Button
                key={estado}
                variant={filterEstado === estado ? 'default' : 'outline'}
                onClick={() => setFilterEstado(estado)}
              >
                {estado}
              </Button>
            ))}
          </div>
        </div>

        {/* Survey List */}
        <div className="space-y-4">
          {filteredSurveys.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-gray-600">No se encontraron encuestas</p>
              </CardContent>
            </Card>
          ) : (
            filteredSurveys.map((survey) => (
              <Card key={survey.encuestaID} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle>{survey.titulo}</CardTitle>
                        <Badge variant={
                          survey.estado === 'Publicada' ? 'default' :
                          survey.estado === 'Cerrada' ? 'secondary' :
                          'outline'
                        }>
                          {survey.estado}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{survey.descripcion}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <Building2 className="w-3 h-3" />
                        <span>{companyNames[survey.empresaID] || "Cargando..."}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(survey.fechaCreacion).toLocaleDateString('es-ES')}</span>
                      </div>
                      {survey.estado === 'Publicada' && (
                        <div className="flex items-center gap-2">
                          <span>Vigencia: {new Date(survey.fechaInicioVigencia).toLocaleDateString('es-ES')} - {new Date(survey.fechaFinVigencia).toLocaleDateString('es-ES')}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {survey.estado === 'Publicada' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyLink(survey.enlaceCorto)}
                          >
                            <Link2 className="w-4 h-4 mr-2" />
                            Copiar Enlace
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewSurvey(survey)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Vista Previa
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewResults(survey)}
                          >
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Resultados
                          </Button>
                        </>
                      )}
                      {survey.estado === 'Borrador' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditSurvey(survey)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                      )}
                      {survey.estado === 'Cerrada' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewResults(survey)}
                        >
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Ver Resultados
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}