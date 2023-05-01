Instructions on how to run: 

## DEPENDENCIES 
1. Install necessary dependencies by running npm install. Here are some of the dependecies used and the purpose they serve:
    - sendgrid/mail is used to send emails. An API key will need to be added to the process.env in order to actually use sendgrid's email server. You can create one by going to their website and selecting FREE tier access or ask me for my api key. 
    - bcrypt will encrypt and decrypt our passwords for identity proteciton.
    - dotenv allows easy access to enviornment variables
    - express will help configure routes and server management for our application.
    - jest is our testing framework.
    - jsonwebtoken will create tokens to verify the role and authenticity of users making api requests.
    - sequelize is an ORM that helps us design our models and sync with our database.

## CREATE AND SEED THE DATABASE
1. Set up enviornment variables by creating a .env file that contains the following: 
    - DB_PASS - Password to access your local SQL database.
    - JWT - Define a secret key for signing and verifying JWTs
    - SENDGRID_API_KEY - Api key for SendGrid
    - SENDGRID_FROM_EMAIL - The email you would like notifications to come from. This email should correspond to the one registered to the API.
2. Once your enviornment is configured, run `node database.js` to initialize the database.
3. Run `node seed.js` to seed the database.
    - I recommend changing the username of managers to your own email to test that the emails are being received.

## RUN BACKEND SERVER
1. Run `node index.js` to start the backend server, so that you can begin querying the API. I recommend using Postman.
    - The routes are listed in index.js but you may also view them here for reference. 

    ```
    // generate a token
    app.post('/login', login);
    // retrieve all tasks
    app.get('/tasks/getAllTasks', authenticate('manager'), getAllTasks);
    // make a task
    app.post('/tasks/createTask', authenticate('all'), createTask);
    // complete a task
    app.patch('/tasks/completeTask', authenticate('all'), completeTask);
    // view all tasks for a single technician
    app.get(`/tasks/getTasksByTechnicianId`, authenticate('all'), getTasksbyTechnicianId);
    // destroy task
    app.delete('/tasks/deleteTask', authenticate('all'), deleteTask);
    // update a task summary
    app.put('/tasks/updateTask', authenticate('all'), updateTask);
    ```

    - Because we have protected our api endpoints with token-based authentication, you will need to hit /login and generate a token to send in your authorization header before trying to access any of these protected endpoints. View the database to get a useable set of credentials.
    - The authenticate middleware function will ensure that your token is valid and check your role before allowing you to perform certain actions. Some restricted actions are viewing all tasks, which is reserved for manager-role users only. Technicians are also not allowed to update tasks that do not belong to them. Your token will store information about which user you are, preventing you from performing actions you're not permitted to do. Managers are allowed to do anything provided that the request they send is valid. For example, they cannot update a task with a mismatched technician_id.

## TESTS

    1. Tests for this project were written using Jest. You should be able to run `npm run test` and view their output. I have not written all possible tests but just enough to showcase I am able to use the Jest testing framework. Some additional tests can be written for getTasksByTechnicianId, updateTask and sendNotification.
