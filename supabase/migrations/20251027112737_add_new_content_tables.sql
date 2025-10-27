/*
  # Add New Content Tables for SafetyPlus

  ## Overview
  Adds tables for Contact, About, Team, Gallery, Blog enhancements, and company info.

  ## New Tables

  ### Content & Info
  - `team_members` - Team member profiles with photos and bios
  - `branches` - Company branch locations with contact details
  - `albums` - Photo gallery albums for events
  - `album_images` - Individual images within albums
  - `contact_messages` - Contact form submissions
  - `pages_content` - Static page content (About, Mission, etc.)

  ### Enhanced Settings
  - Extend `settings` table with bank, GST, and Calendly fields

  ## Security
  - Enable RLS on all tables
  - Public read access for active content
  - Admin-only write access
*/

-- ============================================================================
-- TEAM MEMBERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  role text NOT NULL,
  dept text,
  bio_html text,
  email text,
  phone text,
  photo_path text,
  linkedin_url text,
  priority int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active team members"
  ON team_members FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage team members"
  ON team_members FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid() AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid() AND is_active = true
    )
  );

CREATE INDEX idx_team_members_active ON team_members(is_active, priority);

-- ============================================================================
-- BRANCHES
-- ============================================================================

CREATE TABLE IF NOT EXISTS branches (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  city text NOT NULL,
  address_lines text[] NOT NULL,
  phones text[] DEFAULT ARRAY[]::text[],
  emails text[] DEFAULT ARRAY[]::text[],
  map_embed_url text,
  image_path text,
  is_active boolean DEFAULT true,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active branches"
  ON branches FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage branches"
  ON branches FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid() AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid() AND is_active = true
    )
  );

CREATE INDEX idx_branches_active ON branches(is_active, sort_order);

-- ============================================================================
-- ALBUMS (Gallery)
-- ============================================================================

CREATE TABLE IF NOT EXISTS albums (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  event_date date,
  cover_path text NOT NULL,
  tags text[] DEFAULT ARRAY[]::text[],
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE albums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active albums"
  ON albums FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage albums"
  ON albums FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid() AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid() AND is_active = true
    )
  );

CREATE INDEX idx_albums_active ON albums(is_active, created_at DESC);
CREATE INDEX idx_albums_tags ON albums USING gin(tags);

-- ============================================================================
-- ALBUM IMAGES
-- ============================================================================

CREATE TABLE IF NOT EXISTS album_images (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  album_id uuid NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  path text NOT NULL,
  width int,
  height int,
  alt text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE album_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view album images"
  ON album_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM albums WHERE albums.id = album_images.album_id AND is_active = true
    )
  );

CREATE POLICY "Admins can manage album images"
  ON album_images FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid() AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid() AND is_active = true
    )
  );

CREATE INDEX idx_album_images_album ON album_images(album_id, sort_order);

-- ============================================================================
-- CONTACT MESSAGES
-- ============================================================================

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  company text NOT NULL,
  mobile text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'new' CHECK (status IN ('new', 'read', 'responded')),
  ip_address text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create contact messages"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view contact messages"
  ON contact_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins can update contact messages"
  ON contact_messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid() AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid() AND is_active = true
    )
  );

CREATE INDEX idx_contact_messages_status ON contact_messages(status, created_at DESC);

-- ============================================================================
-- PAGES CONTENT (for About, Mission, etc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS pages_content (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_key text UNIQUE NOT NULL,
  content jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pages_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pages content"
  ON pages_content FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage pages content"
  ON pages_content FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid() AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid() AND is_active = true
    )
  );

-- ============================================================================
-- EXTEND SETTINGS FOR BANK, GST, CALENDLY
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'bank_details'
  ) THEN
    ALTER TABLE settings ADD COLUMN bank_details jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'gst_details'
  ) THEN
    ALTER TABLE settings ADD COLUMN gst_details jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'calendly_url'
  ) THEN
    ALTER TABLE settings ADD COLUMN calendly_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'company_info'
  ) THEN
    ALTER TABLE settings ADD COLUMN company_info jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Update settings with SafetyPlus branding
UPDATE settings 
SET 
  store_name = 'SafetyPlus',
  company_info = jsonb_build_object(
    'name', 'SafetyPlus',
    'tagline', 'Your Safety, Our Priority',
    'established_year', 2015
  ),
  bank_details = jsonb_build_object(
    'bank_name', 'HDFC Bank',
    'account_no', 'XXXXXXXXXXXX',
    'branch', 'Coimbatore',
    'ifsc', 'HDFC0000XXX',
    'swift', 'HDFCINBB'
  ),
  gst_details = jsonb_build_object(
    'gstin', '33XXXXXXXXXXXXX',
    'type', 'Regular'
  )
WHERE id = (SELECT id FROM settings LIMIT 1);

-- Insert default About page content
INSERT INTO pages_content (page_key, content)
VALUES (
  'about',
  jsonb_build_object(
    'story', '<p>SafetyPlus has been India''s leading safety equipment supplier for over a decade, serving 12,500+ customers with 250+ dedicated professionals and 1,322+ partner suppliers nationwide.</p>',
    'mission', '<p>To provide world-class safety solutions that protect lives and enhance workplace safety standards across industries.</p>',
    'vision', '<p>To be the most trusted name in safety equipment, setting industry benchmarks for quality, service, and innovation.</p>',
    'milestones', jsonb_build_array(
      jsonb_build_object('year', 2015, 'event', 'Company founded in Coimbatore'),
      jsonb_build_object('year', 2017, 'event', 'Expanded to 5 branches across Tamil Nadu'),
      jsonb_build_object('year', 2019, 'event', 'Reached 5,000 satisfied customers'),
      jsonb_build_object('year', 2021, 'event', 'Launched online ordering platform'),
      jsonb_build_object('year', 2023, 'event', 'Partnered with 1,000+ suppliers'),
      jsonb_build_object('year', 2025, 'event', 'Serving 12,500+ customers nationwide')
    )
  )
)
ON CONFLICT (page_key) DO UPDATE
SET content = EXCLUDED.content;

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_albums_updated_at BEFORE UPDATE ON albums
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pages_content_updated_at BEFORE UPDATE ON pages_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();