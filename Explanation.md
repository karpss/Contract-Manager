
# How to run this project
- git clone the project, then ```npm install ``` to install the dependencies after this ```npm run seed``` to feed the database and then ```npm start``` to start the project. 

- To run the tests just ```npm run test```

# Explanation on Project structure

- The Design approach of this project is a Domain-Driven Design. This was done to to allign the project with the business domain.
- There four major folders that house the core part of the logic, Admin, Clients, Contracts and Jobs
- AdminService: 
findBestProfession Function:
This function takes two parameters: start (start date) and end (end date).
It constructs a SQL query that retrieves the profession with the highest total earnings within the specified date range.
The query joins the Jobs, Contracts, and Profiles tables, filters paid jobs within the date range, groups results by profession, and orders them by total earnings.
If a profession is found, it returns the profession name; otherwise, it returns a message indicating no matching profession.

findBestClients Function:
Similar to the previous function, this one takes three parameters: start, end, and limit.
It constructs a query to find the clients (based on first name and last name) who have paid the most for jobs within the specified date range.
The query joins the same tables, filters paid jobs, groups results by client, and orders them by total payments.
If clients are found, it returns an array of client information; otherwise, it returns a message indicating no matching clients.

- ClientService: The clientDeposit function is designed to handle depositing funds for clients in a backend application.
It takes two parameters: amount (the deposit amount) and clientId (the ID of the client).
It first retrieves the client’s profile using Profile.findByPk(clientId).
If the client profile doesn’t exist or the profile type is not ‘client’, it throws an error indicating that only clients can deposit funds.
Next, it fetches unpaid jobs related to the client using a Sequelize query on the Job model. These jobs must have a paid status set to false.
The query includes a join with the Contract model, filtering contracts where the ClientId matches the provided clientId and the contract status is either ‘in_progress’ or ‘new’.
The total amount to deposit is calculated by summing up the prices of all unpaid jobs.
If the deposit amount exceeds the maximum allowed percentage (defined as MAX_DEPOSIT_PERCENTAGE), an error is thrown.
A database transaction is initiated using sequelize.transaction().
Inside the transaction, the client’s balance is updated by adding the deposit amount.
The transaction is committed if everything succeeds, or rolled back if an error occurs during the process.

- ContractService: findContractForAUser function:
Validates the profileType (should be either ‘client’ or ‘contractor’).
Retrieves a contract by its contractId.
Checks if the contract belongs to the user based on profileType and profileId.
findAllContracts function:
Constructs query conditions to fetch contracts.
Filters out contracts with a status of ‘terminated’.
Retrieves contracts based on the user’s profile type (client or contractor).

- JobService: findUnpaidJobs function:
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
Finally, it marks the job as paid and commits the transaction.

# Things I could have done better

- Please the models folder is a work in progress, it was developed to be a clearer version of model.js which packed three classes in one file.

- Would have loved to apply caching to this to help serve responses faster

- routing can be better by being seperated

- More unit tests














