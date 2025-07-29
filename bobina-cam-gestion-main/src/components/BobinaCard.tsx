import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2, Calendar, MapPin, Package, Palette } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

interface BobinaCardProps {
  bobina: Bobina;
  onEdit: (bobina: Bobina) => void;
  onDelete: (id: string) => void;
}

export const BobinaCard = ({ bobina, onEdit, onDelete }: BobinaCardProps) => {
  const getEstoqueStatus = (quantidade: number) => {
    if (quantidade === 0) return { label: 'Sem estoque', variant: 'destructive' as const };
    if (quantidade <= 5) return { label: 'Estoque baixo', variant: 'warning' as const };
    return { label: 'Em estoque', variant: 'success' as const };
  };

  const status = getEstoqueStatus(bobina.quantidade_estoque);

  return (
    <Card className="group hover:shadow-medium transition-all duration-300 border-l-4 border-l-primary">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold text-foreground">
            {bobina.codigo}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Package className="w-3 h-3 mr-1" />
              {bobina.tipo_plastico}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Palette className="w-3 h-3 mr-1" />
              {bobina.cor}
            </Badge>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(bobina)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(bobina.id)} 
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="space-y-4">
        {bobina.foto_url && (
          <div className="aspect-video rounded-lg overflow-hidden bg-muted">
            <img 
              src={bobina.foto_url} 
              alt={`Foto da bobina ${bobina.codigo}`}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Espessura:</span>
            <p className="font-medium">{bobina.espessura}mm</p>
          </div>
          <div>
            <span className="text-muted-foreground">Largura:</span>
            <p className="font-medium">{bobina.largura}mm</p>
          </div>
          <div>
            <span className="text-muted-foreground">Peso:</span>
            <p className="font-medium">{bobina.peso}kg</p>
          </div>
          <div>
            <span className="text-muted-foreground">Estoque:</span>
            <div className="flex items-center gap-2">
              <p className="font-medium">{bobina.quantidade_estoque}</p>
              <Badge variant={status.variant} className="text-xs">
                {status.label}
              </Badge>
            </div>
          </div>
        </div>

        {bobina.localizacao && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Localização:</span>
            <span className="font-medium">{bobina.localizacao}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          Entrada: {format(new Date(bobina.data_entrada), 'dd/MM/yyyy', { locale: ptBR })}
        </div>

        {bobina.data_validade && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            Validade: {format(new Date(bobina.data_validade), 'dd/MM/yyyy', { locale: ptBR })}
          </div>
        )}

        {bobina.fornecedor && (
          <div className="text-sm">
            <span className="text-muted-foreground">Fornecedor:</span>
            <p className="font-medium">{bobina.fornecedor}</p>
          </div>
        )}

        {bobina.observacoes && (
          <div className="text-sm">
            <span className="text-muted-foreground">Observações:</span>
            <p className="font-medium text-xs mt-1 text-muted-foreground">{bobina.observacoes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};