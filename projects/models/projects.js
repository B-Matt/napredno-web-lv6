var mongoose = require('mongoose');  

var projectSchema = new mongoose.Schema({  
  title: String,
  description: String,
  price: Number,
  doneTasks: Number,
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, default: Date.now },
});
mongoose.model('Project', projectSchema);