/* ContractService: findContractForAUser function:
Validates the profileType (should be either ‘client’ or ‘contractor’).
Retrieves a contract by its contractId.
Checks if the contract belongs to the user based on profileType and profileId.
findAllContracts function:
Constructs query conditions to fetch contracts.
Filters out contracts with a status of ‘terminated’.
Retrieves contracts based on the user’s profile type (client or contractor). */

const { Op } = require('sequelize');
const { Contract } = require('../model');

const findContractForAUser = async (contractId, profileType, profileId) => {
  if (profileType !== 'client' && profileType !== 'contractor') {
    throw new Error('Invalid Profile Type');
  }

  const contractFound = await Contract.findOne({
    where: { id: contractId },
  });

  if (!contractFound) {
    return null;
  }

  const isClient = profileType === 'client';
  const doesContractBelongToUser = isClient
    ? contractFound.ClientId === profileId
    : contractFound.ContractorId === profileId;

  if (!doesContractBelongToUser) {
    throw new Error(
      `Contract ${contractId} does not belong to the logged-in user`
    );
  }

  return contractFound;
};

const findAllContracts = async (profile) => {
  const queryConditions = {
    status: {
      [Op.notIn]: ['terminated'],
    },
  };

  if (profile.type === 'client') {
    queryConditions.ClientId = profile.id;
  } else {
    queryConditions.ContractorId = profile.id;
  }

  try {
    return await Contract.findAll({ where: queryConditions });
  } catch (error) {
    throw new Error(`Error fetching contracts: ${error.message}`);
  }
};
module.exports = {
  findContractForAUser,
  findAllContracts,
};
