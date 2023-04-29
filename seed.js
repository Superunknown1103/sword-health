import User from "./models/User.model.js";
import bcrypt from 'bcrypt';
import { createDatabase, database } from './database.js';
import models from './models/index.js';

const queryInterface = database.getQueryInterface();
const mySQLdate = new Date().toISOString().slice(0, 19).replace('T', ' ');
const assignTechnician = async () => {
    const technicians = await User.findAll({
        where: {
            role: 'technician'
        }
    });
    const techIds = technicians.map(t => t.dataValues.id);
    const randomTechnicianId = techIds[Math.floor(Math.random() * techIds.length)];
    return randomTechnicianId;
};
const hashedPassword = await bcrypt.hash('password', 10);

export const seedDatabase = async () => {
    await queryInterface.bulkInsert('Users', [
        // 2 managers
        { username: "bob@company.com", password: hashedPassword, role: "manager", createdAt: mySQLdate, updatedAt: mySQLdate },
        { username: "ashley@company.com", password: hashedPassword, role: "manager", createdAt: mySQLdate, updatedAt: mySQLdate },
        // 4 technicians
        { username: "jeff@company.com", password: hashedPassword, role: "technician", createdAt: mySQLdate, updatedAt: mySQLdate },
        { username: "janice@company.com", password: hashedPassword, role: "technician", createdAt: mySQLdate, updatedAt: mySQLdate },
        { username: "max@company.com", password: hashedPassword, role: "technician", createdAt: mySQLdate, updatedAt: mySQLdate },
        { username: "tom@company.com", password: hashedPassword, role: "technician", createdAt: mySQLdate, updatedAt: mySQLdate },
    ]);
    await assignTechnician();
    await queryInterface.bulkInsert("Tasks", [
        // 4 completed tasks
        {
            summary: "Fix broken printer",
            completed_at: mySQLdate,
            technician_id: await assignTechnician(),
            createdAt: mySQLdate,
            updatedAt: mySQLdate
        },
        {
            summary: "Install new software",
            completed_at: mySQLdate,
            technician_id: await assignTechnician(),
            createdAt: mySQLdate,
            updatedAt: mySQLdate
        },
        {
            summary: "Update website content",
            completed_at: mySQLdate,
            technician_id: await assignTechnician(),
            createdAt: mySQLdate,
            updatedAt: mySQLdate
        },
        {
            summary: "Research service providers",
            completed_at: mySQLdate,
            technician_id: await assignTechnician(),
            createdAt: mySQLdate,
            updatedAt: mySQLdate
        },
        // 4 incomplete tasks 
        {
            summary: "Write user guide",
            technician_id: await assignTechnician(),
            createdAt: mySQLdate,
            updatedAt: mySQLdate
        },
        {
            summary: "Upgrade software",
            technician_id: await assignTechnician(),
            createdAt: mySQLdate,
            updatedAt: mySQLdate
        },
        {
            summary: "Create reports",
            technician_id: await assignTechnician(),
            createdAt: mySQLdate,
            updatedAt: mySQLdate
        },
        {
            summary: "Backup database",
            technician_id: await assignTechnician(),
            createdAt: mySQLdate,
            updatedAt: mySQLdate
        }
    ]);
}

(async () => {
    await createDatabase();
    await database.sync({ force: true });
    await seedDatabase();
})();