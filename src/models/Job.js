const { Model, DataTypes } = require('sequelize');
const sequelize = require('./database');

class Job extends Model {}

Job.init(
  {
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    paid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    paymentDate: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'Job',
  }
);

module.exports = Job;
