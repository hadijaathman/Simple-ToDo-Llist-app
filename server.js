const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const TodoTask = require("./models/TodoTask");
let routings = require('./routes/routings');
dotenv.config();
app.use("/public", express.static("public"));

app.use(express.urlencoded({ extended: true }));

//connection to db
mongoose.set("useFindAndModify", false);
mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true }, () => {
    
//    console.log("Connected to db!");
//    app.listen(8080, () => console.log("Server Up and running"));
// pointing to ec2 server
    
const port = process.env.PORT || 8080;
const host = '0.0.0.0';

app.listen(port, host, () => {
  console.log(`App listening at http://${host}:${port}`);
  console.log('To access it from outside EC2, use your instance\'s public IP or domain');
});

app.set("view engine", "ejs");


// GET METHOD
app.route("/")
    .get(routings.getToDo)
//POST METHOD
    .post(routings.postToDo);
//DELETE
app.route("/remove/:id")
    .get(routings.deleteToDo)

//check
app.route("/check/:id")
    .get((req, res) => {
        const id = req.params.id;
    
        TodoTask.find({}, (err, tasks) => {
            res.render("todo.ejs", { todoTasks: tasks, idTask: id });
        });
    })
    .post((req, res) => {
        const id = req.params.id;
        const todoTask = new TodoTask({
            check: req.body.checkbox
        });
        if (check == true) {
            TodoTask.findByIdAndUpdate(id, { check: false }, err => {
                if (err) return res.send(500, err);
                res.redirect("/");
            })
        };
        elseif(check == false)
        {
            TodoTask.findByIdAndUpdate(id, { check: true }, err => {
                if (err) return res.send(500, err);
                res.redirect("/");
            })
        };
    });

module.exports = app;
