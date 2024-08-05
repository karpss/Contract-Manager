const getContractService = require('../ContractService');

const contractorId = 5;
const clientId = 1;
const contractId = 1;

describe('Find Contracts', () => {
  it('should find a contract for the client', async () => {
    const contractFound = await getContractService.findContractForAUser(
      contractId,
      'client',
      clientId
    );
    expect(contractFound.terms).toEqual('bla bla bla');
  });

  it('should throw an error if a contract does not belong to the client', async () => {
    const clientOutOfContract = 2;
    await expect(
      getContractService.findContractForAUser(
        contractId,
        'client',
        clientOutOfContract
      )
    ).rejects.toThrowError();
  });

  it('should find a contract for a contractor', async () => {
    const contractFound = await getContractService.findContractForAUser(
      contractId,
      'contractor',
      contractorId
    );
    expect(contractFound.terms).toEqual('bla bla bla');
  });

  it('should throw an error if a contract does not belong to the contractor', async () => {
    const contractorOutOfContract = 2;
    await expect(
      getContractService.findContractForAUser(
        contractId,
        'contractor',
        contractorOutOfContract
      )
    ).rejects.toThrowError();
  });
});

describe('ContractsService.findAllContracts', () => {
  it('should return contracts for a contractor without terminated contracts', async () => {
    const contractorWithNoTerminatedContracts = 6;
    const profile = {
      type: 'contractor',
      id: contractorWithNoTerminatedContracts,
    };
    const contracts = await getContractService.findAllContracts(profile);
    expect(contracts).toHaveLength(3);
  });

  it('should not consider terminated contracts', async () => {
    const profile = { type: 'contractor', id: contractorId };
    const contracts = await getContractService.findAllContracts(profile);
    expect(contracts).toHaveLength(0);
  });
});
