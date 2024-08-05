/* ClientService: The clientDeposit function is designed to handle
 depositing funds for clients.
It takes two parameters: amount (the deposit amount) and 
clientId (the ID of the client).
It first retrieves the client’s profile using Profile.findByPk(clientId).
If the client profile doesn’t exist or the profile type is not ‘client’,
 it throws an error indicating that only clients can deposit funds.
Next, it fetches unpaid jobs related to the client using a Sequelize 
query on the Job model. These jobs must have a paid status set to false.
The query includes a join with the Contract model, filtering contracts where
 the ClientId matches the provided clientId and the contract status is either 
 ‘in_progress’ or ‘new’.
The total amount to deposit is calculated by summing up the prices of 
all unpaid jobs.
If the deposit amount exceeds the maximum allowed percentage 
(defined as MAX_DEPOSIT_PERCENTAGE), an error is thrown.
A database transaction is initiated using sequelize.transaction().
Inside the transaction, the client’s balance is updated by adding 
the deposit amount.
The transaction is committed if everything succeeds, or rolled back 
if an error occurs during the process. */

const { Op } = require('sequelize');

const { Job, Contract, Profile, sequelize } = require('../model');

const MAX_DEPOSIT_PERCENTAGE = 0.25;

const clientDeposit = async (amount, clientId) => {
  const clientProfile = await Profile.findByPk(clientId);

  if (!clientProfile || clientProfile.type !== 'client') {
    throw new Error('Only clients can deposit funds');
  }

  const unpaidJobs = await Job.findAll({
    where: {
      paid: {
        [Op.not]: true,
      },
    },
    include: {
      model: Contract,
      required: true,
      where: {
        ClientId: clientId,
        status: {
          [Op.in]: ['in_progress', 'new'],
        },
      },
    },
  });

  const totalAmountToDeposit = unpaidJobs.reduce(
    (total, job) => total + job.price,
    0
  );

  if (amount > totalAmountToDeposit * MAX_DEPOSIT_PERCENTAGE) {
    throw new Error(
      `Client cannot deposit more than ${MAX_DEPOSIT_PERCENTAGE * 100}% of the total amount of jobs to pay`
    );
  }

  const transaction = await sequelize.transaction();
  try {
    clientProfile.balance += amount;
    await clientProfile.save({ transaction });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = {
  clientDeposit,
};
