from datetime import datetime, timezone, timedelta
from uuid import uuid4
from sqlalchemy import JSON, UUID, Boolean, Float, ForeignKey, Column, DateTime, Date, String, Integer, Time, inspect
from sqlalchemy.orm import DeclarativeBase, relationship
from app.utils.padel_trueskill import INITIAL_MU, INITIAL_SIGMA, INITIAL_TRUESKILL
from app.utils.dates import to_iso_string
from app.config import Config

# Obtener la configuración actual
config = Config()
CURRENT_SCHEMA = config.DB_SCHEMA

# Extensiones para la aplicación de gestión de clubes de pádel

class ClubAdmin(TimestampedModel):
    __tablename__ = "club_admins"

    id = Column(UUID(as_uuid=True), primary_key=True,
                unique=True, nullable=False, default=uuid4)
    username = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    club_id = Column(UUID(as_uuid=True), ForeignKey(
        f"{CURRENT_SCHEMA}.clubs.id"), nullable=False)
    is_super_admin = Column(Boolean, nullable=False, default=False)
    last_login = Column(DateTime(timezone=True), nullable=True)

    # Relación con Club
    club = relationship("Club", backref="admins")

    def __repr__(self):
        return f"<ClubAdmin(id={self.id}, username={self.username}, club_id={self.club_id})>"

    def to_dict(self):
        admin_dict = {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "club_id": self.club_id,
            "is_super_admin": self.is_super_admin,
            "last_login": to_iso_string(self.last_login) if self.last_login else None,
        }
        
        if not "club" in inspect(self).unloaded:
            admin_dict["club"] = self.club.to_dict() if self.club else None
            
        return admin_dict


class MatchmakingSettings(TimestampedModel):
    __tablename__ = "matchmaking_settings"

    id = Column(UUID(as_uuid=True), primary_key=True,
                unique=True, nullable=False, default=uuid4)
    club_id = Column(UUID(as_uuid=True), ForeignKey(
        f"{CURRENT_SCHEMA}.clubs.id"), nullable=False)
    min_skill_difference = Column(Float, nullable=False, default=2.0)
    max_skill_difference = Column(Float, nullable=False, default=5.0)
    min_matches_for_trueskill = Column(Integer, nullable=False, default=10)
    consider_preferred_side = Column(Boolean, nullable=False, default=True)
    consider_gender = Column(Boolean, nullable=False, default=False)

    # Relación con Club
    club = relationship("Club", backref="matchmaking_settings")

    def __repr__(self):
        return f"<MatchmakingSettings(id={self.id}, club_id={self.club_id})>"

    def to_dict(self):
        settings_dict = {
            "id": self.id,
            "club_id": self.club_id,
            "min_skill_difference": self.min_skill_difference,
            "max_skill_difference": self.max_skill_difference,
            "min_matches_for_trueskill": self.min_matches_for_trueskill,
            "consider_preferred_side": self.consider_preferred_side,
            "consider_gender": self.consider_gender,
        }
        
        if not "club" in inspect(self).unloaded:
            settings_dict["club"] = self.club.to_dict() if self.club else None
            
        return settings_dict


class PlayerAvailability(TimestampedModel):
    __tablename__ = "player_availability"

    id = Column(UUID(as_uuid=True), primary_key=True,
                unique=True, nullable=False, default=uuid4)
    player_id = Column(UUID(as_uuid=True), ForeignKey(
        f"{CURRENT_SCHEMA}.players.id", ondelete="CASCADE"), nullable=False)
    day_of_week = Column(Integer, nullable=False)  # 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)

    # Relación con Player
    player = relationship("Player", backref="availability")

    def __repr__(self):
        return f"<PlayerAvailability(id={self.id}, player_id={self.player_id}, day={self.day_of_week})>"

    def to_dict(self):
        availability_dict = {
            "id": self.id,
            "player_id": self.player_id,
            "day_of_week": self.day_of_week,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
        }
        
        if not "player" in inspect(self).unloaded:
            availability_dict["player"] = self.player.to_dict() if self.player else None
            
        return availability_dict


class MatchRequest(TimestampedModel):
    __tablename__ = "match_requests"

    id = Column(UUID(as_uuid=True), primary_key=True,
                unique=True, nullable=False, default=uuid4)
    club_id = Column(UUID(as_uuid=True), ForeignKey(
        f"{CURRENT_SCHEMA}.clubs.id"), nullable=False)
    requested_by_id = Column(UUID(as_uuid=True), ForeignKey(
        f"{CURRENT_SCHEMA}.players.id"), nullable=False)
    status = Column(String, nullable=False, default="pending")  # pending, processing, completed, cancelled
    preferred_date = Column(DateTime(timezone=True), nullable=True)
    notes = Column(String, nullable=True)
    match_id = Column(UUID(as_uuid=True), ForeignKey(
        f"{CURRENT_SCHEMA}.matches.id"), nullable=True)

    # Relaciones
    club = relationship("Club", backref="match_requests")
    requested_by = relationship("Player", foreign_keys=[requested_by_id], backref="requested_matches")
    match = relationship("Match", backref="match_request")
    players = relationship("MatchRequestPlayer", back_populates="match_request", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<MatchRequest(id={self.id}, club_id={self.club_id}, status={self.status})>"

    def to_dict(self):
        request_dict = {
            "id": self.id,
            "club_id": self.club_id,
            "requested_by_id": self.requested_by_id,
            "status": self.status,
            "preferred_date": to_iso_string(self.preferred_date) if self.preferred_date else None,
            "notes": self.notes,
            "match_id": self.match_id,
        }
        
        if not "club" in inspect(self).unloaded:
            request_dict["club"] = self.club.to_dict() if self.club else None
            
        if not "requested_by" in inspect(self).unloaded:
            request_dict["requested_by"] = self.requested_by.to_dict() if self.requested_by else None
            
        if not "match" in inspect(self).unloaded:
            request_dict["match"] = self.match.to_dict() if self.match else None
            
        if not "players" in inspect(self).unloaded:
            request_dict["players"] = [p.to_dict() for p in self.players] if self.players else []
            
        return request_dict


class MatchRequestPlayer(TimestampedModel):
    __tablename__ = "match_request_players"

    match_request_id = Column(UUID(as_uuid=True), ForeignKey(
        f"{CURRENT_SCHEMA}.match_requests.id", ondelete="CASCADE"), primary_key=True)
    player_id = Column(UUID(as_uuid=True), ForeignKey(
        f"{CURRENT_SCHEMA}.players.id"), primary_key=True)
    status = Column(String, nullable=False, default="invited")  # invited, confirmed, rejected

    # Relaciones
    match_request = relationship("MatchRequest", back_populates="players")
    player = relationship("Player", backref="match_request_participations")

    def __repr__(self):
        return f"<MatchRequestPlayer(request_id={self.match_request_id}, player_id={self.player_id}, status={self.status})>"

    def to_dict(self):
        player_dict = {
            "match_request_id": self.match_request_id,
            "player_id": self.player_id,
            "status": self.status,
        }
        
        if not "player" in inspect(self).unloaded:
            player_dict["player"] = self.player.to_dict() if self.player else None
            
        return player_dict


class MatchmakingSuggestion(TimestampedModel):
    __tablename__ = "matchmaking_suggestions"

    id = Column(UUID(as_uuid=True), primary_key=True,
                unique=True, nullable=False, default=uuid4)
    club_id = Column(UUID(as_uuid=True), ForeignKey(
        f"{CURRENT_SCHEMA}.clubs.id"), nullable=False)
    player1_id = Column(UUID(as_uuid=True), ForeignKey(
        f"{CURRENT_SCHEMA}.players.id"), nullable=False)
    player2_id = Column(UUID(as_uuid=True), ForeignKey(
        f"{CURRENT_SCHEMA}.players.id"), nullable=False)
    player3_id = Column(UUID(as_uuid=True), ForeignKey(
        f"{CURRENT_SCHEMA}.players.id"), nullable=False)
    player4_id = Column(UUID(as_uuid=True), ForeignKey(
        f"{CURRENT_SCHEMA}.players.id"), nullable=False)
    team1_skill = Column(Float, nullable=False)
    team2_skill = Column(Float, nullable=False)
    balance_score = Column(Float, nullable=False)
    status = Column(String, nullable=False, default="pending")  # pending, accepted, rejected
    match_id = Column(UUID(as_uuid=True), ForeignKey(
        f"{CURRENT_SCHEMA}.matches.id"), nullable=True)

    # Relaciones
    club = relationship("Club", backref="matchmaking_suggestions")
    player1 = relationship("Player", foreign_keys=[player1_id], backref="suggestions_as_player1")
    player2 = relationship("Player", foreign_keys=[player2_id], backref="suggestions_as_player2")
    player3 = relationship("Player", foreign_keys=[player3_id], backref="suggestions_as_player3")
    player4 = relationship("Player", foreign_keys=[player4_id], backref="suggestions_as_player4")
    match = relationship("Match", backref="matchmaking_suggestion")

    def __repr__(self):
        return f"<MatchmakingSuggestion(id={self.id}, club_id={self.club_id}, status={self.status})>"

    def to_dict(self):
        suggestion_dict = {
            "id": self.id,
            "club_id": self.club_id,
            "player1_id": self.player1_id,
            "player2_id": self.player2_id,
            "player3_id": self.player3_id,
            "player4_id": self.player4_id,
            "team1_skill": self.team1_skill,
            "team2_skill": self.team2_skill,
            "balance_score": self.balance_score,
            "status": self.status,
            "match_id": self.match_id,
        }
        
        if not "club" in inspect(self).unloaded:
            suggestion_dict["club"] = self.club.to_dict() if self.club else None
            
        if not "player1" in inspect(self).unloaded:
            suggestion_dict["player1"] = self.player1.to_dict() if self.player1 else None
            
        if not "player2" in inspect(self).unloaded:
            suggestion_dict["player2"] = self.player2.to_dict() if self.player2 else None
            
        if not "player3" in inspect(self).unloaded:
            suggestion_dict["player3"] = self.player3.to_dict() if self.player3 else None
            
        if not "player4" in inspect(self).unloaded:
            suggestion_dict["player4"] = self.player4.to_dict() if self.player4 else None
            
        if not "match" in inspect(self).unloaded:
            suggestion_dict["match"] = self.match.to_dict() if self.match else None
            
        return suggestion_dict


class EventParticipant(TimestampedModel):
    __tablename__ = "event_participants"

    event_id = Column(UUID(as_uuid=True), ForeignKey(
        f"{CURRENT_SCHEMA}.events.id", ondelete="CASCADE"), primary_key=True)
    player_id = Column(UUID(as_uuid=True), ForeignKey(
        f"{CURRENT_SCHEMA}.players.id"), primary_key=True)
    status = Column(String, nullable=False, default="registered")  # registered, confirmed, cancelled

    # Relaciones
    event = relationship("Event", backref="participants")
    player = relationship("Player", backref="event_participations")

    def __repr__(self):
        return f"<EventParticipant(event_id={self.event_id}, player_id={self.player_id}, status={self.status})>"

    def to_dict(self):
        participant_dict = {
            "event_id": self.event_id,
            "player_id": self.player_id,
            "status": self.status,
        }
        
        if not "event" in inspect(self).unloaded:
            participant_dict["event"] = self.event.to_dict() if self.event else None
            
        if not "player" in inspect(self).unloaded:
            participant_dict["player"] = self.player.to_dict() if self.player else None
            
        return participant_dict


class Tournament(TimestampedModel):
    __tablename__ = "tournaments"

    id = Column(UUID(as_uuid=True), ForeignKey(
        f"{CURRENT_SCHEMA}.events.id", ondelete="CASCADE"), primary_key=True)
    format = Column(String, nullable=False)  # knockout, round-robin, groups
    rounds = Column(Integer, nullable=False, default=1)
    players_per_match = Column(Integer, nullable=False, default=4)

    # Relación con Event (herencia)
    event = relationship("Event", backref="tournament_details", uselist=False)
    
    # Relación con TournamentMatch
    matches = relationship("TournamentMatch", back_populates="tournament", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Tournament(id={self.id}, format={self.format}, rounds={self.rounds})>"

    def to_dict(self):
        tournament_dict = {
            "id": self.id,
            "format": self.format,
            "rounds": self.rounds,
            "players_per_match": self.players_per_match,
        }
        
        if not "event" in inspect(self).unloaded:
            tournament_dict["event"] = self.event.to_dict() if self.event else None
            
        if not "matches" in inspect(self).unloaded:
            tournament_dict["matches"] = [m.to_dict() for m in self.matches] if self.matches else []
            
        return tournament_dict


class TournamentMatch(TimestampedModel):
    __tablename__ = "tournament_matches"

    id = Column(UUID(as_uuid=True), primary_key=True,
                unique=True, nullable=False, default=uuid4)
    tournament_id = Column(UUID(as_uuid=True), ForeignKey(
        f"{CURRENT_SCHEMA}.tournaments.id", ondelete="CASCADE"), nullable=False)
    match_id = Column(UUID(as_uuid=True), ForeignKey(
        f"{CURRENT_SCHEMA}.matches.id"), nullable=False)
    round = Column(Integer, nullable=False)
    position = Column(Integer, nullable=False)

    # Relaciones
    tournament = relationship("Tournament", back_populates="matches")
    match = relationship("Match", backref="tournament_match")

    def __repr__(self):
        return f"<TournamentMatch(id={self.id}, tournament_id={self.tournament_id}, round={self.round})>"

    def to_dict(self):
        match_dict = {
            "id": self.id,
            "tournament_id": self.tournament_id,
            "match_id": self.match_id,
            "round": self.round,
            "position": self.position,
        }
        
        if not "tournament" in inspect(self).unloaded:
            match_dict["tournament"] = self.tournament.to_dict() if self.tournament else None
            
        if not "match" in inspect(self).unloaded:
            match_dict["match"] = self.match.to_dict() if self.match else None
            
        return match_dict
