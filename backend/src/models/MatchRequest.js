const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MatchRequest = sequelize.define('MatchRequest', {
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
  requested_by_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'players',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending'
  },
  preferred_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
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
  tableName: 'match_requests',
  schema: sequelize.options.schema,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = MatchRequest;
