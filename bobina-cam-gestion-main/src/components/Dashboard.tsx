import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BobinaCard } from '@/components/BobinaCard';
import { BobinaForm } from '@/components/BobinaForm';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  Plus, 
  Search, 
  Filter, 
  LogOut, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  Factory
} from 'lucide-react';

interface Bobina {
  id: string;
  codigo: string;
  tipo_plastico: string;
  cor: string;
  espessura: number;
  largura: number;
  peso: number;
  quantidade_estoque: number;
  localizacao?: string;
  data_entrada: string;
  data_validade?: string;
  fornecedor?: string;
  observacoes?: string;
  foto_url?: string;
}

interface DashboardStats {
  total_bobinas: number;
  total_estoque: number;
  estoque_baixo: number;
  sem_estoque: number;
}

export const Dashboard = () => {
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const [bobinas, setBobinas] = useState<Bobina[]>([]);
  const [filteredBobinas, setFilteredBobinas] = useState<Bobina[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBobina, setEditingBobina] = useState<Bobina | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCor, setFilterCor] = useState('all');
  const [stats, setStats] = useState<DashboardStats>({
    total_bobinas: 0,
    total_estoque: 0,
    estoque_baixo: 0,
    sem_estoque: 0
  });

  const fetchBobinas = async () => {
    try {
      const { data, error } = await supabase
        .from('bobinas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBobinas(data || []);
      setFilteredBobinas(data || []);
      
      // Calculate stats
      const totalBobinas = data?.length || 0;
      const totalEstoque = data?.reduce((sum, bobina) => sum + bobina.quantidade_estoque, 0) || 0;
      const estoqueBaixo = data?.filter(bobina => bobina.quantidade_estoque > 0 && bobina.quantidade_estoque <= 5).length || 0;
      const semEstoque = data?.filter(bobina => bobina.quantidade_estoque === 0).length || 0;

      setStats({
        total_bobinas: totalBobinas,
        total_estoque: totalEstoque,
        estoque_baixo: estoqueBaixo,
        sem_estoque: semEstoque
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar bobinas: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBobinas();
  }, []);

  useEffect(() => {
    let filtered = bobinas;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(bobina =>
        bobina.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bobina.tipo_plastico.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bobina.cor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bobina.fornecedor?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(bobina => bobina.tipo_plastico === filterType);
    }

    // Filter by color
    if (filterCor !== 'all') {
      filtered = filtered.filter(bobina => bobina.cor === filterCor);
    }

    setFilteredBobinas(filtered);
  }, [bobinas, searchTerm, filterType, filterCor]);

  const handleEdit = (bobina: Bobina) => {
    setEditingBobina(bobina);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta bobina?')) return;

    try {
      const { error } = await supabase
        .from('bobinas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Bobina excluída!",
        description: "A bobina foi removida do estoque.",
      });
      
      fetchBobinas();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao excluir bobina: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer logout",
        variant: "destructive"
      });
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingBobina(null);
  };

  const handleFormSuccess = () => {
    fetchBobinas();
  };

  const getUniqueTypes = () => {
    const types = Array.from(new Set(bobinas.map(b => b.tipo_plastico)));
    return types.sort();
  };

  const getUniqueCors = () => {
    const cors = Array.from(new Set(bobinas.map(b => b.cor)));
    return cors.sort();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-secondary flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Header */}
      <header className="bg-card border-b shadow-subtle">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-primary p-2 rounded-lg">
                <Factory className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Gestão de Bobinas</h1>
                <p className="text-sm text-muted-foreground">Sistema de controle de estoque</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Olá, {user?.email}
              </span>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-subtle">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Bobinas</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_bobinas}</div>
              <p className="text-xs text-muted-foreground">Bobinas cadastradas</p>
            </CardContent>
          </Card>

          <Card className="shadow-subtle">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estoque Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_estoque}</div>
              <p className="text-xs text-muted-foreground">Unidades em estoque</p>
            </CardContent>
          </Card>

          <Card className="shadow-subtle">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{stats.estoque_baixo}</div>
              <p className="text-xs text-muted-foreground">Bobinas com pouco estoque</p>
            </CardContent>
          </Card>

          <Card className="shadow-subtle">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sem Estoque</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.sem_estoque}</div>
              <p className="text-xs text-muted-foreground">Bobinas sem estoque</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions and Filters */}
        <Card className="mb-8 shadow-subtle">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Estoque de Bobinas</CardTitle>
                <CardDescription>Gerencie o estoque de bobinas plásticas</CardDescription>
              </div>
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-gradient-primary hover:shadow-medium transition-all duration-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Bobina
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar por código, tipo, cor ou fornecedor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    {getUniqueTypes().map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterCor} onValueChange={setFilterCor}>
                  <SelectTrigger className="w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Cor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as cores</SelectItem>
                    {getUniqueCors().map(cor => (
                      <SelectItem key={cor} value={cor}>{cor}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bobinas Grid */}
        {filteredBobinas.length === 0 ? (
          <Card className="text-center py-12 shadow-subtle">
            <CardContent>
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchTerm || filterType !== 'all' || filterCor !== 'all' 
                  ? 'Nenhuma bobina encontrada' 
                  : 'Nenhuma bobina cadastrada'
                }
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterType !== 'all' || filterCor !== 'all' 
                  ? 'Tente ajustar os filtros de pesquisa' 
                  : 'Comece adicionando sua primeira bobina ao estoque'
                }
              </p>
              {!searchTerm && filterType === 'all' && filterCor === 'all' && (
                <Button 
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeira Bobina
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBobinas.map((bobina) => (
              <BobinaCard
                key={bobina.id}
                bobina={bobina}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      <BobinaForm
        isOpen={showForm}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        editingBobina={editingBobina}
      />
    </div>
  );
};