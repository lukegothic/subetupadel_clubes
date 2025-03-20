-- Esquema de base de datos para la aplicación de gestión de clubes de pádel

-- Tabla de clubes
CREATE TABLE dev.clubs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    logo VARCHAR(255),
    address VARCHAR(255),
    postal_code VARCHAR(10),
    city VARCHAR(100),
    country VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(255),
    is_premium BOOLEAN DEFAULT false,
    is_partner BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de raquetas
CREATE TABLE dev.rackets (
    id SERIAL PRIMARY KEY,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de jugadores
CREATE TABLE dev.players (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    birth_date DATE,
    preferred_side VARCHAR(10) CHECK (preferred_side IN ('right', 'left', 'both')),
    handiness VARCHAR(10) CHECK (handiness IN ('right', 'left', 'ambidextrous')),
    mu FLOAT DEFAULT 25.0,
    sigma FLOAT DEFAULT 8.33,
    trueskill FLOAT DEFAULT 0.0,
    matches_played INTEGER DEFAULT 0,
    matches_won INTEGER DEFAULT 0,
    matches_last_ten_result VARCHAR(10) DEFAULT '',
    matches_consecutive_wins INTEGER DEFAULT 0,
    matches_consecutive_wins_max INTEGER DEFAULT 0,
    postal_code VARCHAR(10),
    postal_code_visible BOOLEAN DEFAULT true,
    club_id INTEGER REFERENCES clubs(id),
    racket_id INTEGER REFERENCES rackets(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de partidos
CREATE TABLE dev.matches (
    id SERIAL PRIMARY KEY,
    is_result_validated BOOLEAN DEFAULT false,
    played_on TIMESTAMP,
    created_by_id INTEGER REFERENCES dev.players(id),
    reported_by_id INTEGER REFERENCES dev.players(id),
    reported_by_team_id INTEGER,
    validated_by_id INTEGER REFERENCES dev.players(id),
    club_id INTEGER REFERENCES dev.clubs(id),
    result JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de relación entre jugadores y partidos
CREATE TABLE dev.match_players (
    id SERIAL PRIMARY KEY,
    match_id INTEGER REFERENCES dev.matches(id) ON DELETE CASCADE,
    player_id INTEGER REFERENCES dev.players(id) ON DELETE CASCADE,
    team_id INTEGER NOT NULL,
    history_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (match_id, player_id)
);

-- Tabla de eventos
CREATE TABLE dev.events (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    registration_start_date TIMESTAMP,
    registration_end_date TIMESTAMP,
    price DECIMAL(10, 2),
    available_slots INTEGER,
    club_id INTEGER REFERENCES clubs(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de participantes en eventos
CREATE TABLE dev.event_participants (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES dev.events(id) ON DELETE CASCADE,
    player_id INTEGER REFERENCES dev.players(id) ON DELETE CASCADE,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'registered',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (event_id, player_id)
);

-- Tabla de administradores
CREATE TABLE dev.admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    club_id INTEGER REFERENCES clubs(id),
    is_super_admin BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_players_club ON dev.players(club_id);
CREATE INDEX idx_matches_club ON dev.matches(club_id);
CREATE INDEX idx_match_players_match ON dev.match_players(match_id);
CREATE INDEX idx_match_players_player ON dev.match_players(player_id);
CREATE INDEX idx_events_club ON dev.events(club_id);
CREATE INDEX idx_event_participants_event ON dev.event_participants(event_id);
CREATE INDEX idx_event_participants_player ON dev.event_participants(player_id);
