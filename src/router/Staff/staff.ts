import { PrismaClient, Prisma } from '@prisma/client';
import { Request, Response } from "express"
import * as fs from 'fs';
import csv from 'csv-parser';
import { getFilePath } from '../common';

const prisma = new PrismaClient();

async function excelStaffInsert(tempdata: { code: string; uname: string; name: string; }) {

    try {
        let check = await prisma.user.findFirst({
            where: {
                email: tempdata.uname,
            },
        });

        if (!check) {
            check = await prisma.user.create({
                data: {
                    email: tempdata.uname,
                    password: 'jmc',
                    name: tempdata.name,
                    role: 'Staff',
                    uname: tempdata.uname
                }
            })

        }

        const getCourse = await prisma.code.findFirst({
            where: {
                code: {
                    equals: tempdata.code
                }
            }
        })
        if (!getCourse) {
            return
        }

        await prisma.staff.create({
            data: {
                uname: check?.email,
                staffInitial: 'none',
                staffName: check.name,
                codeId: getCourse?.id
            }
        })

    } catch (error) {
    }
}

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
                    contains: question as string,
                },
                role: {
                    not: 'Admin'
                }
            }

        })

        const getDataCount = await prisma.user.count()

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

//#region getby CourseStaffTaken
async function getByCourseStaffTaken(req: Request, res: Response) {
    const { uname } = req.query

    if (!uname) {
        return res.status(400).json({
            msg: "Id missing",

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
            msg: "An error occurred while fetching data",

        });


    } catch (error) {

        return res.status(500).json({
            msg: "An error occurred while fetching data",

        });
    }



}
//#endregion

async function getStaff(req: Request, res: Response) {
    try {
        const uname = req.query.uname as string;
        const department = req.query.department as string;

        if (!uname || !department) {
            return res.status(400).json({ msg: "'uname' and 'department' query parameters are required." });
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
            return res.status(404).json({ msg: "No staff records found for the provided uname and department." });
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
        res.status(500).json({ msg: "Internal server error." });
    }
}

//#region addNewStaff
async function addStaff(req: Request, res: Response) {
    try {
        const email = req.body.email as string;
        const password = req.body.password as string;
        const name = req.body.name as string;

        if (!email || !password || !name) {
            return res.status(400).json({ msg: "uname, name and password query parameters are required." });
        }

        const check = await prisma.user.findFirst({
            where: {
                email: {
                    equals: email
                }
            }
        })

        if (check) {
            return res.status(400).json({ msg: "User already exist" });
        }

        await prisma.user.create({
            data: {
                email: email,
                password: password,
                name: name,
            }
        })



        res.status(200).json();
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal server error." });
    }
}
//#endregion

//#region addStaffCourse
async function addStaffCourse(req: Request, res: Response) {
    try {
        const codeid = req.body.codeid as number;
        const name = req.body.name as string;
        const uname = req.body.uname as string;

        if (!codeid || !uname || !name) {
            return res.status(400).json({ msg: "uname, name and codeid query parameters are required." });
        }

        const check = await prisma.staff.findFirst({
            where: {
                codeId: codeid,
                uname: uname,
            }
        })

        if (check) {
            return res.status(400).json({ msg: "Already Assigned for this staff" });
        }

        await prisma.staff.create({
            data: {
                codeId: codeid,
                staffName: name,
                uname: uname,
                staffInitial: 'none'
            }
        })

        res.status(200).json({ success: 'Course assigned' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal server error." });
    }
}
//#endregion


//#region deleteStaff
async function deleteStaff(req: Request, res: Response) {
    const { id } = req.query

    if (!id) {
        return res.status(400).json({
            msg: "ID not found",
        });
    }

    try {
        const checkExisting = await prisma.user.findFirst({
            where: {
                id: Number(id)
            }
        })

        if (checkExisting) {
            await prisma.user.delete({
                where: {
                    id: checkExisting?.id
                },
            })

            const checkExistingStaff = await prisma.staff.findMany({
                where: {
                    uname: checkExisting?.email
                },
            })

            if (checkExisting) {
                for (const staff of checkExistingStaff) {
                    await prisma.staff.delete({
                        where: {
                            id: staff.id
                        },
                    });
                }
            }

            return res.status(200).json({
                success: 'Staff deleted successfully'
            })
        }
        else {
            return res.status(500).json({
                msg: 'Staff Not Found'
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

//#region deleteStaffCourse
async function deleteStaffCourse(req: Request, res: Response) {
    const { id } = req.query

    if (!id) {
        return res.status(400).json({
            msg: "ID not found",
        });
    }

    try {
        const checkExisting = await prisma.staff.findFirst({
            where: {
                id: Number(id),
            }
        })
        console.log(checkExisting)
        if (checkExisting) {

            await prisma.staff.delete({
                where: {
                    id: checkExisting?.id
                },
            })

            return res.status(200).json({
                success: 'Course un Assigned successfully'
            })
        }
        else {
            return res.status(500).json({
                msg: 'No course found'
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

//#region searchCourse
async function searchCourse(req: Request, res: Response) {
    const { question } = req.query;

    try {
        if (question) {
            const code = await prisma.code.findMany({
                where: {
                    code: {
                        contains: question as string,
                    },
                },
            });

            return res.status(200).json({
                data: code,
            });
        }
    } catch (error) {
        return res.status(500).json({
            msg: "Internal server error",
        });
    }
}
//#endregion

//#region excelCourse
async function excelStaff(req: Request, res: Response) {
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
    let tempdata: { code: string, name: string, uname: string }[] = [];

    fs.createReadStream(dest)
        .pipe(csv())
        .on('data', async (row) => {
            if ('sub_code' in row) {
                tempdata.push({
                    code: row.sub_code.trim(),
                    name: row.staff_name,
                    uname: row.uname.trim().toUpperCase(),
                })
                totalCourse = totalCourse + 1
            }
        })
        .on('end', async () => {
            for (let i = 0; i < tempdata.length; i++) {
                await excelStaffInsert(tempdata[i])
            }

            console.log('CSV file successfully processed');
        });

    return res.status(200).json({
        success: totalCourse + ' Program updated successfully'
    });

}
//#endregion

export { getAllStaff, getByCourseStaffTaken, getStaff, addStaff, deleteStaff, excelStaff, deleteStaffCourse, searchCourse, addStaffCourse }