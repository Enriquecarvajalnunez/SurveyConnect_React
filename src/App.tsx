import { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { SurveyBuilder } from './components/SurveyBuilder';
import { SurveyList } from './components/SurveyList';
import { SurveyPublicView } from './components/SurveyPublicView';
import { SurveyResults } from './components/SurveyResults';
import { CompanyManagement } from './components/CompanyManagement';
import { UserManagement } from './components/UserManagement';

export type Company = {
  empresaID: number;
  nombre: string;
  nit: string;
  fechaRegistro: string;
};

export type User = {
  usuarioID: number;
  empresaID: number;
  empresaNombre?: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: 'Admin' | 'Creador' | 'Analista';
  estado: 'Activo' | 'Inactivo';
};

export type Survey = {
  encuestaID: number;
  empresaID: number;
  usuarioCreadorID: number;
  titulo: string;
  descripcion: string;
  fechaCreacion: string;
  fechaInicioVigencia: string;
  fechaFinVigencia: string;
  estado: 'Borrador' | 'Publicada' | 'Cerrada';
  enlaceLargo: string;
  enlaceCorto: string;
  preguntas: Question[];
};

export type QuestionType = {
  tipoPreguntaID: number;
  nombreTipo: string;
};

export type Question = {
  preguntaID: number;
  encuestaID: number;
  tipoPreguntaID: number;
  textoPregunta: string;
  orden: number;
  esObligatoria: boolean;
  opciones?: AnswerOption[];
};

export type AnswerOption = {
  opcionID: number;
  preguntaID: number;
  textoOpcion: string;
  valor?: number;
  orden: number;
};

type View = 'login' | 'dashboard' | 'survey-builder' | 'survey-list' | 'survey-public' | 'survey-results' | 'company-management' | 'user-management';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [editingSurvey, setEditingSurvey] = useState<Survey | null>(null);
  const [viewingSurvey, setViewingSurvey] = useState<Survey | null>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('login');
    setEditingSurvey(null);
    setViewingSurvey(null);
  };

  const handleCreateNewSurvey = () => {
    setEditingSurvey(null);
    setCurrentView('survey-builder');
  };

  const handleEditSurvey = (survey: Survey) => {
    setEditingSurvey(survey);
    setCurrentView('survey-builder');
  };

  const handleViewSurvey = (survey: Survey) => {
    setViewingSurvey(survey);
    setCurrentView('survey-public');
  };

  const handleViewResults = (survey: Survey) => {
    setViewingSurvey(survey);
    setCurrentView('survey-results');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setEditingSurvey(null);
    setViewingSurvey(null);
  };

  const handleViewSurveyList = () => {
    setCurrentView('survey-list');
  };

  const handleViewCompanyManagement = () => {
    setCurrentView('company-management');
  };

  const handleViewUserManagement = () => {
    setCurrentView('user-management');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'login' && (
        <LoginPage onLogin={handleLogin} />
      )}

      {currentView === 'dashboard' && currentUser && (
        <Dashboard
          user={currentUser}
          onLogout={handleLogout}
          onCreateSurvey={handleCreateNewSurvey}
          onViewSurveys={handleViewSurveyList}
          onViewCompanies={handleViewCompanyManagement}
          onViewUsers={handleViewUserManagement}
        />
      )}

      {currentView === 'survey-builder' && currentUser && (
        <SurveyBuilder
          user={currentUser}
          editingSurvey={editingSurvey}
          onBack={handleBackToDashboard}
          onLogout={handleLogout}
        />
      )}

      {currentView === 'survey-list' && currentUser && (
        <SurveyList
          user={currentUser}
          onBack={handleBackToDashboard}
          onLogout={handleLogout}
          onEditSurvey={handleEditSurvey}
          onViewSurvey={handleViewSurvey}
          onViewResults={handleViewResults}
        />
      )}

      {currentView === 'survey-public' && viewingSurvey && (
        <SurveyPublicView
          survey={viewingSurvey}
          onBack={handleBackToDashboard}
        />
      )}

      {currentView === 'survey-results' && viewingSurvey && currentUser && (
        <SurveyResults
          survey={viewingSurvey}
          onBack={handleBackToDashboard}
          onLogout={handleLogout}
        />
      )}

      {currentView === 'company-management' && currentUser && (
        <CompanyManagement
          user={currentUser}
          onBack={handleBackToDashboard}
          onLogout={handleLogout}
        />
      )}

      {currentView === 'user-management' && currentUser && (
        <UserManagement
          user={currentUser}
          onBack={handleBackToDashboard}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}