import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Dashboard } from '@/components/Dashboard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Factory, UserPlus, LogIn, Package, Camera, BarChart3 } from 'lucide-react';
import factoryHero from '@/assets/factory-hero.jpg';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-secondary flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0">
          <img 
            src={factoryHero} 
            alt="Fábrica de plásticos industrial" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70" />
        </div>
        
        <div className="relative container mx-auto px-4 py-24">
          <div className="max-w-2xl text-center mx-auto text-primary-foreground">
            <div className="flex justify-center mb-6">
              <div className="bg-primary-foreground/10 p-4 rounded-2xl backdrop-blur-sm">
                <Factory className="w-12 h-12" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-6">
              Sistema de Gestão de Bobinas
            </h1>
            <p className="text-xl mb-8 text-primary-foreground/90">
              Controle total do estoque de bobinas plásticas da sua fábrica. 
              Gerencie, monitore e otimize seu inventário com eficiência.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-strong"
                onClick={() => navigate('/auth')}
              >
                <LogIn className="w-5 h-5 mr-2" />
                Fazer Login
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => navigate('/auth')}
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Criar Conta
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Funcionalidades Principais
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Todas as ferramentas que você precisa para gerenciar seu estoque de forma profissional
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center shadow-medium border-0">
            <CardHeader>
              <div className="mx-auto bg-gradient-primary p-3 rounded-xl w-fit">
                <Package className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle>Controle de Estoque</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Registre e monitore todas as bobinas plásticas com informações detalhadas 
                sobre tipo, cor, dimensões e quantidades.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center shadow-medium border-0">
            <CardHeader>
              <div className="mx-auto bg-gradient-accent p-3 rounded-xl w-fit">
                <Camera className="w-8 h-8 text-accent-foreground" />
              </div>
              <CardTitle>Fotos Integradas</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Tire fotos diretamente pelo sistema usando a câmera do dispositivo 
                para identificação visual das bobinas.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center shadow-medium border-0">
            <CardHeader>
              <div className="mx-auto bg-gradient-primary p-3 rounded-xl w-fit">
                <BarChart3 className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle>Relatórios e Alertas</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Acompanhe estatísticas do estoque e receba alertas automáticos 
                quando o estoque estiver baixo ou vencido.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-foreground mb-4">
            Pronto para começar?
          </h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Crie sua conta gratuita e comece a gerenciar seu estoque de bobinas hoje mesmo.
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-primary hover:shadow-medium transition-all duration-300"
            onClick={() => navigate('/auth')}
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Começar Agora
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
