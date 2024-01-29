import express, { Request, Response, response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import * as fs from 'fs';
import csv from 'csv-parser';
import { getFilePath } from '../common';

const prisma = new PrismaClient();

async function excelDepInsert(tempdata: { category: string; depCode: string; name: string; }, year: number) {

    let isUG = tempdata.depCode[0] === 'U' ? 'UG' : 'PG'
    try {
        const check = await prisma.department.findFirst({
            where: {
                departmentCode: tempdata.depCode,
                year: year
            },
        });

        if (!check) {
            await prisma.department.create({
                data: {
                    departmentCode: tempdata.depCode,
                    name: tempdata.name + '-' + isUG,
                    catagory: tempdata.category,
                    year: year
                }
            })
        }

    } catch (error) {
    }
}

//#region getAllDepartment
async function getAllDepartment(req: Request, res: Response) {
    const { page, question, year } = req.query

    try {

        const pageNumber = parseInt(page?.toString() || '1', 10);
        const pageSizeNumber = parseInt('10', 10);
        const skip = (pageNumber - 1) * pageSizeNumber;

        const getData = await prisma.department.findMany({
            skip,
            take: pageSizeNumber,
            orderBy: {
                name: "asc",
            },
            where: {
                name: {
                    contains: question as string
                },
                year: Number(year)
            }

        })

        const getDataCount = await prisma.department.count({
            where: {
                year: Number(year)
            }
        })

        const totalPages = Math.ceil(getDataCount / pageSizeNumber);

        if (!getData) {
            return res.status(500).json({
                msg: "No data",
            });
        }

        return res.status(200).json({
            data: getData,
            totalPages,
            getDataCount
        });



    } catch (error) {

        return res.status(500).json({
            msg: "An error occurred while fetching data",

        });
    }



}
//#endregion

//#region addNewDepartment
async function addNewDepartment(req: Request, res: Response) {
    const { depCode, name, cat, year } = req.body

    if (!depCode || !name || !cat) {
        return res.status(500).json({
            msg: "Fill details",

        });
    }

    try {
        const checkExisting = await prisma.department.findFirst({
            where: {
                departmentCode: String(depCode),
                year: Number(year)
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
                catagory: String(cat),
                year: Number(year)
            },
        });

        return res.status(200).json({
            success: "Successfully Added"
        });
    }
    catch (e) {
        return res.status(500).json({
            msg: e,

        });
    }

}
//#endregion

//#region DeleteDepartment
async function deleteDepartment(req: Request, res: Response) {
    const { id, year } = req.query

    if (!id) {
        return res.status(500).json({
            msg: "id not found",

        });
    }

    try {
        const checkExisting = await prisma.department.findFirst({
            where: {
                id: Number(id),

            }
        })

        if (!checkExisting) {
            return res.status(404).json({
                error: 'Department not found',
            });
        }

        const codes = await prisma.code.findMany({
            where: {
                depID: checkExisting.id,
            },
            select: {
                id: true
            }
        });

        const codeIds = codes.map(code => code.id);

        const students = await prisma.student.findMany({
            where: {
                codeId: {
                    in: codeIds
                }
            },
            select: {
                id: true
            }
        });

        const studentIds = students.map(student => student.id);

        await prisma.$transaction([
            prisma.marks.deleteMany({
                where: {
                    studentId: {
                        in: studentIds
                    }
                }
            }),
            prisma.student.deleteMany({
                where: {
                    codeId: {
                        in: codeIds
                    }
                }
            }),
            prisma.staff.deleteMany({
                where: {
                    codeId: {
                        in: codeIds
                    }
                }
            }),
            prisma.pSO.deleteMany({
                where: {
                    codeId: {
                        in: codeIds
                    }
                }
            }),
            prisma.code.deleteMany({
                where: {
                    id: {
                        in: codeIds
                    }
                }
            }),
            prisma.department.delete({
                where: {
                    id: checkExisting.id,
                },
            })
        ]);

        return res.status(200).json({
            success: 'Deleted successfully',
        });
    }
    catch (e) {
        return res.status(500).json({
            msg: e,
        });
    }

}
//#endregion

//#region excelCourse
async function excelDepartment(req: Request, res: Response) {
    const files = req.file as Express.Multer.File;
    const { year } = req.query;

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

    let tempdata: { category: string, name: string, depCode: string }[] = [];

    const readStream = fs.createReadStream(dest)
        .pipe(csv())
        .on('data', async (row) => {
            if ('depCode' in row) {
                tempdata.push({
                    category: row.category.trim(),
                    name: row.name,
                    depCode: row.depCode.trim(),
                })
                
            }
            else {
                readStream.destroy(); // Stop reading the stream
                return res.status(400).json({
                    msg: 'Incorrect file format.'
                });
            }
        })
        .on('end', async () => {
            for (let i = 0; i < tempdata.length; i++) {
                await excelDepInsert(tempdata[i], Number(year))
            }
            return res.status(200).json({
                success: tempdata.length + ' Program updated successfully'
            });
        });

    readStream.on('error', (err) => {
        res.status(500).json({
            msg: 'An error occurred while processing the file'
        });
    });
}
//#endregion

export { getAllDepartment, addNewDepartment, deleteDepartment, excelDepartment }