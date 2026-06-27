-- supabase/setup.sql

CREATE TYPE user_role AS ENUM ('WAITER', 'KDS', 'CASHIER', 'MANAGER');
CREATE TYPE table_status AS ENUM ('FREE', 'OCCUPIED', 'SENT', 'PAID');
CREATE TYPE item_status AS ENUM ('NEW', 'PREPARING', 'READY', 'COMPLETED');

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE outlets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    outlet_id UUID REFERENCES outlets(id),
    role user_role NOT NULL,
    pin_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    outlet_id UUID REFERENCES outlets(id) NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    cgst_rate DECIMAL(5, 2) DEFAULT 2.50,
    sgst_rate DECIMAL(5, 2) DEFAULT 2.50,
    is_low_stock BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    outlet_id UUID REFERENCES outlets(id) NOT NULL,
    table_number INT NOT NULL,
    status table_status DEFAULT 'FREE',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID REFERENCES tables(id) NOT NULL,
    outlet_id UUID REFERENCES outlets(id) NOT NULL,
    manager_approval_required BOOLEAN DEFAULT FALSE,
    manager_approved BOOLEAN DEFAULT FALSE,
    payment_method VARCHAR(50),
    split_count INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) NOT NULL,
    menu_item_id UUID REFERENCES menu_items(id) NOT NULL,
    status item_status DEFAULT 'NEW',
    modifiers JSONB DEFAULT '{}'::jsonb,
    split_group INT DEFAULT 1,
    fired_at TIMESTAMPTZ DEFAULT NOW(),
    bumped_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE outlets ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- For this build-a-thon, we grant fully permissive access to the `anon` role so the client app can mutate data directly.
CREATE POLICY "Enable all for anon" ON organizations FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for anon" ON properties FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for anon" ON outlets FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for anon" ON users FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for anon" ON menu_items FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for anon" ON tables FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for anon" ON orders FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for anon" ON order_items FOR ALL TO anon USING (true) WITH CHECK (true);

-- Turn on realtime for needed tables
ALTER PUBLICATION supabase_realtime ADD TABLE tables;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Seed Data (Ensuring the specific OUTLET_ID used in code exists)
INSERT INTO organizations (id, name) VALUES ('11111111-1111-1111-1111-111111111111', 'DineOS Hospitality');
INSERT INTO properties (id, organization_id, name) VALUES ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Downtown Hotel');
INSERT INTO outlets (id, property_id, name) VALUES ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Rooftop Bar');

-- Seed initial tables for this outlet
INSERT INTO tables (id, outlet_id, table_number, status) VALUES 
(gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 1, 'FREE'),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 2, 'FREE'),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 3, 'FREE'),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 4, 'FREE');

-- Seed initial menu items
INSERT INTO menu_items (id, outlet_id, name, price, cgst_rate, sgst_rate) VALUES 
(gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Wagyu Burger', 450.00, 2.5, 2.5),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Truffle Fries', 250.00, 2.5, 2.5),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Craft IPA', 300.00, 2.5, 2.5),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Margherita Pizza', 350.00, 2.5, 2.5);
