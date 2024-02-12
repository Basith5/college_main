import { PrismaClient, Prisma } from '@prisma/client';
import { Request, Response } from "express"

const prisma = new PrismaClient();

// Dashboard

async function Dahsbaord(req: Request, res: Response) {
    try {
        const { year, sem } = req.query;

        if (!year || !sem) {
            return res.status(400).json({
                msg: "Missing field Year or sem ",
            });
        }

        const staffCount = await prisma.user.findMany({
            where: {
                role: 'Staff'
            }
        });

        const couresCount = await prisma.code.groupBy({
            by: ['id'], 
            _count: true,  
            where: {
                department: {
                    year: Number(year),
                },
                semester: sem as string // Explicitly cast sem to string
            }
        });

        const students = await prisma.student.findMany({
            where: {
                code: {
                    department: {
                        year: Number(year),
                    },
                    semester: sem as string, // Explicitly cast sem to string
                }
            },
            distinct: ['regNo'] // Select distinct register numbers
        });

        const departmentCount = await prisma.department.findMany({
            where: {
                year: Number(year),
                codes: {
                    some: {
                        semester: sem as string, // Explicitly cast sem to string
                    }
                }
            }
        });

        // Count the number of unique register numbers
        const department = departmentCount.length;
        const studentCount = students.length;
        const coures = couresCount.length;
        const staff = staffCount.length;

        if (!staff || !coures || !studentCount) {
            return res.status(400).json({
                msg: "No data found for the specified year and semester ",
            });
        }

        res.status(200).json({ studentCount, coures, staff, department });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Internal server error.' });
    }
}

export { Dahsbaord }