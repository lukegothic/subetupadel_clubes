const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MatchmakingSettings = sequelize.define('MatchmakingSettings', {
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
  min_skill_difference: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 2.0
  },
  max_skill_difference: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 5.0
  },
  min_matches_for_trueskill: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10
  },
  consider_preferred_side: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  consider_gender: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'matchmaking_settings',
  schema: sequelize.options.schema,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = MatchmakingSettings;
