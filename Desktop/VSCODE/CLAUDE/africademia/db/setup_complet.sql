-- ══════════════════════════════════════════════════════════════════════════════
--  AFRICADEMIA — Setup base de données COMPLET (v3 · 2026-06-14)
--
--  USAGE : Coller dans Supabase → SQL Editor → Run
--  SÉCURITÉ : Idempotent — peut être relancé sans casser les données.
--  Toutes les créations utilisent CREATE TABLE IF NOT EXISTS.
--  Toutes les insertions utilisent ON CONFLICT DO UPDATE / DO NOTHING.
--  Toutes les politiques RLS sont droppées puis recréées proprement.
--
--  TABLES COUVERTES :
--    formations · services · profiles · projets_vente · temoignages
--    contacts · rendez_vous · portfolio · articles · incubateur_dossiers
--    parametres · paiements · achats · fichiers_formation
--    analytics_visites · analytics_events
--
--  APRÈS EXÉCUTION :
--    1. Dashboard Supabase → API → "Reload schema"
--    2. Se déconnecter / reconnecter sur connexion.html
--       (pour obtenir un JWT frais avec role:admin)
-- ══════════════════════════════════════════════════════════════════════════════


-- ── 0. Extensions ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ══════════════════════════════════════════════════════════════════════════════
--  1. TABLES (ordre respectant les FK)
-- ══════════════════════════════════════════════════════════════════════════════

-- ── 1.1 Formations ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS formations (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug               TEXT        UNIQUE NOT NULL,
  titre              TEXT        NOT NULL,
  soustitre          TEXT,
  categorie          TEXT        NOT NULL DEFAULT 'business',
  niveau             TEXT        NOT NULL DEFAULT 'Débutant',
  duree              TEXT,
  seances            TEXT,
  format             TEXT        NOT NULL DEFAULT 'pdf',
  prix               INTEGER     NOT NULL DEFAULT 0 CHECK (prix >= 0),
  devise             TEXT        NOT NULL DEFAULT 'FCFA',
  ancien_prix        INTEGER     CHECK (ancien_prix IS NULL OR ancien_prix >= 0),
  icon               TEXT        NOT NULL DEFAULT 'ri-book-2-line',
  tag                TEXT,
  description_courte TEXT,
  description        TEXT,
  description_longue TEXT,
  image_url          TEXT,
  objectifs          TEXT[]      NOT NULL DEFAULT '{}',
  programme          JSONB       NOT NULL DEFAULT '[]',
  recommande         BOOLEAN     NOT NULL DEFAULT false,
  active             BOOLEAN     NOT NULL DEFAULT true,
  actif              BOOLEAN     NOT NULL DEFAULT true,
  ordre              INTEGER     NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 1.2 Services ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug               TEXT        UNIQUE,
  titre              TEXT        NOT NULL,
  sous_titre         TEXT,
  categorie          TEXT        NOT NULL DEFAULT 'web',
  description_courte TEXT,
  description        TEXT,
  description_longue TEXT,
  icon               TEXT        NOT NULL DEFAULT 'ri-star-line',
  prix               INTEGER     CHECK (prix IS NULL OR prix >= 0),
  prix_a_partir      INTEGER     CHECK (prix_a_partir IS NULL OR prix_a_partir >= 0),
  devise             TEXT        NOT NULL DEFAULT 'FCFA',
  duree_estimee      TEXT,
  points_forts       TEXT[]      NOT NULL DEFAULT '{}',
  inclus             TEXT[]      NOT NULL DEFAULT '{}',
  formations_liees   TEXT[]      NOT NULL DEFAULT '{}',
  image_url          TEXT,
  actif              BOOLEAN     NOT NULL DEFAULT true,
  ordre              INTEGER     NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 1.3 Profils utilisateurs (liés à auth.users) ──────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT        NOT NULL,
  nom         TEXT        NOT NULL DEFAULT '',
  prenom      TEXT        NOT NULL DEFAULT '',
  telephone   TEXT,
  pays        TEXT,
  role        TEXT        NOT NULL DEFAULT 'client' CHECK (role IN ('admin','client')),
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 1.4 Projets à vendre ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projets_vente (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  titre              TEXT        NOT NULL,
  description_courte TEXT,
  description        TEXT,
  prix               NUMERIC(12,0) DEFAULT 0,
  statut             TEXT        DEFAULT 'disponible'
                     CHECK (statut IN ('disponible','reserve','vendu')),
  technos            TEXT,
  url_demo           TEXT,
  image_url          TEXT,
  video_url          TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 1.5 Témoignages ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS temoignages (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nom         TEXT        NOT NULL,
  prenom      TEXT,
  photo_url   TEXT,
  ville       TEXT,
  pays        TEXT        NOT NULL DEFAULT 'Sénégal',
  entreprise  TEXT,
  service_id  UUID        REFERENCES services(id) ON DELETE SET NULL,
  contenu     TEXT        NOT NULL,
  note        SMALLINT    NOT NULL DEFAULT 5 CHECK (note BETWEEN 1 AND 5),
  actif       BOOLEAN     NOT NULL DEFAULT true,
  verifie     BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 1.6 Contacts / Leads ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contacts (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nom                 TEXT        NOT NULL,
  email               TEXT,
  telephone           TEXT,
  pays                TEXT,
  service_interesse   TEXT,
  formation_interesse UUID        REFERENCES formations(id) ON DELETE SET NULL,
  budget_estime       TEXT,
  message             TEXT,
  source              TEXT        NOT NULL DEFAULT 'site'
                      CHECK (source IN ('site','whatsapp','instagram','referral','publicite','direct','autre')),
  statut              TEXT        NOT NULL DEFAULT 'nouveau'
                      CHECK (statut IN ('nouveau','en_cours','devis_envoye','converti','ferme','spam')),
  notes_admin         TEXT,
  tag                 TEXT,
  lu                  BOOLEAN     NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 1.7 Rendez-vous ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rendez_vous (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id      UUID        REFERENCES contacts(id) ON DELETE SET NULL,
  nom             TEXT        NOT NULL,
  email           TEXT,
  telephone       TEXT,
  date_rdv        DATE        NOT NULL,
  heure_rdv       TIME        NOT NULL,
  type_rdv        TEXT        NOT NULL DEFAULT 'decouverte'
                  CHECK (type_rdv IN ('decouverte','suivi','formation','technique','autre')),
  objet           TEXT,
  service_id      UUID        REFERENCES services(id) ON DELETE SET NULL,
  statut          TEXT        NOT NULL DEFAULT 'en_attente'
                  CHECK (statut IN ('en_attente','confirme','annule','effectue','reporte')),
  lien_visio      TEXT,
  notes           TEXT,
  rappel_envoye   BOOLEAN     NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 1.8 Portfolio ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT        UNIQUE NOT NULL,
  titre           TEXT        NOT NULL,
  client          TEXT,
  secteur         TEXT,
  categorie       TEXT
                  CHECK (categorie IN ('web','marketing','ia','design','ecommerce','application','autre')),
  extrait         TEXT,
  description     TEXT,
  url_site        TEXT,
  images          JSONB       NOT NULL DEFAULT '[]',
  technologies    TEXT[]      NOT NULL DEFAULT '{}',
  resultats       JSONB       NOT NULL DEFAULT '[]',
  date_livraison  DATE,
  featured        BOOLEAN     NOT NULL DEFAULT false,
  actif           BOOLEAN     NOT NULL DEFAULT true,
  ordre           INTEGER     NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 1.9 Articles / Blog ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS articles (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                TEXT        UNIQUE NOT NULL,
  titre               TEXT        NOT NULL,
  sous_titre          TEXT,
  contenu             TEXT,
  extrait             TEXT,
  image_url           TEXT,
  categorie           TEXT,
  tags                TEXT[]      NOT NULL DEFAULT '{}',
  publie              BOOLEAN     NOT NULL DEFAULT false,
  date_publication    TIMESTAMPTZ,
  auteur              TEXT        NOT NULL DEFAULT 'Africademia',
  lecture_min         SMALLINT    NOT NULL DEFAULT 3,
  vues                INTEGER     NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 1.10 Dossiers incubateur ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS incubateur_dossiers (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id          UUID        REFERENCES contacts(id) ON DELETE SET NULL,
  prenom              TEXT        NOT NULL,
  nom                 TEXT        NOT NULL,
  email               TEXT        NOT NULL,
  telephone           TEXT,
  pays                TEXT,
  secteur             TEXT        NOT NULL DEFAULT 'autre'
                      CHECK (secteur IN ('musique','startup','immobilier','ecommerce','tech','media','autre')),
  nom_projet          TEXT        NOT NULL,
  description_projet  TEXT        NOT NULL,
  stade               TEXT        NOT NULL DEFAULT 'idee'
                      CHECK (stade IN ('idee','mvp','lancement','croissance')),
  besoin_financement  BOOLEAN     NOT NULL DEFAULT false,
  montant_recherche   INTEGER,
  url_linkedin        TEXT,
  url_site            TEXT,
  document_url        TEXT,
  statut              TEXT        NOT NULL DEFAULT 'recu'
                      CHECK (statut IN ('recu','en_evaluation','entretien','accepte','refuse','en_attente')),
  notes_evaluation    TEXT,
  score               SMALLINT    CHECK (score IS NULL OR score BETWEEN 0 AND 100),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 1.11 Paramètres ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS parametres (
  cle         TEXT        PRIMARY KEY,
  valeur      TEXT,
  type        TEXT        NOT NULL DEFAULT 'text'
              CHECK (type IN ('text','json','boolean','number','email','url','tel')),
  description TEXT,
  groupe      TEXT        NOT NULL DEFAULT 'general',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 1.12 Paiements ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS paiements (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id        UUID        REFERENCES contacts(id) ON DELETE SET NULL,
  formation_id      UUID        REFERENCES formations(id) ON DELETE SET NULL,
  service_id        UUID        REFERENCES services(id) ON DELETE SET NULL,
  nom_payeur        TEXT,
  email_payeur      TEXT,
  telephone_payeur  TEXT,
  montant           INTEGER     NOT NULL DEFAULT 0 CHECK (montant >= 0),
  devise            TEXT        NOT NULL DEFAULT 'FCFA',
  methode           TEXT        NOT NULL DEFAULT 'wave'
                    CHECK (methode IN ('wave','orange_money','moov','mtn','paypal','virement','carte','especes','autre')),
  reference         TEXT        UNIQUE,
  statut            TEXT        NOT NULL DEFAULT 'en_attente'
                    CHECK (statut IN ('en_attente','recu','confirme','rembourse','litige')),
  preuve_url        TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 1.13 Achats (espace client) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS achats (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  formation_id    UUID        NOT NULL REFERENCES formations(id) ON DELETE RESTRICT,
  paiement_id     UUID        REFERENCES paiements(id) ON DELETE SET NULL,
  montant         INTEGER     NOT NULL CHECK (montant >= 0),
  devise          TEXT        NOT NULL DEFAULT 'FCFA',
  methode         TEXT        NOT NULL DEFAULT 'wave'
                  CHECK (methode IN ('wave','orange_money','moov','mtn','paypal','virement','carte','especes','offert','autre')),
  reference       TEXT        UNIQUE,
  statut          TEXT        NOT NULL DEFAULT 'en_attente'
                  CHECK (statut IN ('en_attente','confirme','rembourse','litige')),
  acces_actif     BOOLEAN     NOT NULL DEFAULT false,
  date_expiration TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 1.14 Fichiers de formation ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fichiers_formation (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  formation_id  UUID        NOT NULL REFERENCES formations(id) ON DELETE CASCADE,
  titre         TEXT        NOT NULL,
  type          TEXT        NOT NULL DEFAULT 'pdf'
                CHECK (type IN ('pdf','video_youtube','video_vimeo','video_direct','zip','lien')),
  url           TEXT        NOT NULL,
  description   TEXT,
  taille_mo     DECIMAL,
  ordre         INTEGER     NOT NULL DEFAULT 0,
  gratuit       BOOLEAN     NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 1.15 Analytics visites ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics_visites (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      TEXT        NOT NULL,
  page            TEXT        NOT NULL,
  date            DATE        NOT NULL DEFAULT CURRENT_DATE,
  referrer        TEXT,
  user_agent      TEXT,
  pays            TEXT,
  user_id         UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  duree_secondes  INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 1.16 Analytics événements ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics_events (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  TEXT        NOT NULL,
  type        TEXT        NOT NULL,
  data        JSONB       NOT NULL DEFAULT '{}',
  page        TEXT,
  user_id     UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ══════════════════════════════════════════════════════════════════════════════
--  2. MIGRATIONS SAFE (colonnes manquantes sur bases existantes)
-- ══════════════════════════════════════════════════════════════════════════════

DO $$ BEGIN

  -- ── formations ──────────────────────────────────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='formations' AND column_name='actif') THEN
    ALTER TABLE formations ADD COLUMN actif BOOLEAN NOT NULL DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='formations' AND column_name='description_longue') THEN
    ALTER TABLE formations ADD COLUMN description_longue TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='formations' AND column_name='image_url') THEN
    ALTER TABLE formations ADD COLUMN image_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='formations' AND column_name='soustitre') THEN
    ALTER TABLE formations ADD COLUMN soustitre TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='formations' AND column_name='seances') THEN
    ALTER TABLE formations ADD COLUMN seances TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='formations' AND column_name='ancien_prix') THEN
    ALTER TABLE formations ADD COLUMN ancien_prix INTEGER CHECK (ancien_prix IS NULL OR ancien_prix >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='formations' AND column_name='tag') THEN
    ALTER TABLE formations ADD COLUMN tag TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='formations' AND column_name='description_courte') THEN
    ALTER TABLE formations ADD COLUMN description_courte TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='formations' AND column_name='objectifs') THEN
    ALTER TABLE formations ADD COLUMN objectifs TEXT[] NOT NULL DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='formations' AND column_name='programme') THEN
    ALTER TABLE formations ADD COLUMN programme JSONB NOT NULL DEFAULT '[]';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='formations' AND column_name='recommande') THEN
    ALTER TABLE formations ADD COLUMN recommande BOOLEAN NOT NULL DEFAULT false;
  END IF;

  -- Élargir les CHECK de formations
  ALTER TABLE formations DROP CONSTRAINT IF EXISTS formations_format_check;
  ALTER TABLE formations ADD CONSTRAINT formations_format_check
    CHECK (format IN ('pdf','video','mixte','live','hybrid'));

  ALTER TABLE formations DROP CONSTRAINT IF EXISTS formations_categorie_check;
  ALTER TABLE formations ADD CONSTRAINT formations_categorie_check
    CHECK (categorie IN ('web','marketing','ia','business','design','immobilier','ecommerce','musique','digital','autre'));

  ALTER TABLE formations DROP CONSTRAINT IF EXISTS formations_niveau_check;
  ALTER TABLE formations ADD CONSTRAINT formations_niveau_check
    CHECK (niveau IN ('Débutant','Intermédiaire','Avancé','debutant','intermediaire','avance'));

  -- ── services ────────────────────────────────────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='prix') THEN
    ALTER TABLE services ADD COLUMN prix INTEGER CHECK (prix IS NULL OR prix >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='icon') THEN
    ALTER TABLE services ADD COLUMN icon TEXT NOT NULL DEFAULT 'ri-star-line';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='image_url') THEN
    ALTER TABLE services ADD COLUMN image_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='description_longue') THEN
    ALTER TABLE services ADD COLUMN description_longue TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='formations_liees') THEN
    ALTER TABLE services ADD COLUMN formations_liees TEXT[] NOT NULL DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='inclus') THEN
    ALTER TABLE services ADD COLUMN inclus TEXT[] NOT NULL DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='points_forts') THEN
    ALTER TABLE services ADD COLUMN points_forts TEXT[] NOT NULL DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='prix_a_partir') THEN
    ALTER TABLE services ADD COLUMN prix_a_partir INTEGER CHECK (prix_a_partir IS NULL OR prix_a_partir >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='duree_estimee') THEN
    ALTER TABLE services ADD COLUMN duree_estimee TEXT;
  END IF;

  ALTER TABLE services DROP CONSTRAINT IF EXISTS services_categorie_check;
  ALTER TABLE services ADD CONSTRAINT services_categorie_check
    CHECK (categorie IN ('web','marketing','hebergement','ia','publicite','design','incubateur','formation','autre'));

  -- ── paiements ───────────────────────────────────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='paiements' AND column_name='nom_payeur') THEN
    ALTER TABLE paiements ADD COLUMN nom_payeur TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='paiements' AND column_name='email_payeur') THEN
    ALTER TABLE paiements ADD COLUMN email_payeur TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='paiements' AND column_name='telephone_payeur') THEN
    ALTER TABLE paiements ADD COLUMN telephone_payeur TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='paiements' AND column_name='preuve_url') THEN
    ALTER TABLE paiements ADD COLUMN preuve_url TEXT;
  END IF;

  ALTER TABLE paiements DROP CONSTRAINT IF EXISTS paiements_methode_check;
  ALTER TABLE paiements ADD CONSTRAINT paiements_methode_check
    CHECK (methode IN ('wave','orange_money','moov','mtn','paypal','virement','carte','especes','autre'));

  ALTER TABLE paiements DROP CONSTRAINT IF EXISTS paiements_montant_check;
  ALTER TABLE paiements ADD CONSTRAINT paiements_montant_check CHECK (montant >= 0);

  -- ── analytics_visites : colonne date ────────────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='analytics_visites' AND column_name='date') THEN
    ALTER TABLE analytics_visites ADD COLUMN date DATE NOT NULL DEFAULT CURRENT_DATE;
  END IF;

  -- ── projets_vente : colonnes manquantes ─────────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projets_vente' AND column_name='updated_at') THEN
    ALTER TABLE projets_vente ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;

END $$;

-- Synchroniser actif ↔ active pour les lignes formations existantes
UPDATE formations SET actif = active WHERE actif IS DISTINCT FROM active;


-- ══════════════════════════════════════════════════════════════════════════════
--  3. INDEX
-- ══════════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_formations_slug          ON formations(slug);
CREATE INDEX IF NOT EXISTS idx_formations_actif_ord     ON formations(actif, ordre ASC);
CREATE INDEX IF NOT EXISTS idx_formations_active_ord    ON formations(active, ordre ASC);
CREATE INDEX IF NOT EXISTS idx_formations_categorie     ON formations(categorie);
CREATE INDEX IF NOT EXISTS idx_formations_format        ON formations(format);
CREATE INDEX IF NOT EXISTS idx_formations_recommande    ON formations(recommande) WHERE recommande = true;
CREATE INDEX IF NOT EXISTS idx_services_slug            ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_actif           ON services(actif, ordre ASC);
CREATE INDEX IF NOT EXISTS idx_projets_vente_statut     ON projets_vente(statut, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_statut          ON contacts(statut, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_lu              ON contacts(lu, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_source          ON contacts(source);
CREATE INDEX IF NOT EXISTS idx_rdv_date                 ON rendez_vous(date_rdv, statut);
CREATE INDEX IF NOT EXISTS idx_rdv_contact              ON rendez_vous(contact_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_featured       ON portfolio(featured, actif, ordre ASC);
CREATE INDEX IF NOT EXISTS idx_portfolio_categorie      ON portfolio(categorie) WHERE actif = true;
CREATE INDEX IF NOT EXISTS idx_portfolio_slug           ON portfolio(slug);
CREATE INDEX IF NOT EXISTS idx_articles_publie          ON articles(publie, date_publication DESC);
CREATE INDEX IF NOT EXISTS idx_articles_slug            ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_temoignages_actif        ON temoignages(actif, verifie);
CREATE INDEX IF NOT EXISTS idx_paiements_statut         ON paiements(statut, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_paiements_contact        ON paiements(contact_id);
CREATE INDEX IF NOT EXISTS idx_paiements_reference      ON paiements(reference);
CREATE INDEX IF NOT EXISTS idx_achats_user              ON achats(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_achats_formation         ON achats(formation_id);
CREATE INDEX IF NOT EXISTS idx_achats_statut            ON achats(statut);
CREATE INDEX IF NOT EXISTS idx_fichiers_formation       ON fichiers_formation(formation_id, ordre ASC);
CREATE INDEX IF NOT EXISTS idx_profiles_role            ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_incubateur_statut        ON incubateur_dossiers(statut, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incubateur_secteur       ON incubateur_dossiers(secteur);
CREATE INDEX IF NOT EXISTS idx_visites_date             ON analytics_visites(date DESC);
CREATE INDEX IF NOT EXISTS idx_visites_session          ON analytics_visites(session_id);
CREATE INDEX IF NOT EXISTS idx_visites_page             ON analytics_visites(page, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_type              ON analytics_events(type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_session           ON analytics_events(session_id);


-- ══════════════════════════════════════════════════════════════════════════════
--  4. FONCTIONS & TRIGGERS
-- ══════════════════════════════════════════════════════════════════════════════

-- Fonction générique updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

-- Synchronise actif ↔ active sur formations
CREATE OR REPLACE FUNCTION sync_formations_actif()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' OR NEW.actif IS DISTINCT FROM OLD.actif THEN
    NEW.active := NEW.actif;
  ELSIF NEW.active IS DISTINCT FROM OLD.active THEN
    NEW.actif := NEW.active;
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

-- Crée automatiquement le profil à l'inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, email, nom, prenom, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nom', ''),
    COALESCE(NEW.raw_user_meta_data->>'prenom', ''),
    COALESCE(
      CASE WHEN NEW.raw_app_meta_data->>'role'  IN ('admin','client') THEN NEW.raw_app_meta_data->>'role'  END,
      CASE WHEN NEW.raw_user_meta_data->>'role' IN ('admin','client') THEN NEW.raw_user_meta_data->>'role' END,
      'client'
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Supprimer les anciens triggers avant recréation
DROP TRIGGER IF EXISTS tr_formations_updated_at          ON formations;
DROP TRIGGER IF EXISTS tr_services_updated_at            ON services;
DROP TRIGGER IF EXISTS tr_contacts_updated_at            ON contacts;
DROP TRIGGER IF EXISTS tr_rendez_vous_updated_at         ON rendez_vous;
DROP TRIGGER IF EXISTS tr_articles_updated_at            ON articles;
DROP TRIGGER IF EXISTS tr_paiements_updated_at           ON paiements;
DROP TRIGGER IF EXISTS tr_incubateur_dossiers_updated_at ON incubateur_dossiers;
DROP TRIGGER IF EXISTS tr_achats_updated_at              ON achats;
DROP TRIGGER IF EXISTS tr_profiles_updated_at            ON profiles;
DROP TRIGGER IF EXISTS tr_projets_vente_updated_at       ON projets_vente;
DROP TRIGGER IF EXISTS on_auth_user_created              ON auth.users;

CREATE TRIGGER tr_formations_updated_at
  BEFORE UPDATE ON formations FOR EACH ROW EXECUTE FUNCTION sync_formations_actif();
CREATE TRIGGER tr_services_updated_at
  BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_contacts_updated_at
  BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_rendez_vous_updated_at
  BEFORE UPDATE ON rendez_vous FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_articles_updated_at
  BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_paiements_updated_at
  BEFORE UPDATE ON paiements FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_incubateur_dossiers_updated_at
  BEFORE UPDATE ON incubateur_dossiers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_achats_updated_at
  BEFORE UPDATE ON achats FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_projets_vente_updated_at
  BEFORE UPDATE ON projets_vente FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ══════════════════════════════════════════════════════════════════════════════
--  5. ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE formations          ENABLE ROW LEVEL SECURITY;
ALTER TABLE services            ENABLE ROW LEVEL SECURITY;
ALTER TABLE temoignages         ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE rendez_vous         ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio           ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE parametres          ENABLE ROW LEVEL SECURITY;
ALTER TABLE paiements           ENABLE ROW LEVEL SECURITY;
ALTER TABLE incubateur_dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE achats              ENABLE ROW LEVEL SECURITY;
ALTER TABLE fichiers_formation  ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_visites   ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events    ENABLE ROW LEVEL SECURITY;
ALTER TABLE projets_vente       ENABLE ROW LEVEL SECURITY;

-- Nettoyage complet des policies existantes
DROP POLICY IF EXISTS "public_read_formations"       ON formations;
DROP POLICY IF EXISTS "admin_write_formations"       ON formations;
DROP POLICY IF EXISTS "public_read_services"         ON services;
DROP POLICY IF EXISTS "admin_write_services"         ON services;
DROP POLICY IF EXISTS "public_read_temoignages"      ON temoignages;
DROP POLICY IF EXISTS "admin_write_temoignages"      ON temoignages;
DROP POLICY IF EXISTS "public_read_portfolio"        ON portfolio;
DROP POLICY IF EXISTS "admin_write_portfolio"        ON portfolio;
DROP POLICY IF EXISTS "public_read_articles"         ON articles;
DROP POLICY IF EXISTS "admin_write_articles"         ON articles;
DROP POLICY IF EXISTS "public_read_parametres"       ON parametres;
DROP POLICY IF EXISTS "admin_write_parametres"       ON parametres;
DROP POLICY IF EXISTS "public_insert_contacts"       ON contacts;
DROP POLICY IF EXISTS "admin_read_contacts"          ON contacts;
DROP POLICY IF EXISTS "admin_update_contacts"        ON contacts;
DROP POLICY IF EXISTS "admin_delete_contacts"        ON contacts;
DROP POLICY IF EXISTS "public_insert_rdv"            ON rendez_vous;
DROP POLICY IF EXISTS "admin_read_rdv"               ON rendez_vous;
DROP POLICY IF EXISTS "admin_update_rdv"             ON rendez_vous;
DROP POLICY IF EXISTS "public_insert_incubateur"     ON incubateur_dossiers;
DROP POLICY IF EXISTS "admin_read_incubateur"        ON incubateur_dossiers;
DROP POLICY IF EXISTS "admin_update_incubateur"      ON incubateur_dossiers;
DROP POLICY IF EXISTS "clients_own_profile"          ON profiles;
DROP POLICY IF EXISTS "admin_read_profiles"          ON profiles;
DROP POLICY IF EXISTS "public_read_fichiers"         ON fichiers_formation;
DROP POLICY IF EXISTS "clients_read_fichiers"        ON fichiers_formation;
DROP POLICY IF EXISTS "admin_write_fichiers"         ON fichiers_formation;
DROP POLICY IF EXISTS "clients_own_achats"           ON achats;
DROP POLICY IF EXISTS "admin_read_achats"            ON achats;
DROP POLICY IF EXISTS "admin_write_achats"           ON achats;
DROP POLICY IF EXISTS "public_insert_paiements"      ON paiements;
DROP POLICY IF EXISTS "admin_read_paiements"         ON paiements;
DROP POLICY IF EXISTS "admin_write_paiements"        ON paiements;
DROP POLICY IF EXISTS "public_insert_visites"        ON analytics_visites;
DROP POLICY IF EXISTS "admin_read_visites"           ON analytics_visites;
DROP POLICY IF EXISTS "public_insert_events"         ON analytics_events;
DROP POLICY IF EXISTS "admin_read_events"            ON analytics_events;
DROP POLICY IF EXISTS "projets_vente_read_public"    ON projets_vente;
DROP POLICY IF EXISTS "projets_vente_write_admin"    ON projets_vente;

-- ── Formations : lecture publique (actif), écriture admin ─────────────────────
CREATE POLICY "public_read_formations" ON formations
  FOR SELECT USING (COALESCE(actif, active, true) = true);
CREATE POLICY "admin_write_formations" ON formations
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── Services : lecture publique, écriture admin ───────────────────────────────
CREATE POLICY "public_read_services" ON services
  FOR SELECT USING (actif = true);
CREATE POLICY "admin_write_services" ON services
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── Témoignages : lecture publique (actif + vérifié), écriture admin ──────────
CREATE POLICY "public_read_temoignages" ON temoignages
  FOR SELECT USING (actif = true AND verifie = true);
CREATE POLICY "admin_write_temoignages" ON temoignages
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── Portfolio : lecture publique, écriture admin ──────────────────────────────
CREATE POLICY "public_read_portfolio" ON portfolio
  FOR SELECT USING (actif = true);
CREATE POLICY "admin_write_portfolio" ON portfolio
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── Articles : lecture publique (publié), écriture admin ──────────────────────
CREATE POLICY "public_read_articles" ON articles
  FOR SELECT USING (publie = true);
CREATE POLICY "admin_write_articles" ON articles
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── Paramètres : lecture publique, écriture admin ─────────────────────────────
CREATE POLICY "public_read_parametres" ON parametres
  FOR SELECT USING (true);
CREATE POLICY "admin_write_parametres" ON parametres
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── Contacts : insertion publique, CRUD admin ─────────────────────────────────
CREATE POLICY "public_insert_contacts" ON contacts
  FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_read_contacts" ON contacts
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "admin_update_contacts" ON contacts
  FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "admin_delete_contacts" ON contacts
  FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── Rendez-vous : insertion publique, CRUD admin ──────────────────────────────
CREATE POLICY "public_insert_rdv" ON rendez_vous
  FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_read_rdv" ON rendez_vous
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "admin_update_rdv" ON rendez_vous
  FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── Incubateur : insertion publique, CRUD admin ───────────────────────────────
CREATE POLICY "public_insert_incubateur" ON incubateur_dossiers
  FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_read_incubateur" ON incubateur_dossiers
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "admin_update_incubateur" ON incubateur_dossiers
  FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── Profils : chaque utilisateur voit le sien, admin voit tout ───────────────
CREATE POLICY "clients_own_profile" ON profiles
  FOR ALL USING (auth.uid() = id);
CREATE POLICY "admin_read_profiles" ON profiles
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ── Fichiers formation : gratuits = lecture publique, payants = acheteurs ─────
CREATE POLICY "public_read_fichiers" ON fichiers_formation
  FOR SELECT USING (gratuit = true);
CREATE POLICY "clients_read_fichiers" ON fichiers_formation
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM achats
      WHERE achats.formation_id = fichiers_formation.formation_id
        AND achats.user_id  = auth.uid()
        AND achats.statut   = 'confirme'
        AND achats.acces_actif = true
    )
  );
CREATE POLICY "admin_write_fichiers" ON fichiers_formation
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── Achats : chaque client voit les siens, admin voit tout ───────────────────
CREATE POLICY "clients_own_achats" ON achats
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "admin_read_achats" ON achats
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "admin_write_achats" ON achats
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── Paiements : insertion publique (preuve de paiement), CRUD admin ───────────
CREATE POLICY "public_insert_paiements" ON paiements
  FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_read_paiements" ON paiements
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "admin_write_paiements" ON paiements
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── Analytics : insertion publique, lecture admin ─────────────────────────────
CREATE POLICY "public_insert_visites" ON analytics_visites
  FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_read_visites" ON analytics_visites
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "public_insert_events" ON analytics_events
  FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_read_events" ON analytics_events
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── Projets à vendre : lecture publique, écriture admin ──────────────────────
CREATE POLICY "projets_vente_read_public" ON projets_vente
  FOR SELECT USING (true);
CREATE POLICY "projets_vente_write_admin" ON projets_vente
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));


-- ══════════════════════════════════════════════════════════════════════════════
--  6. VUES
-- ══════════════════════════════════════════════════════════════════════════════

DROP VIEW IF EXISTS v_stats CASCADE;
CREATE VIEW v_stats AS
SELECT
  (SELECT COUNT(*) FROM formations WHERE COALESCE(actif,active,true)=true)                                          AS nb_formations,
  (SELECT COUNT(*) FROM formations WHERE COALESCE(actif,active,true)=true AND format IN ('live','hybrid'))          AS nb_live,
  (SELECT COUNT(*) FROM formations WHERE COALESCE(actif,active,true)=true AND format IN ('pdf','video','mixte'))    AS nb_pdf,
  (SELECT COUNT(*) FROM services   WHERE actif=true)                                                                 AS nb_services,
  (SELECT COUNT(*) FROM contacts   WHERE statut='nouveau')                                                           AS leads_nouveaux,
  (SELECT COUNT(*) FROM contacts   WHERE statut='converti')                                                          AS leads_convertis,
  (SELECT COUNT(*) FROM contacts   WHERE lu=false)                                                                   AS messages_non_lus,
  (SELECT COUNT(*) FROM rendez_vous WHERE date_rdv>=CURRENT_DATE AND statut IN ('en_attente','confirme'))            AS rdv_a_venir,
  (SELECT COALESCE(SUM(montant),0) FROM paiements WHERE statut='confirme')                                           AS chiffre_affaires,
  (SELECT COUNT(*) FROM incubateur_dossiers WHERE statut='recu')                                                     AS dossiers_en_attente,
  (SELECT COUNT(*) FROM projets_vente WHERE statut='disponible')                                                     AS projets_disponibles;

DROP VIEW IF EXISTS v_contacts_recents CASCADE;
CREATE VIEW v_contacts_recents AS
SELECT
  c.id, c.nom, c.email, c.telephone, c.pays,
  c.service_interesse, c.statut, c.source, c.lu, c.created_at,
  f.titre AS formation_titre
FROM contacts c
LEFT JOIN formations f ON c.formation_interesse = f.id
ORDER BY c.created_at DESC;

DROP VIEW IF EXISTS v_rdv_a_venir CASCADE;
CREATE VIEW v_rdv_a_venir AS
SELECT
  r.id, r.nom, r.email, r.telephone,
  r.date_rdv, r.heure_rdv, r.type_rdv, r.statut, r.objet, r.lien_visio,
  s.titre AS service_titre
FROM rendez_vous r
LEFT JOIN services s ON r.service_id = s.id
WHERE r.date_rdv >= CURRENT_DATE AND r.statut IN ('en_attente','confirme')
ORDER BY r.date_rdv ASC, r.heure_rdv ASC;

DROP VIEW IF EXISTS v_achats_detail CASCADE;
CREATE VIEW v_achats_detail AS
SELECT
  a.id, a.user_id, a.statut, a.montant, a.devise, a.methode,
  a.acces_actif, a.created_at,
  p.email, p.nom, p.prenom,
  f.titre  AS formation_titre,
  f.slug   AS formation_slug,
  f.icon   AS formation_icon,
  f.format AS formation_format,
  f.prix   AS formation_prix
FROM achats a
JOIN profiles   p ON a.user_id     = p.id
JOIN formations f ON a.formation_id = f.id;

DROP VIEW IF EXISTS v_analytics_jour CASCADE;
CREATE VIEW v_analytics_jour AS
SELECT
  date,
  COUNT(*) AS visites,
  COUNT(DISTINCT session_id) AS sessions_uniques
FROM analytics_visites
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY date
ORDER BY date DESC;


-- ══════════════════════════════════════════════════════════════════════════════
--  7. SUPABASE STORAGE — Buckets & Policies
-- ══════════════════════════════════════════════════════════════════════════════

-- Bucket projets (images/vidéos des projets à vendre)
INSERT INTO storage.buckets (id, name, public)
VALUES ('projets', 'projets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Bucket formations (images/vidéos des formations, services, preuves paiement)
INSERT INTO storage.buckets (id, name, public)
VALUES ('formations', 'formations', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Nettoyage des policies storage existantes
DROP POLICY IF EXISTS "projets_storage_read"            ON storage.objects;
DROP POLICY IF EXISTS "projets_storage_upload_admin"    ON storage.objects;
DROP POLICY IF EXISTS "projets_storage_delete_admin"    ON storage.objects;
DROP POLICY IF EXISTS "formations_storage_read"         ON storage.objects;
DROP POLICY IF EXISTS "formations_storage_upload_admin" ON storage.objects;
DROP POLICY IF EXISTS "formations_storage_delete_admin" ON storage.objects;
DROP POLICY IF EXISTS "paiements_storage_upload_public" ON storage.objects;

-- Projets storage
CREATE POLICY "projets_storage_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'projets');
CREATE POLICY "projets_storage_upload_admin" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'projets' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "projets_storage_delete_admin" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'projets' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Formations storage
CREATE POLICY "formations_storage_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'formations');
CREATE POLICY "formations_storage_upload_admin" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'formations' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "formations_storage_delete_admin" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'formations' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Preuves de paiement : upload public dans le sous-dossier formations/paiements/
CREATE POLICY "paiements_storage_upload_public" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'formations' AND name LIKE 'paiements/%'
  );


-- ══════════════════════════════════════════════════════════════════════════════
--  8. DONNÉES SEED
-- ══════════════════════════════════════════════════════════════════════════════

-- ── 8.1 Paramètres ────────────────────────────────────────────────────────────
INSERT INTO parametres (cle, valeur, type, description, groupe) VALUES
  ('site_nom',           'Africademia',                                                     'text',    'Nom du site',                   'general'),
  ('site_slogan',        'Votre partenaire de croissance digitale',                         'text',    'Slogan principal',              'general'),
  ('contact_email',      'contact@africademia.com',                                         'email',   'Email de contact',              'contact'),
  ('contact_whatsapp',   '+22369656610',                                                    'tel',     'Numéro WhatsApp principal',     'contact'),
  ('contact_instagram',  '@africademia',                                                    'text',    'Handle Instagram',              'contact'),
  ('devise_defaut',      'FCFA',                                                            'text',    'Devise par défaut',             'paiement'),
  ('wave_numero',        '+22369656610',                                                    'tel',     'Numéro Wave / Moov Money',      'paiement'),
  ('orange_money',       '+22375329164',                                                    'tel',     'Numéro Orange Money',           'paiement'),
  ('rdv_heure_matin',    '10:00',                                                           'text',    'Heure créneau matin',           'rdv'),
  ('rdv_heure_soir',     '16:00',                                                           'text',    'Heure créneau après-midi',      'rdv'),
  ('rdv_jours',          'lundi,mardi,mercredi,jeudi,vendredi',                             'text',    'Jours disponibles pour RDV',    'rdv'),
  ('incubateur_actif',   'true',                                                            'boolean', 'Programme incubateur ouvert ?', 'incubateur'),
  ('meta_description',   'Africademia - Formation, création de sites web, marketing digital et hébergement pour entrepreneurs africains.', 'text', 'Meta description SEO', 'seo'),
  ('meta_titre',         'Africademia — Agence digitale & formations en ligne',             'text',    'Balise title SEO',             'seo')
ON CONFLICT (cle) DO UPDATE SET valeur = EXCLUDED.valeur;


-- ── 8.2 Services ──────────────────────────────────────────────────────────────
INSERT INTO services (
  slug, titre, sous_titre, categorie,
  description_courte, description, description_longue,
  icon, prix, prix_a_partir, devise, duree_estimee,
  points_forts, inclus, formations_liees, ordre
) VALUES

('creation-site-web',
 'Création de Site Web',
 'Sites web professionnels qui convertissent',
 'web',
 'Sites web sur-mesure, modernes et optimisés pour convertir vos visiteurs en clients.',
 'Nous concevons des sites web qui allient esthétique premium et performance technique. Chaque projet est pensé pour votre marché, votre audience et vos objectifs de conversion.',
 'De la landing page au site e-commerce complet, nous construisons votre présence en ligne avec les meilleures pratiques du secteur. Chaque site est développé avec des technologies modernes (Next.js, React, ou HTML/CSS/JS), optimisé pour la vitesse, le SEO et le mobile. Nous livrons des sites clé en main avec design personnalisé, intégration de votre contenu, optimisation SEO de base et formation à la gestion du site.',
 'ri-code-box-line', NULL, NULL, 'FCFA', '7–14 jours',
 ARRAY['Design sur-mesure à votre image','Optimisé mobile & SEO','Livré clé en main avec formation','Technologies modernes (Next.js, React)','Hébergement inclus 1 an'],
 ARRAY['Maquette validée avant développement','Jusqu''à 8 pages incluses','Formulaire de contact & WhatsApp intégré','Google Analytics configuré','Mise en ligne + nom de domaine','1 mois de support post-livraison'],
 ARRAY['sites-web-ia','print-on-demand','produits-digitaux'],
 1),

('marketing-digital',
 'Marketing Digital',
 'Visibilité, audience et conversions — chaque mois',
 'marketing',
 'Stratégies Meta Ads, TikTok Ads, Google Ads et gestion de contenu organique pour une croissance continue.',
 'Nous créons et gérons vos campagnes publicitaires et votre présence sur les réseaux sociaux pour attirer des clients qualifiés, en continu.',
 'Notre approche marketing repose sur 3 piliers : la data, la créativité et l''optimisation constante. Chaque mois, vous recevez un reporting complet avec les métriques clés : CPM, CPC, ROAS, croissance audience, trafic organique. Nos équipes maîtrisent les spécificités du marché africain (Mobile Money, habitudes de navigation, créneaux de diffusion optimaux).',
 'ri-megaphone-line', NULL, NULL, 'FCFA', 'Mensuel',
 ARRAY['Meta & TikTok Ads optimisés','Gestion complète des réseaux','Création de contenu visuel','Reporting mensuel détaillé','Ciblage marché africain'],
 ARRAY['Audit initial de votre présence en ligne','Stratégie de contenu sur mesure','2 à 4 publications par semaine','1 campagne publicitaire incluse / mois','Réponse aux commentaires & DMs','Rapport mensuel de performance'],
 ARRAY['produits-digitaux','print-on-demand','immobilier-locatif'],
 2),

('hebergement',
 'Hébergement & Domaine',
 'Votre site en ligne, sécurisé et toujours disponible',
 'hebergement',
 'Hébergement haute performance, nom de domaine .com/.sn, certificat SSL et emails professionnels.',
 'Un hébergement fiable est la fondation de votre présence en ligne. Nous gérons tout : serveur, sécurité, sauvegardes et mises à jour.',
 'Nos serveurs sont localisés en Europe et en Afrique pour garantir les meilleures performances pour votre audience. Le pack inclut un nom de domaine (.com, .africa, .sn, .ci…), un certificat SSL (HTTPS), des emails professionnels (@votredomaine.com) et des sauvegardes quotidiennes automatiques. Migration d''un site existant incluse sans frais.',
 'ri-server-line', NULL, NULL, 'FCFA', 'Annuel',
 ARRAY['99.9% uptime garanti','SSL inclus & renouvelé automatiquement','Emails professionnels inclus','Sauvegardes quotidiennes','Support technique réactif'],
 ARRAY['1 nom de domaine au choix','Certificat SSL gratuit','5 adresses email pro','10 Go espace de stockage','Sauvegardes quotidiennes 30 jours','Migration depuis votre hébergeur actuel'],
 ARRAY['sites-web-ia','creation-site-web'],
 3),

('publicite',
 'Publicité Digitale',
 'Campagnes ciblées qui génèrent des ventes',
 'publicite',
 'Campagnes publicitaires ciblées (Meta Ads, TikTok Ads, Google) pour atteindre vos clients idéaux.',
 'Nous concevons et gérons vos campagnes publicitaires de A à Z : ciblage, créatifs, budget, optimisation et reporting.',
 'Notre expertise en publicité digitale africaine nous permet de cibler précisément votre audience : par pays, ville, intérêts, comportements d''achat. Nous créons les visuels et vidéos publicitaires, configurons le pixel de tracking, testons différentes audiences (A/B testing) et optimisons les campagnes en temps réel.',
 'ri-advertisement-line', NULL, NULL, 'FCFA', 'Par campagne',
 ARRAY['Ciblage géographique & démographique précis','Créatifs visuels inclus','A/B testing systématique','Optimisation en temps réel','ROAS mesuré & reporté'],
 ARRAY['Audit de vos campagnes existantes','Création des visuels publicitaires','Configuration du pixel de tracking','3 audiences A/B testées','Rapport de campagne hebdomadaire','Recommandations d''optimisation'],
 ARRAY['produits-digitaux','print-on-demand','immobilier-locatif'],
 4),

('ia-sites',
 'Création avec l''IA',
 'Votre site web professionnel en 24 à 72 heures',
 'ia',
 'Créez un site web complet et personnalisé grâce aux outils IA — livré en 24 à 72h, à tarif réduit.',
 'Les outils IA (Bolt, Cursor, Lovable, v0) permettent de générer des sites web professionnels en quelques heures. Nous maîtrisons ces outils pour vous livrer un résultat qualitatif à un tarif compétitif.',
 'Cette offre s''adresse aux entrepreneurs, freelances et PME qui ont besoin d''une présence en ligne rapide et professionnelle, sans le budget d''un développement traditionnel. Le site est généré avec l''IA, puis personnalisé manuellement par nos experts : ajout de votre logo, vos couleurs, vos textes et vos images. Délai de livraison : 24 à 72 heures après validation du brief.',
 'ri-robot-line', NULL, NULL, 'FCFA', '24–72 heures',
 ARRAY['Livraison ultra-rapide','Coût 2 à 3× inférieur au développement classique','Design moderne & personnalisé','Mobile-first & SEO prêt','Modifiable facilement'],
 ARRAY['Brief de 30 min pour comprendre votre projet','Site complet en 5 à 10 pages','Personnalisation couleurs, logo, textes','Formulaire de contact WhatsApp intégré','Mise en ligne incluse','15 jours de corrections post-livraison'],
 ARRAY['sites-web-ia','creation-site-web'],
 5),

('incubateur',
 'Incubateur Africademia',
 'Accompagnement stratégique pour les projets à fort potentiel',
 'incubateur',
 'Programme d''accompagnement intensif de 3 à 6 mois pour transformer votre idée en business viable.',
 'L''Incubateur Africademia accompagne les entrepreneurs africains les plus prometteurs pour structurer, accélérer et financer leurs projets.',
 'Le programme se déroule en 3 phases : validation du modèle économique, développement produit & go-to-market, puis levée de fonds et scaling. Chaque porteur de projet bénéficie d''un mentor dédié, d''un accès aux outils premium et d''un réseau d''investisseurs actifs en Afrique. Places limitées à 10 projets par cohorte.',
 'ri-rocket-2-line', NULL, NULL, 'FCFA', '3–6 mois',
 ARRAY['Accompagnement stratégique hebdomadaire','Accès au réseau d''investisseurs','Outils & ressources inclus','Financement possible','Communauté d''entrepreneurs'],
 ARRAY['Séance de sélection & bilan initial','Mentor dédié pendant toute la durée','Accès aux outils Africademia (valeur 200K FCFA)','Atelier hebdomadaire en groupe','Présentation aux investisseurs partenaires','Certificat de participation'],
 ARRAY['produits-digitaux','sites-web-ia','print-on-demand'],
 6)

ON CONFLICT (slug) DO UPDATE SET
  titre              = EXCLUDED.titre,
  sous_titre         = EXCLUDED.sous_titre,
  categorie          = EXCLUDED.categorie,
  description_courte = EXCLUDED.description_courte,
  description        = EXCLUDED.description,
  description_longue = EXCLUDED.description_longue,
  icon               = EXCLUDED.icon,
  prix               = EXCLUDED.prix,
  prix_a_partir      = EXCLUDED.prix_a_partir,
  devise             = EXCLUDED.devise,
  duree_estimee      = EXCLUDED.duree_estimee,
  points_forts       = EXCLUDED.points_forts,
  inclus             = EXCLUDED.inclus,
  formations_liees   = EXCLUDED.formations_liees,
  ordre              = EXCLUDED.ordre;


-- ── 8.3 Formations ────────────────────────────────────────────────────────────
INSERT INTO formations (
  slug, titre, soustitre, categorie, niveau, duree, seances,
  format, prix, devise, ancien_prix, icon, tag,
  description_courte, description, description_longue,
  objectifs, programme, recommande, active, actif, ordre
) VALUES

('print-on-demand',
 'Print On Demand',
 'Lancez votre marque de vêtements sans stock, depuis l''Afrique',
 'ecommerce', 'Débutant', '2 semaines', '4 modules PDF', 'pdf',
 25000, 'FCFA', 40000, 'ri-t-shirt-line', 'Populaire',
 'Créez et vendez votre marque de vêtements en ligne sans jamais stocker une seule unité.',
 'Le Print On Demand révolutionne la mode en ligne. Vous créez des designs, vos clients commandent, et le prestataire imprime et livre directement. Zéro stock, zéro risque, 100% revenu passif.',
 'Le Print On Demand (POD) est aujourd''hui l''un des modèles d''affaires les plus accessibles pour les entrepreneurs africains. Vous n''avez besoin d''aucun capital de départ pour le stock : vous créez les designs, vous les uploadez sur une plateforme POD (Printful, Printify, Gelato), et dès qu''un client commande, le prestataire imprime et expédie directement. Ce guide vous emmène de la toute première idée jusqu''à vos premières ventes réelles, avec des stratégies éprouvées adaptées au marché africain.',
 ARRAY['Choisir sa plateforme POD (Printful, Printify, Gelato)','Créer des designs qui se vendent vraiment','Configurer sa boutique Shopify ou Etsy','Attirer ses premiers clients via les réseaux sociaux','Scaler avec la publicité payante'],
 '[{"num":"01","titre":"Les bases du POD","contenu":"Choisir sa niche, sa plateforme et ses premiers produits. Les erreurs à éviter au démarrage."},{"num":"02","titre":"Création de designs","contenu":"Canva Pro, tendances du marché, fichiers d''impression parfaits. Créer des designs qui convertissent."},{"num":"03","titre":"Boutique & automatisation","contenu":"Shopify ou Etsy : configuration complète, tarification, automatisation des commandes."},{"num":"04","titre":"Premières ventes","contenu":"Publicités ciblées, contenu organique, premières commandes. Analyse et optimisation."}]'::JSONB,
 true, true, true, 1),

('musique-ia',
 'Musique & IA',
 'Produire et monétiser de la musique avec l''intelligence artificielle',
 'ia', 'Intermédiaire', '3 semaines', '3 séances live', 'live',
 35000, 'FCFA', NULL, 'ri-music-2-line', 'Nouveau',
 'Créez de la musique professionnelle avec l''IA et transformez-la en source de revenus durables.',
 'La révolution musicale est là. Avec les bons outils IA, vous pouvez produire, distribuer et monétiser de la musique professionnelle sans studio coûteux ni label.',
 'La musique générée par IA atteint aujourd''hui des niveaux de qualité professionnelle. Dans ce programme live, vous apprenez à maîtriser les outils les plus performants du marché (Suno, Udio, Soundraw, Beatoven) pour créer de la musique originale, la distribuer sur les plateformes mondiales et générer des royalties. Les séances sont interactives : vous produisez en direct, avec les retours immédiats du formateur.',
 ARRAY['Maîtriser les outils IA musicaux (Suno, Udio, Soundraw)','Produire des beats et compositions complètes','Distribuer sur Spotify, Apple Music et TikTok','Monétiser via royalties, sync et vente de beats','Créer une identité musicale cohérente'],
 '[{"num":"01","titre":"Séance 1 — Outils IA musicaux","contenu":"Tour d''horizon des meilleures plateformes de génération musicale IA. Premières productions en direct."},{"num":"02","titre":"Séance 2 — Production & arrangement","contenu":"Techniques de production, mixing basique, exports professionnels. Créer une identité sonore."},{"num":"03","titre":"Séance 3 — Distribution & monétisation","contenu":"DistroKid, TuneCore, licensing et vente de beats. Construire sa présence en streaming."}]'::JSONB,
 false, true, true, 2),

('produits-digitaux',
 'Produits Digitaux',
 'Créez et vendez des produits numériques — revenus 100% automatisés',
 'ecommerce', 'Débutant', '2 semaines', '5 modules PDF', 'pdf',
 20000, 'FCFA', 35000, 'ri-computer-line', NULL,
 'Ebooks, templates, tunnels de vente — créez une source de revenus 100% automatisée.',
 'Les produits digitaux sont la forme la plus scalable de business en ligne. Une seule création, vendue à l''infini.',
 'Contrairement aux produits physiques, un produit digital se crée une seule fois et se vend indéfiniment, sans stock, sans logistique, sans frais variables. Ce guide couvre tous les types de produits digitaux rentables : ebooks, templates Notion/Canva, guides PDF, formations vidéo, presets photo, packs de ressources. Vous apprendrez à créer votre premier produit en moins d''une semaine, à mettre en place un tunnel de vente entièrement automatisé, et à générer vos premières ventes via les réseaux sociaux.',
 ARRAY['Identifier les produits digitaux rentables de votre niche','Créer des ebooks, templates et guides professionnels','Mettre en place un tunnel de vente entièrement automatisé','Promouvoir via Instagram, TikTok et email marketing','Scaler avec l''affiliation et les partenariats'],
 '[{"num":"01","titre":"Choisir son produit","contenu":"Validation d''idée, étude de marché rapide, positionnement prix."},{"num":"02","titre":"Création & packaging","contenu":"Canva, Notion, outils de création de qualité professionnelle."},{"num":"03","titre":"Tunnel de vente","contenu":"Systeme.io ou Gumroad — page de vente, email automatique, livraison."},{"num":"04","titre":"Lancement & croissance","contenu":"Stratégie de lancement, collecte de témoignages, upsells."},{"num":"05","titre":"Scaling","contenu":"Publicités ciblées, partenariats, programme d''affiliation."}]'::JSONB,
 false, true, true, 3),

('sites-web-ia',
 'Sites Web avec l''IA',
 'De l''idée à la mise en ligne en 3 séances accompagnées',
 'web', 'Débutant', '1 semaine', '3 séances live d''1h', 'live',
 45000, 'FCFA', NULL, 'ri-code-box-line', 'Live',
 'Créez votre site web professionnel en 3 sessions accompagnées, même sans expérience technique.',
 'En 3 séances live d''1 heure chacune, vous construisez votre site web professionnel de A à Z, guidé par un expert.',
 'Plus besoin de savoir coder pour avoir un site web professionnel. Les outils IA (Bolt, Cursor, Lovable, v0.dev) permettent aujourd''hui de créer des sites visuellement impeccables en quelques heures. Ce programme live vous guide à travers le processus complet : de la définition de votre projet à la mise en ligne finale. À la fin des 3 séances, vous avez un site en ligne, optimisé pour Google, avec votre formulaire de contact et vos informations.',
 ARRAY['Créer votre site avec les outils IA (Bolt, Cursor, Lovable)','Personnaliser le design à votre image de marque','Connecter un nom de domaine et un hébergeur','Optimiser pour être trouvé sur Google (SEO de base)','Gérer et modifier votre site en autonomie'],
 '[{"num":"01","titre":"Séance 1 — Structure & contenu","contenu":"Définir votre projet, créer la structure de base avec l''IA, premières pages."},{"num":"02","titre":"Séance 2 — Design & personnalisation","contenu":"Ajuster les couleurs, polices, images. Intégrer vos textes et votre logo."},{"num":"03","titre":"Séance 3 — Mise en ligne","contenu":"Connecter votre domaine, hébergement, SEO de base, Google Analytics."}]'::JSONB,
 true, true, true, 4),

('immobilier-locatif',
 'Immobilier Locatif',
 'Stratégies de rentabilité immobilière — sans apport massif',
 'ecommerce', 'Intermédiaire', '3 semaines', '6 modules PDF', 'pdf',
 30000, 'FCFA', 50000, 'ri-building-4-line', NULL,
 'Maîtrisez les stratégies de sous-location et d''investissement immobilier rentable.',
 'L''immobilier locatif, c''est le chemin le plus éprouvé vers la liberté financière. Ce guide vous donne les stratégies concrètes pour commencer sans apport massif.',
 'L''immobilier locatif en Afrique offre des rendements exceptionnels — souvent entre 8% et 15% annuels. Ce guide couvre les stratégies accessibles aux débutants : la sous-location légale, la location courte durée (Airbnb et équivalents africains), et les premières étapes vers l''acquisition. Chaque stratégie est illustrée avec des exemples concrets tirés des marchés de Dakar, Abidjan, Douala, Nairobi et Casablanca.',
 ARRAY['Comprendre les stratégies de sous-location légale','Analyser la rentabilité d''un bien avant d''investir','Négocier efficacement avec propriétaires et agences','Optimiser et scaler ses revenus locatifs','Fiscalité et protection juridique de vos revenus'],
 '[{"num":"01","titre":"Bases de l''immobilier locatif","contenu":"Vocabulaire, types de baux, cadre légal africain."},{"num":"02","titre":"Trouver les bonnes affaires","contenu":"Où chercher, comment analyser, les critères clés de rentabilité."},{"num":"03","titre":"La sous-location","contenu":"Stratégie, légalité, négociation avec le propriétaire."},{"num":"04","titre":"Optimisation & location courte durée","contenu":"Meublé, Airbnb, maximiser les revenus par m²."},{"num":"05","titre":"Scaling","contenu":"Passer de 1 à plusieurs biens, créer une structure solide."},{"num":"06","titre":"Aspects financiers & juridiques","contenu":"Fiscalité, comptabilité, protéger ses revenus."}]'::JSONB,
 false, true, true, 5)

ON CONFLICT (slug) DO UPDATE SET
  titre              = EXCLUDED.titre,
  soustitre          = EXCLUDED.soustitre,
  categorie          = EXCLUDED.categorie,
  niveau             = EXCLUDED.niveau,
  duree              = EXCLUDED.duree,
  seances            = EXCLUDED.seances,
  format             = EXCLUDED.format,
  prix               = EXCLUDED.prix,
  devise             = EXCLUDED.devise,
  ancien_prix        = EXCLUDED.ancien_prix,
  icon               = EXCLUDED.icon,
  tag                = EXCLUDED.tag,
  description_courte = EXCLUDED.description_courte,
  description        = EXCLUDED.description,
  description_longue = EXCLUDED.description_longue,
  objectifs          = EXCLUDED.objectifs,
  programme          = EXCLUDED.programme,
  recommande         = EXCLUDED.recommande,
  active             = EXCLUDED.active,
  actif              = EXCLUDED.actif,
  ordre              = EXCLUDED.ordre;


-- ── 8.4 Projets à vendre (exemples) ──────────────────────────────────────────
INSERT INTO projets_vente (titre, description_courte, description, prix, statut, technos, url_demo) VALUES

('Site E-commerce Boutique Mode',
 'Boutique en ligne complète pour vêtements & accessoires avec panier, paiement Mobile Money et gestion des stocks.',
 'Site e-commerce professionnel développé pour le marché africain. Intègre un système de paiement Wave/Orange Money, une gestion des stocks en temps réel, des fiches produits optimisées SEO et un tableau de bord admin complet. Livré avec le code source, documentation et formation à la prise en main.',
 350000, 'disponible',
 'Next.js,Supabase,Tailwind CSS,Stripe,Wave API',
 'https://africademia.com'),

('Site Vitrine Agence Digitale',
 'Portfolio animé pour agence ou freelance. Sections services, réalisations, blog et formulaire de devis intégré.',
 'Site vitrine premium pour agence digitale ou freelance. Design moderne avec animations GSAP, section portfolio filtrable, formulaire de devis relié à WhatsApp, blog et SEO optimisé. Développé en HTML/CSS/JS vanilla — aucune dépendance, ultra-rapide.',
 180000, 'disponible',
 'HTML,CSS,JavaScript,GSAP,Supabase',
 NULL),

('Plateforme de Formations en Ligne',
 'LMS complet : catalogue de formations, espace étudiant, paiements Mobile Money, vidéos protégées.',
 'Plateforme e-learning complète similaire à Africademia. Inclut un catalogue de formations avec filtres, un espace client sécurisé (accès aux PDF/vidéos après achat), un système de paiement Wave/Orange Money, un panneau admin pour gérer formations et étudiants, et des analytics de consultation.',
 750000, 'reserve',
 'Next.js,Supabase,Tailwind CSS,GSAP',
 NULL)

ON CONFLICT DO NOTHING;


-- ── 8.5 Témoignages ───────────────────────────────────────────────────────────
INSERT INTO temoignages (nom, prenom, ville, pays, entreprise, contenu, note, actif, verifie) VALUES
  ('Konaté',  'Aminata', 'Abidjan', 'Côte d''Ivoire', 'Boutique Mode',    'Africademia a transformé ma boutique en ligne en 10 jours. Mon chiffre d''affaires a doublé le premier mois.',                       5, true, true),
  ('Diallo',  'Mamadou', 'Dakar',   'Sénégal',        'Studio Photo',     'La formation Print On Demand m''a permis de lancer ma marque sans risque. J''ai fait mes 3 premières ventes en 2 semaines.',             5, true, true),
  ('Ndiaye',  'Fatou',   'Paris',   'France',          'Freelance',        'Grâce aux séances live Sites Web avec l''IA, j''ai créé mon portfolio professionnel en une semaine. Incroyable.',                        5, true, true),
  ('Traoré',  'Ibrahim', 'Bamako',  'Mali',            'Commerce Général', 'Le service marketing digital a multiplié mon audience Instagram par 4 en 2 mois. Je recommande à 100%.',                                 5, true, true),
  ('Mbaye',   'Sow',     'Dakar',   'Sénégal',         'Restaurant',       'Site web livré en 7 jours, exactement comme promis. Design parfait, très professionnel.',                                                 4, true, true),
  ('Ouédraogo','Mariam', 'Ouagadougou','Burkina Faso', 'Couture Créative', 'La formation Produits Digitaux m''a permis de créer mon premier ebook en 4 jours. Déjà 12 ventes !',                                    5, true, true),
  ('Ba',      'Aliou',   'Dakar',   'Sénégal',         'Auto-entrepreneur', 'L''incubateur Africademia m''a aidé à structurer mon projet musical. Mon premier album IA est sorti en 3 semaines.',                   5, true, true)
ON CONFLICT DO NOTHING;


-- ── 8.6 Portfolio (réalisations) ──────────────────────────────────────────────
INSERT INTO portfolio (slug, titre, client, secteur, categorie, extrait, description, url_site, technologies, resultats, featured, actif, ordre) VALUES

('boutique-mode-abidjan',
 'Boutique Mode — Abidjan',
 'Aminata Couture',
 'Mode & Retail',
 'ecommerce',
 'Boutique e-commerce complète avec paiement Mobile Money et livraison Abidjan.',
 'Site e-commerce développé pour une boutique de mode à Abidjan. Intègre Wave Pay, un catalogue de 200+ produits, une gestion des stocks automatisée et une app mobile-first. Résultat : +340% de ventes en 3 mois.',
 NULL,
 ARRAY['Next.js','Supabase','Tailwind CSS','Wave API'],
 '[{"label":"Croissance des ventes","valeur":"+340%"},{"label":"Taux de conversion","valeur":"4.2%"},{"label":"Délai de livraison","valeur":"14 jours"}]'::JSONB,
 true, true, 1),

('agence-digitale-dakar',
 'Agence Digitale — Dakar',
 'CreativoMedia',
 'Services digitaux',
 'web',
 'Site vitrine premium avec portfolio animé et système de devis automatique.',
 'Portfolio professionnel pour une agence digitale dakaroise. Design épuré avec animations GSAP, section réalisations filtrable par catégorie, formulaire de devis relié à WhatsApp. SEO optimisé pour les requêtes locales sénégalaises.',
 NULL,
 ARRAY['HTML','CSS','GSAP','JavaScript'],
 '[{"label":"Leads entrants / mois","valeur":"+28"},{"label":"Positionnement Google","valeur":"Top 3 Dakar"},{"label":"Délai de livraison","valeur":"7 jours"}]'::JSONB,
 true, true, 2),

('restaurant-bamako',
 'Restaurant Le Baobab — Bamako',
 'Le Baobab',
 'Restauration',
 'web',
 'Site vitrine + réservation en ligne pour restaurant gastronomique à Bamako.',
 'Site vitrine élégant pour restaurant gastronomique malien. Menu en ligne avec photos professionnelles, système de réservation par WhatsApp, galerie des plats et avis clients. Optimisé pour les recherches Google Maps.',
 NULL,
 ARRAY['HTML','CSS','JavaScript','Supabase'],
 '[{"label":"Réservations en ligne","valeur":"+85%"},{"label":"Nouveaux clients / mois","valeur":"+40"},{"label":"Note Google","valeur":"4.8/5"}]'::JSONB,
 false, true, 3)

ON CONFLICT (slug) DO NOTHING;


-- ══════════════════════════════════════════════════════════════════════════════
--  9. COMPTE ADMINISTRATEUR
-- ══════════════════════════════════════════════════════════════════════════════

-- Met à jour le compte existant (mot de passe + rôle JWT)
UPDATE auth.users
SET
  encrypted_password = crypt('Africademia@2025!', gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  confirmation_token = '',
  recovery_token     = '',
  raw_app_meta_data  = COALESCE(raw_app_meta_data, '{}'::jsonb)
                       || '{"provider":"email","providers":["email"],"role":"admin"}'::jsonb
WHERE email = 'adiatourepro@gmail.com';

-- Confirme le profil admin (ou le crée s''il n''existe pas encore)
INSERT INTO profiles (id, email, nom, prenom, role)
SELECT id, email, 'Admin', 'Africademia', 'admin'
FROM auth.users
WHERE email = 'adiatourepro@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  role   = 'admin',
  nom    = 'Admin',
  prenom = 'Africademia';

-- Confirme tous les comptes non encore vérifiés
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;


-- ══════════════════════════════════════════════════════════════════════════════
--  FIN — Base de données Africademia complète et opérationnelle.
--
--  ÉTAPES APRÈS EXÉCUTION :
--  1. Dashboard Supabase → API → cliquer "Reload schema"
--  2. Ouvrir Storage → vérifier que les buckets "projets" et "formations" existent
--  3. Se déconnecter et se reconnecter sur connexion.html
--     (pour obtenir un JWT frais avec role:admin)
--
--  RÉSUMÉ DES TABLES (16 tables) :
--  ┌─────────────────────────────────────────────────────────────────┐
--  │ formations       · services        · profiles                   │
--  │ projets_vente    · temoignages     · contacts                   │
--  │ rendez_vous      · portfolio       · articles                   │
--  │ incubateur_dossiers · parametres   · paiements                  │
--  │ achats           · fichiers_formation                           │
--  │ analytics_visites · analytics_events                            │
--  └─────────────────────────────────────────────────────────────────┘
--
--  NUMÉROS DE PAIEMENT :
--    Wave / Moov Money : +22369656610
--    Orange Money      : +22375329164
-- ══════════════════════════════════════════════════════════════════════════════
