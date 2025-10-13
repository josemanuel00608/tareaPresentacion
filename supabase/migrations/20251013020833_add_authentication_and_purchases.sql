/*
  # Add Authentication and Purchase System

  ## Summary
  This migration extends the platform with user authentication, purchase tracking, and payment methods.

  ## New Tables

  ### `user_profiles`
  - `id` (uuid, primary key) - References auth.users
  - `full_name` (text) - User's full name
  - `email` (text) - User's email address
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `purchases`
  - `id` (uuid, primary key) - Unique purchase identifier
  - `user_id` (uuid, foreign key) - Reference to auth.users
  - `course_id` (uuid, foreign key) - Reference to courses table
  - `amount` (numeric) - Purchase amount
  - `payment_method` (text) - Payment method used (qr, tigo_money, bank_transfer, card)
  - `payment_status` (text) - Payment status (pending, verified, completed, failed)
  - `payment_proof_url` (text) - URL to payment proof image
  - `verification_email_sent` (boolean) - Whether verification email was sent
  - `created_at` (timestamptz) - Purchase creation timestamp
  - `verified_at` (timestamptz) - Payment verification timestamp

  ### `payment_methods`
  - `id` (uuid, primary key) - Unique identifier
  - `method_type` (text) - Type of payment method
  - `method_name` (text) - Display name
  - `account_number` (text) - Account or phone number
  - `qr_code_url` (text) - URL to QR code image
  - `instructions` (text) - Payment instructions
  - `is_active` (boolean) - Whether method is active
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security

  ### Row Level Security (RLS)
  - Enable RLS on all new tables
  - Users can view and update their own profile
  - Users can view their own purchases
  - Users can create purchases
  - Public can view active payment methods
  - Only authenticated users can make purchases

  ## Notes
  1. User profiles are linked to Supabase Auth users
  2. Purchase verification is handled via email confirmation
  3. Multiple payment methods are supported
  4. Payment proofs can be uploaded for verification
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  email text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE SET NULL,
  amount numeric(10, 2) NOT NULL,
  payment_method text NOT NULL,
  payment_status text DEFAULT 'pending',
  payment_proof_url text DEFAULT '',
  verification_email_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  verified_at timestamptz
);

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  method_type text NOT NULL,
  method_name text NOT NULL,
  account_number text DEFAULT '',
  qr_code_url text DEFAULT '',
  instructions text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_purchases_user ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_course ON purchases(course_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(payment_status);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create policies for purchases
CREATE POLICY "Users can view own purchases"
  ON purchases FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create purchases"
  ON purchases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for payment_methods
CREATE POLICY "Anyone can view active payment methods"
  ON payment_methods FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Insert default payment methods
INSERT INTO payment_methods (method_type, method_name, account_number, instructions, is_active) VALUES
  ('tigo_money', 'Tigo Money', '76082372', 'Envía el pago a este número de Tigo Money y envía una captura de pantalla como comprobante.', true),
  ('bank_transfer', 'Transferencia Bancaria', '1234567890', 'Realiza la transferencia a esta cuenta bancaria y envía el comprobante.', true),
  ('qr', 'Pago QR', '', 'Escanea el código QR para realizar el pago y envía una captura de pantalla como comprobante.', true),
  ('card', 'Tarjeta de Crédito/Débito', '', 'Ingresa los datos de tu tarjeta para procesar el pago de forma segura.', true)
ON CONFLICT DO NOTHING;
