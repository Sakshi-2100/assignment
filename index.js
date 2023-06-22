const fs = require('fs');
const csv = require('csv-parser');

var dataset = [];

fs.createReadStream('./data.csv')
  .pipe(csv())
  .on('data', (data) => {
    // Process each row of the dataset and push it into the data array
    dataset.push(data);
    // console.log(dataset);
  })
  .on('end', () => {
    // Dataset parsing is complete, proceed with creating the API endpoints
    console.log('Data import successful.');
  });
console.log(dataset);
const express = require('express');
// const { log } = require('console');
const app = express();

app.get('/api/total_items', (req, res) => {
    const { start_date, end_date, department } = req.query;
    // Filter data based on start_date, end_date, and department
    const filteredData = dataset.filter((dataset) => {
      const dataDate = new Date(dataset.date);
      return (
        dataDate >= new Date(start_date) &&
        dataDate <= new Date(end_date) &&
        dataset.department === department
      );
    });
  
    // Calculate total items sold
    const totalItems = filteredData.reduce(
      (total, dataset) => total + parseInt(dataset.items_sold),
      0
    );
  
    res.send(totalItems.toString());
  });
  
app.get('/api/nth_most_total_item', (req, res) => {
    const { item_by, start_date, end_date, n } = req.query;

    // Filter data based on start_date and end_date
    const filteredData = dataset.filter((dataset) => {
      const dataDate = new Date(dataset.date);
      return (
        dataDate >= new Date(start_date) && dataDate <= new Date(end_date)
      );
    });
  
    // Calculate total quantity or price per item
    const itemTotals = {};
  
    filteredData.forEach((dataset) => {
      const itemName = dataset.item;
      const itemValue = parseFloat(dataset[item_by]);
  
      if (itemName in itemTotals) {
        itemTotals[itemName] += itemValue;
      } else {
        itemTotals[itemName] = itemValue;
      }
    });
  
    // Sort items based on quantity or price
    const sortedItems = Object.entries(itemTotals).sort((a, b) => b[1] - a[1]);
  
    // Get the nth most item
    const nthItem = sortedItems[n - 1];
  
    if (nthItem) {
      const itemName = nthItem[0];
      res.send(itemName);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
    });

app.get('/api/percentage_of_department_wise_sold_items', (req, res) => {
    const { start_date, end_date } = req.query;

    // Filter data based on start_date and end_date
    const filteredData = dataset.filter((dataset) => {
      const dataDate = new Date(dataset.date);
      return (
        dataDate >= new Date(start_date) && dataDate <= new Date(end_date)
      );
    });
  
    // Calculate sold items per department
    const departmentSoldItems = {};
  
    filteredData.forEach((dataset) => {
      const department = dataset.department;
      if (department in departmentSoldItems) {
        departmentSoldItems[department]++;
      } else {
        departmentSoldItems[department] = 1;
      }
    });
  
    // Calculate total sold items
    const totalSoldItems = Object.values(departmentSoldItems).reduce(
      (total, count) => total + count,
      0
    );
  
    // Calculate percentage of sold items per department
    const departmentPercentages = {};
  
    for (const department in departmentSoldItems) {
      const count = departmentSoldItems[department];
      const percentage = ((count / totalSoldItems) * 100).toFixed(2);
      departmentPercentages[department] = `${percentage}%`;
    }
  
    res.json(departmentPercentages);  });

app.get('/api/monthly_sales', (req, res) => {
    // Return all data as JSON response
    const { software, date } = req.query;
    console.log(req.query);
    // Filter data based on product and year
    const filteredData = dataset.filter(
      (dataset) =>
        dataset.software === software && new Date(dataset.date).getFullYear() === date.getFullYear()
    );
  
    // Calculate monthly sales
    const monthlySales = Array(12).fill(0);
  
    filteredData.forEach((dataset) => {
      const month = new Date(dataset.date).getMonth();
      monthlySales[month] += parseFloat(dataset.sales);
    });
  
    res.json(monthlySales);
    });
  
const port = 3000; // Choose a port number that is not in use

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

  