const {
  client,
  createTables,
  createCustomer,
  createRestaurant,
  fetchCustomers,
  fetchRestaurants,
  createReservation,
  fetchReservations,
  destroyReservation,
} = require("./db");

const express = require("express");
const app = express();
app.use(express.json());

app.post("/api/customer", async (req, res) => {
  const response = await createCustomer(req.body);
  res.send(response);
});
app.post("/api/restaurant", async (req, res) => {
  const response = await createRestaurant(req.body);
  res.send(response);
});

app.get("/api/customers", async (req, res, next) => {
  try {
    res.send(await fetchCustomers());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/restaurants", async (req, res, next) => {
  try {
    res.send(await fetchRestaurants());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/reservations", async (req, res, next) => {
  try {
    res.send(await fetchReservations());
  } catch (ex) {
    next(ex);
  }
});

app.delete(
  "/api/customers/:customer_id/reservations/:id",
  async (req, res, next) => {
    try {
      await destroyReservation({
        customer_id: req.params.user_id,
        id: req.params.id,
      });
      res.sendStatus(204);
    } catch (ex) {
      next(ex);
    }
  }
);

app.post("/api/customers/:customer_id/reservations", async (req, res, next) => {
  try {
    res.status(201).send(
      await createReservation({
        customer_id: req.params.customer_id,
        restaurant_id: req.body.restaurant_id,
        date: req.body.date,
        party_count: req.body.party_count,
      })
    );
  } catch (ex) {
    next(ex);
  }
});

const init = async () => {
  console.log("connecting to database");
  await client.connect();
  console.log("connected to database");
  await createTables();
  console.log("created tables");
  //   const [moe, lucy, larry, ethyl, paris, london, nyc] = await Promise.all([
  //     createCustomer({ name: "moe" }),
  //     createCustomer({ name: "lucy" }),
  //     createCustomer({ name: "larry" }),
  //     createCustomer({ name: "ethyl" }),
  //     createRestaurant({ name: "paris" }),
  //     createRestaurant({ name: "london" }),
  //     createRestaurant({ name: "nyc" }),
  //   ]);
  console.log(await fetchCustomers());
  console.log(await fetchRestaurants());
  //   const [vacation, vacation2] = await Promise.all([
  //     createVacation({
  //       user_id: moe.id,
  //       place_id: nyc.id,
  //       departure_date: "02/14/2024",
  //     }),
  //     createVacation({
  //       user_id: moe.id,
  //       place_id: nyc.id,
  //       departure_date: "02/28/2024",
  //     }),
  //   ]);
  console.log(await fetchReservations());
  //   await destroyVacation({ id: vacation.id, user_id: vacation.user_id });
  //   console.log("New list of reservations", await fetchreservations());

  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`listening on port ${port}`);
    console.log("some curl commands to test");
    console.log(`curl localhost:${port}/api/customers`);
    console.log(`curl localhost:${port}/api/restaurants`);
    console.log(`curl localhost:${port}/api/reservations`);
  });
};

init();
