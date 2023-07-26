const { Sequelize, DataTypes, Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Mapping extends Model {}
  Mapping.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    fileKey: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    accessLevel: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    encryption: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Mapping',
    indexes: [{
      unique: true,
      fields: ['fileKey']
    }]
  });

  return Mapping;
};