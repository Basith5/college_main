import { PrismaClient, Prisma } from '@prisma/client';
import { Request, Response } from "express"
import * as fs from 'fs';
import csv from 'csv-parser';
import { getFilePath } from '../common';

const prisma = new PrismaClient();

async function excelCourseInsert(tempdata: { code: string; depCode: string; name: string; }) {

    try {
        const check = await prisma.code.findFirst({
            where: {
                depCode: tempdata.depCode,
                code: tempdata.code,
            },
        });

        if (!check) {
            await prisma.code.create({
                data: {
                    depCode: tempdata.depCode,
                    code: tempdata.code,
                    name: tempdata.name,
                    uname: 'none'
                }
            })

        }
        console.log(check?.code)

    } catch (error) {
        console.error(error);
    }
}

//#region getAllCourses
async function getAllCourses(req: Request, res: Response) {
    const { page, question } = req.query

    try {

        const pageNumber = parseInt(page?.toString() || '1', 10);
        const pageSizeNumber = parseInt('10', 10);
        const skip = (pageNumber - 1) * pageSizeNumber;

        const getData = await prisma.code.findMany({
            skip, // Skip records based on the page number
            take: pageSizeNumber,
            orderBy: {
                depCode: "asc",
            },
            where: {
                name: {
                    contains: question as string
                }
            }

        })

        const getDataCount = await prisma.code.count()

        const totalPages = Math.ceil(getDataCount / pageSizeNumber);

        if (!getData) {
            return res.status(500).json({
                msg: "No data",
            });
        }

        return res.status(200).json({
            data: getData,
            totalPages
        });



    } catch (error) {

        return res.status(500).json({
            msg: "An error occurred while fetching data",

        });
    }
}
//#endregion

//#region addNewCourse
async function addNewCourse(req: Request, res: Response) {
    const { depCode, name, code } = req.body

    if (!depCode || !name || !code) {
        return res.status(500).json({
            msg: "please fill all field"
        });
    }

    try {
        const checkExistingDep = await prisma.department.findFirst({
            where: {
                departmentCode: {
                    equals: String(depCode)
                }
            }
        })

        console.log(checkExistingDep)

        if (checkExistingDep || false) {
            const checkExisting = await prisma.code.findFirst({
                where: {
                    code: String(code)
                }
            })

            if (checkExisting) {
                await prisma.code.update({
                    where: {
                        id: checkExisting.id
                    },
                    data: {
                        name: String(name),
                        depCode: String(depCode),
                        code: String(code)
                    },
                });
                return res.status(200).json({
                    success: "Successfully Updated"
                });
            }


            await prisma.code.create({
                data: {
                    name: String(name),
                    depCode: String(depCode),
                    code: String(code),
                    uname: ''
                    // Map other CSV columns to your Prisma model fields
                },
            });

            return res.status(200).json({
                success: "Successfully Added"
            });

        }
        else {
            return res.status(500).json({
                success: "Dep code is not found"
            });
        }


    }
    catch (e) {
        return res.status(500).json({
            msg: e,
        });
    }

}
//#endregion

//#region deleteCourse
async function deleteCourse(req: Request, res: Response) {
    const { id } = req.query

    if (!id) {
        return res.status(500).json({
            msg: "id not found",
            
        });
    }

    try {
        const checkExisting = await prisma.code.findFirst({
            where: {
                id: Number(id)
            }
        })

        if (checkExisting) {
            const deleteCourse = await prisma.code.delete({
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
                msg: 'Code not found'
            });
        }

    }
    catch (e) {
        return res.status(500).json({
            msg: e,
        });
    }

}
//#endregion

//#region excelCourse
async function excelCourse(req: Request, res: Response) {
    const files = req.file as Express.Multer.File;

    const dest = await getFilePath(files);
    if (!dest) {
        return res.status(500).json({
            success: 'Failed with file name'
        });
    }

    if (!files) {
        return res.status(500).json({
            success: 'please upload file'
        });
    }

    let totalCourse = 1
    let tempdata: { code: string, name: string, depCode: string }[] = [];

    fs.createReadStream(dest)
        .pipe(csv())
        .on('data', async (row) => {
            if ('course_id' in row) {
                if (row.Subject_Type === 'THEORY') {
                    tempdata.push({
                        code: row.Sub_Code.trim(),
                        name: row.Title,
                        depCode: row.course_id.trim(),
                    })
                    totalCourse = totalCourse + 1
                }
            }


        })
        .on('end', async () => {
            for (let i = 0; i < tempdata.length; i++) {
                await excelCourseInsert(tempdata[i])
            }

            console.log('CSV file successfully processed');
        });

    return res.status(200).json({
        success: totalCourse + ' Courses updated successfully'
    });

}
//#endregion


export { getAllCourses, addNewCourse, deleteCourse, excelCourse }