import express, { Request, Response, response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
const prisma = new PrismaClient();

//#region getAllDepartment
async function getAllDepartment(req: Request, res: Response) {
    const { page, question } = req.query

    try {

        const pageNumber = parseInt(page?.toString() || '1', 10);
        const pageSizeNumber = parseInt('10', 10);
        const skip = (pageNumber - 1) * pageSizeNumber;

        const getData = await prisma.department.findMany({
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

        const getDataCount = await prisma.department.count()

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

//#region addNewDepartment
async function addNewDepartment(req: Request, res: Response) {
    const { depCode, name, cat } = req.body

    if (!depCode || !name || !cat) {
        return res.status(500).json({
            error: {
                message: "Fill details",
            }
        });
    }

    try {
        const checkExisting = await prisma.department.findFirst({
            where: {
                departmentCode: String(depCode)
            }
        })

        if (checkExisting) {
            await prisma.department.update({
                where: {
                    id: checkExisting.id
                },
                data: {
                    name: String(name),
                    departmentCode: String(depCode),
                    catagory: String(cat)
                },
            });
            return res.status(200).json({
                success: "Successfully Updated"
            });
        }


        await prisma.department.create({
            data: {
                name: String(name),
                departmentCode: String(depCode),
                catagory: String(cat)
                // Map other CSV columns to your Prisma model fields
            },
        });

        return res.status(200).json({
            success: "Successfully Added"
        });
    }
    catch (e) {
        return res.status(500).json({
            error: {
                message: e,
            }
        });
    }

}
//#endregion

//#region DeleteDepartment
async function deleteDepartment(req: Request, res: Response) {
    const { id } = req.query

    if (!id) {
        return res.status(500).json({
            error: {
                message: "id not found",
            }
        });
    }

    try {
        const checkExisting = await prisma.department.findFirst({
            where: {
                id: Number(id)
            }
        })

        if (checkExisting) {
            const deleteCourse = await prisma.department.delete({
                where: {
                    id: Number(id)
                },
            })

            return res.status(200).json({
                success: 'Deleted'
            })
        }
        else {
            return res.status(500).json({
                error: {
                    message: 'Not Found'
                }
            });
        }

    }
    catch (e) {
        return res.status(500).json({
            error: {
                message: e,
            }
        });
    }

}
//#endregion

export { getAllDepartment, addNewDepartment, deleteDepartment }