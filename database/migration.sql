-- Script de migración para extender la base de datos con las tablas necesarias para la aplicación de gestión de clubes de pádel

-- Función para determinar el esquema actual
DO $$
DECLARE
    schema_name TEXT;
BEGIN
    -- Establecer el esquema según el entorno (dev, demo, prod)
    schema_name := current_setting('app.current_schema', true);
    
    IF schema_name IS NULL THEN
        schema_name := 'dev'; -- Valor por defecto si no está configurado
    END IF;

    -- Crear tabla de administradores de clubes
    EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.club_admins (
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
        CONSTRAINT club_admins_club_id_fkey FOREIGN KEY (club_id) REFERENCES %I.clubs(id)
    )', schema_name, schema_name);

    -- Crear tabla para configuraciones de matchmaking
    EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.matchmaking_settings (
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
        CONSTRAINT matchmaking_settings_club_id_fkey FOREIGN KEY (club_id) REFERENCES %I.clubs(id)
    )', schema_name, schema_name);

    -- Crear tabla para disponibilidad de jugadores
    EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.player_availability (
        id uuid NOT NULL DEFAULT gen_random_uuid(),
        player_id uuid NOT NULL,
        day_of_week int4 NOT NULL,
        start_time time NOT NULL,
        end_time time NOT NULL,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT player_availability_pkey PRIMARY KEY (id),
        CONSTRAINT player_availability_player_id_fkey FOREIGN KEY (player_id) REFERENCES %I.players(id) ON DELETE CASCADE
    )', schema_name, schema_name);

    -- Crear tabla para solicitudes de partidos
    EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.match_requests (
        id uuid NOT NULL DEFAULT gen_random_uuid(),
        club_id uuid NOT NULL,
        requested_by_id uuid NOT NULL,
        status varchar NOT NULL DEFAULT ''pending'',
        preferred_date timestamptz,
        notes text,
        match_id uuid,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT match_requests_pkey PRIMARY KEY (id),
        CONSTRAINT match_requests_club_id_fkey FOREIGN KEY (club_id) REFERENCES %I.clubs(id),
        CONSTRAINT match_requests_requested_by_id_fkey FOREIGN KEY (requested_by_id) REFERENCES %I.players(id),
        CONSTRAINT match_requests_match_id_fkey FOREIGN KEY (match_id) REFERENCES %I.matches(id)
    )', schema_name, schema_name, schema_name, schema_name);

    -- Crear tabla para jugadores en solicitudes de partidos
    EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.match_request_players (
        match_request_id uuid NOT NULL,
        player_id uuid NOT NULL,
        status varchar NOT NULL DEFAULT ''invited'',
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT match_request_players_pkey PRIMARY KEY (match_request_id, player_id),
        CONSTRAINT match_request_players_match_request_id_fkey FOREIGN KEY (match_request_id) REFERENCES %I.match_requests(id) ON DELETE CASCADE,
        CONSTRAINT match_request_players_player_id_fkey FOREIGN KEY (player_id) REFERENCES %I.players(id)
    )', schema_name, schema_name, schema_name);

    -- Crear tabla para sugerencias de matchmaking
    EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.matchmaking_suggestions (
        id uuid NOT NULL DEFAULT gen_random_uuid(),
        club_id uuid NOT NULL,
        player1_id uuid NOT NULL,
        player2_id uuid NOT NULL,
        player3_id uuid NOT NULL,
        player4_id uuid NOT NULL,
        team1_skill float8 NOT NULL,
        team2_skill float8 NOT NULL,
        balance_score float8 NOT NULL,
        status varchar NOT NULL DEFAULT ''pending'',
        match_id uuid,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT matchmaking_suggestions_pkey PRIMARY KEY (id),
        CONSTRAINT matchmaking_suggestions_club_id_fkey FOREIGN KEY (club_id) REFERENCES %I.clubs(id),
        CONSTRAINT matchmaking_suggestions_player1_id_fkey FOREIGN KEY (player1_id) REFERENCES %I.players(id),
        CONSTRAINT matchmaking_suggestions_player2_id_fkey FOREIGN KEY (player2_id) REFERENCES %I.players(id),
        CONSTRAINT matchmaking_suggestions_player3_id_fkey FOREIGN KEY (player3_id) REFERENCES %I.players(id),
        CONSTRAINT matchmaking_suggestions_player4_id_fkey FOREIGN KEY (player4_id) REFERENCES %I.players(id),
        CONSTRAINT matchmaking_suggestions_match_id_fkey FOREIGN KEY (match_id) REFERENCES %I.matches(id)
    )', schema_name, schema_name, schema_name, schema_name, schema_name, schema_name, schema_name);

    -- Crear tabla para participantes en eventos
    EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.event_participants (
        event_id uuid NOT NULL,
        player_id uuid NOT NULL,
        status varchar NOT NULL DEFAULT ''registered'',
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT event_participants_pkey PRIMARY KEY (event_id, player_id),
        CONSTRAINT event_participants_event_id_fkey FOREIGN KEY (event_id) REFERENCES %I.events(id) ON DELETE CASCADE,
        CONSTRAINT event_participants_player_id_fkey FOREIGN KEY (player_id) REFERENCES %I.players(id)
    )', schema_name, schema_name, schema_name);

    -- Crear tabla para torneos (extensión de eventos)
    EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.tournaments (
        id uuid NOT NULL,
        format varchar NOT NULL,
        rounds int4 NOT NULL DEFAULT 1,
        players_per_match int4 NOT NULL DEFAULT 4,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT tournaments_pkey PRIMARY KEY (id),
        CONSTRAINT tournaments_id_fkey FOREIGN KEY (id) REFERENCES %I.events(id) ON DELETE CASCADE
    )', schema_name, schema_name);

    -- Crear tabla para partidos de torneos
    EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.tournament_matches (
        id uuid NOT NULL DEFAULT gen_random_uuid(),
        tournament_id uuid NOT NULL,
        match_id uuid NOT NULL,
        round int4 NOT NULL,
        position int4 NOT NULL,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT tournament_matches_pkey PRIMARY KEY (id),
        CONSTRAINT tournament_matches_tournament_id_fkey FOREIGN KEY (tournament_id) REFERENCES %I.tournaments(id) ON DELETE CASCADE,
        CONSTRAINT tournament_matches_match_id_fkey FOREIGN KEY (match_id) REFERENCES %I.matches(id)
    )', schema_name, schema_name, schema_name);

    -- Crear índices para mejorar el rendimiento
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_club_admins_club_id ON %I.club_admins(club_id)', schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_matchmaking_settings_club_id ON %I.matchmaking_settings(club_id)', schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_player_availability_player_id ON %I.player_availability(player_id)', schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_match_requests_club_id ON %I.match_requests(club_id)', schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_match_requests_requested_by_id ON %I.match_requests(requested_by_id)', schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_match_request_players_match_request_id ON %I.match_request_players(match_request_id)', schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_matchmaking_suggestions_club_id ON %I.matchmaking_suggestions(club_id)', schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON %I.event_participants(event_id)', schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_tournament_matches_tournament_id ON %I.tournament_matches(tournament_id)', schema_name);

END $$;
