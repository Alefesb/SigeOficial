-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT DEFAULT 'operator',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create storage bucket for bobina photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('bobina-photos', 'bobina-photos', true);

-- Create storage policies for bobina photos
CREATE POLICY "Anyone can view bobina photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'bobina-photos');

CREATE POLICY "Authenticated users can upload bobina photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'bobina-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update bobina photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'bobina-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete bobina photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'bobina-photos' AND auth.role() = 'authenticated');

-- Create bobinas table for plastic roll inventory
CREATE TABLE public.bobinas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  tipo_plastico TEXT NOT NULL,
  cor TEXT NOT NULL,
  espessura DECIMAL(5,3) NOT NULL, -- in mm
  largura DECIMAL(8,2) NOT NULL, -- in mm
  peso DECIMAL(10,3) NOT NULL, -- in kg
  quantidade_estoque INTEGER NOT NULL DEFAULT 0,
  localizacao TEXT,
  data_entrada TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_validade TIMESTAMP WITH TIME ZONE,
  fornecedor TEXT,
  observacoes TEXT,
  foto_url TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bobinas ENABLE ROW LEVEL SECURITY;

-- Create policies for bobinas
CREATE POLICY "Authenticated users can view all bobinas" 
ON public.bobinas 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create bobinas" 
ON public.bobinas 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update bobinas they created" 
ON public.bobinas 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete bobinas they created" 
ON public.bobinas 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bobinas_updated_at
  BEFORE UPDATE ON public.bobinas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();