import { PrismaClient, Prisma } from '@prisma/client';
import { Request, Response } from "express"

const prisma = new PrismaClient();

// Dashboard

async function Dahsbaord(req: Request, res: Response) {
    try {
        const { year, sem } = req.query;
        
        let cia1 = 0;
        let cia2 = 0;
        let oc1 = 0;
        let oc2 = 0;
        let ese = 0;

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

        const courses = await prisma.code.findMany({
            where: {
                department: {
                    year: Number(year)
                },
                semester: sem as string
            }
        })

        if (courses) {
            const marks = await Promise.all(courses.map(async (item) => {
                try {
                    const mark = await prisma.student.findFirst({
                        where: {
                            codeId: item.id
                        },
                        select: {
                            marks: true
                        }
                    });
                    return mark;
                } catch (error) {
                    console.error(`Error fetching marks for course ${item.id}: ${error}`);
                    return null;
                }
            }));

            interface Mark {
                [key: string]: any; // Replace 'any' with the actual type of the fields in mark.marks[0]
            }

            function incrementCounter(counter: number, mark: { marks: Mark[] } | null, field: keyof Mark) {
                if (mark !== null && mark.marks[0][field] !== null) {
                    counter++;
                }
                return counter;
            }


            marks.forEach((mark) => {
                cia1 = incrementCounter(cia1, mark, 'C1STAFF');
                cia2 = incrementCounter(cia2, mark, 'C2STAFF');
                oc1 = incrementCounter(oc1, mark, 'ASG1STAFF');
                oc2 = incrementCounter(oc2, mark, 'ASG2STAFF');
                ese = incrementCounter(ese, mark, 'ESESTAFF');
            });

        }


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

        res.status(200).json({ studentCount, coures, staff, department, cia1, cia2, oc1, oc2, ese });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Internal server error.' });
    }
}

export { Dahsbaord }