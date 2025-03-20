const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Club = sequelize.define('Club', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name_fep: {
    type: DataTypes.STRING,
    allowNull: false
  },
  search_key: {
    type: DataTypes.STRING,
    allowNull: false
  },
  logo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  google_map_link: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location: {
    type: DataTypes.JSON,
    allowNull: true
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: true
  },
  postal_code: {
    type: DataTypes.STRING(5),
    allowNull: true
  },
  min_base: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  max_base: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  is_premium: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  is_partner: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  }
}, {
  tableName: 'clubs',
  schema: 'dev',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Club;
