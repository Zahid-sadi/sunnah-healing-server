const express = require("express");
const cors = require("cors");
require("dotenv").config();
const {MongoClient, ServerApiVersion} = require("mongodb");

const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("sunnah healing is running");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2hres75.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        await client.connect();
        const appointmentCategoryCollection = client.db("sunnahHealing").collection("appointmentCategory");
        const appointmentCollection = client.db("sunnahHealing").collection("appointments");

        app.get("/appointmentCategory", async (req, res) => {
            const query = {};
            const date = req.query.date;
            console.log(date);

            const categories = await appointmentCategoryCollection.find(query).toArray();

            const appointDate = {appointmentDate: date};
            const booked = await appointmentCollection.find(appointDate).toArray();
            // console.log(booked);

            categories.forEach((category) => {
                const categoryBooked = booked.filter((book) => book.serviceName === category.name);
                // console.log(categoryBooked);

                const bookedSlots = categoryBooked.map((book) => book.slot);
                // console.log(category.name, bookedSlots);

                const remainingSlots = category.slots.filter((slot) => !bookedSlots.includes(slot));
                category.slots = remainingSlots;
                console.log(category.name, remainingSlots.length);
            });
            res.send(categories);
        });

        app.post("/appointments", async (req, res) => {
            const appointment = req.body;

            const query = {
                appointmentDate: appointment.appointmentDate,
                serviceName :appointment.serviceName,
                email :appointment.email,
                // slot :appointment.slot,
            };

            const bookedCount = await appointmentCollection.find(query).toArray();

            if (bookedCount.length) {
                const warningMsg = `you have booked for the same date ${appointment.appointmentDate} or same time ${appointment.slot}  or same service ${appointment.serviceName} `;
                return res.send({acknowledged:false, warningMsg})
            }
            console.log(appointment);
            const result = await appointmentCollection.insertOne(appointment);
            res.send(result);
        });

        await client.db("admin").command({ping: 1});
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        //  await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => console.log(`sunnah healing running ${port}`));
