-- Extensión del esquema de base de datos para la aplicación de gestión de clubes de pádel

-- Tabla de administradores de clubes
CREATE TABLE dev.club_admins (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    username varchar NOT NULL,
    password varchar NOT NULL,
    email varchar NOT NULL,
    first_name varchar,
    last_name varchar,
    club_id uuid NOT NULL,
    is_super_admin boolean NOT NULL DEFAULT false,
    last_login timestamptz,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT club_admins_pkey PRIMARY KEY (id),
    CONSTRAINT club_admins_username_key UNIQUE (username),
    CONSTRAINT club_admins_email_key UNIQUE (email),
    CONSTRAINT club_admins_club_id_fkey FOREIGN KEY (club_id) REFERENCES dev.clubs(id)
);

-- Tabla para configuraciones de matchmaking
CREATE TABLE dev.matchmaking_settings (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    club_id uuid NOT NULL,
    min_skill_difference float8 NOT NULL DEFAULT 2.0,
    max_skill_difference float8 NOT NULL DEFAULT 5.0,
    min_matches_for_trueskill int4 NOT NULL DEFAULT 10,
    consider_preferred_side boolean NOT NULL DEFAULT true,
    consider_gender boolean NOT NULL DEFAULT false,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT matchmaking_settings_pkey PRIMARY KEY (id),
    CONSTRAINT matchmaking_settings_club_id_fkey FOREIGN KEY (club_id) REFERENCES dev.clubs(id)
);

-- Tabla para disponibilidad de jugadores
CREATE TABLE dev.player_availability (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    player_id uuid NOT NULL,
    day_of_week int4 NOT NULL, -- 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    start_time time NOT NULL,
    end_time time NOT NULL,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT player_availability_pkey PRIMARY KEY (id),
    CONSTRAINT player_availability_player_id_fkey FOREIGN KEY (player_id) REFERENCES dev.players(id) ON DELETE CASCADE
);

-- Tabla para solicitudes de partidos
CREATE TABLE dev.match_requests (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    club_id uuid NOT NULL,
    requested_by_id uuid NOT NULL,
    status varchar NOT NULL DEFAULT 'pending', -- pending, processing, completed, cancelled
    preferred_date timestamptz,
    notes text,
    match_id uuid, -- Referencia al partido creado (si se completa)
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT match_requests_pkey PRIMARY KEY (id),
    CONSTRAINT match_requests_club_id_fkey FOREIGN KEY (club_id) REFERENCES dev.clubs(id),
    CONSTRAINT match_requests_requested_by_id_fkey FOREIGN KEY (requested_by_id) REFERENCES dev.players(id),
    CONSTRAINT match_requests_match_id_fkey FOREIGN KEY (match_id) REFERENCES dev.matches(id)
);

-- Tabla para jugadores en solicitudes de partidos
CREATE TABLE dev.match_request_players (
    match_request_id uuid NOT NULL,
    player_id uuid NOT NULL,
    status varchar NOT NULL DEFAULT 'invited', -- invited, confirmed, rejected
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT match_request_players_pkey PRIMARY KEY (match_request_id, player_id),
    CONSTRAINT match_request_players_match_request_id_fkey FOREIGN KEY (match_request_id) REFERENCES dev.match_requests(id) ON DELETE CASCADE,
    CONSTRAINT match_request_players_player_id_fkey FOREIGN KEY (player_id) REFERENCES dev.players(id)
);

-- Tabla para sugerencias de matchmaking
CREATE TABLE dev.matchmaking_suggestions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    club_id uuid NOT NULL,
    player1_id uuid NOT NULL,
    player2_id uuid NOT NULL,
    player3_id uuid NOT NULL,
    player4_id uuid NOT NULL,
    team1_skill float8 NOT NULL,
    team2_skill float8 NOT NULL,
    balance_score float8 NOT NULL, -- Puntuación de equilibrio (0-100)
    status varchar NOT NULL DEFAULT 'pending', -- pending, accepted, rejected
    match_id uuid, -- Referencia al partido creado (si se acepta)
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT matchmaking_suggestions_pkey PRIMARY KEY (id),
    CONSTRAINT matchmaking_suggestions_club_id_fkey FOREIGN KEY (club_id) REFERENCES dev.clubs(id),
    CONSTRAINT matchmaking_suggestions_player1_id_fkey FOREIGN KEY (player1_id) REFERENCES dev.players(id),
    CONSTRAINT matchmaking_suggestions_player2_id_fkey FOREIGN KEY (player2_id) REFERENCES dev.players(id),
    CONSTRAINT matchmaking_suggestions_player3_id_fkey FOREIGN KEY (player3_id) REFERENCES dev.players(id),
    CONSTRAINT matchmaking_suggestions_player4_id_fkey FOREIGN KEY (player4_id) REFERENCES dev.players(id),
    CONSTRAINT matchmaking_suggestions_match_id_fkey FOREIGN KEY (match_id) REFERENCES dev.matches(id)
);

-- Tabla para participantes en eventos
CREATE TABLE dev.event_participants (
    event_id uuid NOT NULL,
    player_id uuid NOT NULL,
    status varchar NOT NULL DEFAULT 'registered', -- registered, confirmed, cancelled
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT event_participants_pkey PRIMARY KEY (event_id, player_id),
    CONSTRAINT event_participants_event_id_fkey FOREIGN KEY (event_id) REFERENCES dev.events(id) ON DELETE CASCADE,
    CONSTRAINT event_participants_player_id_fkey FOREIGN KEY (player_id) REFERENCES dev.players(id)
);

-- Tabla para torneos (extensión de eventos)
CREATE TABLE dev.tournaments (
    id uuid NOT NULL,
    format varchar NOT NULL, -- knockout, round-robin, groups
    rounds int4 NOT NULL DEFAULT 1,
    players_per_match int4 NOT NULL DEFAULT 4,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT tournaments_pkey PRIMARY KEY (id),
    CONSTRAINT tournaments_id_fkey FOREIGN KEY (id) REFERENCES dev.events(id) ON DELETE CASCADE
);

-- Tabla para partidos de torneos
CREATE TABLE dev.tournament_matches (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    tournament_id uuid NOT NULL,
    match_id uuid NOT NULL,
    round int4 NOT NULL,
    position int4 NOT NULL,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT tournament_matches_pkey PRIMARY KEY (id),
    CONSTRAINT tournament_matches_tournament_id_fkey FOREIGN KEY (tournament_id) REFERENCES dev.tournaments(id) ON DELETE CASCADE,
    CONSTRAINT tournament_matches_match_id_fkey FOREIGN KEY (match_id) REFERENCES dev.matches(id)
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_club_admins_club_id ON dev.club_admins(club_id);
CREATE INDEX idx_matchmaking_settings_club_id ON dev.matchmaking_settings(club_id);
CREATE INDEX idx_player_availability_player_id ON dev.player_availability(player_id);
CREATE INDEX idx_match_requests_club_id ON dev.match_requests(club_id);
CREATE INDEX idx_match_requests_requested_by_id ON dev.match_requests(requested_by_id);
CREATE INDEX idx_match_request_players_match_request_id ON dev.match_request_players(match_request_id);
CREATE INDEX idx_matchmaking_suggestions_club_id ON dev.matchmaking_suggestions(club_id);
CREATE INDEX idx_event_participants_event_id ON dev.event_participants(event_id);
CREATE INDEX idx_tournament_matches_tournament_id ON dev.tournament_matches(tournament_id);
