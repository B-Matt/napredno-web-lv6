var mongoose = require('mongoose');  

var projectSchema = new mongoose.Schema({  
  title: String,
  author: String,
  description: String,
  price: Number,
  doneTasks: Number,
  members: [],
  isArchived: Boolean,
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, default: Date.now },
});
mongoose.model('Project', projectSchema);