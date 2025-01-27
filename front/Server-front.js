// import module
const express = require('express');
const dotenv = require('dotenv');
const path = require('path')


/* --------------------------*/
dotenv.config();
const app = express();
const Admin = express.Router();

/* --------------------------*/
// ใช้ middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


/* --------------------------*/
    // ตั้งค่าเส้นทาง static
app.use('/', express.static(path.join(__dirname, 'public')));

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
/* --------------------------*/
// กำหนดเส้นทางสำหรับการเรียกใช้ไฟล์ HTML ต่างๆ  
Admin.get('/', (req, res) => {
    console.log('Request at /');
    res.sendFile(path.join(__dirname, 'public', '/bus.html'));
})

/* --------------------------*/

// Run Server 
app.listen(process.env.PORT, function () {
    console.log(`Server-front is running on port: ${process.env.PORT}`);
});
