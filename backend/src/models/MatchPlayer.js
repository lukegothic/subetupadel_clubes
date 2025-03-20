const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MatchPlayer = sequelize.define('MatchPlayer', {
  match_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    references: {
      model: 'matches',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  player_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    references: {
      model: 'players',
      key: 'id'
    }
  },
  history_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'player_history',
      key: 'id'
    }
  },
  team_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'match_players',
  schema: sequelize.options.schema,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = MatchPlayer;
