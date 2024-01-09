import express, { Request, Response, response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import * as fs from 'fs';
import csv from 'csv-parser';
import { getFilePath } from '../common';

const prisma = new PrismaClient();

async function excelDepInsert(tempdata: { category: string; depCode: string; name: string; }) {

    let isUG = tempdata.depCode[0] === 'U' ? 'UG' : 'PG'
    try {
        const check = await prisma.department.findFirst({
            where: {
                departmentCode: tempdata.depCode,
            },
        });

        if (!check) {
            await prisma.department.create({
                data: {
                    departmentCode: tempdata.depCode,
                    name: tempdata.name + '-' + isUG,
                    catagory: tempdata.category
                }
            })

        }

    } catch (error) {
    }
}

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

//#region addNewDepartment
async function addNewDepartment(req: Request, res: Response) {
    const { depCode, name, cat } = req.body

    if (!depCode || !name || !cat) {
        return res.status(500).json({
            msg: "Fill details",

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
            msg: e,

        });
    }

}
//#endregion

//#region DeleteDepartment
async function deleteDepartment(req: Request, res: Response) {
    const { id } = req.query

    if (!id) {
        return res.status(500).json({
            msg: "id not found",

        });
    }

    try {
        const checkExisting = await prisma.department.findFirst({
            where: {
                id: Number(id)
            }
        })
        console.log(checkExisting)

        if (checkExisting) {
            await prisma.code.deleteMany({
                where: {
                    depCode: checkExisting.departmentCode
                },
            })

            await prisma.department.deleteMany({
                where: {
                    id: checkExisting?.id
                },
                // include:{
                //     codes:{
                //         include:{
                //             students:{
                //                 include:{
                //                     marks:true
                //                 }
                //             },
                //             staff:true
                //         }
                //     }
                // }
            })

            return res.status(200).json({
                success: 'Deleted'
            })
        }
        else {
            return res.status(500).json({
                msg: 'Not Found'

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
async function excelDepartment(req: Request, res: Response) {
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
    let tempdata: { category: string, name: string, depCode: string }[] = [];

    fs.createReadStream(dest)
        .pipe(csv())
        .on('data', async (row) => {
            if ('depCode' in row) {
                tempdata.push({
                    category: row.category.trim(),
                    name: row.name,
                    depCode: row.depCode.trim(),
                })
                totalCourse = totalCourse + 1
            }
        })
        .on('end', async () => {
            for (let i = 0; i < tempdata.length; i++) {
                await excelDepInsert(tempdata[i])
            }

            console.log('CSV file successfully processed');
        });

    return res.status(200).json({
        success: totalCourse + ' Program updated successfully'
    });

}
//#endregion

export { getAllDepartment, addNewDepartment, deleteDepartment, excelDepartment }