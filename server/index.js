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

app.use((error, req, res, next) => {
  res.status(res.status || 500).send({ error: error.message });
});

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
        customer_id: req.params.customer_id,
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
  const [
    Wade_Wilson,
    Steve_Rogers,
    Bucky_Barnes,
    Tony_Stark,
    Los_Pollos_Hermanos,
    Gusteaus,
    Mos_Eisley_Cantina,
  ] = await Promise.all([
    createCustomer({ name: "Wade_Wilson" }),
    createCustomer({ name: "Steve_Rogers" }),
    createCustomer({ name: "Bucky_Barnes" }),
    createCustomer({ name: "Tony_Stark" }),
    createRestaurant({ name: "Los_Pollos_Hermanos" }),
    createRestaurant({ name: "Gusteaus" }),
    createRestaurant({ name: "Mos_Eisley_Cantina" }),
  ]);
  console.log(await fetchCustomers());
  console.log(await fetchRestaurants());
  const [reservation, reservation2, reservation3] = await Promise.all([
    createReservation({
      date: "02/14/2024",
      party_count: 4,
      customer_id: Steve_Rogers.id,
      restaurant_id: Gusteaus.id,
    }),
    createReservation({
      date: "07/26/2024",
      party_count: 4,
      customer_id: Wade_Wilson.id,
      restaurant_id: Los_Pollos_Hermanos.id,
    }),
    createReservation({
      date: "03/14/2024",
      party_count: 2,
      customer_id: Tony_Stark.id,
      restaurant_id: Mos_Eisley_Cantina.id,
    }),
  ]);
  console.log(await fetchReservations());
  await destroyReservation({
    id: reservation.id,
    user_id: reservation.customer_id,
  });
  console.log("New list of reservations", await fetchReservations());

  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`listening on port ${port}`);
    // console.log("some curl commands to test");
    // console.log(`curl localhost:${port}/api/customers`);
    // console.log(`curl localhost:${port}/api/restaurants`);
    // console.log(`curl localhost:${port}/api/reservations`);
  });
};

init();
