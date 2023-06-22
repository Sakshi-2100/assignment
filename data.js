const fs = require('fs');
const csv = require('csv-parser');

const data = [];

fs.createReadStream('data.csv')
  .pipe(csv())
  .on('data', (data) => {
    // Process each row of the dataset and push it into the data array
    data.push(data);
  })
  .on('end', () => {
    // Dataset parsing is complete, proceed with creating the API endpoints
    console.log('Dataset import successful.');
  });


  