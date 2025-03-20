const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MatchRequestPlayer = sequelize.define('MatchRequestPlayer', {
  match_request_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    references: {
      model: 'match_requests',
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
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'invited'
  }
}, {
  tableName: 'match_request_players',
  schema: sequelize.options.schema,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = MatchRequestPlayer;
