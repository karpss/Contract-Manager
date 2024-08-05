/* JobService: findUnpaidJobs function:
This function takes a profile as an argument.
It first checks whether the profile type is a client or a contractor.
If it’s a client, it retrieves active contracts associated with that client.
Then, it finds unpaid jobs related to those active contracts.
The function returns an array of unpaid jobs.

payForJob function:
This function takes two arguments: jobIdToPay and clientId.
It looks up the job with the specified ID and includes associated contract details.
If the job doesn’t exist, it throws an error.
It verifies that the client who created the contract is the one trying to pay for the job.
It checks the client’s balance and ensures they have enough funds.
If the job has already been paid, it throws an error.
It then performs a transaction to update balances for the client and contractor.
Finally, it marks the job as paid and commits the transaction. */

const { Op, Sequelize } = require('sequelize');
const { Job, Profile, sequelize, Contract } = require('../model');

const findUnpaidJobs = async (profile) => {
  const whereActiveContracts = {
    status: 'in_progress',
  };

  if (profile.type === 'client') {
    whereActiveContracts.ClientId = profile.id;
  } else {
    whereActiveContracts.ContractorId = profile.id;
  }

  const activeContracts = await Contract.findAll({
    attributes: ['id'],
    where: whereActiveContracts,
  });

  if (activeContracts.length === 0) {
    return []; // No active contracts found, return early
  }

  const unpaidJobs = await Job.findAll({
    where: {
      paid: {
        [Op.not]: true, // Assuming paid is a boolean field in the Job model
      },
      ContractId: {
        [Op.in]: activeContracts.map((contract) => contract.id),
      },
    },
  });

  return unpaidJobs;
};
// concurrency control to prevent race conditions by using transactions and locks

const payForJob = async (jobIdToPay, clientId) => {
  // Start a new transaction
  const transaction = await sequelize.transaction();

  try {
    // Fetch the job and related models within the transaction
    const job = await Job.findOne({
      where: { id: jobIdToPay },
      include: [
        {
          model: Contract,
          include: [
            {
              model: Profile,
              as: 'Client',
              where: { id: clientId },
            },
            {
              model: Profile,
              as: 'Contractor',
            },
          ],
        },
      ],
      lock: transaction.LOCK.UPDATE,
      transaction,
    });

    if (!job) {
      throw new Error(`Job not found with this id`);
    }

    const contract = job.Contract;

    if (!contract) {
      throw new Error(`Contract not found for this id`);
    }

    if (contract.ClientId !== clientId) {
      throw new Error(
        `Only the client who created the contract can pay for this job`
      );
    }

    const client = contract.Client;
    const contractor = contract.Contractor;
    const amountToPay = job.price;

    if (!client) {
      throw new Error(`Client not found with this id`);
    }

    if (!contractor) {
      throw new Error(`Contractor not found with this id`);
    }

    if (client.balance < amountToPay) {
      throw new Error(`Client does not have enough money to pay for this job`);
    }

    if (job.paid) {
      throw new Error(`Job has already been paid`);
    }

    // Update balances within the transaction
    await client.update(
      { balance: Sequelize.literal(`balance - ${amountToPay}`) },
      { transaction }
    );

    await contractor.update(
      { balance: Sequelize.literal(`balance + ${amountToPay}`) },
      { transaction }
    );

    // Mark the job as paid within the transaction
    job.paid = true;
    await job.save({ transaction });

    // Commit the transaction
    await transaction.commit();
  } catch (e) {
    // Rollback the transaction in case of error
    await transaction.rollback();
    throw new Error(`Transaction failed: ${e.message}`);
  }
};

module.exports = {
  findUnpaidJobs,
  payForJob,
};
