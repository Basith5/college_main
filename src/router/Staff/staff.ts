import { PrismaClient, Prisma } from '@prisma/client';
import { Request, Response } from "express"

const prisma = new PrismaClient();

//#region getAllStaff
async function getAllStaff(req: Request, res: Response) {
    const { page, question } = req.query

    try {
        const pageNumber = parseInt(page?.toString() || '1', 10);
        const pageSizeNumber = parseInt('10', 10);
        const skip = (pageNumber - 1) * pageSizeNumber;

        const getData = await prisma.user.findMany({
            skip, // Skip records based on the page number
            take: pageSizeNumber,
            orderBy: {
                name: "asc",
            },
            where: {
                name: {
                    contains: question as string
                }
            }

        })

        const getDataCount = await prisma.user.count()

        const totalPages = Math.ceil(getDataCount / pageSizeNumber);

        if (!getData) {
            return res.status(500).json({
                error: {
                    message: "No data",
                }
            });
        }

        return res.status(200).json({
            data: getData,
            totalPages
        });

    } catch (error) {

        return res.status(500).json({
            error: {
                message: "An error occurred while fetching data",
            }
        });
    }

}
//#endregion

//#region getby CourseStaffTaken
async function getByCourseStaffTaken(req: Request, res: Response) {
    const { uname } = req.query

    if (!uname) {
        return res.status(400).json({
            error: {
                message: "Id missing",
            }
        });
    }

    try {

        const getDetails = await prisma.staff.findMany({
            where: {
                uname: String(uname)
            },
            include: {
                code: {
                    include: {
                        pso: true
                    }
                },

            }
        })

        if (getDetails) {
            return res.status(200).json({
                data: getDetails
            });
        }

        return res.status(500).json({
            error: {
                message: "An error occurred while fetching data",
            }
        });


    } catch (error) {

        return res.status(500).json({
            error: {
                message: "An error occurred while fetching data",
            }
        });
    }



}
//#endregion

async function getStaff(req: Request, res: Response) {
    try {
        const uname = req.query.uname as string;
        const department = req.query.department as string;

        if (!uname || !department) {
            return res.status(400).json({ error: "'uname' and 'department' query parameters are required." });
        }

        let staffRecords;

        if (uname !== 'admin') {
            staffRecords = await prisma.staff.findMany({
                where: { uname: uname },
                select: {
                    code: {
                        select: { name: true, depCode: true, code: true }, // Include code in the selection
                    },
                },
            });
        }
        else {
            staffRecords = await prisma.staff.findMany({
                select: {
                    code: {
                        select: { name: true, depCode: true, code: true }, // Include code in the selection
                    },
                },
            });
        }


        if (!staffRecords || staffRecords.length === 0) {
            return res.status(404).json({ error: "No staff records found for the provided uname and department." });
        }

        const codeInfo = staffRecords
            .filter((record) => record.code.depCode === department)
            .map((record) => {
                return {
                    name: record.code.name,
                    depCode: record.code.depCode,
                    courseCode: record.code.code, // Include course code in the response
                };
            });

        res.status(200).json({ codeInfo: codeInfo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error." });
    }
}



export { getAllStaff, getByCourseStaffTaken, getStaff }