const { Op } = require('sequelize');

const { payForJob, findUnpaidJobs } = require('../JobService');

const { Job, Profile, Contract } = require('../../model');

jest.mock('../../model');

describe('payJob', () => {
  it('should return unpaid jobs for a client', async () => {
    const profile = { id: 1, type: 'client' };
    const activeContracts = [{ id: 1 }, { id: 2 }];
    const unpaidJobs = [
      { id: 1, paid: false, ContractId: 1 },
      { id: 2, paid: false, ContractId: 2 },
    ];

    Contract.findAll.mockResolvedValue(activeContracts);
    Job.findAll.mockResolvedValue(unpaidJobs);

    const result = await findUnpaidJobs(profile);
    expect(result).toEqual(unpaidJobs);
    expect(Contract.findAll).toHaveBeenCalledWith({
      attributes: ['id'],
      where: { status: 'in_progress', ClientId: profile.id },
    });
    expect(Job.findAll).toHaveBeenCalledWith({
      where: {
        paid: { [Op.not]: true },
        ContractId: { [Op.in]: activeContracts.map((contract) => contract.id) },
      },
    });
  });

  it('should return unpaid jobs for a contractor', async () => {
    const profile = { id: 1, type: 'contractor' };
    const activeContracts = [{ id: 1 }, { id: 2 }];
    const unpaidJobs = [
      { id: 1, paid: false, ContractId: 1 },
      { id: 2, paid: false, ContractId: 2 },
    ];

    Contract.findAll.mockResolvedValue(activeContracts);
    Job.findAll.mockResolvedValue(unpaidJobs);

    const result = await findUnpaidJobs(profile);
    expect(result).toEqual(unpaidJobs);
    expect(Contract.findAll).toHaveBeenCalledWith({
      attributes: ['id'],
      where: { status: 'in_progress', ContractorId: profile.id },
    });
    expect(Job.findAll).toHaveBeenCalledWith({
      where: {
        paid: { [Op.not]: true },
        ContractId: { [Op.in]: activeContracts.map((contract) => contract.id) },
      },
    });
  });

  it('When a job is paid, the balance from the client is deducted and transferred to the contractor', async () => {
    const clientId = 1;
    const jobToPay = 3;
    const jobPrice = 200;

    const mockJob = {
      id: jobToPay,
      price: jobPrice,
      paid: false,
      ContractId: 1,
      save: jest.fn().mockResolvedValue(true),
      reload: jest.fn().mockResolvedValue(true),
    };

    const mockContract = {
      id: 1,
      ClientId: clientId,
      ContractorId: 6,
    };

    const mockClient = {
      id: clientId,
      balance: 1000,
      save: jest.fn().mockResolvedValue(true),
      reload: jest.fn().mockResolvedValue(true),
    };

    const mockContractor = {
      id: 6,
      balance: 500,
      save: jest.fn().mockResolvedValue(true),
      reload: jest.fn().mockResolvedValue(true),
    };

    Job.findOne.mockImplementation(async ({ where: { id } }) => {
      if (id === jobToPay) return mockJob;
      return null;
    });

    Contract.findOne.mockImplementation(async ({ where: { id } }) => {
      if (id === mockJob.ContractId) return mockContract;
      return null;
    });

    Profile.findOne.mockImplementation(async ({ where: { id } }) => {
      if (id === clientId) return mockClient;
      if (id === mockContract.ContractorId) return mockContractor;
      return null;
    });

    const job = await Job.findOne({ where: { id: jobToPay } });

    // Proceed with the payment if job is found
    if (job) {
      await payForJob(jobToPay, clientId);

      expect(mockClient.balance).toBe(800);
      expect(mockClient.save).toHaveBeenCalled();
      await mockClient.reload();
      expect(mockClient.reload).toHaveBeenCalled();

      expect(mockContractor.balance).toBe(700);
      expect(mockContractor.save).toHaveBeenCalled();
      await mockContractor.reload();
      expect(mockContractor.reload).toHaveBeenCalled();

      expect(mockJob.paid).toBe(true);
      expect(mockJob.save).toHaveBeenCalled();
    }
  });
});
