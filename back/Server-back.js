
// import module
const express = require('express');
const dotenv = require('dotenv');
const mysql = require('mysql2');
const cors = require('cors');
const authorize = require("./middleware/auth.js");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')




/* --------------------------*/
dotenv.config();
const app = express();
const Admin = express.Router();


/* --------------------------*/
// ใช้ middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* --------------------------*/

/* CORS */
let corsOptions = {
    origin: 'http://localhost:3004', // โดเมนที่อนุญาต
    methods: 'GET,POST,PUT,DELETE', // เมธอดที่อนุญาต

};

app.use(cors(corsOptions));

/* --------------------------*/

// เชื่อมต่อฐานข้อมูล
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});
connection.connect(function (err) {
    if (err) {
        console.error("Database connection failed:", err);
        process.exit(1);  //หยุดการทำงานของ server
    }
    console.log(`Connected DB: ${process.env.DB_NAME}`);
});
/* --------------------------*/

app.use('/', Admin);

//  404 ไม่พบเส้นทาง
app.use((req, res, next) => {
    res.status(404).send('Page Not Found');
});
// Error
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
})
//------ User ------
Admin.get('/user/:id', function (req, res) {
    let UserID = req.params.id;

    if (!UserID) {
        return res.status(400).send({
            error: true,
            message: 'Please provide UserID'
        });
    }
    connection.query("SELECT * FROM Users WHERE user_id = ?", [UserID], function (error, results) {
        if (error) throw error;
        if (results.length === 0) {
            return res.status(404).send({
                error: true,
                message: 'User not found.'
            });
        }

        return res.send({
            error: false,
            data: results[0],
            message: 'User retrieved'
        });
    });
})
Admin.get('/users', function (req, res) {
    connection.query("SELECT * FROM Users", function (error, results) {
        if (error) throw error;
        return res.send({
            error: false,
            data: results,
            message: 'Users list'
        });
    });
});
// เพิ่มผู้ใช้ใหม่
Admin.post('/user', async (req, res) => {
    const { name, phone_number, password } = req.body;

    if (!name || !phone_number || !password) {
        return res.status(400).send({
            error: true,
            message: 'Please provide name, phone_number, and password'
        });
    }

    // เข้ารหัสรหัสผ่านก่อนบันทึก
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `INSERT INTO Users (name, phone_number, password) VALUES (?, ?, ?)`;
    connection.query(query, [name, phone_number, hashedPassword], (error, results) => {
        if (error) throw error;
        return res.send({
            error: false,
            data: results.insertId,
            message: 'User registered successfully'
        });
    });
});

//------ Bus ------
Admin.get('/buses', (req, res) => {
    connection.query("SELECT * FROM Buses", function (error, results) {
        if (error) throw error;
        return res.send({
            error: false,
            data: results,
            message: 'Buses list'
        });
    });
});
Admin.get('/bus/:id', function (req, res) {
    let BusID = req.params.id;

    if (!BusID) {
        return res.status(400).send({
            error: true,
            message: 'Please provide BusID'
        });
    }
    connection.query("SELECT * FROM Buses WHERE bus_id = ?", [BusID], function (error, results) {
        if (error) throw error;
        if (results.length === 0) {
            return res.status(404).send({
                error: true,
                message: 'Bus not found.'
            });
        }

        return res.send({
            error: false,
            data: results[0],
            message: 'Bus retrieved'
        });
    });
})
//------ station ------
Admin.get('/stations', (req, res) => {
    connection.query("SELECT * FROM Stations", function (error, results) {
        if (error) throw error;
        return res.send({
            error: false,
            data: results,
            message: 'Stations list'
        });
    });
});
Admin.get('/station/:id', (req, res) => {
    let stationID = req.params.id;

    if (!stationID) {
        return res.status(400).send({
            error: true,
            message: 'Please provide StationID'
        });
    }

    connection.query("SELECT * FROM Stations WHERE station_id = ?", [stationID], function (error, results) {
        if (error) throw error;
        if (results.length === 0) {
            return res.status(404).send({
                error: true,
                message: 'Station not found.'
            });
        }

        return res.send({
            error: false,
            data: results[0],
            message: 'Station retrieved'
        });
    });
});
//------ Trip ------
Admin.get('/trips', (req, res) => {
    connection.query("SELECT * FROM Trips", function (error, results) {
        if (error) throw error;
        return res.send({
            error: false,
            data: results,
            message: 'Trips list'
        });
    });
});
Admin.get('/trip/:id', (req, res) => {
    let tripID = req.params.id;

    if (!tripID) {
        return res.status(400).send({
            error: true,
            message: 'Please provide TripID'
        });
    }

    connection.query("SELECT * FROM Trips WHERE trip_id = ?", [tripID], function (error, results) {
        if (error) throw error;
        if (results.length === 0) {
            return res.status(404).send({
                error: true,
                message: 'Trip not found.'
            });
        }

        return res.send({
            error: false,
            data: results[0],
            message: 'Trip retrieved'
        });
    });
});
//------ Routes ------
Admin.get('/routes', (req, res) => {
    const query = `
        SELECT r.route_id, s1.station_name AS departure, s2.station_name AS destination
        FROM Routes r
        JOIN Stations s1 ON r.departure_station_id = s1.station_id
        JOIN Stations s2 ON r.destination_station_id = s2.station_id;
    `;
    connection.query(query, (error, results) => {
        if (error) throw error;
        return res.send({
            error: false,
            data: results,
            message: 'Routes list'
        });
    });
});
//------ Route Details ------ 
Admin.get('/route/:id', (req, res) => {
    let routeID = req.params.id;

    if (!routeID) {
        return res.status(400).send({
            error: true,
            message: 'Please provide RouteID'
        });
    }

    const query = `
        SELECT r.route_id, s1.station_name AS departure, s2.station_name AS destination
        FROM Routes r
        JOIN Stations s1 ON r.departure_station_id = s1.station_id
        JOIN Stations s2 ON r.destination_station_id = s2.station_id
        WHERE r.route_id = ?
    `;
    
    connection.query(query, [routeID], (error, results) => {
        if (error) throw error;
        if (results.length === 0) {
            return res.status(404).send({
                error: true,
                message: 'Route not found.'
            });
        }

        return res.send({
            error: false,
            data: results[0],
            message: 'Route retrieved'
        });
    });
});

//------ Reservation ------
Admin.get('/reservations',authorize, (req, res) => {
    connection.query("SELECT * FROM Reservations", function (error, results) {
        if (error) throw error;
        return res.send({
            error: false,
            data: results,
            message: 'Reservations list'
        });
    });
});
Admin.get('/reservation/:id',authorize, (req, res) => {
    let reservationID = req.params.id;

    if (!reservationID) {
        return res.status(400).send({
            error: true,
            message: 'Please provide ReservationID'
        });
    }

    connection.query("SELECT * FROM Reservations WHERE reservation_id = ?", [reservationID], function (error, results) {
        if (error) throw error;
        if (results.length === 0) {
            return res.status(404).send({
                error: true,
                message: 'Reservation not found.'
            });
        }

        return res.send({
            error: false,
            data: results[0],
            message: 'Reservation retrieved'
        });
    });
});
//------ Reservation เพิ่มการจอง------
Admin.post('/reservation', authorize,(req, res) => {
    const { user_id, trip_id, seats_reserved, total_amount, reservation_status } = req.body;

    if (!user_id || !trip_id || !seats_reserved || !total_amount) {
        return res.status(400).send({
            error: true,
            message: 'Please provide all required fields (user_id, trip_id, seats_reserved, total_amount)'
        });
    }

    connection.query(
        "INSERT INTO Reservations (user_id, trip_id, seats_reserved, total_amount, reservation_status) VALUES (?, ?, ?, ?, ?)",
        [user_id, trip_id, seats_reserved, total_amount, reservation_status || 'Pending'],
        function (error, results) {
            if (error) throw error;
            return res.send({
                error: false,
                data: results.insertId,
                message: 'Reservation created successfully'
            });
        }
    );
});
//------ Reservation แก้ไขการจอง------
Admin.put('/reservation/:id',authorize, (req, res) => {
    let reservationID = req.params.id;
    let { reservation_status } = req.body;

    if (!reservationID || !reservation_status) {
        return res.status(400).send({
            error: true,
            message: 'Please provide ReservationID and new status'
        });
    }

    connection.query(
        "UPDATE Reservations SET reservation_status = ? WHERE reservation_id = ?",
        [reservation_status, reservationID],
        function (error, results) {
            if (error) throw error;

            return res.send({
                error: false,
                data: results.affectedRows,
                message: 'Reservation updated successfully'
            });
        }
    );
});

//------ Reservation ลบการจอง------
Admin.delete('/reservation/:id', authorize,(req, res) => {
    let reservationID = req.params.id;

    if (!reservationID) {
        return res.status(400).send({
            error: true,
            message: 'Please provide ReservationID'
        });
    }

    connection.query(
        "DELETE FROM Reservations WHERE reservation_id = ?",
        [reservationID],
        function (error, results) {
            if (error) throw error;

            return res.send({
                error: false,
                data: results.affectedRows,
                message: 'Reservation deleted successfully'
            });
        }
    );
});
/* --------------------------*/
// เข้าสู่ระบบ
Admin.post('/login', (req, res) => {
    const { phone_number, password } = req.body;

    if (!phone_number || !password) {
        return res.status(400).send({
            error: true,
            message: 'Please provide phone_number and password'
        });
    }

    // ค้นหาผู้ใช้ในฐานข้อมูล
    connection.query("SELECT * FROM Users WHERE phone_number = ?", [phone_number], async (error, results) => {
        if (error) throw error;
        if (results.length === 0) {
            return res.status(404).send({
                error: true,
                message: 'User not found'
            });
        }

        const user = results[0];

        // ตรวจสอบรหัสผ่าน
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send({
                error: true,
                message: 'Invalid credentials'
            });
        }

        // สร้าง JWT Token
        const token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res.send({
            error: false,
            message: 'Login successful',
            token: token
        });
    });
});
//ออกจากระบบ


// Run Server 
app.listen(process.env.PORT, function () {
    console.log(`Server-back is running on port: ${process.env.PORT}`);
});