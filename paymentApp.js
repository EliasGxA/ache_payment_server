const path = require("path");
const express = require("express");
const stripe = require("stripe")(
  "sk_test_51IlpAKGXwjeEInzCSAg83BM5MGx6KUTDKK5DwZBEZwsO4IAs60fjv8PWtIjFs0AciEcSJGsk2l4lhFP5y9HoXvr700Z4zCRTQX"
);
const cors = require("cors");

const app = express();
app.use(cors());

const base_url = "https://react-paymentsite.herokuapp.com/";

app.get("/api", async (req, res) => {
  console.log("/api get");
  res.status(200).send({ test: "test:)" });
});

app.post("/api/payments/mobile/create", async (req, res) => {
  console.log("api requested");
  const amount = req.query.amount;
  const name = req.query.name;
  const email = req.query.email;

  try {
    const customer = await createCustomer(name, email);
    const session = await createCheckOutSession(amount, customer.id);
    console.log("session", session);
    console.log("customer", customer);
    res.status(200).send(session);
  } catch (error) {
    console.log("An error here", error);
  }
});

async function createCustomer(name, email) {
  return new Promise(function (resolve, reject) {
    stripe.customers
      .create({
        email: email,
        name: name,
      })
      .then((customer) => {
        resolve(customer);
      })
      .catch((err) => {
        // Error response
        reject(err);
        console.log(err);
      });
  });
}

async function createCheckOutSession(amount, customer) {
  //eslint-disable-line

  return new Promise(function (resolve, reject) {
    stripe.checkout.sessions
      .create({
        payment_method_types: ["card", "ideal"],
        customer: customer,
        line_items: [
          {
            name: "Buy your stuff here",
            amount: amount * 100,
            currency: "eur",
            quantity: 1,
          },
        ],
        success_url: base_url + "payment-success",
        cancel_url: base_url + "payment-failure",
        locale: "en",
      })
      .then((source) => {
        // Success response
        const response = {
          statusCode: 200,
          body: JSON.stringify(source),
        };
        //console.log("response", response);

        resolve(response);
      })
      .catch((err) => {
        // Error response
        const response = {
          statusCode: 500,
          body: JSON.stringify(err.message),
        };
        console.log(err);

        reject(response);
      });
  });
}

app.listen(4000, () => {
  console.log(`app listening at http://localhost:${4000}`);
});
