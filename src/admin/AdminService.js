const { Sequelize } = require('sequelize');
const { sequelize } = require('../model');

/* findBestProfession Function:
This function takes two parameters: start (start date) and end (end date).
It constructs a SQL query that retrieves the profession with the highest
 total earnings within the specified date range.
The query joins the Jobs, Contracts, and Profiles tables, filters paid 
jobs within the date range, groups results by profession, and orders 
them by total earnings.
If a profession is found, it returns the profession name; otherwise,
 it returns a message indicating no matching profession.        */

const findBestProfession = async (start, end) => {
  const result = await sequelize.query(
    `SELECT P.profession, SUM(j.price) as total_earned
       FROM Jobs j
       JOIN Contracts C ON C.id = j.ContractId
       JOIN Profiles P ON C.ContractorId = P.id
       WHERE j.paid = true
         AND j.paymentDate BETWEEN :startDate AND :endDate
       GROUP BY P.profession
       ORDER BY total_earned DESC
       LIMIT 1`,
    {
      replacements: {
        startDate: `${start} 00:00:00.000`,
        endDate: `${end} 23:59:00.000`,
      },
      type: Sequelize.QueryTypes.SELECT,
    }
  );

  if (result.length > 0) {
    return result[0].profession;
  }
  return `No profession found with the specified criteria`;
};

/* findBestClients Function:
Similar to the previous function, this one takes three parameters:
 start, end, and limit.
It constructs a query to find the clients (based on first name 
and last name) who have paid the most for jobs within the specified date range.
The query joins the same tables, filters paid jobs, groups results
 by client, and orders them by total payments.
If clients are found, it returns an array of client information; 
otherwise, it returns a message indicating no matching clients. */

const findBestClients = async (start, end, limit) => {
  const result = await sequelize.query(
    `SELECT P.firstName, P.lastName, SUM(j.price) as totalPaid
       FROM Jobs j
       JOIN Contracts C ON C.id = j.ContractId
       JOIN Profiles P ON C.ClientId = P.id
       WHERE j.paid = true
         AND j.paymentDate BETWEEN :startDate AND :endDate
       GROUP BY P.id, P.firstName, P.lastName
       ORDER BY totalPaid DESC
       LIMIT :limit`,
    {
      replacements: {
        startDate: `${start} 00:00:00.000`,
        endDate: `${end} 23:59:00.000`,
        limit,
      },
      type: Sequelize.QueryTypes.SELECT,
    }
  );

  if (result.length > 0) {
    return result;
  }
  return `No clients found with the specified criteria`;
};

module.exports = {
  findBestProfession,
  findBestClients,
};
