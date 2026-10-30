CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin','moderator')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','locked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL, expires_at TIMESTAMPTZ NOT NULL, revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL, icon VARCHAR(50), sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  title VARCHAR(255) NOT NULL, description TEXT NOT NULL DEFAULT '', device_icon VARCHAR(50),
  specs JSONB NOT NULL DEFAULT '{}'::jsonb, estimated_value NUMERIC(15,2) NOT NULL CHECK (estimated_value >= 0),
  exchange_type VARCHAR(20) NOT NULL CHECK (exchange_type IN ('even','compensation')),
  target_demand TEXT NOT NULL DEFAULT '', location VARCHAR(255) NOT NULL DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','hidden','completed')),
  ai_confidence NUMERIC(5,2), ai_detected_info JSONB,
  moderated_by UUID REFERENCES users(id) ON DELETE SET NULL, moderated_at TIMESTAMPTZ, rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), deleted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_listings_status_created ON listings(status, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_listings_owner ON listings(owner_id);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_search ON listings USING GIN (to_tsvector('simple', title || ' ' || description || ' ' || target_demand));

CREATE TABLE IF NOT EXISTS listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_listing_images_listing ON listing_images(listing_id, sort_order);

CREATE TABLE IF NOT EXISTS listing_moderation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  moderator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(20) NOT NULL CHECK (action IN ('approved','rejected','hidden','restored')),
  reason TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE RESTRICT,
  proposer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  offered_device_name VARCHAR(255) NOT NULL, offered_device_specs JSONB NOT NULL DEFAULT '{}'::jsonb,
  compensation_type VARCHAR(30) NOT NULL CHECK (compensation_type IN ('even','proposer_adds','receiver_adds')),
  compensation_amount NUMERIC(15,2) NOT NULL DEFAULT 0 CHECK (compensation_amount >= 0),
  current_step SMALLINT NOT NULL DEFAULT 1 CHECK (current_step BETWEEN 1 AND 5),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','agreed','inspecting','completed','rejected','cancelled')),
  note TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), completed_at TIMESTAMPTZ,
  CHECK (proposer_id <> receiver_id)
);
CREATE INDEX IF NOT EXISTS idx_trades_proposer ON trades(proposer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trades_receiver ON trades(receiver_id, created_at DESC);

CREATE TABLE IF NOT EXISTS trade_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL, from_status VARCHAR(20), to_status VARCHAR(20) NOT NULL,
  from_step SMALLINT, to_step SMALLINT, note TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT, trade_id UUID REFERENCES trades(id) ON DELETE SET NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5), comment TEXT NOT NULL DEFAULT '', tags TEXT[] NOT NULL DEFAULT '{}',
  is_verified_trade BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reviews_listing ON reviews(listing_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);

CREATE TABLE IF NOT EXISTS review_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT, content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS review_helpful_votes (
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(review_id, user_id)
);

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), trade_id UUID NOT NULL UNIQUE REFERENCES trades(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS conversation_participants (
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, last_read_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), PRIMARY KEY(conversation_id, user_id)
);
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT, content TEXT NOT NULL,
  message_type VARCHAR(20) NOT NULL DEFAULT 'text' CHECK (message_type IN ('text','image')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), edited_at TIMESTAMPTZ, deleted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);

CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title VARCHAR(255) NOT NULL,
  cost_points INTEGER NOT NULL CHECK (cost_points >= 0), category VARCHAR(20) NOT NULL CHECK (category IN ('voucher','service','gift')),
  icon VARCHAR(50), description TEXT NOT NULL DEFAULT '', discount_value VARCHAR(100), is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_rewards_title UNIQUE(title)
);
CREATE TABLE IF NOT EXISTS reward_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  reward_id UUID NOT NULL REFERENCES rewards(id) ON DELETE RESTRICT, points_spent INTEGER NOT NULL CHECK (points_spent >= 0),
  redemption_code VARCHAR(50) NOT NULL UNIQUE, status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','used','expired','cancelled')),
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), expires_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS user_points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  points INTEGER NOT NULL CHECK (points <> 0), transaction_type VARCHAR(30) NOT NULL,
  description TEXT NOT NULL DEFAULT '', trade_id UUID REFERENCES trades(id) ON DELETE SET NULL,
  redemption_id UUID REFERENCES reward_redemptions(id) ON DELETE SET NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_points_user_created ON user_points_transactions(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS website_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1), brand_name VARCHAR(150) NOT NULL DEFAULT 'CEP.EXCHANGE',
  brand_slogan VARCHAR(255) NOT NULL DEFAULT '', hero_title VARCHAR(255) NOT NULL DEFAULT '', hero_highlight VARCHAR(255) NOT NULL DEFAULT '',
  hero_description TEXT NOT NULL DEFAULT '', hero_badge_text TEXT NOT NULL DEFAULT '', hotline VARCHAR(30) NOT NULL DEFAULT '',
  support_email VARCHAR(255) NOT NULL DEFAULT '', inspection_address TEXT NOT NULL DEFAULT '', announcement_banner TEXT NOT NULL DEFAULT '',
  announcement_active BOOLEAN NOT NULL DEFAULT FALSE, updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL, entity_type VARCHAR(50) NOT NULL, entity_id UUID, details JSONB,
  ip_address INET, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
