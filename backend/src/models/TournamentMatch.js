const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TournamentMatch = sequelize.define('TournamentMatch', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tournament_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'tournaments',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  match_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'matches',
      key: 'id'
    }
  },
  round: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'tournament_matches',
  schema: sequelize.options.schema,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = TournamentMatch;
