const { clientDeposit } = require('../ClientService');
const { Profile, Contract, Job, sequelize } = require('../../model');

jest.mock('../../model');

describe('deposit function', () => {
  let mockTransaction;

  beforeEach(() => {
    // Mock transaction
    mockTransaction = {
      commit: jest.fn(),
      rollback: jest.fn(),
    };

    // Mock sequelize.transaction to call the provided callback with the mock transaction
    sequelize.transaction = jest.fn((callback) => callback(mockTransaction));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if the user is not a client', async () => {
    const clientId = 1;
    Profile.findByPk.mockResolvedValue({ id: clientId, type: 'contractor' });

    await expect(clientDeposit(100, clientId)).rejects.toThrow(
      'Only clients can deposit funds'
    );
  });

  it('should throw an error if the deposit amount exceeds 25% of the total amount of unpaid jobs', async () => {
    const clientId = 1;
    const clientProfile = { id: clientId, type: 'client', balance: 0 };
    Profile.findByPk.mockResolvedValue(clientProfile);

    const contracts = [{ id: 1 }, { id: 2 }];
    Contract.findAll.mockResolvedValue(contracts);

    const jobs = [
      { price: 200, paid: false, ContractId: 1 },
      { price: 100, paid: false, ContractId: 2 },
    ];
    Job.findAll.mockResolvedValue(jobs);

    await expect(clientDeposit(101, clientId)).rejects.toThrow(
      'Client cannot deposit more than 25% of the total amount of jobs to pay'
    );
  });

  it('should update the balance correctly', async () => {
    // Create a mock Profile instance
    const mockProfile = {
      id: 1,
      balance: 100, // Initial balance
      type: 'client',
      save: jest.fn(), // Mock the save method
    };

    // Mock the Profile.findByPk method
    Profile.findByPk = jest.fn().mockResolvedValue(mockProfile);

    // Mock the sequelize.transaction method
    // eslint-disable-next-line no-shadow
    const mockTransaction = {
      commit: jest.fn(),
      rollback: jest.fn(),
    };
    sequelize.transaction = jest.fn().mockReturnValue(mockTransaction);

    // Call the deposit function
    await clientDeposit(50, 1); // Deposit 50 units for client with ID 1

    // Check if the balance was updated correctly
    expect(mockProfile.balance).toBe(150); // Initial balance + 50

    // Check if the save method was called
    expect(mockProfile.save).toHaveBeenCalled();

    // Check if the transaction methods were called
    expect(sequelize.transaction).toHaveBeenCalled();
    expect(mockProfile.save).toHaveBeenCalledWith({
      transaction: expect.any(Object),
    });
    expect(mockTransaction.commit).toHaveBeenCalled();
  });
});
