-- EPROMS Database Schema
-- Electronic Patient Recorded Outcome Measures System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (both clinicians and patients)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(50) NOT NULL CHECK (role IN ('clinician', 'patient', 'admin')),
    nhs_sso_id VARCHAR(255) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patients table (medical records)
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    nhs_number VARCHAR(10) UNIQUE NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20),
    cancer_type VARCHAR(100) NOT NULL,
    cancer_stage VARCHAR(50),
    diagnosis_date DATE NOT NULL,
    primary_clinician_id UUID REFERENCES users(id),
    hospital_number VARCHAR(50),
    contact_preference VARCHAR(50) DEFAULT 'email' CHECK (contact_preference IN ('email', 'sms', 'both', 'none')),
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Treatment plans
CREATE TABLE treatment_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    treatment_name VARCHAR(255) NOT NULL,
    treatment_type VARCHAR(100) NOT NULL,
    protocol_name VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE,
    planned_cycles INTEGER,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('planned', 'active', 'completed', 'discontinued')),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Treatment cycles
CREATE TABLE treatment_cycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    treatment_plan_id UUID REFERENCES treatment_plans(id) ON DELETE CASCADE,
    cycle_number INTEGER NOT NULL,
    scheduled_date DATE NOT NULL,
    actual_date DATE,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'delayed', 'cancelled')),
    delay_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CTCAE categories (Common Terminology Criteria for Adverse Events)
CREATE TABLE ctcae_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CTCAE adverse events (side effects catalog)
CREATE TABLE ctcae_adverse_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES ctcae_categories(id),
    event_name VARCHAR(255) NOT NULL UNIQUE,
    meddra_code VARCHAR(50),
    grade_1_description TEXT,
    grade_2_description TEXT,
    grade_3_description TEXT,
    grade_4_description TEXT,
    grade_5_description TEXT,
    patient_friendly_name VARCHAR(255),
    patient_friendly_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patient reported side effects
CREATE TABLE patient_side_effects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    treatment_cycle_id UUID REFERENCES treatment_cycles(id),
    ctcae_event_id UUID REFERENCES ctcae_adverse_events(id) NOT NULL,
    grade INTEGER NOT NULL CHECK (grade >= 1 AND grade <= 5),
    onset_date DATE NOT NULL,
    resolution_date DATE,
    is_ongoing BOOLEAN DEFAULT TRUE,
    severity_score INTEGER CHECK (severity_score >= 1 AND severity_score <= 10),
    impact_on_daily_life VARCHAR(50) CHECK (impact_on_daily_life IN ('none', 'mild', 'moderate', 'severe')),
    patient_notes TEXT,
    clinician_review_status VARCHAR(50) DEFAULT 'pending' CHECK (clinician_review_status IN ('pending', 'reviewed', 'action_required', 'resolved')),
    clinician_notes TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    requires_urgent_attention BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('reminder', 'alert', 'info', 'urgent')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    sent_via_email BOOLEAN DEFAULT FALSE,
    sent_via_sms BOOLEAN DEFAULT FALSE,
    scheduled_for TIMESTAMP,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointments
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    clinician_id UUID REFERENCES users(id),
    appointment_type VARCHAR(100) NOT NULL,
    scheduled_date TIMESTAMP NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log for compliance
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    changes JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_nhs_sso_id ON users(nhs_sso_id);
CREATE INDEX idx_patients_nhs_number ON patients(nhs_number);
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_patients_primary_clinician ON patients(primary_clinician_id);
CREATE INDEX idx_treatment_plans_patient ON treatment_plans(patient_id);
CREATE INDEX idx_treatment_cycles_plan ON treatment_cycles(treatment_plan_id);
CREATE INDEX idx_patient_side_effects_patient ON patient_side_effects(patient_id);
CREATE INDEX idx_patient_side_effects_status ON patient_side_effects(clinician_review_status);
CREATE INDEX idx_patient_side_effects_urgent ON patient_side_effects(requires_urgent_attention);
CREATE INDEX idx_patient_side_effects_date ON patient_side_effects(onset_date);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_clinician ON appointments(clinician_id);
CREATE INDEX idx_appointments_date ON appointments(scheduled_date);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);

-- Insert CTCAE categories
INSERT INTO ctcae_categories (category_name, description) VALUES
('Blood and lymphatic system disorders', 'Disorders affecting blood cells and lymphatic system'),
('Cardiac disorders', 'Disorders of the heart'),
('Gastrointestinal disorders', 'Disorders of the digestive system'),
('General disorders', 'General symptoms and conditions'),
('Infections and infestations', 'Infectious diseases'),
('Metabolism and nutrition disorders', 'Metabolic and nutritional disorders'),
('Musculoskeletal and connective tissue disorders', 'Disorders of muscles, bones, and connective tissue'),
('Nervous system disorders', 'Disorders of the nervous system'),
('Psychiatric disorders', 'Mental health disorders'),
('Renal and urinary disorders', 'Kidney and urinary system disorders'),
('Respiratory disorders', 'Disorders of the respiratory system'),
('Skin and subcutaneous tissue disorders', 'Skin-related disorders'),
('Vascular disorders', 'Blood vessel disorders');

-- Insert common CTCAE adverse events
INSERT INTO ctcae_adverse_events (category_id, event_name, patient_friendly_name, grade_1_description, grade_2_description, grade_3_description, grade_4_description, grade_5_description) VALUES
((SELECT id FROM ctcae_categories WHERE category_name = 'Gastrointestinal disorders'), 'Nausea', 'Feeling sick',
'Loss of appetite without alteration in eating habits',
'Oral intake decreased without significant weight loss, dehydration or malnutrition',
'Inadequate oral caloric or fluid intake; tube feeding, TPN, or hospitalization indicated',
'Life-threatening consequences; urgent intervention indicated',
'Death'),
((SELECT id FROM ctcae_categories WHERE category_name = 'Gastrointestinal disorders'), 'Vomiting', 'Being sick/vomiting',
'1-2 episodes in 24 hrs',
'3-5 episodes in 24 hrs',
'>=6 episodes in 24 hrs; tube feeding, TPN or hospitalization indicated',
'Life-threatening consequences; urgent intervention indicated',
'Death'),
((SELECT id FROM ctcae_categories WHERE category_name = 'Gastrointestinal disorders'), 'Diarrhea', 'Diarrhea/loose stools',
'Increase of <4 stools per day over baseline',
'Increase of 4-6 stools per day over baseline',
'Increase of >=7 stools per day over baseline; hospitalization indicated',
'Life-threatening consequences; urgent intervention indicated',
'Death'),
((SELECT id FROM ctcae_categories WHERE category_name = 'Gastrointestinal disorders'), 'Constipation', 'Constipation',
'Occasional or intermittent symptoms; occasional use of stool softeners, laxatives, dietary modification, or enema',
'Persistent symptoms with regular use of laxatives or enemas',
'Obstipation with manual evacuation indicated',
'Life-threatening consequences; urgent intervention indicated',
'Death'),
((SELECT id FROM ctcae_categories WHERE category_name = 'General disorders'), 'Fatigue', 'Tiredness/fatigue',
'Fatigue relieved by rest',
'Fatigue not relieved by rest; limiting instrumental ADL',
'Fatigue not relieved by rest; limiting self care ADL',
NULL,
NULL),
((SELECT id FROM ctcae_categories WHERE category_name = 'General disorders'), 'Fever', 'High temperature/fever',
'38.0-39.0°C (100.4-102.2°F)',
'>39.0-40.0°C (102.3-104.0°F)',
'>40.0°C (>104.0°F) for <=24 hrs',
'>40.0°C (>104.0°F) for >24 hrs',
'Death'),
((SELECT id FROM ctcae_categories WHERE category_name = 'Nervous system disorders'), 'Headache', 'Headache',
'Mild pain',
'Moderate pain; limiting instrumental ADL',
'Severe pain; limiting self care ADL',
NULL,
NULL),
((SELECT id FROM ctcae_categories WHERE category_name = 'Nervous system disorders'), 'Peripheral sensory neuropathy', 'Numbness and tingling',
'Asymptomatic; loss of deep tendon reflexes or paresthesia',
'Moderate symptoms; limiting instrumental ADL',
'Severe symptoms; limiting self care ADL',
'Life-threatening; urgent intervention indicated',
'Death'),
((SELECT id FROM ctcae_categories WHERE category_name = 'Skin and subcutaneous tissue disorders'), 'Rash', 'Skin rash',
'Rash covering <10% BSA',
'Rash covering 10-30% BSA',
'Rash covering >30% BSA',
'Life-threatening consequences; urgent intervention indicated',
'Death'),
((SELECT id FROM ctcae_categories WHERE category_name = 'Skin and subcutaneous tissue disorders'), 'Alopecia', 'Hair loss',
'Hair loss of <50% of normal',
'Hair loss of >=50% of normal',
NULL,
NULL,
NULL),
((SELECT id FROM ctcae_categories WHERE category_name = 'Blood and lymphatic system disorders'), 'Anemia', 'Low blood count (anemia)',
'Hemoglobin <LLN-10.0 g/dL; <LLN-6.2 mmol/L',
'Hemoglobin <10.0-8.0 g/dL; <6.2-4.9 mmol/L',
'Hemoglobin <8.0 g/dL; <4.9 mmol/L; transfusion indicated',
'Life-threatening consequences; urgent intervention indicated',
'Death'),
((SELECT id FROM ctcae_categories WHERE category_name = 'Psychiatric disorders'), 'Anxiety', 'Anxiety/worry',
'Mild symptoms',
'Moderate symptoms; limiting instrumental ADL',
'Severe symptoms; limiting self care ADL',
'Life-threatening consequences',
'Death'),
((SELECT id FROM ctcae_categories WHERE category_name = 'Psychiatric disorders'), 'Depression', 'Low mood/depression',
'Mild symptoms',
'Moderate symptoms; limiting instrumental ADL',
'Severe symptoms; limiting self care ADL',
'Life-threatening consequences',
'Death'),
((SELECT id FROM ctcae_categories WHERE category_name = 'Musculoskeletal and connective tissue disorders'), 'Arthralgia', 'Joint pain',
'Mild pain',
'Moderate pain; limiting instrumental ADL',
'Severe pain; limiting self care ADL',
NULL,
NULL),
((SELECT id FROM ctcae_categories WHERE category_name = 'Musculoskeletal and connective tissue disorders'), 'Myalgia', 'Muscle pain',
'Mild pain',
'Moderate pain; limiting instrumental ADL',
'Severe pain; limiting self care ADL',
NULL,
NULL),
((SELECT id FROM ctcae_categories WHERE category_name = 'Respiratory disorders'), 'Dyspnea', 'Shortness of breath',
'Shortness of breath with moderate exertion',
'Shortness of breath with minimal exertion; limiting instrumental ADL',
'Shortness of breath at rest; limiting self care ADL',
'Life-threatening consequences; urgent intervention indicated',
'Death'),
((SELECT id FROM ctcae_categories WHERE category_name = 'Respiratory disorders'), 'Cough', 'Cough',
'Mild symptoms',
'Moderate symptoms; limiting instrumental ADL',
'Severe symptoms; limiting self care ADL',
NULL,
NULL),
((SELECT id FROM ctcae_categories WHERE category_name = 'Gastrointestinal disorders'), 'Mucositis oral', 'Mouth sores',
'Asymptomatic or mild symptoms',
'Moderate pain; not interfering with oral intake',
'Severe pain; interfering with oral intake',
'Life-threatening consequences; urgent intervention indicated',
'Death');
