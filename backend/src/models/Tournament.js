const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Tournament = sequelize.define('Tournament', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    references: {
      model: 'events',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  format: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rounds: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  players_per_match: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 4
  }
}, {
  tableName: 'tournaments',
  schema: sequelize.options.schema,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Tournament;
