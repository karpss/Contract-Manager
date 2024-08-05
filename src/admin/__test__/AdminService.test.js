const getAdminService = require('../AdminService');

describe('Admin Service', () => {
  describe('Find Best Profession', () => {
    it('should return Musician as the best profession on 2020-08-10', async () => {
      const bestProfession = await getAdminService.findBestProfession(
        '2020-08-10',
        '2020-08-10'
      );
      expect(bestProfession).toBe('Musician');
    });

    it('should return Programmer as the best profession between 2020-08-10 and 2021-08-10', async () => {
      const bestProfession = await getAdminService.findBestProfession(
        '2020-08-10',
        '2021-08-10'
      );
      expect(bestProfession).toBe('Programmer');
    });
  });

  describe('Find Best Clients', () => {
    it('should return the best clients between 2020-08-10 and 2021-08-10', async () => {
      const bestClients = await getAdminService.findBestClients(
        '2020-08-10',
        '2021-08-10',
        3
      );
      expect(bestClients).toEqual([
        { firstName: 'Ash', lastName: 'Kethcum', totalPaid: 2020 },
        { firstName: 'Harry', lastName: 'Potter', totalPaid: 442 },
        { firstName: 'Mr', lastName: 'Robot', totalPaid: 442 },
      ]);
    });

    it('should return a limited number of best clients', async () => {
      const bestClients = await getAdminService.findBestClients(
        '2020-08-10',
        '2021-08-10',
        1
      );
      expect(bestClients).toEqual([
        { firstName: 'Ash', lastName: 'Kethcum', totalPaid: 2020 },
      ]);
    });
  });
});
