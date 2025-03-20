const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MatchmakingSuggestion = sequelize.define('MatchmakingSuggestion', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  club_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'clubs',
      key: 'id'
    }
  },
  player1_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'players',
      key: 'id'
    }
  },
  player2_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'players',
      key: 'id'
    }
  },
  player3_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'players',
      key: 'id'
    }
  },
  player4_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'players',
      key: 'id'
    }
  },
  team1_skill: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  team2_skill: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  balance_score: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending'
  },
  match_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'matches',
      key: 'id'
    }
  }
}, {
  tableName: 'matchmaking_suggestions',
  schema: sequelize.options.schema,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = MatchmakingSuggestion;
