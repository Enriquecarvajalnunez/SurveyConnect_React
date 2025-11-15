import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Download, Users, Calendar, LogOut } from 'lucide-react';
import type { Survey } from '../App';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

type SurveyResultsProps = {
  survey: Survey;
  onBack: () => void;
  onLogout: () => void;
};

export function SurveyResults({ survey, onBack, onLogout }: SurveyResultsProps) {
  // Mock results data
  const totalResponses = 45;
  const averageCompletionTime = '4 min 32 seg';

  // Mock data for charts
  const satisfactionData = [
    { name: 'Muy insatisfecho', value: 2 },
    { name: 'Insatisfecho', value: 5 },
    { name: 'Neutral', value: 8 },
    { name: 'Satisfecho', value: 18 },
    { name: 'Muy satisfecho', value: 12 },
  ];

  const demographicsData = [
    { name: 'Excelente', value: 20 },
    { name: 'Bueno', value: 15 },
    { name: 'Regular', value: 8 },
    { name: 'Necesita mejorar', value: 2 },
  ];

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

  const textResponses = [
    {
      respuesta: 'Me gustaría que hubiera más oportunidades de desarrollo profesional',
      fecha: '2025-02-15 14:30',
    },
    {
      respuesta: 'Excelente ambiente de trabajo y buen balance vida-trabajo',
      fecha: '2025-02-15 11:20',
    },
    {
      respuesta: 'Mejorar la comunicación entre departamentos',
      fecha: '2025-02-14 16:45',
    },
    {
      respuesta: 'Los beneficios son muy buenos, especialmente el seguro médico',
      fecha: '2025-02-14 10:15',
    },
  ];

  const handleExport = () => {
    // Simulate export
    alert('Exportando resultados a Excel...');
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
              <div>
                <h1>Resultados de Encuesta</h1>
                <p className="text-sm text-gray-600">{survey.titulo}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" onClick={onLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total de Respuestas</CardTitle>
              <Users className="w-4 h-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{totalResponses}</div>
              <p className="text-xs text-gray-600 mt-1">Participantes únicos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Tiempo Promedio</CardTitle>
              <Calendar className="w-4 h-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{averageCompletionTime}</div>
              <p className="text-xs text-gray-600 mt-1">Tiempo de completado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Tasa de Finalización</CardTitle>
              <BarChart className="w-4 h-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">92%</div>
              <p className="text-xs text-gray-600 mt-1">De los que iniciaron</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>¿Qué tan satisfecho estás con tu trabajo actual?</CardTitle>
              <CardDescription>Distribución de respuestas (n={totalResponses})</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={satisfactionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Satisfacción por Categoría</CardTitle>
              <CardDescription>Distribución porcentual</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={satisfactionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {satisfactionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Second Question Chart */}
        {survey.encuestaID === 2 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>¿Cómo calificarías el contenido de la capacitación?</CardTitle>
              <CardDescription>Evaluación del contenido (n=32)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={demographicsData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Text Responses */}
        <Card>
          <CardHeader>
            <CardTitle>Respuestas Abiertas</CardTitle>
            <CardDescription>
              ¿Qué aspectos crees que podríamos mejorar?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {textResponses.map((response, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900 mb-2">{response.respuesta}</p>
                  <p className="text-xs text-gray-500">{response.fecha}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Statistics Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Resumen Estadístico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Promedio Satisfacción</p>
                <p className="text-xl">3.8 / 5.0</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Moda</p>
                <p className="text-xl">Satisfecho</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Mediana</p>
                <p className="text-xl">4.0</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Desviación Estándar</p>
                <p className="text-xl">1.12</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
