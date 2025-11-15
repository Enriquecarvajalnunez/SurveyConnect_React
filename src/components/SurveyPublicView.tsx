import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import type { Survey } from '../App';
import { toast } from 'sonner@2.0.3';

type SurveyPublicViewProps = {
  survey: Survey;
  onBack: () => void;
};

export function SurveyPublicView({ survey, onBack }: SurveyPublicViewProps) {
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [participantEmail, setParticipantEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required questions
    const requiredQuestions = survey.preguntas.filter(q => q.esObligatoria);
    const missingAnswers = requiredQuestions.filter(q => !answers[q.preguntaID]);

    if (missingAnswers.length > 0) {
      toast.error('Por favor responde todas las preguntas obligatorias');
      return;
    }

    // Simulate submission
    setSubmitted(true);
    toast.success('¡Gracias por tu respuesta!');
  };

  const updateAnswer = (preguntaID: number, value: any) => {
    setAnswers({ ...answers, [preguntaID]: value });
  };

  const renderQuestion = (pregunta: any, index: number) => {
    const { preguntaID, tipoPreguntaID, textoPregunta, esObligatoria, opciones } = pregunta;

    return (
      <Card key={preguntaID}>
        <CardHeader>
          <CardTitle className="text-base">
            {index + 1}. {textoPregunta}
            {esObligatoria && <span className="text-red-500 ml-1">*</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Texto Corto */}
          {tipoPreguntaID === 1 && (
            <Input
              placeholder="Tu respuesta"
              value={answers[preguntaID] || ''}
              onChange={(e) => updateAnswer(preguntaID, e.target.value)}
            />
          )}

          {/* Párrafo */}
          {tipoPreguntaID === 2 && (
            <Textarea
              placeholder="Tu respuesta"
              value={answers[preguntaID] || ''}
              onChange={(e) => updateAnswer(preguntaID, e.target.value)}
              rows={4}
            />
          )}

          {/* Opción Multiple (Radio) */}
          {tipoPreguntaID === 3 && (
            <RadioGroup
              value={answers[preguntaID]?.toString() || ''}
              onValueChange={(value) => updateAnswer(preguntaID, parseInt(value))}
            >
              {opciones?.map((opcion) => (
                <div key={opcion.opcionID} className="flex items-center space-x-2">
                  <RadioGroupItem value={opcion.opcionID.toString()} id={`opcion-${opcion.opcionID}`} />
                  <Label htmlFor={`opcion-${opcion.opcionID}`}>{opcion.textoOpcion}</Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {/* Casillas de Verificación */}
          {tipoPreguntaID === 4 && (
            <div className="space-y-2">
              {opciones?.map((opcion) => (
                <div key={opcion.opcionID} className="flex items-center space-x-2">
                  <Checkbox
                    id={`checkbox-${opcion.opcionID}`}
                    checked={(answers[preguntaID] || []).includes(opcion.opcionID)}
                    onCheckedChange={(checked) => {
                      const current = answers[preguntaID] || [];
                      if (checked) {
                        updateAnswer(preguntaID, [...current, opcion.opcionID]);
                      } else {
                        updateAnswer(preguntaID, current.filter((id: number) => id !== opcion.opcionID));
                      }
                    }}
                  />
                  <Label htmlFor={`checkbox-${opcion.opcionID}`}>{opcion.textoOpcion}</Label>
                </div>
              ))}
            </div>
          )}

          {/* Escala Lineal */}
          {tipoPreguntaID === 5 && (
            <RadioGroup
              value={answers[preguntaID]?.toString() || ''}
              onValueChange={(value) => updateAnswer(preguntaID, parseInt(value))}
            >
              <div className="flex gap-4 justify-center py-4">
                {opciones?.map((opcion) => (
                  <div key={opcion.opcionID} className="flex flex-col items-center gap-2">
                    <RadioGroupItem value={opcion.opcionID.toString()} id={`escala-${opcion.opcionID}`} />
                    <Label htmlFor={`escala-${opcion.opcionID}`} className="text-sm">
                      {opcion.textoOpcion}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          )}

          {/* Fecha */}
          {tipoPreguntaID === 6 && (
            <Input
              type="date"
              value={answers[preguntaID] || ''}
              onChange={(e) => updateAnswer(preguntaID, e.target.value)}
            />
          )}
        </CardContent>
      </Card>
    );
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-500 rounded-full">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
            </div>
            <CardTitle>¡Respuesta Enviada!</CardTitle>
            <CardDescription>
              Gracias por completar la encuesta. Tus respuestas han sido registradas exitosamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} className="w-full">
              Volver al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1>{survey.titulo}</h1>
            {survey.descripcion && (
              <p className="text-gray-600 mt-2">{survey.descripcion}</p>
            )}
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Participant Email (Optional) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Correo Electrónico (Opcional)</CardTitle>
              <CardDescription>
                Si deseas recibir los resultados de la encuesta, déjanos tu correo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                type="email"
                placeholder="tu@email.com"
                value={participantEmail}
                onChange={(e) => setParticipantEmail(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Questions */}
          {survey.preguntas.map((pregunta, index) => renderQuestion(pregunta, index))}

          {/* Submit Button */}
          <Card className="bg-white sticky bottom-4">
            <CardContent className="pt-6">
              <Button type="submit" className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Enviar Respuestas
              </Button>
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  );
}
