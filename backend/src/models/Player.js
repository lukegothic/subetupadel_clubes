const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Player = sequelize.define('Player', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  is_initialized: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  mu: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  sigma: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  trueskill: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  preferred_side: {
    type: DataTypes.STRING,
    allowNull: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  search_key: {
    type: DataTypes.STRING,
    allowNull: true
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  sex: {
    type: DataTypes.STRING,
    allowNull: true
  },
  profile_image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  handiness: {
    type: DataTypes.STRING,
    allowNull: true
  },
  playtomic_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  license_number: {
    type: DataTypes.STRING,
    allowNull: true
  },
  postal_code: {
    type: DataTypes.STRING(5),
    allowNull: true
  },
  postal_code_visible: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  rank_max: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  matches_played: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  matches_won: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  matches_last_ten_result: {
    type: DataTypes.STRING,
    allowNull: false
  },
  matches_consecutive_wins: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  matches_consecutive_wins_max: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  matches_won_ties: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  club_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'clubs',
      key: 'id'
    }
  },
  racket_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'rackets',
      key: 'id'
    }
  },
  referral_player_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'players',
      key: 'id'
    }
  }
}, {
  tableName: 'players',
  schema: 'dev',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Player;
