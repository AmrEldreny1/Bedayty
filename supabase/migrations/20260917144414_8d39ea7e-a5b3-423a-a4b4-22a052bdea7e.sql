CREATE TYPE public.company_status AS ENUM ('idea','forming','active','growth');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  activity TEXT NOT NULL,
  country TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status public.company_status NOT NULL DEFAULT 'idea',
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.companies TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "companies public read" ON public.companies FOR SELECT USING (true);
CREATE POLICY "companies owner insert" ON public.companies FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "companies owner update" ON public.companies FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "companies owner delete" ON public.companies FOR DELETE TO authenticated USING (auth.uid() = owner_id);

CREATE TABLE public.founders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies ON DELETE CASCADE,
  name TEXT NOT NULL,
  ownership NUMERIC(5,2) NOT NULL DEFAULT 0,
  role TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.founders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.founders TO authenticated;
GRANT ALL ON public.founders TO service_role;
ALTER TABLE public.founders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "founders public read" ON public.founders FOR SELECT USING (true);
CREATE POLICY "founders owner write" ON public.founders FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.owner_id = auth.uid()));

CREATE TABLE public.service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies ON DELETE SET NULL,
  service_key TEXT NOT NULL,
  service_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_requests TO authenticated;
GRANT ALL ON public.service_requests TO service_role;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own service requests" ON public.service_requests FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.investor_profiles (
  company_id UUID PRIMARY KEY REFERENCES public.companies ON DELETE CASCADE,
  about TEXT NOT NULL DEFAULT '',
  problem TEXT NOT NULL DEFAULT '',
  product TEXT NOT NULL DEFAULT '',
  founders_note TEXT NOT NULL DEFAULT '',
  funding_amount TEXT NOT NULL DEFAULT '',
  use_of_funds TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.investor_profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.investor_profiles TO authenticated;
GRANT ALL ON public.investor_profiles TO service_role;
ALTER TABLE public.investor_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "investor public read" ON public.investor_profiles FOR SELECT USING (true);
CREATE POLICY "investor owner write" ON public.investor_profiles FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.owner_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.companies (id, owner_id, name, activity, country, description, status, is_demo) VALUES
('11111111-1111-4111-8111-111111111101', NULL, 'شركة أفق الرقمية', 'تقنية المعلومات', 'المملكة العربية السعودية', 'شركة تقنية تطوّر أدوات لإدارة الملفات الرقمية للشركات الناشئة.', 'active', true),
('11111111-1111-4111-8111-111111111102', NULL, 'مؤسسة نجد التجارية', 'تجارة الجملة', 'الإمارات العربية المتحدة', 'مؤسسة تجارية متخصصة في توريد المنتجات الغذائية للمتاجر الصغيرة.', 'growth', true),
('11111111-1111-4111-8111-111111111103', NULL, 'شركة رمال للاستشارات', 'استشارات أعمال', 'قطر', 'بيت خبرة يقدم استشارات نماذج الأعمال وخطط التوسع.', 'forming', true),
('11111111-1111-4111-8111-111111111104', NULL, 'استوديو سديم', 'التصميم والإبداع', 'مصر', 'استوديو تصميم يعمل على الهويات البصرية للعلامات الناشئة.', 'idea', true),
('11111111-1111-4111-8111-111111111105', NULL, 'منصة وصل اللوجستية', 'الخدمات اللوجستية', 'الكويت', 'منصة تربط المتاجر الإلكترونية بشركات الشحن المحلية.', 'active', true),
('11111111-1111-4111-8111-111111111106', NULL, 'شركة بيان المالية', 'التقنية المالية', 'البحرين', 'حلول محاسبية مبسطة للشركات الصغيرة والمتوسطة.', 'growth', true);

INSERT INTO public.founders (company_id, name, ownership, role) VALUES
('11111111-1111-4111-8111-111111111101', 'نورة العتيبي', 45, 'الرئيس التنفيذي'),
('11111111-1111-4111-8111-111111111101', 'خالد الشمري', 30, 'المدير التقني'),
('11111111-1111-4111-8111-111111111101', 'ريم الدوسري', 25, 'مديرة المنتج'),
('11111111-1111-4111-8111-111111111102', 'سالم المري', 60, 'المدير العام'),
('11111111-1111-4111-8111-111111111102', 'حمد الكعبي', 40, 'شريك'),
('11111111-1111-4111-8111-111111111103', 'منى العلي', 50, 'شريكة مؤسسة'),
('11111111-1111-4111-8111-111111111103', 'يوسف الهاجري', 50, 'شريك مؤسس'),
('11111111-1111-4111-8111-111111111104', 'سارة فؤاد', 100, 'المؤسسة'),
('11111111-1111-4111-8111-111111111105', 'عبدالله الرشيد', 70, 'المؤسس'),
('11111111-1111-4111-8111-111111111105', 'لمى الصباح', 30, 'شريكة'),
('11111111-1111-4111-8111-111111111106', 'فاطمة جاسم', 55, 'المؤسسة'),
('11111111-1111-4111-8111-111111111106', 'علي الستري', 45, 'شريك');