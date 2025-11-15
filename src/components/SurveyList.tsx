import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { ArrowLeft, Search, Edit, Eye, BarChart3, LogOut, Link2, Calendar, Building2 } from 'lucide-react';
import type { User, Survey } from '../App';
import { toast } from 'sonner@2.0.3';
import { getCompanyName } from '../lib/mockData';

type SurveyListProps = {
  user: User;
  onBack: () => void;
  onLogout: () => void;
  onEditSurvey: (survey: Survey) => void;
  onViewSurvey: (survey: Survey) => void;
  onViewResults: (survey: Survey) => void;
};

// Mock surveys data
const MOCK_SURVEYS: Survey[] = [
  {
    encuestaID: 1,
    empresaID: 1,
    usuarioCreadorID: 1,
    titulo: 'Encuesta de Satisfacción Laboral 2025',
    descripcion: 'Evaluación anual del clima laboral y satisfacción de los empleados',
    fechaCreacion: '2025-01-15T10:00:00',
    fechaInicioVigencia: '2025-02-01',
    fechaFinVigencia: '2025-02-28',
    estado: 'Publicada',
    enlaceLargo: 'https://encuestas.empresa.com/satisfaccion-laboral-2025',
    enlaceCorto: 'sat2025',
    preguntas: [
      {
        preguntaID: 1,
        encuestaID: 1,
        tipoPreguntaID: 5,
        textoPregunta: '¿Qué tan satisfecho estás con tu trabajo actual?',
        orden: 1,
        esObligatoria: true,
        opciones: [
          { opcionID: 1, preguntaID: 1, textoOpcion: 'Muy insatisfecho', valor: 1, orden: 1 },
          { opcionID: 2, preguntaID: 1, textoOpcion: 'Insatisfecho', valor: 2, orden: 2 },
          { opcionID: 3, preguntaID: 1, textoOpcion: 'Neutral', valor: 3, orden: 3 },
          { opcionID: 4, preguntaID: 1, textoOpcion: 'Satisfecho', valor: 4, orden: 4 },
          { opcionID: 5, preguntaID: 1, textoOpcion: 'Muy satisfecho', valor: 5, orden: 5 },
        ],
      },
      {
        preguntaID: 2,
        encuestaID: 1,
        tipoPreguntaID: 2,
        textoPregunta: '¿Qué aspectos crees que podríamos mejorar?',
        orden: 2,
        esObligatoria: false,
      },
    ],
  },
  {
    encuestaID: 2,
    empresaID: 1,
    usuarioCreadorID: 2,
    titulo: 'Evaluación de Capacitación - Marketing Digital',
    descripcion: 'Feedback sobre la capacitación de marketing digital del mes de enero',
    fechaCreacion: '2025-01-20T14:30:00',
    fechaInicioVigencia: '2025-01-25',
    fechaFinVigencia: '2025-02-10',
    estado: 'Publicada',
    enlaceLargo: 'https://encuestas.empresa.com/capacitacion-marketing-digital',
    enlaceCorto: 'cap-mkt',
    preguntas: [
      {
        preguntaID: 3,
        encuestaID: 2,
        tipoPreguntaID: 3,
        textoPregunta: '¿Cómo calificarías el contenido de la capacitación?',
        orden: 1,
        esObligatoria: true,
        opciones: [
          { opcionID: 6, preguntaID: 3, textoOpcion: 'Excelente', orden: 1 },
          { opcionID: 7, preguntaID: 3, textoOpcion: 'Bueno', orden: 2 },
          { opcionID: 8, preguntaID: 3, textoOpcion: 'Regular', orden: 3 },
          { opcionID: 9, preguntaID: 3, textoOpcion: 'Necesita mejorar', orden: 4 },
        ],
      },
    ],
  },
  {
    encuestaID: 3,
    empresaID: 1,
    usuarioCreadorID: 1,
    titulo: 'Clima Organizacional Q1 2025',
    descripcion: 'Medición del clima organizacional del primer trimestre',
    fechaCreacion: '2025-01-10T09:00:00',
    fechaInicioVigencia: '2025-03-01',
    fechaFinVigencia: '2025-03-31',
    estado: 'Borrador',
    enlaceLargo: 'https://encuestas.empresa.com/clima-q1-2025',
    enlaceCorto: 'clima-q1',
    preguntas: [],
  },
  {
    encuestaID: 4,
    empresaID: 1,
    usuarioCreadorID: 2,
    titulo: 'Encuesta de Beneficios',
    descripcion: 'Conoce tu opinión sobre los beneficios actuales de la empresa',
    fechaCreacion: '2024-12-20T11:00:00',
    fechaInicioVigencia: '2025-01-01',
    fechaFinVigencia: '2025-01-15',
    estado: 'Cerrada',
    enlaceLargo: 'https://encuestas.empresa.com/beneficios-2025',
    enlaceCorto: 'benef',
    preguntas: [],
  },
];

export function SurveyList({ user, onBack, onLogout, onEditSurvey, onViewSurvey, onViewResults }: SurveyListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<'Todas' | 'Borrador' | 'Publicada' | 'Cerrada'>('Todas');

  const filteredSurveys = MOCK_SURVEYS.filter((survey) => {
    const matchesSearch = survey.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          survey.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterEstado === 'Todas' || survey.estado === filterEstado;
    const matchesCompany = user.rol === 'Admin' || survey.empresaID === user.empresaID;
    return matchesSearch && matchesFilter && matchesCompany;
  });

  const copyLink = (enlaceCorto: string) => {
    const link = `https://encuestas.empresa.com/${enlaceCorto}`;
    navigator.clipboard.writeText(link);
    toast.success('Enlace copiado al portapapeles');
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
                        <span>{getCompanyName(survey.empresaID)}</span>
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