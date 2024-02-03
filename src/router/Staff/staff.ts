import { PrismaClient, Prisma } from '@prisma/client';
import { Request, Response } from "express"
import * as fs from 'fs';
import csv from 'csv-parser';
import { getFilePath } from '../common';

const prisma = new PrismaClient();

async function excelStaffInsert(tempdata: { code: string; uname: string; name: string; }, year: number, sem: string) {

    try {
        let check = await prisma.user.findFirst({
            where: {
                uname: tempdata.uname,
            },
        });

        if (!check) {
            check = await prisma.user.create({
                data: {
                    uname: tempdata.uname,
                    password: 'jmc',
                    name: tempdata.name,
                    role: 'Staff',
                }
            })

        }

        const getCourse = await prisma.code.findFirst({
            where: {
                code: {
                    equals: tempdata.code,
                },
                department: {
                    year: year
                },
                semester: sem
            }
        })
        if (!getCourse) {
            return
        }

        const getExisting = await prisma.staff.findFirst({
            where: {
                uname: check?.uname,
                staffName: check.name,
                codeId: getCourse?.id
            }
        })

        if (getExisting) {
            return
        }

        await prisma.staff.create({
            data: {
                uname: check?.uname,
                staffName: check.name,
                codeId: getCourse?.id
            }
        })

    } catch (error) {
    }
}

//#region getAllStaff
async function getAllStaff(req: Request, res: Response) {


    try {

        const { page, question } = req.query

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

    try {

        const { uname, year, sem } = req.query

        if (!uname || !year || !sem) {
            return res.status(400).json({
                msg: "Field missing",
            });
        }

        const getDetails = await prisma.staff.findMany({
            where: {
                uname: String(uname),
                code: {
                    department: {
                        year: Number(year)
                    },
                    semester: sem as string
                }
            },
            include: {
                code: {
                    include: {
                        pso: true,
                        department: {
                            select: {
                                departmentCode: true
                            }
                        }
                    },
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

//#region getStaffbyCode
async function getStaffbyCode(req: Request, res: Response) {


    try {

        const { id } = req.query

        if (!id) {
            return res.status(400).json({
                msg: "Id missing",

            });
        }

        const getDetails = await prisma.staff.findMany({
            where: {
                codeId: Number(id)
            },
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
        const year = req.query.year;
        const sem = req.query.sem as string

        if (!uname || !department || !year || !sem) {
            return res.status(400).json({ msg: "'uname' and 'department' query parameters are required." });
        }

        let staffRecords;

        if (uname !== 'admin') {
            staffRecords = await prisma.staff.findMany({
                where: {
                    uname: uname,
                    code: {
                        department: {
                            year: Number(year)
                        },
                        semester: sem
                    }
                },
                select: {
                    code: {
                        select: {
                            name: true, department: {
                                select: {
                                    departmentCode: true
                                }
                            }, code: true
                        }, // Include code in the selection
                    },
                },
            });
        }
        else {
            staffRecords = await prisma.staff.findMany({
                where: {
                    code: {
                        department: {
                            year: Number(year)
                        },
                        semester: sem
                    }
                },
                select: {
                    code: {
                        select: {
                            name: true,
                            department: {
                                select: {
                                    departmentCode: true
                                }
                            }, code: true
                        }, // Include code in the selection
                    },
                },
            });
        }


        if (!staffRecords || staffRecords.length === 0) {
            return res.status(404).json({ msg: "No staff records found for the provided uname and department." });
        }

        const codeInfo = staffRecords
            .filter((record) => record.code.department.departmentCode === department)
            .map((record) => {
                return {
                    name: record.code.name,
                    depCode: record.code.department.departmentCode,
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
        const uname = req.body.email as string;
        const password = req.body.password as string;
        const name = req.body.name as string;

        if (!uname || !password || !name) {
            return res.status(400).json({ msg: "uname, name and password query parameters are required." });
        }

        const check = await prisma.user.findFirst({
            where: {
                uname: {
                    equals: uname
                }
            }
        })

        if (check) {
            return res.status(400).json({ msg: "Staff already exist" });
        }

        const createdStaff = await prisma.user.create({
            data: {
                uname: uname,
                password: password,
                name: name,
            }
        })



        res.status(200).json({ createdStaff });
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


    try {

        const { id } = req.query

        if (!id) {
            return res.status(400).json({
                msg: "ID not found",
            });
        }

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
                    uname: checkExisting?.uname
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


    try {

        const { id } = req.query

        if (!id) {
            return res.status(400).json({
                msg: "ID not found",
            });
        }

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

    try {

        const { question, year, sem } = req.query;

        if (question) {
            const code = await prisma.code.findMany({
                where: {
                    code: {
                        contains: question as string,
                    },
                    department: {
                        year: Number(year)
                    },
                    semester: sem as string
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

    try {

        const files = req.file as Express.Multer.File;
        const { year, sem } = req.query

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

        let tempdata: { code: string, name: string, uname: string }[] = [];

        const readStream = fs.createReadStream(dest)
            .pipe(csv())
            .on('data', async (row) => {
                if ('sub_code' in row) {
                    tempdata.push({
                        code: row.sub_code.trim(),
                        name: row.staff_name,
                        uname: row.uname.trim().toUpperCase(),
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
                    if (tempdata[i].code === '23UEN1AC2') {
                        console.log(tempdata[i])
                    }
                    await excelStaffInsert(tempdata[i], Number(year), String(sem))
                }

                return res.status(200).json({
                    success: tempdata.length + ' Staff updated successfully'
                });
            });

        readStream.on('error', (err) => {
            res.status(500).json({
                msg: 'An error occurred while processing the file'
            });
        });

    } catch (error) {
        return res.status(400).json({
            error: error
        })
    }
}
//#endregion

export { getAllStaff, getByCourseStaffTaken, getStaff, addStaff, deleteStaff, excelStaff, deleteStaffCourse, searchCourse, addStaffCourse, getStaffbyCode }