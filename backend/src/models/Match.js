const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Match = sequelize.define('Match', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  is_result_validated: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  played_on: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_by_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'players',
      key: 'id'
    }
  },
  reported_by_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'players',
      key: 'id'
    }
  },
  reported_by_team_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  validated_by_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'players',
      key: 'id'
    }
  },
  club_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'clubs',
      key: 'id'
    }
  },
  result: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'matches',
  schema: 'dev',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Match;
