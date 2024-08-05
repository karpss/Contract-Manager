const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./model');
const { getProfile } = require('./middleware/getProfile');
const ContractService = require('./contracts/ContractService');
const JobService = require('./jobs/JobService');
const ClientService = require('./clients/ClientService');
const AdminService = require('./admin/AdminService');

const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize);
app.set('models', sequelize.models);

/**
 * FIX ME!
 * @returns contract by id
 */

app.get('/contracts/:id', getProfile, async (req, res) => {
  const { profile } = req;
  const { id } = req.params;
  try {
    const contract = await ContractService.findContractForAUser(
      id,
      profile.type,
      profile.id
    );
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' }).end();
    }
    return res.status(200).json(contract).end();
  } catch (e) {
    return res.status(400).json({ error: e.message }).end();
  }
});

app.get('/contracts', getProfile, async (req, res) => {
  const { profile } = req;
  try {
    const contracts = await ContractService.findAllContracts(profile);
    if (!contracts || contracts.length === 0) {
      return res.status(404).json({ error: 'No contracts found' }).end();
    }
    return res.status(200).json(contracts).end();
  } catch (error) {
    return res.status(400).json({ error: error.message }).end();
  }
});

app.get('/jobs/unpaid', getProfile, async (req, res) => {
  const { profile } = req;
  try {
    const unpaidJobs = await JobService.findUnpaidJobs(profile);
    if (!unpaidJobs || unpaidJobs.length === 0) {
      return res.status(404).json({ error: 'No unpaid jobs found' }).end();
    }
    return res.status(200).json(unpaidJobs).end();
  } catch (e) {
    return res.status(400).json({ error: e.message }).end();
  }
});

app.post('/jobs/:jobId/pay', getProfile, async (req, res) => {
  const { profile } = req;

  const { jobId } = req.params;
  try {
    await JobService.payForJob(jobId, profile.id);
    res.status(200).json({ message: 'Job paid for  successfully!' });
  } catch (e) {
    res.status(400).json({ error: e.message }).end();
  }
});

app.post('/balances/deposit/:userId', getProfile, async (req, res) => {
  const { profile } = req;
  const { userId } = req.params;
  const { amount } = req.body;

  // Convert both IDs to strings before comparison
  if (String(profile.id) !== String(userId)) {
    return res
      .status(400)
      .json({ error: "You can't fund another user's account." })
      .end();
  }

  try {
    await ClientService.clientDeposit(amount, profile.id, userId);
    return res
      .status(200)
      .json({ message: 'Transaction completed successfully!' })
      .end();
  } catch (e) {
    return res.status(400).json({ error: e.message }).end();
  }
});

// http://localhost:3001/admin/best-profession?start=2020-08-10&end=2021-08-10
app.get('/admin/best-profession', getProfile, async (req, res) => {
  const { start, end } = req.query;
  try {
    const bestProfession = await AdminService.findBestProfession(start, end);
    res.status(200).json(bestProfession).end();
  } catch (e) {
    res.status(400).json({ error: e.message }).end();
  }
});

// http://localhost:3001/admin/best-clients?start=2020-08-10&end=2021-08-10&limit=3
app.get('/admin/best-clients', getProfile, async (req, res) => {
  const { start, end } = req.query;
  const limit = req.query.limit ? req.query.limit : 2;
  try {
    const bestClients = await AdminService.findBestClients(start, end, limit);
    res.status(200).json(bestClients).end();
  } catch (e) {
    res.status(400).json({ error: e.message }).end();
  }
});

module.exports = app;
