import express from "express";
import bodyParser from "body-parser";
import cors from "cors";


// Create an Express app
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors())

// Define a simple route
app.get('/', (req, res) => {
  res.send('Hello, world!')
})

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sword Health Api is listening on port ${PORT}`);
});