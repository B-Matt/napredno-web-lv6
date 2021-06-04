var mongoose = require('mongoose');  

var userSchema = new mongoose.Schema({  
  mail: String,
  password: String,
});
mongoose.model('User', userSchema);