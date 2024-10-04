const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const TodoTask = require("./models/TodoTask");
let routings = require('./routes/routings');
//**************s3 bucket connection
const aws = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
//aws config
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new aws.S3();
const BUCKET_NAME = 'myapplistbucket';
const TODO_FILE_KEY = 'todo-list.json';

// Helper function to read todo list from S3
async function getTodoList() {
  try {
    const data = await s3.getObject({ Bucket: BUCKET_NAME, Key: TODO_FILE_KEY }).promise();
    return JSON.parse(data.Body.toString());
  } catch (error) {
    if (error.code === 'NoSuchKey') {
      return []; // Return empty array if file doesn't exist yet
    }
    throw error;
  }
}

// Helper function to write todo list to S3
async function saveTodoList(todoList) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: TODO_FILE_KEY,
    Body: JSON.stringify(todoList),
    ContentType: 'application/json'
  };
  await s3.putObject(params).promise();
}

app.get('/tasks', async (req, res) => {
  try {
    const todoList = await getTodoList();
    res.json(todoList);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
});

app.post('/add-task', async (req, res) => {
  try {
    const todoList = await getTodoList();
    const newTask = { id: uuidv4(), text: req.body.task };
    todoList.push(newTask);
    await saveTodoList(todoList);
    res.redirect('/');
  } catch (error) {
    res.status(500).json({ error: 'Failed to add task' });
  }
});

app.delete('/delete-task/:id', async (req, res) => {
  try {
    let todoList = await getTodoList();
    todoList = todoList.filter(task => task.id !== req.params.id);
    await saveTodoList(todoList);
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});


//**************s3 bucket connection
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
