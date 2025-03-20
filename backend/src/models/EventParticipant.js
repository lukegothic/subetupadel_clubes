const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EventParticipant = sequelize.define('EventParticipant', {
  event_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    references: {
      model: 'events',
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
    defaultValue: 'registered'
  }
}, {
  tableName: 'event_participants',
  schema: sequelize.options.schema,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = EventParticipant;
