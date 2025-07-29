import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Camera, Upload, X } from 'lucide-react';

interface Bobina {
  id?: string;
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

interface BobinaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingBobina?: Bobina | null;
}

export const BobinaForm = ({ isOpen, onClose, onSuccess, editingBobina }: BobinaFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Bobina>({
    codigo: editingBobina?.codigo || '',
    tipo_plastico: editingBobina?.tipo_plastico || '',
    cor: editingBobina?.cor || '',
    espessura: editingBobina?.espessura || 0,
    largura: editingBobina?.largura || 0,
    peso: editingBobina?.peso || 0,
    quantidade_estoque: editingBobina?.quantidade_estoque || 0,
    localizacao: editingBobina?.localizacao || '',
    data_entrada: editingBobina?.data_entrada ? editingBobina.data_entrada.split('T')[0] : new Date().toISOString().split('T')[0],
    data_validade: editingBobina?.data_validade ? editingBobina.data_validade.split('T')[0] : '',
    fornecedor: editingBobina?.fornecedor || '',
    observacoes: editingBobina?.observacoes || '',
    foto_url: editingBobina?.foto_url || ''
  });

  const uploadPhoto = async (file: File) => {
    setUploadingPhoto(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('bobina-photos')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('bobina-photos')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, foto_url: publicUrl }));

      toast({
        title: "Foto carregada!",
        description: "A foto foi carregada com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao carregar foto",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadPhoto(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const bobinaData = {
        ...formData,
        user_id: user.id,
        espessura: Number(formData.espessura),
        largura: Number(formData.largura),
        peso: Number(formData.peso),
        quantidade_estoque: Number(formData.quantidade_estoque),
        data_validade: formData.data_validade || null
      };

      let error;

      if (editingBobina?.id) {
        // Update existing bobina
        const { error: updateError } = await supabase
          .from('bobinas')
          .update(bobinaData)
          .eq('id', editingBobina.id);
        error = updateError;
      } else {
        // Create new bobina
        const { error: insertError } = await supabase
          .from('bobinas')
          .insert([bobinaData]);
        error = insertError;
      }

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Erro",
            description: "Já existe uma bobina com este código.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: editingBobina ? "Bobina atualizada!" : "Bobina criada!",
          description: editingBobina ? "A bobina foi atualizada com sucesso." : "A bobina foi adicionada ao estoque.",
        });
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, foto_url: '' }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingBobina ? 'Editar Bobina' : 'Nova Bobina'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Section */}
          <div className="space-y-4">
            <Label>Foto da Bobina</Label>
            {formData.foto_url ? (
              <div className="relative">
                <img 
                  src={formData.foto_url} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={removePhoto}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center space-y-4">
                <div className="flex justify-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={uploadingPhoto}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {uploadingPhoto ? 'Carregando...' : 'Câmera'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingPhoto ? 'Carregando...' : 'Arquivo'}
                  </Button>
                </div>
                {uploadingPhoto && <LoadingSpinner />}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código da Bobina *</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                placeholder="Ex: BOB001"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_plastico">Tipo de Plástico *</Label>
              <Select 
                value={formData.tipo_plastico} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_plastico: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PE">Polietileno (PE)</SelectItem>
                  <SelectItem value="PP">Polipropileno (PP)</SelectItem>
                  <SelectItem value="PVC">PVC</SelectItem>
                  <SelectItem value="PET">PET</SelectItem>
                  <SelectItem value="PS">Poliestireno (PS)</SelectItem>
                  <SelectItem value="OUTRO">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cor">Cor *</Label>
              <Select 
                value={formData.cor} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, cor: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a cor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Transparente">Transparente</SelectItem>
                  <SelectItem value="Branco">Branco</SelectItem>
                  <SelectItem value="Preto">Preto</SelectItem>
                  <SelectItem value="Azul">Azul</SelectItem>
                  <SelectItem value="Verde">Verde</SelectItem>
                  <SelectItem value="Vermelho">Vermelho</SelectItem>
                  <SelectItem value="Amarelo">Amarelo</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fornecedor">Fornecedor</Label>
              <Input
                id="fornecedor"
                value={formData.fornecedor}
                onChange={(e) => setFormData(prev => ({ ...prev, fornecedor: e.target.value }))}
                placeholder="Nome do fornecedor"
              />
            </div>
          </div>

          {/* Measurements */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="espessura">Espessura (mm) *</Label>
              <Input
                id="espessura"
                type="number"
                step="0.001"
                value={formData.espessura}
                onChange={(e) => setFormData(prev => ({ ...prev, espessura: Number(e.target.value) }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="largura">Largura (mm) *</Label>
              <Input
                id="largura"
                type="number"
                step="0.01"
                value={formData.largura}
                onChange={(e) => setFormData(prev => ({ ...prev, largura: Number(e.target.value) }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="peso">Peso (kg) *</Label>
              <Input
                id="peso"
                type="number"
                step="0.001"
                value={formData.peso}
                onChange={(e) => setFormData(prev => ({ ...prev, peso: Number(e.target.value) }))}
                required
              />
            </div>
          </div>

          {/* Stock and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantidade_estoque">Quantidade em Estoque *</Label>
              <Input
                id="quantidade_estoque"
                type="number"
                min="0"
                value={formData.quantidade_estoque}
                onChange={(e) => setFormData(prev => ({ ...prev, quantidade_estoque: Number(e.target.value) }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="localizacao">Localização</Label>
              <Input
                id="localizacao"
                value={formData.localizacao}
                onChange={(e) => setFormData(prev => ({ ...prev, localizacao: e.target.value }))}
                placeholder="Ex: Galpão A - Prateleira 3"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_entrada">Data de Entrada *</Label>
              <Input
                id="data_entrada"
                type="date"
                value={formData.data_entrada}
                onChange={(e) => setFormData(prev => ({ ...prev, data_entrada: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_validade">Data de Validade</Label>
              <Input
                id="data_validade"
                type="date"
                value={formData.data_validade}
                onChange={(e) => setFormData(prev => ({ ...prev, data_validade: e.target.value }))}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Observações adicionais sobre a bobina..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-primary"
              disabled={loading}
            >
              {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
              {editingBobina ? 'Atualizar' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};