const request = require("supertest");
var cheerio = require("cheerio");
const db = require("../models/index");
const app = require("../app");
//const todo = require("../models/todo");
let server, agent;

//function to extract csrf token
function extractCsrfToken(response) {
  var $ = cheerio.load(response.text);
  return $("[name=_csrf]").val();
}

describe("Testing My Bharath's Task Manager ", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(4000, () => {});
    agent = request.agent(server);
  });
  afterAll(async () => {
    await db.sequelize.close();
    server.close();
  });
  //Test
  test("To mark Task manager completed field : ", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Morning Walk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });

  test("To Create new Task...", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Net session for 3hours",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(422); //http status code
  });


  

    // the above added todo is second in the list of newly added todos
    const todoID = await agent.get("/todos").then((response) => {
      const parsedResponse1 = JSON.parse(response.text);
      return parsedResponse1[1]["id"];
    });

    // Testing for false to true
    const setCompletionResponse1 = await agent
      .put(`/todos/${todoID}`)
      .send({ completed: true, _csrf: csrfToken });
    const parsedUpdateResponse3 = JSON.parse(setCompletionResponse1.text);
    expect(parsedUpdateResponse3.completed).toBe(true);

    // Testing for true to false
    const setCompletionResponse2 = await agent
      .put(`/todos/${todoID}`)
      .send({ completed: false, _csrf: csrfToken });
    const parsedUpdateResponse2 = JSON.parse(setCompletionResponse2.text);
    expect(parsedUpdateResponse2.completed).toBe(false);
  });
  
 //Test

  test("Marking a todo as complete", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "write journal before sleep",
      dueDate: new Date().toLocaleString("en-CA"),
      completed: false,
      _csrf: csrfToken,
    });

    const gropuedTodosResponse = await agent
      .get("/")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(gropuedTodosResponse.text);
    const dueTodayCount = parsedGroupedResponse.dueToday.length;
    const latestTodo = parsedGroupedResponse.dueToday[dueTodayCount - 1];

    // const status = latestTodo.completed ? false : true;

    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);
    console.log(latestTodo)
    const markAsCompleteresponse = await agent.put(`todos/${latestTodo["id"]}`).send({
      _csrf: csrfToken,
      // completed: status,
    });
    const parsedUpdateResponse = JSON.parse(markAsCompleteresponse.text);
    expect(parsedUpdateResponse.completed).toBe(true);
  });


  //Marking a todo as incomplete
  test(" task with the given ID is incomplete", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: " For Incomplete tasks testing",
      dueDate: new Date().toISOString(),
      completed: true,
      _csrf: csrfToken,
    });

    const groupedTodosResponse = await agent
      .get("/")
      .set("Accept", "application/json");
    const parsedGroupedResponsee = JSON.parse(groupedTodosResponse.text);
    const completedItemsCount = parsedGroupedResponsee.completedItems.length;
    const latestTodoo = parsedGroupedResponsee.completedItems[completedItemsCount - 1];
    const completed = !latestTodoo.completed;
    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);

    const markCompleteResponses = await agent
      .put(`/todos/${latestTodoo.id}`)
      .send({
        _csrf: csrfToken,
        completed: completed,
      });

    const parsedUpdateResponses = JSON.parse(markCompleteResponses.text);
    expect(parsedUpdateResponses.completed).toBe(false);
  });

 
  //Test
  test("Delete task using the ID of respective task", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Done with the exams",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });

    const gropuedTodosResponse = await agent
      .get("/")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(gropuedTodosResponse.text);
    const dueTodayCount = parsedGroupedResponse.dueToday.length;
    const latestTodo = parsedGroupedResponse.dueToday[dueTodayCount - 1];

    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);

    const response = await agent.put(`todos/${latestTodo.id}`).send({
      _csrf: csrfToken,
    });
    const parsedUpdateResponse = JSON.parse(response.text);
    expect(parsedUpdateResponse.completed).toBe(true);
  });


  
});