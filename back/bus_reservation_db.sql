create database bus_reservation_db;
CREATE USER 'Admin_bus'@'localhost' IDENTIFIED BY '11400';
GRANT SELECT, INSERT, UPDATE, DELETE ON bus_reservation_db.* TO 'Admin_bus'@'localhost';
FLUSH PRIVILEGES;


use  bus_reservation_db;

-- 1. ตารางผู้ใช้ (Users)
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    phone_number VARCHAR(15),
    password VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO Users (name, phone_number, password) VALUES
('Pornpat Punthong', '1234567890', 'password123'),
('Somchai Tirasak', '0987654321', 'somchai2024'),
('Nina Suriya', '0876543210', 'nina@123');

-- 2. ตารางรถบัส (Buses)
CREATE TABLE Buses (
    bus_id INT AUTO_INCREMENT PRIMARY KEY,
    bus_number VARCHAR(50),
    seats INT,  -- จำนวนที่นั่ง
    type VARCHAR(50),  -- ประเภทของรถบัส (เช่น VIP, ปกติ)
    departure_city VARCHAR(100),
    destination_city VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO Buses (bus_number, seats, type, departure_city, destination_city) VALUES
('VIP-001', 30, 'VIP', 'Bangkok', 'Chiang Mai'),
('VIP-002', 30, 'VIP', 'Bangkok', 'Phuket'),
('NORMAL-003', 40, 'Normal', 'Chiang Mai', 'Bangkok'),
('NORMAL-004', 40, 'Normal', 'Phuket', 'Bangkok');

-- 3. ตารางการเดินทาง (Trips)
CREATE TABLE Trips (
    trip_id INT AUTO_INCREMENT PRIMARY KEY,
    bus_id INT,
    departure_time DATETIME,
    arrival_time DATETIME,
    price DECIMAL(10, 2),
    FOREIGN KEY (bus_id) REFERENCES Buses(bus_id)
);
INSERT INTO Trips (bus_id, departure_time, arrival_time, price) VALUES
(1, '2025-02-01 08:00:00', '2025-02-01 18:00:00', 500.00),
(2, '2025-02-01 09:00:00', '2025-02-01 20:00:00', 600.00),
(3, '2025-02-01 10:00:00', '2025-02-01 18:30:00', 350.00),
(4, '2025-02-01 11:00:00', '2025-02-01 20:30:00', 400.00);

-- 4. ตารางการจอง (Reservations)
CREATE TABLE Reservations (
    reservation_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    trip_id INT,
    seats_reserved INT,
    total_amount DECIMAL(10, 2),
    reservation_status ENUM('Pending', 'Confirmed', 'Cancelled') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (trip_id) REFERENCES Trips(trip_id)
);
INSERT INTO Reservations (user_id, trip_id, seats_reserved, total_amount, reservation_status) VALUES
(1, 1, 2, 1000.00, 'Confirmed'),
(2, 2, 3, 1800.00, 'Pending'),
(3, 3, 1, 350.00, 'Confirmed');

-- 5. ตารางสถานี (Stations)
CREATE TABLE Stations (
    station_id INT AUTO_INCREMENT PRIMARY KEY,
    station_name VARCHAR(100),
    city VARCHAR(100),
    address VARCHAR(255)
);
INSERT INTO Stations (station_name, city, address) VALUES
('Bangkok Central', 'Bangkok', '123 Sukhumvit Rd, Bangkok'),
('Chiang Mai Bus Station', 'Chiang Mai', '456 Chiang Mai Rd, Chiang Mai'),
('Phuket Bus Station', 'Phuket', '789 Patong Beach Rd, Phuket');

-- 6. ตารางเส้นทาง (Routes)
CREATE TABLE Routes (
    route_id INT AUTO_INCREMENT PRIMARY KEY,
    departure_station_id INT,
    destination_station_id INT,
    FOREIGN KEY (departure_station_id) REFERENCES Stations(station_id),
    FOREIGN KEY (destination_station_id) REFERENCES Stations(station_id)
);
INSERT INTO Routes (departure_station_id, destination_station_id) VALUES
(1, 2),  -- From Bangkok to Chiang Mai
(1, 3),  -- From Bangkok to Phuket
(2, 1),  -- From Chiang Mai to Bangkok
(3, 1);  -- From Phuket to Bangkok


