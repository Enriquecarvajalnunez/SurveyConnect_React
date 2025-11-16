import { useState,useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { ArrowLeft, Plus, Trash2, GripVertical, Save, Send, Eye, LogOut, Building2 } from 'lucide-react';
import type { User, Survey, Question, QuestionType } from '../App';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { getCompanyName } from '../lib/mockData';
import { createEncuesta, createPregunta, createOpcionRespuesta } from "../lib/api";

import { getTiposPregunta } from "../lib/api";

type SurveyBuilderProps = {
  user: User;
  editingSurvey: Survey | null;
  onBack: () => void;
  onLogout: () => void;
};


export function SurveyBuilder({ user, editingSurvey, onBack, onLogout }: SurveyBuilderProps) {
  const [titulo, setTitulo] = useState(editingSurvey?.titulo || '');
  const [descripcion, setDescripcion] = useState(editingSurvey?.descripcion || '');
  const [fechaInicio, setFechaInicio] = useState(editingSurvey?.fechaInicioVigencia || '');
  const [fechaFin, setFechaFin] = useState(editingSurvey?.fechaFinVigencia || '');
  const [estado, setEstado] = useState<'Borrador' | 'Publicada' | 'Cerrada'>(editingSurvey?.estado || 'Borrador');
  const [preguntas, setPreguntas] = useState<Question[]>(editingSurvey?.preguntas || []);

  //Traemos tipos de pregunta  
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);

  useEffect(() => {
    const fetchTipos = async () => {
      try {
        const tipos = await getTiposPregunta();
        setQuestionTypes(tipos);
      } catch (err) {
        console.error("Error cargando tipos de pregunta:", err);
      }
    };

    fetchTipos();
  }, []);

  const addQuestion = () => {
    const newQuestion: Question = {
      preguntaID: Date.now(),
      encuestaID: editingSurvey?.encuestaID || 0,
      tipoPreguntaID: 1,
      textoPregunta: '',
      orden: preguntas.length + 1,
      esObligatoria: false,
      opciones: [],
    };
    setPreguntas([...preguntas, newQuestion]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...preguntas];
    updated[index] = { ...updated[index], [field]: value };
    setPreguntas(updated);
  };

  const deleteQuestion = (index: number) => {
    const updated = preguntas.filter((_, i) => i !== index);
    setPreguntas(updated.map((q, i) => ({ ...q, orden: i + 1 })));
  };

  const addOption = (questionIndex: number) => {
    const updated = [...preguntas];
    const opciones = updated[questionIndex].opciones || [];
    opciones.push({
      opcionID: Date.now(),
      preguntaID: updated[questionIndex].preguntaID,
      textoOpcion: '',
      orden: opciones.length + 1,
    });
    updated[questionIndex].opciones = opciones;
    setPreguntas(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...preguntas];
    const opciones = updated[questionIndex].opciones || [];
    opciones[optionIndex].textoOpcion = value;
    setPreguntas(updated);
  };

  const deleteOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...preguntas];
    const opciones = (updated[questionIndex].opciones || []).filter((_, i) => i !== optionIndex);
    updated[questionIndex].opciones = opciones.map((o, i) => ({ ...o, orden: i + 1 }));
    setPreguntas(updated);
  };

  
const handleSave = async (publish: boolean = false) => {
  if (!titulo.trim()) {
    toast.error("Por favor ingresa un título para la encuesta");
    return;
  }
  try {
    // 1️⃣ Guardar ENCUESTA
   const encuesta = await createEncuesta({
      empresaID: user.empresaID,
      usuarioCreadorID: user.usuarioID,
      titulo,
      descripcion,
      fechaInicioVigencia: fechaInicio || null,
      fechaFinVigencia: fechaFin || null,
      estado: publish ? "Publicada" : "Borrador",
      enlaceLargo: null,
      enlaceCorto: null,
      preguntas // si aún no las usas, puedes dejarlas vacías
    });
    toast.success(publish ? "Encuesta publicada" : "Encuesta guardada");    
    // 2️⃣ Guardar PREGUNTAS
    for (const p of preguntas) {
      const pregunta = await createPregunta({
        encuestaid: encuesta,
        tipopreguntaid: p.tipoPreguntaID,
        textopregunta: p.textoPregunta,
        orden: p.orden,
        esobligatoria: p.esObligatoria
      });

      // 3️⃣ Si la pregunta requiere opciones
      if (p.opciones?.length > 0) {
        for (const op of p.opciones) {
          await createOpcionRespuesta({
            preguntaid: pregunta.preguntaid,
            textoopcion: op.textoOpcion,
            valor: op.valor || null,
            orden: op.orden
          });
        }
      }
    }

    toast.success(publish ? "Encuesta publicada" : "Encuesta guardada");
    onBack();

  } catch (err) {
    console.error("Error guardando encuesta:", err);
    toast.error("Error guardando la encuesta");
  }
};

  const needsOptions = (tipoPreguntaID: number) => {
    return [3, 4, 5].includes(tipoPreguntaID); // Opción Multiple, Casillas, Escala
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1>{editingSurvey ? 'Editar Encuesta' : 'Nueva Encuesta'}</h1>
                <p className="text-sm text-gray-600">{user.nombre} {user.apellido}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={estado === 'Publicada' ? 'default' : 'secondary'}>
                {estado}
              </Badge>
              <Button variant="outline" onClick={() => handleSave(false)}>
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </Button>
              <Button onClick={() => handleSave(true)}>
                <Send className="w-4 h-4 mr-2" />
                Publicar
              </Button>
              <Button variant="outline" onClick={onLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Survey Details */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Información de la Encuesta</CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building2 className="w-4 h-4" />
                <span>{user.empresaNombre || getCompanyName(user.empresaID)}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="titulo">Título de la Encuesta</Label>
              <Input
                id="titulo"
                placeholder="Ej: Encuesta de Satisfacción Laboral 2025"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                placeholder="Describe el propósito de esta encuesta..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
                <Input
                  id="fechaInicio"
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="fechaFin">Fecha de Fin</Label>
                <Input
                  id="fechaFin"
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <div className="space-y-4 mb-6">
          {preguntas.map((pregunta, index) => (
            <Card key={pregunta.preguntaID}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="mt-2 cursor-move">
                    <GripVertical className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Input
                          placeholder="Escribe tu pregunta aquí"
                          value={pregunta.textoPregunta}
                          onChange={(e) => updateQuestion(index, 'textoPregunta', e.target.value)}
                        />
                      </div>
                      <Select
                        value={pregunta.tipoPreguntaID.toString()}
                        onValueChange={(value) => updateQuestion(index, 'tipoPreguntaID', parseInt(value))}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {questionTypes.map((type) => (
                            <SelectItem key={type.tipoPreguntaID} value={type.tipoPreguntaID.toString()}>
                              {type.nombreTipo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteQuestion(index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>

                    {needsOptions(pregunta.tipoPreguntaID) && (
                      <div className="ml-8 space-y-2">
                        {(pregunta.opciones || []).map((opcion, optIndex) => (
                          <div key={opcion.opcionID} className="flex items-center gap-2">
                            <Input
                              placeholder={`Opción ${optIndex + 1}`}
                              value={opcion.textoOpcion}
                              onChange={(e) => updateOption(index, optIndex, e.target.value)}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteOption(index, optIndex)}
                            >
                              <Trash2 className="w-4 h-4 text-gray-400" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addOption(index)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar Opción
                        </Button>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Switch
                        id={`obligatoria-${index}`}
                        checked={pregunta.esObligatoria}
                        onCheckedChange={(checked) => updateQuestion(index, 'esObligatoria', checked)}
                      />
                      <Label htmlFor={`obligatoria-${index}`}>Obligatoria</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Question Button */}
        <Button
          variant="outline"
          className="w-full border-dashed"
          onClick={addQuestion}
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar Pregunta
        </Button>
      </main>
    </div>
  );
}