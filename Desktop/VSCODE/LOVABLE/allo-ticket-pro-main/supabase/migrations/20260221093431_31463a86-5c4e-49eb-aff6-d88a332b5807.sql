
-- Table pour les demandes d'inscription des gestionnaires
CREATE TABLE public.manager_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid
);

ALTER TABLE public.manager_requests ENABLE ROW LEVEL SECURITY;

-- Les admins peuvent tout gérer
CREATE POLICY "Admins can manage manager requests"
  ON public.manager_requests FOR ALL
  USING (public.is_admin(auth.uid()));

-- Un utilisateur peut voir sa propre demande
CREATE POLICY "Users can view own request"
  ON public.manager_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Un utilisateur peut créer sa propre demande
CREATE POLICY "Users can create own request"
  ON public.manager_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Ajouter manager_id sur tickets pour tracer quel gestionnaire a créé le billet
ALTER TABLE public.tickets
  ADD COLUMN manager_id uuid;

-- Fonction pour vérifier si un utilisateur est gestionnaire approuvé
CREATE OR REPLACE FUNCTION public.is_manager(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'manager'
  )
$$;

-- Politique: les gestionnaires peuvent voir les billets qu'ils ont créés
CREATE POLICY "Managers can view their tickets"
  ON public.tickets FOR SELECT
  USING (public.is_manager(auth.uid()) AND manager_id = auth.uid());

-- Politique: les gestionnaires peuvent créer des billets
CREATE POLICY "Managers can create tickets"
  ON public.tickets FOR INSERT
  WITH CHECK (public.is_manager(auth.uid()) AND manager_id = auth.uid());

-- Les gestionnaires peuvent voir les événements publics (déjà couvert)
-- Les gestionnaires peuvent voir les types de billets (déjà couvert)

-- Politique: les gestionnaires peuvent voir leurs propres infos dans user_roles
-- (déjà couvert par "Users can view their own roles")
