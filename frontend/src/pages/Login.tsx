import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import logo from '../assets/images/Tchad-connexion-2030.png';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!identifier || !password) {
      setError('L\'adresse e-mail ou le nom d\'utilisateur et le mot de passe sont requis.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await signIn(identifier, password);
      navigate('/dashboard/profile'); 
    } catch (err: any) {
      let errorMessage = 'Échec de la connexion. Veuillez vérifier vos identifiants.';

      if (err.response?.data?.error) {
        errorMessage = err.response.data.error; // Use specific error from backend
      } else if (err.request) {
        errorMessage = 'Pas de réponse du serveur. Veuillez vérifier votre connexion internet.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img src={logo} alt="Logo Moov Africa" className="h-16 w-auto" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Connectez-vous à votre compte
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div 
              className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4"
              role="alert"
            >
              {error}
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                Adresse e-mail ou nom d'utilisateur
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Email ou nom d'utilisateur"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    aria-label={showPassword ? 'Cacher le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Mot de passe oublié ?
                </Link>

              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Connexion en cours...' : 'Se connecter'}
              </button>
            </div>
            <div className="text-sm text-center">
              Pas encore de compte ?{' '}
              <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                S'inscrire
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}