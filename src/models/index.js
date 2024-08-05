const sequelize = require('./database');
const { Profile, Contract, Job } = require('./associations');

module.exports = {
  sequelize,
  Profile,
  Contract,
  Job,
};
